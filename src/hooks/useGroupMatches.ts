import { useQuery } from '@tanstack/react-query';
import { fetchGroupMatches } from '../api/footballData';
import type { Match } from '../types/bracket';

export function useGroupMatches() {
  return useQuery<Match[], Error>({
    queryKey: ['wc-group-matches'],
    queryFn: fetchGroupMatches,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}
