import cron from 'node-cron';
import Setting from '../models/Setting.js';
import { expireOutdatedSubscriptions } from '../utils/subscriptions.js';

export const runSubscriptionMaintenance = async () => {
  await expireOutdatedSubscriptions();

  const settings = await Setting.getSingleton();
  if (settings.launchDate && !settings.isPricingActive && new Date() >= settings.launchDate) {
    settings.isPricingActive = true;
    await settings.save();
  }
};

export const scheduleSubscriptionMaintenance = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await runSubscriptionMaintenance();
      // eslint-disable-next-line no-console
      console.info('Subscription maintenance job completed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Subscription maintenance job failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });
};
