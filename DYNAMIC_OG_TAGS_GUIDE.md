# Dynamic Open Graph Tags Implementation Guide

This document explains the OG tags implementation for dynamic social media previews on Purandar Prime Properties.

## Overview

When property links are shared on social media platforms (WhatsApp, Facebook, LinkedIn, Twitter/X, Telegram, etc.), the platform's crawler fetches the page and looks for Open Graph (OG) tags in the HTML head. This implementation provides dynamic OG tags for each property listing.

## Architecture

The solution uses a three-layer approach:

### 1. **Frontend Client-Side (React Component)**
- **File**: `src/components/common/SeoManager.jsx`
- **Purpose**: Dynamically updates meta tags when the page loads
- **Limitation**: Executes AFTER page load (crawlers don't wait for JavaScript)
- **Usage**: Automatically updates meta tags for human visitors

### 2. **Backend API Endpoint**
- **File**: `backend/src/controllers/meta.controller.js`
- **Endpoint**: `/api/v1/meta/property/:id`
- **Purpose**: Serves static HTML with OG tags for server-side requests
- **Limitation**: Requires special URL format
- **Usage**: Direct access for API testing or special sharing

### 3. **Vercel API Function (Serverless)**
- **File**: `api/meta.js`
- **Endpoint**: `/api/meta?propertyId=:id`
- **Purpose**: Serves OG-tagged HTML for crawlers with proper detection
- **Usage**: Best for crawler requests

## How It Works

### For Regular Users
1. User visits `/property/[id]` in their browser
2. React app loads
3. `SeoManager` component updates meta tags with property data
4. Page displays correctly with proper title and description

### For Social Media Crawlers
**Current Flow (Improved):**
1. Crawler accesses `/property/[id]`
2. Gets React SPA HTML (generic meta tags)
3. If supported, renders JavaScript and gets updated meta tags

**Optimal Flow (Recommended for Users):**
1. Users share `/api/meta?propertyId=[id]` URL
2. Crawler/bot fetches URL
3. Vercel API function serves HTML with dynamic OG tags
4. Social media displays rich preview
5. User is redirected to property page after a delay

**Alternative Flow (Backend Direct):**
1. Use `/api/v1/meta/property/[id]` endpoint directly
2. Backend serves OG-tagged HTML
3. Crawler displays preview

## Implementation Files

### Backend Files

#### 1. **src/utils/metaTags.js**
Utility functions for generating OG tags and meta tag HTML.

```javascript
import { generatePropertyMetaTags, generateMetaTagsHTML } from './utils/metaTags.js';

const property = await Property.findById(id);
const metaHTML = generateMetaTagsHTML(property);
```

#### 2. **src/controllers/meta.controller.js**
Express controller with two functions:
- `getPropertyMeta()`: Serves full HTML page with OG tags
- `getPropertyMetaJson()`: Returns JSON meta data for frontend

#### 3. **src/routes/meta.routes.js**
Router configuration for meta endpoints:
- `GET /api/v1/meta/property/:id` - HTML page with OG tags
- `GET /api/v1/meta/property/:id/json` - JSON meta data

#### 4. **src/routes/index.js** (Updated)
Imports and registers meta routes.

#### 5. **src/middlewares/crawlerDetection.middleware.js**
Utility to detect social media crawlers (helper for future use).

### Frontend Files

#### 1. **src/components/common/SeoManager.jsx** (Enhanced)
React component that dynamically updates meta tags. Already present and now enhanced with:
- og:image:width/height
- og:locale
- twitter:site

#### 2. **src/pages/public/PropertyDetails.jsx** (Already Using)
Uses SeoManager to update tags when property loads:

```javascript
<SeoManager
  title={`${titleBase} | Purandar Prime Properties`}
  description={seoDescription}
  canonicalPath={`/property/${property._id}`}
  schema={schema}
  image={primaryImage}
  type="product"
  siteName="Purandar Prime Properties"
/>
```

### Vercel/Frontend Deployment

#### 1. **api/meta.js**
Vercel serverless function that:
- Detects crawler/bot requests
- Fetches property data from backend API
- Generates and serves HTML with OG tags
- Redirects real users to property page

#### 2. **vercel.json** (Configured)
Routes configuration for Vercel hosting.

## Testing

### Test OG Tags Locally

1. **Backend Meta Endpoint:**
```bash
curl http://localhost:5000/api/v1/meta/property/[mongodb-id]
```

2. **Vercel API Endpoint:**
```bash
curl http://localhost:3000/api/meta?propertyId=[mongodb-id]
```

3. **Check Meta Tags in Browser:**
Open DevTools → Go to Head element and look for:
- `<meta property="og:title">`
- `<meta property="og:description">`
- `<meta property="og:image">`
- `<meta name="twitter:card">`

### Test with Online Tools

1. **Facebook Share Debugger:**
   - URL: https://developers.facebook.com/tools/debug/sharing/
   - Enter: `https://yourdomain.com/property/[id]`
   - Or: `https://yourdomain.com/api/meta?propertyId=[id]`

2. **Twitter Card Validator:**
   - URL: https://cards-dev.twitter.com/validator
   - Enter your property URL

3. **LinkedIn Post Inspector:**
   - URL: https://www.linkedin.com/post-inspector/
   - Enter your property URL

4. **Telegram Bot API Preview:**
   - Use Telegram bot with URL preview functionality

### Test with Actual Platforms

1. **WhatsApp:**
   - Share link in WhatsApp
   - Wait for preview to load
   - Should show property image, title, description

2. **Facebook:**
   - Share link on timeline or Messenger
   - Preview appears before sending

3. **LinkedIn:**
   - Share link on profile/page
   - Rich preview displays

4. **Twitter/X:**
   - Tweet the link
   - Should show summary_large_image card

## Usage Recommendations

### For Best Results

#### Option 1: Share Meta Endpoint URL (Recommended)
Users share: `https://purandarprimeproperties.com/api/meta?propertyId=[property-id]`
- Rich preview guaranteed
- Meta endpoint handles crawler detection
- Auto-redirects after user clicks

#### Option 2: Share Regular Property URL
Users share: `https://purandarprimeproperties.com/property/[property-id]`
- Works with modern crawlers (execute JavaScript)
- SeoManager updates tags client-side
- Some older bots might not see updated tags

#### Option 3: Use URL Shortener
Create shortened links that point to meta endpoint:
- Cleaner URLs for users
- Example: `https://ppp.link/[short-code]` → `https://api.../api/meta?propertyId=...`

### Integration with Share Button

Update the share functionality in PropertyDetails.jsx:

```javascript
const shareProperty = async () => {
  if (!property?._id) return;
  // Use meta endpoint for better preview
  const url = `${window.location.origin}/api/meta?propertyId=${property._id}`;
  const title = property.title || 'Property';
  
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    // ... fallback logic
  } catch (error) {
    // handle error
  }
};
```

## Meta Tags Included

### Open Graph Tags
```html
<meta property="og:title" content="Property Title">
<meta property="og:description" content="Property Description">
<meta property="og:type" content="website">
<meta property="og:url" content="Property URL">
<meta property="og:image" content="Featured Image URL">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Purandar Prime Properties">
<meta property="og:locale" content="en_IN">
```

### Twitter Card Tags
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Property Title">
<meta name="twitter:description" content="Property Description">
<meta name="twitter:image" content="Featured Image URL">
<meta name="twitter:site" content="@PurandarPrime">
```

### Standard Tags
```html
<meta name="description" content="Property Description">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Property Data Used for OG Tags

The following property fields are extracted for meta tags:

1. **title**: Property listing title
2. **description**: Property full description (truncated to 160 chars for OG)
3. **imageUrls or images**: First image used as og:image
4. **propertyType**: Type of property (2 BHK, Plot, etc.)
5. **category**: Residential, Commercial, Plot
6. **intent**: Sell or Rent
7. **locality + city**: Location for display
8. **price**: Formatted as ₹[value]
9. **bedrooms/bedCount**: Number of bedrooms
10. **bathrooms**: Number of bathrooms
11. **totalArea/plotArea/carpetArea**: Property area
12. **areaUnit**: Unit of area (sq.ft)

## Environment Variables

Required variables for Vercel API function:

```env
# In .env file or Vercel Environment Settings
VITE_API_BASE_URL=https://purandar.onrender.com  # Your backend API
VITE_APP_URL=https://purandarprimeproperties.com # Your frontend URL
```

## Troubleshooting

### Issue: Meta tags not appearing in crawler preview

**Solutions:**
1. Check if image URL is valid and accessible
2. Verify property exists in database
3. Test with online tools to see actual OG tags
4. Ensure og:image is JPEG/PNG (not WebP if not supported)

### Issue: Image not showing in preview

**Solutions:**
1. Verify image URL is public and accessible
2. Image should be at least 1200x630px
3. Ensure image is served over HTTPS
4. Check image format (JPEG/PNG preferred)

### Issue: Truncated description in preview

**Solutions:**
1. Keep descriptions under 160 characters for better display
2. Longer descriptions are automatically truncated by platforms
3. Format key info at the beginning

### Issue: Crawler not detecting meta tags

**Solutions:**
1. Verify crawler is fetching your endpoint
2. Check backend logs for API calls
3. Use Chrome DevTools to inspect Network tab
4. Test with curl to see raw HTML response

## Performance Considerations

1. **Caching**: Meta endpoint caches responses for 1 hour
2. **Database Queries**: Lean queries used to minimize payload
3. **Image Optimization**: Consider CDN for serving property images
4. **API Rate Limiting**: Backend has rate limiting enabled

## Security Considerations

1. **HTML Escaping**: All user inputs are escaped to prevent XSS
2. **CORS**: Backend CORS properly configured
3. **Rate Limiting**: Enabled on all endpoints
4. **Content Validation**: Property IDs validated before database queries

## Future Improvements

1. **Dynamic URL Shortener**: Create shortened links automatically
2. **Analytics Tracking**: Track shares per property
3. **A/B Testing**: Test different meta descriptions
4. **Image Generation**: Auto-generate preview images if not available
5. **Multi-Language Support**: OG tags in different languages
6. **Structured Data**: Enhanced JSON-LD schemas for rich results

## Support

For issues or questions:
1. Check logs: Backend logs and Vercel function logs
2. Test endpoints directly with curl
3. Use online OG debuggers for verification
4. Verify property data in database has all required fields
