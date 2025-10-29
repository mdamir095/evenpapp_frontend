// Centralized API base URL for your frontend
// Uses Vite's environment variable if available, otherwise falls back to localhost

// For local development, use the full URL directly
// For production, use the relative path with Vite proxy
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://evenpappbackend-production.up.railway.app/api/v1/";
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "https://evenpappbackend-production.up.railway.app/uploads/profile/";
