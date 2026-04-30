import Subscription from '../models/Subscription.js';
import Setting from '../models/Setting.js';
import ApiError from './ApiError.js';

export const expireOutdatedSubscriptions = async () => {
  const now = new Date();
  await Subscription.updateMany(
    { status: 'active', expiryDate: { $lt: now } },
    { status: 'expired' },
  );
};

export const getActiveSubscriptionForUser = async (userId) => {
  const now = new Date();
  return Subscription.findOne({
    userId,
    status: 'active',
    expiryDate: { $gte: now },
  })
    .sort({ expiryDate: -1 })
    .populate('packageId');
};

export const ensureActiveSubscriptionForUser = async (userId) => {
  const subscription = await getActiveSubscriptionForUser(userId);
  if (!subscription) {
    throw new ApiError(402, 'Upgrade your plan to create a new property listing');
  }
  if (subscription.remainingListings <= 0) {
    throw new ApiError(402, 'Upgrade your plan to create a new property listing');
  }
  return subscription;
};

export const ensureListingAccessForUser = async (userId) => {
  const settings = await Setting.getEffectiveSingleton();

  if (!settings.isPricingActive) {
    return null;
  }

  return ensureActiveSubscriptionForUser(userId);
};

export const consumeListing = async (subscription) => {
  if (!subscription) {
    throw new ApiError(400, 'No subscription available to consume listing');
  }

  subscription.remainingListings = Math.max(0, subscription.remainingListings - 1);
  await subscription.save();
  return subscription;
};
