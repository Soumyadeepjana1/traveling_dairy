import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return API(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
};

// Users
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  uploadAvatar: (formData) => API.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => API.put('/users/change-password', data),
  getProfile: (id) => API.get(`/users/${id}`),
  getAllUsers: (params) => API.get('/users', { params }),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

// Trips
export const tripAPI = {
  create: (data) => API.post('/trips', data),
  getAll: (params) => API.get('/trips', { params }),
  getOne: (id) => API.get(`/trips/${id}`),
  update: (id, data) => API.put(`/trips/${id}`, data),
  delete: (id) => API.delete(`/trips/${id}`),
  toggleFavorite: (id) => API.put(`/trips/${id}/favorite`),
  uploadCover: (id, formData) => API.put(`/trips/${id}/cover`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImages: (id, formData) => API.put(`/trips/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (tripId, imageId) => API.delete(`/trips/${tripId}/images/${imageId}`),
  getDashboardStats: () => API.get('/trips/dashboard/stats'),
};

// Comments
export const commentAPI = {
  getComments: (tripId, params) => API.get(`/trips/${tripId}/comments`, { params }),
  addComment: (tripId, data) => API.post(`/trips/${tripId}/comments`, data),
  updateComment: (id, data) => API.put(`/comments/${id}`, data),
  deleteComment: (id) => API.delete(`/comments/${id}`),
  toggleLike: (id) => API.put(`/comments/${id}/like`),
};

// Favorites
export const favoriteAPI = {
  getAll: (params) => API.get('/favorites', { params }),
  toggle: (tripId) => API.post(`/favorites/${tripId}`),
  check: (tripId) => API.get(`/favorites/check/${tripId}`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => API.get('/notifications', { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
  deleteAll: () => API.delete('/notifications/clear'),
};

export default API;
