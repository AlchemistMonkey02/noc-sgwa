import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/noc-portal.css';

const NOCFooter = () => {
    const { t } = useTranslation();
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="rgwa-footer">
            <div className="container-xl">
                <div className="rgwa-footer-grid">
                    {/* Column 1: Organization Info */}
                    <div className="rgwa-footer-col">
                        <div className="footer-org-header">
                            <span className="footer-org-icon">🏛️</span>
                            <h3 className="footer-heading">{t('nocFooter.deptName')}</h3>
                        </div>
                        <p className="footer-desc">
                            {t('nocFooter.deptDesc')}
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link fb">f</a>
                            <a href="#" className="social-link tw">t</a>
                            <a href="#" className="social-link in">in</a>
                            <a href="#" className="social-link yt">▶</a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="rgwa-footer-col">
                        <h3 className="footer-heading">{t('nocFooter.quickLinks')}</h3>
                        <ul className="footer-links">
                            <li><a href="#">{t('nocFooter.statePortal')}</a></li>
                            <li><a href="#">{t('nocFooter.natPortal')}</a></li>
                            <li><a href="#">{t('nocFooter.sitemap')}</a></li>
                            <li><a href="#">{t('nocFooter.disclaimer')}</a></li>
                            <li><a href="#">{t('nocFooter.privacy')}</a></li>
                            <li><a href="#">{t('nocFooter.terms')}</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Us */}
                    <div className="rgwa-footer-col">
                        <h3 className="footer-heading">{t('nocFooter.contactUs')}</h3>
                        <ul className="footer-contact-list">
                            <li>
                                <span className="contact-icon">📍</span>
                                <span>
                                    {t('nocFooter.address')}
                                </span>
                            </li>
                            <li>
                                <span className="contact-icon">📧</span>
                                <a href="mailto:gwd@rajasthan.gov.in">gwd@rajasthan.gov.in</a>
                            </li>
                            <li>
                                <span className="contact-icon">📞</span>
                                <a href="tel:+911412700000">+91-141-2700000</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Visitor Stats */}
                    <div className="rgwa-footer-col">
                        <div className="visitor-card">
                            <h4>{t('nocFooter.totalVisitors')}</h4>
                            <div className="visitor-count">12,45,890</div>
                            <div className="visitor-date">{t('nocFooter.lastUpdated')}: {new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="rgwa-copyright-bar">
                <div className="container-xl copyright-content">
                    <div className="copyright-text">
                        {t('nocFooter.copyright')}
                    </div>
                    <div className="developer-credit">
                        {t('nocFooter.devCredit')} <strong>GWD IT Cell ❤️</strong>
                    </div>
                    <button className="scroll-top-btn" onClick={scrollToTop} title="Scroll to Top">
                        ⬆
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default NOCFooter;
