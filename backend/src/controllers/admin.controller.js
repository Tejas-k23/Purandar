import User from '../models/User.js';
import Property from '../models/Property.js';
import Project from '../models/Project.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { deleteManyFromR2 } from '../utils/r2.js';
import {
  fetchTokens,
  removeInvalidTokens,
  saveNotificationsForUsers,
  sendNotificationToTokens,
} from '../utils/notifications.js';
export {
  listAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from './blog.controller.js';


export const getDashboard = asyncHandler(async (_req, res) => {
  const [users, properties, enquiries, featuredHomes, propertySummary] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments({ status: { $ne: 'archived' } }),
    Enquiry.countDocuments(),
    Property.countDocuments({ featuredOnHome: true, status: 'approved' }),
    Property.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const statusCounts = propertySummary.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totals: {
        users,
        properties,
        enquiries,
        featuredHomes,
      },
      propertiesByStatus: {
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        rejected: statusCounts.rejected || 0,
        archived: statusCounts.archived || 0,
      },
    },
  });
});


export const getAdminPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('owner', 'name email phone role');

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  res.json({ success: true, data: property });
});
export const getAdminProperties = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.city) {
    filter.city = new RegExp(req.query.city, 'i');
  }
  if (req.query.featuredOnHome === 'true') {
    filter.featuredOnHome = true;
  }

  const properties = await Property.find(filter)
    .sort({ featuredOnHome: -1, createdAt: -1 })
    .populate('owner', 'name email phone role');

  res.json({ success: true, data: properties });
});

export const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { status, moderationMessage = '' } = req.body;
  if (!['approved', 'rejected', 'pending', 'archived'].includes(status)) {
    throw new ApiError(400, 'Invalid moderation status');
  }
  if (status === 'rejected' && !String(moderationMessage || '').trim()) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  property.status = status;
  property.moderationMessage = moderationMessage;
  property.approvedAt = status === 'approved' ? new Date() : null;
  property.publishedAt = status === 'approved' ? (property.publishedAt || new Date()) : property.publishedAt;
  property.rejectedAt = status === 'rejected' ? new Date() : null;
  if (status !== 'approved') {
    property.featuredOnHome = false;
  }

  await property.save();

  res.json({
    success: true,
    message: 'Property status updated',
    data: property,
  });

  if (status === 'approved') {
    const userTokens = await fetchTokens({
      role: { $in: ['user', 'agent'] },
      enabledTypes: 'property_approved',
    });
    const guestTokens = await fetchTokens({
      role: 'guest',
      enabledTypes: 'guest_property',
    });
    const title = 'New property added';
    const body = `${property.title || 'A new property'} is now live.`;
    const data = { type: 'property_approved', propertyId: property._id.toString() };
    const context = { city: property.city, intent: property.intent, propertyType: property.propertyType };

    if (userTokens.length) {
      const response = await sendNotificationToTokens({ tokens: userTokens, title, body, data, context });
      const invalid = userTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
      await saveNotificationsForUsers({
        users: [...new Set(userTokens.map((token) => token.user).filter(Boolean))],
        role: 'user',
        title,
        body,
        data,
      });
    }

    if (guestTokens.length) {
      const guestBody = `${property.title || 'A new property'} is live. Sign up to get full details.`;
      const response = await sendNotificationToTokens({
        tokens: guestTokens,
        title: 'New property alert',
        body: guestBody,
        data: { ...data, cta: 'signup' },
        context,
      });
      const invalid = guestTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
    }
  }

  if (status === 'rejected' && property.owner) {
    const ownerTokens = await fetchTokens({
      user: property.owner,
      enabledTypes: { $in: ['property_approved', 'project_approved', 'enquiry', 'property_pending'] },
    });
    const title = 'Property rejected';
    const body = moderationMessage || 'Your property was rejected. Please review the feedback and resubmit.';
    const data = { type: 'property_rejected', propertyId: property._id.toString() };
    const context = { city: property.city, intent: property.intent, propertyType: property.propertyType };

    if (ownerTokens.length) {
      const response = await sendNotificationToTokens({ tokens: ownerTokens, title, body, data, context });
      const invalid = ownerTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
    }

    await saveNotificationsForUsers({
      users: [property.owner],
      role: 'user',
      title,
      body,
      data,
    });
  }
});

