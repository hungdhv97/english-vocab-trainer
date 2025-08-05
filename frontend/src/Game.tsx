import { useState, useEffect } from 'react';

type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;
interface Word {
  en: string;
  vi: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8090/api/v1';

export default function Game() {
  const [level, setLevel] = useState<Difficulty | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(1);
  const [message, setMessage] = useState('');

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
    if (!level) return;

    if (!current) return;

    const isCorrect =
      answer.trim().toLowerCase() === current.vi.trim().toLowerCase();

    if (isCorrect) {
      setScore((s) => s + 1);
      setWrongStreak(1);
      setMessage('Đúng!');
    } else {
      setMessage('Sai!');
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
  }

  if (!level) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Chọn mức độ</h1>
          <div className="space-x-2">
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <button
                key={l}
                className="px-4 py-2 border rounded"
                onClick={() => setLevel(l as Difficulty)}
              >
                Mức {l}
              </button>
            ))}
          </div>
        </div>
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
      <div className="text-center space-y-4">
        <p className="text-lg">Điểm: {score}/{target}</p>
        <p className="text-xl font-semibold">{current.en}</p>
        {!finished && (
          <form onSubmit={handleSubmit} className="space-x-2">
            <input
              className="border px-2 py-1"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button type="submit" className="px-4 py-1 border rounded">
              Trả lời
            </button>
          </form>
        )}
        <p>{message}</p>
        {finished && <p>Hoàn thành!</p>}
      </div>
    </div>
  );
}
