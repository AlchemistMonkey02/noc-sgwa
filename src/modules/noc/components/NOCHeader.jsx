import React from 'react';
import '../styles/noc-portal.css';

const NOCHeader = () => {
    return (
        <header className="noc-header">
            {/* Top Bar */}
            <div className="noc-header-top">
                <div className="noc-container">
                    <div className="noc-contact-info">
                        <div className="noc-contact-item">
                            <i className="📞"></i>
                            <span>011-23383824</span>
                        </div>
                        <div className="noc-contact-item">
                            <i className="📱"></i>
                            <span>9868232311</span>
                        </div>
                        <div className="noc-contact-item">
                            <i className="✉️"></i>
                            <span>bhuneersupport-cgwa@gov.in</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="noc-header-main">
                <div className="noc-container">
                    <div className="noc-logo-section">
                        <div className="noc-title-section">
                            <h1>MINISTRY OF JAL SHAKTI</h1>
                            <h2>CENTRAL GROUND WATER AUTHORITY</h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                                BhuNeer - Groundwater NOC Application Portal
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="noc-nav">
                <div className="noc-container">
                    <ul className="noc-nav-list">
                        <li className="noc-nav-item">
                            <a href="/noc" className="noc-nav-link">Home</a>
                        </li>
                        <li className="noc-nav-item">
                            <a href="/noc/login" className="noc-nav-link">Login</a>
                        </li>
                        <li className="noc-nav-item">
                            <a href="/noc/register" className="noc-nav-link">Register</a>
                        </li>
                        <li className="noc-nav-item">
                            <a href="#" className="noc-nav-link">User Manual</a>
                        </li>
                        <li className="noc-nav-item">
                            <a href="#" className="noc-nav-link">FAQ</a>
                        </li>
                        <li className="noc-nav-item">
                            <a href="#" className="noc-nav-link">Help Desk</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default NOCHeader;
