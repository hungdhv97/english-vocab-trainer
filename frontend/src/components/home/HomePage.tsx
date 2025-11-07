import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game, GameWithLeaderboard } from '@/types';
import { fetchGames, fetchLeaderboard, isAuthenticated } from '@/lib/api';
import { GameGrid } from './GameGrid';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * HomePage is the main landing page displaying all available games.
 * - Fetches games on mount
 * - Shows loading skeletons while fetching
 * - Handles errors gracefully
 * - Game selection navigation will be added in User Story 3
 */
export function HomePage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameWithLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGamesWithLeaderboards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all games first
        const gamesData = await fetchGames();
        
        // Fetch leaderboards for all games in parallel
        const gamesWithLeaderboards = await Promise.all(
          gamesData.map(async (game) => {
            try {
              const leaderboard = await fetchLeaderboard(game.game_id);
              return { ...game, leaderboard };
            } catch (err) {
              console.error(`Failed to fetch leaderboard for game ${game.game_id}:`, err);
              // Return game with empty leaderboard on error
              return { ...game, leaderboard: [] };
            }
          })
        );
        
        setGames(gamesWithLeaderboards);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load games');
        console.error('Failed to fetch games:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGamesWithLeaderboards();
  }, []);

  /**
   * Handles game selection and navigation.
   * T043-T044: Check authentication status and route accordingly:
   * - If authenticated: navigate directly to game
   * - If not authenticated: navigate to login with redirect_to parameter
   */
  const handleGameClick = (game: Game) => {
    if (isAuthenticated()) {
      // User is authenticated - navigate directly to game
      navigate(`/game/${game.code}`);
    } else {
      // User not authenticated - redirect to login with redirect_to parameter
      navigate(`/login?redirect_to=/game/${game.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            English Vocabulary Trainer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Choose a game to start learning and improving your English skills
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
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
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-16 w-16 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Games Grid or Empty State */}
        {!loading && !error && games.length > 0 && (
          <GameGrid games={games} onGameClick={handleGameClick} />
        )}
        
        {/* T072: Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
              <div className="mb-4 text-6xl">📚</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Games Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There are currently no games available. Please check back later or contact support if this issue persists.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 English Vocabulary Trainer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

