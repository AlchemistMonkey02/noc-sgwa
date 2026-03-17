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
                            <button className="back-button" onClick={() => navigate(-1)}>
                                <span>←</span> Back to Dashboard
                            </button>
                            <div className="header-actions">
                                <span className={`officer-badge status-${application.status?.toLowerCase().replace(/_/g, '-')}`}>
                                    {application.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="application-summary-card">
                            <div className="summary-main">
                                <div className="summary-icon">🏢</div>
                                <div>
                                    <h2>{application.projectDetails?.projectName || 'Industrial Project'}</h2>
                                    <p className="application-number">{application.applicationNumber}</p>
                                </div>
                            </div>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <label>💧 Daily Requirement</label>
                                    <span>{application.waterRequirement?.dailyRequirement || 0} m³/day</span>
                                </div>
                                <div className="stat-item">
                                    <label>📍 District</label>
                                    <span>{application.locationDetails?.district}</span>
                                </div>
                                <div className="stat-item">
                                    <label>🏷️ Category</label>
                                    <span style={{ color: '#fbbf24' }}>{application.category || 'GENERAL'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Panel - Redesigned without inline styles */}
                        <div className="recommendations-container" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {/* DGO Rec */}
                            <div className="officer-card recommendation-dgo" style={{ borderLeft: '5px solid #10b981' }}>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>👨‍💼</span> DGO Recommendation
                                </h3>
                                <div style={{ fontWeight: '700', color: '#059669', fontSize: '1.25rem' }}>
                                    {application.dgoRecommendation?.status || 'PENDING'}
                                </div>
                                <div className="recommendation-remarks" style={{ margin: '1rem 0', fontStyle: 'italic', color: '#475569' }}>
                                    "{application.dgoRecommendation?.remarks || 'No remarks provided'}"
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                                    <strong>By:</strong> {application.dgoRecommendation?.recommendedBy || 'N/A'} <br/>
                                    <strong>Date:</strong> {application.dgoRecommendation?.date ? new Date(application.dgoRecommendation.date).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            {/* SGWA Rec */}
                            <div className="officer-card recommendation-sgwa" style={{ borderLeft: '5px solid #3b82f6' }}>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>🏛️</span> SGWA Recommendation
                                </h3>
                                <div style={{ fontWeight: '700', color: '#2563eb', fontSize: '1.25rem' }}>
                                    {application.sgwaRecommendation?.status || 'PENDING'}
                                </div>
                                <div className="recommendation-remarks" style={{ margin: '1rem 0', fontStyle: 'italic', color: '#475569' }}>
                                    "{application.sgwaRecommendation?.remarks || 'No remarks provided'}"
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                                    <strong>By:</strong> {application.sgwaRecommendation?.recommendedBy || 'N/A'} <br/>
                                    <strong>Date:</strong> {application.sgwaRecommendation?.date ? new Date(application.sgwaRecommendation.date).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="viewer-tabs">
                            <button
                                className={`viewer-tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                📋 Application Details
                            </button>
                            <button
                                className={`viewer-tab ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                📂 Documents ({application.documents?.length || 0})
                            </button>
                            <button
                                className={`viewer-tab ${activeTab === 'timeline' ? 'active' : ''}`}
                                onClick={() => setActiveTab('timeline')}
                            >
                                ⏱️ Timeline
                            </button>
                            <button
                                className={`viewer-tab ${activeTab === 'inspection' ? 'active' : ''}`}
                                onClick={() => setActiveTab('inspection')}
                            >
                                🔍 Inspection
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="viewer-content">
                            {activeTab === 'details' && (
                                <div className="details-grid">
                                    <div className="detail-section">
                                        <h3>🏢 Project Information</h3>
                                        <div className="detail-row">
                                            <label>Applicant Name</label>
                                            <span>{application.applicantDetails?.name || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Project Type</label>
                                            <span>{application.projectDetails?.projectType || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <label>Location</label>
                                            <span>{application.locationDetails?.village}, {application.locationDetails?.block}, {application.locationDetails?.district}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="detail-section">
                                        <h3>🚰 Water Allocation</h3>
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
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                                <div className="detail-row">
                                                    <label>Sub-Type</label>
                                                    <span>{application.exemptionDetails.applicationSubType}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Panchayat</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.gramPanchayatName}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Khasra No</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.landDetailsKhasraNo}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Area (Ha)</label>
                                                    <span>{application.exemptionDetails.agriculturalDetails?.landHoldingAreaHectare}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Status</label>
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: application.exemptionDetails.exemptionEligible ? '#16a34a' : '#d97706'
                                                    }}>
                                                        {application.exemptionDetails.exemptionEligible ? 'ELIGIBLE' : 'REVIEW REQUIRED'}
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
                                            <div className="doc-info">
                                                <h4 title={doc.type}>{doc.type?.replace(/_/g, ' ')}</h4>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                                    {doc.verified ? '✅ Verified' : '⏳ Pending'}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a
                                                    href={officerService.getDocumentUrl(doc.id || doc._id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-view"
                                                    style={{ flex: 1, textAlign: 'center' }}
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    {(!application.documents || application.documents.length === 0) && (
                                        <div className="empty-state">
                                            <p>No documents found for this application.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="timeline-container">
                                    <div className="timeline">
                                        {application.timeline?.sort((a,b) => new Date(b.date) - new Date(a.date)).map((event, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <h4>{event.stage?.replace(/_/g, ' ')}</h4>
                                                        <span className="timeline-date">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    <div className="timeline-actor">👤 {event.actor}</div>
                                                    <div className="timeline-remarks">{event.remarks || 'Proceeded to next stage'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inspection' && (
                                <div className="inspection-content">
                                    {application.workflow?.inspectionReport ? (
                                        <div className="inspection-report">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                                <div style={{ fontSize: '2rem' }}>📝</div>
                                                <div>
                                                    <h3 style={{ margin: 0, border: 'none' }}>Site Inspection Report</h3>
                                                    <p style={{ color: '#64748b', margin: 0 }}>Completed on {new Date(application.workflow.inspectionReport.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="details-grid">
                                                <div className="detail-section">
                                                    <div className="detail-row">
                                                        <label>Inspector Name</label>
                                                        <span>{application.workflow.inspectionReport.officer}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <label>GPS Coordinates</label>
                                                        <span>{application.workflow.inspectionReport.coordinates || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', border: 'none' }}>
                                                        <label style={{ marginBottom: '0.5rem' }}>Inspector Findings</label>
                                                        <div style={{
                                                            background: '#f8fafc',
                                                            padding: '1.25rem',
                                                            borderRadius: '12px',
                                                            width: '100%',
                                                            lineHeight: '1.6',
                                                            color: '#334155'
                                                        }}>
                                                            {application.workflow.inspectionReport.findings}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                            <p>No site inspection has been performed yet.</p>
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
                                <span>❌</span> Reject
                            </button>
                            <button
                                className="officer-btn officer-btn-secondary"
                                onClick={handleReturnClick}
                            >
                                <span>↩</span> Return to SGWA
                            </button>
                            <div style={{ flex: 1 }}></div>
                            <button
                                className="officer-btn officer-btn-success"
                                onClick={handleApproveClick}
                                disabled={application.status === 'APPROVED'}
                            >
                                <span>📜</span> Issue NOC
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EnforcementApplicationViewer;
