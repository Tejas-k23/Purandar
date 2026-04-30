import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Package from '../models/Package.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const createSubscriptionRecord = async ({ userId, packageDoc, startDate }) => {
  const effectiveStartDate = startDate ? new Date(startDate) : new Date();
  const expiryDate = new Date(effectiveStartDate);
  expiryDate.setUTCDate(expiryDate.getUTCDate() + packageDoc.validity);

  return Subscription.create({
    userId,
    packageId: packageDoc._id,
    remainingListings: packageDoc.propertyLimit,
    startDate: effectiveStartDate,
    expiryDate,
    status: 'active',
  });
};

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    userId: req.user._id,
    status: 'active',
    expiryDate: { $gte: new Date() },
  })
    .sort({ expiryDate: -1 })
    .populate('packageId');

  if (!subscription) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: subscription });
});

export const assignPackageToUser = asyncHandler(async (req, res) => {
  const { userId, packageId, startDate } = req.body;
  if (!userId || !packageId) {
    throw new ApiError(400, 'userId and packageId are required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const packageDoc = await Package.findById(packageId);
  if (!packageDoc) {
    throw new ApiError(404, 'Package not found');
  }

  await Subscription.updateMany({ userId: user._id, status: 'active' }, { status: 'expired' });

  const subscription = await createSubscriptionRecord({ userId: user._id, packageDoc, startDate });

  res.status(201).json({ success: true, data: subscription });
});

export const modifySubscription = asyncHandler(async (req, res) => {
  const { extendDays, addListings, status } = req.body;
  const subscription = await Subscription.findById(req.params.id).populate('packageId');
  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  if (extendDays !== undefined) {
    const days = Number(extendDays);
    if (!Number.isFinite(days)) {
      throw new ApiError(400, 'extendDays must be a number');
    }
    subscription.expiryDate = new Date(subscription.expiryDate.getTime() + days * 24 * 60 * 60 * 1000);
  }

  if (addListings !== undefined) {
    const extra = Number(addListings);
    if (!Number.isFinite(extra)) {
      throw new ApiError(400, 'addListings must be a number');
    }
    subscription.remainingListings = Math.max(0, subscription.remainingListings + extra);
  }

  if (status) {
    if (!['active', 'expired'].includes(status)) {
      throw new ApiError(400, 'status must be active or expired');
    }
    subscription.status = status;
  }

  await subscription.save();

  res.json({ success: true, data: subscription });
});
