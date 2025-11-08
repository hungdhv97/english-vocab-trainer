import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { fetchGameByCode } from '@/lib/api';
import type { Game } from '@/types';
import { toast } from 'react-hot-toast';

interface Props {
  gameCode: string;
}

/**
 * ComingSoon component displays a "Coming Soon" page for unimplemented games.
 * Fetches game information from the backend and displays game name, description, and icon.
 */
export default function ComingSoon({ gameCode }: Props) {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const gameData = await fetchGameByCode(gameCode);
        setGame(gameData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load game';
        setError(errorMessage);
        
        // If game not found (404), redirect to homepage
        if (errorMessage === 'Game not found') {
          toast.error('Game not found');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (gameCode) {
      loadGame();
    } else {
      setError('Invalid game code');
      setLoading(false);
    }
  }, [gameCode, navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>Loading game information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && error !== 'Game not found') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-md text-center relative">
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          size="icon"
          className="absolute top-[10px] left-[10px]"
        >
          <ArrowLeft />
        </Button>
        <CardHeader>
          {game.icon_path && (
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src={game.icon_path}
                alt={`${game.name} icon`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          )}
          <CardTitle className="text-2xl">{game.name}</CardTitle>
          {game.category && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {game.category}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              This game is currently under development. Check back soon!
            </p>
          </div>
          {game.description && (
            <p className="text-sm text-muted-foreground">{game.description}</p>
          )}
          <Button onClick={handleBackToHome} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

