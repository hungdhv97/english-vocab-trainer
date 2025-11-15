import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameConfigFlow } from './GameConfigFlow';
import { QuizPlay } from './QuizPlay';
import { QuizResults } from './QuizResults';
import { useGameStore } from '@/stores/gameStore';
import {
  fetchCefrLevels,
  createVocabQuizSession,
  submitVocabQuizAnswer,
  finishVocabQuizSession,
  getVocabQuizSessionStatistics,
  fetchGameByCode,
} from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { CefrLevel, TranslationDirection } from '@/types';

interface VocabQuizGameProps {
  userId: number;
}

/**
 * VocabQuizGame - Dedicated component for Vocabulary Quiz game
 * Uses Zustand gameStore for state management
 * Implements state machine: level-selection → direction-selection → playing → completed
 */
export default function VocabQuizGame({ userId }: VocabQuizGameProps) {
  const navigate = useNavigate();

  // Zustand store state and actions
  const {
    selectedLevel,
    sessionId,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    correctAnswer,
    submittedAnswer,
    correctCount,
    incorrectCount,
    timeElapsed,
    sessionStatistics,
    gameState,
    loading,
    error,
    setLevel,
    setDirection,
    startSession,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    finishSession,
    reset,
  } = useGameStore();

  // Load CEFR levels and game data on mount
  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([]);
  const [gameId, setGameId] = useState<number | null>(null);

  // Reset game state on mount to always start from CEFR level selection
  useEffect(() => {
    // Reset the game state to ensure we always start from level selection
    reset();

    const loadData = async () => {
      try {
        // Fetch game ID for vocab-quiz
        const game = await fetchGameByCode('vocab-quiz');
        setGameId(game.game_id);

        // Fetch CEFR levels
        const levels = await fetchCefrLevels();
        setCefrLevels(levels);
      } catch (err) {
        console.error('Failed to fetch game data:', err);
        toast.error('Failed to load game data');
      }
    };
    loadData();
  }, []);

  // Level selection handler
  const handleLevelSelect = (level: CefrLevel) => {
    setLevel(level);
  };

  // Direction selection handler
  const handleDirectionSelect = async (direction: TranslationDirection) => {
    if (!selectedLevel || !gameId) {
      toast.error('Game data not loaded yet');
      return;
    }

    setDirection(direction);

    try {
      // selectedLevel is already the full CefrLevel object from store
      // Create session via API with proper request format
      const sessionResponse = await createVocabQuizSession({
        user_id: userId,
        game_id: gameId,
        cefr_level_id: (selectedLevel as any).id || selectedLevel,
        translation_direction: direction,
        question_count: 20,
      });

      if (sessionResponse.questions.length === 0) {
        toast.error('No questions available for this level. Please try a different level.');
        reset();
        return;
      }

      // Start game session in store
      startSession(sessionResponse.session_id, sessionResponse.questions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start quiz');
      reset();
    }
  };

  // Answer selection and submission handler - submit immediately on click
  const handleAnswerSelect = async (answer: string) => {
    if (submittedAnswer || !sessionId) return; // Already submitted or no session

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Select answer in store
    selectAnswer(answer);

    try {
      // Submit to API immediately with proper request format
      const result = await submitVocabQuizAnswer({
        session_question_id: currentQuestion.session_question_id,
        chosen_option: answer.toUpperCase(), // Ensure uppercase (A, B, C, or D)
      });

      // Update store with result (use correct_answer from question)
      submitAnswer(result.is_correct, currentQuestion.correct_answer);

      // Auto-advance after 1.5 seconds to show feedback
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          nextQuestion();
        } else {
          handleFinishSession();
        }
      }, 1000);
    } catch (err) {
      toast.error('Failed to submit answer');
      console.error(err);
    }
  };

  // Finish session handler
  const handleFinishSession = async () => {
    if (!sessionId) return;

    try {
      await finishVocabQuizSession(sessionId.toString());
      const statistics = await getVocabQuizSessionStatistics(sessionId.toString());
      finishSession(statistics);
    } catch (err) {
      console.error('Failed to finish session:', err);
      toast.error('Failed to save session statistics');
    }
  };

  // View statistics handler
  const handleViewStatistics = () => {
    if (sessionId) {
      navigate(`/session/${sessionId.toString()}/statistics`);
    }
  };

  // Reset handler
  const handleReset = () => {
    reset();
  };

  // Back navigation handler
  const handleBack = () => {
    if (gameState === 'direction-selection') {
      reset();
    } else if (gameState === 'level-selection') {
      navigate('/');
    }
  };

  if (gameState === 'level-selection' || gameState === 'direction-selection') {
    return (
      <GameConfigFlow
        gameState={gameState}
        levels={cefrLevels}
        selectedLevel={selectedLevel}
        onSelectLevel={handleLevelSelect}
        onSelectDirection={handleDirectionSelect}
        onBack={handleBack}
        onReset={handleReset}
      />
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
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

  if (gameState === 'completed' && sessionStatistics) {
    return (
      <QuizResults
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        totalQuestions={questions.length}
        sessionStatistics={sessionStatistics}
        onPlayAgain={handleReset}
        onViewStatistics={handleViewStatistics}
      />
    );
  }

  if (gameState === 'playing') {
    const currentQuestion = questions[currentQuestionIndex] ?? null;
    return (
      <QuizPlay
        question={currentQuestion}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        timeElapsedMs={timeElapsed}
        selectedAnswer={selectedAnswer}
        submittedAnswer={submittedAnswer}
        correctAnswer={correctAnswer}
        onSelectAnswer={handleAnswerSelect}
        onReset={handleReset}
      />
    );
  }

  return null;
}

