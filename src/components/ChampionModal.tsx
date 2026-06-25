import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Team } from '../types/bracket';
import './ChampionModal.css';

interface Props {
  team: Team;
  onReset: () => void;
  onExit: () => void;
}

export function ChampionModal({ team, onReset, onExit }: Props) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Burst from both sides
    const burst = (x: number) =>
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { x, y: 0.6 },
        colors: ['#c9a84c', '#d9bc74', '#e8d09c', '#ffffff', '#003da5'],
      });

    burst(0.25);
    burst(0.75);

    // Continuous rain for 3s
    const end = Date.now() + 3000;
    const rain = () => {
      if (Date.now() > end) return;
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      requestAnimationFrame(rain);
    };
    rain();
  }, []);

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true" aria-label="Champion announcement">
      <div className="cm-box">
        <div className="cm-trophy" aria-hidden="true">🏆</div>
        <p className="cm-label">CHAMPIONS!</p>
        <div className="cm-team">
          {team.crest && (
            <img
              className="cm-crest"
              src={team.crest}
              alt=""
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <span className="cm-name">{team.name}</span>
        </div>
        <div className="cm-actions">
          <button className="cm-btn cm-btn--reset" onClick={onReset}>
            Reset picks
          </button>
          <button className="cm-btn cm-btn--exit" onClick={onExit}>
            Exit simulation
          </button>
        </div>
      </div>
    </div>
  );
}
