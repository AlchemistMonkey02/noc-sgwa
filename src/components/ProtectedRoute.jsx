import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Global ProtectedRoute component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string} props.requiredRole - Specific role required (e.g., 'DGO', 'SGWA')
 * @param {string} props.portalType - 'noc' or 'officer' (determines redirect target)
 */
const ProtectedRoute = ({ children, requiredRole, portalType = 'noc' }) => {
    const { isAuthenticated, userType, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: 'var(--bg-light, #f8fafc)'
            }}>
                <div className="loader">Loading...</div>
            </div>
        );
    }

    // Role mapping for redirects
    const officerDashboards = {
        'DGO': '/officer/dgo/dashboard',
        'SGWA': '/officer/sgwa/dashboard',
        'ENFORCEMENT': '/officer/enforcement/dashboard',
        'INSPECTION': '/officer/inspection/dashboard'
    };

    // 1. Not authenticated
    if (!isAuthenticated) {
        const loginPath = portalType === 'officer' ? '/officer/login' : '/';
        // Save the attempted path to redirect back after login (optional enhancement)
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // 2. Authenticated but trying to access the wrong portal
    const isOfficerRole = Object.keys(officerDashboards).includes(userType);
    
    if (portalType === 'officer' && !isOfficerRole) {
        // Applicant trying to access Officer portal
        return <Navigate to="/noc/dashboard" replace />;
    }

    if (portalType === 'noc' && isOfficerRole) {
        // Officer trying to access Applicant portal
        return <Navigate to={officerDashboards[userType] || '/officer/login'} replace />;
    }

    // 3. Authenticated but wrong specific role within Officer portal
    if (requiredRole && userType !== requiredRole) {
        if (isOfficerRole) {
            return <Navigate to={officerDashboards[userType]} replace />;
        }
        return <Navigate to="/noc/dashboard" replace />;
    }

    // Authorized
    return children;
};

export default ProtectedRoute;
