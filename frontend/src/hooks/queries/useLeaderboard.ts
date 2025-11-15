import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from '@/lib/api';

export function useLeaderboard(gameId: number | null) {
  return useQuery({
    queryKey: ['leaderboard', gameId],
    queryFn: () => fetchLeaderboard(gameId!),
    enabled: gameId !== null,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

