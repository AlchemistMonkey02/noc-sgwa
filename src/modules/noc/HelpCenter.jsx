import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const HelpCenter = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');

    const faqs = [
        { q: 'How to apply for a fresh NOC?', a: 'Navigate to Dashboard → Applications → Apply For Fresh Application and fill out the required form with all necessary documents.' },
        { q: 'What documents are required for NOC application?', a: 'Identity proof, land ownership documents, water budget calculation, piezometer installation certificate, and environmental clearance (if applicable).' },
        { q: 'How long does NOC approval take?', a: 'Typically 30-45 days from the date of submitting a complete application with all required documents.' },
        { q: 'How to check my application status?', a: 'Go to Dashboard → Track Application Status and enter your application ID to view the current status and timeline.' }
    ];

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Home</Link>
                        <span className="separator">›</span>
                        <span className="current">Help Center</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">💡 Help Center</h1>
                        <p className="page-subtitle">Find help, resources, and support</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <div className="tabs-container">
                                <button
                                    className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('manual')}
                                >
                                    📖 User Manual
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('faq')}
                                >
                                    ❔ FAQ
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('videos')}
                                >
                                    🎥 Video Tutorials
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('contact')}
                                >
                                    📞 Contact Support
                                </button>
                            </div>
                        </div>

                        <div className="card-content-area">
                            {activeTab === 'manual' && (
                                <div className="help-section">
                                    <div className="pdf-viewer-placeholder" style={{
                                        padding: '60px 40px',
                                        textAlign: 'center',
                                        background: '#f8fafc',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📖</div>
                                        <h3 style={{ color: '#1e293b', marginBottom: '12px' }}>User Manual</h3>
                                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Comprehensive guide for using the SGWA NOC Portal</p>
                                        <button className="btn-primary">📥 Download User Manual (PDF)</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faq' && (
                                <div className="faq-section">
                                    <div className="search-box" style={{ marginBottom: '24px' }}>
                                        <input
                                            type="text"
                                            placeholder="🔍 Search FAQs..."
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                    <div className="faq-list">
                                        {faqs.map((faq, index) => (
                                            <details key={index} className="faq-item" style={{
                                                marginBottom: '12px',
                                                padding: '16px',
                                                background: '#f8fafc',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <summary style={{
                                                    fontWeight: 600,
                                                    color: '#1e293b',
                                                    cursor: 'pointer',
                                                    marginBottom: '8px'
                                                }}>
                                                    {faq.q}
                                                </summary>
                                                <p style={{ color: '#64748b', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                                                    {faq.a}
                                                </p>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'videos' && (
                                <div className="videos-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {['How to Apply for NOC', 'Submitting Compliance Reports', 'Payment Process', 'Query Resolution'].map((title, idx) => (
                                        <div key={idx} className="video-card" style={{
                                            background: '#f8fafc',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{
                                                height: '160px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3rem',
                                                color: 'white'
                                            }}>
                                                ▶️
                                            </div>
                                            <div style={{ padding: '16px' }}>
                                                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{title}</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Duration: 5:30</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="contact-section">
                                    <div className="contact-info" style={{ marginBottom: '30px' }}>
                                        <h3 style={{ color: '#1e293b', marginBottom: '16px' }}>📞 Contact Information</h3>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px' }}>
                                                <strong style={{ color: '#475569' }}>Helpline:</strong> <span style={{ color: '#3b82f6' }}>0141-2227xxx</span>
                                            </div>
                                            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px' }}>
                                                <strong style={{ color: '#475569' }}>Email:</strong> <span style={{ color: '#3b82f6' }}>support@sgwa.rajasthan.gov.in</span>
                                            </div>
                                            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px' }}>
                                                <strong style={{ color: '#475569' }}>Office Hours:</strong> <span>Mon-Fri, 9:30 AM - 6:00 PM</span>
                                            </div>
                                        </div>
                                    </div>

                                    <form className="contact-form">
                                        <h3 style={{ color: '#1e293b', marginBottom: '16px' }}>✉️ Send us a Message</h3>
                                        <div className="form-group">
                                            <label>Subject *</label>
                                            <input type="text" placeholder="Brief description of your query" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Message *</label>
                                            <textarea rows="5" placeholder="Describe your query in detail..." required></textarea>
                                        </div>
                                        <button type="submit" className="btn-primary">📤 Send Message</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default HelpCenter;
