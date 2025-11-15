import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '@/lib/api';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

