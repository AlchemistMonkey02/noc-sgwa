import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/help-pages.css';

const Timelines = () => {
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('tl-visible');
                });
            },
            { threshold: 0.1 }
        );
        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => sectionRefs.current.forEach((el) => el && observer.unobserve(el));
    }, []);

    const addRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el);
    };

    const timelines = [
        {
            type: 'New Groundwater NOC',
            icon: '🆕',
            color: '#2563eb',
            colorLight: '#eff6ff',
            colorBorder: '#bfdbfe',
            stages: [
                { name: 'Document Verification', duration: '3-5 days', icon: '📋' },
                { name: 'Site Inspection', duration: '5-7 days', icon: '🔍' },
                { name: 'Technical Review', duration: '7-10 days', icon: '⚙️' },
                { name: 'Approval', duration: '3-5 days', icon: '✅' }
            ],
            total: '18-27 working days'
        },
        {
            type: 'NOC Renewal',
            icon: '🔄',
            color: '#059669',
            colorLight: '#ecfdf5',
            colorBorder: '#a7f3d0',
            stages: [
                { name: 'Document Verification', duration: '2-3 days', icon: '📋' },
                { name: 'Compliance Check', duration: '3-5 days', icon: '📊' },
                { name: 'Approval', duration: '2-3 days', icon: '✅' }
            ],
            total: '7-11 working days'
        },
        {
            type: 'Rig Registration',
            icon: '🔧',
            color: '#7c3aed',
            colorLight: '#f5f3ff',
            colorBorder: '#c4b5fd',
            stages: [
                { name: 'Document Verification', duration: '2-3 days', icon: '📋' },
                { name: 'Technical Verification', duration: '3-4 days', icon: '🛠️' },
                { name: 'Approval', duration: '1-2 days', icon: '✅' }
            ],
            total: '6-9 working days'
        }
    ];

    const factorsData = [
        { icon: '📄', title: 'Document Quality', desc: 'Complete and clear documents expedite processing' },
        { icon: '📂', title: 'Application Type', desc: 'Complex applications require more review time' },
        { icon: '📍', title: 'Site Accessibility', desc: 'Remote locations may delay inspections' },
        { icon: '🌧️', title: 'Peak Season', desc: 'Higher application volumes during monsoon season' },
        { icon: '❓', title: 'Clarifications', desc: 'Additional information requests extend the timeline' },
        { icon: '📅', title: 'Public Holidays', desc: 'Excludes weekends and government holidays' }
    ];

    const tips = [
        'Submit complete applications with all required documents',
        'Ensure all documents are clear and legible',
        'Respond quickly to any clarification requests',
        'Track your application status regularly on the dashboard'
    ];

    return (
        <div className="help-page">
            <div className="help-container-wide tl-page-root">

                {/* Breadcrumb */}
                <nav className="help-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-sep">/</span>
                    <span>Expected Timelines</span>
                </nav>

                {/* Hero */}
                <header className="tl-hero tl-animate" ref={addRef}>
                    <div className="tl-hero-badge">Estimated Durations</div>
                    <h1 className="tl-hero-title">Processing Timelines</h1>
                    <p className="tl-hero-subtitle">
                        Understand the expected processing duration for each application type — from
                        submission to final approval.
                    </p>
                </header>

                {/* Timeline Cards */}
                <div className="tl-cards-grid">
                    {timelines.map((tl, idx) => (
                        <div
                            key={idx}
                            className="tl-card tl-animate"
                            ref={addRef}
                            style={{
                                '--tl-accent': tl.color,
                                '--tl-accent-light': tl.colorLight,
                                '--tl-accent-border': tl.colorBorder,
                                transitionDelay: `${idx * 100}ms`
                            }}
                        >
                            {/* Card header */}
                            <div className="tl-card-head">
                                <span className="tl-card-icon">{tl.icon}</span>
                                <h3 className="tl-card-type">{tl.type}</h3>
                            </div>

                            {/* Stages */}
                            <div className="tl-stages">
                                {tl.stages.map((stage, sIdx) => (
                                    <div key={sIdx} className="tl-stage-row">
                                        <div className="tl-stage-left">
                                            <span className="tl-stage-dot" />
                                            {sIdx < tl.stages.length - 1 && <span className="tl-stage-line" />}
                                        </div>
                                        <div className="tl-stage-content">
                                            <div className="tl-stage-info">
                                                <span className="tl-stage-icon">{stage.icon}</span>
                                                <span className="tl-stage-name">{stage.name}</span>
                                            </div>
                                            <span className="tl-stage-duration">{stage.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="tl-card-total">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span className="tl-total-label">Total:</span>
                                <span className="tl-total-value">{tl.total}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Factors Grid */}
                <section className="tl-factors-section tl-animate" ref={addRef}>
                    <div className="tl-section-header">
                        <span className="tl-section-badge tl-badge-amber">Important</span>
                        <h2>Factors Affecting Processing Time</h2>
                    </div>
                    <div className="tl-factors-grid">
                        {factorsData.map((f, i) => (
                            <div key={i} className="tl-factor-item tl-animate" ref={addRef} style={{ transitionDelay: `${i * 70}ms` }}>
                                <span className="tl-factor-icon">{f.icon}</span>
                                <div>
                                    <h4 className="tl-factor-title">{f.title}</h4>
                                    <p className="tl-factor-desc">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tips */}
                <section className="tl-tips tl-animate" ref={addRef}>
                    <div className="tl-tips-header">
                        <span className="tl-tips-icon">💡</span>
                        <h3>Tips to Expedite Processing</h3>
                    </div>
                    <div className="tl-tips-list">
                        {tips.map((tip, i) => (
                            <div key={i} className="tl-tip-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <div className="help-actions">
                    <Link to="/help/process-flow" className="btn-secondary">← Process Flow</Link>
                    <Link to="/help/documents" className="btn-primary">Required Documents →</Link>
                </div>
            </div>
        </div>
    );
};

export default Timelines;
