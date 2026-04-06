# Purandar Estate � Full-Stack Real Estate Platform

Modern, production-ready real estate platform with property listings, projects, admin workflows, media uploads, WhatsApp engagement, and analytics. Built with a Vite + React frontend and a Node/Express + MongoDB backend.

## Highlights

- Property and project listings with advanced filters (buy/rent, type, budget, area).
- Rich admin panel to manage properties, projects, enquiries, feedback, blogs, and featured content.
- Media upload support (images + videos) for properties and projects.
- WhatsApp contact controls with company/custom options.
- Project feedback system with ratings + short reviews.
- SEO-friendly detail pages, sitemap, and schema metadata.

## Tech Stack

Frontend:
- React (Vite)
- React Router
- Axios
- CSS modules / custom design system

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT auth (access + refresh)
- Cloudflare R2 for media storage

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create environment files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

3. Start frontend:
```bash
npm run dev
```

4. Start backend:
```bash
cd backend
npm run dev
```

## Environment Variables

Frontend (`.env`):
```
VITE_API_URL=/api/v1
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_COMPANY_CONTACT_NAME=Purandar Properties
VITE_COMPANY_CONTACT_PHONE=9999999999
VITE_COMPANY_CONTACT_EMAIL=contact@purandarproperties.com
VITE_COMPANY_WHATSAPP_NUMBER=9999999999
```

Backend (`backend/.env`):
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string_here
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_NAME=Purandar Admin
ADMIN_EMAIL=admin@purandar.local
ADMIN_PASSWORD=ChangeMe123!
COMPANY_CONTACT_NAME=Purandar Properties
COMPANY_CONTACT_PHONE=9999999999
COMPANY_CONTACT_EMAIL=contact@purandarproperties.com
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-url.r2.dev
MEDIA_IMAGE_MAX_MB=5
MEDIA_VIDEO_MAX_MB=50
```



## Core Features

**Properties**
- Post & manage property listings
- Image & video upload
- Seller contact display modes (original/company/custom)
- WhatsApp call-to-action with response time

**Projects**
- Project listing and media uploads
- Plot-specific pricing fields
- Project feedback (rating + short review)

**Admin Panel**
- Manage properties, projects, enquiries, blogs
- Feature listings on homepage
- View and delete project feedback
- Control seller contact visibility

## Project Structure

```
ourproject/
  src/                # Frontend app
  backend/            # API server
  public/             # Static assets
  scripts/            # Utility scripts
```

## Roadmap Ideas

- OTP / SMS provider integration
- Payment or lead management integrations
- Advanced analytics dashboard

## Credits

Built and maintained by Purandar Estate team.
