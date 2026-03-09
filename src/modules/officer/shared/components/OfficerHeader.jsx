import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOfficerToken, clearOfficerAuth } from '../utils/officerAuth';
import NotificationBell from '../../../../components/NotificationBell';
import '../styles/officer-portal.css';
import API_BASE_URL from '../../../../config/apiConfig';

const OfficerHeader = ({ officerName, officerRole, officerDesignation, district }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        try {
            const token = getOfficerToken();
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearOfficerAuth();
            navigate('/officer/login');
        }
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
                {/* Language toggle */}
                <div
                    onClick={toggleLanguage}
                    title={i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                    style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px', color: 'white',
                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                    className="notranslate"
                >
                    <span style={{ fontSize: '1rem' }}>🌐</span>
                    {i18n.language === 'en' ? 'Hindi' : 'English'}
                </div>

                {/* ── Unified Notification Bell ── */}
                <NotificationBell theme="dark" />

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
