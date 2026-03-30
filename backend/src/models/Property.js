import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      default: '',
    },
    intent: {
      type: String,
      enum: ['sell', 'rent'],
      required: true,
    },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'plot'],
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    locality: {
      type: String,
      required: true,
      trim: true,
    },
    subLocality: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' },
    flatNo: { type: String, trim: true, default: '' },
    totalFloors: { type: String, default: '' },
    floorNo: { type: String, default: '' },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    balconies: { type: Number, default: null },
    totalArea: { type: Number, default: null },
    areaUnit: { type: String, default: 'sq.ft' },
    carpetArea: { type: Number, default: null },
    furnishing: { type: String, default: '' },
    availability: { type: String, default: '' },
    possessionMonth: { type: String, default: '' },
    possessionYear: { type: String, default: '' },
    propertyAge: { type: String, default: '' },
    ownership: { type: String, default: '' },
    price: { type: Number, required: true },
    priceNegotiable: { type: Boolean, default: false },
    securityDeposit: { type: Number, default: null },
    maintenance: { type: Number, default: null },
    mealsIncluded: { type: Boolean, default: false },
    plotArea: { type: Number, default: null },
    plotLength: { type: Number, default: null },
    plotWidth: { type: Number, default: null },
    boundaryWall: { type: String, default: '' },
    openSides: { type: String, default: '' },
    constructionDone: { type: String, default: '' },
    superBuiltUpArea: { type: Number, default: null },
    washroom: { type: String, default: '' },
    personalWashroom: { type: String, default: '' },
    pantry: { type: String, default: '' },
    coveredParking: { type: Number, default: null },
    openParking: { type: Number, default: null },
    warehouseHeight: { type: Number, default: null },
    loadingUnloading: { type: String, default: '' },
    floorsInProperty: { type: Number, default: null },
    floorArea: { type: Number, default: null },
    photos: { type: [String], default: [] },
    videoUrl: { type: String, trim: true, default: '' },
    audioURL: { type: String, trim: true, default: '' },
    societyAmenities: { type: [String], default: [] },
    flatAmenities: { type: [String], default: [] },
    facing: { type: String, default: '' },
    overlooking: { type: [String], default: [] },
    waterSupply: { type: String, default: '' },
    gatedCommunity: { type: String, default: '' },
    description: { type: String, trim: true, default: '' },
    score: { type: Number, default: 0 },
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
  {
    timestamps: true,
  },
);

propertySchema.index({ status: 1, intent: 1, city: 1, price: 1 });
propertySchema.index({ owner: 1, status: 1, updatedAt: -1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
