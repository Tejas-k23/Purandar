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
    contactName: { type: String, trim: true, default: '' },
    contactPhone: { type: String, trim: true, default: '' },
    contactEmail: { type: String, trim: true, default: '' },
    visible: { type: Boolean, default: true },
    featuredOnHome: { type: Boolean, default: false },
    projectImages: { type: [String], default: [] },
    videoUrl: { type: String, trim: true, default: '' },
    images: { type: [mediaSchema], default: [] },
    videos: { type: [mediaSchema], default: [] },
  },
  { timestamps: true },
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
