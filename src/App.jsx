import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ServiceEdit from './pages/ServiceEdit';
import ServicesList from './pages/ServicesList';
import SiteSettings from './pages/SiteSettings';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p className="loading-state">Loading…</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<ServicesList />} />
        <Route path="settings" element={<SiteSettings />} />
        <Route path="services/new" element={<ServiceEdit />} />
        <Route path="services/:id" element={<ServiceEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
