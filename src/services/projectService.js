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

  removeAdmin(projectId) {
    return api.delete(`/admin/projects/${projectId}`);
  },

  toggleVisibility(projectId, visible) {
    return api.patch(`/projects/${projectId}/visibility`, { visible });
  },

  toggleFeatured(projectId, featuredOnHome) {
    return api.patch(`/projects/${projectId}/featured`, { featuredOnHome });
  },

  updateStatus(projectId, status, moderationMessage = '') {
    return api.patch(`/admin/projects/${projectId}/status`, { status, moderationMessage });
  },

  uploadMedia(projectId, { images = [], videos = [], brochure = null }) {
    const formData = new FormData();
    images.forEach((file) => formData.append('images', file));
    videos.forEach((file) => formData.append('videos', file));
    if (brochure) {
      formData.append('brochure', brochure);
    }
    return api.post(`/projects/${projectId}/upload-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  requestSellerDetails(projectId) {
    return api.post(`/projects/${projectId}/seller-details`);
  },

  createEnquiry(projectId, payload) {
    return api.post(`/projects/${projectId}/enquiries`, payload);
  },

  getFeedback(projectId) {
    return api.get(`/projects/${projectId}/feedback`);
  },

  addFeedback(projectId, payload) {
    return api.post(`/projects/${projectId}/feedback`, payload);
  },
};

export default projectService;
