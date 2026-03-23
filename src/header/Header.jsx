import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EXTERNAL_URLS } from '../config/constants';
import './Header.css';

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <header className="portal-header">
            <div className="header-top">
                <div className="header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="dept-logo">
                        <div className="logo-circle">
                            <img src="/logos/logo-black.png" alt="Department Logo" />
                        </div>
                    </div>
                    <div className="dept-info">
                        <h1>Rajasthan Ground Water (Conservation and Management) Authority</h1>
                        <p>Government of Rajasthan</p>
                    </div>
                </div>
                <div className="header-right">
                    <div className="search-box hide-mobile">
                        <input
                            type="text"
                            placeholder="Search here"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleSearch}>🔍</button>
                    </div>
                    <div className="helpline-info hide-mobile">
                        <strong>Technical Helpline Number</strong>
                        <p>10.00 AM - 6.00 PM (On all working days)</p>
                    </div>
                    <div className="raj-emblem hide-mobile">
                        <div className="emblem-circle">
                            <img src="/logos/india-emblem.png" alt="Government Emblem" />
                        </div>
                    </div>
                    <button className="mobile-menu-toggle show-mobile" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
            <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <a href={EXTERNAL_URLS.ABOUT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>ABOUT DEPARTMENT</a>
                <a href={EXTERNAL_URLS.SERVICES_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>SERVICES</a>
                <a href={EXTERNAL_URLS.GUIDELINES_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>GUIDELINES</a>
                <a href={EXTERNAL_URLS.DOWNLOADS_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>DOWNLOADS</a>
                <a href="/tools" onClick={() => setIsMobileMenuOpen(false)}>TOOLS</a>
                <a href={EXTERNAL_URLS.CONTACT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>CONTACT US</a>

                {!isAuthenticated && (
                    <div className="auth-nav-items">
                        <Link to="/noc/login" className="auth-btn login-btn" onClick={() => setIsMobileMenuOpen(false)}>LOGIN</Link>
                        <Link to="?register=true" className="auth-btn register-btn" onClick={() => setIsMobileMenuOpen(false)}>REGISTER</Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
