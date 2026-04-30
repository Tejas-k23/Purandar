import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';

const getSettings = async () => {
  const settings = await Setting.getSingleton();
  if (settings.launchDate && !settings.isPricingActive && new Date() >= settings.launchDate) {
    settings.isPricingActive = true;
    await settings.save();
  }
  return settings;
};

export const pricingEnabled = async (req, _res, next) => {
  const settings = await getSettings();
  if (!settings.isPricingActive) {
    throw new ApiError(403, 'Pricing is not active yet');
  }
  next();
};

export const getPricingSettings = async (req, _res, next) => {
  req.pricingSettings = await getSettings();
  next();
};
