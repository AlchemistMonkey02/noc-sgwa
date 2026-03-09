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

        // Priority: If the URL includes 'officer', use officerToken. 
        // Otherwise use authToken if available.
        const token = options.useOfficerToken || (options.url && options.url.includes('/officer/'))
            ? officerToken
            : (authToken || officerToken);

        if (token) {
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
            headers
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 specifically for potential session expiry alerts
            if (response.status === 401) {
                // Potential auto-refresh logic could go here
                // For now, we'll let the error bubble up to be handled by context/hooks
            }

            const data = await response.json();

            if (!response.ok) {
                // Wrap in handleApiError for consistency
                const error = handleApiError({ response: { data, status: response.status } });
                throw error;
            }

            return data;
        } catch (error) {
            if (error.code) throw error; // Already standardized
            throw handleApiError(error);
        }
    }

    // Convenience methods
    async get(path, options = {}) {
        return this.request(path, { ...options, method: 'GET' });
    }

    async post(path, body, options = {}) {
        return this.request(path, { ...options, method: 'POST', body: JSON.stringify(body) });
    }

    async put(path, body, options = {}) {
        return this.request(path, { ...options, method: 'PUT', body: JSON.stringify(body) });
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