export const togglePropertyFeatured = asyncHandler(async (req, res) => {
  const { featuredOnHome } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.status !== 'approved' && featuredOnHome) {
    throw new ApiError(400, 'Only approved properties can be featured on the home page');
  }

  property.featuredOnHome = Boolean(featuredOnHome);
  await property.save();

  res.json({
    success: true,
    message: property.featuredOnHome ? 'Property added to home recommendations' : 'Property removed from home recommendations',
    data: property,
  });
});

export const deleteAdminProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const imageKeys = (property.images || []).map((image) => image.key).filter(Boolean);
  const videoKeys = (property.videos || []).map((video) => video.key).filter(Boolean);
  await deleteManyFromR2([...imageKeys, ...videoKeys]);

  await Enquiry.deleteMany({ property: property._id });

  res.json({
    success: true,
    message: 'Property deleted permanently',
  });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select('-password -refreshTokenHash')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Admin users cannot be deleted');
  }

  if (String(user._id) === String(req.user?._id)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const [properties, projects] = await Promise.all([
    Property.find({ owner: user._id }),
    Project.find({ owner: user._id }),
  ]);

  const propertyKeys = properties.flatMap((property) => [
    ...(property.images || []).map((image) => image.key),
    ...(property.videos || []).map((video) => video.key),
  ]).filter(Boolean);

  const projectKeys = projects.flatMap((project) => [
    ...(project.images || []).map((image) => image.key),
    ...(project.videos || []).map((video) => video.key),
  ]).filter(Boolean);

  if (propertyKeys.length || projectKeys.length) {
    await deleteManyFromR2([...propertyKeys, ...projectKeys]);
  }

  await Promise.all([
    Property.deleteMany({ owner: user._id }),
    Project.deleteMany({ owner: user._id }),
    Enquiry.deleteMany({ user: user._id }),
    Enquiry.deleteMany({ propertyOwner: user._id }),
    User.findByIdAndDelete(user._id),
  ]);

  res.json({ success: true, message: 'User deleted successfully' });
});

export const getEnquiries = asyncHandler(async (_req, res) => {
  const enquiries = await Enquiry.find()
    .sort({ createdAt: -1 })
    .populate('property', 'title city locality')
    .populate('project', 'projectName city area slug')
    .populate('propertyOwner', 'name email phone')
    .populate('user', 'name email phone');

  res.json({ success: true, data: enquiries });
});

export const getAdminProjects = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }
  if (req.query.city) {
    filter.city = new RegExp(req.query.city, 'i');
  }
  if (req.query.featuredOnHome === 'true') {
    filter.featuredOnHome = true;
  }

  const projects = await Project.find(filter)
    .sort({ featuredOnHome: -1, createdAt: -1 })
    .populate('owner', 'name email phone role');

  res.json({ success: true, data: projects });
});

