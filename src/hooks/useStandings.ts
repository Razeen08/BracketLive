import { useQuery } from '@tanstack/react-query';
import { fetchStandings } from '../api/footballData';
import type { StandingsMap } from '../types/standings';

export function useStandings() {
  return useQuery<StandingsMap, Error>({
    queryKey: ['wc-standings'],
    queryFn: fetchStandings,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}
