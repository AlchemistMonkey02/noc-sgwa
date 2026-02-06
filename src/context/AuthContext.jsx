import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null); // 'APPLICANT' or Officer Role (DGO, SGWA, etc.)
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Helpers to manage storage - separating keys avoids collisions
    const getStorageKeys = (userIdentityType) => {
        if (userIdentityType === 'OFFICER') {
            return {
                token: 'officerToken',
                refresh: 'officerRefreshToken',
                data: 'officerData',
                role: 'officerRole'
            };
        }
        return {
            token: 'authToken',
            refresh: 'refreshToken',
            data: 'nocUser',
            role: 'userType'
        };
    };

    useEffect(() => {
        const initAuth = () => {
            try {
                // 1. Check for Officer Session first (Priority?) or check both
                // The app should technically only have one user logged in at a time ideally.
                const officerToken = localStorage.getItem('officerToken');
                const officerData = localStorage.getItem('officerData');
                const officerRole = localStorage.getItem('officerRole');

                if (officerToken && officerData) {
                    try {
                        setUser(JSON.parse(officerData));
                        setUserType(officerRole);
                        console.log("Restored Officer Session:", officerRole);
                    } catch (e) {
                        console.error("Failed to parse officer data", e);
                        clearAuthData('OFFICER');
                    }
                } else {
                    // 2. Check for NOC User Session
                    const nocToken = localStorage.getItem('authToken');
                    const nocData = localStorage.getItem('nocUser');
                    const savedUserType = localStorage.getItem('userType');

                    if (nocToken && nocData) {
                        try {
                            setUser(JSON.parse(nocData));
                            setUserType(savedUserType || 'APPLICANT');
                            console.log("Restored NOC Session");
                        } catch (e) {
                            console.error("Failed to parse NOC user data", e);
                            clearAuthData('NOC');
                        }
                    } else {
                        // Cleanup
                        clearAuthData('OFFICER');
                        clearAuthData('NOC');
                        setUser(null);
                        setUserType(null); // Ensure type is also null
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setIsLoggingOut(false);
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const clearAuthData = (type) => { // 'OFFICER' or 'NOC' or 'ALL'
        if (type === 'OFFICER' || type === 'ALL') {
            localStorage.removeItem('officerToken');
            localStorage.removeItem('officerRefreshToken');
            localStorage.removeItem('officerRole');
            localStorage.removeItem('officerData');
        }
        if (type === 'NOC' || type === 'ALL') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('nocUser');
            localStorage.removeItem('userType');
        }
    };

    const login = async (username, password, role) => {
        setIsLoggingOut(false);
        const isOfficerLogin = role && role !== 'APPLICANT' && role !== 'CONSULTANT'; // Basic check, refine as needed

        try {
            const body = {
                username,
                password,
            };

            // Officer login API might be same endpoint but expects different payload sometimes?
            // NOCLogin sends userType: type, captcha
            // OfficerLogin sends just username, password

            if (!isOfficerLogin) {
                body.userType = role || 'APPLICANT';
                body.captcha = '5A7K9'; // Hardcoded bypass
            }

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok && (data.success || data.token || data.data?.token)) { // Normalize success check
                const responseData = data.data || data; // Handle different API response structures
                const userData = responseData.user || responseData;

                // Token extraction
                let token = responseData.token || responseData.accessToken || data.token;
                if (!token) {
                    const authHeader = response.headers.get('Authorization');
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        token = authHeader.substring(7);
                    }
                }

                if (!token) throw new Error("No token received");

                const refreshToken = responseData.refreshToken || data.refreshToken;

                // Determine effective role
                // For Officers: role passed in is the one they selected. API returns userType.
                // For NOC: passed role or APPLICANT.

                let effectiveRole = role || 'APPLICANT';
                if (isOfficerLogin) {
                    // Verify if the userType from API matches the requested role if valid
                    const apiUserType = userData.userType || responseData.userType;
                    // Logic from OfficerLogin.jsx:
                    if (apiUserType === 'APPLICANT') {
                        return { success: false, error: "Access Denied: Applicants cannot use Officer Portal." };
                    }
                    // Map RSGWA -> SGWA
                    let mappedApiRole = apiUserType;
                    if (apiUserType === 'RSGWA') mappedApiRole = 'SGWA';

                    if (mappedApiRole !== role) {
                        return { success: false, error: `Access Denied: Account type '${apiUserType}' cannot login as '${role}'.` };
                    }
                    effectiveRole = mappedApiRole;
                } else {
                    // For NOC, we might want to store what they logged in as
                    effectiveRole = body.userType;
                }

                // Append token to user object if convenient
                const finalUser = { ...userData, token };

                // Persist Data & Update State
                if (isOfficerLogin) {
                    // Update State
                    setUser(finalUser);
                    setUserType(effectiveRole);

                    // Persist
                    localStorage.setItem('officerToken', token);
                    if (refreshToken) localStorage.setItem('officerRefreshToken', refreshToken);
                    localStorage.setItem('officerData', JSON.stringify(finalUser));
                    localStorage.setItem('officerRole', effectiveRole);

                    // Clear potential NOC garbage?
                    clearAuthData('NOC');

                } else {
                    // Update State
                    setUser(finalUser);
                    setUserType(effectiveRole);

                    // Persist
                    localStorage.setItem('authToken', token);
                    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('nocUser', JSON.stringify(finalUser));
                    localStorage.setItem('userType', effectiveRole);

                    // Clear potential Officer garbage
                    clearAuthData('OFFICER');
                }

                return { success: true };

            } else {
                const errorMessage = data.message || data.error?.message || "Invalid credentials.";
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "Network error. Please try again." };
        }
    };

    const logout = async (performRedirect = null) => {
        setIsLoggingOut(true);
        let message = null;
        try {
            // Try to call logout API with whatever token we have
            const token = localStorage.getItem('authToken') || localStorage.getItem('officerToken');
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(err => console.warn("Logout API check failed", err)); // Swallow error on logout for UX
                message = 'Logged out successfully';
            }
        } finally {
            clearAuthData('ALL');
            setUser(null);
            setUserType(null);
            if (performRedirect && typeof performRedirect === 'function') {
                performRedirect(message);
            }
        }
        return message;
    };

    const selectUserType = (type) => {
        // Only really used for NOC pre-login selection
        setUserType(type);
        localStorage.setItem('userType', type);
    };

    // Helper to check precise officer role
    const hasRole = (requiredRole) => {
        if (!user || !userType) return false;
        if (Array.isArray(requiredRole)) return requiredRole.includes(userType);
        return userType === requiredRole;
    };

    const isOfficer = () => {
        // Basic check: if userType is NOT one of the standard applicant types or is one of the officer types
        const officerRoles = ['DGO', 'SGWA', 'ENFORCEMENT', 'INSPECTION'];
        return officerRoles.includes(userType);
    };

    const value = {
        user,
        userType,
        loading,
        isLoggingOut,
        login,
        logout,
        selectUserType,
        isAuthenticated: !!user,
        hasRole,
        isOfficer
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
