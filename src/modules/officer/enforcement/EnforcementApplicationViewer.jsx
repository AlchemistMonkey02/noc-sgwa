import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';
import '../dgo/ApplicationViewer.css'; // Reusing existing viewer styles

const EnforcementApplicationViewer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [officerData, setOfficerData] = useState(null);

    useEffect(() => {
        const storedOfficer = localStorage.getItem('officerData');
        if (storedOfficer) {
            setOfficerData(JSON.parse(storedOfficer));
        }
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getEnforcementApplicationDetails(applicationId);
            if (response.success) {
                setApplication(response.data);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            setApplication(null);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = () => {
        navigate(`/officer/enforcement/applications/${applicationId}/approve`);
    };

    const handleRejectClick = async () => {
        if (window.confirm('Are you sure you want to REJECT this application? This is a final decision.')) {
            try {
                const rejectionData = {
                    remarks: 'Rejected by Enforcement wing',
                    date: new Date().toISOString()
                };
                const response = await officerService.enforcementRejectApplication(applicationId, rejectionData);
                if (response.success) {
                    alert('Application Rejected');
                    navigate('/officer/enforcement/dashboard');
                }
            } catch (error) {
                console.error('Error rejecting application:', error);
                alert('Failed to reject application');
            }
        }
    };

    const handleReturnClick = async () => {
        const remarks = window.prompt('Enter remarks for returning to SGWA:');
        if (remarks) {
            try {
                const response = await officerService.enforcementReturnToSGWA(applicationId, { remarks });
                if (response.success) {
                    alert('Application returned to SGWA');
                    navigate('/officer/enforcement/dashboard');
                }
            } catch (error) {
                console.error('Error returning application:', error);
                alert('Failed to return application');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading application...</p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="error-container">
                <h2>Application not found</h2>
                <button onClick={() => navigate('/officer/enforcement/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerData?.name || "Officer"}
                officerRole="ENFORCEMENT"
                officerDesignation={officerData?.designation || "Chief Engineer"}
                district={officerData?.district || ""}
            />

            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Header */}
                        <div className="application-viewer-header">
                            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                            <div className="header-actions">
                                <span className={`officer-badge status-${application.status?.toLowerCase().replace(/_/g, '-')}`}>
                                    {application.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="application-summary-card">
                            <div className="summary-main">
                                <div className="summary-icon">🏭</div>
                                <div>
                                    <h2>{application.projectDetails?.projectName || 'Industrial Project'}</h2>
                                    <p className="application-number">{application.applicationNumber}</p>
                                </div>
                            </div>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <label>Water Req.</label>
                                    <span>{application.waterRequirement?.dailyRequirement || 0} m³/day</span>
                                </div>
                                <div className="stat-item">
                                    <label>District</label>
                                    <span>{application.locationDetails?.district}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Category</label>
                                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{application.category || 'GENERAL'}</span>
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
                                    {application.dgoRecommendation?.status || 'PENDING'}
                                </div>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#334155' }}>
                                    "{application.dgoRecommendation?.remarks || 'No remarks yet'}"
                                </p>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                                    {application.dgoRecommendation?.recommendedBy} • {application.dgoRecommendation?.date && new Date(application.dgoRecommendation.date).toLocaleDateString()}
                                </div>
                            </div>

                            {/* SGWA Rec */}
                            <div className="officer-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#64748b' }}>SGWA Recommendation</h3>
                                <div style={{ fontWeight: '600', color: '#3b82f6', fontSize: '1.1rem' }}>
                                    {application.sgwaRecommendation?.status || 'PENDING'}
                                </div>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#334155' }}>
                                    "{application.sgwaRecommendation?.remarks || 'No remarks yet'}"
                                </p>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                                    {application.sgwaRecommendation?.recommendedBy} • {application.sgwaRecommendation?.date && new Date(application.sgwaRecommendation.date).toLocaleDateString()}
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
                                Documents ({application.documents?.length || 0})
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
                                            <span>{application.applicantDetails?.name || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Project Type</label>
                                            <span>{application.projectDetails?.projectType || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Address</label>
                                            <span>{application.locationDetails?.village}, {application.locationDetails?.block}, {application.locationDetails?.district}</span>
                                        </div>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Water Management</h3>
                                        <div className="detail-row">
                                            <label>Daily Requirement</label>
                                            <span>{application.waterRequirement?.dailyRequirement} m³/day</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Source Type</label>
                                            <span>{application.waterRequirement?.sourceType || 'Groundwater'}</span>
                                        </div>
                                    </div>

                                    {/* Exemption Details (If Applicable) */}
                                    {application.isExempted && application.exemptionDetails && (
                                        <div className="detail-section">
                                            <h3 style={{ color: '#059669' }}>🌾 Exemption Application Details</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                                <div className="detail-row">
                                                    <label>Application SubType</label>
                                                    <span>{application.exemptionDetails.applicationSubType}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Gram Panchayat / Village</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.gramPanchayatName}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Khasra No / Plot No</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.landDetailsKhasraNo}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Land Area (Hectare)</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.landHoldingAreaHectare}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Requested Water (KLD)</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.waterRequirementKLD} KLD</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>System Eligibility Check</label>
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: application.exemptionDetails.exemptionEligible ? '#16a34a' : '#d97706'
                                                    }}>
                                                        {application.exemptionDetails.exemptionEligible ? 'ELIGIBLE' : 'PENDING REVIEW'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="documents-grid">
                                    {application.documents?.map((doc, index) => (
                                        <div key={index} className="document-card">
                                            <div className="doc-icon">📄</div>
                                            <div className="doc-info">
                                                <h4>{doc.type?.replace(/_/g, ' ')}</h4>
                                                <span>{doc.verified ? 'Verified ✓' : 'Pending'}</span>
                                            </div>
                                            <a
                                                href={officerService.getDocumentUrl(doc.id || doc._id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-view"
                                                style={{ textDecoration: 'none', textAlign: 'center' }}
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                    {(!application.documents || application.documents.length === 0) && (
                                        <p>No documents available</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="timeline-tab">
                                    <div className="timeline">
                                        {application.timeline?.map((event, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <h4>{event.stage?.replace(/_/g, ' ')}</h4>
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
                                    {application.workflow?.inspectionReport ? (
                                        <div className="inspection-report">
                                            <h3>Inspection Findings</h3>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Inspection Date</label>
                                                    <p>{new Date(application.workflow.inspectionReport.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Inspector</label>
                                                    <p>{application.workflow.inspectionReport.officer}</p>
                                                </div>
                                                <div className="detail-item full-width">
                                                    <label>Findings</label>
                                                    <p>{application.workflow.inspectionReport.findings}</p>
                                                </div>
                                                <div className="detail-item full-width">
                                                    <label>Coordinates</label>
                                                    <p>{application.workflow.inspectionReport.coordinates || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <p>No inspection report available</p>
                                        </div>
                                    )}
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
                                onClick={handleReturnClick}
                            >
                                ↩ Return to SGWA
                            </button>
                            <div style={{ flex: 1 }}></div>
                            <button
                                className="officer-btn officer-btn-success"
                                onClick={handleApproveClick}
                                disabled={application.status === 'APPROVED'}
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
