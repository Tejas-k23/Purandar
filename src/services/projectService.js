import api from './api';

const projectService = {
  getAll(params = {}) {
    return api.get('/projects', { params });
  },

  getById(identifier) {
    return api.get(`/projects/${identifier}`);
  },

  create(payload) {
    return api.post('/projects', payload);
  },

  update(projectId, payload) {
    return api.patch(`/projects/${projectId}`, payload);
  },

  remove(projectId) {
    return api.delete(`/projects/${projectId}`);
  },

  toggleVisibility(projectId, visible) {
    return api.patch(`/projects/${projectId}/visibility`, { visible });
  },

  toggleFeatured(projectId, featuredOnHome) {
    return api.patch(`/projects/${projectId}/featured`, { featuredOnHome });
  },

  uploadMedia(projectId, { images = [], videos = [] }) {
    const formData = new FormData();
    images.forEach((file) => formData.append('images', file));
    videos.forEach((file) => formData.append('videos', file));
    return api.post(`/projects/${projectId}/upload-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default projectService;
