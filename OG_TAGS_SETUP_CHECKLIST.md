# Dynamic OG Tags - Quick Setup Checklist

## Files Created/Modified

### ✅ Backend Files
- [x] `backend/src/utils/metaTags.js` - NEW - OG tag generation utilities
- [x] `backend/src/controllers/meta.controller.js` - NEW - Meta endpoints controller
- [x] `backend/src/routes/meta.routes.js` - NEW - Meta routes
- [x] `backend/src/routes/index.js` - UPDATED - Added meta routes
- [x] `backend/src/middlewares/crawlerDetection.middleware.js` - NEW - Crawler detection

### ✅ Frontend Files
- [x] `src/components/common/SeoManager.jsx` - ENHANCED - Added OG image dimensions and locale
- [x] `api/meta.js` - NEW - Vercel serverless function for crawlers

### ✅ Configuration Files
- [x] `vercel.json` - Already properly configured
- [x] `DYNAMIC_OG_TAGS_GUIDE.md` - NEW - Comprehensive implementation guide

## Deployment Steps

### Step 1: Deploy Backend Changes
```bash
# From project root
cd backend
git add .
git commit -m "Add dynamic OG tags support for social media sharing"
git push origin main  # or your deployment branch
# Wait for Render/backend deployment to complete
```

### Step 2: Deploy Frontend Changes
```bash
# From project root
git add .
git commit -m "Add dynamic meta tags for social media previews"
git push origin main  # Vercel auto-deploys
# Wait for Vercel deployment to complete (check Vercel dashboard)
```

### Step 3: Environment Variables (Vercel)
In Vercel Project Settings → Environment Variables:
```
VITE_API_BASE_URL=https://purandar.onrender.com
VITE_APP_URL=https://purandarprimeproperties.com
```

## Testing Checklist

### Local Testing (Backend)
- [ ] Backend running on `http://localhost:5000`
- [ ] MongoDB connected
- [ ] Test endpoint: `curl http://localhost:5000/api/v1/meta/property/[valid-mongodb-id]`
- [ ] Response is HTML with OG tags
- [ ] Response includes og:title, og:image, og:description

### Local Testing (Frontend)
- [ ] Frontend running on `http://localhost:5173` (or your Vite port)
- [ ] Navigate to any property page
- [ ] Open DevTools → Elements
- [ ] Check `<head>` for dynamically updated meta tags
- [ ] Should see og:title, og:description, og:image with property data

### Production Testing (After Deployment)

#### Test 1: Check Backend Meta Endpoint
```bash
curl https://purandar.onrender.com/api/v1/meta/property/[valid-id] -I
# Response should include: Content-Type: text/html
```

#### Test 2: Check Vercel API Function
```bash
curl https://purandarprimeproperties.com/api/meta?propertyId=[valid-id] -I
# Response should include: Content-Type: text/html
```

#### Test 3: Check Meta Tags in HTML
```bash
curl https://purandarprimeproperties.com/api/meta?propertyId=[valid-id] | grep "og:title"
# Should show: <meta property="og:title" content="Property Title">
```

#### Test 4: Use Online Tools

1. **Facebook Share Debugger:**
   - Go to: https://developers.facebook.com/tools/debug/sharing/
   - Enter: `https://purandarprimeproperties.com/property/[id]`
   - Should show property image, title, description
   - If not working, try: `https://purandarprimeproperties.com/api/meta?propertyId=[id]`

2. **Twitter Card Validator:**
   - Go to: https://cards-dev.twitter.com/validator
   - Enter: `https://purandarprimeproperties.com/property/[id]`
   - Should show property image and summary_large_image card

3. **LinkedIn Post Inspector:**
   - Go to: https://www.linkedin.com/post-inspector/
   - Enter: `https://purandarprimeproperties.com/property/[id]`
   - Should show rich preview

#### Test 5: Test in Real Platforms

- [ ] **WhatsApp**: Share property link, preview should show property image/title
- [ ] **Facebook**: Share link on timeline, preview should appear
- [ ] **LinkedIn**: Share link on profile, should show rich preview
- [ ] **Twitter/X**: Tweet property link, should show summary_large_image
- [ ] **Telegram**: Share link in chat, should show preview
- [ ] **Email**: Send property link, should render with title/description

## Recommended Usage

