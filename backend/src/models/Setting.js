import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    isPricingActive: {
      type: Boolean,
      default: false,
    },
    launchDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

settingSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingSchema.statics.getEffectiveSingleton = async function getEffectiveSingleton() {
  const settings = await this.getSingleton();

  if (settings.launchDate && !settings.isPricingActive && new Date() >= settings.launchDate) {
    settings.isPricingActive = true;
    await settings.save();
  }

  return settings;
};

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
