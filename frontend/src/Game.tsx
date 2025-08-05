import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Difficulty, Word } from '@/types';
import LevelSelector from '@/components/game/LevelSelector';
import WordDisplay from '@/components/game/WordDisplay';
import AnswerInput from '@/components/game/AnswerInput';
import Feedback from '@/components/game/Feedback';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';

export default function Game() {
  const [level, setLevel] = useState<Difficulty | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackKey, setFeedbackKey] = useState(0);

  const target = level && level >= 4 ? 10 : 5;

  useEffect(() => {
    fetch(`${API_BASE_URL}/words`)
      .then((res) => res.json())
      .then((data: Word[]) => {
        setWords(data);
        const index = Math.floor(Math.random() * data.length);
        setCurrent(data[index]);
      });
  }, []);

  function getRandomWord() {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level || !current) return;

    const isCorrect =
      answer.trim().toLowerCase() ===
      current.vietnamese.trim().toLowerCase();

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setWrongStreak(1);

      if (newScore >= target) {
        setCurrent(null);
        setFeedback('');
      } else {
        setFeedback('correct');
        setCurrent(getRandomWord());
      }
    } else {
      setFeedback('incorrect');
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
      <Card className="w-full max-w-md text-center">
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
              <Feedback feedback={feedback} feedbackKey={feedbackKey} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
