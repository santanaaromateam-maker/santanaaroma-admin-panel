import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  api,
  apiServiceToForm,
  emptyServiceForm,
  formToApiPayload,
} from '../api';

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

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
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'title' && isNew && !prev.slug) {
        next.slug = slugify(value);
      }
      if (name === 'title' && !prev.chip_label) {
        next.chip_label = value;
      }
      return next;
    });
  }

  async function handleImageUpload(e, targetField = 'image') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const result = await api.uploadImage(file);
      updateField(targetField, result.url);
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

  function updateGalleryAlt(index, alt) {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item, i) => (i === index ? { ...item, alt } : item)),
    }));
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
    return <p className="loading-state"><i className="ri-loader-4-line" aria-hidden="true" /> Loading service…</p>;
  }

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero__title">{isNew ? 'New service' : 'Edit service'}</h1>
        <p className="page-hero__subtitle">
          {isNew ? 'Add a new cleaning service to the website.' : `Editing /services/${form.slug || '…'}/`}
        </p>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2 className="toolbar__title">{isNew ? 'Service details' : form.title || 'Service details'}</h2>
          <Link to="/" className="btn btn-secondary">
            <i className="ri-arrow-left-line" aria-hidden="true" /> Back to list
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Basic info</legend>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="slug">Slug *</label>
                <input id="slug" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} required />
                <p className="hint">URL: /services/{form.slug || 'your-slug'}/</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="chip_label">Chip label (nav strip)</label>
                <input id="chip_label" value={form.chip_label} onChange={(e) => updateField('chip_label', e.target.value)} />
              </div>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label htmlFor="order">Order</label>
                  <input id="order" type="number" value={form.order} onChange={(e) => updateField('order', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="active">Visible on website</label>
                  <select id="active" value={form.active ? 'true' : 'false'} onChange={(e) => updateField('active', e.target.value === 'true')}>
                    <option value="true">Active</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="short_description">Short description *</label>
              <textarea id="short_description" value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} required />
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Card image</legend>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input id="image" value={form.image} onChange={(e) => updateField('image', e.target.value)} placeholder="https://res.cloudinary.com/..." />
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} disabled={uploading} />
                <p className="hint">Upload goes to Cloudinary when configured in backend .env</p>
              </div>
              <div className="form-group">
                <label htmlFor="image_alt">Image alt text</label>
                <input id="image_alt" value={form.image_alt} onChange={(e) => updateField('image_alt', e.target.value)} />
                {form.image && <img src={form.image} alt="" className="image-preview" />}
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Detail page</legend>
            <div className="form-group">
              <label htmlFor="hero_title">Hero title (HTML allowed for &lt;span&gt;)</label>
              <input id="hero_title" value={form.hero_title} onChange={(e) => updateField('hero_title', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="hero_subtitle">Hero subtitle</label>
              <textarea id="hero_subtitle" value={form.hero_subtitle} onChange={(e) => updateField('hero_subtitle', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="meta_description">Meta description (SEO)</label>
              <textarea id="meta_description" value={form.meta_description} onChange={(e) => updateField('meta_description', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="intro">Intro paragraphs (one per line)</label>
              <textarea id="intro" value={form.intro} onChange={(e) => updateField('intro', e.target.value)} rows={5} />
            </div>
            <div className="form-group">
              <label htmlFor="service_areas">Service areas (one per line)</label>
              <textarea id="service_areas" value={form.service_areas} onChange={(e) => updateField('service_areas', e.target.value)} rows={4} />
            </div>
            <div className="form-group">
              <label htmlFor="whatsapp_text">WhatsApp pre-filled message</label>
              <input id="whatsapp_text" value={form.whatsapp_text} onChange={(e) => updateField('whatsapp_text', e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="form-fieldset__legend">Gallery</legend>
            <div className="gallery-list">
              {form.gallery.map((item, index) => (
                <div className="gallery-item" key={`${item.src}-${index}`}>
                  <img src={item.src} alt="" className="thumb" />
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={item.alt}
                    onChange={(e) => updateGalleryAlt(index, e.target.value)}
                  />
                  <button type="button" className="btn btn-danger" onClick={() => removeGalleryItem(index)}>
                    <i className="ri-delete-bin-line" aria-hidden="true" /> Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Add gallery image</label>
              <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploading} />
            </div>
          </fieldset>

          {error && <p className="error">{error}</p>}

          <div className="toolbar" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              <i className="ri-save-line" aria-hidden="true" />
              {saving ? 'Saving…' : isNew ? 'Create service' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
