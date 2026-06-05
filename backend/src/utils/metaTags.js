/**
 * Generate Open Graph and Twitter Card meta tags for social media sharing
 * Used by crawlers from WhatsApp, Facebook, LinkedIn, Twitter/X, Telegram, etc.
 */

export const generatePropertyMetaTags = (property, baseUrl = '') => {
  const siteUrl = baseUrl || process.env.CLIENT_URL || 'https://purandarprimeproperties.com';
  const propertyUrl = `${siteUrl}/property/${property._id}`;

  // Extract key information
  const title = property.title || `${property.propertyType || 'Property'} in ${property.locality || property.city}`;
  const price = property.price ? formatPrice(property.price) : '';
  const location = [property.locality, property.city].filter(Boolean).join(', ');
  const description = property.description?.substring(0, 160) || 
    `${title} - ${location}${price ? ' - ' + price : ''}`;
  
  // Get featured image
  const image = property.imageUrls?.[0] || property.images?.[0] || `${siteUrl}/og-default.png`;
  
  // Additional details
  const bedrooms = property.bedrooms || property.bedCount;
  const bathrooms = property.bathrooms;
  const area = property.totalArea || property.plotArea || property.carpetArea;
  const areaUnit = property.areaUnit || 'sq.ft';
  
  return {
    title,
    description,
    image,
    url: propertyUrl,
    type: 'property',
    // For structured data
    details: {
      propertyType: property.propertyType,
      category: property.category,
      intent: property.intent,
      location,
      price,
      bedrooms,
      bathrooms,
      area: area ? `${area} ${areaUnit}` : null,
    }
  };
};

export const generateProjectMetaTags = (project, baseUrl = '') => {
  const siteUrl = baseUrl || process.env.CLIENT_URL || 'https://purandarprimeproperties.com';
  const projectUrl = `${siteUrl}/projects/${project.slug || project._id}`;
  const title = project.projectName || `${project.projectType || 'Project'} in ${project.area || project.city || project.address || 'India'}`;
  const location = [project.area, project.city, project.address].filter(Boolean).join(', ');
  const description = project.shortDescription || project.detailedDescription?.substring(0, 160) ||
    `${title}${location ? ` in ${location}` : ''}${project.developerName ? ` by ${project.developerName}` : ''}`;
  const image = project.coverImage || (Array.isArray(project.projectImages) ? project.projectImages[0] : undefined) || `${siteUrl}/og-default.png`;

  return {
    title,
    description,
    image,
    url: projectUrl,
    type: 'website',
    details: {
      projectType: project.projectType,
      developer: project.developerName,
      location,
      status: project.projectStatus,
    },
  };
};

export const generateProjectMetaTagsHTML = (project, baseUrl = '') => {
  const meta = generateProjectMetaTags(project, baseUrl);
  const twitterCard = `summary_large_image`;

  return `
    <!-- Project Meta Tags -->
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Purandar Prime Properties" />
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${meta.image}" />
    <meta name="twitter:site" content="@PurandarPrime" />
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Additional Tags for Various Platforms -->
    <meta property="og:locale" content="en_IN" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="telegram:channel" content="@PurandarPrime" />
  `;
};

export const generateMetaTagsHTML = (property, baseUrl = '') => {
  const meta = generatePropertyMetaTags(property, baseUrl);
  const twitterCard = `summary_large_image`;

  return `
    <!-- Property Meta Tags -->
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Purandar Prime Properties" />
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${meta.image}" />
    <meta name="twitter:site" content="@PurandarPrime" />
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Additional Tags for Various Platforms -->
    <meta property="og:locale" content="en_IN" />
    
    <!-- LinkedIn Tags -->
    <meta property="og:image:type" content="image/jpeg" />
    
    <!-- WhatsApp & Telegram -->
    <meta property="telegram:channel" content="@PurandarPrime" />
  `;
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
  generatePropertyMetaTags,
  generateMetaTagsHTML,
};
