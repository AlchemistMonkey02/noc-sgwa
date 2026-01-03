import React from 'react';
import '../styles/noc-portal.css';

const NOCFooter = () => {
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
                            <h3 className="footer-heading">Ground Water Department</h3>
                        </div>
                        <p className="footer-desc">
                            Rajasthan Ground Water Authority is responsible for the regulation and management of groundwater resources in the state of Rajasthan.
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
                        <h3 className="footer-heading">Quick Links</h3>
                        <ul className="footer-links">
                            <li><a href="#">State Portal</a></li>
                            <li><a href="#">National Portal</a></li>
                            <li><a href="#">Sitemap</a></li>
                            <li><a href="#">Disclaimer</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Use</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Us */}
                    <div className="rgwa-footer-col">
                        <h3 className="footer-heading">Contact Us</h3>
                        <ul className="footer-contact-list">
                            <li>
                                <span className="contact-icon">📍</span>
                                <span>
                                    Ground Water Department, <br />
                                    Jhalana Doongri, Jaipur - 302004
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
                            <h4>TOTAL VISITORS</h4>
                            <div className="visitor-count">12,45,890</div>
                            <div className="visitor-date">Last Updated: {new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="rgwa-copyright-bar">
                <div className="container-xl copyright-content">
                    <div className="copyright-text">
                        © 2025 Ground Water Department, Government of Rajasthan. All Rights Reserved.
                    </div>
                    <div className="developer-credit">
                        Designed & Developed by <strong>GWD IT Cell ❤️</strong>
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
