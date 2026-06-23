import type { BracketRound, Team } from '../types/bracket';

export type SimPicks = Record<number, 'home' | 'away'>;

/**
 * Given the bracket rounds and the user's simulation picks (matchId → side),
 * return a new rounds array where each pick's winner is forwarded into the
 * correct slot of the next round.
 *
 * Position math (0-indexed within each round):
 *   - Match at index i → feeds round+1 match at Math.floor(i/2)
 *   - home if i is even, away if i is odd
 */
export function applySimulation(rounds: BracketRound[], picks: SimPicks): BracketRound[] {
  if (Object.keys(picks).length === 0) return rounds;

  // Deep-clone so we don't mutate the original
  const result: BracketRound[] = rounds.map((r) => ({
    ...r,
    matches: r.matches.map((m) => ({ ...m })),
  }));

  for (let r = 0; r < result.length - 1; r++) {
    const cur = result[r];
    const next = result[r + 1];

    for (let i = 0; i < cur.matches.length; i++) {
      const match = cur.matches[i];
      const pick = picks[match.id];
      if (!pick) continue;

      const winner: Team | null = pick === 'home' ? match.homeTeam : match.awayTeam;
      if (!winner) continue;

      const nextIdx = Math.floor(i / 2);
      const isHome = i % 2 === 0;

      if (nextIdx < next.matches.length) {
        const nextMatch = { ...next.matches[nextIdx] };
        if (isHome) {
          nextMatch.homeTeam = winner;
        } else {
          nextMatch.awayTeam = winner;
        }
        next.matches[nextIdx] = nextMatch;
      }
    }
  }

  return result;
}
