import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';

const getBearerToken = (authorization = '') => {
  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice(7);
};

export const protect = asyncHandler(async (req, _res, next) => {
  const bearerToken = getBearerToken(req.headers.authorization);
  const cookieToken = req.cookies?.accessToken;
  const token = bearerToken || cookieToken;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (_error) {
    throw new ApiError(401, 'Authentication required');
  }
  const user = await User.findById(decoded.sub).select('-password -refreshTokenHash');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User account is not available');
  }

  req.user = user;
  next();
});

export const optionalProtect = asyncHandler(async (req, _res, next) => {
  const bearerToken = getBearerToken(req.headers.authorization);
  const cookieToken = req.cookies?.accessToken;
  const token = bearerToken || cookieToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select('-password -refreshTokenHash');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (_error) {
    // Ignore invalid tokens for optional auth.
  }

  return next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to perform this action');
  }

  next();
};
