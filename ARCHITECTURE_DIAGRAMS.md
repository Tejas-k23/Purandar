# Dynamic OG Tags - Architecture Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PURANDAR PRIME PROPERTIES                    │
│                  Dynamic OG Tags Implementation                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       VERCEL DEPLOYMENT                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  React SPA Frontend                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  SeoManager Component (Dynamic Meta Tags)          │  │  │
│  │  │  - Updates og:title, og:image, og:description     │  │  │
│  │  │  - Runs on client-side when page loads           │  │  │
│  │  │  - Provides immediate meta updates               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  /api/meta.js (Vercel Serverless Function)         │  │  │
│  │  │  - Detects social media crawlers                  │  │  │
│  │  │  - Fetches property data from backend            │  │  │
│  │  │  - Generates HTML with OG tags                   │  │  │
│  │  │  - Redirects users to property page             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   (Network Request)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER/BACKEND DEPLOYMENT                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express.js Backend API                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  /api/v1/meta/property/:id (HTML Endpoint)         │  │  │
│  │  │  - Server-side meta tag generation               │  │  │
│  │  │  - Fetches property from MongoDB                 │  │  │
│  │  │  - Returns HTML with OG tags                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  /api/v1/meta/property/:id/json (JSON Endpoint)   │  │  │
│  │  │  - Returns meta data as JSON                      │  │  │
│  │  │  - For frontend updates                          │  │  │
│  │  │  - API testing and integration                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              MongoDB Database                      │  │  │
│  │  │  - Property data storage                          │  │  │
│  │  │  - Images, title, description, price             │  │  │
│  │  │  - Location, amenities, contact info             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Request Flow - Social Media Crawler

```
User shares: https://purandarprimeproperties.com/property/[id]
                    │
                    ↓
        Social Media Platform (e.g., WhatsApp)
                    │
                    ├─ Detects crawler/bot request
                    ├─ Checks User-Agent header
                    │
                    ↓
        Is this a crawler? (WhatsApp, Facebook, etc.)
                    │
          ┌─────────┴─────────┐
          │                   │
         YES                  NO
          │                   │
          ↓                   ↓
    Crawler Path      Browser Path
          │                   │
          ↓                   ↓
    Vercel API         React SPA
    /api/meta          /property/[id]
          │                   │
          ├─ Detect crawler   ├─ React mounts
          ├─ Fetch property   ├─ SeoManager runs
          ├─ Generate HTML    ├─ Updates meta tags
          ├─ Return with OG   ├─ Page renders
          │  tags             │
          ↓                   ↓
    Show preview       Show property details
    with property      + updated meta tags
    image/title        in head
```

## 3. Request Flow - Regular User

```
User clicks property link
         │
         ↓
Loads: /property/[id]
         │
         ↓
React Router matches route
         │
         ↓
PropertyDetails component renders
         │
         ├─ Loads property data from API
         ├─ SeoManager component mounts
         │  ├─ Updates document.title
         │  ├─ Updates og:title
         │  ├─ Updates og:description
         │  ├─ Updates og:image
         │  ├─ Updates twitter:card
         │  └─ Updates other meta tags
         │
         ↓
Page displays with:
✓ Property images
✓ Title and price
✓ Description and details
✓ Updated meta tags in <head>
```

## 4. File Structure

```
OurProject/
│
├── backend/
│   └── src/
│       ├── utils/
│       │   └── metaTags.js .......................... OG tag generators
│       │
│       ├── controllers/
│       │   └── meta.controller.js .................. Meta endpoints
│       │
│       ├── routes/
│       │   ├── meta.routes.js ....................... Meta routes
│       │   └── index.js (UPDATED) .................. Added meta routes
│       │
│       └── middlewares/
│           └── crawlerDetection.middleware.js ..... Crawler detection
│
├── src/
│   ├── components/
│   │   └── common/
│   │       └── SeoManager.jsx (ENHANCED) .......... Dynamic meta updater
│   │
│   └── pages/
│       └── public/
│           └── PropertyDetails.jsx ............... Uses SeoManager
│
├── api/
│   └── meta.js .................................... Vercel function
│
├── Documentation/
│   ├── DYNAMIC_OG_TAGS_GUIDE.md .................. Complete guide
│   ├── OG_TAGS_SETUP_CHECKLIST.md ............... Setup steps
│   ├── OG_TAGS_IMPLEMENTATION_SUMMARY.md ........ Overview
│   ├── README_SNIPPET_FOR_OG_TAGS.md ........... For main README
│   ├── DEPLOY_OG_TAGS.sh ........................ Deployment (Linux)
│   └── DEPLOY_OG_TAGS.bat ........................ Deployment (Windows)
│
└── vercel.json (already configured)

```

## 5. Data Flow - Meta Tag Generation

