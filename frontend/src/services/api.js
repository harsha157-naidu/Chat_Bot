const API_BASE = '/api';

// Helper for authenticated fetch
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('sensesphere_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: Request failed`);
  }
  return response.json();
};

// 1. Auth API
export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) localStorage.setItem('sensesphere_token', data.token);
    return data;
  },
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token) localStorage.setItem('sensesphere_token', data.token);
    return data;
  },
  getMe: () => fetchWithAuth(`${API_BASE}/auth/me`),
  updateSettings: (settings) => fetchWithAuth(`${API_BASE}/auth/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),
  logout: () => {
    localStorage.removeItem('sensesphere_token');
  }
};

// 2. Chat API
export const chatAPI = {
  getChats: () => fetchWithAuth(`${API_BASE}/chats`),
  getChatById: (id) => fetchWithAuth(`${API_BASE}/chats/${id}`),
  createChat: (title) => fetchWithAuth(`${API_BASE}/chats`, {
    method: 'POST',
    body: JSON.stringify({ title })
  }),
  deleteChat: (id) => fetchWithAuth(`${API_BASE}/chats/${id}`, {
    method: 'DELETE'
  }),
  sendMessage: (payload) => fetchWithAuth(`${API_BASE}/chats/message`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

// 3. Media Upload API
export const uploadAPI = {
  uploadFile: async (file) => {
    const token = localStorage.getItem('sensesphere_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
};

// 4. Developer Profile API (Arigala Sai Harshavardhan)
export const aboutAPI = {
  getAbout: () => fetchWithAuth(`${API_BASE}/about`),
  updateAbout: (data) => fetchWithAuth(`${API_BASE}/about`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// 5. Admin API
export const adminAPI = {
  getStats: () => fetchWithAuth(`${API_BASE}/admin/stats`),
  getUsers: () => fetchWithAuth(`${API_BASE}/admin/users`)
};
