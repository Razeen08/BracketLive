export interface StandingEntry {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  points: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GroupStanding {
  stage: string;  // e.g. "GROUP_STAGE"
  type: string;   // "TOTAL" | "HOME" | "AWAY"
  group: string;  // e.g. "GROUP_A"
  table: StandingEntry[];
}

/** Map from group letter → sorted table */
export type StandingsMap = Record<string, StandingEntry[]>;
