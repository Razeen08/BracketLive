import './Header.css';

interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function Header({ lastUpdated, onRefresh, isLoading }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-trophy" aria-hidden="true">🏆</span>
          <div>
            <h1 className="header-title">BracketLive</h1>
            <p className="header-subtitle">FIFA World Cup 2026 · Knockout Bracket</p>
          </div>
        </div>

        <div className="header-controls">
          {lastUpdated && (
            <span className="last-updated">
              Updated {formatTime(lastUpdated)}
            </span>
          )}
          <button
            className={`refresh-btn ${isLoading ? 'refresh-btn--spinning' : ''}`}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh bracket"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 4v6h6" />
              <path d="M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="header-rule" />
    </header>
  );
}
