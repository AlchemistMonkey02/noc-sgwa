// export const API_BASE_URL = 'https://rgwcma-noc-api.geoplanetsolution.in/api'

export const API_BASE_URL = 'http://localhost:5000/api';
export const AI_SERVICE_URL = 'http://localhost:5030';

if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not defined in environment variables. Using default: " + API_BASE_URL);
}

export default API_BASE_URL;
