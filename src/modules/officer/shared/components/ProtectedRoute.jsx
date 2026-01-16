import React from 'react';
import { Navigate } from 'react-router-dom';
import { isOfficerAuthenticated, getOfficerRole } from '../utils/officerAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
    const isAuthenticated = isOfficerAuthenticated();
    const currentRole = getOfficerRole();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/officer/login" replace />;
    }

    // Authenticated but wrong role
    if (requiredRole && currentRole !== requiredRole) {
        // Redirect to correct dashboard based on current role
        const dashboardRoutes = {
            'DGO': '/officer/dgo/dashboard',
            'SGWA': '/officer/sgwa/dashboard',
            'ENFORCEMENT': '/officer/enforcement/dashboard'
        };
        return <Navigate to={dashboardRoutes[currentRole] || '/officer/login'} replace />;
    }

    // Authenticated and correct role
    return children;
};

export default ProtectedRoute;
