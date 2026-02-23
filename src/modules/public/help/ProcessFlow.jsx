import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProcessFlowComponent from '../../../components/ProcessFlow';
import './styles/help-pages.css';

const ProcessFlow = () => {
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('pf-page-visible');
                    }
                });
            },
            { threshold: 0.08 }
        );
        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => sectionRefs.current.forEach((el) => el && observer.unobserve(el));
    }, []);

    const addRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
    };

    const quickSteps = [
        { title: 'Register', description: 'Create applicant account', status: 'completed', icon: '👤' },
        { title: 'Prepare Docs', description: 'Gather requirements', status: 'completed', icon: '📄' },
        { title: 'Submit', description: 'Fill & upload docs', status: 'active', icon: '📝' },
        { title: 'Verify', description: 'Authority check', status: 'pending', icon: '✅' },
        { title: 'Inspect', description: 'On-site verification', status: 'pending', icon: '🔍' },
        { title: 'Pay & Approve', description: 'Fees & Final NOC', status: 'pending', icon: '💳' },
        { title: 'Download', description: 'Get certificate', status: 'pending', icon: '📥' }
    ];

    const detailedSteps = [
        {
            number: 1, title: 'Registration',
            description: 'Create your account on the portal with mobile number and email verification.',
            duration: '5 – 10 minutes', icon: '👤',
            tips: ['Keep Aadhaar & mobile handy', 'Use a valid email for OTP']
        },
        {
            number: 2, title: 'Document Preparation',
            description: 'Gather all required documents including land records, project details, and identity proofs.',
            duration: '1 – 2 days', icon: '📄',
            tips: ['Ensure documents are clear scans', 'Max file size: 5 MB each']
        },
        {
            number: 3, title: 'Application Submission',
            description: 'Fill the complete application form with project details and upload all required documents.',
            duration: '30 – 45 minutes', icon: '📝',
            tips: ['Save draft frequently', 'Double-check coordinates']
        },
        {
            number: 4, title: 'Document Verification',
            description: 'The authority verifies submitted documents for completeness and authenticity.',
            duration: '3 – 5 working days', icon: '✅',
            tips: ['Track status on dashboard', 'Respond promptly to queries']
        },
        {
            number: 5, title: 'Site Inspection',
            description: 'Physical verification of site and groundwater extraction setup (if required).',
            duration: '5 – 7 working days', icon: '🔍',
            tips: ['Ensure site access', 'Keep documents on-site']
        },
        {
            number: 6, title: 'Payment',
            description: 'Pay processing fees online through the secure payment gateway.',
            duration: '15 minutes', icon: '💳',
            tips: ['UPI, Card & Net Banking accepted', 'Save receipt for records']
        },
        {
            number: 7, title: 'NOC Approval',
            description: 'Authority reviews the complete application and approves the NOC based on guidelines.',
            duration: '10 – 15 working days', icon: '✓',
            tips: ['You will receive SMS & email', 'Check validity period']
        },
        {
            number: 8, title: 'Certificate Download',
            description: 'Download your digitally signed NOC certificate directly from the dashboard.',
            duration: 'Instant', icon: '📥',
            tips: ['Certificate is digitally signed', 'Download PDF for records']
        }
    ];

    const totalMinDays = '20';
    const totalMaxDays = '30';

    return (
        <div className="help-page">
            <div className="help-container-wide pf-page-root">

                {/* Breadcrumb */}
                <nav className="help-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-sep">/</span>
                    <span>Process Flow</span>
                </nav>

                {/* Hero header */}
                <header className="pf-hero" ref={addRef}>
                    <div className="pf-hero-badge">Step-by-Step Guide</div>
                    <h1 className="pf-hero-title">NOC Application Process</h1>
                    <p className="pf-hero-subtitle">
                        Follow the complete journey from registration to downloading your
                        Groundwater NOC certificate — typically completed within <strong>{totalMinDays}–{totalMaxDays} working days</strong>.
                    </p>
                    <div className="pf-hero-stats">
                        <div className="pf-stat">
                            <span className="pf-stat-value">8</span>
                            <span className="pf-stat-label">Total Steps</span>
                        </div>
                        <div className="pf-stat-divider" />
                        <div className="pf-stat">
                            <span className="pf-stat-value">{totalMinDays}–{totalMaxDays}</span>
                            <span className="pf-stat-label">Working Days</span>
                        </div>
                        <div className="pf-stat-divider" />
                        <div className="pf-stat">
                            <span className="pf-stat-value">100%</span>
                            <span className="pf-stat-label">Online Process</span>
                        </div>
                    </div>
                </header>

                {/* Quick Overview Timeline */}
                <section ref={addRef} className="pf-section-animate">
                    <ProcessFlowComponent title="Quick Overview" steps={quickSteps} />
                </section>

                {/* Detailed Steps */}
                <section className="pf-detailed-section" ref={addRef}>
                    <div className="pf-detailed-header pf-section-animate">
                        <span className="pf-detailed-badge">Detailed Breakdown</span>
                        <h2>Application Timeline</h2>
                        <p>Each stage explained with estimated duration and helpful tips.</p>
                    </div>

                    <div className="pf-detailed-grid">
                        {detailedSteps.map((step, idx) => (
                            <div
                                key={step.number}
                                className="pf-detail-card pf-section-animate"
                                ref={addRef}
                                style={{ transitionDelay: `${idx * 60}ms` }}
                            >
                                <div className="pf-detail-accent" />
                                <div className="pf-detail-top">
                                    <div>
                                        <span className="pf-detail-stage">Stage {step.number}</span>
                                        <h3>{step.title}</h3>
                                    </div>
                                    <span className="pf-detail-icon">{step.icon}</span>
                                </div>
                                <p className="pf-detail-desc">{step.description}</p>

                                {step.tips && step.tips.length > 0 && (
                                    <ul className="pf-detail-tips">
                                        {step.tips.map((tip, i) => (
                                            <li key={i}>{tip}</li>
                                        ))}
                                    </ul>
                                )}

                                <div className="pf-detail-footer">
                                    <div className="pf-detail-duration">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span className="pf-dur-label">Duration:</span>
                                        <span className="pf-dur-value">{step.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Important Notes */}
                <section className="pf-notes pf-section-animate" ref={addRef}>
                    <div className="pf-notes-icon">📌</div>
                    <div>
                        <h3>Important Notes</h3>
                        <ul>
                            <li>Processing time may vary based on application complexity and document completeness.</li>
                            <li>Site inspection is required for extraction above certain prescribed limits.</li>
                            <li>Incomplete applications will be returned for correction with specific remarks.</li>
                            <li>Track your application status in real-time from the dashboard.</li>
                            <li>All communications are sent via registered email and SMS.</li>
                        </ul>
                    </div>
                </section>

                {/* Bottom actions */}
                <div className="help-actions">
                    <Link to="/" className="btn-secondary">← Back to Home</Link>
                    <Link to="/help/documents" className="btn-primary">Required Documents →</Link>
                </div>
            </div>
        </div>
    );
};

export default ProcessFlow;
