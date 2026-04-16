import mongoose from 'mongoose';

const notificationSettingSchema = new mongoose.Schema(
  {
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

const NotificationSetting = mongoose.model('NotificationSetting', notificationSettingSchema);

export default NotificationSetting;
