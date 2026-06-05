# Dynamic OG Tags Feature - README Snippet

Add this section to your main README.md file to document the OG tags feature:

---

## 📱 Dynamic Social Media Previews

### Overview
When property links are shared on social media platforms (WhatsApp, Facebook, LinkedIn, Twitter/X, Telegram, Discord, etc.), the preview automatically displays:

- ✅ **Property Featured Image** - First image from the listing
- ✅ **Property Title** - Including location and type
- ✅ **Property Price** - Formatted with rupee symbol
- ✅ **Property Description** - Short summary of the listing
- ✅ **Key Details** - Bedrooms, bathrooms, area

### Example

**Before:**
```
🏢 Purandar Prime Properties
   Discover verified property in Purandar, flats near 
   Purandar airport, and plots in Saswad...
```

**After:**
```
🏠 2 BHK Luxury Apartment in Saswad
   ₹65 Lakhs | 1200 sq.ft | Sell
   Beautiful apartment near Purandar Airport...
   [PROPERTY IMAGE]
```

### How It Works

The implementation uses a three-layer architecture:

1. **Frontend (React)** - `SeoManager` component updates meta tags dynamically
2. **Backend (Express)** - `/api/v1/meta/property/:id` endpoint serves OG-tagged HTML
3. **Vercel (Serverless)** - `/api/meta?propertyId=:id` function detects crawlers and serves optimized HTML

### Sharing Options

#### Option 1: Regular Property URL (Recommended)
```
https://purandarprimeproperties.com/property/[property-id]
```
- Clean, user-friendly URL
- Works with modern social platforms
- Dynamic updates via SeoManager

#### Option 2: Meta Endpoint URL
```
https://purandarprimeproperties.com/api/meta?propertyId=[property-id]
```
- Guaranteed crawler support
- Works with all bot types
- Less friendly URL format

### Supported Platforms

| Platform | Status | Preview Type |
|----------|--------|--------------|
| WhatsApp | ✅ Full | Image + Title + Link |
| Facebook | ✅ Full | Rich Preview |
| LinkedIn | ✅ Full | Professional Card |
| Twitter/X | ✅ Full | Summary Large Image |
| Telegram | ✅ Full | Auto Preview |
| Discord | ✅ Full | Rich Embed |
| Skype | ✅ Full | Link Preview |
| Email | ✅ Full | Fallback Text |

### Setup Instructions

#### 1. Deploy Backend Changes
```bash
cd backend
git add .
git commit -m "Add dynamic OG tags support"
git push
```

#### 2. Deploy Frontend Changes
```bash
git add .
git commit -m "Add OG meta tags"
git push
```

#### 3. Set Environment Variables (Vercel)
- `VITE_API_BASE_URL` = `https://purandar.onrender.com`
- `VITE_APP_URL` = `https://purandarprimeproperties.com`

#### 4. Test Implementation
Use Facebook Share Debugger:
- URL: https://developers.facebook.com/tools/debug/sharing/
- Enter property URL
- Click "Scrape Again"
- Verify preview shows property details

### Technical Stack

**Backend Technologies:**
- Node.js + Express
- MongoDB for property data
- HTML generation with OG tags

**Frontend Technologies:**
- React with SeoManager component
- Vite build tool
- Helmet for security headers

**OG Tags Generated:**
```html
<meta property="og:title" content="Property Title">
<meta property="og:description" content="Property Description">
<meta property="og:image" content="Featured Image URL">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="website">
<meta property="og:url" content="Property URL">
<meta property="og:site_name" content="Purandar Prime Properties">
<meta property="og:locale" content="en_IN">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Property Title">
<meta name="twitter:description" content="Property Description">
<meta name="twitter:image" content="Featured Image URL">
<meta name="twitter:site" content="@PurandarPrime">
```

### Files Added

**Backend:**
- `backend/src/utils/metaTags.js` - OG tag generation
- `backend/src/controllers/meta.controller.js` - API endpoints
- `backend/src/routes/meta.routes.js` - Route definitions
- `backend/src/middlewares/crawlerDetection.middleware.js` - Crawler detection

**Frontend:**
- `api/meta.js` - Vercel serverless function
- Enhanced `src/components/common/SeoManager.jsx` with additional OG tags

**Documentation:**
- `DYNAMIC_OG_TAGS_GUIDE.md` - Comprehensive technical guide
- `OG_TAGS_SETUP_CHECKLIST.md` - Setup and testing checklist
- `OG_TAGS_IMPLEMENTATION_SUMMARY.md` - Implementation overview

### Monitoring & Troubleshooting

#### Test Endpoints
- Backend: `https://purandar.onrender.com/api/v1/meta/property/[id]`
- Frontend: `https://purandarprimeproperties.com/api/meta?propertyId=[id]`

#### Common Issues
- **Preview not showing**: Use Facebook Share Debugger "Scrape Again" button
- **Image not displaying**: Verify image URL is public HTTPS, minimum 1200x630px
- **Old preview cached**: Platform crawlers cache for 24h, use cache-clearing tools

#### Testing Tools
- [Facebook Share Debugger](https://developers.facebook.com/tools/debug/sharing/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Performance Considerations

- Meta endpoint responses cached for 1 hour
- Lean database queries for minimal payload
- Image optimization via CDN recommended
- Rate limiting enabled on all endpoints

### Security

- All user inputs HTML-escaped to prevent XSS
- CORS properly configured
- Rate limiting enabled
- Content validation on all inputs

### Future Enhancements

1. **URL Shortener** - Auto-generate shortened share links
2. **Analytics** - Track shares per property
3. **Dynamic Images** - Auto-generate preview graphics
4. **A/B Testing** - Test different descriptions
5. **Multi-Language** - OG tags in different languages

### Documentation

For detailed information, refer to:
- [Complete Implementation Guide](./DYNAMIC_OG_TAGS_GUIDE.md)
- [Setup Checklist](./OG_TAGS_SETUP_CHECKLIST.md)
- [Implementation Summary](./OG_TAGS_IMPLEMENTATION_SUMMARY.md)

---

## Adding to Your README

1. Open your main `README.md`
2. Find an appropriate section (e.g., "Features" or "Getting Started")
3. Add this section with necessary adjustments for your project
4. Update URLs and references to match your configuration
