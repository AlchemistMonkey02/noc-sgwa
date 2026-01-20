const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not defined in environment variables. Using default: http://localhost:5000/api");
}

export default API_BASE_URL;
