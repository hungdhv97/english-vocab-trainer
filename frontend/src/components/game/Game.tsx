import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Level, Word, WordBatch } from '@/types';
import LevelSelector from '@/components/game/LevelSelector';
import WordDisplay from '@/components/game/WordDisplay';
import AnswerInput from '@/components/game/AnswerInput';
import Feedback from '@/components/game/Feedback';
import { isGameImplemented } from '@/constants/games';
import ComingSoon from '@/components/game/ComingSoon';
import {
  fetchRandomWords,
  submitAnswer,
  createSession,
  fetchLevels,
  finishSession,
} from '@/lib/api';

interface Props {
  userId: number;
}

export default function Game({ userId }: Props) {
  // Extract game code from URL
  const { code } = useParams<{ code: string }>();
  const gameCode = code || '';

  // Handle empty or undefined game code - redirect to homepage
  if (!gameCode) {
    return null; // Will be handled by App.tsx route fallback
  }

  // Check if this is the Vocabulary Quiz game
  const isVocabQuiz = gameCode === 'vocab-quiz' && isGameImplemented(gameCode);

  const [levels, setLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [targetScore, setTargetScore] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackAnswer, setFeedbackAnswer] = useState('');
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [target, setTarget] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Route to Coming Soon page for unimplemented games
  if (!isVocabQuiz) {
    return <ComingSoon gameCode={gameCode} />;
  }

  useEffect(() => {
    fetchLevels()
      .then(setLevels)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (level) {
      const start = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - start);
      }, 10);
      const config = level.scoring_config;
      setTarget(config.target || 0);
      setTargetScore(0);
      setScore(0);
      setSessionReady(false);
      setSessionError(null);
      
      // Create session first and wait for it to complete
      createSession(userId, level.level_id)
        .then(() => {
          setSessionReady(true);
          // Fetch words after session is created
          return fetchRandomWords(20, 'en', level.difficulty);
        })
        .then((data: WordBatch) => {
          setWords(data.words);
          setCursor(data.next_cursor);
        })
        .catch((err) => {
          setSessionError(err instanceof Error ? err.message : 'Failed to create session');
        });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level, userId]);

  useEffect(() => {
    if (timerRef.current && targetScore >= target) {
      clearInterval(timerRef.current);
    }
  }, [targetScore, target]);

  function nextWord() {
    setWords((prev) => prev.slice(1));
  }

  useEffect(() => {
    if (words.length > 0) {
      setCurrent(words[0]);
    }
  }, [words]);

  useEffect(() => {
    if (level && cursor && words.length < 5) {
      fetchRandomWords(20, 'en', level.difficulty, cursor).then(
        (data: WordBatch) => {
          setWords((prev) => [...prev, ...data.words]);
          setCursor(data.next_cursor);
        },
      );
    }
  }, [words, cursor, level]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level || !current || !sessionReady) return;

    const res = await submitAnswer({
      word_id: current.word_id,
      user_id: userId,
      language_code: 'vi',
      user_answer: answer,
    });
    const newTargetScore = targetScore + res.target;
    setScore((s) => s + res.score);
    setTargetScore(newTargetScore);

    if (res.is_correct) {
      if (newTargetScore >= target) {
        setCurrent(null);
        setFeedback('');
        setGameCompleted(true);
      } else {
        setFeedback('correct');
        nextWord();
      }
    } else {
      setFeedback('incorrect');
      setFeedbackAnswer(res.correct_answer);
      nextWord();
    }

    setAnswer('');
    setFeedbackKey((k) => k + 1);
  }

  function handleReset() {
    setLevel(null);
    setTarget(0);
    setTargetScore(0);
    setScore(0);
    setAnswer('');
    setFeedback('');
    setCurrent(null);
    setElapsed(0);
    setGameCompleted(false);
    setSessionReady(false);
    setSessionError(null);
  }

  useEffect(() => {
    if (gameCompleted) {
      finishSession().catch(() => {});
    }
  }, [gameCompleted]);

  if (!level) {
    return <LevelSelector levels={levels} onSelectLevel={setLevel} />;
  }

  if (!sessionReady || (!current && !gameCompleted)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        {sessionError ? (
          <div className="text-center">
            <p className="text-red-500">Error: {sessionError}</p>
            <Button onClick={handleReset} className="mt-4">Go Back</Button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-md text-center relative h-80 flex flex-col justify-center">
        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="absolute top-[10px] left-[10px]"
        >
          <ArrowLeft />
        </Button>
        <CardHeader>
          <CardTitle>Score: {score}</CardTitle>
          <div className="text-sm">
            Progress: {targetScore}/{target}
          </div>
          <div className="text-sm text-muted-foreground">
            Time: {(elapsed / 1000).toFixed(2)}s
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameCompleted ? (
            <p>Finished!</p>
          ) : (
            <>
              {current && <WordDisplay word={current} />}
              <AnswerInput
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onSubmit={handleSubmit}
                disabled={!sessionReady}
              />
              <Feedback
                feedback={feedback}
                answer={feedbackAnswer}
                feedbackKey={feedbackKey}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
