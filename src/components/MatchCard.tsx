import type { MatchStatus, Score, Team } from '../types/bracket';
import './MatchCard.css';

interface Props {
  homeTeam: Team | null;
  awayTeam: Team | null;
  score: Score;
  status: MatchStatus;
  utcDate: string;
  /** When true, team rows are clickable to simulate picking a winner */
  simulateMode?: boolean;
  /** Which side was picked as winner in simulation */
  simulatedWinner?: 'home' | 'away' | null;
  onSimulatePick?: (side: 'home' | 'away') => void;
}

function getWinnerSide(score: Score): 'home' | 'away' | null {
  if (!score.winner) return null;
  if (score.winner === 'HOME_TEAM') return 'home';
  if (score.winner === 'AWAY_TEAM') return 'away';
  return null;
}

function formatMatchDate(utcDate: string): string {
  if (!utcDate) return 'TBD';
  const d = new Date(utcDate);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function getScoreDisplay(score: Score): { home: string; away: string } {
  const h = score.fullTime.home;
  const a = score.fullTime.away;
  if (h === null || a === null) return { home: '–', away: '–' };

  // Show penalty scores if match went to shootout
  if (score.duration === 'PENALTY_SHOOTOUT' && score.penalties.home !== null) {
    return {
      home: `${h} (${score.penalties.home})`,
      away: `${a} (${score.penalties.away})`,
    };
  }
  return { home: String(h), away: String(a) };
}

function StatusBadge({ status, utcDate, simulateMode }: { status: MatchStatus; utcDate: string; simulateMode?: boolean }) {
  if (simulateMode) return <span className="badge badge--sim">SIM</span>;
  if (status === 'IN_PLAY' || status === 'PAUSED') {
    return <span className="badge badge--live">● LIVE</span>;
  }
  if (status === 'FINISHED') {
    return <span className="badge badge--ft">FT</span>;
  }
  if (status === 'SCHEDULED' || status === 'TIMED') {
    if (!utcDate) return null;
    return <span className="badge badge--scheduled">{formatMatchDate(utcDate)}</span>;
  }
  return null;
}

export function MatchCard({
  homeTeam, awayTeam, score, status, utcDate,
  simulateMode = false,
  simulatedWinner = null,
  onSimulatePick,
}: Props) {
  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFinished = status === 'FINISHED';
  // Real winner from API
  const apiWinner = getWinnerSide(score);
  // For display: sim pick overrides API result in simulate mode
  const displayWinner = simulateMode ? simulatedWinner : apiWinner;
  const scoreDisplay = getScoreDisplay(score);

  function rowClass(side: 'home' | 'away') {
    if (displayWinner === side) return 'winner';
    if (displayWinner && displayWinner !== side) return 'loser';
    return '';
  }

  function handleTeamClick(side: 'home' | 'away') {
    if (simulateMode && onSimulatePick) {
      onSimulatePick(side);
    }
  }

  const canSimHome = simulateMode && !!homeTeam;
  const canSimAway = simulateMode && !!awayTeam;

  return (
    <div className={`match-card ${isLive ? 'match-card--live' : ''} ${isFinished ? 'match-card--finished' : ''} ${simulateMode ? 'match-card--simulate' : ''}`}>
      <div
        className={`team-row ${rowClass('home')} ${canSimHome ? 'team-row--clickable' : ''}`}
        onClick={canSimHome ? () => handleTeamClick('home') : undefined}
        role={canSimHome ? 'button' : undefined}
        tabIndex={canSimHome ? 0 : undefined}
        onKeyDown={canSimHome ? (e) => e.key === 'Enter' && handleTeamClick('home') : undefined}
        title={canSimHome ? `Pick ${homeTeam?.shortName ?? homeTeam?.name} to advance` : undefined}
      >
        <TeamFlag team={homeTeam} />
        <span className="team-name">{homeTeam?.shortName ?? homeTeam?.name ?? 'TBD'}</span>
        <span className="team-score">{simulateMode ? '' : scoreDisplay.home}</span>
      </div>

      <div className="match-divider">
        <StatusBadge status={status} utcDate={utcDate} simulateMode={simulateMode} />
      </div>

      <div
        className={`team-row ${rowClass('away')} ${canSimAway ? 'team-row--clickable' : ''}`}
        onClick={canSimAway ? () => handleTeamClick('away') : undefined}
        role={canSimAway ? 'button' : undefined}
        tabIndex={canSimAway ? 0 : undefined}
        onKeyDown={canSimAway ? (e) => e.key === 'Enter' && handleTeamClick('away') : undefined}
        title={canSimAway ? `Pick ${awayTeam?.shortName ?? awayTeam?.name} to advance` : undefined}
      >
        <TeamFlag team={awayTeam} />
        <span className="team-name">{awayTeam?.shortName ?? awayTeam?.name ?? 'TBD'}</span>
        <span className="team-score">{simulateMode ? '' : scoreDisplay.away}</span>
      </div>
    </div>
  );
}

function TeamFlag({ team }: { team: Team | null }) {
  // No team at all
  if (!team) {
    return <span className="team-flag team-flag--tbd" aria-hidden="true">?</span>;
  }
  // Label-only team (no crest) — show a subtle dash
  if (!team.crest) {
    return <span className="team-flag team-flag--label" aria-hidden="true" />;
  }
  return (
    <img
      className="team-flag"
      src={team.crest}
      alt={`${team.name} flag`}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        const span = document.createElement('span');
        span.className = 'team-flag team-flag--text';
        span.textContent = team.tla;
        target.parentElement?.insertBefore(span, target);
      }}
    />
  );
}
