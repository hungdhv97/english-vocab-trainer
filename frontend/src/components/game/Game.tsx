import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type {
  CefrLevel,
  Question,
  TranslationDirection,
  SessionStatistics,
} from '@/types';
import CefrLevelSelector from '@/components/game/CefrLevelSelector';
import DirectionSelector from '@/components/game/DirectionSelector';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import { isGameImplemented } from '@/constants/games';
import ComingSoon from '@/components/game/ComingSoon';
import {
  fetchCefrLevels,
  createVocabQuizSession,
  submitVocabQuizAnswer,
  finishVocabQuizSession,
  getVocabQuizSessionStatistics,
  fetchGameByCode,
} from '@/lib/api';
import type { Game } from '@/types';

interface Props {
  userId: number;
}

type GameState = 'level-selection' | 'direction-selection' | 'playing' | 'completed';

export default function Game({ userId }: Props) {
  // Extract game code from URL
  const { code } = useParams<{ code: string }>();
  const gameCode = code || '';
  const navigate = useNavigate();

  // Check if this is the Vocabulary Quiz game
  const isVocabQuiz = gameCode === 'vocab-quiz' && isGameImplemented(gameCode);

  // Game state
  const [gameState, setGameState] = useState<GameState>('level-selection');
  const [game, setGame] = useState<Game | null>(null);
  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [sessionStatistics, setSessionStatistics] = useState<SessionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(() => new Set()); // T094: Prevent duplicate submissions

  // Fetch game and CEFR levels on mount
  useEffect(() => {
    if (!gameCode) {
      return;
    }

    const loadData = async () => {
      try {
        // Fetch game to get game_id
        const gameData = await fetchGameByCode(gameCode);
        setGame(gameData);

        // Fetch CEFR levels
        const levels = await fetchCefrLevels();
        setCefrLevels(levels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game data');
      }
    };
    loadData();
  }, [gameCode]);

  // Timer for tracking elapsed time
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, startTime]);

  // Handle level selection (T076)
  const handleLevelSelect = (level: CefrLevel) => {
    setSelectedLevel(level);
    setGameState('direction-selection');
    setError(null);
  };

  // Handle direction selection (T076)
  const handleDirectionSelect = async (direction: TranslationDirection) => {
    if (!selectedLevel) return;

    setLoading(true);
    setError(null);

    try {
      if (!game) {
        setError('Game information not loaded');
        return;
      }

      // Create session and generate questions (T087, T077)
      const sessionResponse = await createVocabQuizSession({
        user_id: userId,
        game_id: game.game_id,
        cefr_level_id: selectedLevel.id,
        translation_direction: direction,
        question_count: 20,
      });
      setSessionId(sessionResponse.session_id);

      // Questions are now included in the session response
      if (sessionResponse.questions.length === 0) {
        setError('No questions available for this level. Please try a different level.');
        setGameState('level-selection');
        setLoading(false);
        return;
      }

      setQuestions(sessionResponse.questions);
      setCurrentQuestionIndex(0);
      setGameState('playing');
      setStartTime(Date.now());
      setScore(0);
      setCorrectCount(0);
      setIncorrectCount(0);
      setAnsweredQuestions(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      setGameState('direction-selection');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection (T078) - Auto-submit when answer is selected
  const handleAnswerSelect = async (letter: string) => {
    if (submittedAnswer !== null || !sessionId) return; // T094: Prevent duplicate submissions

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // T094: Prevent duplicate submissions - check if this question was already answered
    if (answeredQuestions.has(currentQuestion.id)) {
      return;
    }

    // Mark question as answered to prevent duplicate submissions (T094)
    setAnsweredQuestions((prev) => {
      const next = new Set(prev);
      next.add(currentQuestion.id);
      return next;
    });
    setSelectedAnswer(letter);
    setSubmittedAnswer(letter);
    setCorrectAnswer(currentQuestion.correct_answer);
    setLoading(true);

    try {
      // Calculate time spent (optional)
      const timeSpentMs = startTime ? Date.now() - startTime : undefined;

      // Submit answer (T088) - use new API format
      const response = await submitVocabQuizAnswer({
        session_question_id: currentQuestion.session_question_id || currentQuestion.id,
        chosen_option: letter.toUpperCase(), // Convert to uppercase (A, B, C, D)
        time_spent_ms: timeSpentMs,
      });

      // Update score and statistics (T090)
      if (response.is_correct) {
        setCorrectCount((prev) => prev + 1);
        setScore((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }

      // Show feedback immediately (T089)
      // Feedback is always shown when selectedAnswer is provided

      // Move to next question after a delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setSubmittedAnswer(null);
          setCorrectAnswer(null);
        } else {
          // All questions answered, finish session (T091)
          handleFinishSession();
        }
        setLoading(false);
      }, 1000); // 1000 milliseconds delay to show feedback
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setLoading(false);
      // Reset submission state on error
      setSubmittedAnswer(null);
      setAnsweredQuestions((prev) => {
        const next = new Set(prev);
        next.delete(currentQuestion.id);
        return next;
      });
    }
  };

  // Note: handleSubmitAnswer removed - answers are now auto-submitted when selected

  // Handle session completion (T091)
  const handleFinishSession = async () => {
    if (!sessionId) return;

    try {
      // Finish session and get statistics
      const stats = await finishVocabQuizSession(sessionId.toString());
      setSessionStatistics({
        ...stats,
        time_elapsed: timeElapsed / 1000, // Convert to seconds
      });
      setGameState('completed');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch {
      // If finish fails, try to get statistics anyway
      try {
        const stats = await getVocabQuizSessionStatistics(sessionId.toString());
        setSessionStatistics({
          ...stats,
          time_elapsed: timeElapsed / 1000,
        });
        setGameState('completed');
      } catch (statsErr) {
        setError(
          statsErr instanceof Error ? statsErr.message : 'Failed to finish session'
        );
      }
    }
  };

  // Handle stop - finish session and show results
  const handleStop = async () => {
    if (!sessionId) {
      // If no session, just go back
      handleBack();
      return;
    }

    // Finish the session before stopping
    await handleFinishSession();
  };

  // Handle view statistics - navigate to statistics page
  const handleViewStatistics = () => {
    if (sessionId) {
      navigate(`/session/${sessionId}/statistics`);
    }
  };

  // Handle back navigation (T076)
  const handleBack = () => {
    if (gameState === 'direction-selection') {
      setGameState('level-selection');
      setSelectedLevel(null);
    } else if (gameState === 'level-selection') {
      // Navigate to home (handled by parent or router)
      window.history.back();
    }
  };

  // Handle reset/restart
  const handleReset = () => {
    setGameState('level-selection');
    setSelectedLevel(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSubmittedAnswer(null);
    setCorrectAnswer(null);
    setSessionId(null);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSessionStatistics(null);
    setError(null);
    setStartTime(null);
    setTimeElapsed(0);
    setAnsweredQuestions(new Set());
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset answered questions when starting new quiz
  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0) {
      setAnsweredQuestions(new Set());
    }
  }, [gameState, questions.length]);

  // Handle empty or undefined game code - let router fallback handle navigation
  if (!gameCode) {
    return null;
  }

  // Route to Coming Soon page for unimplemented games
  if (!isVocabQuiz) {
    return <ComingSoon gameCode={gameCode} />;
  }

  // Render level selection
  if (gameState === 'level-selection') {
    return (
      <CefrLevelSelector
        levels={cefrLevels}
        onSelectLevel={handleLevelSelect}
        onBack={handleBack}
      />
    );
  }

  // Render direction selection
  if (gameState === 'direction-selection') {
    if (!selectedLevel) {
      setGameState('level-selection');
      return null;
    }
    return (
      <DirectionSelector
        selectedLevel={selectedLevel}
        onSelectDirection={handleDirectionSelect}
        onBack={handleBack}
      />
    );
  }

  // Render loading state
  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error && gameState !== 'playing' && gameState !== 'completed') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleReset}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render completed state with statistics (T091)
  if (gameState === 'completed' && sessionStatistics) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
          <Card className="w-full max-w-2xl text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sessionStatistics.accuracy_percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
              {sessionStatistics.time_elapsed && (
                <div className="mt-4">
                  <p className="text-lg">
                    Time: {(sessionStatistics.time_elapsed / 60).toFixed(1)} minutes
                  </p>
                </div>
              )}
              <div className="mt-6 space-x-4">
                <Button onClick={handleReset}>Play Again</Button>
                <Button onClick={handleViewStatistics} variant="outline">
                  View Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Render playing state
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>No questions available</p>
            <Button onClick={handleReset} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <div className="w-full max-w-2xl space-y-4">
        {/* Header with score and progress */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Score: {score}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Correct: {correctCount} | Incorrect: {incorrectCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Time: {(timeElapsed / 1000).toFixed(1)}s
                </p>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Question display with Stop button */}
        <QuestionDisplay
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          correctAnswer={submittedAnswer ? correctAnswer : null}
          onSelectAnswer={handleAnswerSelect}
          disabled={submittedAnswer !== null || loading}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onStop={handleStop}
          loading={loading}
        />

        {/* Error display */}
        {error && (
          <Card className="border-red-500 w-full">
            <CardContent className="pt-6">
              <p className="text-red-500 text-center">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
