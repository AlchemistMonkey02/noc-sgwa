import React, { useState, useEffect } from 'react';
import NOCFooter from './NOCFooter';
import Sidebar from './Sidebar';
import '../styles/noc-portal.css';
import { useUI } from '../../../context/UIContext';

const LayoutWithSidebar = ({ children, showSidebar = true, defaultCollapsed = false }) => {
    const { isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useUI();
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
            if (window.innerWidth < 1024) {
                setIsCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="noc-portal">
            {showSidebar && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                    isCollapsed={isCollapsed}
                    onCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            )}

            {showSidebar && !isDesktop && isSidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div
                className={`main-content ${showSidebar ? 'with-sidebar' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            >
                {children}
            </div>

            <NOCFooter />
        </div>
    );
};

export default LayoutWithSidebar;
