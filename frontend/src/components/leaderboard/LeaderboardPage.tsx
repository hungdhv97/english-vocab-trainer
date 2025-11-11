import { useEffect, useState, useRef } from 'react';
import type { Game, LeaderboardEntry, CefrLevel } from '@/types';
import { fetchGames, fetchLeaderboard, fetchCefrLevels } from '@/lib/api';
import { Leaderboard } from '@/components/home/Leaderboard';
import VocabQuizLeaderboard from '@/components/game/VocabQuizLeaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/**
 * LeaderboardPage displays leaderboards for games with tab-based selection.
 * - Fetches all active games on mount
 * - Displays game tabs at the top
 * - Shows leaderboard for selected game only
 * - Handles loading, error, and empty states
 * - Supports special leaderboards (vocab-quiz with CEFR level filtering)
 */
export function LeaderboardPage() {
  // Games list state
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected game state
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Leaderboard state (per game)
  const [leaderboards, setLeaderboards] = useState<Map<number, LeaderboardEntry[]>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
  const [errorStates, setErrorStates] = useState<Map<number, string | null>>(new Map());

  // CEFR levels for vocab-quiz
  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([]);

  // AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch games and CEFR levels on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all games
        const gamesData = await fetchGames();
        const activeGames = gamesData
          .filter(game => game.is_active)
          .sort((a, b) => a.display_order - b.display_order);

        setGames(activeGames);

        // Set default selected game to first game by display order
        if (activeGames.length > 0) {
          setSelectedGameId(activeGames[0].game_id);
        }

        // Fetch CEFR levels for vocab quiz leaderboard
        try {
          const levels = await fetchCefrLevels();
          setCefrLevels(levels);
        } catch (err) {
          console.error('Failed to fetch CEFR levels:', err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load games');
        console.error('Failed to fetch games:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  // Fetch leaderboard when selected game changes
  useEffect(() => {
    if (selectedGameId === null) return;

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Skip fetching for vocab-quiz (it uses special leaderboard component)
    const selectedGame = games.find(g => g.game_id === selectedGameId);
    if (selectedGame?.code === 'vocab-quiz') {
      return;
    }

    // Set loading state
    setLoadingStates(prev => new Map(prev).set(selectedGameId, true));
    setErrorStates(prev => new Map(prev).set(selectedGameId, null));

    // Fetch leaderboard
    fetchLeaderboard(selectedGameId)
      .then((leaderboard) => {
        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        setLeaderboards(prev => new Map(prev).set(selectedGameId, leaderboard));
        setLoadingStates(prev => new Map(prev).set(selectedGameId, false));
      })
      .catch((err) => {
        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        console.error(`Failed to fetch leaderboard for game ${selectedGameId}:`, err);
        setErrorStates(prev => new Map(prev).set(selectedGameId, err instanceof Error ? err.message : 'Failed to load leaderboard'));
        setLoadingStates(prev => new Map(prev).set(selectedGameId, false));
      });

    // Cleanup: abort request on unmount or when selectedGameId changes
    return () => {
      abortController.abort();
    };
  }, [selectedGameId, games]);

  const handleRetry = () => {
    // Reload the page to retry
    window.location.reload();
  };

  const handleTabChange = (value: string) => {
    const gameId = parseInt(value, 10);
    if (!isNaN(gameId)) {
      setSelectedGameId(gameId);
    }
  };

  const selectedLeaderboard = selectedGameId ? leaderboards.get(selectedGameId) : undefined;
  const selectedLoading = selectedGameId ? loadingStates.get(selectedGameId) : false;
  const selectedError = selectedGameId ? errorStates.get(selectedGameId) : null;

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

      {/* Games with Tabs */}
      {!loading && !error && games.length > 0 && (
        <Tabs
          value={selectedGameId?.toString() || ''}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-6">
            {games.map((game) => (
              <TabsTrigger
                key={game.game_id}
                value={game.game_id.toString()}
                className="flex items-center gap-2"
              >
                {game.icon_path && (
                  <img
                    src={game.icon_path}
                    alt={`${game.name} icon`}
                    className="w-4 h-4 object-contain"
                    loading="lazy"
                  />
                )}
                {game.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {games.map((game) => (
            <TabsContent key={game.game_id} value={game.game_id.toString()}>
              <Card className="p-6">
                {/* Special handling for vocab-quiz game */}
                {game.code === 'vocab-quiz' ? (
                  <>
                    {cefrLevels.length > 0 ? (
                      <VocabQuizLeaderboard
                        gameId={game.game_id}
                        cefrLevels={cefrLevels}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Loading CEFR levels...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Game-specific Error State */}
                    {selectedError && (
                      <Alert className="mb-4">
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                          {selectedError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Game Loading State */}
                    {selectedLoading && !selectedError && (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    )}

                    {/* Leaderboard Display */}
                    {!selectedLoading && !selectedError && selectedLeaderboard && (
                      <>
                        {selectedLeaderboard.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-lg font-semibold mb-2">No players yet</p>
                            <p className="text-sm">
                              Be the first to play this game and appear on the leaderboard!
                            </p>
                          </div>
                        ) : (
                          <Leaderboard entries={selectedLeaderboard} />
                        )}
                      </>
                    )}

                    {/* Empty state when no leaderboard data available */}
                    {!selectedLoading && !selectedError && !selectedLeaderboard && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No leaderboard data available</p>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Empty State - No games */}
      {!loading && !error && games.length === 0 && (
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
