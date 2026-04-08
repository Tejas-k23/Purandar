import mongoose from 'mongoose';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import {
  buildFileName,
  getImageUrl,
  getPropertyImagePath,
  getPropertyVideoPath,
  R2_BASE_URL,
  validateImageFile,
  validateVideoFile,
} from '../utils/media.js';
import { deleteManyFromR2, uploadToR2 } from '../utils/r2.js';
import {
  fetchTokens,
  removeInvalidTokens,
  sendNotificationToTokens,
} from '../utils/notifications.js';

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
  'latitude',
  'longitude',
  'score',
];

const toNumberOrNull = (value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const toBoolean = (value) => {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return Boolean(value);
};

const normalizePayload = (payload) => {
  const data = { ...payload };

  for (const field of numericFields) {
    if (field in data) {
      data[field] = toNumberOrNull(data[field]);
    }
  }

  if (data.contactDisplayMode) {
    data.contactDisplayMode = String(data.contactDisplayMode).toLowerCase();
  } else if (data.useOriginalSellerContact === false) {
    data.contactDisplayMode = 'custom';
  } else if (data.useOriginalSellerContact === true) {
    data.contactDisplayMode = 'original';
  }

  if (data.contactDisplayMode && data.contactDisplayMode !== 'original') {
    data.useOriginalSellerContact = false;
  } else if (data.contactDisplayMode === 'original') {
    data.useOriginalSellerContact = true;
  }

  if (data.whatsappDisplayMode) {
    data.whatsappDisplayMode = String(data.whatsappDisplayMode).toLowerCase();
  } else if (data.useCustomWhatsappDetails === true) {
    data.whatsappDisplayMode = 'custom';
  } else if (data.useCustomWhatsappDetails === false) {
    data.whatsappDisplayMode = 'original';
  }

  if (data.whatsappDisplayMode && data.whatsappDisplayMode !== 'original') {
    data.useCustomWhatsappDetails = true;
  } else if (data.whatsappDisplayMode === 'original') {
    data.useCustomWhatsappDetails = false;
  }

  if ('showWhatsappButton' in data) {
    data.showWhatsappButton = toBoolean(data.showWhatsappButton);
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

const buildAreaFilter = (query) => {
  if (!query.minArea && !query.maxArea) return null;

  const range = {};
  if (query.minArea) range.$gte = Number(query.minArea);
  if (query.maxArea) range.$lte = Number(query.maxArea);

  return {
    $or: [
      { totalArea: range },
      { carpetArea: range },
      { plotArea: range },
      { superBuiltUpArea: range },
    ],
  };
};

const buildPublicFilters = (query) => {
  const filter = { status: 'approved' };

  if (query.intent) filter.intent = query.intent;
  if (query.category) filter.category = query.category;
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.locality) filter.locality = new RegExp(query.locality, 'i');
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.featuredOnHome === 'true') filter.featuredOnHome = true;

  if (query.bedrooms) {
    filter.bedrooms = query.bedrooms === '5' ? { $gte: 5 } : Number(query.bedrooms);
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  const areaFilter = buildAreaFilter(query);
  if (areaFilter) {
    filter.$and = [...(filter.$and || []), areaFilter];
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
      .populate('owner', 'name'),
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

  if (property.status === 'approved') {
    await Property.updateOne(
      { _id: property._id },
      { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } },
    );
    property.viewCount = (property.viewCount || 0) + 1;
    property.lastViewedAt = new Date();
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

  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && payload.contactDisplayMode === 'company') {
    payload.contactDisplayMode = payload.useOriginalSellerContact ? 'original' : 'custom';
  }
  if (!isAdmin && payload.whatsappDisplayMode === 'company') {
    payload.whatsappDisplayMode = payload.useCustomWhatsappDetails ? 'custom' : 'original';
  }
  const property = await Property.create({
    ...payload,
    owner: req.user._id,
    userName: req.user.name,
    status: isAdmin ? 'approved' : 'pending',
    approvedAt: isAdmin ? new Date() : null,
    publishedAt: isAdmin ? new Date() : null,
  });

  res.status(201).json({
    success: true,
    message: req.user.role === 'admin' ? 'Property created successfully' : 'Property submitted for review',
    data: property,
  });

  if (!isAdmin) {
    const adminTokens = await fetchTokens({ role: 'admin', enabledTypes: 'property_pending' });
    if (process.env.NOTIFICATIONS_DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.info('[Notify] Admin tokens for property_pending:', adminTokens.length);
    }
    if (adminTokens.length) {
      const response = await sendNotificationToTokens({
        tokens: adminTokens,
        title: 'New property awaiting approval',
        body: `${property.title || 'A new property'} needs approval.`,
        data: { type: 'property_pending', propertyId: property._id.toString() },
        context: { city: property.city, intent: property.intent, propertyType: property.propertyType },
      });
      const invalid = adminTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
    }
  }
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user);
  const payload = normalizePayload(req.body);

  if (req.user.role !== 'admin' && payload.contactDisplayMode === 'company') {
    payload.contactDisplayMode = payload.useOriginalSellerContact ? 'original' : 'custom';
  }
  if (req.user.role !== 'admin' && payload.whatsappDisplayMode === 'company') {
    payload.whatsappDisplayMode = payload.useCustomWhatsappDetails ? 'custom' : 'original';
  }

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
  const imageKeys = (property.images || []).map((image) => image.key).filter(Boolean);
  const videoKeys = (property.videos || []).map((video) => video.key).filter(Boolean);
  await deleteManyFromR2([...imageKeys, ...videoKeys]);
  property.images = [];
  property.photos = [];
  property.videos = [];
  property.videoUrl = '';
  property.status = 'archived';
  await property.save();

  res.json({
    success: true,
    message: 'Property archived successfully',
  });
});

