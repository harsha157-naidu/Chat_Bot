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

// Helper for Admin Authenticated fetch (Stealth & Identity Isolation)
const fetchWithAdminAuth = async (url, options = {}) => {
  const token = localStorage.getItem('sensesphere_admin_token') || sessionStorage.getItem('sensesphere_admin_token');
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

// 5. Admin API (Identity Isolation, Stealth Control, Bug Rectification, Human Interdiction)
export const adminAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin login failed');
    if (data.token) {
      localStorage.setItem('sensesphere_admin_token', data.token);
    }
    return data;
  },
  logout: () => {
    localStorage.removeItem('sensesphere_admin_token');
    sessionStorage.removeItem('sensesphere_admin_token');
  },
  getToken: () => localStorage.getItem('sensesphere_admin_token') || sessionStorage.getItem('sensesphere_admin_token'),
  getStats: () => fetchWithAdminAuth(`${API_BASE}/admin/stats`),
  getUsers: () => fetchWithAdminAuth(`${API_BASE}/admin/users`),
  updateUserStatus: (id, status) => fetchWithAdminAuth(`${API_BASE}/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getAllChats: () => fetchWithAdminAuth(`${API_BASE}/admin/chats`),
  toggleBotForChat: (id, is_bot_disabled) => fetchWithAdminAuth(`${API_BASE}/admin/chats/${id}/toggle-bot`, {
    method: 'PUT',
    body: JSON.stringify({ is_bot_disabled })
  }),
  sendAdminMessage: (id, message) => fetchWithAdminAuth(`${API_BASE}/admin/chats/${id}/message`, {
    method: 'POST',
    body: JSON.stringify({ message })
  }),
  getUnresolvedQueries: () => fetchWithAdminAuth(`${API_BASE}/admin/unresolved-queries`),
  deleteUnresolvedQuery: (id) => fetchWithAdminAuth(`${API_BASE}/admin/unresolved-queries/${id}`, {
    method: 'DELETE'
  }),
  getSystemErrors: () => fetchWithAdminAuth(`${API_BASE}/admin/system-errors`),
  deleteSystemError: (id) => fetchWithAdminAuth(`${API_BASE}/admin/system-errors/${id}`, {
    method: 'DELETE'
  }),
  clearAllSystemErrors: () => fetchWithAdminAuth(`${API_BASE}/admin/system-errors`, {
    method: 'DELETE'
  })
};

