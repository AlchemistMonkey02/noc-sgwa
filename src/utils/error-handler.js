/**
 * Frontend Error Handling Utility
 * Extracts clean error messages and codes from Axios responses
 */

export const getErrorMessage = (error) => {
    // Check if the error is from the standardized backend format
    if (error.response?.data?.error) {
        return error.response.data.error.message;
    }

    // Check for standard Axios error response
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Default error message
    return error.message || "Something went wrong. Please try again later.";
};

export const getErrorCode = (error) => {
    // Check if the error is from the standardized backend format
    if (error.response?.data?.error?.code) {
        return error.response.data.error.code;
    }

    return "UNKNOWN_ERROR";
};

export const handleApiError = (error, fallbackMessage = "Something went wrong") => {
    const code = getErrorCode(error);
    const message = getErrorMessage(error);

    console.error(`[API Error] ${code}: ${message}`, error);

    return {
        code,
        message: message || fallbackMessage,
        originalError: error
    };
};
