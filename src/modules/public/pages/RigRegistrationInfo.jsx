import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EXTERNAL_URLS } from '../../../config/constants';
import '../styles/public-pages.css';

const RigRegistrationInfo = () => {
    const navigate = useNavigate();

    return (
        <div className="public-info-page">
            <div className="public-hero">
                <h1 className="public-hero-title">Rig Registration & Operations</h1>
                <p className="public-hero-subtitle">
                    Mandatory registration for all Drilling Agencies and Rigs operating within the state.
                </p>
                <button
                    onClick={() => window.location.href = EXTERNAL_URLS.RIG_REGISTRATION}
                    className="public-cta-button"
                >
                    Register Rig
                </button>
            </div>

            <div className="public-content-container">
                <div className="public-split-section">
                    <div className="public-split-text">
                        <h2>Why Register?</h2>
                        <ul className="public-split-list">
                            <li>
                                <span className="public-list-check">✓</span>
                                Legal mandate for all drilling operations
                            </li>
                            <li>
                                <span className="public-list-check">✓</span>
                                Get unique Radio Frequency ID for each rig
                            </li>
                            <li>
                                <span className="public-list-check">✓</span>
                                Avoid seizure and penalties
                            </li>
                            <li>
                                <span className="public-list-check">✓</span>
                                Online movement tracking permissions
                            </li>
                        </ul>
                    </div>
                    <div className="public-info-card">
                        <h3 className="notranslate" style={{ marginBottom: '1rem', color: 'var(--color-primary-800)' }}>Guidelines Summary</h3>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            Only registered rigs are authorized to construct wells. Unauthorized drilling will attract heavy penalties and confiscation of machinery under the Groundwater Act.
                        </p>
                        <a href="#" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: '700' }}>Download Full Notifications →</a>
                    </div>
                </div>

                <div className="public-stats-grid">
                    <div className="public-stat-item">
                        <div className="public-stat-number">1,240+</div>
                        <div className="public-stat-label">Registered Agencies</div>
                    </div>
                    <div className="public-stat-item">
                        <div className="public-stat-number">4,500+</div>
                        <div className="public-stat-label">Active Rigs</div>
                    </div>
                    <div className="public-stat-item">
                        <div className="public-stat-number">98%</div>
                        <div className="public-stat-label">Compliance Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RigRegistrationInfo;
