import './SimulateBar.css';

interface Props {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  haspicks: boolean;
}

export function SimulateBar({ isActive, onToggle, onReset, haspicks }: Props) {
  return (
    <div className={`simulate-bar ${isActive ? 'simulate-bar--active' : ''}`}>
      <div className="simulate-bar-inner">
        <div className="simulate-bar-left">
          <span className="simulate-icon" aria-hidden="true">⚡</span>
          <div>
            <p className="simulate-title">Simulate Mode</p>
            <p className="simulate-desc">
              {isActive
                ? 'Click a team in any match to pick them as the winner'
                : 'Pick your own winners and see your predicted path to the Final'}
            </p>
          </div>
        </div>
        <div className="simulate-bar-controls">
          {isActive && haspicks && (
            <button className="simulate-btn simulate-btn--reset" onClick={onReset}>
              Reset picks
            </button>
          )}
          <button
            className={`simulate-btn ${isActive ? 'simulate-btn--off' : 'simulate-btn--on'}`}
            onClick={onToggle}
          >
            {isActive ? 'Stop Simulating' : 'Simulate'}
          </button>
        </div>
      </div>
    </div>
  );
}
