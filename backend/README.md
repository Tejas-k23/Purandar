# Purandar Backend

Node.js + Express + MongoDB backend for authentication, authorization, property listings, enquiries, saved properties, profile management, and admin moderation.

## Quick Start

1. Copy `.env.example` to `.env`.
2. Install dependencies inside `backend/` with `npm install`.
3. Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `backend/.env`.
4. Run `npm run seed:admin`.
5. Run `npm run dev`.

## Main Routes

- `GET /api/v1/properties`
- `GET /api/v1/properties/:id`
- `POST /api/v1/properties`
- `PATCH /api/v1/properties/:id`
- `DELETE /api/v1/properties/:id`
- `POST /api/v1/properties/:id/enquiries`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/me/properties`
- `GET /api/v1/users/me/saved-properties`
- `POST /api/v1/users/me/saved-properties/:propertyId`
- `DELETE /api/v1/users/me/saved-properties/:propertyId`
- `GET /api/v1/users/me/enquiries`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/properties`
- `PATCH /api/v1/admin/properties/:id/status`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/enquiries`


