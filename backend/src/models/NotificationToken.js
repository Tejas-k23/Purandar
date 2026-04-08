import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema(
  {
    cities: { type: [String], default: [] },
    intents: { type: [String], default: [] },
    propertyTypes: { type: [String], default: [] },
  },
  { _id: false },
);

const notificationTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    role: { type: String, enum: ['admin', 'user', 'agent', 'guest'], required: true },
    token: { type: String, required: true },
    browserId: { type: String, trim: true, default: '' },
    platform: { type: String, trim: true, default: 'web' },
    enabledTypes: { type: [String], default: [] },
    preferences: { type: preferenceSchema, default: () => ({}) },
    userAgent: { type: String, trim: true, default: '' },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationTokenSchema.index({ token: 1 }, { unique: true });
notificationTokenSchema.index({ user: 1, role: 1 });
notificationTokenSchema.index({ role: 1 });

const NotificationToken = mongoose.model('NotificationToken', notificationTokenSchema);

export default NotificationToken;
