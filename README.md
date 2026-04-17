# 🚀 Purandar Estate - Full-Stack Real Estate Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, production-ready real estate platform featuring property listings, project management, admin workflows, media uploads, WhatsApp integration, and comprehensive analytics. Built with a Vite + React frontend and a Node.js/Express + MongoDB backend.

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🔗 API Endpoints](#-api-endpoints)
- [📁 Project Structure](#-project-structure)
- [🔧 Environment Variables](#-environment-variables)
- [🚀 Deployment](#-deployment)
- [🔮 Future Improvements](#-future-improvements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👤 Author](#-author)

## 🚀 Features

- **🏠 Property Listings**: Advanced property listings with filters for buy/rent, type, budget, and area.
- **🏗 Project Management**: Comprehensive project listings with plot-specific pricing and media uploads.
- **👨‍💼 Admin Panel**: Rich admin interface to manage properties, projects, enquiries, feedback, blogs, and featured content.
- **📸 Media Uploads**: Support for image and video uploads for properties and projects using Cloudflare R2.
- **💬 WhatsApp Integration**: Contact controls with company/custom options and response time tracking.
- **⭐ Feedback System**: Project feedback with ratings and short reviews.
- **🔍 SEO Optimization**: SEO-friendly detail pages, sitemap, and schema metadata.
- **🔐 Authentication**: JWT-based authentication with access and refresh tokens.
- **📱 PWA Support**: Progressive Web App features for mobile experience.

## 🛠 Tech Stack

### Frontend
- **React** (with Vite for build tooling)
- **React Router** for client-side routing
- **Axios** for API calls
- **CSS Modules** / Custom design system for styling
- **Firebase** for messaging and notifications

### Backend
- **Node.js** + **Express.js** for server-side logic
- **MongoDB** + **Mongoose** for database and ODM
- **JWT** for authentication (access + refresh tokens)
- **Cloudflare R2** for media storage
- **Multer** for file uploads
- **Rate Limiting** and security middlewares

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudflare R2 account for media storage
- Firebase project for messaging

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/purandar-estate.git
   cd purandar-estate
   ```

2. **Install dependencies**:
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` for frontend
   - Copy `backend/.env.example` to `backend/.env` for backend
   - Fill in the required values (see [Environment Variables](#-environment-variables) section)

4. **Start the development servers**:
   ```bash
   # Start frontend (in one terminal)
   npm run dev

   # Start backend (in another terminal)
   cd backend
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🚀 Usage

1. **Register/Login**: Create an account or log in as an admin/user.
2. **Browse Properties**: Use filters to find properties by type, budget, location, etc.
3. **View Projects**: Explore ongoing and completed projects with detailed information.
4. **Admin Panel**: Access admin features to manage listings, users, and content.
5. **Contact Sellers**: Use WhatsApp integration to contact property owners.
6. **Leave Feedback**: Rate and review projects.
//ll
## 🔗 API Endpoints

The API is prefixed with `/api/v1`. Here are some key endpoints:

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Properties
- `GET /api/v1/properties` - List all properties
- `GET /api/v1/properties/:id` - Get property by ID
- `POST /api/v1/properties` - Create new property
- `PATCH /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property
- `POST /api/v1/properties/:id/upload-images` - Upload property images
- `POST /api/v1/properties/:id/upload-videos` - Upload property videos

### Projects
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/:id` - Get project by ID
- `POST /api/v1/projects` - Create new project
- `PATCH /api/v1/projects/:id` - Update project

### Admin
- `GET /api/v1/admin/stats` - Get admin statistics
- `POST /api/v1/admin/feature-property` - Feature a property

### Blogs
- `GET /api/v1/blogs` - List blog posts
- `POST /api/v1/blogs` - Create blog post

For a complete list, refer to the route files in `backend/src/routes/`.

## 📁 Project Structure

```
ourproject/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   │   ├── admin/                # Admin-specific components
│   │   ├── common/               # Common components
│   │   ├── forms/                # Form components
│   │   ├── home/                 # Homepage components
│   │   ├── project/              # Project-related components
│   │   ├── property/             # Property-related components
│   │   └── search/               # Search components
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages
│   │   ├── auth/                 # Authentication pages
│   │   ├── profile/              # User profile pages
│   │   └── public/               # Public pages
│   ├── services/                 # API service functions
│   ├── store/                    # State management (Zustand)
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── layouts/                  # Layout components
│   ├── routes/                   # Routing components
│   ├── config/                   # Configuration files
│   ├── data/                     # Static data files
│   ├── lib/                      # Library configurations
│   ├── pwa/                      # PWA-related files
│   └── styles/                   # CSS stylesheets
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   ├── models/               # MongoDB models
│   │   ├── routes/               # API routes
│   │   ├── middlewares/          # Express middlewares
│   │   ├── config/               # Configuration files
│   │   ├── utils/                # Utility functions
│   │   ├── scripts/              # Database scripts
│   │   └── app.js, server.js     # Main application files
│   └── package.json
├── public/                       # Static assets
├── scripts/                      # Utility scripts
├── package.json                  # Frontend dependencies and scripts
├── vite.config.js                # Vite configuration
├── eslint.config.js              # ESLint configuration
├── vercel.json                   # Vercel deployment config
└── README.md                     # This file
```

## 🔧 Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=/api/v1
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_COMPANY_CONTACT_NAME=Purandar Properties
VITE_COMPANY_CONTACT_PHONE=9999999999
VITE_COMPANY_CONTACT_EMAIL=contact@purandarproperties.com
VITE_COMPANY_WHATSAPP_NUMBER=9999999999
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### Backend (`backend/.env`)
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

## 🚀 Deployment

This project is configured for deployment on Vercel.

1. **Connect to Vercel**: Link your GitHub repository to Vercel.
2. **Environment Variables**: Set the environment variables in Vercel dashboard.
3. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Deploy**: Push changes to trigger automatic deployment.

For backend deployment, consider platforms like Heroku, Railway, or AWS.

## 🔮 Future Improvements

- OTP/SMS provider integration for enhanced authentication
- Payment gateway integration for transactions
- Advanced analytics dashboard with charts and reports
- Mobile app development (React Native)
- AI-powered property recommendations
- Multi-language support
- Integration with external real estate APIs

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint rules
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Purandar Estate Team**

Built and maintained by the Purandar Estate development team.
