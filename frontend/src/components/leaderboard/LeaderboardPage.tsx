import { useEffect, useState } from 'react';
import type { Game, LeaderboardEntry } from '@/types';
import { fetchGames, fetchLeaderboard } from '@/lib/api';
import { Leaderboard } from '@/components/home/Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface GameWithLeaderboard {
  game: Game;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

/**
 * LeaderboardPage displays leaderboards for all available games.
 * - Fetches all games on mount
 * - Fetches leaderboards for each game in parallel
 * - Displays game sections with their respective leaderboards
 * - Handles loading, error, and empty states
 */
export function LeaderboardPage() {
  const [gamesWithLeaderboards, setGamesWithLeaderboards] = useState<GameWithLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all games
        const games = await fetchGames();
        const activeGames = games
          .filter(game => game.is_active)
          .sort((a, b) => a.display_order - b.display_order);

        // Initialize games with loading state
        const gamesInit: GameWithLeaderboard[] = activeGames.map(game => ({
          game,
          leaderboard: [],
          loading: true,
          error: null,
        }));
        setGamesWithLeaderboards(gamesInit);

        // Fetch leaderboards for all games in parallel
        const leaderboardPromises = activeGames.map(async (game, index) => {
          try {
            const leaderboard = await fetchLeaderboard(game.game_id);
            return { index, leaderboard, error: null };
          } catch (err) {
            console.error(`Failed to fetch leaderboard for game ${game.game_id}:`, err);
            return {
              index,
              leaderboard: [],
              error: err instanceof Error ? err.message : 'Failed to load leaderboard',
            };
          }
        });

        const results = await Promise.all(leaderboardPromises);

        // Update games with leaderboard data
        setGamesWithLeaderboards(prev => {
          return prev.map((item, index) => {
            const result = results.find(r => r.index === index);
            if (result) {
              return {
                ...item,
                leaderboard: result.leaderboard,
                loading: false,
                error: result.error,
              };
            }
            return item;
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load games');
        console.error('Failed to fetch games:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboards();
  }, []);

  const handleRetry = () => {
    // Reload the page to retry
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Leaderboards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View top players for each game
          </p>
        </div>

        {/* Error State - Global */}
        {error && (
          <div
            className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <p className="text-red-800 dark:text-red-200 font-medium">
              Error loading games
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="mt-3 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Games with Leaderboards */}
        {!loading && !error && gamesWithLeaderboards.length > 0 && (
          <div className="space-y-6">
            {gamesWithLeaderboards.map(({ game, leaderboard, loading: gameLoading, error: gameError }) => (
              <Card key={game.game_id} className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    {game.icon_path && (
                      <img
                        src={game.icon_path}
                        alt={`${game.name} icon`}
                        className="w-8 h-8 object-contain"
                        loading="lazy"
                      />
                    )}
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {game.name}
                    </h2>
                  </div>
                  {game.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {game.description}
                    </p>
                  )}
                </div>

                {/* Game-specific Error State */}
                {gameError && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      Failed to load leaderboard for this game
                    </p>
                  </div>
                )}

                {/* Game Loading State */}
                {gameLoading && !gameError && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}

                {/* Leaderboard Display */}
                {!gameLoading && !gameError && (
                  <Leaderboard entries={leaderboard} />
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && gamesWithLeaderboards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
              <div className="mb-4 text-6xl">🏆</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Games Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There are currently no games available. Please check back later.
              </p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

