import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireUserType = true }) => {
    const { isAuthenticated, hasUserType } = useAuth();

    if (!isAuthenticated()) {
        // Not logged in, redirect to role selection
        return <Navigate to="/role-selection" replace />;
    }

    if (requireUserType && !hasUserType()) {
        // Logged in but no user type selected
        return <Navigate to="/role-selection" replace />;
    }

    return children;
};

export default ProtectedRoute;
