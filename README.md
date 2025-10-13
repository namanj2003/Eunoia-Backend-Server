# Eunoia Backend Server

Backend API server for the Eunoia Mental Health App, built with Express.js and MongoDB Atlas.

## Features

- 🔐 **User Authentication** - JWT-based authentication with bcrypt password hashing
- 📝 **Journal Management** - CRUD operations for personal journal entries
- 💬 **Chat System** - Store and retrieve chat conversations with session management
- 🛡️ **Security** - Helmet, CORS, rate limiting, and input validation
- 📊 **MongoDB Atlas** - Cloud database with Mongoose ODM
- ⚡ **Fast & Scalable** - Built on Express.js with best practices

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Express Validator
- **Logging**: Morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the `.env` file with your configuration:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A strong random secret key
     - `CLIENT_URL`: Your frontend URL (default: http://localhost:5173)

4. **Set up MongoDB Atlas**:
   - Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Create a database user
   - Whitelist your IP address (or use 0.0.0.0/0 for development)
   - Get your connection string and update `MONGODB_URI` in `.env`

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/updateprofile` | Update user profile | Yes |
| PUT | `/api/auth/changepassword` | Change password | Yes |

### Journal Routes (`/api/journal`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/journal` | Get all journal entries | Yes |
| GET | `/api/journal/:id` | Get single journal entry | Yes |
| POST | `/api/journal` | Create new journal entry | Yes |
| PUT | `/api/journal/:id` | Update journal entry | Yes |
| DELETE | `/api/journal/:id` | Delete journal entry | Yes |
| GET | `/api/journal/search` | Search journal entries | Yes |

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/sessions` | Get all chat sessions | Yes |
| POST | `/api/chat/sessions` | Create new chat session | Yes |
| GET | `/api/chat/sessions/:sessionId` | Get session with messages | Yes |
| PUT | `/api/chat/sessions/:sessionId` | Update session title | Yes |
| DELETE | `/api/chat/sessions/:sessionId` | Delete chat session | Yes |
| GET | `/api/chat/sessions/:sessionId/messages` | Get messages | Yes |
| POST | `/api/chat/sessions/:sessionId/messages` | Add message | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Check server status | No |

## API Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Journal Entry
```bash
POST /api/journal
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "My First Entry",
  "content": "Today was a great day...",
  "mood": "happy",
  "tags": ["gratitude", "mindfulness"],
  "isPrivate": true
}
```

### Create Chat Session and Add Message
```bash
# Create session
POST /api/chat/sessions
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Therapy Session 1"
}

# Add message
POST /api/chat/sessions/:sessionId/messages
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "role": "user",
  "content": "I've been feeling anxious lately..."
}
```

## Project Structure

```
Eunoia-Backend-Server/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── journalController.js # Journal CRUD operations
│   │   └── chatController.js    # Chat management
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── JournalEntry.js      # Journal entry schema
│   │   └── Chat.js              # Chat schemas
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── journalRoutes.js     # Journal endpoints
│   │   └── chatRoutes.js        # Chat endpoints
│   └── server.js                # Main application file
├── .env.example                  # Environment variables template
├── package.json
└── README.md
```

## Database Models

### User Model
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `createdAt`: Date
- `lastLogin`: Date
- `isActive`: Boolean

### Journal Entry Model
- `userId`: ObjectId (ref: User)
- `title`: String (required)
- `content`: String (required)
- `mood`: String (enum)
- `tags`: Array of Strings
- `isPrivate`: Boolean
- `createdAt`, `updatedAt`: Dates

### Chat Models
#### ChatSession
- `userId`: ObjectId (ref: User)
- `sessionId`: String (unique)
- `title`: String
- `lastMessageAt`: Date
- `isActive`: Boolean

#### ChatMessage
- `userId`: ObjectId (ref: User)
- `sessionId`: String
- `role`: String (user/assistant/system)
- `content`: String
- `timestamp`: Date

## Security Features

- 🔒 Password hashing with bcrypt (10 rounds)
- 🎫 JWT token-based authentication
- 🛡️ Helmet.js for security headers
- 🚦 Rate limiting (100 requests per 15 minutes)
- ✅ Input validation with express-validator
- 🌐 CORS protection
- 🔐 Environment variable configuration

## Development

### Adding New Routes
1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Import and use in `src/server.js`

### Environment Variables
All sensitive configuration should be in `.env` file (never commit this file)

## Troubleshooting

### MongoDB Connection Issues
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

### Authentication Issues
- Verify JWT_SECRET is set in .env
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

### CORS Issues
- Update CLIENT_URL in .env to match your frontend URL

## Next Steps

1. Set up MongoDB Atlas and update `.env` with connection string
2. Generate a strong JWT secret key
3. Run the server with `npm run dev`
4. Test endpoints with Postman or Thunder Client
5. Connect your frontend application

## Contributing

This is part of the Eunoia Mental Health App project. For issues or contributions, please follow the main project guidelines.

## License

ISC
