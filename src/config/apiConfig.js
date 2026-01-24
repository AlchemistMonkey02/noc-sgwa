const API_BASE_URL = "https://rgwcma-noc-api.geoplanetsolution.in/api"

if (!API_BASE_URL) {
    console.error("VITE_API_URL is not defined in environment variables. API calls will fail.");
}

export default API_BASE_URL;
