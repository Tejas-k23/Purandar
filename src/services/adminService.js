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

  deleteUser(userId) {
    return api.delete(`/admin/users/${userId}`);
  },

  getEnquiries(params = {}) {
    return api.get('/admin/enquiries', { params });
  },

  updateEnquiryStatus(enquiryId, status) {
    return api.patch(`/admin/enquiries/${enquiryId}/status`, { status });
  },

  getFeedback() {
    return api.get('/admin/feedback');
  },

  deleteFeedback(feedbackId) {
    return api.delete(`/admin/feedback/${feedbackId}`);
  },

  getNotificationSettings() {
    return api.get('/admin/notifications/settings');
  },

  updateNotificationSettings(notificationsEnabled) {
    return api.patch('/admin/notifications/settings', { notificationsEnabled });
  },

  getNotificationDevices() {
    return api.get('/admin/notifications/devices');
  },

  sendNotification(payload) {
    return api.post('/admin/notifications/broadcast', payload);
  },
};

export default adminService;
