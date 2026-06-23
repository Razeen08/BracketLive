import type { Match } from '../types/bracket';
import { MatchCard } from './MatchCard';
import './ThirdPlace.css';

interface Props {
  match: Match;
}

export function ThirdPlace({ match }: Props) {
  return (
    <div className="third-place">
      <h3 className="third-place-label">3rd Place Play-off</h3>
      <MatchCard
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        score={match.score}
        status={match.status}
        utcDate={match.utcDate}
      />
    </div>
  );
}
