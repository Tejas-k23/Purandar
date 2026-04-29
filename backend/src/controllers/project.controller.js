import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import { env } from '../config/env.js';
import {
  buildFileName,
  getImageUrl,
  validateImageFile,
  validateVideoFile,
} from '../utils/media.js';
import { deleteManyFromR2, uploadToR2 } from '../utils/r2.js';
import {
  fetchTokens,
  removeInvalidTokens,
  sendNotificationToTokens,
} from '../utils/notifications.js';
import { extractGoogleMapsData } from '../utils/googleMaps.js';

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

const normalizePayload = (payload = {}) => {
  const next = { ...payload };
  if (!next.slug && next.projectName) {
    next.slug = slugify(next.projectName);
  }
  if ('latitude' in next) next.latitude = toNumberOrNull(next.latitude);
  if ('longitude' in next) next.longitude = toNumberOrNull(next.longitude);
  if ('startingPrice' in next) next.startingPrice = toNumberOrNull(next.startingPrice);
  if ('endingPrice' in next) next.endingPrice = toNumberOrNull(next.endingPrice);
  if ('pricePerSqFt' in next) next.pricePerSqFt = toNumberOrNull(next.pricePerSqFt);
  if ('minPlotSize' in next) next.minPlotSize = toNumberOrNull(next.minPlotSize);
  if ('maxPlotSize' in next) next.maxPlotSize = toNumberOrNull(next.maxPlotSize);
  if ('totalTowers' in next) next.totalTowers = toNumberOrNull(next.totalTowers);
  if ('totalUnits' in next) next.totalUnits = toNumberOrNull(next.totalUnits);
  if ('totalFloors' in next) next.totalFloors = toNumberOrNull(next.totalFloors);
  if ('openSpace' in next) next.openSpace = toNumberOrNull(next.openSpace);
  if ('totalPlots' in next) next.totalPlots = toNumberOrNull(next.totalPlots);
  if ('showWhatsappButton' in next) next.showWhatsappButton = toBoolean(next.showWhatsappButton);

  if (next.whatsappDisplayMode) {
    next.whatsappDisplayMode = String(next.whatsappDisplayMode).toLowerCase();
  } else if (next.useCustomWhatsappDetails === true) {
    next.whatsappDisplayMode = 'custom';
  } else if (next.useCustomWhatsappDetails === false) {
    next.whatsappDisplayMode = 'original';
  }

  if (next.whatsappDisplayMode && next.whatsappDisplayMode !== 'original') {
    next.useCustomWhatsappDetails = true;
  } else if (next.whatsappDisplayMode === 'original') {
    next.useCustomWhatsappDetails = false;
  }

  next.configurationTypes = Array.isArray(next.configurationTypes) ? next.configurationTypes : [];
  next.extraConfigurations = Array.isArray(next.extraConfigurations) ? next.extraConfigurations : [];
  next.amenities = Array.isArray(next.amenities) ? next.amenities : [];
  next.tags = Array.isArray(next.tags) ? next.tags : [];

  const extractedMapData = extractGoogleMapsData(next.mapLink || '');
  if ('mapLink' in next) {
    next.mapLink = extractedMapData.mapLink || String(next.mapLink || '').trim();
  }
  if ((next.latitude === null || next.longitude === null) && extractedMapData.latitude !== null && extractedMapData.longitude !== null) {
    next.latitude = extractedMapData.latitude;
    next.longitude = extractedMapData.longitude;
  }

  if ('coverImage' in next) {
    next.coverImage = String(next.coverImage || '').trim();
  }
  if ('coverImageKey' in next) {
    next.coverImageKey = String(next.coverImageKey || '').trim();
  }
  return next;
};

