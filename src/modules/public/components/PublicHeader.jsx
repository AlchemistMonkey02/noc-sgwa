import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { EXTERNAL_URLS } from '../../../config/constants';
import NotificationBell from '../../../components/NotificationBell';
import './PublicHeader.css';

const PublicHeader = () => {
    const { isAuthenticated, user, logout, isOfficer, userType } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);

        // Trigger Google Translate for the rest of the application
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = newLang; // Google Translate understands 'en' and 'hi'
            select.dispatchEvent(new Event('change'));
        }
    };
    const handleOpenRegister = (e) => {
        if (e) e.preventDefault();
        setSearchParams({ register: 'true' });
    };

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
                    <span>{t('nav.govTitle')}</span>
                    <div className="public-top-links">
                        <button onClick={toggleLanguage} className="lang-toggle-btn">
                            {i18n.language === 'en' ? 'हिंदी' : 'English'}
                        </button>
                        <span>|</span>
                        <a href="#">{t('nav.skipToMain')}</a>
                        <span>|</span>
                        <a href="#">{t('nav.screenReader')}</a>
                    </div>
                </div>
            </div>

            {/* Main Header Area */}
            <div className="public-header-main">
                <div className="public-header-container">
                    <Link to="/" className="public-brand-area">
                        <img
                            src="/logos/logo.png"
                            alt="Department Logo"
                            className="header-dept-logo"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="public-brand-text">
                            <h1>{t('nav.rgwaTitle')}</h1>
                            <p>{t('nav.rgwaSubtitle')}</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <Link to="/">{t('nav.home')}</Link>
                        <a href={EXTERNAL_URLS.ABOUT_URL} target="_blank" rel="noopener noreferrer">{t('nav.about')}</a>
                        <a href={EXTERNAL_URLS.SERVICES_URL} target="_blank" rel="noopener noreferrer">{t('nav.services')}</a>
                        <a href={EXTERNAL_URLS.GUIDELINES_URL} target="_blank" rel="noopener noreferrer">{t('nav.guidelines')}</a>
                        <a href={EXTERNAL_URLS.CONTACT_URL} target="_blank" rel="noopener noreferrer">{t('nav.help')}</a>
                    </nav>

                    <div className="public-header-actions">
                        <div className="public-search-wrapper">
                            <input type="text" placeholder={t('nav.searchPlaceholder')} />
                            <button aria-label="Search">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>
                        </div>

                        <div className="header-helpline">
                            <span className="helpline-label">{t('nav.tollFree')}</span>
                        </div>

                        <div className="header-auth-actions desktop-only">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to={isOfficer() ? `/officer/${userType?.toLowerCase()}/dashboard` : "/noc/dashboard"}
                                        className="btn-portal-header"
                                    >
                                        {t('nav.portal')}
                                    </Link>
                                    <NotificationBell theme="light" />
                                    <button onClick={handleLogout} className="btn-logout-minimal notranslate">{t('nav.logout')}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleOpenRegister} className="btn-register-header border-0 bg-transparent cursor-pointer">{t('nav.register')}</button>
                                    <Link to="/noc/login" className="btn-portal-header">{t('nav.login')}</Link>
                                    <Link to="/officer/login" className="btn-officer-minimal">{t('nav.officerPortal')}</Link>
                                </>
                            )}
                        </div>

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
                        <span className="mobile-menu-title">{t('nav.menu')}</span>
                        <button className="mobile-close-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
                    </div>
                    <div className="nav-links-wrapper">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>{t('nav.home').toUpperCase()}</Link>
                        <a href={EXTERNAL_URLS.ABOUT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t('nav.aboutMobile')}</a>
                        <a href={EXTERNAL_URLS.SERVICES_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t('nav.services').toUpperCase()}</a>
                        <a href={EXTERNAL_URLS.GUIDELINES_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t('nav.guidelines').toUpperCase()}</a>
                        <a href={EXTERNAL_URLS.DOWNLOADS_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t('nav.downloadsMobile')}</a>
                        <a href={EXTERNAL_URLS.CONTACT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t('nav.contactMobile')}</a>
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={isOfficer() ? `/officer/${userType?.toLowerCase()}/dashboard` : "/noc/dashboard"}
                                    className="nav-btn-link-login"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('nav.portalMobile')}
                                </Link>
                                <button onClick={handleLogout} className="nav-btn-link-logout notranslate">{t('nav.logoutMobile')}</button>
                            </>
                        ) : (
                            <>
                                <Link to="/noc/register" className="nav-btn-link-register" onClick={() => setIsMenuOpen(false)}>{t('nav.registerMobile')}</Link>
                                <Link to="/officer/login" className="nav-btn-link-login" style={{ background: 'var(--gray-800)' }} onClick={() => setIsMenuOpen(false)}>{t('nav.officerPortal').toUpperCase()}</Link>
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
