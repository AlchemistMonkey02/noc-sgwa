import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/help-pages.css';

const Contact = () => {
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('ct-visible');
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

    const offices = [
        {
            name: 'Head Office',
            badge: 'HQ',
            address: ['Rajasthan Ground Water Authority', 'JalShakti Bhawan, Civil Lines', 'Jaipur - 302006, Rajasthan'],
            phone: '+91-141-2227631',
            email: 'cgwa-raj@gov.in',
            hours: 'Mon-Fri: 10:00 AM - 5:00 PM',
            color: '#2563eb'
        },
        {
            name: 'Regional Office - Jodhpur',
            badge: 'Regional',
            address: ['Regional Office', 'PWD Campus, Paota', 'Jodhpur - 342001, Rajasthan'],
            phone: '+91-291-2431234',
            email: 'ro-jodhpur@sgwa.gov.in',
            hours: 'Mon-Fri: 10:00 AM - 5:00 PM',
            color: '#7c3aed'
        },
        {
            name: 'Regional Office - Udaipur',
            badge: 'Regional',
            address: ['Regional Office', 'Surajpole, Udaipur', 'Udaipur - 313001, Rajasthan'],
            phone: '+91-294-2428123',
            email: 'ro-udaipur@sgwa.gov.in',
            hours: 'Mon-Fri: 10:00 AM - 5:00 PM',
            color: '#059669'
        }
    ];

    const helplines = [
        { type: 'Technical Support', number: '1800-180-6666', hours: '24/7', icon: '🛠️', highlight: true },
        { type: 'Grievance Cell', number: '1800-180-7777', hours: 'Mon-Sat: 9 AM - 6 PM', icon: '📢', highlight: false },
        { type: 'NOC Application Help', number: '+91-141-2227631', hours: 'Mon-Fri: 10 AM - 5 PM', icon: '📋', highlight: false }
    ];

    const emails = [
        { label: 'General Inquiries', email: 'info@sgwa.gov.in', icon: '📬' },
        { label: 'Technical Support', email: 'support@sgwa.gov.in', icon: '🔧' },
        { label: 'Complaints & Grievances', email: 'grievance@sgwa.gov.in', icon: '⚖️' }
    ];

    const responseTimes = [
        { channel: 'Phone Support', time: 'Immediate', detail: 'During working hours', icon: '📞' },
        { channel: 'Email Queries', time: '24-48 hrs', detail: 'Working hours response', icon: '✉️' },
        { channel: 'Grievances', time: '3 days', detail: 'Acknowledgment timeline', icon: '📋' },
        { channel: 'Emergency', time: 'Immediate', detail: 'Toll-free 24/7 line', icon: '🚨' }
    ];

    return (
        <div className="help-page">
            <div className="help-container-wide ct-page-root">

                {/* Breadcrumb */}
                <nav className="help-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-sep">/</span>
                    <span>Contact & Helpline</span>
                </nav>

                {/* Hero */}
                <header className="ct-hero ct-animate" ref={addRef}>
                    <div className="ct-hero-badge">Support</div>
                    <h1 className="ct-hero-title">Contact & Helpline</h1>
                    <p className="ct-hero-subtitle">
                        Need assistance? Our team is here to help. Reach out through any of the
                        channels below for prompt support.
                    </p>
                </header>

                {/* Office Locations */}
                <section className="ct-offices ct-animate" ref={addRef}>
                    <div className="ct-section-header">
                        <span className="ct-section-badge ct-badge-blue">Offices</span>
                        <h2>Office Locations</h2>
                    </div>
                    <div className="ct-offices-grid">
                        {offices.map((office, idx) => (
                            <div
                                key={idx}
                                className="ct-office-card ct-animate"
                                ref={addRef}
                                style={{ '--ct-accent': office.color, transitionDelay: `${idx * 80}ms` }}
                            >
                                <div className="ct-office-head">
                                    <h4 className="ct-office-name">{office.name}</h4>
                                    <span className="ct-office-badge">{office.badge}</span>
                                </div>
                                <div className="ct-office-rows">
                                    <div className="ct-office-row">
                                        <span className="ct-row-icon">📍</span>
                                        <div className="ct-row-text">
                                            {office.address.map((line, i) => (
                                                <span key={i}>{line}<br /></span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ct-office-row">
                                        <span className="ct-row-icon">📞</span>
                                        <a href={`tel:${office.phone}`} className="ct-row-link">{office.phone}</a>
                                    </div>
                                    <div className="ct-office-row">
                                        <span className="ct-row-icon">✉️</span>
                                        <a href={`mailto:${office.email}`} className="ct-row-link">{office.email}</a>
                                    </div>
                                    <div className="ct-office-row">
                                        <span className="ct-row-icon">🕐</span>
                                        <span className="ct-row-text">{office.hours}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Helplines */}
                <section className="ct-helplines ct-animate" ref={addRef}>
                    <div className="ct-section-header">
                        <span className="ct-section-badge ct-badge-green">Toll-Free</span>
                        <h2>Helpline Numbers</h2>
                    </div>
                    <div className="ct-helplines-grid">
                        {helplines.map((h, idx) => (
                            <div key={idx} className={`ct-helpline-card ${h.highlight ? 'ct-helpline-highlight' : ''}`}>
                                <span className="ct-hl-icon">{h.icon}</span>
                                <h4 className="ct-hl-type">{h.type}</h4>
                                <p className="ct-hl-number">{h.number}</p>
                                <span className="ct-hl-hours">{h.hours}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Email Support */}
                <section className="ct-emails ct-animate" ref={addRef}>
                    <div className="ct-section-header">
                        <span className="ct-section-badge ct-badge-purple">Email</span>
                        <h2>Email Support</h2>
                    </div>
                    <div className="ct-emails-list">
                        {emails.map((e, idx) => (
                            <div key={idx} className="ct-email-row">
                                <span className="ct-email-icon">{e.icon}</span>
                                <div className="ct-email-info">
                                    <span className="ct-email-label">{e.label}</span>
                                    <a href={`mailto:${e.email}`} className="ct-email-link">{e.email}</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Response Times */}
                <section className="ct-response ct-animate" ref={addRef}>
                    <div className="ct-section-header">
                        <span className="ct-section-badge ct-badge-amber">Response</span>
                        <h2>Expected Response Times</h2>
                    </div>
                    <div className="ct-response-grid">
                        {responseTimes.map((r, idx) => (
                            <div key={idx} className="ct-response-card ct-animate" ref={addRef} style={{ transitionDelay: `${idx * 60}ms` }}>
                                <span className="ct-resp-icon">{r.icon}</span>
                                <div className="ct-resp-time">{r.time}</div>
                                <h4 className="ct-resp-channel">{r.channel}</h4>
                                <p className="ct-resp-detail">{r.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <div className="help-actions">
                    <Link to="/help/faqs" className="btn-secondary">← FAQs</Link>
                    <Link to="/help/how-to-apply" className="btn-primary">How to Apply →</Link>
                </div>
            </div>
        </div>
    );
};

export default Contact;
