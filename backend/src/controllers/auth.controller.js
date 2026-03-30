import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  buildAuthPayload,
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
};

const sendAuthResponse = async (user, res) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Authentication successful',
    data: {
      user: buildAuthPayload(user),
      accessToken,
      refreshToken,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role === 'agent' ? 'agent' : 'user',
  });

  await sendAuthResponse(user, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokenHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account is disabled');
  }

  await sendAuthResponse(user, res);
});

export const refresh = asyncHandler(async (req, res) => {
  const suppliedToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!suppliedToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  const decoded = verifyRefreshToken(suppliedToken);
  const user = await User.findById(decoded.sub).select('+refreshTokenHash');

  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(suppliedToken)) {
    throw new ApiError(401, 'Refresh token is invalid');
  }

  if (user.tokenVersion !== decoded.tokenVersion) {
    throw new ApiError(401, 'Refresh token has been revoked');
  }

  await sendAuthResponse(user, res);
});

export const logout = asyncHandler(async (req, res) => {
  const suppliedToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (suppliedToken) {
    const decoded = verifyRefreshToken(suppliedToken);
    await User.findByIdAndUpdate(decoded.sub, { refreshTokenHash: null, $inc: { tokenVersion: 1 } });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedProperties',
    select: 'title propertyType city locality price status photos',
    match: { status: 'approved' },
  });

  res.json({
    success: true,
    data: {
      user: buildAuthPayload(user),
      profile: {
        location: user.location,
        bio: user.bio,
        savedProperties: user.savedProperties,
      },
    },
  });
});
