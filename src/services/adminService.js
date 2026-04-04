import api from './api';

export const adminService = {
  getDashboard() {
    return api.get('/admin/dashboard');
  },

  getProperties(params = {}) {
    return api.get('/admin/properties', { params });
  },

  getProperty(propertyId) {
    return api.get(`/admin/properties/${propertyId}`);
  },

  updateProperty(propertyId, payload) {
    return api.patch(`/properties/${propertyId}`, payload);
  },

  updatePropertyStatus(propertyId, status, moderationMessage = '') {
    return api.patch(`/admin/properties/${propertyId}/status`, { status, moderationMessage });
  },

  togglePropertyFeatured(propertyId, featuredOnHome) {
    return api.patch(`/admin/properties/${propertyId}/featured`, { featuredOnHome });
  },

  deleteProperty(propertyId) {
    return api.delete(`/admin/properties/${propertyId}`);
  },

  getUsers(params = {}) {
    return api.get('/admin/users', { params });
  },

  getEnquiries(params = {}) {
    return api.get('/admin/enquiries', { params });
  },

  updateEnquiryStatus(enquiryId, status) {
    return api.patch(`/admin/enquiries/${enquiryId}/status`, { status });
  },
};

export default adminService;
