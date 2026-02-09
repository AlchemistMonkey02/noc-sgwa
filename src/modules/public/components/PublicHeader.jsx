import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { EXTERNAL_URLS } from '../../../config/constants';
import './PublicHeader.css';

const PublicHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/noc/login');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="public-portal-header">
            {/* Top Bar - Optional for Gov sites */}
            <div className="public-top-bar">
                <div className="public-header-container">
                    <span>Government of Rajasthan</span>
                    <div className="public-top-links">
                        <a href="#">Skip to Main Content</a>
                        <span>|</span>
                        <a href="#">Screen Reader Access</a>
                    </div>
                </div>
            </div>

            {/* Main Header Area */}
            <div className="public-header-main">
                <div className="public-header-container">
                    <div className="public-brand-area">
                        <img
                            src="/logos/logo.png"
                            alt="Department Logo"
                            className="header-dept-logo"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="public-brand-text">
                            <h1>Rajasthan Ground Water (Conservation and Management) Authority</h1>
                            <p>Government of Rajasthan</p>
                        </div>
                    </div>

                    <div className="public-header-actions">
                        <div className="public-search-wrapper">
                            <input type="text" placeholder="Search here..." />
                            <button><i className="fas fa-search"></i> 🔍</button>
                        </div>

                        <div className="header-helpline">
                            <span className="helpline-label">Technical Helpline Number</span>
                            <span className="helpline-time">10:00 AM - 6:00 PM (Working Days)</span>
                        </div>

                        <img
                            src="/logos/india-emblem.png"
                            alt="State Emblem"
                            className="header-emblem"
                            onError={(e) => e.target.style.display = 'none'}
                        />

                        {/* Mobile Menu Toggle */}
                        <button className="public-mobile-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className={`public-header-nav ${isMenuOpen ? 'open' : ''}`}>
                <div className="public-header-container">
                    <div className="mobile-menu-header">
                        <span className="mobile-menu-title">Menu</span>
                        <button className="mobile-close-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
                    </div>
                    <div className="nav-links-wrapper">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>HOME</Link>
                        <a href={EXTERNAL_URLS.ABOUT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>ABOUT DEPARTMENT</a>
                        <a href={EXTERNAL_URLS.SERVICES_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>SERVICES</a>
                        <a href={EXTERNAL_URLS.GUIDELINES_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>GUIDELINES</a>
                        <a href={EXTERNAL_URLS.DOWNLOADS_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>DOWNLOADS</a>
                        <a href={EXTERNAL_URLS.CONTACT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>CONTACT US</a>

                        {isAuthenticated ? (
                            <>
                                {/* <Link to="/noc/dashboard" className="nav-btn-link-login" style={{ background: '#0f172a' }}>DASHBOARD</Link> */}
                                <button onClick={handleLogout} className="nav-btn-link-logout">LOGOUT</button>
                            </>
                        ) : (
                            <>
                                <Link to="/noc/login" className="nav-btn-link-login" onClick={() => setIsMenuOpen(false)}>LOGIN</Link>
                                <Link to="/noc/register" className="nav-btn-link-register" onClick={() => setIsMenuOpen(false)}>REGISTER</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            {/* Backdrop for mobile */}
            {isMenuOpen && <div className="public-nav-backdrop" onClick={() => setIsMenuOpen(false)}></div>}
        </header>
    );
};

export default PublicHeader;
