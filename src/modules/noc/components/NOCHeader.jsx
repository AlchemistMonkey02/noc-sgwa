import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EXTERNAL_URLS } from '../../../config/constants';
import '../styles/noc-portal.css';
import './NOCHeader.css';

const NOCHeader = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { t } = useTranslation();
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
            {/* <div className="rgwa-top-bar">
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
            </div> */}

            {/* Main Branding Header */}
            <div className="rgwa-branding-section">
                <div className="container-xl">
                    <div className="rgwa-branding-layout">
                        {/* Left Logo */}
                        <div className="rgwa-logo-left">
                            <img
                                src={EXTERNAL_URLS.LOGO_URL}
                                alt="Department Logo"
                                onError={(e) => e.target.style.display = 'none'} // Fallback if image fails
                            />
                        </div>

                        {/* Center Text */}
                        <div className="rgwa-title-text">
                            <h1>{t('nocHeader.authorityName')}</h1>
                            <p>{t('nocHeader.govTitle')}</p>
                        </div>

                        {/* Right Logo */}
                        <div className="rgwa-logo-right">
                            <img
                                src={EXTERNAL_URLS.EMBLEM_URL}
                                alt="Emblem"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NOCHeader;
