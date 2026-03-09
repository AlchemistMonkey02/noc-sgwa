import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EXTERNAL_URLS } from '../config/constants';
import './Header.css';

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        // Implement search logic if needed
        console.log('Searching for:', searchTerm);
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
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search here"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleSearch}>🔍</button>
                    </div>
                    <div className="helpline-info">
                        <strong>Technical Helpline Number</strong>
                        <p>10.00 AM - 6.00 PM (On all working days)</p>
                    </div>
                    <div className="raj-emblem">
                        <div className="emblem-circle">
                            <img src="/logos/india-emblem.png" alt="Government Emblem" />
                        </div>
                    </div>
                </div>
            </div>
            <nav className="header-nav">
                <a href={EXTERNAL_URLS.ABOUT_URL} target="_blank" rel="noopener noreferrer">ABOUT DEPARTMENT</a>
                <a href={EXTERNAL_URLS.SERVICES_URL} target="_blank" rel="noopener noreferrer">SERVICES</a>
                <a href={EXTERNAL_URLS.GUIDELINES_URL} target="_blank" rel="noopener noreferrer">GUIDELINES</a>
                <a href={EXTERNAL_URLS.DOWNLOADS_URL} target="_blank" rel="noopener noreferrer">DOWNLOADS</a>
                <a href="/tools">TOOLS</a>
                <a href={EXTERNAL_URLS.CONTACT_URL} target="_blank" rel="noopener noreferrer">CONTACT US</a>

                {!isAuthenticated && (
                    <div className="auth-nav-items">
                        <Link to="/noc/login" className="auth-btn login-btn">LOGIN</Link>
                        <Link to="?register=true" className="auth-btn register-btn">REGISTER</Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
