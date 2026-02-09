import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onToggle, isCollapsed, onCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    // Internal state removed, using props
    const [expandedSections, setExpandedSections] = useState({
        accountSettings: false,
        applications: false,
        eac: false,
        reports: false,
        utility: false,
        help: false
    });

    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleCollapse = () => {
        if (onCollapse) onCollapse();
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleLogout = () => {
        logout((message) => {
            navigate('/', { state: { flashMessage: message } });
        });
    };

    const navigationItems = [
        {
            path: '/noc/dashboard',
            icon: '🏠',
            label: 'Dashboard',
            single: true
        },
        {
            section: 'accountSettings',
            icon: '👤',
            label: 'Account Settings',
            submenu: [
                { path: '/noc/user-profile', icon: '👤', label: 'User Profile' },
                { path: '/noc/company-profile', icon: '🏢', label: 'Company Profile' },
                { path: '/noc/company-documents', icon: '📄', label: 'Company Documents' },
                { path: '/noc/account-settings?tab=password', icon: '🔑', label: 'Change Password' },
                { path: '/noc/account-settings?tab=security', icon: '🔒', label: 'Security Settings' }
            ]
        },
        {
            section: 'applications',
            icon: '📄',
            label: 'Applications',
            submenu: [
                { path: '/noc/application', icon: '📝', label: 'Apply For Fresh Application' },
                { path: '/noc/application?type=renewal', icon: '🔄', label: 'Apply For Renewal Application' },
                { path: '/noc/track-status', icon: '🔍', label: 'View All Applications' }
            ]
        },
        {
            path: '/noc/track-status',
            icon: '🔍',
            label: 'Track Application Status',
            single: true
        },
        /*
        {
            path: '/noc/self-compliance',
            icon: '✅',
            label: 'Self Compliance',
            single: true
        },
        */
        {
            path: '/noc/queries',
            icon: '❓',
            label: 'Evaluation Officer Raised Query',
            single: true
        },

        {
            path: '/noc/issue-reporting',
            icon: '🚩',
            label: 'Issue Reporting',
            single: true
        },
        {
            path: '/noc/payment-details',
            icon: '💳',
            label: 'Payment Details',
            single: true
        },
        {
            path: '/noc/charge-revision',
            icon: '💰',
            label: 'Charge Revision Report',
            single: true
        },
        {
            section: 'reports',
            icon: '📊',
            label: 'Reports',
            submenu: [
                { path: '/noc/reports?type=applications', icon: '📝', label: 'Application Reports' },
                { path: '/noc/reports?type=compliance', icon: '✅', label: 'Compliance Reports' },
                { path: '/noc/reports?type=payments', icon: '💳', label: 'Payment Reports' }
            ]
        },
        {
            section: 'utility',
            icon: '🛠️',
            label: 'Utility',
            submenu: [
                { path: '/noc/check-eligibility', icon: '✅', label: 'Eligibility Checker' },
                { path: '/noc/utilities?tool=district-finder', icon: '📍', label: 'District Finder' },
                { path: '/noc/utilities?tool=assessment-unit', icon: '📏', label: 'Assessment Unit Lookup' }
            ]
        },
        {
            section: 'help',
            icon: '❓',
            label: 'Help',
            submenu: [
                { path: '/noc/help?tab=manual', icon: '📖', label: 'User Manual' },
                { path: '/noc/help?tab=faq', icon: '❔', label: 'FAQ' },
                { path: '/noc/help?tab=videos', icon: '🎥', label: 'Video Tutorials' },
                { path: '/noc/help?tab=contact', icon: '📞', label: 'Contact Support' }
            ]
        }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onToggle}
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 998
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <Link to="/noc/dashboard" className="sidebar-logo">
                        <img src="/logos/logo-black.png" alt="RGWCMA Logo" className="sidebar-logo-icon" />
                        <div className="sidebar-logo-text">
                            <span className="sidebar-brand-name">RGWCMA</span>
                            <span className="sidebar-brand-subtitle">Rajasthan Groundwater (Conservation and Management) Authority</span>
                        </div>
                    </Link>
                    <button
                        className="sidebar-toggle sidebar-toggle-desktop"
                        onClick={toggleCollapse}
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? '»' : '«'}
                    </button>
                    <button
                        className="sidebar-close-mobile"
                        onClick={onToggle}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="sidebar-nav">
                    {navigationItems.map((item, index) => {
                        if (item.single) {
                            // Single menu item
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            onToggle();
                                        }
                                    }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            );
                        } else {
                            // Menu with submenu
                            return (
                                <div key={index} className={`nav-section ${expandedSections[item.section] ? 'expanded' : ''}`}>
                                    <button
                                        className="nav-link"
                                        onClick={() => toggleSection(item.section)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                        <span className="nav-chevron">›</span>
                                    </button>
                                    <div className={`submenu ${expandedSections[item.section] ? 'expanded' : ''}`}>
                                        {item.submenu.map((subitem, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={subitem.path}
                                                className={`submenu-link ${isActive(subitem.path) ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (window.innerWidth < 1024) {
                                                        onToggle();
                                                    }
                                                }}
                                            >
                                                <span className="nav-icon">{subitem.icon}</span>
                                                <span className="nav-label">{subitem.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </nav>

                {/* Logout Button */}
                <button className="sidebar-logout" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Log Out</span>
                </button>

                {/* Help Card */}
                {!isCollapsed && (
                    <div className="sidebar-help-card">
                        <div className="help-icon">💡</div>
                        <div className="help-title">Need Help?</div>
                        <div className="help-subtitle">Contact support team</div>
                        <Link to="/noc/help?tab=contact" className="help-button">
                            Get Support →
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
