import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        // Check for existing session on mount
        const userData = localStorage.getItem('nocUser');
        const token = localStorage.getItem('authToken');
        const savedUserType = localStorage.getItem('userType');

        if (userData && token) {
            setUser(JSON.parse(userData));
        } else {
            // If checking fails (no token), clear partially existing data to force clean state
            localStorage.removeItem('nocUser');
            localStorage.removeItem('authToken');
            setUser(null);
        }

        if (savedUserType) {
            setUserType(savedUserType);
        }

        setIsLoggingOut(false);
        setLoading(false);
    }, []);

    const login = async (username, password, type) => {
        setIsLoggingOut(false);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    userType: type || userType || 'APPLICANT', // Use passed type, or state, or default
                    captcha: '5A7K9' // Hardcoded for dev/bypass as per user context
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const userData = data.data;

                // Capture token from body or header
                let token = userData.token || userData.accessToken || data.token || data.accessToken;
                if (!token) {
                    const authHeader = response.headers.get('Authorization');
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        token = authHeader.substring(7);
                    }
                }

                // Append token to userData if missing
                if (token && !userData.token) {
                    userData.token = token;
                }

                setUser(userData);

                // Persist to localStorage
                localStorage.setItem('nocUser', JSON.stringify(userData));
                if (token) {
                    localStorage.setItem('authToken', token);
                }

                // Robust Refresh Token Capture
                const refreshToken = userData.refreshToken || data.refreshToken || (data.data && data.data.refreshToken);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                } else {
                    console.warn("Login successful but no refresh token found in response.");
                }

                return { success: true };
            } else {
                const errorMessage = data.error?.message || data.message || "Invalid credentials. Please check your username and password.";
                console.error("Login failed:", errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "Network error. Please check your connection and try again." };
        }
    };

    const refreshSession = async () => {
        try {
            const currentToken = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!currentToken || !refreshToken) {
                console.warn("Cannot refresh session: Missing tokens");
                return false;
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { token: newToken, refreshToken: newRefreshToken } = data.data || {};

                if (newToken) {
                    localStorage.setItem('authToken', newToken);
                    // Update user state if necessary, or just token
                }
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }
                return true;
            } else {
                console.error("Token refresh failed:", data.message);
                // Optionally logout if refresh fails?
                return false;
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            return false;
        }
    };

    const logout = async (performRedirect = null) => {
        setIsLoggingOut(true);
        let message = null;
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    message = data.message || 'Logged out successfully';
                }
            }
        } catch (error) {
            console.error("Logout API call failed:", error);
        } finally {
            // Execute redirect callback if provided, BEFORE clearing state
            // This prevents race conditions with protected routes
            if (performRedirect && typeof performRedirect === 'function') {
                performRedirect(message);
            }

            // Delay state clearing to allow redirect to unmount protected components
            setTimeout(() => {
                setUser(null);
                setUserType(null);
                localStorage.removeItem('nocUser');
                localStorage.removeItem('userType');
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
            }, 100);
        }
        return message;
    };

    const selectUserType = (type) => {
        setUserType(type);
        localStorage.setItem('userType', type);
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const hasUserType = () => {
        return userType !== null;
    };

    const value = {
        user,
        userType,
        loading,
        isLoggingOut,
        login,
        logout,
        refreshSession,
        selectUserType,
        isAuthenticated,
        hasUserType
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
