import Property from '../models/Property.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeLabel = (value = '') => String(value || '').trim();

const findCityForLocation = async (value, kind) => {
  const regex = new RegExp(escapeRegex(value), 'i');
  if (kind === 'landmark') {
    const doc = await Property.findOne({ status: 'approved', landmark: regex }).select('city');
    return doc?.city || '';
  }

  const doc = await Property.findOne({
    status: 'approved',
    $or: [{ city: regex }, { locality: regex }, { subLocality: regex }],
  }).select('city');

  return doc?.city || '';
};

export const getNearbyLocations = asyncHandler(async (req, res) => {
  const rawLocation = normalizeLabel(req.query.location);
  const kind = req.query.kind === 'landmark' ? 'landmark' : 'location';

  if (!rawLocation) {
    res.json({ success: true, data: [] });
    return;
  }

  const city = await findCityForLocation(rawLocation, kind);
  const match = { status: 'approved' };
  if (city) match.city = city;

  const groupField = kind === 'landmark' ? '$landmark' : '$locality';
  const nonEmptyField = kind === 'landmark' ? 'landmark' : 'locality';

  const results = await Property.aggregate([
    { $match: { ...match, [nonEmptyField]: { $ne: '' } } },
    { $group: { _id: groupField, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 12 },
  ]);

  const currentSlug = slugify(rawLocation);
  const seen = new Set();
  const data = results
    .map((item) => normalizeLabel(item._id))
    .filter(Boolean)
    .map((label) => ({ label, slug: slugify(label), kind }))
    .filter((item) => item.slug && item.slug !== currentSlug && !seen.has(item.slug) && seen.add(item.slug))
    .slice(0, 6);

  res.json({ success: true, data });
});
