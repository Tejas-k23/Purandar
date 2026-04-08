import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, required: true },
    key: { type: String, trim: true, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    projectName: { type: String, trim: true, default: '' },
    slug: { type: String, trim: true, default: '' },
    projectType: { type: String, trim: true, default: '' },
    projectStatus: { type: String, trim: true, default: '' },
    developerName: { type: String, trim: true, default: '' },
    area: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    startingPrice: { type: Number, default: null },
    endingPrice: { type: Number, default: null },
    priceUnit: { type: String, trim: true, default: 'Lakh' },
    configurationTypes: { type: [String], default: [] },
    areaRange: { type: String, trim: true, default: '' },
    pricePerSqFt: { type: Number, default: null },
    plotUnit: { type: String, trim: true, default: 'sq.ft' },
    minPlotSize: { type: Number, default: null },
    maxPlotSize: { type: Number, default: null },
    totalTowers: { type: Number, default: null },
    totalUnits: { type: Number, default: null },
    totalFloors: { type: Number, default: null },
    openSpace: { type: Number, default: null },
    approvalAuthority: { type: String, trim: true, default: '' },
    totalPlots: { type: Number, default: null },
    amenities: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    shortDescription: { type: String, trim: true, default: '' },
    detailedDescription: { type: String, trim: true, default: '' },
    launchDate: { type: String, trim: true, default: '' },
    possessionDate: { type: String, trim: true, default: '' },
    reraNumber: { type: String, trim: true, default: '' },
    mapLink: { type: String, trim: true, default: '' },
    contactDisplayMode: {
      type: String,
      enum: ['original', 'company', 'custom'],
      default: 'original',
    },
    useCustomContactDetails: { type: Boolean, default: false },
    contactPersonName: { type: String, trim: true, default: '' },
    phoneNumber: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    contactName: { type: String, trim: true, default: '' },
    contactPhone: { type: String, trim: true, default: '' },
    contactEmail: { type: String, trim: true, default: '' },
    whatsappNumber: { type: String, trim: true, default: '' },
    showWhatsappButton: { type: Boolean, default: false },
    responseTime: { type: String, trim: true, default: '' },
    whatsappDisplayMode: {
      type: String,
      enum: ['original', 'company', 'custom'],
      default: 'original',
    },
    useCustomWhatsappDetails: { type: Boolean, default: false },
    customWhatsappNumber: { type: String, trim: true, default: '' },
    visible: { type: Boolean, default: true },
    featuredOnHome: { type: Boolean, default: false },
    projectImages: { type: [String], default: [] },
    videoUrl: { type: String, trim: true, default: '' },
    images: { type: [mediaSchema], default: [] },
    videos: { type: [mediaSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'archived'],
      default: 'pending',
    },
    moderationMessage: { type: String, trim: true, default: '' },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, featuredOnHome: 1, publishedAt: -1 });
projectSchema.index({ owner: 1, status: 1, updatedAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
