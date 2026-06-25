import './Header.css';

interface HeaderProps {
  lastUpdated: Date | null;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function Header({ lastUpdated }: HeaderProps) {
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

        {lastUpdated && (
          <span className="last-updated">
            Updated {formatTime(lastUpdated)}
          </span>
        )}
      </div>

      <div className="header-rule" />
    </header>
  );
}