export const uploadPropertyImages = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const files = req.files || [];
  if (!files.length) {
    throw new ApiError(400, 'No files uploaded');
  }

  const existingCount = property.images?.length || 0;
  const totalCount = existingCount + files.length;
  if (totalCount > 8) {
    throw new ApiError(400, 'Max 8 images allowed');
  }

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) {
      throw new ApiError(400, error);
    }
  }

  const uploads = files.map(async (file) => {
    const filename = buildFileName(file.originalname);
    const key = getPropertyImagePath(property._id, filename);
    try {
      await uploadToR2({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } catch (error) {
      console.error('R2 upload failed:', error);
      throw new ApiError(502, 'Upload failed', {
        code: error?.code,
        name: error?.name,
        message: error?.message,
      });
    }

    return {
      url: getImageUrl(key),
      key,
      type: 'image',
    };
  });

  const uploaded = await Promise.all(uploads);
  property.images = [...(property.images || []), ...uploaded];
  property.photos = property.images.map((image) => image.url);
  await property.save();

  res.status(201).json({
    success: true,
    message: 'Images uploaded successfully',
    data: {
      images: property.images,
    },
  });
});

export const uploadPropertyVideos = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const files = req.files || [];
  if (!files.length) {
    throw new ApiError(400, 'No files uploaded');
  }

  const existingCount = property.videos?.length || 0;
  const totalCount = existingCount + files.length;
  if (totalCount > 2) {
    throw new ApiError(400, 'Max 2 videos allowed');
  }

  for (const file of files) {
    const error = validateVideoFile(file);
    if (error) {
      throw new ApiError(400, error);
    }
  }

  const uploads = files.map(async (file) => {
    const filename = buildFileName(file.originalname);
    const key = getPropertyVideoPath(property._id, filename);
    try {
      await uploadToR2({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } catch (error) {
      console.error('R2 video upload failed:', error);
      throw new ApiError(502, 'Upload failed', {
        code: error?.code,
        name: error?.name,
        message: error?.message,
      });
    }

    const videoUrl = R2_BASE_URL ? `${R2_BASE_URL}/${key}` : key;
    return {
      url: videoUrl,
      key,
      type: 'video',
    };
  });

  const uploaded = await Promise.all(uploads);
  property.videos = [...(property.videos || []), ...uploaded];
  if (property.videos.length) {
    property.videoUrl = property.videos[0].url;
  }
  await property.save();

  res.status(201).json({
    success: true,
    message: 'Videos uploaded successfully',
    data: {
      videos: property.videos,
    },
  });
});

