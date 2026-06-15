const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getToken() {
  return localStorage.getItem('santana_token');
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
      : detail || data.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/api/auth/me'),

  listServices: () => request('/api/admin/services'),

  createService: (payload) =>
    request('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateService: (id, payload) =>
    request(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteService: (id) =>
    request(`/api/admin/services/${id}`, { method: 'DELETE' }),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/api/admin/upload', { method: 'POST', body: form });
  },
};

export function apiServiceToForm(service) {
  if (!service) return emptyServiceForm();
  return {
    slug: service.slug || '',
    title: service.title || '',
    short_description: service.shortDescription || service.short_description || '',
    chip_label: service.chipLabel || service.chip_label || '',
    order: service.order ?? 0,
    active: service.active ?? true,
    image: service.image || '',
    image_alt: service.imageAlt || service.image_alt || '',
    hero_title: service.heroTitle || service.hero_title || '',
    hero_subtitle: service.heroSubtitle || service.hero_subtitle || '',
    meta_description: service.metaDescription || service.meta_description || '',
    intro: (service.intro || []).join('\n'),
    service_areas: (service.serviceAreas || service.service_areas || []).join('\n'),
    whatsapp_text: service.whatsappText || service.whatsapp_text || '',
    gallery: service.gallery || [],
  };
}

export function formToApiPayload(form) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    short_description: form.short_description.trim(),
    chip_label: form.chip_label.trim() || form.title.trim(),
    order: Number(form.order) || 0,
    active: Boolean(form.active),
    image: form.image.trim(),
    image_alt: form.image_alt.trim(),
    hero_title: form.hero_title.trim(),
    hero_subtitle: form.hero_subtitle.trim(),
    meta_description: form.meta_description.trim(),
    intro: form.intro.split('\n').map((l) => l.trim()).filter(Boolean),
    gallery: form.gallery,
    service_areas: form.service_areas.split('\n').map((l) => l.trim()).filter(Boolean),
    whatsapp_text: form.whatsapp_text.trim(),
  };
}

export function emptyServiceForm() {
  return {
    slug: '',
    title: '',
    short_description: '',
    chip_label: '',
    order: 0,
    active: true,
    image: '',
    image_alt: '',
    hero_title: '',
    hero_subtitle: '',
    meta_description: '',
    intro: '',
    service_areas: '',
    whatsapp_text: '',
    gallery: [],
  };
}
