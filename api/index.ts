/// <reference types="vite/client" />
import axios from 'axios';

// Use environment variable with fallback - NO localhost!
const API_URL = import.meta.env.VITE_API_URL || 'https://deneth-fashion-backend.vercel.app';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'supersecretadminkey123';

console.log('🔧 Admin API URL:', API_URL); // For debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': ADMIN_KEY
  },
});

// Request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.method?.toUpperCase(), request.url);
  return request;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Products API
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
};

// Orders API
export const orderAPI = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => 
    api.put(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/stats/summary'),
};

// Banners API
export const bannerAPI = {
  getAll: () => api.get('/banners'),
  getActive: () => api.get('/banners/active'),
  create: (data: FormData) => api.post('/banners', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/banners/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/banners/${id}`),
  getSettings: () => api.get('/banners/settings'),
  updateSettings: (data: any) => api.put('/banners/settings/update', data),
};

// Admin API
export const adminAPI = {
  verify: () => api.get('/admin/verify'),
  dashboard: () => api.get('/admin/dashboard'),
};

export default api;