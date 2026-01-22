import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="portal-header">
            <div className="header-top">
                <div className="header-brand">
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
                        <input type="text" placeholder="Search here" />
                        <button>🔍</button>
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
                <a href="https://rgwcma.geoplanetsolution.in/about" target="_blank" rel="noopener noreferrer">ABOUT DEPARTMENT</a>
                <a href="https://rgwcma.geoplanetsolution.in/services" target="_blank" rel="noopener noreferrer">SERVICES</a>
                <a href="https://rgwcma.geoplanetsolution.in/guidelines" target="_blank" rel="noopener noreferrer">GUIDELINES</a>
                <a href="https://rgwcma.geoplanetsolution.in/downloads" target="_blank" rel="noopener noreferrer">DOWNLOADS</a>
                <a href="https://rgwcma.geoplanetsolution.in/contact" target="_blank" rel="noopener noreferrer">CONTACT US</a>
            </nav>
        </header>
    );
};

export default Header;
