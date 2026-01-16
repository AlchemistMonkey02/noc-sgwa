import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/officer-portal.css';

const OfficerHeader = ({ officerName, officerRole, officerDesignation, district }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication
        localStorage.removeItem('officerToken');
        localStorage.removeItem('officerRole');
        navigate('/officer/login');
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getRoleDisplay = (role) => {
        const roles = {
            'DGO': 'District Groundwater Officer',
            'SGWA': 'State Groundwater Authority',
            'ENFORCEMENT': 'Enforcement Wing',
            'INSPECTION': 'Inspection Officer'
        };
        return roles[role] || role;
    };

    return (
        <header className="officer-header">
            <div className="officer-header-left">
                <img
                    src="/sgwa-logo.png"
                    alt="SGWA Logo"
                    className="officer-logo"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
                <div>
                    <h1 className="officer-header-title">
                        {getRoleDisplay(officerRole)} Portal
                    </h1>
                    <p className="officer-header-subtitle">
                        State Groundwater Authority, Rajasthan
                    </p>
                </div>
            </div>

            <div className="officer-header-right">
                <div className="officer-profile">
                    <div className="officer-avatar">
                        {getInitials(officerName)}
                    </div>
                    <div className="officer-info">
                        <h4>{officerName}</h4>
                        <p>{officerDesignation}{district ? ` - ${district}` : ''}</p>
                    </div>
                </div>

                <button
                    className="officer-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default OfficerHeader;
