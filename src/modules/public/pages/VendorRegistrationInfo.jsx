import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import '../styles/public-landing.css';

const VendorRegistrationInfo = () => {
    const navigate = useNavigate();

    return (
        <div className="gov-portal">
            <PublicHeader />

            <div className="page-container">
                <div className="hero-section" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '4rem 2rem', color: 'white', borderRadius: '0 0 20px 20px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700', color: '#ffffff' }}>Equipment Vendor Registration</h1>
                    <p style={{ fontSize: '1.25rem', opacity: '0.9', maxWidth: '800px', margin: '0 auto' }}>
                        Empaneling suppliers for IoT Flow Meters, Telemetry Systems, and Water Level Recorders.
                    </p>
                    <button
                        onClick={() => navigate('?register=true&service=vendor_registration')}
                        className="cta-button"
                        style={{ marginTop: '2rem', padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        Register as Vendor
                    </button>
                </div>

                <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>Approved Equipment Categories</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📟</div>
                                <h3>Digital Flow Meters</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>ISO 4064 Compliant electromagnetic flow meters with telemetry.</p>
                            </div>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
                                <h3>Telemetry Systems</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Cloud-connected IoT devices for real-time data transmission.</p>
                            </div>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💧</div>
                                <h3>Piezometers</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Digital water level recorders (DWLR) for aquifer monitoring.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', background: '#eff6ff', borderRadius: '20px', overflow: 'hidden' }}>
                        <div style={{ padding: '4rem', flex: 1 }}>
                            <h2 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>Benefits for Registered Vendors</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#1e3a8a' }}>
                                    <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>•</span>
                                    Listed on the official public dashboard
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#1e3a8a' }}>
                                    <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>•</span>
                                    Direct access to thousands of industrial applicants
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#1e3a8a' }}>
                                    <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>•</span>
                                    Standardized certification process
                                </li>
                            </ul>
                        </div>
                        <div style={{ flex: 1, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '5rem' }}>
                            🤝
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VendorRegistrationInfo;
