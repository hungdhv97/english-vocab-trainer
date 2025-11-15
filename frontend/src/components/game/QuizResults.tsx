import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';
import type { SessionStatistics } from '@/types';

interface QuizResultsProps {
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  sessionStatistics: SessionStatistics;
  onPlayAgain: () => void;
  onViewStatistics: () => void;
}

export function QuizResults({
  correctCount,
  incorrectCount,
  totalQuestions,
  sessionStatistics,
  onPlayAgain,
  onViewStatistics,
}: QuizResultsProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sessionStatistics.accuracy_percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
          {sessionStatistics.time_elapsed && (
            <div className="mt-4">
              <p className="text-lg">Time: {formatDuration(sessionStatistics.time_elapsed)}</p>
            </div>
          )}
          <div className="mt-6 space-x-4">
            <Button onClick={onPlayAgain}>Play Again</Button>
            <Button onClick={onViewStatistics} variant="outline">
              View Statistics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


