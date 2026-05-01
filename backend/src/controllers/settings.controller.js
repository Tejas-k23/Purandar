import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.getEffectiveSingleton();
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.getEffectiveSingleton();

  if ('isPricingActive' in req.body) {
    settings.isPricingActive = Boolean(req.body.isPricingActive);
  }

  if ('launchDate' in req.body) {
    settings.launchDate = req.body.launchDate ? new Date(req.body.launchDate) : null;
  }

  await settings.save();

  res.json({ success: true, data: settings });
});