const validateProjectPayload = (payload = {}) => {
  const errors = [];
  const requiredFields = [
    'projectName',
    'projectType',
    'developerName',
    'projectStatus',
    'address',
    'city',
    'area',
    'areaRange',
    'approvalAuthority',
    'contactPersonName',
    'phoneNumber',
    'email',
  ];

  for (const field of requiredFields) {
  if (!String(payload[field] ?? '').trim()) {
      errors.push(`${field} is required`);
    }
  }
  if (payload.latitude === null || payload.latitude === undefined || payload.longitude === null || payload.longitude === undefined) {
    errors.push('Project map coordinates are required');
  }

  if (payload.startingPrice === null || payload.startingPrice === undefined) errors.push('startingPrice is required');
  if (payload.endingPrice === null || payload.endingPrice === undefined) errors.push('endingPrice is required');
  if (payload.startingPrice !== null && payload.endingPrice !== null && payload.startingPrice > payload.endingPrice) {
    errors.push('endingPrice should be greater than startingPrice');
  }
  if (!payload.configurationTypes?.length && !(payload.extraConfigurations || []).some((item) => String(item || '').trim())) {
    errors.push('At least one configuration is required');
  }
  if (payload.contactDisplayMode === 'custom') {
    if (!payload.customContactName?.trim()) errors.push('customContactName is required');
    if (!payload.customContactPhone?.trim()) errors.push('customContactPhone is required');
    if (!payload.customContactEmail?.trim()) errors.push('customContactEmail is required');
  }
  if (payload.showWhatsappButton && payload.whatsappDisplayMode === 'custom' && !payload.customWhatsappNumber?.trim()) {
    errors.push('customWhatsappNumber is required');
  }
  if (payload.videoUrl?.trim()) {
    try {
      const candidate = new URL(payload.videoUrl.trim());
      if (!/^https?:$/i.test(candidate.protocol)) {
        errors.push('videoUrl must be a valid video URL');
      }
    } catch (_error) {
      errors.push('videoUrl must be a valid video URL');
    }
  }
  if (payload.projectType === 'Plots') {
    if (payload.pricePerSqFt === null || payload.pricePerSqFt === undefined) errors.push('pricePerSqFt is required');
    if (payload.minPlotSize === null || payload.minPlotSize === undefined) errors.push('minPlotSize is required');
    if (payload.maxPlotSize === null || payload.maxPlotSize === undefined) errors.push('maxPlotSize is required');
    if (payload.minPlotSize !== null && payload.maxPlotSize !== null && payload.minPlotSize > payload.maxPlotSize) {
      errors.push('maxPlotSize should be greater than minPlotSize');
    }
  }

  return errors;
};

const findProjectByIdentifier = (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Project.findOne({ $or: [{ _id: identifier }, { slug: identifier }] });
  }
  return Project.findOne({ slug: identifier });
};

const getOwnedProject = async (identifier, user) => {
  if (user?.role === 'admin') {
    return findProjectByIdentifier(identifier);
  }

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Project.findOne({
      owner: user?._id,
      $or: [{ _id: identifier }, { slug: identifier }],
    });
  }

  return Project.findOne({ owner: user?._id, slug: identifier });
};

const ensureProjectImages = (project) => {
  if (!project) return project;
  if (Array.isArray(project.projectImages) && project.projectImages.length) return project;
  const fallback = (project.images || []).map((image) => image?.url).filter(Boolean);
  if (fallback.length) {
    project.projectImages = fallback;
  }
  if (!project.coverImage && project.projectImages?.length) {
    project.coverImage = project.projectImages[0];
  }
  return project;
};

export const listProjects = asyncHandler(async (req, res) => {
  const includeHidden = req.query.includeHidden === 'true' && req.user?.role === 'admin';
  const filter = {};

  if (!includeHidden) {
    filter.visible = { $ne: false };
    filter.status = 'approved';
  }
  if (req.query.featuredOnHome === 'true') {
    filter.featuredOnHome = true;
  }
  if (req.query.city) {
    filter.city = new RegExp(req.query.city, 'i');
  }
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { projectName: regex },
      { area: regex },
      { city: regex },
      { developerName: regex },
    ];
  }

  const items = await Project.find(filter).sort({ createdAt: -1 });
  items.forEach(ensureProjectImages);

  res.json({
    success: true,
    data: {
      items,
      pagination: null,
    },
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const project = await findProjectByIdentifier(identifier).populate('owner', 'name email phone');
  ensureProjectImages(project);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if ((project.visible === false || project.status !== 'approved') && req.user?.role !== 'admin') {
    throw new ApiError(404, 'Project not found');
  }

  res.json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  const validationErrors = validateProjectPayload(payload);
  if (validationErrors.length) {
    throw new ApiError(400, validationErrors[0]);
  }
  const isAdmin = req.user?.role === 'admin';
  const project = await Project.create({
    ...payload,
    owner: req.user?._id || null,
    status: isAdmin ? 'approved' : 'pending',
    approvedAt: isAdmin ? new Date() : null,
    publishedAt: isAdmin ? new Date() : null,
  });

  res.status(201).json({
    success: true,
    message: isAdmin ? 'Project created successfully' : 'Project submitted for review',
    data: project,
  });

  if (!isAdmin) {
    const adminTokens = await fetchTokens({ role: 'admin', enabledTypes: 'project_pending' });
    if (adminTokens.length) {
      const response = await sendNotificationToTokens({
        tokens: adminTokens,
        title: 'New project awaiting approval',
        body: `${project.projectName || 'A new project'} needs approval.`,
        data: { type: 'project_pending', projectId: project._id.toString() },
        context: { city: project.city, propertyType: project.projectType },
      });
      const invalid = adminTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
    }
  }
});

