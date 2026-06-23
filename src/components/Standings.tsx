import type { StandingsMap, StandingEntry } from '../types/standings';
import './Standings.css';

interface Props {
  standings: StandingsMap;
}

/** Returns the 8 best 3rd-place entries sorted by points, GD, GF. */
function getBest3rdTeams(standings: StandingsMap): Set<number> {
  const thirds: StandingEntry[] = Object.values(standings)
    .map((table) => table[2])
    .filter(Boolean);

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return new Set(thirds.slice(0, 8).map((e) => e.team.id));
}

function TeamCell({ entry }: { entry: StandingEntry }) {
  return (
    <td className="st-team-cell">
      <img
        className="st-crest"
        src={entry.team.crest}
        alt=""
        loading="lazy"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      <span className="st-team-name">{entry.team.shortName || entry.team.name}</span>
    </td>
  );
}

export function Standings({ standings }: Props) {
  const groups = Object.keys(standings).sort();
  const best3rdIds = getBest3rdTeams(standings);

  return (
    <section className="standings-section" aria-label="Group Standings">
      <h2 className="standings-heading">
        <span className="standings-heading-line" />
        Group Standings
        <span className="standings-heading-line" />
      </h2>

      <div className="standings-grid">
        {groups.map((letter) => {
          const table = standings[letter];
          return (
            <div key={letter} className="group-card">
              <div className="group-card-header">Group {letter}</div>
              <table className="st-table" aria-label={`Group ${letter} standings`}>
                <thead>
                  <tr>
                    <th className="st-pos">#</th>
                    <th className="st-team">Team</th>
                    <th title="Played">P</th>
                    <th title="Won">W</th>
                    <th title="Drawn">D</th>
                    <th title="Lost">L</th>
                    <th title="Goal Difference">GD</th>
                    <th title="Points" className="st-pts">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((entry) => {
                    const pos = entry.position;
                    const isQ2 = pos <= 2;          // auto-qualifies
                    const isB3 = !isQ2 && best3rdIds.has(entry.team.id); // current best 3rd
                    return (
                      <tr
                        key={entry.team.id}
                        className={isQ2 ? 'row--qualified' : isB3 ? 'row--best3rd' : ''}
                      >
                        <td className="st-pos">{pos}</td>
                        <TeamCell entry={entry} />
                        <td>{entry.playedGames}</td>
                        <td>{entry.won}</td>
                        <td>{entry.draw}</td>
                        <td>{entry.lost}</td>
                        <td className={entry.goalDifference > 0 ? 'gd--pos' : entry.goalDifference < 0 ? 'gd--neg' : ''}>
                          {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                        </td>
                        <td className="st-pts">{entry.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="standings-legend">
        <span className="legend-dot legend-dot--qualified" /> Advances to Round of 32
        <span className="legend-dot legend-dot--best3rd" /> Currently best 3rd (top 8 qualify)
      </div>
    </section>
  );
}
