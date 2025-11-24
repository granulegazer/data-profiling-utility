/**
 * API service for backend communication
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const profilingApi = {
  // Test connection
  testConnection: (data) => api.post('/test-connection', data),

  // Profiling jobs
  createProfilingJob: (data) => api.post('/profiling-jobs', data),
  listProfilingJobs: () => api.get('/profiling-jobs'),
  getProfilingJob: (jobId) => api.get(`/profiling-jobs/${jobId}`),
  deleteProfilingJob: (jobId) => api.delete(`/profiling-jobs/${jobId}`),
  
  // Profiling results
  getProfilingResults: (jobId) => api.get(`/profiling-jobs/${jobId}/results`),
  getProfilingResultDetail: (resultId) => api.get(`/profiling-results/${resultId}`),
  
  // File upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
