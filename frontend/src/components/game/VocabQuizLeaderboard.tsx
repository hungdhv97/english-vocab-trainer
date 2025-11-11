import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type {
  CefrLevel,
  TranslationDirection,
  VocabQuizLeaderboardResponse,
  VocabQuizLeaderboardEntry,
} from '@/types';
import { fetchVocabQuizLeaderboard } from '@/lib/api';

interface VocabQuizLeaderboardProps {
  gameId: number;
  cefrLevels: CefrLevel[];
  initialCefrLevelId?: number;
  initialTranslationDirection?: TranslationDirection;
}

/**
 * VocabQuizLeaderboard displays leaderboards for vocabulary quiz game.
 * Features 2-row tab navigation:
 * - First row: CEFR levels (A1, A2, B1, etc.)
 * - Second row: Translation directions (en-to-vi, vi-to-en)
 * Shows top 10 players ranked by accuracy percentage.
 */
export default function VocabQuizLeaderboard({
  gameId,
  cefrLevels,
  initialCefrLevelId,
  initialTranslationDirection = 'en-to-vi',
}: VocabQuizLeaderboardProps) {
  // Sort CEFR levels by code (A1, A2, B1, B2, C1, C2)
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const sortedLevels = [...cefrLevels].sort(
    (a, b) => levelOrder.indexOf(a.code) - levelOrder.indexOf(b.code),
  );

  // Determine initial level - use first level if not provided
  const defaultLevelId = initialCefrLevelId || sortedLevels[0]?.id || 0;

  const [selectedCefrLevelId, setSelectedCefrLevelId] = useState<number>(defaultLevelId);
  const [selectedTranslationDirection, setSelectedTranslationDirection] =
    useState<TranslationDirection>(initialTranslationDirection);
  const [leaderboard, setLeaderboard] = useState<VocabQuizLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cefrLevelCode, setCefrLevelCode] = useState<string>('');
  const [minGamesPlayed, setMinGamesPlayed] = useState<number>(1); // Default to 1, will be updated from API

  // Fetch leaderboard when selection changes
  useEffect(() => {
    if (!selectedCefrLevelId || !gameId) return;

    setLoading(true);
    setError(null);

    fetchVocabQuizLeaderboard(gameId, selectedCefrLevelId, selectedTranslationDirection)
      .then((response: VocabQuizLeaderboardResponse) => {
        setLeaderboard(response.leaderboard);
        setCefrLevelCode(response.cefr_level_code);
        setMinGamesPlayed(response.min_games_played || 1);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        setLeaderboard([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gameId, selectedCefrLevelId, selectedTranslationDirection]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">Vocabulary Quiz Leaderboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Top 10 players ranked by accuracy percentage (minimum {minGamesPlayed} {minGamesPlayed === 1 ? 'game' : 'games'} required)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* First Row: CEFR Levels */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">CEFR Level</label>
            <div className="flex flex-wrap gap-2">
              {sortedLevels.map((level) => (
                <Button
                  key={level.id}
                  variant={selectedCefrLevelId === level.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCefrLevelId(level.id)}
                  className="min-w-[60px]"
                >
                  {level.code}
                </Button>
              ))}
            </div>
          </div>

          {/* Second Row: Translation Directions */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Translation Direction</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTranslationDirection === 'en-to-vi' ? 'default' : 'outline'}
                onClick={() => setSelectedTranslationDirection('en-to-vi')}
              >
                English → Vietnamese
              </Button>
              <Button
                variant={selectedTranslationDirection === 'vi-to-en' ? 'default' : 'outline'}
                onClick={() => setSelectedTranslationDirection('vi-to-en')}
              >
                Vietnamese → English
              </Button>
            </div>
          </div>

          {/* Leaderboard Display */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">
              Leaderboard: {cefrLevelCode} -{' '}
              {selectedTranslationDirection === 'en-to-vi'
                ? 'English → Vietnamese'
                : 'Vietnamese → English'}
            </h3>

            {loading && (
              <div className="text-center py-8 text-muted-foreground">
                Loading leaderboard...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && leaderboard.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg font-semibold mb-2">No players yet</p>
                <p className="text-sm">
                  Be the first to play at least {minGamesPlayed} {minGamesPlayed === 1 ? 'game' : 'games'} for this level and direction!
                </p>
              </div>
            )}

            {!loading && !error && leaderboard.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 pb-2 border-b font-semibold text-sm text-muted-foreground">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5">Username</div>
                  <div className="col-span-3 text-right">Accuracy</div>
                  <div className="col-span-3 text-right">Games</div>
                </div>
                {leaderboard.map((entry) => {
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
                      className="grid grid-cols-12 gap-2 py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="col-span-1 text-center font-bold">{rankDisplay}</div>
                      <div className="col-span-5 truncate">{entry.username}</div>
                      <div className="col-span-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {entry.accuracy_percentage.toFixed(1)}%
                      </div>
                      <div className="col-span-3 text-right text-muted-foreground">
                        {entry.games_played}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

