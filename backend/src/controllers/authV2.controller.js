import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import NotificationSetting from '../models/NotificationSetting.js';
import NotificationToken from '../models/NotificationToken.js';
import Project from '../models/Project.js';
import Property from '../models/Property.js';
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
const roleRank = { user: 1, agent: 2, admin: 3 };

const buildPhonePlaceholderEmail = (phone) => `phone.${phone}@purandar.local`;
const buildPhonePlaceholderPassword = (phone) => `PhoneAuth@${phone}`;
const buildGooglePlaceholderPassword = () => `GoogleAuth@${crypto.randomUUID()}Aa1`;
const isGoogleLinkedUser = (user) => Boolean(user?.googleId) || user?.authProvider === 'google';
const pickHigherRole = (left = 'user', right = 'user') =>
  (roleRank[left] || roleRank.user) >= (roleRank[right] || roleRank.user) ? left : right;
const maskEmail = (email = '') => {
  const normalized = normalizeEmail(email);
  const [localPart, domain] = normalized.split('@');

  if (!localPart || !domain) return '';
  if (localPart.length <= 2) return `${localPart.charAt(0) || '*'}*@${domain}`;

  return `${localPart.slice(0, 2)}***@${domain}`;
};
const buildMergePreview = (user) => ({
  id: user._id,
  name: user.name || 'Existing user',
  email: maskEmail(user.email),
  phone: user.phone || '',
  role: user.role || 'user',
  authProvider: user.authProvider || (String(user.email || '').endsWith('@purandar.local') ? 'phone' : 'local'),
});
const sendMergeRequiredResponse = (res, existingUser) =>
  res.status(409).json({
    success: false,
    code: 'MOBILE_ALREADY_IN_USE',
    message: 'This mobile number is already linked to another account. Merge it with your Google account or use a different number.',
    data: {
      canMerge: true,
      existingAccount: buildMergePreview(existingUser),
    },
  });

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

const mergeUserIntoCurrentAccount = async ({ currentUser, existingUser, phone }) => {
  if (!currentUser || !existingUser) {
    throw new ApiError(400, 'Both accounts are required for merge');
  }

  const mergedSavedProperties = Array.from(new Set([
    ...(currentUser.savedProperties || []).map((item) => item.toString()),
    ...(existingUser.savedProperties || []).map((item) => item.toString()),
  ]));

  currentUser.role = pickHigherRole(currentUser.role, existingUser.role);
  currentUser.name = currentUser.name || existingUser.name;
  currentUser.location = currentUser.location || existingUser.location || '';
  currentUser.bio = currentUser.bio || existingUser.bio || '';
  currentUser.avatar = currentUser.avatar || existingUser.avatar || '';
  currentUser.phone = phone;
  currentUser.isMobileVerified = true;
  currentUser.savedProperties = mergedSavedProperties;
  currentUser.authProvider = isGoogleLinkedUser(currentUser) ? 'google' : (currentUser.authProvider || existingUser.authProvider || 'local');
  currentUser.googleId = currentUser.googleId || existingUser.googleId || '';
  currentUser.refreshTokenHash = null;
  currentUser.tokenVersion = Math.max(currentUser.tokenVersion || 0, existingUser.tokenVersion || 0) + 1;

  await currentUser.save({ validateBeforeSave: false });

  await Promise.all([
    Property.updateMany({ owner: existingUser._id }, { owner: currentUser._id, userName: currentUser.name }),
    Project.updateMany({ owner: existingUser._id }, { owner: currentUser._id }),
    Enquiry.updateMany({ user: existingUser._id }, { user: currentUser._id }),
    Enquiry.updateMany({ propertyOwner: existingUser._id }, { propertyOwner: currentUser._id }),
    Notification.updateMany({ user: existingUser._id }, { user: currentUser._id }),
    NotificationToken.updateMany({ user: existingUser._id }, { user: currentUser._id, role: currentUser.role }),
    NotificationSetting.updateMany({ updatedBy: existingUser._id }, { updatedBy: currentUser._id }),
    Feedback.updateMany({ user: existingUser._id }, { user: currentUser._id }),
  ]);

  await User.findByIdAndDelete(existingUser._id);
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
  }).select('_id name email phone role authProvider googleId');

  if (existingUser) {
    if (isGoogleLinkedUser(req.user)) {
      return res.json({
        success: true,
        message: 'Mobile number can be verified',
        data: {
          conflict: true,
          canMerge: true,
          existingAccount: buildMergePreview(existingUser),
        },
      });
    }
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
  }).select('_id name email phone role authProvider googleId isActive');

  if (existingUser) {
    if (isGoogleLinkedUser(req.user)) {
      if (existingUser.role === 'admin') {
        throw new ApiError(409, 'This mobile number belongs to an admin account and cannot be merged.');
      }

      if (existingUser.isActive === false) {
        throw new ApiError(409, 'This mobile number belongs to a disabled account. Please contact support.');
      }

      return sendMergeRequiredResponse(res, existingUser);
    }

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

export const mergeMobileAccount = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const accessToken = req.body.accessToken;

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  if (!accessToken) {
    throw new ApiError(400, 'accessToken is required for verification');
  }

  await verifyMsg91AccessToken(accessToken);

  const currentUser = await User.findById(req.user._id).select('+refreshTokenHash');

  if (!currentUser) {
    throw new ApiError(404, 'User not found');
  }

  if (!isGoogleLinkedUser(currentUser)) {
    throw new ApiError(403, 'Only Google-linked accounts can merge during mobile verification');
  }

  const existingUser = await User.findOne({
    phone,
    _id: { $ne: currentUser._id },
  }).select('+refreshTokenHash');

  if (!existingUser) {
    currentUser.phone = phone;
    currentUser.isMobileVerified = true;
    await currentUser.save({ validateBeforeSave: false });
    await sendAuthResponse(currentUser, res);
    return;
  }

  if (existingUser.role === 'admin') {
    throw new ApiError(409, 'This mobile number belongs to an admin account and cannot be merged.');
  }

  if (existingUser.isActive === false) {
    throw new ApiError(409, 'This mobile number belongs to a disabled account. Please contact support.');
  }

  await mergeUserIntoCurrentAccount({
    currentUser,
    existingUser,
    phone,
  });

  const mergedUser = await User.findById(currentUser._id).select('+refreshTokenHash');
  await sendAuthResponse(mergedUser, res);
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
