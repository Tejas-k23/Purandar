import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import {
  buildFileName,
  toPublicUrl,
  validateImageFile,
  validateVideoFile,
} from '../utils/media.js';
import { deleteManyFromR2, uploadToR2 } from '../utils/r2.js';

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
  if ('pricePerSqFt' in next) next.pricePerSqFt = toNumberOrNull(next.pricePerSqFt);
  if ('minPlotSize' in next) next.minPlotSize = toNumberOrNull(next.minPlotSize);
  if ('maxPlotSize' in next) next.maxPlotSize = toNumberOrNull(next.maxPlotSize);
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
  return next;
};

const findProjectByIdentifier = (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Project.findOne({ $or: [{ _id: identifier }, { slug: identifier }] });
  }
  return Project.findOne({ slug: identifier });
};

export const listProjects = asyncHandler(async (req, res) => {
  const includeHidden = req.query.includeHidden === 'true' && req.user?.role === 'admin';
  const filter = {};

  if (!includeHidden) {
    filter.visible = { $ne: false };
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
  const project = await findProjectByIdentifier(identifier);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (project.visible === false && req.user?.role !== 'admin') {
    throw new ApiError(404, 'Project not found');
  }

  res.json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  const project = await Project.create(payload);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  Object.assign(project, payload);
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
  project.featuredOnHome = Boolean(featuredOnHome);
  await project.save();

  res.json({
    success: true,
    message: 'Project featured status updated',
    data: project,
  });
});

export const uploadProjectMedia = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const imageFiles = req.files?.images || [];
  const videoFiles = req.files?.videos || [];

  if (!imageFiles.length && !videoFiles.length) {
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
      url: toPublicUrl(key),
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
      url: toPublicUrl(key),
      key,
      type: 'video',
    };
  });

  const [uploadedImages, uploadedVideos] = await Promise.all([
    Promise.all(imageUploads),
    Promise.all(videoUploads),
  ]);

  project.images = [...(project.images || []), ...uploadedImages];
  project.videos = [...(project.videos || []), ...uploadedVideos];
  project.projectImages = project.images.map((image) => image.url);
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
    },
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const keys = [
    ...(project.images || []).map((image) => image.key),
    ...(project.videos || []).map((video) => video.key),
  ].filter(Boolean);

  await deleteManyFromR2(keys);

  res.json({
    success: true,
    message: 'Project deleted permanently',
  });
});

export const createProjectEnquiry = asyncHandler(async (req, res) => {
  const project = await findProjectByIdentifier(req.params.id);
  if (!project || project.visible === false) {
    throw new ApiError(404, 'Project not found');
  }

  const { name, email, phone, message, leadType } = req.body;
  if (!name || !email) {
    throw new ApiError(400, 'Name and email are required');
  }

  const enquiry = await Enquiry.create({
    project: project._id,
    user: req.user?._id || null,
    name,
    email,
    phone,
    message,
    leadType: leadType === 'whatsapp' ? 'whatsapp' : 'enquiry',
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully',
    data: enquiry,
  });
});
