import React from 'react';
import { Link } from 'react-router-dom';
import './PublicHeader.css';

const PublicHeader = () => {
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
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="public-header-nav">
                <div className="public-header-container">
                    <div className="nav-links-wrapper">
                        <a href="https://rgwcma.geoplanetsolution.in/about" target="_blank" rel="noopener noreferrer">ABOUT DEPARTMENT</a>
                        <a href="https://rgwcma.geoplanetsolution.in/services" target="_blank" rel="noopener noreferrer">SERVICES</a>
                        <a href="https://rgwcma.geoplanetsolution.in/guidelines" target="_blank" rel="noopener noreferrer">GUIDELINES</a>
                        <a href="https://rgwcma.geoplanetsolution.in/downloads" target="_blank" rel="noopener noreferrer">DOWNLOADS</a>
                        <a href="https://rgwcma.geoplanetsolution.in/contact" target="_blank" rel="noopener noreferrer">CONTACT US</a>
                        <Link to="/noc/login" className="nav-btn-link">LOGIN</Link>
                        <Link to="/noc/register" className="nav-btn-link">REGISTER</Link>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default PublicHeader;
