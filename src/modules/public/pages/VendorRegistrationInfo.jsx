import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/public-pages.css';

const VendorRegistrationInfo = () => {
    const navigate = useNavigate();

    return (
        <div className="public-info-page">
            <div className="public-hero">
                <h1 className="public-hero-title">Equipment Vendor Registration</h1>
                <p className="public-hero-subtitle">
                    Empaneling suppliers for IoT Flow Meters, Telemetry Systems, and Water Level Recorders.
                </p>
                <button
                    onClick={() => navigate('?register=true&service=vendor_registration')}
                    className="public-cta-button"
                >
                    Register as Vendor
                </button>
            </div>

            <div className="public-content-container">
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: '800', color: 'var(--gray-900)' }}>Approved Equipment Categories</h2>
                    <div className="public-feature-grid">
                        <div className="public-feature-card" style={{ textAlign: 'center' }}>
                            <div className="public-feature-icon">📟</div>
                            <h3 className="public-feature-title">Digital Flow Meters</h3>
                            <p className="public-feature-desc">ISO 4064 Compliant electromagnetic flow meters with telemetry.</p>
                        </div>
                        <div className="public-feature-card" style={{ textAlign: 'center' }}>
                            <div className="public-feature-icon">📡</div>
                            <h3 className="public-feature-title">Telemetry Systems</h3>
                            <p className="public-feature-desc">Cloud-connected IoT devices for real-time data transmission.</p>
                        </div>
                        <div className="public-feature-card" style={{ textAlign: 'center' }}>
                            <div className="public-feature-icon">💧</div>
                            <h3 className="public-feature-title">Piezometers</h3>
                            <p className="public-feature-desc">Digital water level recorders (DWLR) for aquifer monitoring.</p>
                        </div>
                    </div>
                </div>

                <div className="public-split-section" style={{ background: 'var(--color-primary-50)', borderRadius: '30px', overflow: 'hidden' }}>
                    <div className="public-split-text" style={{ padding: 'clamp(2rem, 8vw, 4rem)' }}>
                        <h2 style={{ color: 'var(--color-primary-900)' }}>Benefits for Registered Vendors</h2>
                        <ul className="public-split-list">
                            <li>
                                <span className="public-list-check" style={{ color: 'var(--color-primary-700)' }}>•</span>
                                Listed on the official public dashboard
                            </li>
                            <li>
                                <span className="public-list-check" style={{ color: 'var(--color-primary-700)' }}>•</span>
                                Direct access to thousands of industrial applicants
                            </li>
                            <li>
                                <span className="public-list-check" style={{ color: 'var(--color-primary-700)' }}>•</span>
                                Standardized certification process
                            </li>
                        </ul>
                    </div>
                    <div style={{ 
                        background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontSize: 'clamp(5rem, 15vw, 8rem)',
                        minHeight: '300px'
                    }}>
                        🤝
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorRegistrationInfo;
