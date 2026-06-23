import { Fragment } from 'react';
import type { BracketRound, Match } from '../types/bracket';
import type { SimPicks } from '../utils/simulation';
import { MatchCard } from './MatchCard';
import './Bracket.css';

// ── Layout constants (must match CSS custom properties) ──────
const SLOT_H = 72;    // --slot-h
const CARD_H = 64;    // --card-h
const CARD_W = 240;   // --card-w
const CONNECTOR_W = 20; // --connector-w
const ROUND_GAP = 40;   // --round-gap
// Horizontal stub reaches the centre of the gap between columns
const STUB_W = CONNECTOR_W + ROUND_GAP / 2; // 40 px
const BRACKET_H = 16 * SLOT_H; // 1152 px

/**
 * Y-coordinate of the centre of match `matchIndex` in round `roundIndex`.
 *   roundIndex: 0=R32, 1=R16, 2=QF, 3=SF, 4=Final
 */
function matchCenterY(roundIndex: number, matchIndex: number): number {
  const slotsPerMatch = Math.pow(2, roundIndex);
  return (matchIndex * slotsPerMatch + slotsPerMatch / 2) * SLOT_H;
}

/** Absolute top of a card centred on `cy`. */
function cardTop(cy: number): number {
  return cy - CARD_H / 2;
}

interface RoundColumnProps {
  round: BracketRound;
  roundIndex: number;
  isLast: boolean;
  simulateMode: boolean;
  simPicks: SimPicks;
  onSimulatePick: (matchId: number, side: 'home' | 'away') => void;
  thirdPlaceMatch?: Match | null;
}

function RoundColumn({
  round, roundIndex, isLast, simulateMode, simPicks, onSimulatePick, thirdPlaceMatch,
}: RoundColumnProps) {
  return (
    <div className="round-column">
      <h2 className="round-label">{round.name}</h2>

      <div className="round-body" style={{ height: BRACKET_H }}>
        {round.matches.map((match, i) => {
          const cy = matchCenterY(roundIndex, i);
          const showVertConnector = i % 2 === 0 && !isLast;
          const vertH = Math.pow(2, roundIndex) * SLOT_H;

          return (
            <Fragment key={match.id}>
              {/* ← Left horizontal stub (connects to vert connector from previous column) */}
              {roundIndex > 0 && (
                <div
                  className="connector connector--h"
                  style={{ position: 'absolute', top: cy - 1, left: -STUB_W, width: STUB_W }}
                />
              )}

              {/* Match card */}
              <div className="match-slot" style={{ top: cardTop(cy), position: 'absolute' }}>
                <MatchCard
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  score={match.score}
                  status={match.status}
                  utcDate={match.utcDate}
                  simulateMode={simulateMode}
                  simulatedWinner={simPicks[match.id] ?? null}
                  onSimulatePick={(side) => onSimulatePick(match.id, side)}
                />
              </div>

              {/* → Right horizontal stub */}
              {!isLast && (
                <div
                  className="connector connector--h"
                  style={{ position: 'absolute', top: cy - 1, left: CARD_W, width: STUB_W }}
                />
              )}

              {/* Vertical connector: only the top card of each pair, not in Final */}
              {showVertConnector && (
                <div
                  className="connector connector--v"
                  style={{
                    position: 'absolute',
                    top: cy,
                    left: CARD_W + STUB_W - 1, // 1 px overlap with stubs
                    width: 2,
                    height: vertH,
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* 3rd-place play-off: shown below the Final column only */}
      {isLast && !simulateMode && thirdPlaceMatch && (
        <div className="third-place-col">
          <span className="third-place-col-label">3rd Place Play-off</span>
          <MatchCard
            homeTeam={thirdPlaceMatch.homeTeam}
            awayTeam={thirdPlaceMatch.awayTeam}
            score={thirdPlaceMatch.score}
            status={thirdPlaceMatch.status}
            utcDate={thirdPlaceMatch.utcDate}
          />
        </div>
      )}
    </div>
  );
}

interface BracketProps {
  rounds: BracketRound[];
  simulateMode: boolean;
  simPicks: SimPicks;
  onSimulatePick: (matchId: number, side: 'home' | 'away') => void;
  thirdPlace: Match | null;
}

export function Bracket({ rounds, simulateMode, simPicks, onSimulatePick, thirdPlace }: BracketProps) {
  return (
    <section className="bracket-section" aria-label="Knockout bracket">
      <div className="bracket-scroll">
        <div className="bracket-body">
          {rounds.map((round, i) => (
            <RoundColumn
              key={round.stage}
              round={round}
              roundIndex={i}
              isLast={i === rounds.length - 1}
              simulateMode={simulateMode}
              simPicks={simPicks}
              onSimulatePick={onSimulatePick}
              thirdPlaceMatch={i === rounds.length - 1 ? thirdPlace : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
