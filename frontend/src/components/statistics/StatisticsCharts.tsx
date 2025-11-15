import { useMemo, memo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend, Tooltip } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExtendedSessionStatistics, SessionQuestionDetail } from '@/types';

interface StatisticsChartsProps {
  statistics: ExtendedSessionStatistics;
  questions: SessionQuestionDetail[];
}

function StatisticsChartsComponent({ statistics, questions }: StatisticsChartsProps) {
  // Memoize accuracy breakdown data (pie chart) - only recalculate when statistics change
  const accuracyData = useMemo(() => {
    return [
      { name: 'Correct', value: statistics.correct_count, fill: 'hsl(142, 76%, 36%)' }, // green
      { name: 'Incorrect', value: statistics.incorrect_count, fill: 'hsl(0, 84%, 60%)' }, // red
    ].filter(item => item.value > 0);
  }, [statistics.correct_count, statistics.incorrect_count]);

  const accuracyConfig: ChartConfig = useMemo(() => ({
    correct: {
      label: 'Correct',
      color: 'hsl(142, 76%, 36%)',
    },
    incorrect: {
      label: 'Incorrect',
      color: 'hsl(0, 84%, 60%)',
    },
  }), []);

  // Memoize time analysis data (bar chart) - only recalculate when questions change
  const timeAnalysisData = useMemo(() => {
    console.log('questions', questions);
    return questions
      .filter(q => q.time_answer_ms !== undefined && q.time_answer_ms !== null)
      .map(q => ({
        question_number: q.question_number,
        time_answer_seconds: (q.time_answer_ms || 0) / 1000,
      }));
  }, [questions]);

  const timeAnalysisConfig: ChartConfig = useMemo(() => ({
    time_answer_seconds: {
      label: 'Time (seconds)',
      color: 'hsl(217, 91%, 60%)',
    },
  }), []);

  // Memoize performance over time data (line chart with dual axis) - optimize calculation
  // Calculate running accuracy for each question based on answered questions up to that point
  const performanceData = useMemo(() => {
    const answeredQuestions = questions.filter(q => q.user_answer);
    return answeredQuestions.map((q, index) => {
      // Calculate running accuracy up to this question (including this question)
      // Optimize: use a single pass to calculate cumulative stats
      const questionsUpToThis = answeredQuestions.slice(0, index + 1);
      const correctCount = questionsUpToThis.filter(q2 => q2.user_answer?.is_correct).length;
      const totalAnswered = questionsUpToThis.length;
      const runningAccuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;

      return {
        question_number: q.question_number,
        running_accuracy: runningAccuracy,
        is_correct: q.user_answer?.is_correct ? 1 : 0,
      };
    });
  }, [questions]);

  const performanceConfig: ChartConfig = useMemo(() => ({
    running_accuracy: {
      label: 'Running Accuracy (%)',
      color: 'hsl(217, 91%, 60%)',
    },
    is_correct: {
      label: 'Correct',
      color: 'hsl(142, 76%, 36%)',
    },
  }), []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 w-full">
      {/* Accuracy Breakdown Chart (Pie/Donut) */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Accuracy Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="w-full overflow-hidden">
          {accuracyData.length > 0 ? (
            <ChartContainer config={accuracyConfig} className="h-[300px] w-full">
              <PieChart
                width={400}
                height={300}
                role="img"
                aria-label="Accuracy breakdown chart showing correct and incorrect answers"
              >
                <Pie
                  data={accuracyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  aria-label="Pie chart segments"
                >
                  {accuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartContainer>
          ) : (
            <div
              className="flex h-[300px] items-center justify-center text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Analysis Chart (Bar Chart) */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Time Analysis</CardTitle>
        </CardHeader>
        <CardContent className="w-full overflow-hidden">
          {timeAnalysisData.length > 0 ? (
            <ChartContainer config={timeAnalysisConfig} className="h-[300px] w-full">
              <BarChart
                width={400}
                height={300}
                data={timeAnalysisData}
                role="img"
                aria-label="Time analysis chart showing time between answers in seconds"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="question_number"
                  label={{ value: 'Question Number', position: 'insideBottom', offset: -5 }}
                  aria-label="Question number axis"
                />
                <YAxis
                  label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                  aria-label="Time in seconds axis"
                />
                <Tooltip />
                <Bar
                  dataKey="time_answer_seconds"
                  fill="hsl(217, 91%, 60%)"
                  aria-label="Time between answers bar"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div
              className="flex h-[300px] items-center justify-center text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              No time data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Over Time Chart (Line Chart with Dual Axis) */}
      <Card className="lg:col-span-2 w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="w-full overflow-hidden">
          {performanceData.length > 0 ? (
            <ChartContainer config={performanceConfig} className="h-[300px] w-full">
              <LineChart
                width={800}
                height={300}
                data={performanceData}
                role="img"
                aria-label="Performance over time chart showing running accuracy and correct/incorrect indicators"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="question_number"
                  label={{ value: 'Question Number', position: 'insideBottom', offset: -5 }}
                  aria-label="Question number axis"
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                  aria-label="Running accuracy percentage axis"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 1]}
                  label={{ value: 'Correct/Incorrect', angle: 90, position: 'insideRight' }}
                  aria-label="Correct or incorrect indicator axis"
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="running_accuracy"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  name="Running Accuracy (%)"
                  aria-label="Running accuracy line"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="is_correct"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  name="Correct (1) / Incorrect (0)"
                  aria-label="Correct or incorrect line"
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div
              className="flex h-[300px] items-center justify-center text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              No performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
// Only re-render when statistics or questions props change
export const StatisticsCharts = memo(StatisticsChartsComponent);

