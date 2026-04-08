import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import Project from '../models/Project.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const MAX_FEEDBACK_LENGTH = 200;

const getProjectByIdentifier = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Project.findOne({ $or: [{ _id: identifier }, { slug: identifier }] });
  }
  return Project.findOne({ slug: identifier });
};

export const listProjectFeedback = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const project = await getProjectByIdentifier(identifier);

  if (!project || project.visible === false || project.status !== 'approved') {
    throw new ApiError(404, 'Project not found');
  }

  const items = await Feedback.find({ project: project._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: items });
});

export const createProjectFeedback = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const project = await getProjectByIdentifier(identifier);

  if (!project || project.visible === false || project.status !== 'approved') {
    throw new ApiError(404, 'Project not found');
  }

  const { name, rating, feedback } = req.body;
  if (!name || !String(name).trim()) {
    throw new ApiError(400, 'Name is required');
  }
  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }
  if (!feedback || !String(feedback).trim()) {
    throw new ApiError(400, 'Feedback is required');
  }
  if (String(feedback).length > MAX_FEEDBACK_LENGTH) {
    throw new ApiError(400, `Feedback must be under ${MAX_FEEDBACK_LENGTH} characters`);
  }

  const created = await Feedback.create({
    project: project._id,
    user: req.user?._id || null,
    name: String(name).trim(),
    rating: numericRating,
    feedback: String(feedback).trim(),
  });

  res.status(201).json({ success: true, data: created });
});

export const listAllFeedback = asyncHandler(async (_req, res) => {
  const items = await Feedback.find()
    .sort({ createdAt: -1 })
    .populate('project', 'projectName slug')
    .populate('user', 'name email');

  res.json({ success: true, data: items });
});

export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  res.json({ success: true, message: 'Feedback deleted' });
});
