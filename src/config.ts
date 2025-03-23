
/**
 * Application configuration
 */

const isDevelopment = import.meta.env.DEV;

// Configuration for different environments
const config = {
  // API endpoints
  api: {
    // Base URL for all API requests
    baseUrl: isDevelopment 
      ? 'http://localhost:5000/api' 
      : process.env.REACT_APP_API_URL || 'https://your-api-domain.com/api',
    
    // Endpoints
    endpoints: {
      alerts: '/alerts',
      messages: '/messages'
    }
  },
  
  // Map configuration (for future use)
  map: {
    apiKey: process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtby1hcGkta2V5IiwiYSI6ImNsMHRuMjlscjBwNHgzanBrdWNqZmdxdXYifQ.Cwoi9UvQRiYC9GEBPDfcxw'
  }
};

export default config;