### For Users Sharing Properties
There are two ways users can share:

#### Option 1: Direct Property URL (Easier for users)
```
https://purandarprimeproperties.com/property/[property-id]
```
**Pros:** Friendly URL
**Cons:** Some older bots might not see updated meta tags
**Best for:** Modern platforms (WhatsApp, Facebook, LinkedIn, Twitter)

#### Option 2: Meta Endpoint URL (Better for crawlers)
```
https://purandarprimeproperties.com/api/meta?propertyId=[property-id]
```
**Pros:** Guaranteed to work with all crawlers
**Cons:** Less friendly URL format
**Best for:** Critical sharing, testing, older platforms

### Recommended Update to Share Button
Update `src/pages/public/PropertyDetails.jsx` in the `shareProperty()` function:

```javascript
const shareProperty = async () => {
  if (!property?._id) return;
  // Use property URL (SeoManager handles meta tag updates for modern crawlers)
  const url = `${window.location.origin}/property/${property._id}`;
  
  // For users who want guaranteed crawler support, offer this:
  // const url = `${window.location.origin}/api/meta?propertyId=${property._id}`;
  
  const title = property.title || 'Property';
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    // ... rest of implementation
  } catch (error) {
    // ... error handling
  }
};
```

## Troubleshooting

### Problem: OG tags not showing in social media preview

**Checklist:**
- [ ] Backend deployed and running
- [ ] Frontend deployed to Vercel
- [ ] Property exists in database with image URL
- [ ] Image URL is publicly accessible (HTTPS)
- [ ] Image is at least 1200x630px
- [ ] Wait 30 seconds after deployment before testing
- [ ] Clear platform cache (Facebook Share Debugger has "Scrape Again" button)

### Problem: Image not displaying in preview

**Checklist:**
- [ ] Image URL is complete and valid
- [ ] Image is served over HTTPS
- [ ] Image format is JPEG/PNG (not WebP)
- [ ] Image is accessible from outside your network
- [ ] Image dimensions are at least 1200x630px

### Problem: Meta tags work locally but not on Vercel

**Checklist:**
- [ ] Environment variables set in Vercel
- [ ] Backend API URL in env vars is correct
- [ ] Vercel deployment completed successfully
- [ ] Check Vercel deployment logs for errors
- [ ] Verify api/meta.js file exists in project
- [ ] Test /api/meta endpoint directly in browser

### Problem: 404 errors on meta endpoint

**Checklist:**
- [ ] Property ID format is correct (MongoDB ObjectId)
- [ ] Property exists in database
- [ ] Property ID is not being truncated in URL
- [ ] Test with valid property ID from database

## Monitoring

### Add to Monitoring Dashboard
- [ ] Check /api/meta endpoint health
- [ ] Monitor backend /api/v1/meta endpoint response times
- [ ] Track OG tag generation failures
- [ ] Monitor image loading in previews

### Logs to Check
- **Backend logs**: Look for meta endpoint requests
- **Vercel function logs**: Check api/meta.js execution
- **Social platform**: Use platform's link preview tools

## Next Steps (Optional Enhancements)

1. **Analytics**: Track which properties are shared most
2. **URL Shortener**: Create shortened links automatically
3. **Dynamic Images**: Generate preview images with property details
4. **A/B Testing**: Test different descriptions/images
5. **Localization**: Support multiple languages in OG tags
6. **Rich Data**: Add structured data (JSON-LD) for better SEO

## Quick Reference

### Meta URLs
- **Backend Meta**: `https://purandar.onrender.com/api/v1/meta/property/[id]`
- **Frontend Meta**: `https://purandarprimeproperties.com/api/meta?propertyId=[id]`
- **Property Page**: `https://purandarprimeproperties.com/property/[id]`

### OG Tags Included
- og:title, og:description, og:image, og:image:width, og:image:height
- og:type, og:url, og:site_name, og:locale
- twitter:card, twitter:title, twitter:description, twitter:image, twitter:site

### Platforms Supported
✅ WhatsApp, ✅ Facebook, ✅ LinkedIn, ✅ Twitter/X, ✅ Telegram, ✅ Discord, ✅ Skype, ✅ Email clients

## Questions?

Refer to `DYNAMIC_OG_TAGS_GUIDE.md` for comprehensive documentation.
