import Blog from '../models/Blog.js';
import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sanitizeHtml, sanitizePlainText } from '../utils/sanitizeHtml.js';
import slugify from '../utils/slugify.js';
import { env } from '../config/env.js';

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => sanitizePlainText(tag)).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => sanitizePlainText(tag)).filter(Boolean);
  }
  return [];
};

const normalizePayload = (payload = {}) => {
  const title = sanitizePlainText(payload.title || '');
  const slug = slugify(payload.slug || title);

  return {
    title,
    slug,
    featuredImage: String(payload.featuredImage || '').trim(),
    shortDescription: sanitizePlainText(payload.shortDescription || ''),
    content: sanitizeHtml(payload.content || ''),
    author: sanitizePlainText(payload.author || ''),
    category: sanitizePlainText(payload.category || ''),
    tags: normalizeTags(payload.tags),
    metaTitle: sanitizePlainText(payload.metaTitle || title).slice(0, 70),
    metaDescription: sanitizePlainText(payload.metaDescription || payload.shortDescription || '').slice(0, 170),
    publishDate: payload.publishDate ? new Date(payload.publishDate) : null,
    status: payload.status === 'published' ? 'published' : 'draft',
  };
};

const ensureUniqueSlug = async (slug, blogId = null) => {
  const existing = await Blog.findOne({ slug, ...(blogId ? { _id: { $ne: blogId } } : {}) }).select('_id');
  if (existing) {
    throw new ApiError(409, 'Slug already exists');
  }
};

export const listBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(12, Number(req.query.limit || 6));
  const skip = (page - 1) * limit;
  const filter = { status: 'published' };

  if (req.query.category) {
    filter.category = new RegExp(req.query.category, 'i');
  }

  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { title: regex },
      { shortDescription: regex },
      { tags: regex },
      { author: regex },
    ];
  }

  const [items, total, categories] = await Promise.all([
    Blog.find(filter).sort({ publishDate: -1, createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter),
    Blog.distinct('category', { status: 'published', category: { $ne: '' } }),
  ]);

  res.json({
    success: true,
    data: {
      items,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
  if (!blog) throw new ApiError(404, 'Blog not found');

  const related = await Blog.find({
    _id: { $ne: blog._id },
    category: blog.category,
    status: 'published',
  }).sort({ publishDate: -1, createdAt: -1 }).limit(3);

  res.json({ success: true, data: { blog, related } });
});

export const listAdminBlogs = asyncHandler(async (_req, res) => {
  const blogs = await Blog.find().sort({ updatedAt: -1, publishDate: -1 });
  res.json({ success: true, data: blogs });
});

export const getAdminBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.json({ success: true, data: blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  if (!payload.title) throw new ApiError(400, 'Title is required');
  if (!payload.shortDescription) throw new ApiError(400, 'Short description is required');
  if (!payload.content) throw new ApiError(400, 'Full content is required');
  await ensureUniqueSlug(payload.slug);

  if (payload.status === 'published' && !payload.publishDate) {
    payload.publishDate = new Date();
  }

  const blog = await Blog.create(payload);
  res.status(201).json({ success: true, data: blog, message: 'Blog created successfully' });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const existing = await Blog.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Blog not found');

  const payload = normalizePayload({ ...existing.toObject(), ...req.body });
  await ensureUniqueSlug(payload.slug, existing._id);

  if (payload.status === 'published' && !payload.publishDate) {
    payload.publishDate = new Date();
  }

  Object.assign(existing, payload);
  await existing.save();

  res.json({ success: true, data: existing, message: 'Blog updated successfully' });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.json({ success: true, message: 'Blog deleted successfully' });
});

export const getSitemapXml = asyncHandler(async (_req, res) => {
  const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt publishDate').sort({ publishDate: -1 });
  const [cities, localities, subLocalities, landmarks] = await Promise.all([
    Property.distinct('city', { status: 'approved' }),
    Property.distinct('locality', { status: 'approved' }),
    Property.distinct('subLocality', { status: 'approved' }),
    Property.distinct('landmark', { status: 'approved' }),
  ]);
  const base = env.CLIENT_URL.replace(/\/$/, '');
  const staticRoutes = ['/', '/buy', '/rent', '/projects', '/news-insights'];

  const uniqueBySlug = (values = []) => {
    const map = new Map();
    values
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .forEach((value) => {
        const slug = slugify(value);
        if (slug && !map.has(slug)) {
          map.set(slug, value);
        }
      });
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  };

  const locationSlugs = uniqueBySlug([...cities, ...localities, ...subLocalities]);
  const landmarkSlugs = uniqueBySlug(landmarks);

  const urls = [
    ...staticRoutes.map((path) => ({
      loc: `${base}${path}`,
      lastmod: new Date().toISOString(),
    })),
    ...blogs.map((blog) => ({
      loc: `${base}/news-insights/${blog.slug}`,
      lastmod: (blog.updatedAt || blog.publishDate || new Date()).toISOString(),
    })),
    ...locationSlugs.map((item) => ({
      loc: `${base}/property-in-${item.slug}`,
      lastmod: new Date().toISOString(),
    })),
    ...landmarkSlugs.map((item) => ({
      loc: `${base}/property-near-${item.slug}`,
      lastmod: new Date().toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => `  <url><loc>${item.loc}</loc><lastmod>${item.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});
