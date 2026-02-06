import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../header/Header';
import PublicHeader from '../modules/public/components/PublicHeader';

const Layout = ({ children }) => {
    const location = useLocation();

    // Define routes that should use PublicHeader
    const publicRoutes = [
        '/',
        '/public',
        '/forgot-password',
        '/reset-password',
        '/noc/login',
        '/noc/register',
        '/noc/track-status'
    ];

    // Check if current route should use PublicHeader
    const usePublicHeader = publicRoutes.some(route =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    return (
        <>
            {usePublicHeader ? <PublicHeader /> : <Header />}
            {children}
        </>
    );
};

export default Layout;
