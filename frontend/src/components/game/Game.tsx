import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Difficulty, Word } from '@/types';
import LevelSelector from '@/components/game/LevelSelector';
import WordDisplay from '@/components/game/WordDisplay';
import AnswerInput from '@/components/game/AnswerInput';
import Feedback from '@/components/game/Feedback';
import { fetchRandomWords, submitAnswer, createSession } from '@/lib/api';

interface Props {
  userId: number;
}

export default function Game({ userId }: Props) {
  const [level, setLevel] = useState<Difficulty | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackAnswer, setFeedbackAnswer] = useState('');
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [questionStart, setQuestionStart] = useState(0);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const target = level && level >= 4 ? 10 : 5;

  useEffect(() => {
    if (level) {
      const start = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - start);
      }, 10);
      const diff = mapLevel(level);
      createSession();
      fetchRandomWords(20, 'en', diff).then((data: Word[]) => {
        setWords(data);
        const index = Math.floor(Math.random() * data.length);
        setCurrent(data[index]);
        setQuestionStart(Date.now());
      });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level]);

  useEffect(() => {
    if (timerRef.current && score >= target) {
      clearInterval(timerRef.current);
    }
  }, [score, target]);

  function mapLevel(l: Difficulty): string {
    if (l <= 2) return 'easy';
    if (l <= 4) return 'medium';
    return 'hard';
  }

  function getRandomWord() {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }

  function nextWord() {
    const w = getRandomWord();
    setCurrent(w);
    setQuestionStart(Date.now());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level || !current) return;

    const res = await submitAnswer({
      word_id: current.word_id,
      user_id: userId,
      language_code: 'vi',
      response_time: Date.now() - questionStart,
      user_answer: answer,
      earned_score: 1,
    });

    if (res.is_correct) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= target) {
        setCurrent(null);
        setFeedback('');
      } else {
        setFeedback('correct');
        nextWord();
      }
    } else {
      setFeedback('incorrect');
      setFeedbackAnswer(res.correct_answer);
      setWrongStreak((s) => s + 1);
      setScore((s) => {
        switch (level) {
          case 1:
            return s;
          case 2:
            return s - 1;
          case 3:
            return s - 2;
          case 4:
            return 0;
          case 5:
            return s - wrongStreak;
          case 6:
            return s - wrongStreak * wrongStreak;
          default:
            return s;
        }
      });
      nextWord();
    }

    setAnswer('');
    setFeedbackKey((k) => k + 1);
  }

  function handleReset() {
    setLevel(null);
    setScore(0);
    setAnswer('');
    setFeedback('');
    setCurrent(null);
    setElapsed(0);
  }

  const finished = score >= target;

  if (!level) {
    return <LevelSelector onSelectLevel={setLevel} />;
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
