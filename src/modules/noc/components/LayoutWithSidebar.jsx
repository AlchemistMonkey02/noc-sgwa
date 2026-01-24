import React, { useState, useEffect } from 'react';
import NOCHeader from './NOCHeader';
import NOCFooter from './NOCFooter';
import Sidebar from './Sidebar';
import '../styles/noc-portal.css';

/**
 * Layout wrapper component with sidebar for authenticated NOC portal pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.showSidebar - Whether to show sidebar (default: true)
 */
const LayoutWithSidebar = ({ children, showSidebar = true }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
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
                <>
                    <Sidebar
                        isOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen(!sidebarOpen)}
                        isCollapsed={isCollapsed}
                        onCollapse={() => setIsCollapsed(!isCollapsed)}
                    />

                    {/* Sidebar Toggle Button (Mobile) */}
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>
                </>
            )}

            <NOCHeader />

            <div
                className="main-content"
                style={{
                    marginLeft: showSidebar && isDesktop ? (isCollapsed ? '80px' : '280px') : '0',
                    transition: 'margin-left 0.3s',
                    minHeight: 'calc(100vh - 200px)',
                    marginTop: '160px' // Adjust for fixed header height
                }}
            >
                {children}
            </div>

            <NOCFooter />
        </div>
    );
};

export default LayoutWithSidebar;
