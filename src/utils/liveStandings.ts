import type { Match } from '../types/bracket';
import type { StandingsMap, StandingEntry } from '../types/standings';

export interface LiveStandingsResult {
  standings: StandingsMap;
  /** Team IDs currently in a live (IN_PLAY / PAUSED) match */
  liveTeamIds: Set<number>;
  /** Live match score labels: teamId → "vs OpponentName  score" */
  liveScores: Map<number, string>;
}

/**
 * Overlay in-progress group match scores onto the finalized standings.
 * The API /standings endpoint only updates at full-time; this function
 * applies provisional points/GD for any match currently IN_PLAY or PAUSED.
 */
export function computeLiveStandings(
  base: StandingsMap,
  groupMatches: Match[]
): LiveStandingsResult {
  const liveMatches = groupMatches.filter(
    (m) => m.status === 'IN_PLAY' || m.status === 'PAUSED'
  );

  const liveTeamIds = new Set<number>();
  const liveScores = new Map<number, string>();

  if (liveMatches.length === 0) {
    return { standings: base, liveTeamIds, liveScores };
  }

  // Deep-clone standings so we never mutate the original
  const result: StandingsMap = {};
  for (const [group, table] of Object.entries(base)) {
    result[group] = table.map((e) => ({ ...e }));
  }

  // Build a flat id → entry map for quick lookup
  const entryById = new Map<number, StandingEntry>();
  for (const table of Object.values(result)) {
    for (const entry of table) {
      entryById.set(entry.team.id, entry);
    }
  }

  for (const match of liveMatches) {
    const homeId = match.homeTeam?.id;
    const awayId = match.awayTeam?.id;
    if (!homeId || !awayId) continue;

    const homeEntry = entryById.get(homeId);
    const awayEntry = entryById.get(awayId);
    if (!homeEntry || !awayEntry) continue;

    const hg = match.score.fullTime.home ?? 0;
    const ag = match.score.fullTime.away ?? 0;

    liveTeamIds.add(homeId);
    liveTeamIds.add(awayId);

    // Score labels: "vs Opponent  1–0 (LIVE)"
    const homeName = match.homeTeam?.shortName || match.homeTeam?.name || '?';
    const awayName = match.awayTeam?.shortName || match.awayTeam?.name || '?';
    const label = match.status === 'PAUSED' ? 'HT' : 'LIVE';
    liveScores.set(homeId, `vs ${awayName}  ${hg}–${ag} (${label})`);
    liveScores.set(awayId, `vs ${homeName}  ${ag}–${hg} (${label})`);

    // Apply provisional result to cloned entries
    homeEntry.playedGames += 1;
    awayEntry.playedGames += 1;
    homeEntry.goalsFor += hg;
    homeEntry.goalsAgainst += ag;
    awayEntry.goalsFor += ag;
    awayEntry.goalsAgainst += hg;
    homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;
    awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;

    if (hg > ag) {
      homeEntry.won += 1;
      homeEntry.points += 3;
      awayEntry.lost += 1;
    } else if (hg === ag) {
      homeEntry.draw += 1;
      homeEntry.points += 1;
      awayEntry.draw += 1;
      awayEntry.points += 1;
    } else {
      awayEntry.won += 1;
      awayEntry.points += 3;
      homeEntry.lost += 1;
    }
  }

  // Re-sort each group and update position numbers
  for (const table of Object.values(result)) {
    table.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    table.forEach((e, i) => { e.position = i + 1; });
  }

  return { standings: result, liveTeamIds, liveScores };
}
