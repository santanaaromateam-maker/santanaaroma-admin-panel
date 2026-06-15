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

function descriptionFromService(service) {
  const intro = service.intro || [];
  if (intro.length) return intro.join('\n\n');
  return service.shortDescription || service.short_description || '';
}

export function apiServiceToForm(service) {
  if (!service) return emptyServiceForm();
  return {
    title: service.title || '',
    description: descriptionFromService(service),
    image: service.image || '',
    image_alt: service.imageAlt || service.image_alt || '',
    gallery: (service.gallery || []).map((item) => ({ src: item.src, alt: item.alt || '' })),
  };
}

export function formToApiPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    image_alt: form.image_alt.trim(),
    gallery: form.gallery.map((item) => ({ src: item.src, alt: item.alt || '' })),
  };
}

export function emptyServiceForm() {
  return {
    title: '',
    description: '',
    image: '',
    image_alt: '',
    gallery: [],
  };
}
