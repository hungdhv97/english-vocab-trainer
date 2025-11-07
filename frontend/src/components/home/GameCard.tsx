import type { GameWithLeaderboard } from '@/types';
import { Card } from '@/components/ui/card';
import { Leaderboard } from './Leaderboard';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GameCardProps {
  game: GameWithLeaderboard;
  onClick?: () => void;
}

/**
 * GameCard displays a single game with its icon, name, description, and category.
 * Designed to be clickable for game selection (implemented in User Story 3).
 */
export function GameCard({ game, onClick }: GameCardProps) {
  const categoryColors: Record<string, string> = {
    vocabulary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    grammar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    pronunciation:
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    mixed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  const categoryClass = game.category
    ? categoryColors[game.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Select ${game.name} game`}
    >
      <div className="p-6 space-y-4">
        {/* Game Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto">
          {game.icon_path ? (
            <img
              src={game.icon_path}
              alt={`${game.name} icon`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {game.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Game Name */}
        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {game.name}
        </h3>

        {/* Category Badge */}
        {game.category && (
          <div className="flex justify-center">
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${categoryClass}`}
            >
              {game.category}
            </span>
          </div>
        )}

        {/* Game Description with Tooltip - T073 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-3 cursor-help">
              {game.description}
            </p>
          </TooltipTrigger>
          {game.description && game.description.length > 100 && (
            <TooltipContent className="max-w-xs">
              <p>{game.description}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* Leaderboard */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Leaderboard entries={game.leaderboard} />
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 dark:group-hover:border-blue-400 rounded-lg pointer-events-none transition-colors" />
    </Card>
  );
}

