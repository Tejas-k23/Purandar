import Project from '../models/Project.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  buildFileName,
  toPublicUrl,
  validateImageFile,
  validateVideoFile,
} from '../utils/media.js';
import { deleteManyFromR2, uploadToR2 } from '../utils/r2.js';

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
    await uploadToR2({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    return {
      url: toPublicUrl(key),
      key,
      type: 'image',
    };
  });

  const videoUploads = videoFiles.map(async (file) => {
    const filename = buildFileName(file.originalname);
    const key = `projects/${project._id}/videos/${filename}`;
    await uploadToR2({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

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
