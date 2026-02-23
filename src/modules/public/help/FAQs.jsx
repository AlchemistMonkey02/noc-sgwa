import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/help-pages.css';

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState(0);
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('fq-visible');
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

    const faqCategories = [
        {
            category: 'Application Process',
            icon: '📝',
            color: '#2563eb',
            colorLight: '#eff6ff',
            faqs: [
                { q: 'How do I apply for a Groundwater NOC?', a: 'Register on the portal, complete your profile, fill the NOC application form, upload required documents, and submit. You will receive an application ID for tracking.' },
                { q: 'Can I save my application as draft?', a: 'Yes, you can save your application at any stage and complete it later. Your progress is automatically saved.' },
                { q: 'How long does the approval process take?', a: 'Typically 18-27 working days for new NOC applications, 7-11 days for renewals. Check the Timelines page for detailed breakdowns.' },
                { q: 'Can I track my application status?', a: 'Yes, login to your dashboard to view real-time status updates and any pending actions required.' }
            ]
        },
        {
            category: 'Documents',
            icon: '📄',
            color: '#059669',
            colorLight: '#ecfdf5',
            faqs: [
                { q: 'What documents are required for NOC application?', a: 'Identity proof, address proof, land ownership documents, site map, and project proposal. Visit the Required Documents page for complete list.' },
                { q: 'What is the maximum file size for uploads?', a: 'Each file should not exceed 5MB. Compress large files before uploading.' },
                { q: 'Can I submit scanned copies of documents?', a: 'Yes, clear scanned copies in PDF or JPG format are acceptable. Ensure all text is legible.' },
                { q: 'Do I need to submit original documents?', a: 'No, digital copies are sufficient for online applications. Originals may be verified during site inspection.' }
            ]
        },
        {
            category: 'Payment',
            icon: '💳',
            color: '#7c3aed',
            colorLight: '#f5f3ff',
            faqs: [
                { q: 'What are the application fees?', a: 'Fees vary by application type and extraction capacity. You will see the exact amount during application submission.' },
                { q: 'What payment methods are accepted?', a: 'Credit/Debit cards, Net Banking, UPI, and Government payment gateways are supported.' },
                { q: 'Is the payment refundable?', a: 'Application fees are generally non-refundable. However, in case of duplicate payments, refunds are processed within 15 working days.' },
                { q: 'Do I need to pay before or after approval?', a: 'Payment is required after initial document verification to proceed with site inspection and final approval.' }
            ]
        },
        {
            category: 'Status & Tracking',
            icon: '📊',
            color: '#d97706',
            colorLight: '#fffbeb',
            faqs: [
                { q: 'How do I check my application status?', a: 'Login to your dashboard to view detailed status updates, current stage, and any pending actions.' },
                { q: 'Will I receive email notifications?', a: 'Yes, you will receive email alerts for major status changes, document requests, and approvals.' },
                { q: 'What if my application is rejected?', a: 'You will receive detailed reasons for rejection. You can correct the issues and resubmit the application.' },
                { q: 'Can I withdraw my application?', a: 'Yes, you can withdraw before approval. However, processing fees may not be refundable.' }
            ]
        }
    ];

    const toggleFAQ = (categoryIdx, faqIdx) => {
        const index = `${categoryIdx}-${faqIdx}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    const totalFaqs = faqCategories.reduce((sum, c) => sum + c.faqs.length, 0);

    return (
        <div className="help-page">
            <div className="help-container-wide fq-page-root">

                {/* Breadcrumb */}
                <nav className="help-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-sep">/</span>
                    <span>FAQs</span>
                </nav>

                {/* Hero */}
                <header className="fq-hero fq-animate" ref={addRef}>
                    <div className="fq-hero-badge">Help Centre</div>
                    <h1 className="fq-hero-title">Frequently Asked Questions</h1>
                    <p className="fq-hero-subtitle">
                        Quick answers to the most common questions about NOC applications,
                        documents, payments, and tracking.
                    </p>
                    <div className="fq-hero-stats">
                        <span className="fq-stat">{faqCategories.length} Categories</span>
                        <span className="fq-stat-sep">·</span>
                        <span className="fq-stat">{totalFaqs} Questions</span>
                    </div>
                </header>

                {/* Category Pills */}
                <div className="fq-pills fq-animate" ref={addRef}>
                    {faqCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            className={`fq-pill ${activeCategory === idx ? 'fq-pill-active' : ''}`}
                            onClick={() => {
                                setActiveCategory(idx);
                                document.getElementById(`fq-cat-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            style={{ '--fq-pill-color': cat.color, '--fq-pill-bg': cat.colorLight }}
                        >
                            <span className="fq-pill-icon">{cat.icon}</span>
                            <span>{cat.category}</span>
                            <span className="fq-pill-count">{cat.faqs.length}</span>
                        </button>
                    ))}
                </div>

                {/* FAQ Sections */}
                <div className="fq-sections">
                    {faqCategories.map((category, catIdx) => (
                        <section
                            key={catIdx}
                            id={`fq-cat-${catIdx}`}
                            className="fq-category fq-animate"
                            ref={addRef}
                            style={{ scrollMarginTop: '100px' }}
                        >
                            <div className="fq-cat-header">
                                <span className="fq-cat-icon" style={{ background: category.colorLight, color: category.color }}>
                                    {category.icon}
                                </span>
                                <div>
                                    <h3 className="fq-cat-title">{category.category}</h3>
                                    <span className="fq-cat-count">{category.faqs.length} questions</span>
                                </div>
                            </div>

                            <div className="fq-list">
                                {category.faqs.map((faq, faqIdx) => {
                                    const index = `${catIdx}-${faqIdx}`;
                                    const isOpen = openIndex === index;
                                    return (
                                        <div key={faqIdx} className={`fq-item ${isOpen ? 'fq-item-open' : ''}`}>
                                            <button className="fq-question" onClick={() => toggleFAQ(catIdx, faqIdx)}>
                                                <span className="fq-q-text">{faq.q}</span>
                                                <span className={`fq-chevron ${isOpen ? 'fq-chevron-open' : ''}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </span>
                                            </button>
                                            <div className={`fq-answer-wrap ${isOpen ? 'fq-answer-open' : ''}`}>
                                                <div className="fq-answer">
                                                    {faq.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Still Have Questions */}
                <section className="fq-contact-cta fq-animate" ref={addRef}>
                    <div className="fq-cta-content">
                        <span className="fq-cta-icon">📞</span>
                        <div>
                            <h3>Still Have Questions?</h3>
                            <p>
                                Our support team is ready to help. Reach out via our{' '}
                                <Link to="/help/contact">Contact & Helpline</Link> page for personalised assistance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="help-actions">
                    <Link to="/help/documents" className="btn-secondary">← Documents</Link>
                    <Link to="/help/contact" className="btn-primary">Contact Us →</Link>
                </div>
            </div>
        </div>
    );
};

export default FAQs;
