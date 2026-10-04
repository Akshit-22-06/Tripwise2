import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getWishlist: () => api.get('/auth/wishlist'),
  toggleWishlist: (itemId, itemType) => api.post('/auth/wishlist', { itemId, itemType }),
};

export const destinationAPI = {
  getAll: (params) => api.get('/destinations', { params }),
  getById: (id) => api.get(`/destinations/${id}`),
  getNearby: (lat, lng, radius) => api.get(`/destinations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
};

export const plannerAPI = {
  generate: (data) => api.post('/planner/generate', data),
  calculateBudget: (data) => api.post('/planner/calculate-budget', data),
  save: (data) => api.post('/planner/save', data),
  getMyPlans: () => api.get('/planner/my-plans'),
  deletePlan: (id) => api.delete(`/planner/${id}`),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings/create', data),
  getMyBookings: () => api.get('/bookings/user'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

export const paymentAPI = {
  createOrder: (bookingId) => api.post('/payments/create-order', { bookingId }),
  verify: (data) => api.post('/payments/verify', data),
};

export const reviewAPI = {
  create: (formData) => api.post('/reviews', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getByTarget: (targetId) => api.get(`/reviews/${targetId}`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const businessAPI = {
  getDashboard: () => api.get('/business/dashboard'),
  getMyServices: () => api.get('/business/services'),
  createListing: (formData) => api.post('/business/services', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateListing: (id, formData) => api.put(`/business/services/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteListing: (id) => api.delete(`/business/services/${id}`),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  toggleStatus: (userId) => api.post('/admin/users/toggle-status', { userId }),
  getVerifications: () => api.get('/admin/verifications'),
  processVerification: (data) => api.post('/admin/verifications/process', data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  getReports: () => api.get('/admin/reports'),
};

export const flightAPI = {
  search: (params) => api.get('/flights/search', { params }),
};

export const trainAPI = {
  search: (params) => api.get('/trains/search', { params }),
};

export const hotelAPI = {
  search: (params) => api.get('/hotels/search', { params }),
};

export const placesAPI = {
  discover: (params) => api.get('/places/discover', { params }),
  geocode: (params) => api.get('/places/geocode', { params }),
};

export default api;
