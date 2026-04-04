import api from './api';

export const propertyService = {
  getAll(params = {}) {
    return api.get('/properties', { params });
  },

  getById(propertyId) {
    return api.get(`/properties/${propertyId}`);
  },

  requestSellerDetails(propertyId) {
    return api.post(`/properties/${propertyId}/seller-details`);
  },

  create(payload) {
    return api.post('/properties', payload);
  },

  update(propertyId, payload) {
    return api.patch(`/properties/${propertyId}`, payload);
  },

  uploadImages(propertyId, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post(`/properties/${propertyId}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove(propertyId) {
    return api.delete(`/properties/${propertyId}`);
  },

  createEnquiry(propertyId, payload) {
    return api.post(`/properties/${propertyId}/enquiries`, payload);
  },

  getEnquiries(propertyId) {
    return api.get(`/properties/${propertyId}/enquiries`);
  },

  getMyStats() {
    return api.get('/properties/stats/mine');
  },
};

export default propertyService;

