import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * My Progress Page - Displays user's learning progress and statistics
 * TODO: Implement full progress tracking functionality
 */
export function MyProgressPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and see your improvement over time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
          <CardDescription>
            Your learning statistics and progress will be displayed here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Progress tracking features are coming soon!
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              This page will show your game statistics, accuracy trends, and learning milestones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

