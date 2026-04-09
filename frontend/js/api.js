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
    login: (data) => api.post('/api/login', data),
    register: (data) => api.post('/api/register', data),
    logout: () => api.post('/api/logout'),
    getUser: () => api.get('/api/user'),
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
    addNote: (id, data) => api.post(`/api/leads/${id}/notes`, data),
    getNotes: (id) => api.get(`/api/leads/${id}/notes`),
    claim: (id) => api.post(`/api/leads/${id}/claim`),
    release: (id) => api.post(`/api/leads/${id}/release`),
    assign: (id, data) => api.put(`/api/leads/${id}/assign`, data),
    confirm: (id) => api.post(`/api/leads/${id}/confirm`),
};

// ── Categories ──
export const categoriesApi = {
    getAll: () => api.get('/api/categories'),
    getOne: (id) => api.get(`/api/categories/${id}`),
    create: (data) => api.post('/api/categories', data),
    update: (id, data) => api.put(`/api/categories/${id}`, data),
    delete: (id) => api.delete(`/api/categories/${id}`),
};

// ── Reviews ──
export const reviewsApi = {
    getAll: () => api.get('/api/reviews'), // Admin only moderation
    create: (data) => api.post('/api/reviews', data),
    approve: (id) => api.put(`/api/reviews/${id}/approve`),
    delete: (id) => api.delete(`/api/reviews/${id}`),
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
