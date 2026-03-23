import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import NotificationBell from '../../../../components/NotificationBell';
import '../styles/officer-portal.css';

const OfficerHeader = ({ officerName, officerRole, officerDesignation, district }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        await logout(() => navigate('/officer/login'));
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = newLang;
            select.dispatchEvent(new Event('change'));
        }
    };

    const getInitials = (name) =>
        (name || 'Officer').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const getRoleDisplay = (role) => t(`officer.login.roles.${role}`);

    return (
        <header className="officer-header">
            <div className="officer-header-left">
                {/* Mobile Menu Toggle */}
                <button 
                    className="officer-mobile-toggle"
                    onClick={() => {
                        const sidebar = document.querySelector('.officer-sidebar');
                        if (sidebar) sidebar.classList.toggle('open');
                        const backdrop = document.querySelector('.officer-sidebar-backdrop');
                        if (backdrop) backdrop.classList.toggle('active');
                    }}
                    aria-label="Toggle Menu"
                >
                    ☰
                </button>
                <img
                    src="/sgwa-logo.png"
                    alt="SGWA Logo"
                    className="officer-logo"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                    <h1 className="officer-header-title">
                        {getRoleDisplay(officerRole)} {t('officer.header.portalSuffix')}
                    </h1>
                    <p className="officer-header-subtitle">
                        {t('officer.header.govTitle')}
                    </p>
                </div>
            </div>

            <div className="officer-header-right">
                {/* ── Unified Notification Bell ── */}
                <NotificationBell theme="light" />

                {/* Language toggle */}
                <div
                    onClick={toggleLanguage}
                    title={i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                    className="officer-lang-toggle notranslate"
                >
                    <span className="lang-icon">🌐</span>
                    <span className="lang-text">{i18n.language === 'en' ? 'HI' : 'EN'}</span>
                </div>

                {/* Profile */}
                <div className="officer-profile">
                    <div className="officer-avatar notranslate">{getInitials(officerName)}</div>
                    <div className="officer-info">
                        <h4 className="notranslate">{officerName}</h4>
                        <p className="notranslate">{officerDesignation}{district ? ` - ${district}` : ''}</p>
                    </div>
                </div>

                <button className="officer-logout-btn" onClick={handleLogout}>
                    {t('nav.logout')}
                </button>
            </div>
        </header>
    );
};

export default OfficerHeader;
