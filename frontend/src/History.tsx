import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchHistory } from '@/lib/api';
import type { Play } from '@/types';

interface Props {
  userId: number;
}

export default function History({ userId }: Props) {
  const [plays, setPlays] = useState<Play[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(userId)
      .then(setPlays)
      .catch(() => {});
  }, [userId]);

  return (
    <div className="p-4 space-y-4">
      <Button onClick={() => navigate('/game')}>Back</Button>
      <ul className="space-y-2">
        {plays.map((p) => (
          <li key={p.play_id} className="border p-2 rounded">
            Word ID {p.word_id} - Your answer: {p.user_answer} -{' '}
            {p.is_correct ? 'Correct' : 'Incorrect'}
          </li>
        ))}
      </ul>
    </div>
  );
}
