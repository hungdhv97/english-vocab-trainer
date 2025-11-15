import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Game } from '@/types';
import { isAuthenticated } from '@/lib/api';
import { GameGrid } from './GameGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useGames } from '@/hooks/queries/useGames';

/**
 * HomePage is the main landing page displaying all available games.
 * - Fetches games on mount
 * - Shows loading skeletons while fetching
 * - Handles errors gracefully
 * - Displays games in a responsive grid without leaderboard information
 */
export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<number | null>(null);

  // Use React Query for games data
  const { data: gamesData, isLoading: loading, error: gamesError } = useGames();

  // Process games data
  const games = gamesData
    ?.filter(game => game.is_active)
    .sort((a, b) => a.display_order - b.display_order) || [];

  const error = gamesError ? (gamesError as Error).message : null;

  // Get userId from localStorage if authenticated and update on auth state changes
  useEffect(() => {
    const updateUserId = () => {
      if (isAuthenticated()) {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      } else {
        setUserId(null);
      }
    };

    // Update on mount and location changes (e.g., after login redirect)
    updateUserId();

    // Listen for storage changes (login/logout from other tabs/components)
    window.addEventListener('storage', updateUserId);

    return () => {
      window.removeEventListener('storage', updateUserId);
    };
  }, [location]);

  /**
   * Handles game selection and navigation.
   * Routes to /game/:code where GameRouter will handle game-specific routing.
   * - If authenticated: navigate directly to game
   * - If not authenticated: navigate to login with redirect_to parameter
   */
  const handleGameClick = (game: Game) => {
    const gameRoute = `/game/${game.code}`;
    
    if (isAuthenticated()) {
      // User is authenticated - navigate directly to game
      navigate(gameRoute);
    } else {
      // User not authenticated - redirect to login with redirect_to parameter
      navigate(`/login?redirect_to=${encodeURIComponent(gameRoute)}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Error loading games</AlertTitle>
            <AlertDescription>
              {error}
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-3">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
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
          <GameGrid games={games} onGameClick={handleGameClick} userId={userId} />
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
              <Button
                onClick={() => window.location.reload()}
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

