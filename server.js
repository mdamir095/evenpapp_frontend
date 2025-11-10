import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;
const distDir = join(__dirname, 'dist');

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

function serveFile(filePath, res) {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const stats = statSync(filePath);
    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not a file');
      return;
    }

    const content = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Content-Length': content.length,
      'Connection': 'keep-alive'
    });
    res.end(content);
    console.log(`✓ Served ${filePath} (${content.length} bytes)`);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
}

const server = createServer((req, res) => {
  // Log incoming requests immediately
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Headers:`, JSON.stringify(req.headers));
  
  try {
    // Health check endpoint
    if (req.url === '/health' || req.url === '/healthz') {
      console.log('Health check requested');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query string
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    const fullPath = join(distDir, filePath);

    // If file doesn't exist and it's not an API route, serve index.html (for SPA routing)
    if (!existsSync(fullPath) && !filePath.startsWith('/api')) {
      const indexPath = join(distDir, 'index.html');
      if (existsSync(indexPath)) {
        serveFile(indexPath, res);
        return;
      }
    }

    serveFile(fullPath, res);
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
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
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

