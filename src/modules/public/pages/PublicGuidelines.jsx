import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import '../styles/public-landing.css';

const PublicGuidelines = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('act');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [location]);

    return (
        <div className="gov-portal">
            <PublicHeader />

            <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 className="section-title">Guidelines & Notifications</h1>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Vertical Tabs */}
                    <div style={{ width: '250px', flexShrink: 0 }}>
                        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div
                                onClick={() => setActiveTab('act')}
                                style={{ padding: '15px 20px', cursor: 'pointer', background: activeTab === 'act' ? '#1e3a8a' : 'white', color: activeTab === 'act' ? 'white' : '#334155', borderBottom: '1px solid #e2e8f0' }}
                            >
                                ➤ Groundwater Act
                            </div>
                            <div
                                onClick={() => setActiveTab('fee')}
                                style={{ padding: '15px 20px', cursor: 'pointer', background: activeTab === 'fee' ? '#1e3a8a' : 'white', color: activeTab === 'fee' ? 'white' : '#334155', borderBottom: '1px solid #e2e8f0' }}
                            >
                                ➤ Fee Structure
                            </div>
                            <div
                                onClick={() => setActiveTab('eligibility')}
                                style={{ padding: '15px 20px', cursor: 'pointer', background: activeTab === 'eligibility' ? '#1e3a8a' : 'white', color: activeTab === 'eligibility' ? 'white' : '#334155', borderBottom: '1px solid #e2e8f0' }}
                            >
                                ➤ Eligibility Criteria
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, background: 'white', padding: '2rem', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '500px' }}>

                        {activeTab === 'act' && (
                            <div>
                                <h2 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>Rajasthan Groundwater Act</h2>
                                <p style={{ marginBottom: '1rem', color: '#475569', lineHeight: '1.6' }}>
                                    The Rajasthan Groundwater (regulation and control of development and management) Act, 2026 aims to regulate and control the development and management of groundwater resources in the State.
                                </p>
                                <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #1e3a8a' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Key Provisions</h3>
                                    <ul style={{ paddingLeft: '20px', color: '#475569' }}>
                                        <li style={{ marginBottom: '0.5rem' }}>Mandatory registration for all existing and new groundwater abstraction structures.</li>
                                        <li style={{ marginBottom: '0.5rem' }}>Prohibition of drilling in notified areas without prior permission.</li>
                                        <li style={{ marginBottom: '0.5rem' }}>Installation of digital flow meters and telemetry systems for monitoring.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'fee' && (
                            <div>
                                <h2 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>Fee Structure (Effective Jan 2026)</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                    <thead>
                                        <tr style={{ background: '#eff6ff' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Category</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Application Fee</th>
                                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Processing Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>Industrial (Small)</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 1,000</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 5,000</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>Industrial (Large)</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 5,000</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 25,000</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>Infrastructure</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 2,000</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 10,000</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>Mining</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 10,000</td>
                                            <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>₹ 50,000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'eligibility' && (
                            <div>
                                <h2 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>Eligibility Criteria for NOC</h2>
                                <p style={{ marginBottom: '1rem', color: '#475569' }}>
                                    Entities must meet the following criteria to be eligible for Groundwater Abstraction NOC:
                                </p>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>1. Land Ownership</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Applicant must have valid land ownership documents or lease agreement for the proposed site.</p>
                                    </div>
                                    <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>2. Water Audit</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>For abstraction &gt; 100 KLD, a mandatory annual water audit by a certified auditor is required.</p>
                                    </div>
                                    <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>3. Rainwater Harvesting</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Implementation of rainwater harvesting structures is mandatory as per state guidelines.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicGuidelines;
