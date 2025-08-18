import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchHistory } from '@/lib/api';
import type { HistoryPlay } from '@/types';

interface ChartDatum extends Partial<HistoryPlay> {
  time: string;
  cumulative: number;
  interval: string;
  delta: number;
  isStart?: boolean;
}
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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
          (grouped[p.session.session_tag] ||= []).push(p);
        }
        setSessions(grouped);
      })
      .catch(() => {});
  }, [userId]);

  const plays = useMemo(
    () => (selected ? sessions[selected] || [] : []),
    [selected, sessions],
  );
  const chartData = useMemo<ChartDatum[]>(() => {
    let total = 0;
    const sorted = plays
      .slice()
      .sort(
        (a, b) =>
          new Date(a.played_at).getTime() - new Date(b.played_at).getTime(),
      );
    if (!sorted.length) {
      return [];
    }
    const start = new Date(
      sorted[0].session.started_at ?? sorted[0].played_at,
    ).getTime();
    const data: ChartDatum[] = [
      {
        time: '0',
        cumulative: 0,
        interval: '0',
        delta: 0,
        isStart: true,
      },
    ];
    let prev = start;
    for (const p of sorted) {
      const current = new Date(p.played_at).getTime();
      const interval = ((current - prev) / 1000).toFixed(2);
      prev = current;
      total += p.score;
      data.push({
        ...p,
        time: ((current - start) / 1000).toFixed(2),
        cumulative: total,
        interval,
        delta: p.score,
      });
    }
    return data;
  }, [plays]);

  const chartConfig = {
    cumulative: {
      label: 'Score',
      color: 'var(--chart-1)',
    },
  } as const;

  return (
    <div className="p-4 space-y-4">
      <Button
        onClick={() => (selected ? setSelected(null) : navigate('/game'))}
      >
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
              Session {new Date(sPlays[0].session.started_at).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">
            Session {new Date(plays[0].session.started_at).toLocaleString()}
          </h3>
          <ChartContainer config={chartConfig} className="w-full h-64">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as ChartDatum;
                    return (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                        hideLabel
                        hideIndicator
                        className={
                          d.isStart
                            ? undefined
                            : d.is_correct
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }
                        formatter={(_value, _name, item) => {
                          const datum = item.payload as ChartDatum;
                          if (datum.isStart) {
                            return <div>Session start</div>;
                          }
                          return (
                            <div className="space-y-1">
                              <div>
                                {datum.is_correct ? 'Correct' : 'Incorrect'}
                              </div>
                              <div>Question: {datum.word?.word_text}</div>
                              {!datum.is_correct && (
                                <div>Correct word: {datum.correct_answer}</div>
                              )}
                              <div>Your answer: {datum.user_answer}</div>
                              <div>Time: {datum.interval}s</div>
                              <div>Score: {datum.delta}</div>
                            </div>
                          );
                        }}
                      />
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="var(--color-cumulative)"
                dot={({ cx, cy, payload }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    stroke="none"
                    fill={
                      payload.isStart
                        ? '#000'
                        : payload.is_correct
                          ? '#16a34a'
                          : '#dc2626'
                    }
                  />
                )}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
