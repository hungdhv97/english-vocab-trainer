import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SessionStatistics } from '@/types';
import { X } from 'lucide-react';

interface StatisticsViewProps {
  statistics: SessionStatistics;
  onClose: () => void;
}

/**
 * StatisticsView displays detailed statistics for a completed quiz session.
 * Shows in a modal-like overlay with comprehensive statistics.
 */
export default function StatisticsView({ statistics, onClose }: StatisticsViewProps) {
  const totalQuestions = statistics.correct_count + statistics.incorrect_count;
  const accuracy = statistics.accuracy_percentage.toFixed(1);
  const timeMinutes = statistics.time_elapsed
    ? (statistics.time_elapsed / 60).toFixed(1)
    : '0.0';
  const timeSeconds = statistics.time_elapsed
    ? (statistics.time_elapsed % 60).toFixed(0)
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl">Session Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {statistics.correct_count}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {statistics.incorrect_count}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Incorrect Answers</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Questions</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {accuracy}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Accuracy</p>
            </div>
          </div>

          {/* Score Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Score</h3>
            <p className="text-2xl font-bold">{statistics.total_score}</p>
            <p className="text-sm text-muted-foreground">
              Based on correct answers out of {totalQuestions} questions
            </p>
          </div>

          {/* Time Section */}
          {statistics.time_elapsed && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Time</h3>
              <p className="text-2xl font-bold">
                {timeMinutes} minutes {timeSeconds} seconds
              </p>
              <p className="text-sm text-muted-foreground">
                Total time elapsed: {statistics.time_elapsed.toFixed(1)} seconds
              </p>
            </div>
          )}

          {/* Accuracy Breakdown */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Accuracy Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Correct Answers</span>
                <span className="font-semibold">
                  {statistics.correct_count} / {totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${statistics.accuracy_percentage}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Incorrect Answers</span>
                <span className="font-semibold">
                  {statistics.incorrect_count} / {totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      totalQuestions > 0
                        ? ((statistics.incorrect_count / totalQuestions) * 100).toFixed(1)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="border-t pt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

