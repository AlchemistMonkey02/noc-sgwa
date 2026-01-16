import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './role-selection.css';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { selectUserType } = useAuth();

    const roles = [
        {
            id: 'rig_registration',
            icon: '🏗️',
            title: 'Rig Registration',
            description: 'Register drilling rigs and apply for operation permits',
            for: 'Drilling agencies and rig operators',
            color: '#f59e0b'
        },
        {
            id: 'water_abstractor',
            icon: '💧',
            title: 'Water Abstractor',
            description: 'Apply for NOC to extract groundwater',
            for: 'Industries, hotels, and institutions',
            color: '#3b82f6'
        },
        {
            id: 'vendor_registration',
            icon: '📊',
            title: 'Vendor Registration',
            description: 'Register as water meter/flow meter vendor',
            for: 'Equipment suppliers and vendors',
            color: '#10b981'
        }
    ];

    const handleRoleSelect = (roleId) => {
        selectUserType(roleId);
        navigate('/noc/login');
    };

    return (
        <div className="role-selection-page">
            <div className="role-selection-header">
                <h1 className="header-title">Ground Water Department</h1>
                <h2 className="header-subtitle">Government of Rajasthan</h2>
            </div>

            <div className="role-selection-container">
                <div className="selection-intro">
                    <h2>Select Your Service Type</h2>
                    <p>Choose the service you want to access. You can change this later from your dashboard.</p>
                </div>

                <div className="roles-grid">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="role-card"
                            onClick={() => handleRoleSelect(role.id)}
                            style={{ '--role-color': role.color }}
                        >
                            <div className="role-icon">{role.icon}</div>
                            <h3 className="role-title">{role.title}</h3>
                            <p className="role-description">{role.description}</p>
                            <div className="role-for">
                                <span className="for-label">For:</span> {role.for}
                            </div>
                            <button className="role-select-btn">
                                Select & Continue →
                            </button>
                        </div>
                    ))}
                </div>

                <div className="back-link-container">
                    <button
                        onClick={() => navigate('/')}
                        className="back-link"
                    >
                        ← Back to Public Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
