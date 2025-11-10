import { createServer } from 'http';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;
const distDir = join(__dirname, 'dist');

// Backend API configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://evenpappbackend-production.up.railway.app';
console.log(`Backend API URL: ${API_BASE_URL}`);

// Check if dist directory exists
if (!existsSync(distDir)) {
  console.error(`Error: dist directory not found at ${distDir}`);
  console.error('Please run "npm run build" first');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
};

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function proxyRequest(req, res, requestId) {
  try {
    const backendUrl = new URL(API_BASE_URL);
    const isHttps = backendUrl.protocol === 'https:';
    const requestModule = isHttps ? httpsRequest : httpRequest;
    
    // Construct the full backend URL with the API path
    const targetPath = req.url; // This already includes /api/...
    const targetUrl = `${API_BASE_URL}${targetPath}`;
    
    console.log(`[${requestId}] Proxying ${req.method} ${req.url} to: ${targetUrl}`);
    
    // Copy headers but update host
    const headers = { ...req.headers };
    headers.host = backendUrl.hostname;
    // Remove connection header as it's connection-specific
    delete headers.connection;
    
    const options = {
      hostname: backendUrl.hostname,
      port: backendUrl.port || (isHttps ? 443 : 80),
      path: targetPath, // Use the request path directly (includes /api/...)
      method: req.method,
      headers: headers
    };

    const proxyReq = requestModule(options, (proxyRes) => {
      console.log(`[${requestId}] Backend responded with status: ${proxyRes.statusCode}`);
      
      // Copy response headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe the response
      proxyRes.pipe(res);
      
      proxyRes.on('end', () => {
        console.log(`[${requestId}] ✓ API request completed`);
      });
    });

    proxyReq.on('error', (error) => {
      console.error(`[${requestId}] Proxy error:`, error.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Bad Gateway', 
          message: 'Failed to connect to backend server',
          details: error.message
        }));
      }
    });

    // Pipe the request body
    req.pipe(proxyReq);
    
  } catch (error) {
    console.error(`[${requestId}] Proxy setup error:`, error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal Server Error', 
        message: 'Failed to setup proxy',
        details: error.message
      }));
    }
  }
}

function serveFile(filePath, res, requestId = '') {
  try {
    if (!existsSync(filePath)) {
      console.error(`[${requestId}] File not found: ${filePath}`);
      if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
      return;
    }

    const stats = statSync(filePath);
    if (!stats.isFile()) {
      console.error(`[${requestId}] Path is not a file: ${filePath}`);
      if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not a file');
      }
      return;
    }

    const content = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    if (!res.headersSent) {
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Content-Length': content.length,
        'Connection': 'keep-alive'
      });
      res.end(content);
      console.log(`[${requestId}] ✓ Served ${filePath} (${content.length} bytes, ${mimeType})`);
    } else {
      console.error(`[${requestId}] Headers already sent, cannot serve file`);
    }
  } catch (error) {
    console.error(`[${requestId}] Error serving file:`, error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  }
}

const server = createServer((req, res) => {
  // Log incoming requests immediately - this should always fire if requests reach the server
  const requestId = Date.now();
  console.log(`[${requestId}] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`[${requestId}] Remote address: ${req.socket.remoteAddress}:${req.socket.remotePort}`);
  
  // Set timeout to prevent hanging connections
  req.setTimeout(30000, () => {
    console.log(`[${requestId}] Request timeout`);
    if (!res.headersSent) {
      res.writeHead(408, { 'Content-Type': 'text/plain' });
      res.end('Request timeout');
    }
  });
  
  try {
    // Health check endpoint - Railway might be checking this
    if (req.url === '/health' || req.url === '/healthz') {
      console.log(`[${requestId}] Serving health check`);
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      });
      res.end(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: PORT
      }));
      console.log(`[${requestId}] ✓ Health check responded`);
      return;
    }

    // Proxy API requests to backend (any path starting with /api)
    if (req.url.startsWith('/api')) {
      console.log(`[${requestId}] Proxying API request: ${req.url}`);
      proxyRequest(req, res, requestId);
      return;
    }

    // Handle root path and all other requests
    let filePath = req.url === '/' ? '/index.html' : req.url;
    console.log(`[${requestId}] Resolved file path: ${filePath}`);
    
    // Remove query string
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    const fullPath = join(distDir, filePath);
    console.log(`[${requestId}] Full path: ${fullPath}`);
    console.log(`[${requestId}] File exists: ${existsSync(fullPath)}`);

    // If file doesn't exist and it's not an API route, serve index.html (for SPA routing)
    if (!existsSync(fullPath) && !filePath.startsWith('/api')) {
      console.log(`[${requestId}] File not found, serving index.html for SPA routing`);
      const indexPath = join(distDir, 'index.html');
      if (existsSync(indexPath)) {
        serveFile(indexPath, res, requestId);
        return;
      } else {
        console.error(`[${requestId}] index.html not found!`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('index.html not found');
        return;
      }
    }

    serveFile(fullPath, res, requestId);
  } catch (error) {
    console.error('Unhandled error in request handler:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Serving files from: ${distDir}`);
  console.log(`PORT environment variable: ${process.env.PORT}`);
  
  // Verify server is actually listening
  const address = server.address();
  console.log(`Server listening on:`, address);
  
  // Verify index.html exists
  const indexPath = join(distDir, 'index.html');
  if (existsSync(indexPath)) {
    console.log('✓ index.html found');
    const stats = statSync(indexPath);
    console.log(`  File size: ${stats.size} bytes`);
  } else {
    console.error('✗ index.html NOT found in dist directory!');
  }
  
  // Test that we can actually read the file
  try {
    const testContent = readFileSync(indexPath, 'utf8');
    console.log(`✓ Successfully read index.html (${testContent.length} chars)`);
  } catch (error) {
    console.error('✗ Error reading index.html:', error);
  }
  
  // Log that server is ready to accept connections
  console.log('✓ Server is ready to accept connections');
  console.log('Waiting for incoming requests...');
  console.log(`Health check available at: http://0.0.0.0:${PORT}/health`);
  console.log(`Main site available at: http://0.0.0.0:${PORT}/`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  console.error('Error details:', error.message, error.code);
  process.exit(1);
});

// Log when connections are established (even before requests)
server.on('connection', (socket) => {
  const connId = Date.now();
  console.log(`[CONNECTION ${connId}] New connection from ${socket.remoteAddress}:${socket.remotePort}`);
  
  socket.on('error', (err) => {
    console.error(`[CONNECTION ${connId}] Socket error:`, err.message);
  });
  
  socket.on('close', (hadError) => {
    console.log(`[CONNECTION ${connId}] Connection closed (hadError: ${hadError}) from ${socket.remoteAddress}:${socket.remotePort}`);
  });
  
  socket.on('timeout', () => {
    console.log(`[CONNECTION ${connId}] Socket timeout`);
    socket.destroy();
  });
  
  // Set socket timeout
  socket.setTimeout(60000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, let the server continue running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, let the server continue running
});

