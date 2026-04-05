import { env } from '../config/env.js';

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const isPropertyImageUpload = req.originalUrl?.includes('/properties/') && req.originalUrl?.includes('upload-images');
      const isPropertyVideoUpload = req.originalUrl?.includes('/properties/') && req.originalUrl?.includes('upload-videos');
      const message = isPropertyImageUpload
        ? `File size exceeds ${env.MEDIA_IMAGE_MAX_MB}MB`
        : isPropertyVideoUpload
          ? `File size exceeds ${env.MEDIA_VIDEO_MAX_MB}MB`
          : `File size exceeds ${env.MEDIA_VIDEO_MAX_MB}MB`;
      return res.status(413).json({
        success: false,
        message,
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
      const isPropertyUpload = req.originalUrl?.includes('/properties/') && req.originalUrl?.includes('upload-images');
      const isPropertyVideoUpload = req.originalUrl?.includes('/properties/') && req.originalUrl?.includes('upload-videos');
      const isProjectUpload = req.originalUrl?.includes('/projects/') && req.originalUrl?.includes('upload-media');
      let message = 'Too many files';

      if (isPropertyUpload) {
        message = 'Max 8 images allowed';
      } else if (isPropertyVideoUpload) {
        message = 'Max 2 videos allowed';
      } else if (isProjectUpload) {
        message = error.field === 'videos' ? 'Max 2 videos allowed' : 'Max 12 images allowed';
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Upload failed',
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier',
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(error.details ? { details: error.details } : {}),
  });
};
