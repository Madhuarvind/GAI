// Frontend configuration
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  ENABLE_DEBUG: process.env.REACT_APP_ENABLE_DEBUG === 'true' || false,
};

export default config;
