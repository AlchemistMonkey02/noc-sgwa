import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProcessFlow from '../../../components/ProcessFlow';
import '../styles/public-pages.css';

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
        <div className="public-info-page">
            <div className="public-hero">
                <h1 className="public-hero-title">Groundwater NOC Services</h1>
                <p className="public-hero-subtitle">
                    Comprehensive management for Industrial, Infrastructure, and Mining projects seeking groundwater abstraction permissions.
                </p>
                <button
                    onClick={() => navigate('?register=true&service=water_abstractor')}
                    className="public-cta-button"
                >
                    Apply Now
                </button>
            </div>

            <div className="public-content-container">
                <div className="public-feature-grid">
                    <div className="public-feature-card">
                        <div className="public-feature-icon">🏭</div>
                        <h3 className="public-feature-title">Industrial Projects</h3>
                        <p className="public-feature-desc">
                            For industries requiring groundwater for manufacturing, processing, or cooling purposes. Calculate your water budget and apply for NOC.
                        </p>
                    </div>
                    <div className="public-feature-card">
                        <div className="public-feature-icon">🏗️</div>
                        <h3 className="public-feature-title">Infrastructure Projects</h3>
                        <p className="public-feature-desc">
                            For residential townships, offices, malls, and other infrastructure developments. Ensure compliance with urban water guidelines.
                        </p>
                    </div>
                    <div className="public-feature-card">
                        <div className="public-feature-icon">⛏️</div>
                        <h3 className="public-feature-title">Mining Projects</h3>
                        <p className="public-feature-desc">
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
    );
};

export default GroundwaterServices;

