import type { Team } from '../types/bracket';
import './Champion.css';

interface Props {
  team: Team;
}

export function Champion({ team }: Props) {
  return (
    <div className="champion-banner" role="status" aria-label={`World Cup 2026 Champion: ${team.name}`}>
      <div className="champion-inner">
        <div className="champion-trophy" aria-hidden="true">🏆</div>
        <div className="champion-info">
          <p className="champion-label">World Cup 2026 Champion</p>
          <div className="champion-team">
            <img
              className="champion-flag"
              src={team.crest}
              alt={`${team.name} crest`}
            />
            <span className="champion-name">{team.name}</span>
          </div>
        </div>
        <div className="champion-trophy" aria-hidden="true">🏆</div>
      </div>
    </div>
  );
}
