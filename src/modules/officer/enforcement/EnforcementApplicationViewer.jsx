import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';
import '../dgo/ApplicationViewer.css'; // Reusing existing viewer styles

const EnforcementApplicationViewer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');

    // Mock data for the application
    const applicationData = {
        id: applicationId,
        applicationNumber: 'RJ/CGWA/NOC/2026/001234',
        applicantName: 'Rajesh Kumar Sharma',
        companyName: 'ABC Textile Manufacturing Unit',
        address: 'Plot No. 123, RIICO Industrial Area',
        district: 'Jaipur',
        block: 'Sanganer',
        category: 'SEMI_CRITICAL',
        projectType: 'Industrial',
        waterRequirement: 150.25,
        submittedDate: '2026-01-09',
        status: 'PENDING_FINAL_APPROVAL',
        dgoRecommendation: {
            status: 'APPROVED',
            remarks: 'Site inspection satisfactory. Water meter installed.',
            date: '2026-01-10',
            officer: 'Amit Verma (DGO Jaipur)'
        },
        sgwaRecommendation: {
            status: 'APPROVED_WITH_CONDITIONS',
            remarks: 'Technical review passed. Additional condition for rainwater harvesting added.',
            date: '2026-01-11',
            officer: 'Dr. Priya Sharma (Tech Officer)'
        },
        // Mock timeline data
        timeline: [
            { stage: 'SUBMITTED', date: '2026-01-09T08:00:00', actor: 'Applicant', remarks: 'Application submitted successfully' },
            { stage: 'DGO_REVIEW', date: '2026-01-10T10:00:00', actor: 'Amit Verma (DGO)', remarks: 'Site inspection completed. Recommended for approval.' },
            { stage: 'SGWA_REVIEW', date: '2026-01-11T14:30:00', actor: 'Dr. Priya Sharma (SGWA)', remarks: 'Technical feasibility verified. Forwarded for final NOC issuance.' },
            { stage: 'PENDING_ENFORCEMENT', date: '2026-01-11T14:35:00', actor: 'System', remarks: 'Awaiting final approval from Enforcement Wing' }
        ],
        // Mock inspection report
        inspectionReport: {
            date: '2026-01-10',
            officer: 'Amit Verma (DGO Jaipur)',
            findings: 'The unit has installed a digital flow meter as required. Piezometer installation is in progress. The proposed site for rainwater harvesting is adequate. No illegal abstraction observed.',
            coordinates: '26.9124° N, 75.7873° E',
            photos: ['site_photo_1.jpg', 'meter_photo.jpg']
        },
        // Mock timeline data
        timeline: [
            { stage: 'SUBMITTED', date: '2026-01-09T08:00:00', actor: 'Applicant', remarks: 'Application submitted successfully' },
            { stage: 'DGO_REVIEW', date: '2026-01-10T10:00:00', actor: 'Amit Verma (DGO)', remarks: 'Site inspection completed. Recommended for approval.' },
            { stage: 'SGWA_REVIEW', date: '2026-01-11T14:30:00', actor: 'Dr. Priya Sharma (SGWA)', remarks: 'Technical feasibility verified. Forwarded for final NOC issuance.' },
            { stage: 'PENDING_ENFORCEMENT', date: '2026-01-11T14:35:00', actor: 'System', remarks: 'Awaiting final approval from Enforcement Wing' }
        ],
        // Mock inspection report
        inspectionReport: {
            date: '2026-01-10',
            officer: 'Amit Verma (DGO Jaipur)',
            findings: 'The unit has installed a digital flow meter as required. Piezometer installation is in progress. The proposed site for rainwater harvesting is adequate. No illegal abstraction observed.',
            coordinates: '26.9124° N, 75.7873° E',
            photos: ['site_photo_1.jpg', 'meter_photo.jpg']
        }
    };

    const handleApproveClick = () => {
        // Navigate to the Approval Form logic (could be a modal or separate page)
        // Since ApprovalForm.jsx exists, we can use it, but typically we might want to pass ID
        navigate(`/officer/enforcement/approve/${applicationId}`); // Assuming route will be created or reusing exsiting
    };

    const handleRejectClick = () => {
        if (window.confirm('Are you sure you want to REJECT this application? This is a final decision.')) {
            alert('Application Rejected');
            navigate('/officer/enforcement/dashboard');
        }
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Suresh Patel"
                officerRole="ENFORCEMENT"
                officerDesignation="Chief Engineer"
                district=""
            />

            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Header */}
                        <div className="application-viewer-header">
                            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                            <div className="header-actions">
                                <span className="officer-badge warning">PENDING FINAL APPROVAL</span>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="application-summary-card">
                            <div className="summary-main">
                                <div className="summary-icon">🏭</div>
                                <div>
                                    <h2>{applicationData.companyName}</h2>
                                    <p className="application-number">{applicationData.applicationNumber}</p>
                                </div>
                            </div>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <label>Water Req.</label>
                                    <span>{applicationData.waterRequirement} m³/day</span>
                                </div>
                                <div className="stat-item">
                                    <label>District</label>
                                    <span>{applicationData.district}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Category</label>
                                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{applicationData.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Panel */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                            marginTop: '1.5rem'
                        }}>
                            {/* DGO Rec */}
                            <div className="officer-card" style={{ borderLeft: '4px solid #22c55e' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#64748b' }}>DGO Recommendation</h3>
                                <div style={{ fontWeight: '600', color: '#22c55e', fontSize: '1.1rem' }}>
                                    {applicationData.dgoRecommendation.status}
                                </div>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#334155' }}>
                                    "{applicationData.dgoRecommendation.remarks}"
                                </p>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                                    {applicationData.dgoRecommendation.officer} • {applicationData.dgoRecommendation.date}
                                </div>
                            </div>

                            {/* SGWA Rec */}
                            <div className="officer-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#64748b' }}>SGWA Recommendation</h3>
                                <div style={{ fontWeight: '600', color: '#3b82f6', fontSize: '1.1rem' }}>
                                    {applicationData.sgwaRecommendation.status}
                                </div>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#334155' }}>
                                    "{applicationData.sgwaRecommendation.remarks}"
                                </p>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                                    {applicationData.sgwaRecommendation.officer} • {applicationData.sgwaRecommendation.date}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="viewer-tabs">
                            <button
                                className={`viewer-tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Application Details
                            </button>
                            <button
                                className={`viewer-tab ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                Documents
                            </button>
                            <button
                                className={`viewer-tab ${activeTab === 'timeline' ? 'active' : ''}`}
                                onClick={() => setActiveTab('timeline')}
                            >
                                Timeline
                            </button>
                            <button
                                className={`viewer-tab ${activeTab === 'inspection' ? 'active' : ''}`}
                                onClick={() => setActiveTab('inspection')}
                            >
                                Inspection Report
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="viewer-content">
                            {activeTab === 'details' && (
                                <div className="details-grid">
                                    <div className="detail-section">
                                        <h3>Project Details</h3>
                                        <div className="detail-row">
                                            <label>Applicant Name</label>
                                            <span>{applicationData.applicantName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Project Type</label>
                                            <span>{applicationData.projectType}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Address</label>
                                            <span>{applicationData.address}</span>
                                        </div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Hydrogeology</h3>
                                        <div className="detail-row">
                                            <label>Aquifer Type</label>
                                            <span>Alluvium</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Basin</label>
                                            <span>Ganga Basin</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="documents-grid">
                                    <div className="document-card">
                                        <div className="doc-icon">📄</div>
                                        <div className="doc-info">
                                            <h4>Land Ownership Proof</h4>
                                            <span>Verified</span>
                                        </div>
                                        <button className="btn-view">View</button>
                                    </div>
                                    <div className="document-card">
                                        <div className="doc-icon">🗺️</div>
                                        <div className="doc-info">
                                            <h4>Site Plan</h4>
                                            <span>Verified</span>
                                        </div>
                                        <button className="btn-view">View</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="timeline-tab">
                                    <div className="timeline">
                                        {applicationData.timeline.map((event, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <h4>{event.stage.replace(/_/g, ' ')}</h4>
                                                        <span className="timeline-date">{new Date(event.date).toLocaleString()}</span>
                                                    </div>
                                                    <p className="timeline-actor">{event.actor}</p>
                                                    <p className="timeline-remarks">{event.remarks}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inspection' && (
                                <div className="inspection-tab">
                                    <div className="inspection-report">
                                        <h3>DGO Inspection Findings</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Inspection Date</label>
                                                <p>{new Date(applicationData.inspectionReport.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Inspector</label>
                                                <p>{applicationData.inspectionReport.officer}</p>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label>Findings</label>
                                                <p>{applicationData.inspectionReport.findings}</p>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label>Coordinates</label>
                                                <p>{applicationData.inspectionReport.coordinates}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="timeline-tab">
                                    <div className="timeline">
                                        {applicationData.timeline.map((event, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <h4>{event.stage.replace(/_/g, ' ')}</h4>
                                                        <span className="timeline-date">{new Date(event.date).toLocaleString()}</span>
                                                    </div>
                                                    <p className="timeline-actor">{event.actor}</p>
                                                    <p className="timeline-remarks">{event.remarks}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inspection' && (
                                <div className="inspection-tab">
                                    <div className="inspection-report">
                                        <h3>DGO Inspection Findings</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Inspection Date</label>
                                                <p>{new Date(applicationData.inspectionReport.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Inspector</label>
                                                <p>{applicationData.inspectionReport.officer}</p>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label>Findings</label>
                                                <p>{applicationData.inspectionReport.findings}</p>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label>Coordinates</label>
                                                <p>{applicationData.inspectionReport.coordinates}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="viewer-footer">
                            <button
                                className="officer-btn officer-btn-danger"
                                onClick={handleRejectClick}
                            >
                                ❌ Reject Application
                            </button>
                            <button
                                className="officer-btn officer-btn-secondary"
                                onClick={() => alert('Returned to SGWA for clarification')}
                            >
                                ↩ Return to SGWA
                            </button>
                            <div style={{ flex: 1 }}></div>
                            <button
                                className="officer-btn officer-btn-success"
                                onClick={handleApproveClick}
                            >
                                ✅ Approve & Issue NOC
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EnforcementApplicationViewer;
