// Centralized API base URL for your frontend
// Uses Vite's environment variable if available, otherwise falls back to localhost

// For local development, use localhost
// For production, use the Railway URL
const getApiBaseUrl = () => {
  // Check if VITE_API_BASE_URL is set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Debug: Log environment variables
  console.log('🔍 Environment Check:');
  console.log('  VITE_API_BASE_URL:', envUrl);
  console.log('  import.meta.env.MODE:', import.meta.env.MODE);
  console.log('  import.meta.env.DEV:', import.meta.env.DEV);
  console.log('  import.meta.env.PROD:', import.meta.env.PROD);
  
  if (envUrl) {
    console.log('✅ Using VITE_API_BASE_URL:', envUrl);
    return envUrl;
  }
  
  // Default to localhost for local development
  const defaultUrl = "http://localhost:10030/api/v1/";
  console.log('⚠️ VITE_API_BASE_URL not set, using default:', defaultUrl);
  return defaultUrl;
};

export const API_BASE_URL = getApiBaseUrl();
console.log('🌐 Final API_BASE_URL:', API_BASE_URL);

export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:10030/uploads/profile/";
