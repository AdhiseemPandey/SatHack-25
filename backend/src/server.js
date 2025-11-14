const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// AI Models Health Check (with error handling)
app.get('/api/ai-health', (req, res) => {
  const checkModelsPath = path.join(__dirname, '../../ai-models/check_models.py');
  
  // Check if the Python file exists
  if (!fs.existsSync(checkModelsPath)) {
    return res.json({
      status: 'ai_models_not_found',
      message: 'AI models check script not found, using fallback analysis',
      timestamp: new Date().toISOString()
    });
  }

  const pythonProcess = spawn('python', [checkModelsPath]);

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
        res.json({
          status: 'error_parsing',
          error: 'Failed to parse AI models health data',
          details: result.substring(0, 200), // Limit response size
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.json({
        status: 'check_failed',
        error: 'AI models health check failed',
        details: error.substring(0, 200), // Limit response size
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Safe route loader function
function loadRoute(routePath, defaultRoute = null) {
  try {
    const fullPath = path.join(__dirname, routePath);
    
    // Check if the route file exists
    if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.js')) {
      console.warn(`⚠️ Route file not found: ${routePath}`);
      
      // Return a default router if provided
      if (defaultRoute) {
        return defaultRoute;
      }
      
      // Or return a basic router that shows route not implemented
      const router = express.Router();
      router.all('*', (req, res) => {
        res.status(501).json({
          error: 'Route not implemented',
          path: req.path,
          method: req.method,
          message: 'This API route exists but is not yet implemented'
        });
      });
      return router;
    }
    
    // Try to require the route
    return require(fullPath);
  } catch (error) {
    console.error(`❌ Failed to load route ${routePath}:`, error.message);
    
    // Return a fallback router
    const router = express.Router();
    router.all('*', (req, res) => {
      res.status(500).json({
        error: 'Route loading failed',
        path: req.path,
        method: req.method,
        message: 'This route could not be loaded due to an internal error'
      });
    });
    return router;
  }
}

// API Routes with safe loading
console.log('🔄 Loading API routes...');

// Basic auth routes (always available)
const authRouter = express.Router();
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      message: 'Authentication system placeholder - Login successful',
      token: 'demo_jwt_token_' + Date.now(),
      user: {
        id: '1',
        email: email,
        username: email.split('@')[0],
        preferences: {
          autoConnectWallet: true,
          notifications: true
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
});

authRouter.post('/register', (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and username are required'
    });
  }

  res.json({
    success: true,
    message: 'Authentication system placeholder - Registration successful',
    token: 'demo_jwt_token_' + Date.now(),
    user: {
      id: Date.now().toString(),
      email: email,
      username: username,
      createdAt: new Date().toISOString(),
      preferences: {
        autoConnectWallet: true,
        notifications: true
      }
    }
  });
});

authRouter.post('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && token.startsWith('demo_jwt_token_')) {
    res.json({
      success: true,
      user: {
        id: '1',
        email: 'demo@example.com',
        username: 'demo_user',
        preferences: {
          autoConnectWallet: true,
          notifications: true
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
});

app.use('/api/auth', authRouter);

// Load other routes safely
app.use('/api/scan', loadRoute('./routes/scan'));
app.use('/api/threat-intel', loadRoute('./routes/threatIntel'));
app.use('/api/daily-usage', loadRoute('./routes/dailyUsage'));
app.use('/api/ai-models', loadRoute('./routes/aiModels'));

// Demo data endpoints for missing routes
app.get('/api/daily-usage/status', (req, res) => {
  res.json({
    status: 'operational',
    scanner: 'DailyUsageScanner',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    features: ['ai-integration', 'batch-scan', 'behavior-patterns', 'privacy-analysis']
  });
});

app.get('/api/ai-models/status', (req, res) => {
  res.json({
    success: true,
    status: {
      transaction_scanner: {
        status: 'loaded',
        accuracy: 0.92,
        last_trained: new Date().toISOString()
      },
      email_scanner: {
        status: 'loaded', 
        accuracy: 0.88,
        last_trained: new Date().toISOString()
      },
      daily_usage_scanner: {
        status: 'loaded',
        accuracy: 0.85,
        last_trained: new Date().toISOString()
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      '/api/health',
      '/api/ai-health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify',
      '/api/scan/transaction',
      '/api/scan/status',
      '/api/threat-intel/malicious-addresses',
      '/api/daily-usage/status',
      '/api/ai-models/status'
    ]
  });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Frontend build directory not found:', frontendBuildPath);
  }
}

// Global 404 Handler (for non-API routes)
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    // This should have been caught by the API 404 handler
    res.status(404).json({
      error: 'API route not found',
      path: req.originalUrl,
      method: req.method
    });
  } else {
    // For non-API routes, serve a simple message or redirect
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      message: 'The requested endpoint does not exist'
    });
  }
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('🔥 Global Error Handler:', error);
  
  // Handle JSON parsing errors
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    });
  }
  
  // Handle route loading errors
  if (error.message.includes('Cannot find module')) {
    return res.status(501).json({
      error: 'Service temporarily unavailable',
      message: 'The requested service is still being initialized'
    });
  }
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack
    })
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
💡 API Ready: http://localhost:${PORT}/api
  `);
  
  // Log available routes
  console.log('\n📋 Available API Routes:');
  console.log('   ├── /api/health');
  console.log('   ├── /api/ai-health');
  console.log('   ├── /api/auth/*');
  console.log('   ├── /api/scan/*');
  console.log('   ├── /api/threat-intel/*');
  console.log('   ├── /api/daily-usage/*');
  console.log('   └── /api/ai-models/*');
});

module.exports = app;