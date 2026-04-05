import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    propertyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    leadType: {
      type: String,
      enum: ['enquiry', 'seller_detail'],
      default: 'enquiry',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  },
);

enquirySchema.index({ propertyOwner: 1, createdAt: -1 });
enquirySchema.index({ property: 1, createdAt: -1 });
enquirySchema.index({ project: 1, createdAt: -1 });
enquirySchema.index({ propertyOwner: 1, leadType: 1, createdAt: -1 });
enquirySchema.index({ property: 1, user: 1, leadType: 1 });
enquirySchema.index({ project: 1, user: 1, leadType: 1 });

enquirySchema.pre('validate', function validateTarget(next) {
  if (!this.property && !this.project) {
    return next(new Error('Either property or project is required.'));
  }
  return next();
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;

