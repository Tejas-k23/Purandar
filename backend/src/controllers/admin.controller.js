import User from '../models/User.js';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { deleteManyFromR2 } from '../utils/r2.js';
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
  await deleteManyFromR2(imageKeys);

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

export const getEnquiries = asyncHandler(async (_req, res) => {
  const enquiries = await Enquiry.find()
    .sort({ createdAt: -1 })
    .populate('property', 'title city locality')
    .populate('propertyOwner', 'name email phone')
    .populate('user', 'name email phone');

  res.json({ success: true, data: enquiries });
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


