require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectRedis } = require('./config/redis');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration - Allow both production and development
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://imarticus-lms.netlify.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now, can restrict later
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve video files (for local video support)
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));

// Serve public files (including videos)
app.use('/public', express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(' MongoDB Connected Successfully'))
.catch((err) => {
  console.error(' MongoDB Connection Error:', err);
  process.exit(1);
});

// Redis Connection (Optional - will run without Redis)
// Disabled for now to clean up console
// connectRedis().catch(err => {
//   console.warn('⚠️  Redis not available. Running without cache.');
// });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Log registered routes in development
if (process.env.NODE_ENV !== 'production') {
  console.log(' Registered routes:');
  console.log('   - /api/auth/*');
  console.log('   - /api/courses/*');
  console.log('   - /api/payment/*');
  console.log('   - /api/admin/* (including /api/admin/summarize-document)');
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Imarticus LMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` PDF Summarization Route: /api/admin/summarize-document`);
  console.log(` Deployed: ${new Date().toISOString()}`);
});