```
Property URL: /property/[MongoDB_ID]
              │
              ↓
    ┌─────────────────────────┐
    │ Property Data Request   │
    │ (from MongoDB)          │
    └──────────┬──────────────┘
               │
               ↓
    ┌─────────────────────────────────────┐
    │  Property Document                  │
    │  {                                  │
    │    _id: "...",                      │
    │    title: "2 BHK Flat",            │
    │    description: "Beautiful flat...", │
    │    price: 6500000,                  │
    │    imageUrls: ["url1", "url2"],    │
    │    locality: "Saswad",              │
    │    city: "Pune",                    │
    │    bedrooms: 2,                     │
    │    bathrooms: 2,                    │
    │    totalArea: 1200                  │
    │  }                                  │
    └──────────┬──────────────────────────┘
               │
               ↓
    ┌─────────────────────────────────────┐
    │ generateMetaTagsHTML()              │
    │ Function Processing:                │
    │ - Format price: "₹65 Lakhs"         │
    │ - Extract location: "Saswad, Pune"  │
    │ - Get first image URL               │
    │ - Truncate description to 160 chars │
    │ - Create title with location        │
    └──────────┬──────────────────────────┘
               │
               ↓
    ┌──────────────────────────────────────────┐
    │ Generated OG Tags                        │
    │ <meta property="og:title" content="..."> │
    │ <meta property="og:image" content="..."> │
    │ <meta property="og:description" ...>     │
    │ <meta name="twitter:card" ...>           │
    │ ... (12+ tags total)                     │
    └──────────┬───────────────────────────────┘
               │
               ↓
    ┌─────────────────────────────────────┐
    │ Complete HTML Response              │
    │ <!DOCTYPE html>                     │
    │ <html>                              │
    │ <head>                              │
    │   [OG TAGS]                         │
    │   <script>redirect...</script>      │
    │ </head>                             │
    │ <body>Redirecting...</body>         │
    │ </html>                             │
    └────────────┬────────────────────────┘
                 │
                 ├─ If Crawler: Shows meta tags
                 └─ If Browser: Redirects to SPA
```

## 6. Component Integration - PropertyDetails

```
PropertyDetails Component
    │
    ├─ useParams() → Get property ID
    ├─ useEffect() → Fetch property data
    ├─ useState() → Store property data
    │
    ├─────────────────────────────────────┐
    │  METADATA GENERATION LOGIC          │
    ├─────────────────────────────────────┤
    │                                     │
    │  Extract property data:             │
    │  - primaryImage = first image       │
    │  - titleBase = title + location     │
    │  - seoDescription = description     │
    │  - pageUrl = current URL            │
    │  - schema = JSON-LD structure       │
    │                                     │
    ├─────────────────────────────────────┤
    │ <SeoManager                         │
    │   title={titleBase}                 │
    │   description={seoDescription}      │
    │   image={primaryImage}              │
    │   type="product"                    │
    │   schema={schema}                   │
    │ />                                  │
    ├─────────────────────────────────────┤
    │                                     │
    │ Updates meta tags:                  │
    │ ✓ document.title                    │
    │ ✓ og:title, og:description          │
    │ ✓ og:image with dimensions          │
    │ ✓ twitter:card, twitter:image       │
    │ ✓ canonical link                    │
    │ ✓ JSON-LD schema                    │
    │                                     │
    └─────────────────────────────────────┘
            │
            ↓
    Render Property UI:
    - Gallery
    - Title section
    - Stats bar
    - Description
    - Contact form
```

## 7. Platform-Specific Preview Handling

```
Share URL: https://purandarprimeproperties.com/property/[id]

                    │
        ┌───────────┼────────────┐
        │           │            │
        ↓           ↓            ↓
    WhatsApp    Facebook      LinkedIn
        │           │            │
        ├─ Fetches  ├─ Fetches  ├─ Fetches
        │   og:     │   og:     │   og:
        ├─ image   ├─ image   ├─ image
        ├─ title   ├─ title   ├─ title
        ├─ desc    ├─ desc    ├─ desc
        │           │            │
        ↓           ↓            ↓
    ┌─────────┐  ┌────────┐  ┌────────┐
    │ Property│  │ Property│  │Property│
    │ Image   │  │ Image   │  │ Image  │
    ├─────────┤  ├────────┤  ├────────┤
    │2 BHK    │  │2 BHK   │  │2 BHK   │
    │Saswad   │  │Saswad  │  │Saswad  │
    │₹65L     │  │₹65L    │  │₹65L    │
    └─────────┘  └────────┘  └────────┘

    +

    Twitter/X      Telegram       Discord
        │              │            │
        ├─ Fetches    ├─ Fetches  ├─ Fetches
        │   twitter:  │   og:     │   og:
        ├─ card      ├─ image   ├─ image
        ├─ image     ├─ title   ├─ title
        ├─ title     ├─ desc    ├─ desc
        ├─ desc      │           │
        │            ↓           ↓
        ↓         ┌────────┐  ┌────────┐
    ┌────────┐   │Property│  │Property│
    │Summary │   │ Image  │  │ Image  │
    │Large   │   ├────────┤  ├────────┤
    │Image   │   │2 BHK   │  │2 BHK   │
    │Card    │   │Saswad  │  │Saswad  │
    │with    │   │₹65L    │  │₹65L    │
    │Property│   └────────┘  └────────┘
    └────────┘
```

## 8. Caching Strategy

```
Request to /api/meta?propertyId=[id]
         │
         ├─ Check cache (1 hour)
         │  ├─ If exists: Return cached HTML
         │  └─ Hit: ~10ms response
         │
         └─ Not in cache
            │
            ├─ Fetch from backend API
            ├─ Generate OG tags HTML
            ├─ Cache result (3600 sec)
            │  └─ Set Cache-Control header
            │
            └─ Return HTML
               └─ Hit: ~200-500ms response

On property update:
- MongoDB updated
- Cache expires after 1h (TTL)
- Next request generates fresh HTML
- Or manually clear cache if needed
```

## 9. Error Handling Flow

```
Request to meta endpoint
         │
         ├─ Validate property ID
         │  ├─ Valid: Continue
         │  └─ Invalid: Return 400
         │
         ├─ Check database
         │  ├─ Found: Continue
         │  └─ Not Found: Return 404
         │
         ├─ Extract property data
         │  ├─ Success: Continue
         │  └─ Error: Return 500
         │
         ├─ Generate HTML
         │  ├─ Success: Continue
         │  └─ Error: Return 500
         │
         └─ Return response
            ├─ Success (200): HTML with OG tags
            ├─ Not Found (404): Error page
            ├─ Invalid (400): Error response
            └─ Error (500): Error page
```

---

These diagrams show how the different components work together to provide dynamic OG tags for social media sharing.
