import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Level, Word, WordBatch } from '@/types';
import LevelSelector from '@/components/game/LevelSelector';
import WordDisplay from '@/components/game/WordDisplay';
import AnswerInput from '@/components/game/AnswerInput';
import Feedback from '@/components/game/Feedback';
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
  const [levels, setLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackAnswer, setFeedbackAnswer] = useState('');
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const [target, setTarget] = useState(0);

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
      createSession(userId, level.level_id);
      fetchRandomWords(20, 'en', level.difficulty).then((data: WordBatch) => {
        setWords(data.words);
        setCursor(data.next_cursor);
      });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level, userId]);

  useEffect(() => {
    if (timerRef.current && score >= target) {
      clearInterval(timerRef.current);
    }
  }, [score, target]);

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
    if (!level || !current) return;

    const res = await submitAnswer({
      word_id: current.word_id,
      user_id: userId,
      language_code: 'vi',
      user_answer: answer,
    });
    setScore(res.total_score);

    if (res.is_correct) {
      if (res.total_score >= target) {
        setCurrent(null);
        setFeedback('');
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
    setScore(0);
    setAnswer('');
    setFeedback('');
    setCurrent(null);
    setElapsed(0);
  }

  const finished = score >= target;

  useEffect(() => {
    if (finished) {
      finishSession().catch(() => {});
    }
  }, [finished]);

  if (!level) {
    return <LevelSelector levels={levels} onSelectLevel={setLevel} />;
  }

  if (!current && !finished) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md text-center relative h-80 flex flex-col justify-center">
        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="absolute top-[10px] left-[10px]"
        >
          <ArrowLeft />
        </Button>
        <Button
          onClick={() => navigate('/history')}
          variant="ghost"
          size="sm"
          className="absolute top-[10px] right-[10px]"
        >
          History
        </Button>
        <CardHeader>
          <CardTitle>
            Score: {score}/{target}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Time: {(elapsed / 1000).toFixed(2)}s
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {finished ? (
            <p>Finished!</p>
          ) : (
            <>
              {current && <WordDisplay word={current} />}
              <AnswerInput
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onSubmit={handleSubmit}
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
