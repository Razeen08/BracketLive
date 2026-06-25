import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '../api/footballData';

export function useMeta() {
  return useQuery<{ fetchedAt: string | null }, Error>({
    queryKey: ['wc-meta'],
    queryFn: fetchMeta,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
