import axios from 'axios';

const api = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// ── Auth ──
export const authApi = {
    login: (data) => api.post('/login', data),
    register: (data) => api.post('/register', data),
    logout: () => api.post('/logout'),
    getUser: () => api.get('/user'),
};

// ── Services ──
export const servicesApi = {
    getAll: () => api.get('/api/services'),
    getOne: (id) => api.get(`/api/services/${id}`),
    create: (data) => api.post('/api/services', data),
    update: (id, data) => api.put(`/api/services/${id}`, data),
    delete: (id) => api.delete(`/api/services/${id}`),
};

// ── Leads ──
export const leadsApi = {
    getAll: () => api.get('/api/leads'),
    getOne: (id) => api.get(`/api/leads/${id}`),
    create: (data) => api.post('/api/leads', data),
    update: (id, data) => api.put(`/api/leads/${id}`, data),
    delete: (id) => api.delete(`/api/leads/${id}`),
};

// ── Users ──
export const usersApi = {
    getAll: () => api.get('/api/users'),
    getOne: (id) => api.get(`/api/users/${id}`),
    create: (data) => api.post('/api/users', data),
    update: (id, data) => api.put(`/api/users/${id}`, data),
    delete: (id) => api.delete(`/api/users/${id}`),
};

export default api;
