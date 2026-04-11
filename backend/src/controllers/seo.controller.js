import Property from '../models/Property.js';
import Project from '../models/Project.js';
import Blog from '../models/Blog.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import { env } from '../config/env.js';

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

const xmlEscape = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const toIsoDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const getSitemap = asyncHandler(async (_req, res) => {
  const baseUrl = (env.CLIENT_URL || 'https://purandar-pi.vercel.app').replace(/\/$/, '');
  const staticPaths = [
    '/',
    '/buy',
    '/rent',
    '/projects',
    '/news-insights',
    '/contact',
    '/why-invest',
    '/post-property',
  ];

  const [properties, projects, blogs] = await Promise.all([
    Property.find({ status: 'approved' }).select('_id updatedAt').lean(),
    Project.find({ status: 'approved', visible: { $ne: false } }).select('_id slug updatedAt').lean(),
    Blog.find({ status: 'published' }).select('slug updatedAt publishDate').lean(),
  ]);

  const urls = [];

  for (const path of staticPaths) {
    urls.push({
      loc: `${baseUrl}${path}`,
      lastmod: '',
    });
  }

  for (const property of properties) {
    urls.push({
      loc: `${baseUrl}/property/${property._id}`,
      lastmod: toIsoDate(property.updatedAt),
    });
  }

  for (const project of projects) {
    const identifier = project.slug || project._id;
    urls.push({
      loc: `${baseUrl}/projects/${identifier}`,
      lastmod: toIsoDate(project.updatedAt),
    });
  }

  for (const blog of blogs) {
    if (!blog.slug) continue;
    urls.push({
      loc: `${baseUrl}/news-insights/${blog.slug}`,
      lastmod: toIsoDate(blog.publishDate || blog.updatedAt),
    });
  }

  const xmlItems = urls.map((item) => (
    `  <url>
    <loc>${xmlEscape(item.loc)}</loc>${item.lastmod ? `
    <lastmod>${xmlEscape(item.lastmod)}</lastmod>` : ''}
  </url>`
  )).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${xmlItems}\n` +
    `</urlset>\n`;

  res.set('Content-Type', 'application/xml');
  res.status(200).send(xml);
});
