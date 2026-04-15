import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close all menus on route change
    useEffect(() => {
        setIsSidebarOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeAll = () => {
        setIsSidebarOpen(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <UIContext.Provider
            value={{
                isSidebarOpen,
                setIsSidebarOpen,
                toggleSidebar,
                isMobileMenuOpen,
                setIsMobileMenuOpen,
                toggleMobileMenu,
                closeAll
            }}
        >
            {children}
        </UIContext.Provider>
    );
};
