import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: any) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const connectionsApi = {
  list: () => api.get('/connections'),
  get: (id: string) => api.get(`/connections/${id}`),
  create: (data: any) => api.post('/connections', data),
  update: (id: string, data: any) => api.put(`/connections/${id}`, data),
  delete: (id: string) => api.delete(`/connections/${id}`),
  test: (id: string) => api.post(`/connections/${id}/test`),
};

export const profilingApi = {
  start: (data: any) => api.post('/profiling/start', data),
  getProgress: (jobId: string) => api.get(`/profiling/${jobId}/progress`),
  cancel: (jobId: string) => api.post(`/profiling/${jobId}/cancel`),
};

export const jobsApi = {
  list: (params?: any) => api.get('/jobs', { params }),
  get: (jobId: string) => api.get(`/jobs/${jobId}`),
  delete: (jobId: string) => api.delete(`/jobs/${jobId}`),
};

export const resultsApi = {
  getDatasetProfile: (jobId: string) => api.get(`/results/dataset/${jobId}`),
  getEntityList: (jobId: string) => api.get(`/results/dataset/${jobId}/entities`),
  getEntityProfile: (entityId: string) => api.get(`/results/entity/${entityId}`),
  exportEntity: (entityId: string, format: string) => 
    api.get(`/results/entity/${entityId}/export`, { params: { format } }),
};