export const updateProjectStatus = asyncHandler(async (req, res) => {
  const { status, moderationMessage = '' } = req.body;
  if (!['approved', 'rejected', 'pending', 'archived'].includes(status)) {
    throw new ApiError(400, 'Invalid moderation status');
  }
  if (status === 'rejected' && !String(moderationMessage || '').trim()) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  project.status = status;
  project.moderationMessage = moderationMessage;
  project.approvedAt = status === 'approved' ? new Date() : null;
  project.publishedAt = status === 'approved' ? (project.publishedAt || new Date()) : project.publishedAt;
  project.rejectedAt = status === 'rejected' ? new Date() : null;
  if (status !== 'approved') {
    project.featuredOnHome = false;
  }

  await project.save();

  res.json({
    success: true,
    message: 'Project status updated',
    data: project,
  });

  if (status === 'approved') {
    const userTokens = await fetchTokens({
      role: { $in: ['user', 'agent'] },
      enabledTypes: 'project_approved',
    });
    const guestTokens = await fetchTokens({
      role: 'guest',
      enabledTypes: 'guest_project',
    });
    const title = 'New project launched';
    const body = `${project.projectName || 'A new project'} is now live.`;
    const data = { type: 'project_approved', projectId: project._id.toString() };
    const context = { city: project.city, propertyType: project.projectType };

    if (userTokens.length) {
      const response = await sendNotificationToTokens({ tokens: userTokens, title, body, data, context });
      const invalid = userTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
      await saveNotificationsForUsers({
        users: [...new Set(userTokens.map((token) => token.user).filter(Boolean))],
        role: 'user',
        title,
        body,
        data,
      });
    }

    if (guestTokens.length) {
      const guestBody = `${project.projectName || 'A new project'} is live. Create an account to explore more.`;
      const response = await sendNotificationToTokens({
        tokens: guestTokens,
        title: 'New project alert',
        body: guestBody,
        data: { ...data, cta: 'signup' },
        context,
      });
      const invalid = guestTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
    }
  }

  if (status === 'rejected' && project.owner) {
    const ownerTokens = await fetchTokens({
      user: project.owner,
      enabledTypes: { $in: ['property_approved', 'project_approved', 'enquiry', 'project_pending'] },
    });
    const title = 'Project rejected';
    const body = moderationMessage || 'Your project was rejected. Please review the feedback and resubmit.';
    const data = { type: 'project_rejected', projectId: project._id.toString() };
    const context = { city: project.city, propertyType: project.projectType };

    if (ownerTokens.length) {
      const response = await sendNotificationToTokens({ tokens: ownerTokens, title, body, data, context });
      const invalid = ownerTokens
        .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
        .map((token) => token.token);
      await removeInvalidTokens(invalid);
    }

    await saveNotificationsForUsers({
      users: [project.owner],
      role: 'user',
      title,
      body,
      data,
    });
  }
});

export const sendCustomNotification = asyncHandler(async (req, res) => {
  const {
    title,
    body,
    audience = 'users',
    criteria = {},
  } = req.body;

  if (!title || !body) {
    throw new ApiError(400, 'title and body are required');
  }

  const roleFilter = (() => {
    if (audience === 'admins') return { role: 'admin' };
    if (audience === 'guests') return { role: 'guest' };
    if (audience === 'all') return { role: { $in: ['admin', 'user', 'agent', 'guest'] } };
    return { role: { $in: ['user', 'agent'] } };
  })();

  const tokens = await fetchTokens(roleFilter);
  const context = {
    city: criteria.city || '',
    intent: criteria.intent || '',
    propertyType: criteria.propertyType || '',
  };

  const response = await sendNotificationToTokens({
    tokens,
    title,
    body,
    data: { type: 'custom' },
    context,
  });

  const invalid = tokens
    .filter((_, index) => response.responses?.[index] && !response.responses[index].success)
    .map((token) => token.token);
  await removeInvalidTokens(invalid);

  if (audience !== 'guests') {
    const userIds = [...new Set(tokens.map((token) => token.user).filter(Boolean))];
    if (userIds.length) {
      await saveNotificationsForUsers({
        users: userIds,
        role: audience === 'admins' ? 'admin' : 'user',
        title,
        body,
        data: { type: 'custom' },
      });
    }
  }

  res.json({
    success: true,
    message: 'Notification queued',
    data: { successCount: response.successCount, failureCount: response.failureCount },
  });
});

export const deleteAdminProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const keys = [
    ...(project.images || []).map((image) => image.key),
    ...(project.videos || []).map((video) => video.key),
  ].filter(Boolean);

  await deleteManyFromR2(keys);

  await Enquiry.deleteMany({ project: project._id });

  res.json({
    success: true,
    message: 'Project deleted permanently',
  });
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'closed'].includes(status)) {
    throw new ApiError(400, 'Invalid enquiry status');
  }

  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  )
    .populate('property', 'title city locality')
    .populate('propertyOwner', 'name email phone')
    .populate('user', 'name email phone');

  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found');
  }

  res.json({
    success: true,
    message: 'Enquiry status updated',
    data: enquiry,
  });
});


