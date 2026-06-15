import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const LOGO_URL = '/icon/android-chrome-192x192.png';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page app-shell">
      <header className="admin-header">
        <div className="admin-header__brand">
          <img src={LOGO_URL} alt="Santana Aroma" className="admin-header__logo" />
          <div>
            <div className="admin-header__title">Santana Aroma</div>
            <div className="admin-header__subtitle">Admin Panel</div>
          </div>
        </div>
      </header>

      <main className="login-page__main">
        <div className="card login-card">
          <img src={LOGO_URL} alt="" className="login-card__icon" aria-hidden="true" />
          <h1>Admin login</h1>
          <p>Sign in to manage cleaning services for the website</p>

          <form onSubmit={handleSubmit}>
            <fieldset className="form-fieldset">
              <legend className="form-fieldset__legend">Credentials</legend>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="admin@santanaaromateam.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                <i className="ri-login-box-line" aria-hidden="true" />
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </fieldset>
          </form>
        </div>
      </main>

      <footer className="site-footer">
        <p className="footer-copy">&copy; {new Date().getFullYear()} Santana Aroma Cleaning Services LLC.</p>
      </footer>
    </div>
  );
}
