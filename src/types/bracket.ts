export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED';

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
  fullTime: { home: number | null; away: number | null };
  extraTime: { home: number | null; away: number | null };
  penalties: { home: number | null; away: number | null };
}

export interface Match {
  id: number;
  stage: string;
  status: MatchStatus;
  utcDate: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  score: Score;
  matchday: number | null;
}

export interface BracketRound {
  stage: string;
  name: string;
  matches: Match[];
}

export interface BracketData {
  rounds: BracketRound[];
  thirdPlace: Match | null;
  champion: Team | null;
}
