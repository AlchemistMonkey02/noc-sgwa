import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import ProcessFlow from '../../../components/ProcessFlow';
import '../styles/public-landing.css';

const GroundwaterServices = () => {
    const navigate = useNavigate();

    const applicationSteps = [
        {
            title: 'Register',
            description: 'Create your account',
            status: 'completed'
        },
        {
            title: 'Fill Details',
            description: 'Submit project info',
            status: 'active'
        },
        {
            title: 'Pay Fee',
            description: 'Online payment',
            status: 'pending'
        },
        {
            title: 'Inspection',
            description: 'Site verification',
            status: 'pending'
        },
        {
            title: 'Get NOC',
            description: 'Digital certificate',
            status: 'completed'
        }
    ];

    return (
        <div className="gov-portal">
            <PublicHeader />

            <div className="page-container">
                <div className="hero-section" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '4rem 2rem', color: 'white', borderRadius: '0 0 20px 20px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700', color: '#ffffff' }}>Groundwater NOC Services</h1>
                    <p style={{ fontSize: '1.25rem', opacity: '0.9', maxWidth: '800px', margin: '0 auto' }}>
                        Comprehensive management for Industrial, Infrastructure, and Mining projects seeking groundwater abstraction permissions.
                    </p>
                    <button
                        onClick={() => navigate('/noc/register?service=water_abstractor')}
                        className="cta-button"
                        style={{ marginTop: '2rem', padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        Apply Now
                    </button>
                </div>

                <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

                    <div className="grid-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                        <div className="feature-card" style={{ padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏭</div>
                            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>Industrial Projects</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                                For industries requiring groundwater for manufacturing, processing, or cooling purposes. Calculate your water budget and apply for NOC.
                            </p>
                        </div>
                        <div className="feature-card" style={{ padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏗️</div>
                            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>Infrastructure Projects</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                                For residential townships, offices, malls, and other infrastructure developments. Ensure compliance with urban water guidelines.
                            </p>
                        </div>
                        <div className="feature-card" style={{ padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⛏️</div>
                            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>Mining Projects</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                                Specialized dewatering and abstraction permissions for mining activities. Submit detailed hydrogeological reports.
                            </p>
                        </div>
                    </div>

                    <ProcessFlow
                        title="Application Process"
                        steps={applicationSteps}
                    />

                </div>
            </div>
        </div>
    );
};

export default GroundwaterServices;

