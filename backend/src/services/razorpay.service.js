import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async ({ amount, receipt, currency = 'INR' }) => {
  return razorpay.orders.create({
    amount,
    currency,
    receipt,
    payment_capture: 1,
  });
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  return expected === signature;
};