export const updateProject = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  const project = await getOwnedProject(req.params.id, req.user);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const mergedPayload = normalizePayload({
    ...project.toObject(),
    ...payload,
  });
  const validationErrors = validateProjectPayload(mergedPayload);
  if (validationErrors.length) {
    throw new ApiError(400, validationErrors[0]);
  }

  Object.assign(project, payload);
  if (req.user?.role !== 'admin') {
    project.status = 'pending';
    project.moderationMessage = '';
    project.approvedAt = null;
    project.rejectedAt = null;
  }
  await project.save();

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

export const toggleProjectVisibility = asyncHandler(async (req, res) => {
  const { visible } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  project.visible = Boolean(visible);
  await project.save();

  res.json({
    success: true,
    message: 'Project visibility updated',
    data: project,
  });
});

export const toggleProjectFeatured = asyncHandler(async (req, res) => {
  const { featuredOnHome } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  if (project.status !== 'approved' && featuredOnHome) {
    throw new ApiError(400, 'Only approved projects can be featured on the home page');
  }
  project.featuredOnHome = Boolean(featuredOnHome);
  await project.save();

  res.json({
    success: true,
    message: 'Project featured status updated',
    data: project,
  });
});

export const uploadProjectMedia = asyncHandler(async (req, res) => {
  const project = await getOwnedProject(req.params.id, req.user);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const imageFiles = req.files?.images || [];
  const videoFiles = req.files?.videos || [];
  const brochureFile = req.files?.brochure?.[0] || null;

  if (!imageFiles.length && !videoFiles.length && !brochureFile) {
    throw new ApiError(400, 'No files uploaded');
  }

  const imageCount = (project.images?.length || 0) + imageFiles.length;
  if (imageCount > 12) {
    throw new ApiError(400, 'Max 12 images allowed');
  }

  const videoCount = (project.videos?.length || 0) + videoFiles.length;
  if (videoCount > 2) {
    throw new ApiError(400, 'Max 2 videos allowed');
  }

  for (const file of imageFiles) {
    const error = validateImageFile(file);
    if (error) {
      throw new ApiError(400, error);
    }
  }

  for (const file of videoFiles) {
    const error = validateVideoFile(file);
    if (error) {
      throw new ApiError(400, error);
    }
  }

  if (brochureFile && brochureFile.mimetype !== 'application/pdf') {
    throw new ApiError(400, 'Brochure must be a PDF file');
  }

  const imageUploads = imageFiles.map(async (file) => {
    const filename = buildFileName(file.originalname);
    const key = `projects/${project._id}/images/${filename}`;
    try {
      await uploadToR2({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } catch (error) {
      console.error('R2 image upload failed:', error);
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

  const videoUploads = videoFiles.map(async (file) => {
    const filename = buildFileName(file.originalname);
    const key = `projects/${project._id}/videos/${filename}`;
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

    return {
      url: getImageUrl(key),
      key,
      type: 'video',
    };
  });

  const brochureUpload = brochureFile ? (async () => {
    const filename = buildFileName(brochureFile.originalname || 'brochure.pdf');
    const key = `projects/${project._id}/brochures/${filename}`;
    try {
      await uploadToR2({
        key,
        body: brochureFile.buffer,
        contentType: brochureFile.mimetype,
      });
    } catch (error) {
      console.error('R2 brochure upload failed:', error);
      throw new ApiError(502, 'Upload failed', {
        code: error?.code,
        name: error?.name,
        message: error?.message,
      });
    }

    return {
      url: getImageUrl(key),
      key,
      name: brochureFile.originalname || 'brochure.pdf',
    };
  })() : null;

  const [uploadedImages, uploadedVideos, uploadedBrochure] = await Promise.all([
    Promise.all(imageUploads),
    Promise.all(videoUploads),
    brochureUpload,
  ]);

  project.images = [...(project.images || []), ...uploadedImages];
  project.videos = [...(project.videos || []), ...uploadedVideos];
  project.projectImages = project.images.map((image) => image.url);
  if (uploadedBrochure) {
    project.brochure = uploadedBrochure;
  }
  if (!project.coverImage && project.projectImages.length) {
    project.coverImage = project.projectImages[0];
    project.coverImageKey = project.images[0]?.key || '';
  }
  if (project.videos.length) {
    project.videoUrl = project.videos[0].url;
  }

  await project.save();

  res.status(201).json({
    success: true,
    message: 'Media uploaded successfully',
    data: {
      images: project.images,
      videos: project.videos,
      brochure: project.brochure,
    },
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await getOwnedProject(req.params.id, req.user);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const keys = [
    ...(project.images || []).map((image) => image.key),
    ...(project.videos || []).map((video) => video.key),
    project.brochure?.key,
  ].filter(Boolean);

  await deleteManyFromR2(keys);

  project.images = [];
  project.videos = [];
  project.projectImages = [];
  project.coverImage = '';
  project.coverImageKey = '';
  project.brochure = { url: '', key: '', name: '' };
  project.videoUrl = '';
  project.status = 'archived';
  await project.save();

  res.json({ success: true, message: 'Project archived successfully' });
});

export const createProjectEnquiry = asyncHandler(async (req, res) => {
  const project = await findProjectByIdentifier(req.params.id);
  if (!project || project.visible === false || project.status !== 'approved') {
    throw new ApiError(404, 'Project not found');
  }

  const rawName = req.body.name || req.user?.name || '';
  const rawEmail = req.body.email || req.user?.email || '';
  const { message, leadType } = req.body;
  const resolvedLeadType = leadType === 'whatsapp' ? 'whatsapp' : 'enquiry';
  const rawPhone = resolvedLeadType === 'whatsapp'
    ? (req.body.phone || req.user?.phone || '')
    : (req.body.phone || '');
  if (!rawName || !rawEmail) {
    throw new ApiError(400, 'Name and email are required');
  }

  const enquiry = await Enquiry.create({
    project: project._id,
    user: req.user?._id || null,
    name: rawName,
    email: rawEmail,
    phone: rawPhone,
    message,
    leadType: resolvedLeadType,
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
      title: 'New project enquiry',
      body: `${rawName || 'A user'} sent an enquiry.`,
      data: { type: 'enquiry', projectId: project._id.toString() },
      context: { city: project.city, propertyType: project.projectType },
    });
    const invalid = adminTokens
      .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
      .map((token) => token.token);
    await removeInvalidTokens(invalid);
  }
});

export const unlockProjectSellerDetails = asyncHandler(async (req, res) => {
  const project = await findProjectByIdentifier(req.params.id).populate('owner', 'name email phone');
  ensureProjectImages(project);

  if (!project || project.visible === false || project.status !== 'approved') {
    throw new ApiError(404, 'Project not found');
  }

  const isOwner = project.owner?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const contactDisplayMode = project.contactDisplayMode || (project.useCustomContactDetails ? 'custom' : 'original');

  if (!isOwner && !isAdmin && contactDisplayMode === 'original') {
    await Enquiry.findOneAndUpdate(
      {
        project: project._id,
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

  const originalContact = {
    name: project.contactPersonName || project.owner?.name || project.developerName || 'Developer',
    phone: project.phoneNumber || project.owner?.phone || '',
    email: project.email || project.owner?.email || '',
  };
  const customContact = {
    name: project.customContactName || originalContact.name,
    phone: project.customContactPhone || originalContact.phone,
    email: project.customContactEmail || originalContact.email,
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
