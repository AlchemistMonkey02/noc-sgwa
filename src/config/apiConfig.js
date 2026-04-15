const DEFAULT_API_URL = 'http://localhost:5021/api';
const DEFAULT_SITE_URL = 'http://localhost:5173';
export const MAIN_PORTAL_URL = 'http://localhost:5174';

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'https://ocr.geoplanetsolution.in';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace('/api', '');
export const CONSULTATION_APP_URL = import.meta.env.VITE_CONSULTATION_APP_URL || 'https://rqwcma-consultation.geoplanetsolution.in';

// Public Site & Assets
export const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || MAIN_PORTAL_URL;
export const RIG_REGISTRATION_URL = import.meta.env.VITE_RIG_REGISTRATION_URL || 'https://rig.geoplanetsolution.in/';

if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not defined in environment variables. Using default: " + DEFAULT_API_URL);
}

export default API_BASE_URL;
