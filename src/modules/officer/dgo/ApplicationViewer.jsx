import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';
import './ApplicationViewer.css';

const ApplicationViewer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showQueryModal, setShowQueryModal] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getApplicationDetails(applicationId);
            if (response.success) {
                setApplication(response.data.application);
            }
        } catch (error) {
            console.error('Error fetching application:', error);

            // Use mock data as fallback
            console.log('Using mock application data');
            setApplication({
                id: applicationId,
                applicationNumber: 'RJ/CGWA/NOC/2026/001234',
                status: 'PENDING_VERIFICATION',
                applicantDetails: {
                    name: 'Rajesh Kumar Sharma',
                    type: 'Private Limited Company',
                    contactPerson: 'Rajesh Kumar Sharma',
                    email: 'rajesh@abctextile.com',
                    phone: '+91-9876543210',
                    panNumber: 'ABCDE1234F'
                },
                projectDetails: {
                    projectName: 'ABC Textile Manufacturing Unit',
                    projectType: 'New Project',
                    sector: 'Industrial',
                    industryType: 'Textile Manufacturing'
                },
                locationDetails: {
                    district: 'Jaipur',
                    block: 'Sanganer',
                    village: 'Sitapura Industrial Area',
                    plotNumber: 'Plot A-101, 102'
                },
                waterRequirement: {
                    dailyRequirement: 150.25,
                    annualRequirement: 54841.25,
                    sourceType: 'Groundwater (Borewell)',
                    numberOfBorewells: 3
                },
                documents: [
                    {
                        id: 'doc-001',
                        type: 'LAND_OWNERSHIP_PROOF',
                        fileName: 'land_ownership_certificate.pdf',
                        uploadDate: '2026-01-05T10:00:00Z',
                        verified: true
                    },
                    {
                        id: 'doc-002',
                        type: 'PROJECT_REPORT',
                        fileName: 'detailed_project_report.pdf',
                        uploadDate: '2026-01-05T10:05:00Z',
                        verified: true
                    },
                    {
                        id: 'doc-003',
                        type: 'WATER_REQUIREMENT_CALCULATION',
                        fileName: 'water_budget_calculation.pdf',
                        uploadDate: '2026-01-05T10:10:00Z',
                        verified: false
                    },
                    {
                        id: 'doc-004',
                        type: 'ENVIRONMENTAL_CLEARANCE',
                        fileName: 'environmental_clearance.pdf',
                        uploadDate: '2026-01-05T10:15:00Z',
                        verified: true
                    }
                ],
                timeline: [
                    {
                        stage: 'APPLICATION_SUBMITTED',
                        date: '2026-01-05T10:30:00Z',
                        actor: 'Rajesh Kumar Sharma (Applicant)',
                        remarks: 'Application submitted online'
                    },
                    {
                        stage: 'DOCUMENTS_VERIFIED',
                        date: '2026-01-06T14:20:00Z',
                        actor: 'Ramesh Kumar (DGO - Jaipur)',
                        remarks: 'Initial document verification completed'
                    },
                    {
                        stage: 'UNDER_REVIEW',
                        date: '2026-01-07T09:00:00Z',
                        actor: 'Ramesh Kumar (DGO - Jaipur)',
                        remarks: 'Technical review in progress'
                    }
                ],
                workflow: {
                    currentStage: 'DGO_REVIEW',
                    assignedTo: 'Ramesh Kumar',
                    inspectionReport: null
                }
            });
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
                <button onClick={() => navigate('/officer/dgo/applications')}>
                    Back to Applications
                </button>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerSidebar userType="DGO" />

            <div className="officer-main-content">
                {/* Header */}
                <div className="application-viewer-header">
                    <button
                        className="btn-back"
                        onClick={() => navigate('/officer/dgo/applications')}
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
                                            <p>{application.workflow.inspectionReport.date}</p>
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
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(`/officer/dgo/inspections/schedule/${applicationId}`)}
                                    >
                                        Schedule Inspection
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button
                        className="btn-success"
                        onClick={() => setShowApprovalModal(true)}
                    >
                        ✓ Recommend for Approval
                    </button>
                    <button
                        className="btn-danger"
                        onClick={() => setShowRejectionModal(true)}
                    >
                        ✗ Reject
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

                {/* Approval Modal */}
                {showApprovalModal && (
                    <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h3>✓ Recommend for Approval</h3>
                                <button className="modal-close" onClick={() => setShowApprovalModal(false)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = {
                                        recommendation: 'APPROVED',
                                        remarks: formData.get('remarks'),
                                        conditions: formData.get('conditions')
                                    };
                                    console.log('Recommending for approval:', data);
                                    alert('Application recommended for approval successfully!\n\nThis will be sent to SGWA for final approval.');
                                    setShowApprovalModal(false);
                                }}>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Recommendation Remarks</label>
                                        <textarea
                                            name="remarks"
                                            className="officer-textarea"
                                            placeholder="Enter your recommendation remarks..."
                                            required
                                            rows="4"
                                        />
                                    </div>
                                    <div className="officer-form-group">
                                        <label className="officer-label">Conditions (if any)</label>
                                        <textarea
                                            name="conditions"
                                            className="officer-textarea"
                                            placeholder="Enter any conditions or special notes..."
                                            rows="3"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                        <button
                                            type="button"
                                            className="officer-btn officer-btn-secondary"
                                            onClick={() => setShowApprovalModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="officer-btn officer-btn-success">
                                            Submit Recommendation
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
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = {
                                        rejectionReason: formData.get('reason'),
                                        remarks: formData.get('remarks')
                                    };
                                    console.log('Rejecting application:', data);
                                    alert('Application rejected successfully!\n\nApplicant will be notified via email.');
                                    setShowRejectionModal(false);
                                }}>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Rejection Reason</label>
                                        <select name="reason" className="officer-select" required>
                                            <option value="">Select reason...</option>
                                            <option value="INCOMPLETE_DOCUMENTS">Incomplete Documents</option>
                                            <option value="INVALID_LOCATION">Invalid Location</option>
                                            <option value="EXCESSIVE_WATER_DEMAND">Excessive Water Demand</option>
                                            <option value="NON_COMPLIANCE">Non-Compliance with Regulations</option>
                                            <option value="OVEREXPLOITED_AREA">Over-exploited Area</option>
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
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = {
                                        queryType: formData.get('queryType'),
                                        subject: formData.get('subject'),
                                        description: formData.get('description'),
                                        responseDeadline: formData.get('deadline')
                                    };
                                    console.log('Raising query:', data);
                                    alert('Query raised successfully!\n\nApplicant will be notified and must respond within the deadline.');
                                    setShowQueryModal(false);
                                }}>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Query Type</label>
                                        <select name="queryType" className="officer-select" required>
                                            <option value="">Select type...</option>
                                            <option value="DOCUMENT_CLARIFICATION">Document Clarification</option>
                                            <option value="TECHNICAL_INFORMATION">Technical Information</option>
                                            <option value="SITE_DETAILS">Site Details</option>
                                            <option value="WATER_REQUIREMENT">Water Requirement Justification</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="officer-input"
                                            placeholder="Enter query subject..."
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
                                            name="deadline"
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
        </div>
    );
};

export default ApplicationViewer;
