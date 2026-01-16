import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublicHeader = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="public-header">
            <div className="header-container">
                <div className="header-logo" onClick={() => navigate('/')}>
                    <span className="logo-icon">💧</span>
                    <div className="logo-text">
                        <span className="logo-title">SGWA</span>
                        <span className="logo-subtitle">Rajasthan</span>
                    </div>
                </div>

                <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <a href="#services" className="nav-link">Services</a>
                    <a href="#notifications" className="nav-link">Notifications</a>
                    <a href="#documents" className="nav-link">Documents</a>
                    <a href="#guidelines" className="nav-link">Guidelines</a>
                    <a href="#contact" className="nav-link">Contact</a>
                </nav>

                <div className="header-actions">
                    <button onClick={() => navigate('/noc/login')} className="header-btn login">
                        Login
                    </button>
                    <button onClick={() => navigate('/noc/register')} className="header-btn register">
                        Register
                    </button>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>
        </header>
    );
};

export default PublicHeader;
