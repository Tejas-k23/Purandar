import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    remainingListings: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      required: true,
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ userId: 1, status: 1, expiryDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
