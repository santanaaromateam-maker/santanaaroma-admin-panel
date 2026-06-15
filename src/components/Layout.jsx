import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const LOGO_URL = '/icon/android-chrome-192x192.png';

export default function Layout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const onList = location.pathname === '/';

  return (
    <div className="app-shell">
      <header className="admin-header">
        <Link to="/" className="admin-header__brand">
          <img src={LOGO_URL} alt="Santana Aroma" className="admin-header__logo" />
          <div>
            <div className="admin-header__title">Santana Aroma</div>
            <div className="admin-header__subtitle">Admin Panel</div>
          </div>
        </Link>
        <div className="admin-header__actions">
          {admin && <span className="admin-header__email">{admin.email}</span>}
          <Link to="/" className={`btn ${onList ? 'btn-primary' : 'btn-secondary'}`} aria-label="Services list">
            <i className="ri-list-check" aria-hidden="true" />
            <span className="btn-text">Services</span>
          </Link>
          <Link to="/services/new" className="btn btn-primary" aria-label="New service">
            <i className="ri-add-line" aria-hidden="true" />
            <span className="btn-text">New</span>
          </Link>
          <button type="button" className="btn btn-secondary" onClick={logout} aria-label="Log out">
            <i className="ri-logout-box-r-line" aria-hidden="true" />
            <span className="btn-text">Log out</span>
          </button>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <h3 className="footer-heading">Santana Aroma</h3>
            <p className="footer-text">Manage services shown on santanaaromateam.com</p>
          </div>
          <div>
            <h3 className="footer-heading">Links</h3>
            <a className="footer-link" href="http://localhost:8001/" target="_blank" rel="noopener noreferrer">
              View website
            </a>
            <a className="footer-link" href="http://localhost:8001/our-services/" target="_blank" rel="noopener noreferrer">
              Our Services page
            </a>
          </div>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Santana Aroma Cleaning Services LLC.</p>
      </footer>
    </div>
  );
}
