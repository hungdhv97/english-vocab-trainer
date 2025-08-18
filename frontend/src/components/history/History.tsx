import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchHistory } from '@/lib/api';
import type { HistoryPlay } from '@/types';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset, SidebarHeader, SidebarTrigger,
} from '@/components/ui/sidebar';

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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Game Sessions</h2>
              <Button onClick={() => navigate('/dashboard')} size="sm">
                Back
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <div className="space-y-2">
              {Object.entries(sessions).map(([tag, sPlays]) => {
                const sess = sPlays[0]?.session;
                const started = sess
                  ? new Date(sess.started_at).toLocaleString()
                  : '';
                const status = sess?.finished_at
                  ? `Finished at ${new Date(sess.finished_at).toLocaleString()}`
                  : 'In progress';
                const isSelected = selected === tag;

                return (
                  <div
                    key={tag}
                    className={[
                      'border p-3 rounded-lg cursor-pointer transition-all duration-200',
                      isSelected
                        ? 'bg-accent border-primary shadow-sm'
                        : 'hover:bg-accent hover:shadow-sm',
                    ].join(' ')}
                    onClick={() => setSelected(tag)}
                  >
                    <div className="font-medium text-sm">Session {started}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Level {sess?.level_id} • Score {sess?.total_score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {status}
                    </div>
                  </div>
                );
              })}
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="p-6">
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Game History</h2>
          </div>
          {selected && plays.length ? (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold">
                  Session {new Date(plays[0].session.started_at).toLocaleString()}
                </h3>
                <div className="text-sm text-muted-foreground mt-2">
                  Level {plays[0].session.level_id} • Total score {plays[0].session.total_score} •{' '}
                  {plays[0].session.finished_at
                    ? `Finished at ${new Date(plays[0].session.finished_at).toLocaleString()}`
                    : 'In progress'}
                </div>
              </div>
              <ChartContainer config={chartConfig} className="w-full h-80">
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
                                  <div>{datum.is_correct ? 'Correct' : 'Incorrect'}</div>
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
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg mb-2">No Session Selected</div>
                <div className="text-sm">Choose a session from the sidebar to view details</div>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
