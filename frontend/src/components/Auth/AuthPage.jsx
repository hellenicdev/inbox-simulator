import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Spinner } from '../UI/Skeleton';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const widgetRef = useRef(null);
  const turnstileId = useRef(null);

  useEffect(() => {
    const render = () => {
      if (!window.turnstile || widgetRef.current) return;
      turnstileId.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        theme: document.documentElement.getAttribute('data-theme') || 'light',
      });
    };
    if (window.turnstile) {
      render();
    } else {
      window.addEventListener('load', render);
      return () => window.removeEventListener('load', render);
    }
  }, [mode]);

  useEffect(() => {
    if (window.turnstile && turnstileId.current) {
      window.turnstile.reset(turnstileId.current);
    }
  }, [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = window.turnstile ? window.turnstile.getResponse() : '';
    if (window.turnstile && !token) {
      setError('Please complete the security check.');
      setLoading(false);
      return;
    }

    try {
      const fn = mode === 'login' ? api.login : api.register;
      const data = await fn(email, password, token);
      login(data.token, data.email);
    } catch (err) {
      setError(err.message);
      if (window.turnstile && turnstileId.current) {
        window.turnstile.reset(turnstileId.current);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Executive Inbox</h1>
        <p>Gmail-style AI-powered inbox simulation</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <div ref={widgetRef} style={{ marginBottom: '12px' }} />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="auth-toggle">
          {mode === 'login' ? (
            <>No account? <button onClick={() => { setMode('register'); setError(''); }}>Create one</button></>
          ) : (
            <>Already have one? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
