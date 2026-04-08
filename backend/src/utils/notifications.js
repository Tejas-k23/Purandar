import admin from 'firebase-admin';
import Notification from '../models/Notification.js';
import NotificationToken from '../models/NotificationToken.js';

const getFirebaseConfig = () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

const initFirebase = () => {
  if (admin.apps.length) return admin.app();
  const { projectId, clientEmail, privateKey } = getFirebaseConfig();
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
};

const buildMessage = ({ title, body, data = {} }) => ({
  notification: { title, body },
  data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
});

const matchPreferences = (token, context = {}) => {
  const prefs = token.preferences || {};
  if (prefs.cities?.length && context.city && !prefs.cities.includes(context.city)) {
    return false;
  }
  if (prefs.intents?.length && context.intent && !prefs.intents.includes(context.intent)) {
    return false;
  }
  if (prefs.propertyTypes?.length && context.propertyType && !prefs.propertyTypes.includes(context.propertyType)) {
    return false;
  }
  return true;
};

export const sendNotificationToTokens = async ({
  tokens = [],
  title,
  body,
  data,
  context,
}) => {
  if (!tokens.length) return { successCount: 0, failureCount: 0 };
  const app = initFirebase();
  if (!app) return { successCount: 0, failureCount: 0 };

  const filtered = tokens.filter((token) => matchPreferences(token, context));
  if (!filtered.length) return { successCount: 0, failureCount: 0 };

  const payload = buildMessage({ title, body, data });
  const response = await admin.messaging().sendEachForMulticast({
    tokens: filtered.map((item) => item.token),
    ...payload,
  });

  return response;
};

export const saveNotificationsForUsers = async ({ users = [], role, title, body, data }) => {
  if (!users.length) return;
  const entries = users.map((userId) => ({
    user: userId,
    role,
    title,
    body,
    data,
  }));
  await Notification.insertMany(entries);
};

export const fetchTokens = async (query) => NotificationToken.find(query);

export const removeInvalidTokens = async (tokens = []) => {
  if (!tokens.length) return;
  await NotificationToken.deleteMany({ token: { $in: tokens } });
};
