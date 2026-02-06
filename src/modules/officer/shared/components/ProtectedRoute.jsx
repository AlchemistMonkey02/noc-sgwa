import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, userType, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/officer/login" replace />;
    }

    // Authenticated but wrong role
    if (requiredRole && userType !== requiredRole) {
        // Redirect to correct dashboard based on current role
        const dashboardRoutes = {
            'DGO': '/officer/dgo/dashboard',
            'SGWA': '/officer/sgwa/dashboard',
            'ENFORCEMENT': '/officer/enforcement/dashboard',
            'INSPECTION': '/officer/inspection/dashboard'
        };
        return <Navigate to={dashboardRoutes[userType] || '/officer/login'} replace />;
    }

    // Authenticated and correct role
    return children;
};

export default ProtectedRoute;
