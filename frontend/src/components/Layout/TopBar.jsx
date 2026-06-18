import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../UI/Skeleton';
import { RefreshIcon, SunIcon, MoonIcon } from '../UI/Icons';

export default function TopBar({ search, onSearchChange, onRefresh, refreshing, theme, onToggleTheme }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-logo">Executive Inbox</div>
      <div className="topbar-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search emails..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? <Spinner /> : <RefreshIcon />} Refresh
        </button>
        <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Logout {user?.email}
        </button>
      </div>
    </header>
  );
}
