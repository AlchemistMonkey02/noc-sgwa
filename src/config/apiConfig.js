// Local Development Configuration
export const API_BASE_URL = 'http://localhost:3000/api';
export const AI_SERVICE_URL = 'http://localhost:5005'; // Assuming AI service runs here, or mock

if (!import.meta.env.VITE_API_URL) {
    console.log("Using Local API URL: " + API_BASE_URL);
}

export default API_BASE_URL;
