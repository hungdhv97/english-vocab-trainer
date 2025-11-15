import { useState } from 'react';
import type { CefrLevel } from '@/types';
import { fetchCefrLevels } from '@/lib/api';
import { Leaderboard } from '@/components/home/Leaderboard';
import VocabQuizLeaderboard from '@/components/game/VocabQuizLeaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGames } from '@/hooks/queries/useGames';
import { useLeaderboard } from '@/hooks/queries/useLeaderboard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQuery } from '@tanstack/react-query';

/**
 * LeaderboardPage displays leaderboards for games with tab-based selection.
 * - Fetches all active games on mount
 * - Displays game tabs at the top
 * - Shows leaderboard for selected game only
 * - Handles loading, error, and empty states
 * - Supports special leaderboards (vocab-quiz with CEFR level filtering)
 */
export function LeaderboardPage() {
  const isMobile = useIsMobile();

  // Use React Query hooks
  const { data: gamesData, isLoading: loadingGames, error: gamesError } = useGames();

  // CEFR levels for vocab-quiz
  const { data: cefrLevels = [] } = useQuery({
    queryKey: ['cefrLevels'],
    queryFn: fetchCefrLevels,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  // Process games data
  const games = gamesData
    ?.filter(game => game.is_active)
    .sort((a, b) => a.display_order - b.display_order) || [];

  // Selected game state
  const [selectedGameId, setSelectedGameId] = useState<number | null>(
    games.length > 0 ? games[0].game_id : null
  );

  // Update selectedGameId when games are loaded
  if (games.length > 0 && selectedGameId === null) {
    setSelectedGameId(games[0].game_id);
  }

  // Fetch leaderboard for selected game (disabled for vocab-quiz)
  const selectedGame = games.find(g => g.game_id === selectedGameId);
  const shouldFetchLeaderboard = selectedGame?.code !== 'vocab-quiz';

  const {
    data: leaderboardData,
    isLoading: loadingLeaderboard,
    error: leaderboardError
  } = useLeaderboard(shouldFetchLeaderboard ? selectedGameId : null);

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

  const handleSelectChange = (value: string) => {
    const gameId = parseInt(value, 10);
    if (!isNaN(gameId)) {
      setSelectedGameId(gameId);
    }
  };

  // Derived states
  const loading = loadingGames;
  const error = gamesError ? (gamesError as Error).message : null;
  const selectedLoading = loadingLeaderboard;
  const selectedError = leaderboardError ? (leaderboardError as Error).message : null;
  const selectedLeaderboard = leaderboardData;

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

      {/* Games Selection - Mobile Dropdown / Desktop Tabs */}
      {!loading && !error && games.length > 0 && (
        <>
          {isMobile ? (
            // Mobile: Dropdown selector
            <div className="mb-6">
              <Select
                value={selectedGameId?.toString() || ''}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.game_id} value={game.game_id.toString()}>
                      <div className="flex items-center gap-2">
                        {game.icon_path && (
                          <img
                            src={game.icon_path}
                            alt={`${game.name} icon`}
                            className="w-4 h-4 object-contain"
                            loading="lazy"
                          />
                        )}
                        {game.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            // Desktop: Tabs with flex-wrap
            <Tabs
              value={selectedGameId?.toString() || ''}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="mb-6 flex-wrap h-auto">
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
                  <Card className="p-4">
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

          {/* Mobile: Content display based on selected game */}
          {isMobile && selectedGame && (
            <Card className="p-4">
              {/* Special handling for vocab-quiz game */}
              {selectedGame.code === 'vocab-quiz' ? (
                <>
                  {cefrLevels.length > 0 ? (
                    <VocabQuizLeaderboard
                      gameId={selectedGame.game_id}
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
          )}
        </>
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
