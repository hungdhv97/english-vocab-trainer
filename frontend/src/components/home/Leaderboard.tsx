import type { LeaderboardEntry } from '@/types';
import { Card } from '@/components/ui/card';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

/**
 * Leaderboard displays the top 10 players for a game.
 * Shows "Be the first to play!" message if no entries exist.
 */
export function Leaderboard({ entries, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🏆 Leaderboard
        </h4>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          🏆 Leaderboard
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center py-3">
          🎯 Be the first to play!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <span>🏆</span>
        <span>Leaderboard</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
          (Top {Math.min(entries.length, 10)})
        </span>
      </h4>
      
      <div 
        className="space-y-1"
        role="table"
        aria-label="Game leaderboard"
      >
        {entries.slice(0, 10).map((entry) => {
          // Medal emoji for top 3
          const rankDisplay =
            entry.rank === 1
              ? '🥇'
              : entry.rank === 2
              ? '🥈'
              : entry.rank === 3
              ? '🥉'
              : `${entry.rank}.`;

          return (
            <div
              key={entry.user_id}
              className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              role="row"
            >
              {/* Rank */}
              <span
                className="text-sm font-bold w-8 text-center"
                role="cell"
                aria-label={`Rank ${entry.rank}`}
              >
                {rankDisplay}
              </span>

              {/* Username */}
              <span
                className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate"
                role="cell"
                aria-label={`Player ${entry.username}`}
              >
                {entry.username}
              </span>

              {/* Score */}
              <span
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums"
                role="cell"
                aria-label={`Score ${entry.score}`}
              >
                {entry.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

