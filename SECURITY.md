# 🛡️ Security Implementation Guide

## Overview

The Eunoia Mental Health App implements **enterprise-grade security** to protect sensitive user data. This document outlines all security measures implemented in the backend.

---

## 🔐 Data Encryption

### Encrypted Fields
All sensitive user data is encrypted at rest using **AES-256-GCM**:

✅ **Journal Entries**
- Title (encrypted)
- Content (encrypted)
- ML Analysis (not encrypted - needed for insights)
- Keystroke Data (not encrypted - behavioral analytics)

✅ **Chat Messages**
- User messages (encrypted)
- AI responses (encrypted)
- Chat session titles (encrypted)
- Session metadata (not encrypted - needed for indexing)

### Encryption Details
- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Size**: 256 bits (32 bytes)
- **IV Length**: 16 bytes (unique per message)
- **Authentication Tag**: 16 bytes (integrity verification)

### Implementation
```javascript
// Automatic encryption on save
title: {
  type: String,
  set: encrypt,  // Encrypts before storage
  get: decrypt   // Decrypts on retrieval
}
```

📖 **Full Documentation**: See `ENCRYPTION_README.md`

---

## 🔑 Authentication & Authorization

### JWT Token-Based Authentication

**Token Generation**
- Signed with `JWT_SECRET` from environment variables
- Expiration: 30 days (configurable in `.env`)
- Payload includes: `userId`, `email`, `iat`, `exp`

**Token Validation**
- All protected routes require valid JWT token
- Token sent in `Authorization` header: `Bearer <token>`
- Middleware validates token and attaches user to request

**Implementation**
```javascript
// Middleware: src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

### Password Security

**Hashing Algorithm**: bcryptjs with 10 salt rounds
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Password Requirements** (enforced in frontend):
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special characters

**Password Verification**
```javascript
const isMatch = await bcrypt.compare(password, user.password);
```

---

## 🚦 Rate Limiting

### Protection Against Brute Force

**Configuration**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

**Endpoints Protected**:
- All API routes (`/api/*`)
- Authentication routes (login, register)
- Journal CRUD operations
- Chat endpoints

---

## 🌐 CORS Configuration

### Cross-Origin Resource Sharing

**Allowed Origins**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

**Configured URLs**:
- Development: `http://localhost:3000`
- Production: Set via `CLIENT_URL` environment variable

---

## 🛡️ Helmet.js Security Headers

### HTTP Security Headers

**Enabled Protections**:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

**Headers Set**:
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Forces HTTPS
- `Content-Security-Policy` - Restricts resource loading

---

## 📊 Input Validation & Sanitization

### Express Validator

**Journal Entry Validation**
```javascript
const { body, validationResult } = require('express-validator');

// Create journal entry validation
[
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('title').isLength({ max: 200 }).withMessage('Title too long'),
  body('content').isLength({ max: 10000 }).withMessage('Content too long')
]
```

**User Registration Validation**
```javascript
[
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().escape()
]
```

**Sanitization**:
- Email normalization (lowercase, trim)
- HTML escape for text fields
- Trim whitespace
- Max length enforcement

---

## 🗄️ Database Security

### MongoDB Security

**Connection Security**
- Uses MongoDB Atlas (cloud-hosted)
- TLS/SSL encryption in transit
- Connection string stored in environment variables
- No hardcoded credentials

**Connection String** (`.env`)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

**User Isolation**
- All queries filtered by `userId`
- Users can only access their own data
- Mongoose middleware enforces user scope

**Example**:
```javascript
// Ensure user can only fetch their own entries
const entries = await JournalEntry.find({ userId: req.user.id });
```

### Encryption at Rest (MongoDB Atlas)
- Enable in MongoDB Atlas dashboard
- Encrypts data files on disk
- Additional layer beyond application-level encryption

---

## 🔒 Environment Variables

### Secret Management

**Required Variables** (`.env`):
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Encryption
ENCRYPTION_KEY=your_64_character_hex_encryption_key

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app_password_here
```

**Best Practices**:
- ✅ All secrets in `.env` file
- ✅ `.env` in `.gitignore`
- ✅ Different keys per environment (dev/prod)
- ✅ Use secret managers in production (AWS Secrets Manager, Azure Key Vault)
- ❌ Never commit `.env` to version control
- ❌ Never share secrets in chat/email

---

## 🚨 Error Handling

### Secure Error Messages

**Production Mode**:
- Generic error messages to clients
- Detailed logs server-side only
- No stack traces exposed

**Error Response Example**:
```javascript
if (process.env.NODE_ENV === 'production') {
  return res.status(500).json({ 
    error: 'An error occurred. Please try again.' 
  });
} else {
  return res.status(500).json({ 
    error: error.message,
    stack: error.stack 
  });
}
```

---

## 📝 Logging & Monitoring

### Morgan HTTP Logger

**Request Logging**:
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

**Logged Information**:
- HTTP method and URL
- Status code and response time
- User agent and IP address
- Timestamp

**Security Considerations**:
- ✅ Don't log passwords or tokens
- ✅ Don't log encrypted data keys
- ✅ Rotate logs regularly
- ✅ Monitor for suspicious patterns

---

## 🔐 Additional Security Measures

### 1. NoSQL Injection Prevention
- Use Mongoose parameterized queries
- Validate and sanitize all inputs
- Never use string concatenation for queries

### 2. XSS Protection
- HTML escape user inputs
- Content Security Policy headers (Helmet)
- Sanitize data before rendering

### 3. CSRF Protection
- JWT tokens (not vulnerable to CSRF)
- SameSite cookies (if using cookies)

### 4. Secure Session Management
- JWT stored in memory (localStorage in frontend)
- Tokens expire after 30 days
- Logout clears tokens

### 5. Dependency Security
- Regular `npm audit` checks
- Update dependencies for security patches
- Monitor for vulnerabilities

---

## 🧪 Security Testing

### Test Encryption
```bash
node src/utils/testEncryption.js
```

### Check Dependencies
```bash
npm audit
npm audit fix
```

### Verify Environment
```bash
node -e "require('dotenv').config(); console.log('JWT_SECRET:', !!process.env.JWT_SECRET); console.log('ENCRYPTION_KEY:', !!process.env.ENCRYPTION_KEY);"
```

---

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] Generate unique `ENCRYPTION_KEY` for production
- [ ] Generate unique `JWT_SECRET` for production
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB encryption at rest
- [ ] Configure HTTPS/TLS on server
- [ ] Set up secret manager (AWS/Azure/GCP)
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

### Post-Deployment
- [ ] Test encryption in production
- [ ] Verify JWT authentication works
- [ ] Test API endpoints with production data
- [ ] Monitor logs for errors
- [ ] Set up automated backups
- [ ] Document incident response plan

---

## 📞 Security Contact

For security vulnerabilities or concerns:
1. **Do not** create public GitHub issues
2. Email: [Your security email]
3. Include detailed description and reproduction steps
4. Allow reasonable time for patching before disclosure

---

## 📚 References & Resources

### Standards & Compliance
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Encryption Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [GDPR Data Protection](https://gdpr.eu/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)

### Libraries Used
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JWT authentication
- [helmet](https://www.npmjs.com/package/helmet) - Security headers
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) - Rate limiting
- [express-validator](https://www.npmjs.com/package/express-validator) - Input validation

### Documentation
- [Node.js Crypto API](https://nodejs.org/api/crypto.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: October 13, 2025  
**Version**: 1.0.0

**Remember**: Security is an ongoing process. Regularly review and update security measures! 🛡️
