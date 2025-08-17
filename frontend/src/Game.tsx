import { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

  const target = level && level >= 4 ? 10 : 5;

  useEffect(() => {
    if (level) {
      const diff = mapLevel(level);
      createSession();
      fetchRandomWords(20, 'en', diff).then((data: Word[]) => {
        setWords(data);
        const index = Math.floor(Math.random() * data.length);
        setCurrent(data[index]);
      });
    }
  }, [level]);

  function mapLevel(l: Difficulty): string {
    if (l <= 2) return 'easy';
    if (l <= 4) return 'medium';
    return 'hard';
  }

  function getRandomWord() {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level || !current) return;

    const res = await submitAnswer({
      word_id: current.word_id,
      user_id: userId,
      language_code: 'vi',
      response_time: 0,
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
        setCurrent(getRandomWord());
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
      setCurrent(getRandomWord());
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
