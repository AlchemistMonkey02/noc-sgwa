import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const DocumentRequirements = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('industry');
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const documentData = {
        industry: {
            title: 'Document Requirements for Industries',
            sections: [
                {
                    id: 'ind-general',
                    title: 'General Requirements (All Industries)',
                    documents: [
                        'Duly filled and signed application form',
                        'Proof of ownership or lease agreement of the land',
                        'Detailed groundwater use plan (quantity, purpose, and source)',
                        'Water availability report or Certificate of Non-Availability from local water supply agency',
                        'Rainwater harvesting/artificial recharge proposal as per Model Building Bye Laws',
                        'Groundwater quality report from NABL accredited/government-approved laboratory',
                        'Bharat Kosh receipt (application fee and groundwater abstraction charges)',
                        'Authorization letter from the firm',
                        'Scanned copy of application with signature and seal'
                    ]
                },
                {
                    id: 'ind-statutory',
                    title: 'Statutory Referrals & Consents',
                    documents: [
                        'Referral letter from MoEF&CC (Ministry of Environment, Forests & Climate Change)',
                        'Referral from State Pollution Control Board (SPCB)',
                        'Referral from State Level Expert Appraisal Committee (SEAC)',
                        'Referral from State Level Environment Impact Assessment Authority (SLEIAA)',
                        'Consent to Establish (CTE) or Consent to Operate (CTO) from SPCB',
                        'BIS/FSSAI certification (if applicable)'
                    ]
                },
                {
                    id: 'ind-technical',
                    title: 'Technical Documents',
                    documents: [
                        'Schematic diagram showing water availability, supply, and recycling details',
                        'Details of existing and proposed bore wells with specifications',
                        'Site plan showing location of bore wells and recharge structures'
                    ]
                },
                {
                    id: 'ind-less-10',
                    title: 'For Withdrawal < 10 KLD (Kilolitres per Day)',
                    expandable: true,
                    documents: [
                        'Simplified application form',
                        'Consent to Establish/Operate from SPCB',
                        'Affidavit confirming non-availability of public water supply',
                        'Groundwater quality report',
                        'Rainwater harvesting proposal'
                    ]
                },
                {
                    id: 'ind-10-100',
                    title: 'For Withdrawal 10-100 KLD',
                    expandable: true,
                    documents: [
                        'All general requirements',
                        'Hydrogeological data of the area',
                        'Impact Assessment Report with Groundwater Modelling (MANDATORY)',
                        'Detailed recharge plan',
                        'MSME Certificate (if applicable)'
                    ]
                },
                {
                    id: 'ind-above-100',
                    title: 'For Withdrawal > 100 KLD',
                    expandable: true,
                    documents: [
                        'All general and statutory requirements',
                        'Detailed hydrogeological investigation report',
                        'Environmental Impact Assessment (EIA) report',
                        'Comprehensive report on groundwater conditions within 5 km radius',
                        'Proposal for groundwater monitoring network with digital water level recorders',
                        'Water audit report',
                        'Zero Liquid Discharge (ZLD) certification (for certain industries)'
                    ]
                },
                {
                    id: 'ind-critical-zones',
                    title: 'Additional Requirements for Critical/Over-Exploited Areas',
                    expandable: true,
                    documents: [
                        'Hydrogeological report for extraction > 200 m³/day',
                        'Enhanced recharge plan (at least 2x extraction)',
                        'Mandatory groundwater monitoring network',
                        'Justification for groundwater use (proof of no alternative source)',
                        'Certificate of non-availability of treated sewage water within 10 km radius'
                    ]
                }
            ]
        },
        infrastructure: {
            title: 'Document Requirements for Infrastructure Projects',
            sections: [
                {
                    id: 'inf-general',
                    title: 'General Requirements (All Infrastructure Projects)',
                    documents: [
                        'Duly filled and signed application form',
                        'Proof of ownership or lease agreement',
                        'Detailed groundwater use plan',
                        'Certificate of non-availability/inadequate availability of public water supply',
                        'Rainwater harvesting/artificial recharge proposal',
                        'Groundwater quality report from NABL accredited laboratory',
                        'Bharat Kosh receipt',
                        'Authorization letter',
                        'Project approval from competent authority'
                    ]
                },
                {
                    id: 'inf-approvals',
                    title: 'Statutory Approvals',
                    documents: [
                        'Approval letter from State Government Agency (Consent to Establish)',
                        'Referral from MoEF&CC (if applicable)',
                        'Referral from State Pollution Control Board',
                        'Referral from SEAC/SLEIAA',
                        'Referral from Urban/Rural Development Authority',
                        'Completion Certificate from competent authority (for commercial projects)'
                    ]
                },
                {
                    id: 'inf-water-planning',
                    title: 'Water Supply Planning Documents',
                    documents: [
                        'Approved water supply plan (for water supply agencies)',
                        'Water requirement calculation as per CPHEEO norms (Annexure III)',
                        'Water requirement as per National Building Code',
                        'Details of water recycling and reuse systems',
                        'Treated water reuse plan'
                    ]
                },
                {
                    id: 'inf-dewatering',
                    title: 'For Projects Involving Dewatering',
                    expandable: true,
                    documents: [
                        'Impact Assessment Report by accredited consultant',
                        'Dewatering plan with quantities and duration',
                        'Groundwater modelling for dewatering impact',
                        'Plan for beneficial use of dewatered groundwater',
                        'Recharge plan to compensate for dewatering',
                        'Monitoring well network proposal'
                    ]
                },
                {
                    id: 'inf-construction',
                    title: 'For Construction Phase Water Requirements',
                    expandable: true,
                    documents: [
                        'Temporary water requirement calculations',
                        'Construction period timeline',
                        'Certificate of non-availability of treated sewage water within 10 km (for critical areas)',
                        'Dust suppression and curing water requirement details'
                    ]
                },
                {
                    id: 'inf-commercial',
                    title: 'For Commercial Infrastructure (Hotels, Malls, IT Parks)',
                    expandable: true,
                    documents: [
                        'All general requirements',
                        'Detailed water balance diagram',
                        'Sewage Treatment Plant (STP) proposal',
                        'Water recycling percentage commitment',
                        'Green building certification documents (if applicable)',
                        'CPHEEO norm-based water requirement calculation'
                    ]
                },
                {
                    id: 'inf-residential',
                    title: 'For Residential Complexes/Group Housing',
                    expandable: true,
                    documents: [
                        'Building plan approval',
                        'Water requirement as per number of dwelling units',
                        'STP and recycling system design',
                        'Rainwater harvesting structure design',
                        'Compliance with local building bye-laws'
                    ]
                }
            ]
        },
        mining: {
            title: 'Document Requirements for Mining Projects',
            sections: [
                {
                    id: 'min-general',
                    title: 'General Requirements (All Mining Projects)',
                    documents: [
                        'Duly filled and signed application form',
                        'Proof of mining lease',
                        'Detailed groundwater use plan',
                        'Rainwater harvesting/artificial recharge proposal',
                        'Groundwater quality report from NABL accredited laboratory',
                        'Bharat Kosh receipt',
                        'Authorization letter from mining company'
                    ]
                },
                {
                    id: 'min-statutory',
                    title: 'Statutory Approvals & Documents',
                    documents: [
                        'Referral letter from Ministry of Environment, Forests & Climate Change (MoEF&CC)',
                        'Referral from State Pollution Control Board (SPCB)',
                        'Referral from State Level Expert Appraisal Committee (SEAC)',
                        'Referral from State Level Environment Impact Assessment Authority (SLEIAA)',
                        'Environmental Clearance (EC) certificate'
                    ]
                },
                {
                    id: 'min-mining-docs',
                    title: 'Mining-Specific Documents',
                    documents: [
                        'Geo-tagged mine lease map',
                        'Mining Plan approved by IBM (Indian Bureau of Mines) or State Government',
                        'Mine closure plan',
                        'Progressive Mine Closure Plan (if applicable)'
                    ]
                },
                {
                    id: 'min-groundwater',
                    title: 'Groundwater Assessment Documents',
                    documents: [
                        'Comprehensive report on groundwater conditions in core zone',
                        'Comprehensive report on groundwater conditions in buffer zone (5 km radius)',
                        'Impact assessment of mining activities on groundwater',
                        'Impact assessment of dewatering operations (as per Annexure IV)',
                        'Baseline groundwater level and quality data',
                        'Aquifer characterization study'
                    ]
                },
                {
                    id: 'min-less-10',
                    title: 'For Groundwater Withdrawal < 10 KLD',
                    expandable: true,
                    documents: [
                        'Basic mining plan',
                        'Simplified groundwater use proposal',
                        'Rainwater harvesting plan',
                        'Quality report of existing wells'
                    ]
                },
                {
                    id: 'min-above-10',
                    title: 'For Groundwater Withdrawal > 10 KLD',
                    expandable: true,
                    documents: [
                        'All general and statutory requirements',
                        'Detailed hydrogeological investigation',
                        'Comprehensive groundwater impact assessment',
                        'Groundwater modelling for drawdown prediction',
                        'Cumulative impact assessment (if part of mining cluster)'
                    ]
                },
                {
                    id: 'min-dewatering',
                    title: 'For Dewatering Operations',
                    expandable: true,
                    documents: [
                        'Dewatering plan with estimated quantities',
                        'Duration of dewatering operations',
                        'Proposal for beneficial use of dewatered water (irrigation, dust suppression, mining process, water supply)',
                        'Impact on surrounding wells and water bodies',
                        'Mitigation measures for dewatering impacts',
                        'Post-mining aquifer restoration plan'
                    ]
                },
                {
                    id: 'min-monitoring',
                    title: 'Monitoring & Compliance',
                    expandable: true,
                    documents: [
                        'Groundwater monitoring network design',
                        'Installation of digital water level recorders with telemetry',
                        'Water quality monitoring probes within 5 km radius',
                        'Quarterly monitoring and reporting commitment',
                        'Real-time data transmission system proposal',
                        'Compliance monitoring plan'
                    ]
                }
            ]
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-container" style={{ padding: '30px 15px' }}>
                {/* Page Header */}
                <div className="noc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h1 style={{ margin: 0, color: 'var(--cgwa-primary)', fontSize: '1.8rem' }}>
                                📋 Document Requirements
                            </h1>
                            <p style={{ margin: '5px 0 0 0', color: 'var(--cgwa-text-secondary)' }}>
                                Complete checklist for CGWA NOC applications
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handlePrint} className="noc-btn noc-btn-outline">
                                🖨️ Print Checklist
                            </button>
                            <Link to="/noc/dashboard" className="noc-btn noc-btn-secondary">
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="noc-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="doc-req-tabs">
                        <button
                            className={`doc-req-tab ${activeTab === 'industry' ? 'active' : ''}`}
                            onClick={() => setActiveTab('industry')}
                        >
                            🏭 Industry
                        </button>
                        <button
                            className={`doc-req-tab ${activeTab === 'infrastructure' ? 'active' : ''}`}
                            onClick={() => setActiveTab('infrastructure')}
                        >
                            🏗️ Infrastructure
                        </button>
                        <button
                            className={`doc-req-tab ${activeTab === 'mining' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mining')}
                        >
                            ⛏️ Mining
                        </button>
                    </div>
                </div>

                {/* Document Lists */}
                <div className="noc-card">
                    <div className="noc-card-header">
                        {documentData[activeTab].title}
                    </div>
                    <div className="noc-card-body">
                        <div className="doc-req-info-box">
                            <strong>📌 Important Notes:</strong>
                            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                                <li>All documents must be self-attested and signed</li>
                                <li>Reports must be from NABL accredited laboratories where applicable</li>
                                <li>Documents should not be older than 6 months (unless specified otherwise)</li>
                                <li>Upload clear, legible scanned copies in PDF format</li>
                                <li>File size limit: 5 MB per document</li>
                            </ul>
                        </div>

                        {documentData[activeTab].sections.map((section, index) => (
                            <div key={section.id} className="doc-req-section">
                                <div
                                    className={`doc-req-section-header ${section.expandable ? 'expandable' : ''}`}
                                    onClick={() => section.expandable && toggleSection(section.id)}
                                    style={{ cursor: section.expandable ? 'pointer' : 'default' }}
                                >
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cgwa-primary)' }}>
                                        {section.expandable && (
                                            <span style={{ marginRight: '8px', fontSize: '0.9rem' }}>
                                                {expandedSections[section.id] ? '▼' : '▶'}
                                            </span>
                                        )}
                                        {section.title}
                                    </h3>
                                    {section.expandable && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--cgwa-text-secondary)' }}>
                                            Click to {expandedSections[section.id] ? 'collapse' : 'expand'}
                                        </span>
                                    )}
                                </div>

                                {(!section.expandable || expandedSections[section.id]) && (
                                    <div className="doc-req-list">
                                        {section.documents.map((doc, docIndex) => (
                                            <div key={docIndex} className="doc-req-item">
                                                <span className="doc-req-checkbox">☐</span>
                                                <span className="doc-req-text">{doc}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Quick Action Button */}
                        <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '10px' }}>
                            <p style={{ color: 'white', margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: '600' }}>
                                ✅ Ready with all documents?
                            </p>
                            <Link to="/noc/application" className="noc-btn" style={{ background: 'white', color: 'var(--cgwa-primary)', fontWeight: '600' }}>
                                Start Your NOC Application →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default DocumentRequirements;
