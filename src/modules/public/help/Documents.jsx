import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/help-pages.css';

const Documents = () => {
    const [selectedType, setSelectedType] = useState('groundwater');
    const [animKey, setAnimKey] = useState(0);
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('doc-visible');
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

    const handleTypeChange = (typeId) => {
        setSelectedType(typeId);
        setAnimKey((k) => k + 1);
    };

    const documentsByType = {
        groundwater: [
            { name: 'Application Form', format: 'PDF', required: true, desc: 'Filled and signed NOC application form', icon: '📝' },
            { name: 'Identity Proof', format: 'PDF / JPG', required: true, desc: 'Aadhaar Card / PAN Card / Passport', icon: '🪪' },
            { name: 'Address Proof', format: 'PDF / JPG', required: true, desc: 'Electricity Bill / Property Tax Receipt', icon: '🏠' },
            { name: 'Land Ownership Documents', format: 'PDF', required: true, desc: 'Sale Deed / Lease Agreement / Patta', icon: '📜' },
            { name: 'Site Map', format: 'PDF', required: true, desc: 'Detailed site plan with geo-coordinates', icon: '🗺️' },
            { name: 'Project Proposal', format: 'PDF', required: true, desc: 'Purpose and water requirement details', icon: '📊' },
            { name: 'Hydrogeological Report', format: 'PDF', required: false, desc: 'Required for extraction > 10,000 litres/day', icon: '🔬' },
            { name: 'Environmental Clearance', format: 'PDF', required: false, desc: 'Required for industrial-scale projects', icon: '🌿' }
        ],
        rig: [
            { name: 'Registration Form', format: 'PDF', required: true, desc: 'Filled rig registration form', icon: '📝' },
            { name: 'Rig Ownership Proof', format: 'PDF', required: true, desc: 'Purchase invoice / Transfer deed', icon: '📄' },
            { name: 'Operator License', format: 'PDF / JPG', required: true, desc: 'Valid drilling operator license', icon: '🪪' },
            { name: 'Equipment Specifications', format: 'PDF', required: true, desc: 'Technical specs and capacity details', icon: '⚙️' },
            { name: 'Insurance Certificate', format: 'PDF', required: true, desc: 'Valid equipment insurance document', icon: '🛡️' },
            { name: 'Safety Compliance', format: 'PDF', required: true, desc: 'Safety standards certification', icon: '✅' }
        ],
        vendor: [
            { name: 'Vendor Registration Form', format: 'PDF', required: true, desc: 'Filled vendor application form', icon: '📝' },
            { name: 'Company Registration', format: 'PDF', required: true, desc: 'ROC certificate / Partnership deed', icon: '🏢' },
            { name: 'GST Certificate', format: 'PDF', required: true, desc: 'Valid GST registration certificate', icon: '📋' },
            { name: 'PAN Card', format: 'PDF / JPG', required: true, desc: 'Company / Proprietor PAN card', icon: '🪪' },
            { name: 'Bank Account Details', format: 'PDF', required: true, desc: 'Cancelled cheque / Bank statement', icon: '🏦' },
            { name: 'Experience Certificates', format: 'PDF', required: false, desc: 'Previous work completion certificates', icon: '🏆' }
        ]
    };

    const types = [
        { id: 'groundwater', name: 'Groundwater NOC', icon: '💧', color: '#2563eb', colorLight: '#eff6ff', count: documentsByType.groundwater.length },
        { id: 'rig', name: 'Rig Registration', icon: '⚙️', color: '#7c3aed', colorLight: '#f5f3ff', count: documentsByType.rig.length },
        { id: 'vendor', name: 'Vendor Registration', icon: '🏢', color: '#059669', colorLight: '#ecfdf5', count: documentsByType.vendor.length }
    ];

    const guidelines = [
        { icon: '📐', title: 'Format', desc: 'PDF (searchable) or JPG / PNG scans' },
        { icon: '📦', title: 'Max Size', desc: '5 MB per file — compress if needed' },
        { icon: '🔍', title: 'Quality', desc: 'Clear, legible scans — no shadows or cuts' },
        { icon: '🎨', title: 'Colour', desc: 'Colour scans preferred, B&W acceptable' },
        { icon: '🏷️', title: 'Naming', desc: 'Use descriptive names e.g. "Aadhaar_Card.pdf"' },
        { icon: '📅', title: 'Validity', desc: 'All documents must be current and valid' }
    ];

    const currentDocs = documentsByType[selectedType];
    const requiredCount = currentDocs.filter((d) => d.required).length;
    const optionalCount = currentDocs.length - requiredCount;

    return (
        <div className="help-page">
            <div className="help-container-wide doc-page-root">

                {/* Breadcrumb */}
                <nav className="help-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumb-sep">/</span>
                    <span>Required Documents</span>
                </nav>

                {/* Hero */}
                <header className="doc-hero doc-animate" ref={addRef}>
                    <div className="doc-hero-badge">Checklist</div>
                    <h1 className="doc-hero-title">Required Documents</h1>
                    <p className="doc-hero-subtitle">
                        Ensure you have all the necessary documents ready before starting your application.
                        Select your application type below to see the complete list.
                    </p>
                </header>

                {/* Tab Selector */}
                <div className="doc-tabs doc-animate" ref={addRef}>
                    {types.map((type) => (
                        <button
                            key={type.id}
                            className={`doc-tab ${selectedType === type.id ? 'doc-tab-active' : ''}`}
                            onClick={() => handleTypeChange(type.id)}
                            style={{ '--doc-tab-color': type.color, '--doc-tab-bg': type.colorLight }}
                        >
                            <span className="doc-tab-icon">{type.icon}</span>
                            <span className="doc-tab-name">{type.name}</span>
                            <span className="doc-tab-count">{type.count}</span>
                        </button>
                    ))}
                </div>

                {/* Stats bar */}
                <div className="doc-stats-bar" key={`stats-${animKey}`}>
                    <div className="doc-stat-chip doc-stat-required">
                        <span className="doc-stat-dot doc-dot-red" />
                        <span>{requiredCount} Required</span>
                    </div>
                    {optionalCount > 0 && (
                        <div className="doc-stat-chip doc-stat-optional">
                            <span className="doc-stat-dot doc-dot-blue" />
                            <span>{optionalCount} Optional</span>
                        </div>
                    )}
                </div>

                {/* Documents Grid */}
                <div className="doc-grid" key={`grid-${animKey}`}>
                    {currentDocs.map((doc, idx) => (
                        <div
                            key={idx}
                            className="doc-card doc-card-enter"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="doc-card-left">
                                <span className="doc-card-icon">{doc.icon}</span>
                            </div>
                            <div className="doc-card-body">
                                <div className="doc-card-top">
                                    <h4 className="doc-card-name">{doc.name}</h4>
                                    <div className="doc-card-badges">
                                        {doc.required ? (
                                            <span className="doc-badge doc-badge-required">Required</span>
                                        ) : (
                                            <span className="doc-badge doc-badge-optional">Optional</span>
                                        )}
                                        <span className="doc-badge doc-badge-format">{doc.format}</span>
                                    </div>
                                </div>
                                <p className="doc-card-desc">{doc.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Guidelines Grid */}
                <section className="doc-guidelines-section doc-animate" ref={addRef}>
                    <div className="doc-section-header">
                        <span className="doc-section-badge">Guidelines</span>
                        <h2>Document Submission Rules</h2>
                    </div>
                    <div className="doc-guidelines-grid">
                        {guidelines.map((g, i) => (
                            <div key={i} className="doc-guideline-card doc-animate" ref={addRef} style={{ transitionDelay: `${i * 60}ms` }}>
                                <span className="doc-guideline-icon">{g.icon}</span>
                                <h4 className="doc-guideline-title">{g.title}</h4>
                                <p className="doc-guideline-desc">{g.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <div className="help-actions">
                    <Link to="/help/timelines" className="btn-secondary">← Timelines</Link>
                    <Link to="/help/faqs" className="btn-primary">FAQs →</Link>
                </div>
            </div>
        </div>
    );
};

export default Documents;
