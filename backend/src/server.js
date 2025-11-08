const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Sovereign Identity Guardian API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    features: ['email-scanner', 'transaction-scanner', 'daily-usage-scanner']
  });
});

// AI Models Health Check
app.get('/api/ai-health', (req, res) => {
  const pythonProcess = spawn('python', [
    path.join(__dirname, '../../ai-models/check_models.py')
  ]);

  let result = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const healthData = JSON.parse(result);
        res.json({
          status: 'healthy',
          models: healthData,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        res.status(500).json({
          status: 'error',
          error: 'Failed to parse AI models health data',
          details: result
        });
      }
    } else {
      res.status(500).json({
        status: 'error',
        error: 'AI models health check failed',
        details: error
      });
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/threat-intel', require('./routes/threatIntel'));
app.use('/api/daily-usage', require('./routes/dailyUsage'));
app.use('/api/ai-models', require('./routes/aiModels'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    });
  }
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
🛡️  Sovereign Identity Guardian Backend
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🚀 Server: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/api/health
🤖 AI Health: http://localhost:${PORT}/api/ai-health
  `);
});

module.exports = app;