import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Package from '../models/Package.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service.js';

const createSubscriptionRecord = async ({ userId, packageDoc }) => {
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setUTCDate(expiryDate.getUTCDate() + packageDoc.validity);

  return Subscription.create({
    userId,
    packageId: packageDoc._id,
    remainingListings: packageDoc.propertyLimit,
    startDate,
    expiryDate,
    status: 'active',
  });
};

export const createOrder = asyncHandler(async (req, res) => {
  const { packageId } = req.body;

  if (!packageId) {
    throw new ApiError(400, 'packageId is required');
  }

  const packageDoc = await Package.findById(packageId);
  if (!packageDoc || !packageDoc.isActive) {
    throw new ApiError(404, 'Package not found or inactive');
  }

  const amountInPaise = Math.round(packageDoc.price * 100);
  const receipt = `receipt_${req.user._id}_${Date.now()}`;
  const order = await createRazorpayOrder({
    amount: amountInPaise,
    receipt,
    currency: 'INR',
  });

  await Payment.create({
    userId: req.user._id,
    packageId: packageDoc._id,
    orderId: order.id,
    amount: packageDoc.price,
    status: 'created',
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      packageId: packageDoc._id,
      packageName: packageDoc.name,
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, packageId } = req.body;
  if (!orderId || !paymentId || !signature || !packageId) {
    throw new ApiError(400, 'orderId, paymentId, signature, and packageId are required');
  }

  const payment = await Payment.findOne({ orderId, userId: req.user._id });
  if (!payment) {
    throw new ApiError(404, 'Payment record not found');
  }

  if (payment.status === 'paid') {
    throw new ApiError(409, 'Payment is already verified');
  }

  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    payment.status = 'failed';
    payment.signature = signature;
    await payment.save();
    throw new ApiError(400, 'Payment verification failed');
  }

  const packageDoc = await Package.findById(packageId);
  if (!packageDoc || !packageDoc.isActive) {
    throw new ApiError(404, 'Package not found or inactive');
  }

  await Subscription.updateMany({ userId: req.user._id, status: 'active' }, { status: 'expired' });

  const subscription = await createSubscriptionRecord({ userId: req.user._id, packageDoc });

  payment.paymentId = paymentId;
  payment.signature = signature;
  payment.status = 'paid';
  await payment.save();

  res.json({
    success: true,
    message: 'Payment verified and subscription created',
    data: { subscription },
  });
});
