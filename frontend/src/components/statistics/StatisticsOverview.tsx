import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExtendedSessionStatistics } from '@/types';
import { formatDuration } from '@/lib/utils';

interface StatisticsOverviewProps {
  statistics: ExtendedSessionStatistics;
}

function StatisticsOverviewComponent({ statistics }: StatisticsOverviewProps) {

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total Questions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total_questions}</div>
        </CardContent>
      </Card>

      {/* Correct Count */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Correct
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.correct_count}
          </div>
        </CardContent>
      </Card>

      {/* Incorrect Count */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Incorrect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {statistics.incorrect_count}
          </div>
        </CardContent>
      </Card>

      {/* Accuracy Percentage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.accuracy_percentage.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* Time Elapsed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Time Elapsed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(statistics.time_elapsed)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
// Only re-render when statistics prop changes
export const StatisticsOverview = memo(StatisticsOverviewComponent);

