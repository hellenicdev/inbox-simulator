import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Spinner } from '../UI/Skeleton';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function loadTurnstileScript() {
  return new Promise((resolve) => {
    if (window.turnstile) return resolve();
    const cb = 'onTurnstileReady_' + Date.now();
    window[cb] = () => { resolve(); delete window[cb]; };
    const s = document.createElement('script');
    s.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${cb}&render=explicit`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const widgetRef = useRef(null);
  const turnstileId = useRef(null);
  const scriptLoaded = useRef(false);

  const renderWidget = useCallback(() => {
    if (!widgetRef.current || !window.turnstile) return;
    if (turnstileId.current) {
      try { window.turnstile.remove(turnstileId.current); } catch {}
      turnstileId.current = null;
    }
    widgetRef.current.innerHTML = '';
    try {
      turnstileId.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        theme: document.documentElement.getAttribute('data-theme') || 'light',
        retry: 'never',
        'error-callback': () => {
          setTurnstileFailed(true);
        },
        callback: () => {
          setTurnstileFailed(false);
        },
      });
      setTurnstileReady(true);
    } catch (e) {
      setTurnstileFailed(true);
    }
  }, []);

  const loadAndRender = useCallback(async () => {
    try {
      await loadTurnstileScript();
      renderWidget();
    } catch {
      setTurnstileFailed(true);
    }
  }, [renderWidget]);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    loadAndRender();
  }, [loadAndRender]);

  useEffect(() => {
    if (window.turnstile) renderWidget();
  }, [mode, renderWidget]);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (window.turnstile && widgetRef.current) {
        try {
          window.turnstile.render(widgetRef.current, {
            sitekey: SITE_KEY,
            theme: theme || 'light',
          });
        } catch {}
      }
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    let token = '';
    if (window.turnstile && turnstileId.current) {
      try {
        token = window.turnstile.getResponse(turnstileId.current) || '';
      } catch {}
    }

    try {
      const fn = mode === 'login' ? api.login : api.register;
      const data = await fn(email, password, token);
      login(data.token, data.email);
    } catch (err) {
      setError(err.message);
      if (window.turnstile && turnstileId.current) {
        try { window.turnstile.reset(turnstileId.current); } catch {}
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
        {turnstileFailed && (
          <div className="auth-error" style={{ fontSize: '12px', marginBottom: 0 }}>
            Security check unavailable — reload to retry.
          </div>
        )}
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
          <div ref={widgetRef} style={{ marginBottom: '12px', minHeight: '65px' }} />
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