export const unlockSellerDetails = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, status: 'approved' }).populate('owner', 'name phone email');

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const isOwner = property.owner?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    await Enquiry.findOneAndUpdate(
      {
        property: property._id,
        propertyOwner: property.owner._id,
        user: req.user._id,
        leadType: 'seller_detail',
      },
      {
        $set: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone || '',
        },
        $setOnInsert: {
          message: 'Requested seller details',
          status: 'new',
          leadType: 'seller_detail',
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  const contactDisplayMode = property.contactDisplayMode || (property.useOriginalSellerContact === false ? 'custom' : 'original');
  const originalContact = {
    name: property.owner?.name || property.userName || 'Owner',
    phone: property.owner?.phone || '',
    email: property.owner?.email || '',
  };
  const customContact = {
    name: property.displaySellerName || originalContact.name,
    phone: property.displaySellerPhone || originalContact.phone,
    email: property.displaySellerEmail || originalContact.email,
  };
  const companyContact = {
    name: env.COMPANY_CONTACT_NAME || originalContact.name,
    phone: env.COMPANY_CONTACT_PHONE || originalContact.phone,
    email: env.COMPANY_CONTACT_EMAIL || originalContact.email,
  };

  const resolved = contactDisplayMode === 'company'
    ? companyContact
    : contactDisplayMode === 'custom'
      ? customContact
      : originalContact;

  res.json({
    success: true,
    data: resolved,
  });
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, status: 'approved' });
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const rawName = req.body.name || req.user?.name || '';
  const rawEmail = req.body.email || req.user?.email || '';
  const rawPhone = req.body.phone || req.user?.phone || '';
  const { message, leadType } = req.body;
  if (!rawName || !rawEmail) {
    throw new ApiError(400, 'Name and email are required');
  }

  const enquiry = await Enquiry.create({
    property: property._id,
    propertyOwner: property.owner,
    user: req.user?._id || null,
    name: rawName,
    email: rawEmail,
    phone: rawPhone,
    message,
    leadType: leadType === 'whatsapp' ? 'whatsapp' : 'enquiry',
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully',
    data: enquiry,
  });

  const adminTokens = await fetchTokens({ role: 'admin', enabledTypes: 'enquiry' });
  if (adminTokens.length) {
    const response = await sendNotificationToTokens({
      tokens: adminTokens,
      title: 'New property enquiry',
      body: `${rawName || 'A user'} sent an enquiry.`,
      data: { type: 'enquiry', propertyId: property._id.toString() },
      context: { city: property.city, intent: property.intent, propertyType: property.propertyType },
    });
    const invalid = adminTokens
      .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
      .map((token) => token.token);
    await removeInvalidTokens(invalid);
  }
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

  const [summary, sellerDetailLeads, newSellerDetailLeads] = await Promise.all([
    Property.aggregate([
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
          totalViews: { $sum: '$viewCount' },
        },
      },
    ]),
    Enquiry.countDocuments({ propertyOwner: ownerObjectId, leadType: 'seller_detail' }),
    Enquiry.countDocuments({ propertyOwner: ownerObjectId, leadType: 'seller_detail', status: 'new' }),
  ]);

  res.json({
    success: true,
    data: {
      total: summary?.[0]?.total || 0,
      approved: summary?.[0]?.approved || 0,
      pending: summary?.[0]?.pending || 0,
      rejected: summary?.[0]?.rejected || 0,
      totalViews: summary?.[0]?.totalViews || 0,
      sellerDetailLeads,
      newSellerDetailLeads,
    },
  });
});



