import React from 'react';
import { Link } from 'react-router-dom';
import './PublicHeader.css';

const PublicHeader = () => {
    return (
        <header className="public-portal-header">
            <div className="public-header-top">
                <div className="public-header-container">
                    <div className="public-header-brand">
                        <div className="public-dept-logo">
                            <div className="public-logo-circle">
                                <img src="/logos/logo-black.png" alt="Department Logo" />
                            </div>
                        </div>
                        <div className="public-dept-info">
                            <h1>GROUND WATER DEPARTMENT</h1>
                            <p>Government of Rajasthan</p>
                        </div>
                    </div>
                    <div className="public-header-right">
                        <div className="public-search-box">
                            <input type="text" placeholder="Search here" />
                            <button>🔍</button>
                        </div>
                        <div className="public-helpline-info">
                            <strong>Technical Helpline Number</strong>
                            <p>10.00 AM - 6.00 PM (On all working days)</p>
                        </div>
                        <div className="public-raj-emblem">
                            <div className="public-emblem-circle">
                                <img src="/logos/india-emblem.png" alt="Government Emblem" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="public-header-nav">
                <div className="public-header-container">
                    <a href="https://rgwcma.geoplanetsolution.in/about" target="_blank" rel="noopener noreferrer">ABOUT DEPARTMENT</a>
                    <a href="https://rgwcma.geoplanetsolution.in/services" target="_blank" rel="noopener noreferrer">SERVICES</a>
                    <a href="https://rgwcma.geoplanetsolution.in/guidelines" target="_blank" rel="noopener noreferrer">GUIDELINES</a>
                    <a href="https://rgwcma.geoplanetsolution.in/downloads" target="_blank" rel="noopener noreferrer">DOWNLOADS</a>
                    <a href="https://rgwcma.geoplanetsolution.in/contact" target="_blank" rel="noopener noreferrer">CONTACT US</a>
                </div>
            </nav>
        </header>
    );
};

export default PublicHeader;
