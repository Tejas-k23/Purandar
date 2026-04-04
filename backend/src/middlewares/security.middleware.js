import ApiError from '../utils/ApiError.js';

export const requireStandardHeaders = (req, _res, next) => {
  const userAgent = req.get('user-agent');
  const accept = req.get('accept');

  if (!userAgent || userAgent.length < 3) {
    throw new ApiError(400, 'Invalid request headers');
  }

  if (!accept) {
    throw new ApiError(400, 'Invalid request headers');
  }

  next();
};

export const requireMultipart = (req, _res, next) => {
  if (!req.is('multipart/form-data')) {
    throw new ApiError(415, 'Invalid content-type');
  }

  next();
};
