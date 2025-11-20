# Local Development Setup Guide

This guide will help you run the project locally with proxy configuration.

## Prerequisites

- Node.js >= 20.19.0
- npm >= 10.0.0

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables (Optional)**
   
   By default, the proxy is configured to use `http://localhost:10030` for local development.
   
   If your local backend runs on a different port, create a `.env.local` file:
   ```env
   # Override proxy target (without /api/v1)
   VITE_PROXY_TARGET=http://localhost:YOUR_PORT
   ```
   
   To use Railway production backend instead:
   ```env
   VITE_PROXY_TARGET=https://evenpappbackend-production.up.railway.app
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:5173` (or the port specified in PORT env var)

## How Proxy Works

### Development Mode (`npm run dev`)

- Vite dev server runs on `http://localhost:5173`
- All requests to `/api/*` are automatically proxied to the backend
- **Default backend: `http://localhost:10030`** (local development)
- The proxy target can be overridden with `VITE_PROXY_TARGET` environment variable

### API Request Flow

1. Frontend makes request to `/api/v1/auth/login`
2. Vite proxy intercepts `/api/*` requests
3. Proxy forwards to backend: `http://localhost:10030/api/v1/auth/login` (default)
4. Response is returned to frontend

### Using Different Backend

**Option 1: Environment Variable (Recommended)**
```bash
# Create .env.local file in root directory
VITE_PROXY_TARGET=http://localhost:YOUR_PORT
```

**Option 2: Use Railway Production Backend**
```bash
# Create .env.local
VITE_PROXY_TARGET=https://evenpappbackend-production.up.railway.app
```

**Option 3: Update vite.config.ts directly**
Edit the `proxy.target` in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT', // Your backend URL
    changeOrigin: true,
    secure: false, // Set to false for http://
  }
}
```

## Available Scripts

- `npm run dev` - Start development server with Vite (uses proxy)
- `npm run build` - Build for production
- `npm start` - Start production server (requires build first)
- `npm run preview` - Preview production build locally

## Troubleshooting

### Proxy Not Working

1. **Check if backend is running** (if using local backend)
2. **Check proxy configuration** in `vite.config.ts`
3. **Check browser console** for CORS or network errors
4. **Verify API_BASE_URL** in browser console (should show the configured URL)

### Port Already in Use

Change the port:
```bash
PORT=3000 npm run dev
```

Or update `vite.config.ts`:
```typescript
server: {
  port: 3000, // Your preferred port
}
```

### CORS Issues

If you see CORS errors:
- Make sure `changeOrigin: true` is set in proxy config
- Check if backend allows requests from `http://localhost:5173`
- For local backend, ensure CORS is configured to allow localhost

## Production Build

For production build:
```bash
npm run build
npm start
```

The production server (`server.js`) also includes proxy functionality and will serve the built files.

