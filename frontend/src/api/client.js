const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Network error — server may be asleep. Please try again.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned ${res.status}. Unable to parse response.`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (email, password, turnstileToken) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, turnstileToken }) }),

  login: (email, password, turnstileToken) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, turnstileToken }) }),

  getEmails: (params = {}) => {
    const query = new URLSearchParams();
    if (params.folder) query.set('folder', params.folder);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return request(`/emails?${query.toString()}`);
  },

  refreshEmails: () =>
    request('/emails/refresh'),

  updateEmail: (id, updates) =>
    request(`/emails/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  getSenders: () =>
    request('/senders'),
};
