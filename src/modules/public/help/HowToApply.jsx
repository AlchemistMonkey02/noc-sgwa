import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/help-pages.css';

const HowToApply = () => {
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('ha-visible');
                });
            },
            { threshold: 0.06 }
        );
        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => sectionRefs.current.forEach((el) => el && observer.unobserve(el));
    }, []);

    const addRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
    };

    const applicationSteps = [
        {
            step: 1, title: 'Create Account', icon: '👤',
            description: 'Register on the portal with your email and mobile number',
            details: ['Visit the portal homepage', 'Click "Create New Account"', 'Fill personal details (Name, Email, Mobile)', 'Verify email & mobile via OTP', 'Set a strong password', 'Complete your profile'],
            tips: ['Use a valid email you check regularly', 'Remember your credentials for future login']
        },
        {
            step: 2, title: 'Prepare Documents', icon: '📁',
            description: 'Gather all required documents before starting',
            details: ['Review the Required Documents page', 'Scan all physical documents in PDF', 'Ensure scans are clear and legible', 'Check file sizes (max 5 MB per file)', 'Name files descriptively', 'Keep digital copies organized'],
            tips: ['Compress large files using online tools', 'Double-check all documents are current']
        },
        {
            step: 3, title: 'Start Application', icon: '📝',
            description: 'Login and begin filling your NOC application form',
            details: ['Login to your account', 'Navigate to NOC Dashboard', 'Click "Apply for New NOC"', 'Select type (Groundwater / Rig / Vendor)', 'Choose appropriate sub-category', 'Form opens in structured sections'],
            tips: ['Save progress frequently', 'Application auto-saves every few minutes']
        },
        {
            step: 4, title: 'Fill Form Sections', icon: '✍️',
            description: 'Complete all form sections with accurate information',
            details: ['Section 1: Personal / Company Info', 'Section 2: Site / Project Details', 'Section 3: Water Requirement Details', 'Section 4: Hydrogeological Information', 'Review all entered information', 'Fix any validation errors shown'],
            tips: ['All fields marked * are mandatory', 'Provide accurate GPS coordinates for site']
        },
        {
            step: 5, title: 'Upload Documents', icon: '📤',
            description: 'Upload all required supporting documents',
            details: ['Go to Documents section', 'Upload each document type', 'Verify uploaded files are correct', 'Delete and re-upload if needed', 'Ensure all mandatory docs are uploaded', 'Add optional documents if applicable'],
            tips: ['Upload in the order listed', 'Preview files before submission']
        },
        {
            step: 6, title: 'Review & Submit', icon: '✅',
            description: 'Final review and submission of your application',
            details: ['Review application summary', 'Verify all sections are complete', 'Read terms and conditions', 'Check the "I agree" checkbox', 'Click "Submit Application"', 'Note down your Application ID'],
            tips: ['Screenshot the confirmation page', 'Check email for acknowledgment']
        },
        {
            step: 7, title: 'Track Status', icon: '📊',
            description: 'Monitor your application progress in real-time',
            details: ['Login to your dashboard', 'View status in real-time', 'Check for pending actions', 'Respond to clarifications promptly', 'Upload additional docs if requested', 'Receive email / SMS notifications'],
            tips: ['Check status daily during processing', 'Keep contact details updated']
        },
        {
            step: 8, title: 'Make Payment', icon: '💳',
            description: 'Pay processing fees when requested',
            details: ['Wait for payment request notification', 'Go to pending payments', 'Review fee details', 'Choose payment method', 'Complete payment securely', 'Download payment receipt'],
            tips: ['Payment gateway is SSL encrypted', 'Keep receipt for records']
        },
        {
            step: 9, title: 'Site Inspection', icon: '🔍',
            description: 'Cooperate during site verification (if required)',
            details: ['You will be notified of inspection date', 'Ensure site is accessible', 'Keep required documents ready', 'Be available or designate representative', 'Provide additional info if requested', 'Report uploaded to your account'],
            tips: ['Coordinate with inspector for timing', 'Prepare site beforehand']
        },
        {
            step: 10, title: 'Receive NOC', icon: '🎉',
            description: 'Download your approved NOC certificate',
            details: ['Receive approval notification', 'Login to your dashboard', 'Go to approved applications', 'Download NOC certificate (PDF)', 'Verify all details in certificate', 'Take printout for your records'],
            tips: ['Certificate is digitally signed', 'Note validity period & renewal date']
        }
    ];

    const reminders = [
        { icon: '⚡', text: 'Complete applications are processed faster' },
        { icon: '🔖', text: 'Save your application ID for future reference' },
        { icon: '📧', text: 'Check your email regularly for updates' },
        { icon: '⏰', text: 'Respond to clarifications within 7 days' },
        { icon: '💾', text: 'Keep digital copies of all submitted documents' }
    ];

    return (
        <div className="help-page">
            <div className="help-container-wide ha-page-root">

                {/* Breadcrumb */}
                <nav className="help-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-sep">/</span>
                    <span>How to Apply</span>
                </nav>

                {/* Hero */}
                <header className="ha-hero ha-animate" ref={addRef}>
                    <div className="ha-hero-badge">Step-by-Step Guide</div>
                    <h1 className="ha-hero-title">Complete Application Guide</h1>
                    <p className="ha-hero-subtitle">
                        Follow these {applicationSteps.length} simple steps to submit your Groundwater NOC
                        application online. Each step includes detailed instructions and pro tips.
                    </p>
                    <div className="ha-hero-stats">
                        <div className="ha-stat">
                            <span className="ha-stat-value">{applicationSteps.length}</span>
                            <span className="ha-stat-label">Steps</span>
                        </div>
                        <span className="ha-stat-divider" />
                        <div className="ha-stat">
                            <span className="ha-stat-value">~30</span>
                            <span className="ha-stat-label">Minutes</span>
                        </div>
                        <span className="ha-stat-divider" />
                        <div className="ha-stat">
                            <span className="ha-stat-value">100%</span>
                            <span className="ha-stat-label">Online</span>
                        </div>
                    </div>
                </header>

                {/* Steps Timeline */}
                <div className="ha-timeline">
                    {applicationSteps.map((item, idx) => (
                        <div
                            key={idx}
                            className="ha-step ha-animate"
                            ref={addRef}
                            style={{ transitionDelay: `${(idx % 3) * 60}ms` }}
                        >
                            {/* Timeline spine */}
                            <div className="ha-spine">
                                <div className="ha-step-num">{item.step}</div>
                                {idx < applicationSteps.length - 1 && <div className="ha-spine-line" />}
                            </div>

                            {/* Card */}
                            <div className="ha-step-card">
                                <div className="ha-step-head">
                                    <span className="ha-step-icon">{item.icon}</span>
                                    <div>
                                        <h3 className="ha-step-title">{item.title}</h3>
                                        <p className="ha-step-desc">{item.description}</p>
                                    </div>
                                </div>

                                <div className="ha-step-body">
                                    {/* Details */}
                                    <div className="ha-details">
                                        <h4 className="ha-sub-heading">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                            What to do
                                        </h4>
                                        <ul className="ha-checklist">
                                            {item.details.map((d, i) => (
                                                <li key={i}>{d}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Tips */}
                                    <div className="ha-tips-box">
                                        <h4 className="ha-sub-heading ha-tip-heading">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                            Pro Tips
                                        </h4>
                                        <ul className="ha-tips-list">
                                            {item.tips.map((t, i) => (
                                                <li key={i}>{t}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Reminders */}
                <section className="ha-reminders ha-animate" ref={addRef}>
                    <div className="ha-section-header">
                        <span className="ha-section-badge">Reminders</span>
                        <h2>Quick Reminders</h2>
                    </div>
                    <div className="ha-reminders-grid">
                        {reminders.map((r, idx) => (
                            <div key={idx} className="ha-reminder-item ha-animate" ref={addRef} style={{ transitionDelay: `${idx * 50}ms` }}>
                                <span className="ha-rem-icon">{r.icon}</span>
                                <span className="ha-rem-text">{r.text}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <div className="help-actions">
                    <Link to="/help/contact" className="btn-secondary">← Contact Us</Link>
                    <Link to="/" className="btn-primary">Start Application →</Link>
                </div>
            </div>
        </div>
    );
};

export default HowToApply;
