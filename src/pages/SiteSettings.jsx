import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const emptyForm = () => ({
  team_photo_url: '',
  team_photo_alt: 'Santana Aroma Cleaning team',
  team_photo_public_id: '',
});

export default function SiteSettings() {
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .getSiteSettings()
      .then((data) => {
        setForm({
          team_photo_url: data.teamPhotoUrl || '',
          team_photo_alt: data.teamPhotoAlt || 'Santana Aroma Cleaning team',
          team_photo_public_id: data.teamPhotoPublicId || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(name, value) {
    setSuccess('');
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const result = await api.uploadImage(file);
      setForm((prev) => ({
        ...prev,
        team_photo_url: result.url,
        team_photo_public_id: result.public_id || '',
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  function handleRemovePhoto() {
    setSuccess('');
    setForm((prev) => ({
      ...prev,
      team_photo_url: '',
      team_photo_public_id: '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.updateSiteSettings({
        team_photo_url: form.team_photo_url.trim(),
        team_photo_alt: form.team_photo_alt.trim(),
        team_photo_public_id: form.team_photo_public_id.trim(),
      });
      setSuccess('Cambios guardados. La foto se actualizará en la página de inicio.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="loading-state">
        <i className="ri-loader-4-line" aria-hidden="true" /> Cargando ajustes…
      </p>
    );
  }

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero__title">Ajustes del sitio</h1>
        <p className="page-hero__subtitle">
          Administra la foto del equipo que aparece debajo del hero en la página de inicio.
        </p>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2 className="toolbar__title">Foto del equipo</h2>
          <Link to="/" className="btn btn-secondary">
            <i className="ri-arrow-left-line" aria-hidden="true" />
            <span className="btn-text">Volver</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Imagen del home</legend>
            <p className="hint">
              Se muestra en una sección compacta justo debajo del hero. Recomendado: foto horizontal del equipo completo.
            </p>

            <div className="form-group">
              <label htmlFor="team-photo-upload">Subir o cambiar foto</label>
              <input
                id="team-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading || saving}
              />
            </div>

            {form.team_photo_url && (
              <div className="form-group">
                <img
                  src={form.team_photo_url}
                  alt={form.team_photo_alt || 'Team preview'}
                  className="image-preview image-preview--wide"
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRemovePhoto}
                  disabled={uploading || saving}
                >
                  <i className="ri-delete-bin-line" aria-hidden="true" /> Quitar foto
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="team_photo_alt">Descripción de la imagen</label>
              <input
                id="team_photo_alt"
                value={form.team_photo_alt}
                onChange={(e) => updateField('team_photo_alt', e.target.value)}
                placeholder="Texto alternativo para accesibilidad y SEO"
              />
            </div>
          </fieldset>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              <i className="ri-save-line" aria-hidden="true" />
              <span className="btn-text">{saving ? 'Guardando…' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
