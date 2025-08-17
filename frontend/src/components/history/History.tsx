import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchHistory } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { HistoryPlay } from '@/types';

interface ChartDatum extends HistoryPlay {
  time: string;
  cumulative: number;
}
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  userId: number;
}

export default function History({ userId }: Props) {
  const [sessions, setSessions] = useState<Record<string, HistoryPlay[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(userId)
      .then((data: HistoryPlay[]) => {
        const grouped: Record<string, HistoryPlay[]> = {};
        for (const p of data) {
          (grouped[p.session_tag] ||= []).push(p);
        }
        setSessions(grouped);
      })
      .catch(() => {});
  }, [userId]);

  const plays = useMemo(() => (selected ? sessions[selected] || [] : []), [selected, sessions]);
  const chartData = useMemo<ChartDatum[]>(() => {
    let total = 0;
    return plays
      .slice()
      .sort(
        (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime(),
      )
      .map((p) => {
        total += p.earned_score;
        return {
          time: new Date(p.played_at).toLocaleTimeString(),
          cumulative: total,
          ...p,
        };
      });
  }, [plays]);

  return (
    <div className="p-4 space-y-4">
      <Button onClick={() => (selected ? setSelected(null) : navigate('/game'))}>
        Back
      </Button>
      {!selected ? (
        <ul className="space-y-2">
          {Object.entries(sessions).map(([tag, sPlays]) => (
            <li
              key={tag}
              className="border p-2 rounded cursor-pointer hover:bg-accent"
              onClick={() => setSelected(tag)}
            >
              Session {new Date(sPlays[0].played_at).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">
            Session {new Date(plays[0].played_at).toLocaleString()}
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as ChartDatum;
                      return (
                        <div className="bg-background p-2 border rounded text-sm">
                          <div>Word: {d.word.word_text}</div>
                          <div>Answer: {d.user_answer}</div>
                          <div>Time: {d.time}</div>
                          <div>Score: {d.cumulative}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
                <div>Word: {p.word.word_text}</div>
                <div>Your answer: {p.user_answer}</div>
                <div>Time: {new Date(p.played_at).toLocaleTimeString()}</div>
                <div>Score: {p.earned_score}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
