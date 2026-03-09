import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Header from '../header/Header';
import PublicHeader from '../modules/public/components/PublicHeader';
import NOCRegister from '../modules/noc/NOCRegister';

const Layout = ({ children }) => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Check for registration modal trigger
    const isRegisterModalOpen = searchParams.get('register') === 'true';

    const handleCloseModal = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('register');
        setSearchParams(newParams);
    };

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

            {/* Global Registration Modal Overlay */}
            {isRegisterModalOpen && (
                <div className="reg-modal-overlay" onClick={handleCloseModal}>
                    <div className="reg-modal-container" onClick={e => e.stopPropagation()}>
                        <NOCRegister isModal={true} onClose={handleCloseModal} />
                    </div>
                </div>
            )}
        </>
    );
};

export default Layout;
