import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.listServices();
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <p className="loading-state"><i className="ri-loader-4-line" aria-hidden="true" /> Loading services…</p>;
  }

  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero__title">Services</h1>
        <p className="page-hero__subtitle">Create and edit the services shown on the public website.</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2 className="toolbar__title">All services</h2>
          <Link to="/services/new" className="btn btn-primary">
            <i className="ri-add-line" aria-hidden="true" /> New service
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <i className="ri-sparkling-2-line" aria-hidden="true" />
            <p>No services yet. Create the first one to populate the website.</p>
            <Link to="/services/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <i className="ri-add-line" aria-hidden="true" /> Create service
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      {service.image ? (
                        <img src={service.image} alt="" className="thumb" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{service.title}</td>
                    <td><code>{service.slug}</code></td>
                    <td>{service.order}</td>
                    <td>
                      <span className={`badge ${service.active ? 'badge--on' : 'badge--off'}`}>
                        {service.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/services/${service.id}`} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
                        <i className="ri-edit-line" aria-hidden="true" /> Edit
                      </Link>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(service.id, service.title)}>
                        <i className="ri-delete-bin-line" aria-hidden="true" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
