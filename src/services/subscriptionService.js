import api from './api';
import env from '../config/env';

// Packages
export const listPackages = () => api.get('/packages');
export const getPackageById = (id) => api.get(`/packages/${id}`);
export const createPackage = (data) => api.post('/packages', data);
export const updatePackage = (id, data) => api.patch(`/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/packages/${id}`);

// Subscriptions
export const listSubscriptions = () => api.get('/subscriptions');
export const getUserSubscription = () => api.get('/subscriptions/me');
export const assignPackageToUser = (data) => api.post('/subscriptions/assign', data);
export const modifySubscription = (id, data) => api.patch(`/subscriptions/${id}`, data);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.patch('/settings', data);

// Payments
export const listPayments = () => api.get('/payments');
export const getPaymentById = (id) => api.get(`/payments/${id}`);
