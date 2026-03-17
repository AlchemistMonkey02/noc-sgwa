const DEFAULT_API_URL = 'https://rgwcma-noc-api.geoplanetsolution.in/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5020';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace('/api', '');
export const CONSULTATION_APP_URL = import.meta.env.VITE_CONSULTATION_APP_URL || 'http://localhost:3000';


if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not defined in environment variables. Using default: " + DEFAULT_API_URL);
}

export default API_BASE_URL;
