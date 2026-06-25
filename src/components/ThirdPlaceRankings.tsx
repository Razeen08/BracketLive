import type { StandingsMap, StandingEntry } from '../types/standings';
import './ThirdPlaceRankings.css';

interface Props {
  standings: StandingsMap;
}

function getAllThirds(standings: StandingsMap): Array<{ group: string; entry: StandingEntry }> {
  const thirds = Object.entries(standings)
    .map(([group, table]) => ({ group, entry: table?.[2] ?? null }))
    .filter((x): x is { group: string; entry: StandingEntry } => x.entry !== null);

  thirds.sort((a, b) => {
    const ae = a.entry, be = b.entry;
    if (be.points !== ae.points) return be.points - ae.points;
    if (be.goalDifference !== ae.goalDifference) return be.goalDifference - ae.goalDifference;
    return be.goalsFor - ae.goalsFor;
  });

  return thirds;
}

export function ThirdPlaceRankings({ standings }: Props) {
  const thirds = getAllThirds(standings);
  if (thirds.length === 0) return null;

  return (
    <section className="tp-section" aria-label="Third-Place Rankings">
      <h2 className="standings-heading">
        <span className="standings-heading-line" />
        Third-Place Rankings
        <span className="standings-heading-line" />
      </h2>

      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th className="tp-rank">#</th>
              <th className="tp-group">Grp</th>
              <th className="tp-team">Team</th>
              <th title="Played">P</th>
              <th title="Won">W</th>
              <th title="Drawn">D</th>
              <th title="Lost">L</th>
              <th title="Goals For">GF</th>
              <th title="Goals Against">GA</th>
              <th title="Goal Difference">GD</th>
              <th title="Points" className="tp-pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {thirds.map(({ group, entry }, idx) => {
              const qualifies = idx < 8;
              const cutoff = idx === 7 && thirds.length > 8;
              return (
                <tr
                  key={entry.team.id}
                  className={`${qualifies ? 'tp-row--qualifies' : 'tp-row--out'} ${cutoff ? 'tp-row--cutoff' : ''}`}
                >
                  <td className="tp-rank">{idx + 1}</td>
                  <td className="tp-group">Group {group}</td>
                  <td className="tp-team-cell">
                    <img
                      className="tp-crest"
                      src={entry.team.crest}
                      alt=""
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span>{entry.team.shortName || entry.team.name}</span>
                  </td>
                  <td>{entry.playedGames}</td>
                  <td>{entry.won}</td>
                  <td>{entry.draw}</td>
                  <td>{entry.lost}</td>
                  <td>{entry.goalsFor}</td>
                  <td>{entry.goalsAgainst}</td>
                  <td className={entry.goalDifference > 0 ? 'gd--pos' : entry.goalDifference < 0 ? 'gd--neg' : ''}>
                    {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                  </td>
                  <td className="tp-pts">{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="tp-legend">
        <span className="legend-dot legend-dot--best3rd" /> Qualifies for Round of 32
        <span className="legend-dot" style={{ background: 'var(--text-dim)' }} /> Eliminated
      </div>
    </section>
  );
}
