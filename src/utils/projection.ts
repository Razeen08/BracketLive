import type { Team } from '../types/bracket';
import type { StandingsMap, StandingEntry } from '../types/standings';
import { R32_SLOTS } from '../constants/bracketSlots';
import { THIRD_PLACE_TABLE } from '../constants/thirdPlaceTable';

/** Build a fake Team object from a standing entry for projection display. */
function entryToTeam(entry: StandingEntry): Team {
  return {
    id: entry.team.id,
    name: entry.team.name,
    shortName: entry.team.shortName,
    tla: entry.team.tla,
    crest: entry.team.crest,
  };
}

/**
 * Use FIFA's official 495-combination table to assign qualifying 3rd-place
 * teams to bracket slots.
 *
 * Table columns: [3rd vs 1A, 3rd vs 1B, 3rd vs 1D, 3rd vs 1E, 3rd vs 1G, 3rd vs 1I, 3rd vs 1K, 3rd vs 1L]
 * Each value is e.g. "3F" meaning "3rd place of Group F".
 *
 * Returns a map: winner-group-letter → assigned 3rd-place Team (or null).
 */
function buildThirdPlaceMap(
  standings: StandingsMap
): Record<string, Team | null> {
  // Rank all available 3rd-place entries across 12 groups
  const allThirds = Object.entries(standings)
    .map(([group, table]) => ({ group, entry: table?.[2] ?? null }))
    .filter((x): x is { group: string; entry: StandingEntry } => x.entry !== null);

  allThirds.sort((a, b) => {
    const ae = a.entry, be = b.entry;
    if (be.points !== ae.points) return be.points - ae.points;
    if (be.goalDifference !== ae.goalDifference) return be.goalDifference - ae.goalDifference;
    return be.goalsFor - ae.goalsFor;
  });

  const best8 = allThirds.slice(0, 8);
  const comboKey = best8.map((x) => x.group).sort().join('');
  const tableRow = THIRD_PLACE_TABLE[comboKey];

  if (!tableRow) return {}; // combination not yet determinable

  // Column order in the table: 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L
  const winnerGroupOrder = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];

  // Build a lookup: 3rd-place group → Team
  const thirdTeamByGroup: Record<string, Team> = {};
  for (const { group, entry } of best8) {
    thirdTeamByGroup[group] = entryToTeam(entry);
  }

  // Build result: winner group → which 3rd-place Team faces them
  const result: Record<string, Team | null> = {};
  winnerGroupOrder.forEach((wg, i) => {
    const assignedGroup = tableRow[i].slice(1); // "3F" → "F"
    result[wg] = thirdTeamByGroup[assignedGroup] ?? null;
  });

  return result;
}

/**
 * For each of the 16 R32 bracket slots (in visual bracket order), return
 * the projected home/away Team based on current group standings, or null
 * if the position cannot yet be determined.
 */
export function projectR32Teams(
  standings: StandingsMap
): Array<{ home: Team | null; away: Team | null }> {
  const thirdPlaceMap = buildThirdPlaceMap(standings);

  return R32_SLOTS.map((slot) => {
    // Home team (group winner or runner-up)
    let home: Team | null = null;
    const homeTable = standings[slot.homeGroup];
    if (homeTable && homeTable.length >= slot.homePos) {
      home = entryToTeam(homeTable[slot.homePos - 1]);
    }

    // Away team
    let away: Team | null = null;
    if (slot.awayGroup && slot.awayPos !== 3) {
      const awayTable = standings[slot.awayGroup];
      if (awayTable && awayTable.length >= slot.awayPos) {
        away = entryToTeam(awayTable[slot.awayPos - 1]);
      }
    } else if (slot.awayPos === 3) {
      // slot.homeGroup is the winner's group (e.g. 'E' for Winner Group E)
      // thirdPlaceMap['E'] is the 3rd-place team assigned to face that winner
      away = thirdPlaceMap[slot.homeGroup] ?? null;
    }

    return { home, away };
  });
}
