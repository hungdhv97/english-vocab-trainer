import { useEffect, useState } from 'react';
import type { Game, LeaderboardEntry, CefrLevel } from '@/types';
import { fetchGames, fetchLeaderboard, fetchCefrLevels } from '@/lib/api';
import { Leaderboard } from '@/components/home/Leaderboard';
import VocabQuizLeaderboard from '@/components/game/VocabQuizLeaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([]);

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

        // Fetch CEFR levels for vocab quiz leaderboard
        try {
          const levels = await fetchCefrLevels();
          setCefrLevels(levels);
        } catch (err) {
          console.error('Failed to fetch CEFR levels:', err);
        }

        // Initialize games with loading state
        const gamesInit: GameWithLeaderboard[] = activeGames.map(game => ({
          game,
          leaderboard: [],
          loading: true,
          error: null,
        }));
        setGamesWithLeaderboards(gamesInit);

        // Fetch leaderboards for all games in parallel (except vocab-quiz which uses special leaderboard)
        const leaderboardPromises = activeGames.map(async (game, index) => {
          // Skip vocab-quiz as it uses a special leaderboard component
          if (game.code === 'vocab-quiz') {
            return {
              index,
              leaderboard: [],
              error: null,
              skip: true,
            };
          }

          try {
            const leaderboard = await fetchLeaderboard(game.game_id);
            return { index, leaderboard, error: null, skip: false };
          } catch (err) {
            console.error(`Failed to fetch leaderboard for game ${game.game_id}:`, err);
            return {
              index,
              leaderboard: [],
              error: err instanceof Error ? err.message : 'Failed to load leaderboard',
              skip: false,
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
                loading: result.skip ? false : false, // vocab-quiz doesn't need loading state
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
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Error loading games</AlertTitle>
            <AlertDescription>
              {error}
              <Button onClick={handleRetry} variant="outline" size="sm" className="mt-3">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
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
            {gamesWithLeaderboards.map(({ game, leaderboard, loading: gameLoading, error: gameError }) => {
              // Special handling for vocab-quiz game - use VocabQuizLeaderboard component
              if (game.code === 'vocab-quiz') {
                return (
                  <div key={game.game_id} className="space-y-4">
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {game.description}
                      </p>
                    )}
                    {cefrLevels.length > 0 && (
                      <VocabQuizLeaderboard
                        gameId={game.game_id}
                        cefrLevels={cefrLevels}
                      />
                    )}
                  </div>
                );
              }

              // Regular game leaderboard
              return (
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
                    <Alert className="mb-4">
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Failed to load leaderboard for this game
                      </AlertDescription>
                    </Alert>
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
              );
            })}
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
              <Button
                onClick={handleRetry}
                variant="default"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}

