import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import '../styles/sidebar.css';

// Professional SVG Icons
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    ),
    User: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    ),
    MessageSquare: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    ),
    Flag: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
    ),
    CreditCard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
    ),
    BarChart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
    ),
    Wrench: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
    ),
    HelpCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    ),
    LogOut: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    ),
    Bulb: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.41 1.09 3.38 2 5.25a2.42 2.42 0 0 1 .5 1.75V18h9v-2a2.42 2.42 0 0 1 .5-1.75c.91-1.87 2-2.84 2-5.25a7 7 0 0 0-7-7z"></path></svg>
    )
};

const Sidebar = ({ isOpen, onToggle, isCollapsed, onCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { t } = useTranslation();

    const [expandedSections, setExpandedSections] = useState({
        accountSettings: false,
        applications: false,
        eac: false,
        reports: false,
        utility: false,
        help: false
    });

    const isActive = (path) => location.pathname === path;

    const toggleCollapse = () => onCollapse && onCollapse();

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleLogout = () => {
        logout((message) => {
            navigate('/', { state: { flashMessage: message } });
        });
    };

    const navigationItems = [
        {
            path: '/noc/dashboard',
            icon: <Icons.Dashboard />,
            label: t('sidebar.dashboard'),
            single: true
        },
        {
            section: 'accountSettings',
            icon: <Icons.User />,
            label: t('sidebar.accountSettings'),
            submenu: [
                { path: '/noc/user-profile', label: t('sidebar.userProfile') },
                { path: '/noc/company-profile', label: t('sidebar.companyProfile') },
                { path: '/noc/company-documents', label: t('sidebar.companyDocs') },
                { path: '/noc/account-settings?tab=password', label: t('sidebar.changePass') },
                { path: '/noc/account-settings?tab=security', label: t('sidebar.securitySettings') }
            ]
        },
        {
            section: 'applications',
            icon: <Icons.FileText />,
            label: t('sidebar.applications'),
            submenu: [
                { path: '/noc/application', label: t('sidebar.applyFresh') },
                { path: '/noc/application?type=renewal', label: t('sidebar.applyRenewal') },
                { path: '/noc/track-status', label: t('sidebar.viewAllApps') }
            ]
        },
        {
            path: '/noc/track-status',
            icon: <Icons.Search />,
            label: t('sidebar.trackStatus'),
            single: true
        },
        {
            path: '/noc/queries',
            icon: <Icons.HelpCircle />,
            label: t('sidebar.queries'),
            single: true
        },
        {
            path: '/noc/issue-reporting',
            icon: <Icons.Flag />,
            label: t('sidebar.issueReporting'),
            single: true
        },
        {
            path: '/noc/payment-details',
            icon: <Icons.CreditCard />,
            label: t('sidebar.paymentDetails'),
            single: true
        },
        {
            path: '/noc/charge-revision',
            icon: <Icons.BarChart />,
            label: t('sidebar.chargeRevision'),
            single: true
        },
        {
            section: 'reports',
            icon: <Icons.FileText />,
            label: t('sidebar.reports'),
            submenu: [
                { path: '/noc/reports?type=applications', label: t('sidebar.appReports') },
                { path: '/noc/reports?type=compliance', label: t('sidebar.compReports') },
                { path: '/noc/reports?type=payments', label: t('sidebar.payReports') }
            ]
        },
        {
            section: 'utility',
            icon: <Icons.Wrench />,
            label: t('sidebar.utility'),
            submenu: [
                { path: '/noc/check-eligibility', label: t('sidebar.eligibility') },
                { path: '/noc/utilities?tool=district-finder', label: t('sidebar.distFinder') },
                { path: '/noc/utilities?tool=assessment-unit', label: t('sidebar.assessmentUnit') }
            ]
        },
        {
            section: 'help',
            icon: <Icons.MessageSquare />,
            label: t('sidebar.help'),
            submenu: [
                { path: '/noc/help?tab=manual', label: t('sidebar.userManual') },
                { path: '/noc/help?tab=faq', label: t('sidebar.faq') },
                { path: '/noc/help?tab=videos', label: t('sidebar.videos') },
                { path: '/noc/help?tab=contact', label: t('sidebar.contactSupport') }
            ]
        }
    ];

    return (
        <>
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

            <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/noc/dashboard" className="sidebar-logo">
                        <img src="/logos/logo-black.png" alt="RGWCMA Logo" className="sidebar-logo-icon" />
                        <div className="sidebar-logo-text">
                            <span className="sidebar-brand-name">RGWCMA</span>
                            <span className="sidebar-brand-subtitle">Groundwater Authority of Rajasthan</span>
                        </div>
                    </Link>
                    <button
                        className="sidebar-toggle sidebar-toggle-desktop"
                        onClick={toggleCollapse}
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? <Icons.ChevronRight /> : '«'}
                    </button>
                    <button
                        className="sidebar-close-mobile"
                        onClick={onToggle}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navigationItems.map((item, index) => {
                        if (item.single) {
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => window.innerWidth < 1024 && onToggle()}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            );
                        } else {
                            return (
                                <div key={index} className={`nav-section ${expandedSections[item.section] ? 'expanded' : ''}`}>
                                    <button
                                        className="nav-link"
                                        onClick={() => toggleSection(item.section)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                        <span className="nav-chevron"><Icons.ChevronRight /></span>
                                    </button>
                                    <div className={`submenu ${expandedSections[item.section] ? 'expanded' : ''}`}>
                                        {item.submenu.map((subitem, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={subitem.path}
                                                className={`submenu-link ${isActive(subitem.path) ? 'active' : ''}`}
                                                onClick={() => window.innerWidth < 1024 && onToggle()}
                                            >
                                                <span className="nav-label">{subitem.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </nav>

                <button className="sidebar-logout notranslate" onClick={handleLogout}>
                    <Icons.LogOut />
                    <span>{t('sidebar.logout')}</span>
                </button>

                {!isCollapsed && (
                    <div className="sidebar-help-card">
                        <div className="help-icon"><Icons.Bulb /></div>
                        <div className="help-title">{t('sidebar.needHelp')}</div>
                        <div className="help-subtitle">{t('sidebar.supportSubtitle')}</div>
                        <Link to="/noc/help?tab=contact" className="help-button">
                            {t('sidebar.getSupport')}
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
