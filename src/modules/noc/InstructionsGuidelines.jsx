import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const FAQ_DATA = [
    {
        category: 'General Information',
        questions: [
            {
                q: 'Who needs to register a drilling rig in Rajasthan?',
                a: 'All individuals, firms, or companies operating drilling rigs for groundwater extraction in Rajasthan must register with the Rajasthan Ground Water Department.'
            },
            {
                q: 'What is the validity period of rig registration?',
                a: 'Rig registration is valid for 3 years from the date of issuance. It must be renewed before expiry to continue operations.'
            },
            {
                q: 'What are the registration fees?',
                a: 'The registration fee is ₹10,000 + 18% GST (total ₹11,800). Renewal fees are ₹5,000 + GST. Late renewal attracts an additional penalty of ₹2,000.'
            }
        ]
    },
    {
        category: 'Application Process',
        questions: [
            {
                q: 'How do I apply for rig registration?',
                a: 'Create an account on the RGSWA portal, fill the online registration form, upload required documents, pay the registration fee, and submit the application. The department will verify and process your application within 15-30 days.'
            },
            {
                q: 'What documents are required for registration?',
                a: 'Required documents include: Valid ID proof, business registration certificate, technical specifications of rig(s), manufacturer\'s certificate, proof of ownership/lease, insurance certificate, operator qualification certificates, and GST registration.'
            },
            {
                q: 'Can I track my application status?',
                a: 'Yes, you can track your application status using the Application ID provided after submission. Login to your account or use the public tracking page.'
            }
        ]
    },
    {
        category: 'Compliance & Operations',
        questions: [
            {
                q: 'What are the compliance requirements?',
                a: 'Registered agencies must maintain: Annual safety inspection reports, quarterly equipment maintenance logs, valid operator training certificates, current insurance policies, and half-yearly environmental compliance reports.'
            },
            {
                q: 'Can I operate in multiple districts?',
                a: 'Yes, you can specify multiple districts in your operation permit application. Each district may have specific regulations that must be followed.'
            },
            {
                q: 'What happens if my registration expires?',
                a: 'Operating with an expired registration is non-compliant and may result in penalties. You must renew your registration before expiry. Late renewals attract additional fees.'
            }
        ]
    },
    {
        category: 'Permits & Renewals',
        questions: [
            {
                q: 'What\'s the difference between registration and permit?',
                a: 'Registration certifies your drilling rig and agency. A permit authorizes specific drilling operations in designated areas. Both are required for legal operations.'
            },
            {
                q: 'When should I apply for renewal?',
                a: 'Submit renewal applications at least 90 days before the expiry date to ensure uninterrupted operations.'
            },
            {
                q: 'Can I amend my registration details?',
                a: 'Yes, you can apply for amendments to update registration details. Submit an amendment application with updated documents and pay the amendment fee of ₹5,000 + GST.'
            }
        ]
    }
];

const DOWNLOAD_FORMS = [
    { name: 'Rig Registration Application Form', format: 'PDF', size: '245 KB' },
    { name: 'Operation Permit Application Form', format: 'PDF', size: '198 KB' },
    { name: 'Renewal Application Form', format: 'PDF', size: '156 KB' },
    { name: 'Amendment Request Form', format: 'PDF', size: '142 KB' },
    { name: 'Document Checklist', format: 'PDF', size: '89 KB' },
    { name: 'Compliance Report Template', format: 'Excel', size: '67 KB' }
];

const IMPORTANT_LINKS = [
    { title: 'Groundwater Act, Rajasthan', url: '#' },
    { title: 'Drilling Safety Guidelines', url: '#' },
    { title: 'Environmental Compliance Norms', url: '#' },
    { title: 'Fee Structure & Payment Guidelines', url: '#' },
    { title: 'Contact Directory - Department Offices', url: '#' }
];

