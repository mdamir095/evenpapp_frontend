// Centralized API base URL for your frontend
// Uses Vite's environment variable if available, otherwise falls back to localhost

// For local development, use localhost
// For production, use the Railway URL
const getApiBaseUrl = () => {
  // Check if VITE_API_BASE_URL is set
  let envUrl = import.meta.env.VITE_API_BASE_URL;
  
  
  // In production, use relative paths to go through the proxy
  // In development, use the full URL
  if (import.meta.env.PROD) {
    // Production: Use relative path so requests go through our proxy server
    const prodUrl = '/api/v1/';
    return prodUrl;
  }
  
  if (envUrl) {
    // Ensure the URL ends with /api/v1/
    // Remove trailing slash if present
    envUrl = envUrl.replace(/\/+$/, '');
    
    // Check if /api/v1 is already in the URL
    if (!envUrl.includes('/api/v1')) {
      envUrl = `${envUrl}/api/v1`;
    }
    
    // Ensure it ends with a slash for proper path joining
    if (!envUrl.endsWith('/')) {
      envUrl = `${envUrl}/`;
    }
    
    return envUrl;
  }
  
  // Default to localhost for local development
  const defaultUrl = "http://localhost:10030/api/v1/";
  return defaultUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:10030/uploads/profile/";
