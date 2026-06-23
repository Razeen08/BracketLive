import type { Match } from '../types/bracket';
import type { GroupStanding, StandingsMap } from '../types/standings';

// In dev: requests go through the Vite proxy (/fd-api → football-data.org).
// In production: read pre-fetched static JSON files (no CORS restriction).
const DEV_BASE = '/fd-api/v4';

// Stage names the WC 2026 API might use for knockout rounds
const KNOCKOUT_STAGES = new Set([
  'LAST_32',
  'ROUND_OF_32',
  'LAST_16',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
]);

// Normalise any variant stage name to a canonical key
export function normaliseStage(stage: string): string {
  if (stage === 'ROUND_OF_32') return 'LAST_32';
  if (stage === 'ROUND_OF_16') return 'LAST_16';
  return stage;
}

export async function fetchKnockoutMatches(): Promise<Match[]> {
  let rawMatches: Match[];

  if (import.meta.env.DEV) {
    // Dev: hit the API through the Vite proxy (no CORS)
    const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error(
        'API key not configured. Copy .env.example to .env and add your football-data.org token.'
      );
    }
    const res = await fetch(`${DEV_BASE}/competitions/WC/matches`, {
      headers: { 'X-Auth-Token': apiKey },
    });
    if (!res.ok) {
      if (res.status === 400) throw new Error('Competition not found. The WC 2026 may not be available on your plan yet.');
      if (res.status === 403) throw new Error('Invalid API key or insufficient permissions. Check your football-data.org token.');
      if (res.status === 429) throw new Error('Rate limit reached (10 req/min). The page will auto-refresh shortly.');
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    const data = (await res.json()) as { matches: Match[] };
    rawMatches = data.matches ?? [];
  } else {
    // Production: read from pre-fetched static file (served by GitHub Pages)
    // Cache-bust so browsers always fetch the latest version after each CI deploy
    const res = await fetch(`./data/matches.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`Could not load match data (${res.status}). Please refresh.`);
    const data = (await res.json()) as { matches: Match[] };
    rawMatches = data.matches ?? [];
  }

  return rawMatches
    .filter((m) => KNOCKOUT_STAGES.has(m.stage))
    .map((m) => ({ ...m, stage: normaliseStage(m.stage) }));
}

// ── Group standings ───────────────────────────────────────────

export async function fetchStandings(): Promise<StandingsMap> {
  let rawStandings: GroupStanding[];

  if (import.meta.env.DEV) {
    const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured.');
    }
    const res = await fetch(`${DEV_BASE}/competitions/WC/standings`, {
      headers: { 'X-Auth-Token': apiKey },
    });
    if (!res.ok) {
      if (res.status === 429) throw new Error('Rate limit reached. Standings will refresh shortly.');
      throw new Error(`Standings API error ${res.status}`);
    }
    const data = (await res.json()) as { standings: GroupStanding[] };
    rawStandings = data.standings ?? [];
  } else {
    const res = await fetch(`./data/standings.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`Could not load standings data (${res.status}). Please refresh.`);
    const data = (await res.json()) as { standings: GroupStanding[] };
    rawStandings = data.standings ?? [];
  }

  const map: StandingsMap = {};

  for (const group of rawStandings) {
    // Only use TOTAL standings (not HOME/AWAY splits)
    if (group.type && group.type !== 'TOTAL') continue;
    // API may return "GROUP_A" or "Group A" — extract just the letter
    const letter = (group.group ?? '').replace(/^group[_\s]*/i, '').trim().toUpperCase();
    if (letter) {
      // Already sorted by position from the API, but sort defensively
      map[letter] = [...group.table].sort((a, b) => a.position - b.position);
    }
  }

  return map;
}
