// Working local development server - Pure JavaScript (CommonJS)
require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const session = require('express-session');
const MemoryStore = require('memorystore');
const path = require('path');

// Simple logging
function log(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const emoji = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${timestamp} ${emoji} ${message}`);
}

// Create Express app
const app = express();
const server = createServer(app);
const port = parseInt(process.env.PORT || "3001");

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    });
  }
  next();
});

// Setup sessions for local development
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-local-only',
  store: new MemoryStoreSession({
    checkPeriod: 86400000, // 24h
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // HTTP for local dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
}));

log('Memory session store configured for local development');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Local Development Server (JavaScript)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: port
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Local development API is working perfectly!',
    timestamp: new Date().toISOString(),
    session: req.session ? 'active' : 'none'
  });
});

// Database and API routes setup
async function setupDatabase() {
  try {
    log('Setting up database connection...');
    
    // Import storage (using dynamic import for ES modules)
    const { storage } = await import("./storage.js");
    
    // Test database connection
    const profile = await storage.getProfile();
    log(`Database connected successfully. Profile: ${profile?.name || 'No name set'}`, 'success');
    
    // Public API routes
    app.get('/api/profile', async (req, res) => {
      try {
        const profile = await storage.getProfile();
        res.json(profile);
      } catch (error) {
        log(`Profile API error: ${error}`, 'error');
        res.status(500).json({ message: 'Failed to get profile' });
      }
    });

    app.get('/api/experiences', async (req, res) => {
      try {
        const experiences = await storage.getExperiences();
        res.json(experiences);
      } catch (error) {
        log(`Experiences API error: ${error}`, 'error');
        res.status(500).json({ message: 'Failed to get experiences' });
      }
    });

    app.get('/api/case-studies', async (req, res) => {
      try {
        const caseStudies = await storage.getCaseStudies();
        res.json(caseStudies);
      } catch (error) {
        log(`Case studies API error: ${error}`, 'error');
        res.status(500).json({ message: 'Failed to get case studies' });
      }
    });

    // Auth routes
    app.post('/api/admin/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        
        if (!username || !password) {
          return res.status(400).json({ message: 'Username and password required' });
        }

        // Import auth functions
        const { verifyPassword } = await import("./auth.js");
        
        const admin = await storage.getAdminByUsername(username);
        if (!admin) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await verifyPassword(password, admin.password);
        if (!validPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.adminId = admin.id;
        log(`Admin login successful: ${username}`, 'success');
        res.json({ message: 'Login successful' });
      } catch (error) {
        log(`Login error: ${error}`, 'error');
        res.status(500).json({ message: 'Login failed' });
      }
    });

    app.post('/api/admin/logout', (req, res) => {
      req.session?.destroy((err) => {
        if (err) {
          log(`Logout error: ${err}`, 'error');
          return res.status(500).json({ message: 'Logout failed' });
        }
        log('Admin logout successful', 'success');
        res.json({ message: 'Logout successful' });
      });
    });

    log('All API routes configured', 'success');
    return true;
    
  } catch (error) {
    log(`Database setup failed: ${error}`, 'error');
    log('Server will run with limited functionality', 'error');
    return false;
  }
}

// Frontend setup (simplified for now)
function setupFrontend() {
  // Simple HTML page for development
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Portfolio Development Server</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              max-width: 900px; margin: 50px auto; padding: 30px; 
              background: #fafafa;
            }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .endpoint { 
              background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; 
              border-left: 4px solid #28a745;
            }
            .endpoint a { color: #0066cc; text-decoration: none; font-weight: 500; }
            .endpoint a:hover { text-decoration: underline; }
            h1 { color: #333; margin-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .badge { background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Portfolio Development Server</h1>
            <div class="status">
              <strong>✅ Server Status:</strong> Running perfectly! 
              <span class="badge">READY</span>
            </div>
            
            <h2>🔍 API Endpoints:</h2>
            <div class="endpoint">
              <strong>Health Check:</strong> <a href="/health">/health</a><br>
              <small>Server status and information</small>
            </div>
            <div class="endpoint">
              <strong>API Test:</strong> <a href="/api/test">/api/test</a><br>
              <small>Test API functionality and sessions</small>
            </div>
            <div class="endpoint">
              <strong>Your Profile:</strong> <a href="/api/profile">/api/profile</a><br>
              <small>Your imported profile data from Replit</small>
            </div>
            <div class="endpoint">
              <strong>Work Experiences:</strong> <a href="/api/experiences">/api/experiences</a><br>
              <small>Your work history and experiences</small>
            </div>
            <div class="endpoint">
              <strong>Case Studies:</strong> <a href="/api/case-studies">/api/case-studies</a><br>
              <small>Your portfolio case studies</small>
            </div>
            
            <h2>💡 Development Information:</h2>
            <ul>
              <li><strong>Server Type:</strong> Local Development (JavaScript)</li>
              <li><strong>Port:</strong> ${port}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV}</li>
              <li><strong>Database:</strong> Connected with your Replit data</li>
              <li><strong>Sessions:</strong> Memory store (development only)</li>
              <li><strong>Frontend:</strong> Ready for React development</li>
            </ul>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 14px;">
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Test the API endpoints above</li>
                <li>Start building your React frontend</li>
                <li>Use admin login for protected features</li>
                <li>Deploy to Vercel when ready</li>
              </ol>
              <p><em>Server started: ${new Date().toISOString()}</em></p>
            </div>
          </div>
        </body>
      </html>
    `);
  });
  
  log('Simple frontend configured', 'success');
}

// Start the server
async function startServer() {
  try {
    log('Starting local development server...', 'info');
    
    // Setup database and API routes
    const dbReady = await setupDatabase();
    
    // Setup frontend
    setupFrontend();
    
    // Error handler
    app.use((err, req, res, next) => {
      log(`Server error: ${err.message}`, 'error');
      res.status(500).json({ message: 'Internal server error' });
    });
    
    // Start listening
    server.listen(port, () => {
      console.log('\n' + '='.repeat(70));
      log(`🎉 LOCAL DEVELOPMENT SERVER IS READY!`, 'success');
      log(`🌐 URL: http://localhost:${port}`, 'success');
      log(`🔍 Health: http://localhost:${port}/health`, 'info');
      log(`📊 API Test: http://localhost:${port}/api/test`, 'info');
      if (dbReady) {
        log(`💾 Database: Connected with your imported Replit data`, 'success');
      }
      console.log('='.repeat(70));
      console.log('');
      console.log('🎯 READY TO DEVELOP! Open http://localhost:' + port + ' in your browser');
      console.log('');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is in use. Try: PORT=3002 npm run dev`, 'error');
      } else {
        log(`Server error: ${error.message}`, 'error');
      }
      process.exit(1);
    });

  } catch (error) {
    log(`Failed to start server: ${error}`, 'error');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  log('Shutting down server...', 'info');
  server.close(() => {
    log('Server closed', 'info');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('\\nReceived SIGINT, shutting down gracefully...', 'info');
  server.close(() => {
    log('Server closed', 'info');
    process.exit(0);
  });
});

// Start the server
startServer();