const InstructionsGuidelines = () => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const toggleQuestion = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedQuestion(expandedQuestion === key ? null : key);
    };

    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
            <NOCHeader />

            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: '#0f4c81', fontSize: '2.2rem', fontWeight: '700', margin: '0 0 15px 0' }}>
                        Instructions & Guidelines
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Comprehensive guide to rig registration, permits, and compliance
                    </p>
                </div>

                {/* Quick Start Guide */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
                    padding: '35px',
                    borderRadius: '12px',
                    marginBottom: '40px',
                    color: 'white'
                }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 20px 0' }}>🚀 Quick Start Guide</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>1️⃣</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>Create Account</h3>
                            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Register on the portal with valid email and mobile number
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>2️⃣</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>Prepare Documents</h3>
                            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Gather all required documents in PDF format
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>3️⃣</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>Submit Application</h3>
                            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Fill the form, upload documents, and pay fees
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>4️⃣</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>Track Status</h3>
                            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Monitor application progress and download certificate
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Frequently Asked Questions
                    </h2>

                    {/* Category Tabs */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        {FAQ_DATA.map((cat, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveCategory(index)}
                                style={{
                                    padding: '12px 24px',
                                    background: activeCategory === index ? '#1e3a8a' : 'white',
                                    color: activeCategory === index ? 'white' : '#64748b',
                                    border: activeCategory === index ? 'none' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {cat.category}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Accordion */}
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {FAQ_DATA[activeCategory].questions.map((faq, qIndex) => {
                            const key = `${activeCategory}-${qIndex}`;
                            const isExpanded = expandedQuestion === key;

                            return (
                                <div
                                    key={qIndex}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 6px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <button
                                        onClick={() => toggleQuestion(activeCategory, qIndex)}
                                        style={{
                                            width: '100%',
                                            padding: '18px 20px',
                                            background: isExpanded ? '#f8fafc' : 'white',
                                            border: 'none',
                                            textAlign: 'left',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            gap: '15px'
                                        }}
                                    >
                                        <span style={{ color: '#0f4c81', fontWeight: '700', fontSize: '0.95rem', flex: 1 }}>
                                            {faq.q}
                                        </span>
                                        <span style={{ fontSize: '1.2rem', color: '#64748b', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                            ▼
                                        </span>
                                    </button>
                                    {isExpanded && (
                                        <div style={{ padding: '0 20px 20px 20px', color: '#475569', fontSize: '0.9rem', lineHeight: '1.7' }}>
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Downloadable Forms */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        📥 Downloadable Forms & Templates
                    </h2>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0'
                    }}>
                        {DOWNLOAD_FORMS.map((form, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '18px 20px',
                                    borderBottom: index < DOWNLOAD_FORMS.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '20px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div>
                                    <div style={{ color: '#0f4c81', fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                                        {form.name}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                        {form.format} • {form.size}
                                    </div>
                                </div>
                                <button style={{
                                    padding: '8px 20px',
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}>
                                    ⬇ Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Links */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        🔗 Important Links & Resources
                    </h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {IMPORTANT_LINKS.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '18px 20px',
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                                }}
                            >
                                <span style={{ color: '#0f4c81', fontWeight: '600', fontSize: '0.95rem' }}>{link.title}</span>
                                <span style={{ color: '#64748b', fontSize: '1.2rem' }}>→</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Contact Information */}
                <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    padding: '35px',
                    borderRadius: '12px',
                    border: '2px solid #bfdbfe'
                }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 20px 0', textAlign: 'center' }}>
                        📞 Need Help?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📧</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '5px' }}>Email Support</div>
                            <div style={{ color: '#0f4c81', fontWeight: '700', fontSize: '0.9rem' }}>support@rgswa.gov.in</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📞</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '5px' }}>Helpline</div>
                            <div style={{ color: '#0f4c81', fontWeight: '700', fontSize: '0.9rem' }}>1800-XXX-XXXX</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🕐</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '5px' }}>Office Hours</div>
                            <div style={{ color: '#0f4c81', fontWeight: '700', fontSize: '0.9rem' }}>Mon-Fri, 10 AM - 6 PM</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/noc/login" style={{
                            display: 'inline-block',
                            padding: '12px 35px',
                            background: '#1e3a8a',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                        }}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default InstructionsGuidelines;
