import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  api,
  apiServiceToForm,
  emptyServiceForm,
  formToApiPayload,
} from '../api';

export default function ServiceEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyServiceForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;

    setLoading(true);
    api
      .listServices()
      .then((services) => {
        const found = services.find((s) => String(s.id) === String(id));
        if (!found) throw new Error('Service not found');
        setForm(apiServiceToForm(found));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleMainImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const result = await api.uploadImage(file);
      updateField('image', result.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleGalleryUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const result = await api.uploadImage(file);
      setForm((prev) => ({
        ...prev,
        gallery: [...prev.gallery, { src: result.url, alt: '' }],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeGalleryItem(index) {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = formToApiPayload(form);
      if (isNew) {
        await api.createService(payload);
      } else {
        await api.updateService(id, payload);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="loading-state">
        <i className="ri-loader-4-line" aria-hidden="true" /> Loading service…
      </p>
    );
  }

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero__title">{isNew ? 'Nuevo servicio' : 'Editar servicio'}</h1>
        <p className="page-hero__subtitle">
          {isNew
            ? 'Completa los campos básicos. El resto se genera automáticamente para la web.'
            : `Editando: ${form.title || 'servicio'}`}
        </p>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2 className="toolbar__title">{isNew ? 'Datos del servicio' : form.title || 'Datos del servicio'}</h2>
          <Link to="/" className="btn btn-secondary">
            <i className="ri-arrow-left-line" aria-hidden="true" /> Volver al listado
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ej. Office Cleaning"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe el servicio. Puedes usar párrafos separados por una línea en blanco."
              rows={8}
              required
            />
            <p className="hint">
              Se usa en la tarjeta, la página del servicio, SEO y WhatsApp. El slug se crea desde el título.
            </p>
          </div>

          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Imagen principal</legend>
            <div className="form-group">
              <label htmlFor="image_alt">Descripción de la imagen</label>
              <input
                id="image_alt"
                value={form.image_alt}
                onChange={(e) => updateField('image_alt', e.target.value)}
                placeholder="Texto alternativo para accesibilidad y SEO"
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Subir imagen</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                disabled={uploading}
              />
              {form.image && (
                <img src={form.image} alt={form.image_alt || form.title} className="image-preview" />
              )}
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Galería de imágenes</legend>
            <div className="gallery-list">
              {form.gallery.map((item, index) => (
                <div className="gallery-item" key={`${item.src}-${index}`}>
                  <img src={item.src} alt="" className="thumb" />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeGalleryItem(index)}
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true" /> Quitar
                  </button>
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label htmlFor="gallery-upload">Agregar imagen a la galería</label>
              <input
                id="gallery-upload"
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={uploading}
              />
            </div>
          </fieldset>

          {error && <p className="error">{error}</p>}

          <div className="toolbar" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              <i className="ri-save-line" aria-hidden="true" />
              {saving ? 'Guardando…' : isNew ? 'Crear servicio' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
