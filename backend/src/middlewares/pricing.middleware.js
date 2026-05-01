import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';

const getSettings = async () => {
  return Setting.getEffectiveSingleton();
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
