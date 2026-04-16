import NotificationSetting from '../models/NotificationSetting.js';

export const getNotificationSettings = async () => {
  let settings = await NotificationSetting.findOne();
  if (!settings) {
    settings = await NotificationSetting.create({ notificationsEnabled: true });
  }
  return settings;
};

export const areAdminNotificationsEnabled = async () => {
  const settings = await getNotificationSettings();
  return settings.notificationsEnabled !== false;
};
