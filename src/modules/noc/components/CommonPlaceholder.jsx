import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NOCHeader from './NOCHeader';
import NOCFooter from './NOCFooter';
import Sidebar from './Sidebar';
import '../styles/noc-portal.css';

const CommonPlaceholder = ({ title, subtitle, breadcrumb, activeTab, onTabChange, tabs = [], children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Dashboard</Link>
                        {breadcrumb && (
                            <>
                                <span className="separator">›</span>
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
                    <div className="dashboard-card">
                        <div className="card-content-area" style={{ minHeight: '300px', padding: '3rem', textAlign: 'center' }}>
                            {children ? children : (
                                <div className="placeholder-content">
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🚧</div>
                                    <h2 style={{ color: '#64748b' }}>Under Construction</h2>
                                    <p style={{ color: '#94a3b8' }}>This module is currently being developed. Please check back later.</p>
                                    <div style={{ marginTop: '2rem' }}>
                                        <button
                                            className="bhuneer-secondary-btn"
                                            onClick={() => navigate('/noc/dashboard')}
                                        >
                                            Return to Dashboard
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <NOCFooter />
        </div>
    );
};

export default CommonPlaceholder;
