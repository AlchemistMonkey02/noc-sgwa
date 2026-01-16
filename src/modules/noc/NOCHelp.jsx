import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CommonPlaceholder from './components/CommonPlaceholder';

const NOCHelp = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'contact';

    const tabs = [
        { id: 'manual', label: 'User Manual' },
        { id: 'faq', label: 'FAQ' },
        { id: 'videos', label: 'Video Tutorials' },
        { id: 'contact', label: 'Contact Support' }
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    return (
        <CommonPlaceholder
            title="Help & Support"
            subtitle="Guides, FAQs and contact information"
            breadcrumb="Help"
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
        >
            <div style={{ padding: '0 2rem' }}>
                {currentTab === 'manual' && (
                    <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">User Manuals & Guidelines</h2>
                        </div>
                        <div className="card-content-area">
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0' }}>Comprehensive User Manual V2.0</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Complete guide to using the portal (PDF, 5.2 MB)</p>
                                    </div>
                                    <button className="bhuneer-secondary-btn">Download</button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0' }}>Self-Compliance Submission Guide</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Step-by-step instructions for compliance (PDF, 2.1 MB)</p>
                                    </div>
                                    <button className="bhuneer-secondary-btn">Download</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'faq' && (
                    <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Frequently Asked Questions</h2>
                        </div>
                        <div className="card-content-area">
                            <details style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                <summary style={{ fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem' }}>How long is the NOC valid for?</summary>
                                <p style={{ margin: 0, color: '#64748b', paddingLeft: '1rem' }}>The validity of NOC varies based on the category: 5 years for Infrastructure/Mining, and renewal is required 90 days before expiry.</p>
                            </details>
                            <details style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                <summary style={{ fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem' }}>Can I modify my application after submission?</summary>
                                <p style={{ margin: 0, color: '#64748b', paddingLeft: '1rem' }}>No, once submitted, the application cannot be modified. However, if the officer raises a query, you can provide clarifications.</p>
                            </details>
                            <details>
                                <summary style={{ fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem' }}>What is the fee for NOC processing?</summary>
                                <p style={{ margin: 0, color: '#64748b', paddingLeft: '1rem' }}>Processing fee depends on the quantum of water abstraction. Use the Fee Calculator on the home page for estimates.</p>
                            </details>
                        </div>
                    </div>
                )}

                {currentTab === 'videos' && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                        <h3>Video Tutorials</h3>
                        <p className="text-gray">Video walkthroughs will be uploaded soon.</p>
                    </div>
                )}

                {currentTab === 'contact' && (
                    <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Contact Support</h2>
                        </div>
                        <div className="card-content-area">
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Need assistance? We are here to help.</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📞</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>Helpline Number</p>
                                        <p style={{ margin: 0, color: '#1d4ed8' }}>011-23383561</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>✉️</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>Email Support</p>
                                        <p style={{ margin: 0, color: '#1d4ed8' }}>helpdesk-cgwa@gov.in</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📍</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>Office Address</p>
                                        <p style={{ margin: 0, color: '#64748b' }}>Jamnagar House, Mansingh Road, New Delhi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CommonPlaceholder>
    );
};

export default NOCHelp;
