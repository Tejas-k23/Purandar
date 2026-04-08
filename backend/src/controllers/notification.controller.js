import Notification from '../models/Notification.js';
import NotificationToken from '../models/NotificationToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const sanitizePreferences = (prefs = {}) => ({
  cities: Array.isArray(prefs.cities) ? prefs.cities.filter(Boolean) : [],
  intents: Array.isArray(prefs.intents) ? prefs.intents.filter(Boolean) : [],
  propertyTypes: Array.isArray(prefs.propertyTypes) ? prefs.propertyTypes.filter(Boolean) : [],
});

const defaultEnabledTypes = (role) => {
  if (role === 'admin') {
    return ['property_pending', 'project_pending', 'enquiry'];
  }
  if (role === 'guest') {
    return ['guest_property', 'guest_project'];
  }
  return ['property_approved', 'project_approved'];
};

export const subscribeNotifications = asyncHandler(async (req, res) => {
  const { token, role, browserId, platform, enabledTypes, preferences } = req.body;
  if (!token) {
    throw new ApiError(400, 'Token is required');
  }

  const resolvedRole = role || (req.user?.role ?? 'guest');
  const doc = await NotificationToken.findOneAndUpdate(
    { token },
    {
      token,
      role: resolvedRole,
      user: req.user?._id || null,
      browserId: browserId || '',
      platform: platform || 'web',
      enabledTypes: Array.isArray(enabledTypes) && enabledTypes.length
        ? enabledTypes
        : defaultEnabledTypes(resolvedRole),
      preferences: sanitizePreferences(preferences),
      userAgent: req.get('user-agent') || '',
      lastSeenAt: new Date(),
    },
    { upsert: true, new: true },
  );

  res.json({ success: true, data: doc });
});

export const unsubscribeNotifications = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(400, 'Token is required');
  }
  await NotificationToken.deleteOne({ token });
  res.json({ success: true, message: 'Unsubscribed' });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  const { enabledTypes, preferences } = req.body;
  const updated = await NotificationToken.updateMany(
    { user: req.user._id },
    {
      ...(enabledTypes ? { enabledTypes } : {}),
      ...(preferences ? { preferences: sanitizePreferences(preferences) } : {}),
      lastSeenAt: new Date(),
    },
  );

  res.json({ success: true, data: updated });
});

export const getMyNotifications = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  const items = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, data: items });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  const updated = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true },
  );
  if (!updated) {
    throw new ApiError(404, 'Notification not found');
  }
  res.json({ success: true, data: updated });
});
