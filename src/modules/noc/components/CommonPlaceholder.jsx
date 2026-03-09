import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LayoutWithSidebar from './LayoutWithSidebar';

const CommonPlaceholder = ({ title, subtitle, breadcrumb, activeTab, onTabChange, tabs = [], children }) => {
    const navigate = useNavigate();

    return (
        <LayoutWithSidebar defaultCollapsed={true} showSidebar={true}>
            <div className="content-container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/noc/dashboard">Dashboard</Link>
                    {breadcrumb && (
                        <>
                            <span className="separator">â€º</span>
                            <span className="current">{breadcrumb}</span>
                        </>
                    )}
                </div>

                {/* Page Title */}
                <div className="page-title-section">
                    <h1 className="page-main-title">{title}</h1>
                    <p className="page-subtitle">{subtitle || 'Manage your application details here'}</p>
                </div>

                {/* Tabs (Optional) */}
                {tabs.length > 0 && (
                    <div className="dashboard-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => onTabChange && onTabChange(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                {children ? children : (
                    <div className="dashboard-card">
                        <div className="card-content-area" style={{ minHeight: '300px', padding: '3rem', textAlign: 'center' }}>
                            <div className="placeholder-content">
                                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>ðŸš§</div>
                                <h2 style={{ color: '#64748b' }}>Under Construction</h2>
                                <p style={{ color: '#94a3b8' }}>This module is currently being developed. Please check back later.</p>
                                <div style={{ marginTop: '2rem' }}>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => navigate('/noc/dashboard')}
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LayoutWithSidebar>
    );
};

export default CommonPlaceholder;

