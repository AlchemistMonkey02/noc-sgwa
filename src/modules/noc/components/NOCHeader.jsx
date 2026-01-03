import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/noc-portal.css';

const NOCHeader = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    return (
        <header className="rgwa-header-container">
            {/* Top Bar */}
            <div className="rgwa-top-bar">
                <div className="container-xl">
                    <div className="rgwa-top-bar-content">
                        <div className="rgwa-date-time">
                            <span>{formatDate(currentTime)}</span>
                            <span className="rgwa-separator">|</span>
                            <span>{formatTime(currentTime)}</span>
                        </div>
                        <div className="rgwa-top-actions">
                            <span className="lang-switch">English | हिन्दी</span>
                            <div className="font-resizer">
                                <button>A-</button>
                                <button>A</button>
                                <button>A+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Branding Header */}
            <div className="rgwa-branding-section">
                <div className="container-xl">
                    <div className="rgwa-branding-layout">
                        {/* Left Logo */}
                        <div className="rgwa-logo-left">
                            <img
                                src="https://rgwcma.geoplanetsolution.in/assets/img/logo.png"
                                alt="Department Logo"
                                onError={(e) => e.target.style.display = 'none'} // Fallback if image fails
                            />
                        </div>

                        {/* Center Text */}
                        <div className="rgwa-title-text">
                            <h1>RAJASTHAN GROUND WATER (CONSERVATION AND MANAGEMENT) AUTHORITY</h1>
                            <p>Government of Rajasthan</p>
                        </div>

                        {/* Right Logo */}
                        <div className="rgwa-logo-right">
                            <img
                                src="https://rgwcma.geoplanetsolution.in/assets/img/emb-logo.png"
                                alt="Emblem"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rainbow Navigation */}
            <nav className="rgwa-navbar">
                <div className="container-xl">
                    <ul className="rgwa-nav-list">
                        <li className="rgwa-nav-item">
                            <NavLink to="/noc/dashboard" className="rgwa-nav-link home-link">
                                <span className="nav-icon">🏠</span> Home
                            </NavLink>
                        </li>
                        <li className="rgwa-nav-item">
                            <NavLink to="#" className="rgwa-nav-link">About Us</NavLink>
                        </li>
                        <li className="rgwa-nav-item">
                            <NavLink to="#" className="rgwa-nav-link">Services</NavLink>
                        </li>
                        <li className="rgwa-nav-item">
                            <NavLink to="#" className="rgwa-nav-link">Downloads</NavLink>
                        </li>
                        <li className="rgwa-nav-item">
                            <NavLink to="#" className="rgwa-nav-link">Maps & Data</NavLink>
                        </li>
                        <li className="rgwa-nav-item">
                            <NavLink to="#" className="rgwa-nav-link">Guidelines</NavLink>
                        </li>
                        <li className="rgwa-nav-item">
                            <NavLink to="#" className="rgwa-nav-link">Contact Us</NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default NOCHeader;
