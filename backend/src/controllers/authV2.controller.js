import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import {
  buildAuthPayload,
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';
import verifyMsg91AccessToken from '../utils/msg91.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
};

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const normalizePhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return digits;
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  return digits.slice(-10);
};

const normalizeEmail = (email = '') => String(email || '').trim().toLowerCase();
const normalizeRole = (role) => (role === 'agent' ? 'agent' : 'user');

const buildPhonePlaceholderEmail = (phone) => `phone.${phone}@purandar.local`;
const buildPhonePlaceholderPassword = (phone) => `PhoneAuth@${phone}`;
const buildGooglePlaceholderPassword = () => `GoogleAuth@${crypto.randomUUID()}Aa1`;

const verifyGoogleCredential = async (credential) => {
  if (!env.GOOGLE_CLIENT_ID || !googleClient) {
    throw new ApiError(500, 'Google Sign-In is not configured');
  }

  if (!credential) {
    throw new ApiError(400, 'Google credential is required');
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      throw new ApiError(401, 'Invalid Google token');
    }

    if (payload.email_verified === false) {
      throw new ApiError(401, 'Google email is not verified');
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, 'Google token is invalid or expired');
  }
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
    maxAge: 14 * 24 * 60 * 60 * 1000,
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

export const checkPhone = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  const user = await User.findOne({ phone }).select('name role phone');

  res.json({
    success: true,
    data: {
      exists: Boolean(user),
      user: user ? { name: user.name, role: user.role, phone: user.phone } : null,
    },
  });
});

export const validateForOtp = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const intent = req.body.intent === 'login' ? 'login' : 'signup';

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  const existingUser = await User.findOne({ phone });

  if (intent === 'login' && !existingUser) {
    throw new ApiError(400, 'No account found with this phone number. Please sign up.');
  }

  if (intent === 'signup' && existingUser) {
    throw new ApiError(400, 'An account with this phone number already exists. Please login.');
  }

  res.json({ success: true, message: 'Validation passed' });
});

export const verifyMsg91Token = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const accessToken = req.body.accessToken;
  const intent = req.body.intent === 'login' ? 'login' : 'signup';
  const name = String(req.body.name || '').trim();
  const role = normalizeRole(req.body.role);

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  if (!accessToken) {
    throw new ApiError(400, 'accessToken is required for verification');
  }

  await verifyMsg91AccessToken(accessToken);

  let user = await User.findOne({ phone }).select('+refreshTokenHash');

  if (intent === 'login') {
    if (!user) {
      throw new ApiError(400, 'No account found. Please sign up.');
    }
  } else {
    if (user) {
      throw new ApiError(400, 'An account with this phone number already exists. Please login.');
    }
    if (!name) {
      throw new ApiError(400, 'Name is required to create an account');
    }
    user = await User.create({
      name,
      email: buildPhonePlaceholderEmail(phone),
      password: buildPhonePlaceholderPassword(phone),
      phone,
      role,
      authProvider: 'phone',
      isMobileVerified: true,
    });
  }

  user.authProvider = user.authProvider || 'phone';
  user.isMobileVerified = true;
  await sendAuthResponse(user, res);
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const normalizedEmail = normalizeEmail(email);
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone: normalizePhone(phone),
    role: normalizeRole(role),
    authProvider: 'local',
    isMobileVerified: false,
  });

  await sendAuthResponse(user, res);
});

export const registerWithPhone = asyncHandler(async (req, res) => {
  const { name, phone: rawPhone, role } = req.body;
  const phone = normalizePhone(rawPhone);

  if (!name || !phone) {
    throw new ApiError(400, 'Name and phone are required');
  }

  const existingPhoneUser = await User.findOne({ phone });
  if (existingPhoneUser) {
    throw new ApiError(409, 'An account with this phone number already exists');
  }

  const user = await User.create({
    name,
    email: buildPhonePlaceholderEmail(phone),
    password: buildPhonePlaceholderPassword(phone),
    phone,
    role: normalizeRole(role),
    authProvider: 'phone',
    isMobileVerified: true,
  });

  await sendAuthResponse(user, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password +refreshTokenHash');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.authProvider === 'google') {
    throw new ApiError(400, 'This account uses Google Sign-In. Please continue with Google.');
  }

  if (!(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account is disabled');
  }

  await sendAuthResponse(user, res);
});

export const loginWithGoogle = asyncHandler(async (req, res) => {
  const googleProfile = await verifyGoogleCredential(req.body.credential);
  const role = normalizeRole(req.body.role);
  const googleId = String(googleProfile.sub);
  const email = normalizeEmail(googleProfile.email);

  let user = await User.findOne({ googleId }).select('+refreshTokenHash');

  if (!user) {
    user = await User.findOne({ email }).select('+refreshTokenHash');
  }

  if (user) {
    if (!user.isActive) {
      throw new ApiError(403, 'This account is disabled');
    }

    user.googleId = user.googleId || googleId;
    user.authProvider = user.authProvider || 'google';
    if (!user.avatar && googleProfile.picture) {
      user.avatar = String(googleProfile.picture);
    }
    if (!user.name && googleProfile.name) {
      user.name = String(googleProfile.name);
    }
    await user.save({ validateBeforeSave: false });
    await sendAuthResponse(user, res);
    return;
  }

  user = await User.create({
    name: String(googleProfile.name || email.split('@')[0] || 'Google User').trim(),
    email,
    password: buildGooglePlaceholderPassword(),
    role,
    avatar: String(googleProfile.picture || ''),
    authProvider: 'google',
    googleId,
    phone: '',
    isMobileVerified: false,
  });

  await sendAuthResponse(user, res);
});

export const loginWithPhone = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  const user = await User.findOne({ phone }).select('+refreshTokenHash');

  if (!user) {
    throw new ApiError(404, 'No account found for this phone number');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account is disabled');
  }

  await sendAuthResponse(user, res);
});

export const validateMobileVerification = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  const existingUser = await User.findOne({
    phone,
    _id: { $ne: req.user._id },
  }).select('_id');

  if (existingUser) {
    throw new ApiError(409, 'An account with this phone number already exists');
  }

  res.json({ success: true, message: 'Mobile number can be verified' });
});

export const verifyMobileForCurrentUser = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const accessToken = req.body.accessToken;

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  if (!accessToken) {
    throw new ApiError(400, 'accessToken is required for verification');
  }

  await verifyMsg91AccessToken(accessToken);

  const existingUser = await User.findOne({
    phone,
    _id: { $ne: req.user._id },
  }).select('_id');

  if (existingUser) {
    throw new ApiError(409, 'An account with this phone number already exists');
  }

  const user = await User.findById(req.user._id).select('+refreshTokenHash');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.phone = phone;
  user.isMobileVerified = true;
  await user.save({ validateBeforeSave: false });

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
