import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateMetaTagsHTML } from '../utils/metaTags.js';
import { env } from '../config/env.js';

/**
 * Serve HTML page with dynamic OG tags for social media crawlers
 * This endpoint is accessed by crawlers from WhatsApp, Facebook, LinkedIn, Twitter, etc.
 */
export const getPropertyMeta = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!id || id.length < 10) {
    throw new ApiError(404, 'Property not found');
  }

  // Fetch property from database
  const property = await Property.findById(id)
    .select('_id title description propertyType category intent locality city price bedrooms bathrooms totalArea plotArea carpetArea areaUnit imageUrls images')
    .lean();

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Generate meta tags HTML
  const metaTags = generateMetaTagsHTML(property, env.CLIENT_URL);

  // Build complete HTML page
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(property.title || 'Property')}</title>
  ${metaTags}
  
  <!-- Redirect to actual property page after crawlers parse meta tags -->
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('/property/${property._id}');
    }
  </script>
  
  <!-- Fallback redirect for crawlers that don't execute JS -->
  <meta http-equiv="refresh" content="0;url=/property/${property._id}" />
</head>
<body>
  <p>Redirecting to property page...</p>
</body>
</html>
  `;

  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    'X-Content-Type-Options': 'nosniff',
  });

  res.send(htmlContent);
});

/**
 * Get property meta data as JSON for client-side updates
 * Used by the React app to dynamically update meta tags
 */
export const getPropertyMetaJson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await Property.findById(id)
    .select('_id title description propertyType category intent locality city price bedrooms bathrooms totalArea plotArea carpetArea areaUnit imageUrls images')
    .lean();

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const price = property.price ? formatPrice(property.price) : '';
  const location = [property.locality, property.city].filter(Boolean).join(', ');
  const title = property.title || `${property.propertyType || 'Property'} in ${location}`;
  const description = property.description?.substring(0, 160) || 
    `${title} - ${location}${price ? ' - ' + price : ''}`;
  const image = property.imageUrls?.[0] || property.images?.[0];

  res.json({
    success: true,
    data: {
      title,
      description,
      image,
      url: `${env.CLIENT_URL}/property/${property._id}`,
      price,
      location,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms || property.bedCount,
      bathrooms: property.bathrooms,
      area: property.totalArea || property.plotArea || property.carpetArea,
      areaUnit: property.areaUnit || 'sq.ft',
    },
  });
});

const formatPrice = (price) => {
  if (!price) return '';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
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

export default {
  getPropertyMeta,
  getPropertyMetaJson,
};
