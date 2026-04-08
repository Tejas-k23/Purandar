import User from '../models/User.js';
import Property from '../models/Property.js';
import Project from '../models/Project.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-refreshTokenHash -password')
    .populate({
      path: 'savedProperties',
      match: { status: 'approved' },
      select: 'title propertyType city locality price photos status intent',
    });

  res.json({ success: true, data: user });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'location', 'bio', 'avatar'];
  const updates = {};

  for (const field of allowedFields) {
    if (field in req.body) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-refreshTokenHash -password');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

export const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({
    owner: req.user._id,
    status: { $ne: 'archived' },
  }).sort({ updatedAt: -1 });

  const projects = await Project.find({
    owner: req.user._id,
    status: { $ne: 'archived' },
  }).sort({ updatedAt: -1 });

  projects.forEach((project) => {
    if (!Array.isArray(project.projectImages) || project.projectImages.length === 0) {
      const fallback = (project.images || []).map((image) => image?.url).filter(Boolean);
      if (fallback.length) {
        project.projectImages = fallback;
      }
    }
  });

  res.json({ success: true, data: { properties, projects } });
});

export const getSavedProperties = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedProperties',
    match: { status: 'approved' },
    populate: {
      path: 'owner',
      select: 'name phone email',
    },
  });

  res.json({ success: true, data: user.savedProperties });
});

export const saveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.propertyId, status: 'approved' });
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedProperties: property._id } },
    { new: true },
  ).populate({
    path: 'savedProperties',
    match: { status: 'approved' },
  });

  res.json({
    success: true,
    message: 'Property saved successfully',
    data: user.savedProperties,
  });
});

export const unsaveProperty = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedProperties: req.params.propertyId } },
    { new: true },
  ).populate({
    path: 'savedProperties',
    match: { status: 'approved' },
  });

  res.json({
    success: true,
    message: 'Property removed from saved list',
    data: user.savedProperties,
  });
});

export const getMyEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find({
    $or: [{ propertyOwner: req.user._id }, { user: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .populate('property', 'title city locality price photos status')
    .populate('user', 'name email phone');

  res.json({ success: true, data: enquiries });
});
