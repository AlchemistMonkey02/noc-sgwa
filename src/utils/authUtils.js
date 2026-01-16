/**
 * Authentication Utility Functions
 */

/**
 * Get the current user's selected type
 * @returns {string|null} User type: 'rig_registration', 'water_abstractor', 'vendor_registration', or null
 */
export const getUserType = () => {
    return localStorage.getItem('userType');
};

/**
 * Get user type display name
 * @param {string} type - User type code
 * @returns {string} Display name
 */
export const getUserTypeDisplayName = (type) => {
    const typeNames = {
        'rig_registration': 'Rig Registration',
        'water_abstractor': 'Water Abstractor',
        'vendor_registration': 'Vendor Registration'
    };
    return typeNames[type] || 'User';
};

/**
 * Get user type icon
 * @param {string} type - User type code
 * @returns {string} Icon emoji
 */
export const getUserTypeIcon = (type) => {
    const typeIcons = {
        'rig_registration': '🏗️',
        'water_abstractor': '💧',
        'vendor_registration': '📊'
    };
    return typeIcons[type] || '👤';
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return localStorage.getItem('nocUser') !== null;
};

/**
 * Check if user has a specific type selected
 * @param {string} requiredType - Required user type
 * @returns {boolean}
 */
export const hasUserType = (requiredType) => {
    const userType = getUserType();
    if (!requiredType) {
        return userType !== null;
    }
    return userType === requiredType;
};

/**
 * Redirect to login page
 */
export const redirectToLogin = () => {
    window.location.href = '/noc/login';
};

/**
 * Redirect to role selection page
 */
export const redirectToRoleSelection = () => {
    window.location.href = '/role-selection';
};

/**
 * Get current user data
 * @returns {object|null}
 */
export const getCurrentUser = () => {
    const userData = localStorage.getItem('nocUser');
    return userData ? JSON.parse(userData) : null;
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
    localStorage.removeItem('nocUser');
    localStorage.removeItem('userType');
};
