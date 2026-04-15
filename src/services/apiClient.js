import API_BASE_URL from '../config/apiConfig';
import { handleApiError } from '../utils/error-handler';

/**
 * Standardized API Client using fetch
 */
class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    /**
     * Get headers with combined auth and content-type
     */
    getHeaders(options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Determine which token to use based on the context (Officer vs Applicant)
        const officerToken = localStorage.getItem('officerToken');
        const authToken = localStorage.getItem('authToken');

        // Priority logic:
        // 1. If explicit useOfficerToken is true, use officerToken
        // 2. If the path contains '/officer/', prioritize officerToken
        // 3. Fallback to authToken, then officerToken
        let token = null;

        if (options.useOfficerToken) {
            token = officerToken;
        } else if (options.url && options.url.includes('/officer/')) {
            token = officerToken || authToken;
        } else {
            token = authToken || officerToken;
        }

        if (token && token !== 'undefined' && token !== 'null') {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Core request method
     */
    async request(path, options = {}) {
        const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
        const headers = this.getHeaders({ ...options, url });

        // Remove Content-Type if it's a FormData request
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const config = {
            ...options,
            headers,
            credentials: 'include' // Allow cookies to be sent for SSO
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 specifically for potential session expiry alerts
            if (response.status === 401 && !options.silent) {
                // Clear state if unauthorized (optional based on app requirements)
                console.warn("[ApiClient] 401 Unauthorized - Session may have expired");
            }

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else if (options.method === 'DELETE' || response.status === 204) {
                data = { success: true };
            } else {
                // Handle non-JSON or blob responses if explicitly requested
                if (options.asBlob) return response; 
                data = { success: response.ok, message: response.statusText };
            }

            if (!response.ok) {
                // Throwing let's the catch block handle formatting via handleApiError
                throw { response: { data, status: response.status }, message: data?.error?.message || data?.message || response.statusText };
            }

            return data;
        } catch (error) {
            // If it's already a formatted error from our throw above, re-throw after passing through handleApiError
            if (error.response) {
                throw handleApiError(error, undefined, { silent: options.silent });
            }
            
            // For network errors or unexpected JS errors
            throw handleApiError(error, "Connection to server failed. Please check your internet.", { silent: options.silent });
        }
    }

    // Convenience methods
    async get(path, options = {}) {
        return this.request(path, { ...options, method: 'GET' });
    }

    async post(path, body, options = {}) {
        return this.request(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined });
    }

    async put(path, body, options = {}) {
        return this.request(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined });
    }

    async delete(path, options = {}) {
        return this.request(path, { ...options, method: 'DELETE' });
    }

    async upload(path, formData, options = {}) {
        return this.request(path, { ...options, method: 'POST', body: formData });
    }
}

export const apiClient = new ApiClient();
export default apiClient;

