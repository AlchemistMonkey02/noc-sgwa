import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/officer-portal.css';

// Professional SVG Icons for Officer Portal
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    ),
    Applications: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    Inspections: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    ),
    Queries: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    ),
    Reports: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    Technical: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    ),
    Approved: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    Rejected: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
    ),
    Compliance: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>
    )
};

const OfficerSidebar = ({ role }) => {
    const { t } = useTranslation();
    const location = useLocation();

    const getNavItems = () => {
        const navItems = {
            DGO: [
                { path: '/officer/dgo/dashboard', label: t('officer.sidebar.dashboard'), icon: <Icons.Dashboard /> },
                { path: '/officer/dgo/applications', label: t('officer.sidebar.applications'), icon: <Icons.Applications /> },
                { path: '/officer/dgo/inspections', label: t('officer.sidebar.inspections'), icon: <Icons.Inspections /> },
                { path: '/officer/dgo/queries', label: t('officer.sidebar.queries'), icon: <Icons.Queries /> },
                { path: '/officer/dgo/reports', label: t('officer.sidebar.reports'), icon: <Icons.Reports /> }
            ],
            SGWA: [
                { path: '/officer/sgwa/dashboard', label: t('officer.sidebar.dashboard'), icon: <Icons.Dashboard /> },
                { path: '/officer/sgwa/applications', label: t('officer.sidebar.pendingReview'), icon: <Icons.Applications /> },
                { path: '/officer/sgwa/technical-review', label: t('officer.sidebar.technicalReview'), icon: <Icons.Technical /> }
            ],
            ENFORCEMENT: [
                { path: '/officer/enforcement/dashboard', label: t('officer.sidebar.dashboard'), icon: <Icons.Dashboard /> },
                { path: '/officer/enforcement/approval-queue', label: t('officer.sidebar.approvalQueue'), icon: <Icons.Check /> },
                { path: '/officer/enforcement/approved', label: t('officer.sidebar.approvedNocs'), icon: <Icons.Approved /> },
                { path: '/officer/enforcement/rejected', label: t('officer.sidebar.rejected'), icon: <Icons.Rejected /> },
                { path: '/officer/enforcement/compliance', label: t('officer.sidebar.compliance'), icon: <Icons.Compliance /> }
            ],
            INSPECTION: [
                { path: '/officer/inspection/dashboard', label: t('officer.sidebar.dashboard'), icon: <Icons.Dashboard /> },
                { path: '/officer/inspection/assignments', label: t('officer.sidebar.myAssignments'), icon: <Icons.Applications /> },
                { path: '/officer/inspection/history', label: t('officer.sidebar.history'), icon: <Icons.Reports /> }
            ]
        };

        return navItems[role] || [];
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <>
            <div 
                className="officer-sidebar-backdrop" 
                onClick={() => document.querySelector('.officer-sidebar').classList.remove('open')}
            />
            <aside className="officer-sidebar">
                <nav className="officer-nav">
                    <ul className="officer-nav-list" style={{ listStyle: 'none', padding: 0 }}>
                        {getNavItems().map((item) => (
                            <li key={item.path} className="officer-nav-item">
                                <Link
                                    to={item.path}
                                    className={`officer-nav-link ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => document.querySelector('.officer-sidebar').classList.remove('open')}
                                >
                                    <span className="officer-nav-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default OfficerSidebar;
