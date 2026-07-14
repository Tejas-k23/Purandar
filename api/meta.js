/**
 * Vercel Serverless Function
 * This intercepts requests from social media crawlers to /property/:id and /projects/:id
 * and serves HTML with proper OG tags instead of the SPA HTML.
 *
 * Route: /api/meta.js
 * Access: Called automatically by Vercel routing rules
 */

const BACKEND_URL = process.env.VITE_API_BASE_URL || 'https://purandar.onrender.com';
const FRONTEND_URL = process.env.VITE_APP_URL || 'https://purandarprimeproperties.com';

const isSocialMediaCrawler = (userAgent = '') => {
  const crawlers = [
    'facebookexternalhit', 'Facebot',
    'Twitterbot', 'TwitterBot',
    'LinkedInBot', 'linkedin',
    'WhatsApp', 'Whatsapp',
    'TelegramBot', 'Telegram',
    'Discordbot', 'Discord',
    'Slackbot', 'Slack',
    'Skype', 'Googlebot',
    'Bingbot', 'MSNBot',
    'DuckDuckBot', 'OpenGraph',
    'curl', 'wget', 'python',
  ];
  const ua = userAgent.toLowerCase();
  return crawlers.some(bot => ua.includes(bot.toLowerCase()));
};

const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const formatPrice = (price) => {
  if (!price) return '';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

const generatePropertyMetaHTML = (property) => {
  const propertyUrl = `${FRONTEND_URL}/property/${property._id}`;
  const title = property.title || `${property.propertyType || 'Property'} in ${property.locality || property.city}`;
  const price = property.price ? formatPrice(property.price) : '';
  const location = [property.locality, property.city].filter(Boolean).join(', ');
  const description = property.description?.substring(0, 160) ||
    `${title} - ${location}${price ? ' - ' + price : ''}`;
  const image = property.imageUrls?.[0] || property.images?.[0] || `${FRONTEND_URL}/og-default.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>

  <!-- Property Meta Tags -->
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${propertyUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Purandar Prime Properties" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:site" content="@PurandarPrime" />

  <!-- Standard Meta Tags -->
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Redirect to actual property page -->
  <script>
    if (typeof window !== 'undefined' && !navigator.userAgent.match(/bot|crawler|spider/i)) {
      window.location.replace('/property/${property._id}');
    }
  </script>
  <meta http-equiv="refresh" content="2;url=/property/${property._id}" />
</head>
<body>
  <p>Redirecting to property...</p>
</body>
</html>`;
};

const generateProjectMetaHTML = (project) => {
  const projectPath = project.slug || project._id;
  const projectUrl = `${FRONTEND_URL}/projects/${projectPath}`;
  const title = project.projectName || `${project.projectType || 'Project'} in ${project.area || project.city || project.address}`;
  const location = [project.area, project.city, project.address].filter(Boolean).join(', ');
  const description = project.shortDescription || project.detailedDescription?.substring(0, 160) ||
    `${title}${location ? ` in ${location}` : ''}${project.developerName ? ` by ${project.developerName}` : ''}`;
  const image = project.coverImage || (Array.isArray(project.projectImages) ? project.projectImages[0] : undefined) || `${FRONTEND_URL}/og-default.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>

  <!-- Project Meta Tags -->
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${projectUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Purandar Prime Properties" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:site" content="@PurandarPrime" />

  <!-- Standard Meta Tags -->
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Redirect to actual project page -->
  <script>
    if (typeof window !== 'undefined' && !navigator.userAgent.match(/bot|crawler|spider/i)) {
      window.location.replace('/projects/${projectPath}');
    }
  </script>
  <meta http-equiv="refresh" content="2;url=/projects/${projectPath}" />
</head>
<body>
  <p>Redirecting to project...</p>
</body>
</html>`;
};

export default async (req, res) => {
  try {
    const { propertyId, projectId } = req.query;
    
    if (!propertyId && !projectId) {
      return res.status(400).json({ error: 'Property ID or Project ID is required' });
    }

    const resourceType = propertyId ? 'properties' : 'projects';
    const resourceId = propertyId || projectId;

    const response = await fetch(
      `${BACKEND_URL}/api/v1/${resourceType}/${resourceId}`,
      {
        headers: {
          'User-Agent': 'Vercel-Meta-Server/1.0',
        },
      }
    );

    if (!response.ok) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Not Found</title></head>
        <body><h1>Item not found</h1></body>
        </html>
      `);
    }

    const { data } = await response.json();
    const item = data;

    const htmlContent = propertyId
      ? generatePropertyMetaHTML(item)
      : generateProjectMetaHTML(item);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Meta API Error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body><h1>Error generating meta tags</h1></body>
      </html>
    `);
  }
};
