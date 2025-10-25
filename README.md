# Eunoia Backend Server
Node.js/Express REST API for authentication, secure journaling, mood analytics, and chat session storage using MongoDB with field-level encryption.

## Tech Stack
- Node.js + Express
- MongoDB (Mongoose)
- JWT for auth, bcrypt for hashing
- AES-256-GCM for sensitive field encryption

## Features
- Auth: register, login, refresh tokens
- Journals: create/read/update/delete (encrypted content)
- Analytics: streaks, weekly mood trends, positivity score, pie chart data
- Chat: session creation, history persistence

## Quick Start
1. Prerequisites: Node 18+, MongoDB
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create .env (see below) and run in dev:
   ```bash
   npm run dev
   ```

## Environment Variables (.env)
- MONGODB_URI=mongodb+srv://...
- JWT_SECRET=your_jwt_secret
- ENCRYPTION_KEY=32-byte-hex-or-base64
- PORT=3000
- CORS_ORIGIN=https://your-frontend

## API Overview
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- Journals: `GET/POST /journals`, `GET/PUT/DELETE /journals/:id`
- Analytics: `GET /analytics/weekly`, `GET /analytics/streaks`, `GET /analytics/pie`
- Chat: `POST /chat/sessions`, `GET /chat/sessions/:id`

## Scripts
- `npm run dev` – start with nodemon
- `npm start` – start production server

## Security Notes
- Sensitive fields encrypted at rest using AES-256-GCM
- JWT-based auth on protected routes

## Deployment
- Works on Railway/Vercel/Render. Ensure environment variables are set and IP allowlist on MongoDB is configured.
