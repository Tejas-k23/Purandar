import mongoose from 'mongoose';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const numericFields = [
  'bedrooms',
  'bathrooms',
  'balconies',
  'totalArea',
  'carpetArea',
  'price',
  'securityDeposit',
  'maintenance',
  'plotArea',
  'plotLength',
  'plotWidth',
  'superBuiltUpArea',
  'coveredParking',
  'openParking',
  'warehouseHeight',
  'floorsInProperty',
  'floorArea',
  'score',
];

const toNumberOrNull = (value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const normalizePayload = (payload) => {
  const data = { ...payload };

  for (const field of numericFields) {
    if (field in data) {
      data[field] = toNumberOrNull(data[field]);
    }
  }

  data.photos = Array.isArray(data.photos) ? data.photos : [];
  data.societyAmenities = Array.isArray(data.societyAmenities) ? data.societyAmenities : [];
  data.flatAmenities = Array.isArray(data.flatAmenities) ? data.flatAmenities : [];
  data.overlooking = Array.isArray(data.overlooking) ? data.overlooking : [];

  if (!data.title) {
    data.title = [data.propertyType, data.locality, data.city].filter(Boolean).join(' in ');
  }

  return data;
};

const buildPublicFilters = (query) => {
  const filter = { status: 'approved' };

  if (query.intent) filter.intent = query.intent;
  if (query.category) filter.category = query.category;
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.locality) filter.locality = new RegExp(query.locality, 'i');
  if (query.propertyType) filter.propertyType = query.propertyType;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

const getOwnedProperty = async (propertyId, user) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const isOwner = property.owner.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this property');
  }

  return property;
};

export const listProperties = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(24, Number(req.query.limit || 12));
  const skip = (page - 1) * limit;

  const sortOptions = {
    newest: { publishedAt: -1, createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
  };

  const filter = buildPublicFilters(req.query);
  const sort = sortOptions[req.query.sort] || sortOptions.newest;

  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-moderationMessage')
      .populate('owner', 'name phone email'),
    Property.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('owner', 'name phone email');

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.status !== 'approved') {
    const requesterId = req.user?._id?.toString();
    const isOwner = requesterId && property.owner?._id?.toString() === requesterId;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(404, 'Property not found');
    }
  }

  res.json({ success: true, data: property });
});

export const createProperty = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);

  const required = ['intent', 'category', 'propertyType', 'city', 'locality'];
  for (const field of required) {
    if (!payload[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  if (!payload.price) {
    throw new ApiError(400, 'price is required');
  }

  const property = await Property.create({
    ...payload,
    owner: req.user._id,
    userName: req.user.name,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Property submitted for review',
    data: property,
  });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user);
  const payload = normalizePayload(req.body);

  Object.assign(property, payload);

  if (req.user.role !== 'admin') {
    property.status = 'pending';
    property.moderationMessage = '';
    property.approvedAt = null;
    property.rejectedAt = null;
  }

  await property.save();

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: property,
  });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user);
  property.status = 'archived';
  await property.save();

  res.json({
    success: true,
    message: 'Property archived successfully',
  });
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, status: 'approved' });
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const { name, email, phone, message } = req.body;
  if (!name || !email) {
    throw new ApiError(400, 'Name and email are required');
  }

  const enquiry = await Enquiry.create({
    property: property._id,
    propertyOwner: property.owner,
    user: req.user?._id || null,
    name,
    email,
    phone,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully',
    data: enquiry,
  });
});

export const listPropertyEnquiries = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user);

  const enquiries = await Enquiry.find({ property: property._id })
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone');

  res.json({ success: true, data: enquiries });
});

export const getPropertyStats = asyncHandler(async (req, res) => {
  const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

  const [summary] = await Property.aggregate([
    { $match: { owner: ownerObjectId, status: { $ne: 'archived' } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
        },
      },
    },
  ]);

  res.json({
    success: true,
    data: summary || {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    },
  });
});
