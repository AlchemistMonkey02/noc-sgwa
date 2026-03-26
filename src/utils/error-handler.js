/**
 * Frontend Error Handling Utility
 * Extracts clean error messages and codes from various error formats (Axios, Fetch, Generic)
 */

export const getErrorMessage = (error) => {
    if (!error) return "Something went wrong";

    // 1. Check for constructed "mock axios" format from our apiClient
    if (error.response?.data?.error?.message) {
        return error.response.data.error.message;
    }

    // 2. Check for standard backend error format
    if (error.error?.message) {
        return error.error.message;
    }

    // 3. Check for direct message property
    if (error.message) {
        return error.message;
    }

    // 4. Check for response.data.message (common in many APIs)
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Default error message
    return "Something went wrong. Please try again later.";
};

export const getErrorCode = (error) => {
    if (!error) return "UNKNOWN_ERROR";

    // 1. Check for constructed "mock axios" format
    if (error.response?.data?.error?.code) {
        return error.response.data.error.code;
    }

    // 2. Check for standard backend error format
    if (error.error?.code) {
        return error.error.code;
    }

    // 3. Check for specific code property
    if (error.code) {
        return error.code;
    }

    return "UNKNOWN_ERROR";
};

export const handleApiError = (error, fallbackMessage = "Something went wrong") => {
    const code = getErrorCode(error);
    const message = getErrorMessage(error);

    // Only log if it's not a known user-cancellable error or similar (optional)
    console.error(`[API Error] ${code}: ${message}`, error);

    return {
        code,
        message: message || fallbackMessage,
        originalError: error,
        success: false
    };
};

