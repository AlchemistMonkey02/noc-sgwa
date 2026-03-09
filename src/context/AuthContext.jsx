import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const initAuth = () => {
            try {
                const officerToken = localStorage.getItem('officerToken');
                const officerData = localStorage.getItem('officerData');
                const officerRole = localStorage.getItem('officerRole');

                if (officerToken && officerData) {
                    try {
                        setUser(JSON.parse(officerData));
                        setUserType(officerRole);
                    } catch (e) {
                        console.error("Failed to parse officer data", e);
                        clearAuthData('OFFICER');
                    }
                } else {
                    const nocToken = localStorage.getItem('authToken');
                    const nocData = localStorage.getItem('nocUser');
                    const savedUserType = localStorage.getItem('userType');

                    if (nocToken && nocData) {
                        try {
                            setUser(JSON.parse(nocData));
                            setUserType(savedUserType || 'APPLICANT');
                        } catch (e) {
                            console.error("Failed to parse NOC user data", e);
                            clearAuthData('NOC');
                        }
                    } else {
                        clearAuthData('ALL');
                        setUser(null);
                        setUserType(null);
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

    const clearAuthData = (type) => {
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
        const isOfficerLogin = role && role !== 'APPLICANT' && role !== 'CONSULTANT';

        try {
            const body = { username, password };

            if (!isOfficerLogin) {
                body.userType = role || 'APPLICANT';
                body.captcha = '5A7K9';
            }

            const response = await apiClient.post('/auth/login', body);

            const data = response.data || response;
            const userData = data.user || data;
            const token = data.token || data.accessToken;
            const refreshToken = data.refreshToken;

            if (!token) throw new Error("No token received from server");

            let effectiveRole = role || 'APPLICANT';
            if (isOfficerLogin) {
                const apiUserType = userData.userType || data.userType;
                if (apiUserType === 'APPLICANT') {
                    return { success: false, error: "Access Denied: Applicants cannot use Officer Portal." };
                }

                let mappedApiRole = apiUserType;
                if (apiUserType === 'RSGWA') mappedApiRole = 'SGWA';

                if (mappedApiRole !== role) {
                    return { success: false, error: `Access Denied: Account type '${apiUserType}' cannot login as '${role}'.` };
                }
                effectiveRole = mappedApiRole;
            }

            const finalUser = { ...userData, token, userType: effectiveRole };

            if (isOfficerLogin) {
                localStorage.setItem('officerToken', token);
                if (refreshToken) localStorage.setItem('officerRefreshToken', refreshToken);
                localStorage.setItem('officerData', JSON.stringify(finalUser));
                localStorage.setItem('officerRole', effectiveRole);
                clearAuthData('NOC');
            } else {
                localStorage.setItem('authToken', token);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('nocUser', JSON.stringify(finalUser));
                localStorage.setItem('userType', effectiveRole);
                clearAuthData('OFFICER');
            }

            setUser(finalUser);
            setUserType(effectiveRole);

            return { success: true };

        } catch (error) {
            return { success: false, error: error.message, code: error.code };
        }
    };

    const logout = async (performRedirect = null) => {
        setIsLoggingOut(true);
        let message = null;
        try {
            await apiClient.post('/auth/logout', {}).catch(err => console.warn("Logout API failed", err));
            message = 'logoutSuccess';
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
        setUserType(type);
        localStorage.setItem('userType', type);
    };

    const hasRole = (requiredRole) => {
        if (!user || !userType) return false;
        if (Array.isArray(requiredRole)) return requiredRole.includes(userType);
        return userType === requiredRole;
    };

    const isOfficer = () => {
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
