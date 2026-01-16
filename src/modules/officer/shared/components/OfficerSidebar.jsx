import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/officer-portal.css';

const OfficerSidebar = ({ role }) => {
    const location = useLocation();

    const getNavItems = () => {
        const navItems = {
            DGO: [
                { path: '/officer/dgo/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/officer/dgo/applications', label: 'Applications', icon: '📋' },
                { path: '/officer/dgo/inspections', label: 'Site Inspections', icon: '🔍' },
                { path: '/officer/dgo/queries', label: 'Queries', icon: '💬' },
                { path: '/officer/dgo/reports', label: 'Reports', icon: '📄' }
            ],
            SGWA: [
                { path: '/officer/sgwa/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/officer/sgwa/applications', label: 'Pending Review', icon: '📋' },
                { path: '/officer/sgwa/technical-review', label: 'Technical Review', icon: '🔬' }
            ],
            ENFORCEMENT: [
                { path: '/officer/enforcement/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/officer/enforcement/approval-queue', label: 'Approval Queue', icon: '✅' },
                { path: '/officer/enforcement/approved', label: 'Approved NOCs', icon: '📜' },
                { path: '/officer/enforcement/rejected', label: 'Rejected', icon: '❌' },
                { path: '/officer/enforcement/compliance', label: 'Compliance', icon: '📋' }
            ],
            INSPECTION: [
                { path: '/officer/inspection/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/officer/inspection/assignments', label: 'My Assignments', icon: '📝' },
                { path: '/officer/inspection/history', label: 'History', icon: '📜' }
            ]
        };

        return navItems[role] || [];
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <aside className="officer-sidebar">
            <nav className="officer-nav">
                <ul className="officer-nav">
                    {getNavItems().map((item) => (
                        <li key={item.path} className="officer-nav-item">
                            <Link
                                to={item.path}
                                className={`officer-nav-link ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <span className="officer-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default OfficerSidebar;
