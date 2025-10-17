require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const chatRoutes = require('./routes/chatRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');

// Initialize Express app
const app = express();

// Trust proxy required for Railway
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'capacitor://localhost',  // iOS Capacitor
  'http://localhost',       // Android Capacitor
  'https://localhost',      // Android Capacitor (HTTPS)
  'ionic://localhost', 
  
       // Ionic
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin starts with allowed patterns (for mobile apps with dynamic ports)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (origin === allowedOrigin) return true;
      // Allow any localhost with http/https (for Android with different ports)
      if (origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) return true;
      // Allow capacitor schemes
      if (origin.startsWith('capacitor://') || origin.startsWith('ionic://')) return true;
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

console.log('CORS Configuration:');
console.log('Allowed Origins:', allowedOrigins);

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // Higher limit for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false,

    validate: {
    ip: false, // Disable IP validation
    keyGeneratorIpFallback: false, // Disable IPv6 warning
  },
  // keyGenerator: (req, res) => {
  //   // Strip port number and handle IPv6 properly
  //   const ip = req.ip.replace(/:\d+[^:]*$/, '');
  //   return ipKeyGenerator(ip);
  // },
});
app.use('/api/', limiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Add this TEMPORARY endpoint for debugging
app.get('/debug-key', (req, res) => {
  const key = process.env.ENCRYPTION_KEY;
  res.json({
    keyExists: !!key,
    keyLength: key?.length,
    first10: key?.substring(0, 10),
    last10: key?.substring(key?.length - 10)
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wellness', wellnessRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
