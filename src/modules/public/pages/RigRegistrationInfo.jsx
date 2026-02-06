import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import { EXTERNAL_URLS } from '../../../config/constants';
import '../styles/public-landing.css';

const RigRegistrationInfo = () => {
    const navigate = useNavigate();

    return (
        <div className="gov-portal">
            <PublicHeader />

            <div className="page-container">
                <div className="hero-section" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '4rem 2rem', color: 'white', borderRadius: '0 0 20px 20px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700', color: '#ffffff' }}>Rig Registration & Operations</h1>
                    <p style={{ fontSize: '1.25rem', opacity: '0.9', maxWidth: '800px', margin: '0 auto' }}>
                        Mandatory registration for all Drilling Agencies and Rigs operating within the state.
                    </p>
                    <button
                        onClick={() => window.location.href = EXTERNAL_URLS.RIG_REGISTRATION}
                        className="cta-button"
                        style={{ marginTop: '2rem', padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        Register Rig
                    </button>
                </div>

                <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1.5rem' }}>Why Register?</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#4b5563' }}>
                                    <span style={{ color: '#2563eb', marginRight: '1rem', fontSize: '1.2rem' }}>✓</span>
                                    Legal mandate for all drilling operations
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#4b5563' }}>
                                    <span style={{ color: '#2563eb', marginRight: '1rem', fontSize: '1.2rem' }}>✓</span>
                                    Get unique Radio Frequency ID for each rig
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#4b5563' }}>
                                    <span style={{ color: '#2563eb', marginRight: '1rem', fontSize: '1.2rem' }}>✓</span>
                                    Avoid seizure and penalties
                                </li>
                                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: '#4b5563' }}>
                                    <span style={{ color: '#2563eb', marginRight: '1rem', fontSize: '1.2rem' }}>✓</span>
                                    Online movement tracking permissions
                                </li>
                            </ul>
                        </div>
                        <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderTop: '4px solid #2563eb' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#1e3a8a' }}>Guidelines Summary</h3>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                Only registered rigs are authorized to construct wells. Unauthorized drilling will attract heavy penalties and confiscation of machinery under the Groundwater Act.
                            </p>
                            <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Download Full Notifications →</a>
                        </div>
                    </div>

                    <div className="stats-row" style={{ display: 'flex', gap: '2rem', marginBottom: '4rem' }}>
                        <div style={{ flex: 1, padding: '2rem', background: '#eff6ff', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e3a8a' }}>1,240+</div>
                            <div style={{ color: '#1e3a8a' }}>Registered Agencies</div>
                        </div>
                        <div style={{ flex: 1, padding: '2rem', background: '#eff6ff', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e3a8a' }}>4,500+</div>
                            <div style={{ color: '#1e3a8a' }}>Active Rigs</div>
                        </div>
                        <div style={{ flex: 1, padding: '2rem', background: '#eff6ff', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e3a8a' }}>98%</div>
                            <div style={{ color: '#1e3a8a' }}>Compliance Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RigRegistrationInfo;
