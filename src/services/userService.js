import api, { setAccessToken } from './api';

const syncTokenFromResponse = (response) => {
  const token = response.data?.data?.accessToken;

  if (token) {
    setAccessToken(token);
  }

  return response;
};

export const userService = {
  checkPhone(payload) {
    return api.post('/auth/check-phone', payload);
  },

  validateForOtp(payload) {
    return api.post('/auth/validate-for-otp', payload);
  },

  verifyMsg91Token(payload) {
    const response = api.post('/auth/verify-msg91-token', payload);
    return response.then(syncTokenFromResponse);
  },

  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return syncTokenFromResponse(response);
  },

  async registerWithPhone(payload) {
    const response = await api.post('/auth/register-phone', payload);
    return syncTokenFromResponse(response);
  },

  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return syncTokenFromResponse(response);
  },

  async loginWithPhone(payload) {
    const response = await api.post('/auth/login-phone', payload);
    return syncTokenFromResponse(response);
  },

  async logout() {
    try {
      return await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  refresh() {
    return api.post('/auth/refresh');
  },

  getCurrentUser() {
    return api.get('/auth/me');
  },

  getMyProfile() {
    return api.get('/users/me');
  },

  updateMyProfile(payload) {
    return api.patch('/users/me', payload);
  },

  getMyProperties() {
    return api.get('/users/me/properties');
  },

  getSavedProperties() {
    return api.get('/users/me/saved-properties');
  },

  saveProperty(propertyId) {
    return api.post(`/users/me/saved-properties/${propertyId}`);
  },

  unsaveProperty(propertyId) {
    return api.delete(`/users/me/saved-properties/${propertyId}`);
  },

  getMyEnquiries() {
    return api.get('/users/me/enquiries');
  },
};

export default userService;
