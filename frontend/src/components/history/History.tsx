import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchHistory } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Play } from '@/types';

interface Props {
  userId: number;
}

export default function History({ userId }: Props) {
  const [sessions, setSessions] = useState<Record<string, Play[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(userId)
      .then((data: Play[]) => {
        const grouped: Record<string, Play[]> = {};
        for (const p of data) {
          (grouped[p.session_tag] ||= []).push(p);
        }
        setSessions(grouped);
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div className="p-4 space-y-4">
      <Button onClick={() => navigate('/game')}>Back</Button>
      {Object.entries(sessions).map(([tag, plays]) => (
        <div key={tag} className="space-y-2">
          <h3 className="font-semibold">
            Session {new Date(plays[0].played_at).toLocaleString()}
          </h3>
          <ul className="space-y-2">
            {plays.map((p) => (
              <li
                key={p.play_id}
                className={cn(
                  'border p-2 rounded',
                  p.is_correct
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                )}
              >
                Word ID {p.word_id} - Your answer: {p.user_answer} -{' '}
                {p.is_correct ? 'Correct' : 'Incorrect'}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
