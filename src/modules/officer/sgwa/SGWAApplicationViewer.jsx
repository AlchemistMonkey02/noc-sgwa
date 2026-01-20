import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import OfficerHeader from '../shared/components/OfficerHeader';
import '../shared/styles/officer-portal.css';
import '../dgo/ApplicationViewer.css';

const SGWAApplicationViewer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showNOCModal, setShowNOCModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showQueryModal, setShowQueryModal] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getSGWAApplicationDetails(applicationId);
            if (response.success) {
                const appData = response.data.application || response.data;

                // Normalize data structure
                const normalizedApp = {
                    ...appData,
                    applicantDetails: appData.applicantDetails || { name: appData.projectDetails?.applicantName },
                    projectDetails: appData.projectDetails || {},
                    locationDetails: appData.locationDetails || {},
                    waterRequirement: appData.waterRequirement || {},
                    documents: appData.documents || [],
                    timeline: appData.timeline || [],
                    dgoRecommendation: appData.dgoRecommendation || { status: 'PENDING' } // Handle missing recommendation
                };

                setApplication(normalizedApp);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            // No mock data fallback - strictly API driven
            setApplication(null);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
    };

    const handleDownloadDocument = async (documentId, fileName) => {
        try {
            const blob = await officerService.downloadDocument(documentId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Failed to download document');
        }
    };

    const handleVerifyAllDocuments = async () => {
        if (!application.documents || application.documents.length === 0) return;

        try {
            const documentIds = application.documents.map(d => d.id || d._id);
            const response = await officerService.verifySGWADocumentsBulk({
                documentIds,
                applicationId: application.id, // Some backends might need this
                status: 'ACCEPTED',
                remarks: 'Verified by State Authority'
            });

            if (response.success) {
                alert('All documents verified successfully!');
                fetchApplicationDetails();
            }
        } catch (error) {
            console.error('Error verifying documents:', error);
            alert('Failed to verify documents: ' + error.message);
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
                <button onClick={() => navigate('/officer/sgwa/applications')}>
                    Back to Applications
                </button>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Dr. Priya Sharma"
                officerRole="SGWA"
                officerDesignation="Technical Officer"
                district="State Level"
            />

            <div className="officer-layout">
                <OfficerSidebar role="SGWA" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Header */}
                        <div className="application-viewer-header">
                            <button
                                className="btn-back"
                                onClick={() => navigate('/officer/sgwa/applications')}
                            >
                                ← Back
                            </button>
                            <div className="header-details">
                                <h1>{application.applicationNumber}</h1>
                                <span className={`status-badge status-${application.status?.toLowerCase().replace(/_/g, '-')}`}>
                                    {application.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Application Summary Card */}
                        <div className="application-summary-card">
                            <div className="summary-row">
                                <div className="summary-item">
                                    <label>Applicant Name</label>
                                    <p>{application.applicantDetails?.name}</p>
                                </div>
                                <div className="summary-item">
                                    <label>Project Name</label>
                                    <p>{application.projectDetails?.projectName}</p>
                                </div>
                                <div className="summary-item">
                                    <label>District</label>
                                    <p>{application.locationDetails?.district}</p>
                                </div>
                                <div className="summary-item">
                                    <label>Water Requirement</label>
                                    <p>{application.waterRequirement?.dailyRequirement} m³/day</p>
                                </div>
                            </div>
                        </div>

                        {/* DGO Recommendation Box (SGWA-specific) */}
                        {application.dgoRecommendation && (
                            <div style={{
                                background: application.dgoRecommendation.status === 'APPROVED'
                                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                                border: `2px solid ${application.dgoRecommendation.status === 'APPROVED' ? '#22c55e' : '#ef4444'}`,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{
                                    margin: '0 0 1rem 0',
                                    color: application.dgoRecommendation.status === 'APPROVED' ? '#16a34a' : '#dc2626',
                                    fontSize: '1.125rem',
                                    fontWeight: '600'
                                }}>
                                    {application.dgoRecommendation.status === 'APPROVED' ? '✓' : '✗'} DGO Recommendation: {application.dgoRecommendation.status}
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div>
                                        <strong>Remarks:</strong>
                                        <p style={{ margin: '0.5rem 0 0 0' }}>{application.dgoRecommendation.remarks}</p>
                                    </div>
                                    {application.dgoRecommendation.conditions && (
                                        <div>
                                            <strong>Conditions:</strong>
                                            <p style={{ margin: '0.5rem 0 0 0' }}>{application.dgoRecommendation.conditions}</p>
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.875rem', color: 'var(--officer-text-light)' }}>
                                        Recommended by: {application.dgoRecommendation.recommendedBy} on {new Date(application.dgoRecommendation.date).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="application-tabs">
                            <button
                                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Application Details
                            </button>
                            <button
                                className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                Documents ({application.documents?.length || 0})
                            </button>
                            <button
                                className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                                onClick={() => setActiveTab('timeline')}
                            >
                                Timeline
                            </button>
                            <button
                                className={`tab ${activeTab === 'inspection' ? 'active' : ''}`}
                                onClick={() => setActiveTab('inspection')}
                            >
                                Inspection
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'details' && (
                                <div className="details-tab">
                                    {/* Applicant Details */}
                                    <div className="detail-section">
                                        <h3>👤 Applicant Details</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Name</label>
                                                <p>{application.applicantDetails?.name}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Type</label>
                                                <p>{application.applicantDetails?.type}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Contact Person</label>
                                                <p>{application.applicantDetails?.contactPerson}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Email</label>
                                                <p>{application.applicantDetails?.email}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Phone</label>
                                                <p>{application.applicantDetails?.phone}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>PAN Number</label>
                                                <p>{application.applicantDetails?.panNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Details */}
                                    <div className="detail-section">
                                        <h3>🏭 Project Details</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Project Name</label>
                                                <p>{application.projectDetails?.projectName}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Project Type</label>
                                                <p>{application.projectDetails?.projectType}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Sector</label>
                                                <p>{application.projectDetails?.sector}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Industry Type</label>
                                                <p>{application.projectDetails?.industryType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Details */}
                                    <div className="detail-section">
                                        <h3>📍 Location Details</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>District</label>
                                                <p>{application.locationDetails?.district}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Block</label>
                                                <p>{application.locationDetails?.block}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Village</label>
                                                <p>{application.locationDetails?.village}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Plot Number</label>
                                                <p>{application.locationDetails?.plotNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Water Requirement */}
                                    <div className="detail-section">
                                        <h3>💧 Water Requirement</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Daily Requirement</label>
                                                <p>{application.waterRequirement?.dailyRequirement} m³/day</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Annual Requirement</label>
                                                <p>{application.waterRequirement?.annualRequirement} m³/year</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Source Type</label>
                                                <p>{application.waterRequirement?.sourceType}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Number of Borewells</label>
                                                <p>{application.waterRequirement?.numberOfBorewells}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="documents-tab">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                        <button
                                            className="officer-btn officer-btn-primary"
                                            onClick={handleVerifyAllDocuments}
                                            disabled={application.documents?.every(d => d.verified)}
                                        >
                                            ✓ Verify All Documents
                                        </button>
                                    </div>
                                    <div className="documents-grid">
                                        {application.documents && application.documents.length > 0 ? (
                                            application.documents.map((doc, index) => (
                                                <div key={index} className="document-card">
                                                    <div className="document-icon">📄</div>
                                                    <div className="document-info">
                                                        <h4>{doc.type?.replace(/_/g, ' ')}</h4>
                                                        <p className="document-filename">{doc.fileName}</p>
                                                        <p className="document-date">
                                                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                                        </p>
                                                        {doc.verified && (
                                                            <span className="verified-badge">✓ Verified</span>
                                                        )}
                                                    </div>
                                                    <div className="document-actions">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleViewDocument(doc)}
                                                            title="View Document"
                                                        >
                                                            👁️
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                                                            title="Download"
                                                        >
                                                            📥
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                <p>No documents uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="timeline-tab">
                                    <div className="timeline">
                                        {application.timeline && application.timeline.length > 0 ? (
                                            application.timeline.map((event, index) => (
                                                <div key={index} className="timeline-item">
                                                    <div className="timeline-marker"></div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-header">
                                                            <h4>{event.stage?.replace(/_/g, ' ')}</h4>
                                                            <span className="timeline-date">
                                                                {new Date(event.date).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="timeline-actor">{event.actor}</p>
                                                        {event.remarks && (
                                                            <p className="timeline-remarks">{event.remarks}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                <p>No timeline events</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inspection' && (
                                <div className="inspection-tab">
                                    {application.workflow?.inspectionReport ? (
                                        <div className="inspection-report">
                                            <h3>Inspection Report</h3>
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

                        {/* SGWA Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="btn-success"
                                onClick={() => setShowNOCModal(true)}
                                style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
                            >
                                ✓ Approve & Issue NOC
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => setShowRejectionModal(true)}
                            >
                                ✗ Reject Application
                            </button>
                            <button
                                className="btn-warning"
                                onClick={() => setShowQueryModal(true)}
                            >
                                ❓ Raise Query
                            </button>
                        </div>

                        {/* Document Viewer Modal */}
                        {selectedDocument && (
                            <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
                                <div className="modal-content document-viewer" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>{selectedDocument.fileName}</h3>
                                        <button
                                            className="modal-close"
                                            onClick={() => setSelectedDocument(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <iframe
                                            src={officerService.getDocumentUrl(selectedDocument.id)}
                                            title={selectedDocument.fileName}
                                            width="100%"
                                            height="600px"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NOC Issuance Modal (SGWA-specific) */}
                        {showNOCModal && (
                            <div className="modal-overlay" onClick={() => setShowNOCModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                                    <div className="modal-header">
                                        <h3>✓ Approve Application & Issue NOC</h3>
                                        <button className="modal-close" onClick={() => setShowNOCModal(false)}>✕</button>
                                    </div>
                                    <div className="modal-body">
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            try {
                                                const formData = new FormData(e.target);

                                                // Construct payload exactly as requested
                                                const data = {
                                                    remarks: formData.get('remarks'),
                                                    nocValidityYears: parseInt(formData.get('validity'), 10),
                                                    waterAllocation: parseFloat(formData.get('waterAllocation'))
                                                };

                                                const response = await officerService.approveApplication(applicationId, data);
                                                if (response.success) {
                                                    alert(`NOC Issued Successfully!\n\nValidity: ${data.nocValidityYears} years\nWater Allocation: ${data.waterAllocation} m³/day`);
                                                    setShowNOCModal(false);
                                                    fetchApplicationDetails(); // Refresh details
                                                }
                                            } catch (error) {
                                                console.error('Error issuing NOC:', error);
                                                alert('Failed to issue NOC: ' + error.message);
                                            }
                                        }}>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Validity Period (Years)</label>
                                                <select name="validity" className="officer-select" required>
                                                    <option value="">Select validity...</option>
                                                    <option value="1">1 Year</option>
                                                    <option value="2">2 Years</option>
                                                    <option value="3">3 Years</option>
                                                    <option value="5">5 Years</option>
                                                    <option value="10">10 Years</option>
                                                </select>
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Water Allocation (m³/day)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="waterAllocation"
                                                    className="officer-input"
                                                    defaultValue={application.waterRequirement?.dailyRequirement || 0}
                                                    required
                                                />
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Remarks / Conditions</label>
                                                <textarea
                                                    name="remarks"
                                                    className="officer-textarea"
                                                    placeholder="Technical Review cleared. Forwarding for final NOC issuance."
                                                    required
                                                    rows="4"
                                                    defaultValue="Technical Review cleared. Forwarding for final NOC issuance."
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                                <button
                                                    type="button"
                                                    className="officer-btn officer-btn-secondary"
                                                    onClick={() => setShowNOCModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="officer-btn officer-btn-success">
                                                    Issue NOC Certificate
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rejection Modal */}
                        {showRejectionModal && (
                            <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                                    <div className="modal-header">
                                        <h3>✗ Reject Application</h3>
                                        <button className="modal-close" onClick={() => setShowRejectionModal(false)}>✕</button>
                                    </div>
                                    <div className="modal-body">
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            try {
                                                const formData = new FormData(e.target);
                                                const data = {
                                                    reasonCode: formData.get('reasonCode'),
                                                    remarks: formData.get('remarks')
                                                };

                                                const response = await officerService.sgwaRejectApplication(applicationId, data);
                                                if (response.success) {
                                                    alert('Application rejected by SGWA!\n\nApplicant will be notified via email about the final decision.');
                                                    setShowRejectionModal(false);
                                                    fetchApplicationDetails(); // Refresh details
                                                }
                                            } catch (error) {
                                                console.error('Error rejecting application:', error);
                                                alert('Failed to reject application: ' + error.message);
                                            }
                                        }}>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Rejection Reason</label>
                                                <select name="reasonCode" className="officer-select" required>
                                                    <option value="">Select reason...</option>
                                                    <option value="CRITICAL_ZONE_VIOLATION">Critical Zone Violation</option>
                                                    <option value="INSUFFICIENT_JUSTIFICATION">Insufficient Justification</option>
                                                    <option value="OVEREXPLOITED_AREA">Over-exploited Area</option>
                                                    <option value="ENVIRONMENTAL_CONCERNS">Environmental Concerns</option>
                                                    <option value="EXCESSIVE_WATER_DEMAND">Excessive Water Demand</option>
                                                    <option value="NON_COMPLIANCE">Non-Compliance with Regulations</option>
                                                    <option value="TECHNICAL_GROUNDS">Technical Grounds</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Detailed Remarks</label>
                                                <textarea
                                                    name="remarks"
                                                    className="officer-textarea"
                                                    placeholder="Enter detailed reasons for rejection..."
                                                    required
                                                    rows="5"
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                                <button
                                                    type="button"
                                                    className="officer-btn officer-btn-secondary"
                                                    onClick={() => setShowRejectionModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="officer-btn officer-btn-danger">
                                                    Confirm Rejection
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Query Modal */}
                        {showQueryModal && (
                            <div className="modal-overlay" onClick={() => setShowQueryModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                                    <div className="modal-header">
                                        <h3>❓ Raise Query</h3>
                                        <button className="modal-close" onClick={() => setShowQueryModal(false)}>✕</button>
                                    </div>
                                    <div className="modal-body">
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            try {
                                                const formData = new FormData(e.target);
                                                const data = {
                                                    queryTitle: formData.get('queryTitle'),
                                                    description: formData.get('description'),
                                                    responseDeadline: formData.get('responseDeadline')
                                                };

                                                const response = await officerService.sgwaRaiseQuery(applicationId, data);
                                                if (response.success) {
                                                    alert('Query raised successfully by SGWA!\n\nApplicant will be notified and must respond within the deadline.');
                                                    setShowQueryModal(false);
                                                    fetchApplicationDetails(); // Refresh details
                                                }
                                            } catch (error) {
                                                console.error('Error raising query:', error);
                                                alert('Failed to raise query: ' + error.message);
                                            }
                                        }}>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Query Title / Subject</label>
                                                <input
                                                    type="text"
                                                    name="queryTitle"
                                                    className="officer-input"
                                                    placeholder="e.g. Borewell Depth Clarification"
                                                    required
                                                />
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Query Description</label>
                                                <textarea
                                                    name="description"
                                                    className="officer-textarea"
                                                    placeholder="Enter detailed query description..."
                                                    required
                                                    rows="5"
                                                />
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Response Deadline</label>
                                                <input
                                                    type="date"
                                                    name="responseDeadline"
                                                    className="officer-input"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    required
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                                <button
                                                    type="button"
                                                    className="officer-btn officer-btn-secondary"
                                                    onClick={() => setShowQueryModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="officer-btn" style={{ background: '#f59e0b', color: 'white' }}>
                                                    Send Query
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SGWAApplicationViewer;
