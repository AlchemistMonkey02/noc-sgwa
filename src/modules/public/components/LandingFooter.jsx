import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LandingFooter = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="portal-footer">
            <div className="footer-content">
                <div className="footer-main-info">
                    <p className="footer-title">
                        <strong>{t('landing.footer1')}</strong>
                    </p>
                    <p className="footer-subtitle">
                        {t('landing.footer2')}
                    </p>
                </div>
                
                <div className="footer-links">
                    <Link to="/help/process-flow">{t('landing.doc1')}</Link>
                    <Link to="/help/faqs">{t('landing.doc4')}</Link>
                    <Link to="/help/contact">{t('landing.doc5')}</Link>
                </div>

                <div className="footer-copyright">
                    <span className="copyright-text">
                        © {currentYear} {t('landing.footer3')}
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
