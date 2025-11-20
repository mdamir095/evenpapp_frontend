# Quick Start Guide - Local Development

## ⚠️ Important: Development vs Production Server

You're currently running the **production server** (`npm start`), which serves pre-built files from the `dist` folder. This won't reflect your code changes!

For **local development with live changes**, you need to run the **development server**.

## 🚀 Steps to Run Locally with Live Changes

### 1. Stop the Current Server
Press `Ctrl+C` in the terminal where the server is running, or close that terminal.

### 2. Start the Development Server
```powershell
npm run dev
```

This will:
- ✅ Start Vite development server with hot module replacement
- ✅ Automatically reload when you make code changes
- ✅ Proxy API requests to `http://localhost:10030` (your local backend)
- ✅ Show helpful error messages in the browser

### 3. Access Your Application
Open your browser and go to:
```
http://localhost:5173
```

## 📝 Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev` | **Development server** | ✅ **Use this for local development** |
| `npm start` | Production server | Only after building (`npm run build`) |
| `npm run build` | Build for production | Before deploying |
| `npm run preview` | Preview production build | To test production build locally |

## 🔧 Configuration

### Default Setup (No Configuration Needed)
- Frontend: `http://localhost:5173`
- Backend Proxy: `http://localhost:10030`
- All `/api/*` requests are automatically proxied

### Custom Backend Port
If your backend runs on a different port, create `.env.local`:
```env
VITE_PROXY_TARGET=http://localhost:YOUR_PORT
```

### Use Railway Production Backend
```env
VITE_PROXY_TARGET=https://evenpappbackend-production.up.railway.app
```

## 🐛 Troubleshooting

### Port 5173 Already in Use
```powershell
# Use a different port
$env:PORT=3000; npm run dev
```

### Changes Not Reflecting
- Make sure you're running `npm run dev` (not `npm start`)
- Check browser console for errors
- Hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`

### Backend Connection Issues
- Verify your local backend is running on `http://localhost:10030`
- Check the browser console Network tab for API errors
- Verify proxy configuration in `vite.config.ts`

## 📌 Summary

**For local development with live changes:**
```powershell
npm run dev
```

**NOT:**
```powershell
npm start  # ❌ This is for production only
```

