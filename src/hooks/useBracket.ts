import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { fetchKnockoutMatches } from '../api/footballData';
import type { BracketData, BracketRound, Match, Team } from '../types/bracket';
import type { StandingsMap } from '../types/standings';
import { projectR32Teams } from '../utils/projection';
import { R32_SLOTS } from '../constants/bracketSlots';

// Canonical round order (THIRD_PLACE handled separately)
const STAGE_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'] as const;

const STAGE_NAMES: Record<string, string> = {
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter Finals',
  SEMI_FINALS: 'Semi Finals',
  FINAL: 'Final',
};

// Expected match counts per stage for WC 2026
const STAGE_COUNTS: Record<string, number> = {
  LAST_32: 16,
  LAST_16: 8,
  QUARTER_FINALS: 4,
  SEMI_FINALS: 2,
  FINAL: 1,
};

/**
 * Create a "label-only" team used when a real team hasn't been determined yet.
 * e.g. "Winner Group E", "Runner-up Group A"
 */
function makeSlotTeam(label: string, id: number): Team {
  return { id, name: label, shortName: label, tla: '—', crest: '' };
}

const EMPTY_SCORE: Match['score'] = {
  winner: null,
  duration: 'REGULAR',
  fullTime: { home: null, away: null },
  extraTime: { home: null, away: null },
  penalties: { home: null, away: null },
};

let _placeholderId = -1;
function makePlaceholderMatch(stage: string, matchday: number): Match {
  return {
    id: _placeholderId--,
    stage,
    status: 'SCHEDULED',
    utcDate: '',
    homeTeam: null,
    awayTeam: null,
    score: { ...EMPTY_SCORE },
    matchday,
  };
}

function buildBracketData(matches: Match[], standings: StandingsMap | null): BracketData {
  const stageMap = new Map<string, Match[]>();

  for (const match of matches) {
    if (!stageMap.has(match.stage)) stageMap.set(match.stage, []);
    stageMap.get(match.stage)!.push(match);
  }

  // Sort each stage by matchday / id for consistent ordering
  for (const [, stageMatches] of stageMap) {
    stageMatches.sort((a, b) => (a.matchday ?? a.id) - (b.matchday ?? b.id));
  }

  const rounds: BracketRound[] = STAGE_ORDER.map((stage) => {
    const existing = stageMap.get(stage) ?? [];
    const expected = STAGE_COUNTS[stage];

    // ── R32: always built from the hardcoded bracket definition ──
    // The API has no R32 data during group stage, so we never rely on it.
    // Once the group stage ends and the API populates real teams, those take
    // over (apiMatch.homeTeam/awayTeam will be non-null).
    if (stage === 'LAST_32') {
      const projections = standings ? projectR32Teams(standings) : null;
      const virtualR32: Match[] = R32_SLOTS.map((slot, i) => {
        // If the API already has real confirmed teams for this slot, use them.
        // Guard: the API sends placeholder objects {id:null, name:null, ...} for
        // unconfirmed slots — treat those as "no team" and fall through to projection.
        const apiMatch = existing[i];
        if (apiMatch?.homeTeam?.name && apiMatch?.awayTeam?.name) return apiMatch;

        // Otherwise build from standings projection or fallback to slot labels.
        const homeTeam = projections?.[i]?.home ?? makeSlotTeam(slot.homeLabel, -(2000 + i * 2));
        const awayTeam = projections?.[i]?.away ?? makeSlotTeam(slot.awayLabel, -(2000 + i * 2 + 1));

        return {
          id: -(1000 + i),          // stable per bracket position
          stage: 'LAST_32',
          status: 'SCHEDULED' as const,
          utcDate: apiMatch?.utcDate ?? '',
          homeTeam,
          awayTeam,
          score: { ...EMPTY_SCORE },
          matchday: i + 1,
        };
      });

      return { stage, name: STAGE_NAMES[stage], matches: virtualR32 };
    }

    // ── All other stages: use API data, pad with placeholders ──
    const filled = [...existing];
    while (filled.length < expected) {
      filled.push(makePlaceholderMatch(stage, filled.length + 1));
    }
    return { stage, name: STAGE_NAMES[stage], matches: filled };
  });

  const thirdPlace = stageMap.get('THIRD_PLACE')?.[0] ?? null;

  // Determine champion: winner of the Final
  let champion: Team | null = null;
  const finalMatch = stageMap.get('FINAL')?.[0];
  if (finalMatch?.status === 'FINISHED' && finalMatch.score.winner) {
    champion =
      finalMatch.score.winner === 'HOME_TEAM'
        ? finalMatch.homeTeam
        : finalMatch.awayTeam;
  }

  return { rounds, thirdPlace, champion };
}

/**
 * Pass the standings from `useStandings()` so we reuse its cached data
 * instead of making a second independent API call that may be rate-limited.
 * The queryKey includes a standings fingerprint so the bracket refetches
 * automatically once standings data becomes available.
 */
export function useBracket(standings: StandingsMap | null) {
  // Use a ref so the queryFn always reads the latest standings,
  // even if React closes over a stale value in strict-mode double invocations.
  const standingsRef = useRef(standings);
  standingsRef.current = standings;

  const standingsKey = standings ? Object.keys(standings).sort().join('') : '';

  return useQuery<BracketData, Error>({
    queryKey: ['wc-bracket', standingsKey],
    queryFn: async () => {
      const matches = await fetchKnockoutMatches();
      return buildBracketData(matches, standingsRef.current);
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}
