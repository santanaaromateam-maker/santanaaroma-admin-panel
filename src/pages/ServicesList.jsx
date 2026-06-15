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
            <i className="ri-add-line" aria-hidden="true" />
            <span className="btn-text">New service</span>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <i className="ri-sparkling-2-line" aria-hidden="true" />
            <p>No services yet. Create the first one to populate the website.</p>
            <Link to="/services/new" className="btn btn-primary empty-state__cta">
              <i className="ri-add-line" aria-hidden="true" />
              <span className="btn-text">Create service</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="service-cards" aria-label="Services list">
              {services.map((service) => (
                <article key={service.id} className="service-card">
                  <div className="service-card__media">
                    {service.image ? (
                      <img src={service.image} alt="" className="service-card__thumb" />
                    ) : (
                      <div className="service-card__thumb service-card__thumb--empty" aria-hidden="true">
                        <i className="ri-image-line" />
                      </div>
                    )}
                  </div>
                  <div className="service-card__body">
                    <div className="service-card__head">
                      <h3 className="service-card__title">{service.title}</h3>
                      <span className={`badge ${service.active ? 'badge--on' : 'badge--off'}`}>
                        {service.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="service-card__slug"><code>{service.slug}</code></p>
                    <div className="service-card__actions">
                      <Link to={`/services/${service.id}`} className="btn btn-secondary">
                        <i className="ri-edit-line" aria-hidden="true" />
                        <span className="btn-text">Edit</span>
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(service.id, service.title)}
                      >
                        <i className="ri-delete-bin-line" aria-hidden="true" />
                        <span className="btn-text">Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="table-wrap services-table">
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
                      <td className="table__actions">
                        <Link to={`/services/${service.id}`} className="btn btn-secondary">
                          <i className="ri-edit-line" aria-hidden="true" />
                          <span className="btn-text">Edit</span>
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDelete(service.id, service.title)}
                        >
                          <i className="ri-delete-bin-line" aria-hidden="true" />
                          <span className="btn-text">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
