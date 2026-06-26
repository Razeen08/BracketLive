import { useState, useCallback, useMemo } from 'react';
import { useBracket } from './hooks/useBracket';
import { useStandings } from './hooks/useStandings';
import { useGroupMatches } from './hooks/useGroupMatches';
import { useMeta } from './hooks/useMeta';
import { Header } from './components/Header';
import { Bracket } from './components/Bracket';
import { Champion } from './components/Champion';
import { SimulateBar } from './components/SimulateBar';
import { Standings } from './components/Standings';
import { ThirdPlaceRankings } from './components/ThirdPlaceRankings';
import { ChampionModal } from './components/ChampionModal';
import { applySimulation } from './utils/simulation';
import { computeLiveStandings } from './utils/liveStandings';
import type { SimPicks } from './utils/simulation';
import './App.css';

export default function App() {
  const { data: standings } = useStandings();
  const { data: groupMatches } = useGroupMatches();
  const { data: meta } = useMeta();
  const { data, isLoading, isError, error } = useBracket(standings ?? null);

  // Detect which teams are currently in a live match (for the LIVE badge only).
  // Do NOT overlay scores — the standings API already updates in real time.
  const { liveTeamIds, liveScores } = useMemo(() => {
    if (!groupMatches) return { liveTeamIds: new Set<number>(), liveScores: new Map<number, string>() };
    const { liveTeamIds, liveScores } = computeLiveStandings(standings ?? {}, groupMatches);
    return { liveTeamIds, liveScores };
  }, [standings, groupMatches]);

  const [simulateMode, setSimulateMode] = useState(false);
  const [simPicks, setSimPicks] = useState<SimPicks>({});

  const handleSimulatePick = useCallback((matchId: number, side: 'home' | 'away') => {
    setSimPicks((prev) => {
      // Toggle off if same pick is clicked again
      if (prev[matchId] === side) {
        const next = { ...prev };
        delete next[matchId];
        // Remove all picks that are downstream of this one (clear forward)
        return next;
      }
      return { ...prev, [matchId]: side };
    });
  }, []);

  // Apply simulation picks to a deep clone of the bracket rounds
  const simulatedRounds = useMemo(() => {
    if (!data) return null;
    if (!simulateMode || Object.keys(simPicks).length === 0) return data.rounds;
    return applySimulation(data.rounds, simPicks);
  }, [data, simulateMode, simPicks]);

  const displayRounds = simulatedRounds ?? data?.rounds ?? null;

  // Detect simulated champion: final round's match winner when picked
  const simChampion = useMemo(() => {
    if (!simulateMode || !displayRounds) return null;
    const finalRound = displayRounds[displayRounds.length - 1];
    const finalMatch = finalRound?.matches?.[0];
    if (!finalMatch || !simPicks[finalMatch.id]) return null;
    return simPicks[finalMatch.id] === 'home' ? finalMatch.homeTeam : finalMatch.awayTeam;
  }, [simulateMode, displayRounds, simPicks]);

  const [modalDismissed, setModalDismissed] = useState(false);
  const showModal = simulateMode && !!simChampion && !modalDismissed;

  const handleResetSim = useCallback(() => {
    setSimPicks({});
    setModalDismissed(false);
  }, []);

  const handleToggleSimulate = useCallback(() => {
    setSimulateMode((v) => {
      if (v) setModalDismissed(false);
      return !v;
    });
  }, []);

  return (
    <div className="app">
      <Header
        lastUpdated={meta?.fetchedAt ? new Date(meta.fetchedAt) : null}
      />
      <SimulateBar
        isActive={simulateMode}
        onToggle={handleToggleSimulate}
        onReset={handleResetSim}
        haspicks={Object.keys(simPicks).length > 0}
      />

      <main className="app-main">
        {isError && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <span>{(error as Error).message}</span>
          </div>
        )}

        {isLoading && !data && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading bracket…</p>
          </div>
        )}

        {data && displayRounds && (
          <>
            {data.champion && !simulateMode && <Champion team={data.champion} />}
            <Bracket
              rounds={displayRounds}
              simulateMode={simulateMode}
              simPicks={simPicks}
              onSimulatePick={handleSimulatePick}
              thirdPlace={data.thirdPlace ?? null}
            />
            {standings && Object.keys(standings).length > 0 && (
              <Standings standings={standings} liveTeamIds={liveTeamIds} liveScores={liveScores} />
            )}
            {standings && Object.keys(standings).length > 0 && (
              <ThirdPlaceRankings standings={standings} liveTeamIds={liveTeamIds} liveScores={liveScores} />
            )}
          </>
        )}
      </main>
      {showModal && simChampion && (
        <ChampionModal
          team={simChampion}
          onReset={handleResetSim}
          onExit={() => { setSimulateMode(false); setModalDismissed(false); }}
        />
      )}
    </div>
  );
}
