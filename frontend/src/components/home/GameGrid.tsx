import type { Game } from '@/types';
import { GameCard } from './GameCard';

interface GameGridProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  userId?: number | null;
}

/**
 * GameGrid renders a responsive grid layout of GameCard components.
 * Adapts to different screen sizes:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (>= 1024px): 3 columns
 */
export function GameGrid({ games, onGameClick, userId }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No games available at the moment.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Check back later for new learning games!
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
      aria-label="Available games"
    >
      {games.map((game) => (
        <div key={game.game_id} role="listitem">
          <GameCard
            game={game}
            onClick={() => onGameClick?.(game)}
            userId={userId}
          />
        </div>
      ))}
    </div>
  );
}

