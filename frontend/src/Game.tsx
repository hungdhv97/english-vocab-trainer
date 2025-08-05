import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;
interface Word {
  english: string;
  vietnamese: string;
}

type RawWord = {
  English?: string;
  english?: string;
  en?: string;
  Vietnamese?: string;
  vietnamese?: string;
  vi?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8090/api/v1';

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
      .then((data: RawWord[]) => {
        const normalized: Word[] = data.map((w) => ({
          english: w.english ?? w.English ?? w.en ?? '',
          vietnamese: w.vietnamese ?? w.Vietnamese ?? w.vi ?? '',
        }));
        setWords(normalized);
        const index = Math.floor(Math.random() * normalized.length);
        setCurrent(normalized[index]);
      });
  }, []);

  function getRandomWord() {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level) return;

    if (!current) return;

    const isCorrect =
      answer.trim().toLowerCase() ===
      current?.vietnamese?.trim()?.toLowerCase();

    if (isCorrect) {
      setScore((s) => s + 1);
      setWrongStreak(1);
      setFeedback('correct');
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
            return s - (wrongStreak);
          case 6:
            return s - wrongStreak * wrongStreak;
          default:
            return s;
        }
      });
    }

    setAnswer('');
    setCurrent(getRandomWord());
    setFeedbackKey((k) => k + 1);
  }

  if (!level) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Select level</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <Button key={l} onClick={() => setLevel(l as Difficulty)}>
                Level {l}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const finished = score >= target;

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Score: {score}/{target}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl font-semibold">{current.english}</p>
          {!finished && (
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Submit</Button>
            </form>
          )}
          <p
            key={feedbackKey}
            className={cn(
              'min-h-[1.5rem]',
              feedback === 'correct' && 'text-green-600 animate-in fade-in zoom-in',
              feedback === 'incorrect' && 'text-red-600 animate-shake'
            )}
          >
            {feedback === 'correct' && 'Correct!'}
            {feedback === 'incorrect' && 'Incorrect!'}
          </p>
          {finished && <p>Finished!</p>}
        </CardContent>
      </Card>
    </div>
  );
}
