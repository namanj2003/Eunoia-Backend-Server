# 🚀 Quick Start Reference Card

## ⚡ Get Started in 5 Minutes

### 1️⃣ MongoDB Atlas Setup
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP (0.0.0.0/0 for dev)
5. Get connection string
```

### 2️⃣ Configure Environment
```bash
# Create .env file
copy .env.example .env

# Edit .env with your values:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eunoia-db
JWT_SECRET=your-random-secret-minimum-32-characters-long
```

### 3️⃣ Install & Run
```bash
npm install
npm run dev
```

✅ Server running at: http://localhost:5000
✅ Health check: http://localhost:5000/health

---

## 🔑 Quick Test Commands

### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```
**Save the token from response!**

### Create Journal Entry
```bash
POST http://localhost:5000/api/journal
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "My First Entry",
  "content": "Today was a great day!",
  "mood": "happy",
  "tags": ["gratitude"]
}
```

### Create Chat Session
```bash
POST http://localhost:5000/api/chat/sessions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "My First Chat"
}
```

---

## 📋 Available Endpoints

### Authentication (No token required)
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Protected Endpoints (Require token)
- `GET /api/auth/me` - Get profile
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create entry
- `GET /api/chat/sessions` - Get chat sessions
- `POST /api/chat/sessions` - Create session

**Full API docs:** See `API_DOCUMENTATION.md`

---

## 🔧 NPM Scripts

```bash
npm run dev      # Development mode (auto-reload)
npm start        # Production mode
```

---

## 📁 Important Files

- `SETUP_GUIDE.md` - Complete MongoDB Atlas setup
- `API_DOCUMENTATION.md` - Full API reference
- `IMPLEMENTATION_SUMMARY.md` - What we built
- `README.md` - Main documentation
- `.env.example` - Environment template

---

## 🆘 Common Issues

### "MongooseServerSelectionError"
- ✅ Check MongoDB URI in .env
- ✅ Verify IP is whitelisted
- ✅ Confirm username/password correct

### "JWT_SECRET is not defined"
- ✅ Create .env file
- ✅ Add JWT_SECRET to .env
- ✅ Restart server

### "Port 5000 already in use"
- ✅ Change PORT in .env to 5001
- ✅ Or kill process on port 5000

---

## 🎯 Project Structure

```
src/
├── config/database.js       # MongoDB connection
├── models/                  # Data schemas
├── controllers/             # Business logic
├── routes/                  # API endpoints
├── middleware/auth.js       # JWT verification
└── server.js               # Main app
```

---

## 🔐 Security Features

✅ Password hashing (bcrypt)
✅ JWT authentication
✅ Rate limiting (100 req/15min)
✅ CORS protection
✅ Input validation
✅ Helmet security headers

---

## 🌟 Key Features

✅ User registration & login
✅ Personal journal with mood tracking
✅ Chat sessions & messages
✅ All data user-specific
✅ Pagination support
✅ Search functionality

---

## 📞 Getting Help

1. Check SETUP_GUIDE.md for detailed setup
2. See API_DOCUMENTATION.md for endpoint details
3. Review server console logs for errors
4. Verify .env configuration

---

## ✨ What's Next?

1. Test all endpoints with Postman/Thunder Client
2. Connect your React frontend
3. Add AI chatbot integration
4. Deploy to production

**You're all set! Start the server and begin testing! 🎉**
