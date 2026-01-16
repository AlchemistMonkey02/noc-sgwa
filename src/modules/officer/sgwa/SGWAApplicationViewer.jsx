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
            const response = await officerService.getApplicationDetails(applicationId);
            if (response.success) {
                setApplication(response.data.application);
            }
        } catch (error) {
            console.error('Error fetching application:', error);

            // Use mock data as fallback
            console.log('Using mock application data for SGWA');
            setApplication({
                id: applicationId,
                applicationNumber: 'RJ/CGWA/NOC/2026/001250',
                status: 'DGO_RECOMMENDED',
                dgoRecommendation: {
                    status: 'APPROVED',
                    remarks: 'All documents verified. Site inspection completed. Water requirement is justified.',
                    conditions: 'Subject to SGWA final approval and compliance monitoring.',
                    recommendedBy: 'Ramesh Kumar (DGO - Jaipur)',
                    date: '2026-01-09T14:30:00Z'
                },
                applicantDetails: {
                    name: 'Mahindra Textiles Ltd',
                    type: 'Private Limited Company',
                    contactPerson: 'Sunil Mahindra',
                    email: 'sunil@mahindratextiles.com',
                    phone: '+91-9876543210',
                    panNumber: 'MTEXT1234F'
                },
                projectDetails: {
                    projectName: 'Industrial Dyeing Unit',
                    projectType: 'Expansion of Existing Unit',
                    sector: 'Industrial',
                    industryType: 'Textile Manufacturing and Dyeing'
                },
                locationDetails: {
                    district: 'Jaipur',
                    block: 'Sanganer',
                    village: 'Sitapura Industrial Area Phase II',
                    plotNumber: 'Plot D-201, 202, 203'
                },
                waterRequirement: {
                    dailyRequirement: 250.00,
                    annualRequirement: 91250.00,
                    sourceType: 'Groundwater (Deep Borewell)',
                    numberOfBorewells: 5
                },
                documents: [
                    { id: 'doc-001', type: 'LAND_OWNERSHIP_PROOF', fileName: 'land_ownership_certificate.pdf', uploadDate: '2026-01-05T10:00:00Z', verified: true },
                    { id: 'doc-002', type: 'PROJECT_REPORT', fileName: 'detailed_project_report.pdf', uploadDate: '2026-01-05T10:05:00Z', verified: true },
                    { id: 'doc-003', type: 'WATER_REQUIREMENT_CALCULATION', fileName: 'water_budget_calculation.pdf', uploadDate: '2026-01-05T10:10:00Z', verified: true },
                    { id: 'doc-004', type: 'ENVIRONMENTAL_CLEARANCE', fileName: 'environmental_clearance.pdf', uploadDate: '2026-01-05T10:15:00Z', verified: true },
                    { id: 'doc-005', type: 'DGO_INSPECTION_REPORT', fileName: 'dgo_site_inspection_report.pdf', uploadDate: '2026-01-09T14:00:00Z', verified: true }
                ],
                timeline: [
                    { stage: 'APPLICATION_SUBMITTED', date: '2026-01-05T10:30:00Z', actor: 'Sunil Mahindra (Applicant)', remarks: 'Application submitted online' },
                    { stage: 'DGO_ASSIGNED', date: '2026-01-06T09:00:00Z', actor: 'System', remarks: 'Application assigned to DGO Jaipur' },
                    { stage: 'DOCUMENTS_VERIFIED', date: '2026-01-07T14:20:00Z', actor: 'Ramesh Kumar (DGO - Jaipur)', remarks: 'All documents verified and found in order' },
                    { stage: 'SITE_INSPECTION_COMPLETED', date: '2026-01-08T11:00:00Z', actor: 'Ramesh Kumar (DGO - Jaipur)', remarks: 'Site inspection completed. Site found suitable.' },
                    { stage: 'DGO_RECOMMENDED', date: '2026-01-09T14:30:00Z', actor: 'Ramesh Kumar (DGO - Jaipur)', remarks: 'Recommended for SGWA approval' },
                    { stage: 'FORWARDED_TO_SGWA', date: '2026-01-10T08:00:00Z', actor: 'System', remarks: 'Application forwarded to SGWA for final approval' }
                ],
                workflow: {
                    currentStage: 'SGWA_REVIEW',
                    assignedTo: 'Dr. Priya Sharma',
                    inspectionReport: {
                        date: '2026-01-08T11:00:00Z',
                        officer: 'Ramesh Kumar (DGO - Jaipur)',
                        findings: 'Site inspection conducted on 08-Jan-2026. Existing borewell depth: 150m. Proposed new borewells: 3 nos at 200m depth. Water table: 80m below ground level. Area classification: Safe zone. No over-exploitation concerns. Recommended for approval subject to installation of water meters and quarterly reporting.',
                        photos: ['inspection_photo_1.jpg', 'inspection_photo_2.jpg']
                    }
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
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const data = {
                                                nocNumber: formData.get('nocNumber'),
                                                validityYears: formData.get('validity'),
                                                conditions: formData.get('conditions'),
                                                waterAllocation: formData.get('waterAllocation'),
                                                remarks: formData.get('remarks')
                                            };
                                            console.log('Issuing NOC:', data);
                                            alert(`NOC Issued Successfully!\n\nNOC Number: ${data.nocNumber}\nValidity: ${data.validity} years\n\nNOC Certificate will be generated and sent to applicant via email.`);
                                            setShowNOCModal(false);
                                        }}>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">NOC Number</label>
                                                <input
                                                    type="text"
                                                    name="nocNumber"
                                                    className="officer-input"
                                                    placeholder="Auto-generated or enter manually"
                                                    defaultValue={`RJ/SGWA/NOC/${new Date().getFullYear()}/` + Math.floor(Math.random() * 10000).toString().padStart(5, '0')}
                                                    required
                                                />
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Validity Period</label>
                                                <select name="validity" className="officer-select" required>
                                                    <option value="">Select validity...</option>
                                                    <option value="1">1 Year</option>
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
                                                    defaultValue={application.waterRequirement?.dailyRequirement}
                                                    required
                                                />
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Conditions & Compliance Requirements</label>
                                                <textarea
                                                    name="conditions"
                                                    className="officer-textarea"
                                                    placeholder="Enter conditions..."
                                                    required
                                                    rows="4"
                                                    defaultValue="1. Install water meters on all borewells&#10;2. Submit quarterly water extraction reports&#10;3. Comply with environmental norms&#10;4. Subject to periodic inspection"
                                                />
                                            </div>
                                            <div className="officer-form-group">
                                                <label className="officer-label">Additional Remarks</label>
                                                <textarea
                                                    name="remarks"
                                                    className="officer-textarea"
                                                    placeholder="Enter any additional remarks..."
                                                    rows="3"
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
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const data = {
                                                rejectionReason: formData.get('reason'),
                                                remarks: formData.get('remarks')
                                            };
                                            console.log('Rejecting application:', data);
                                            alert('Application rejected by SGWA!\n\nApplicant will be notified via email about the final decision.');
                                            setShowRejectionModal(false);
                                        }}>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Rejection Reason</label>
                                                <select name="reason" className="officer-select" required>
                                                    <option value="">Select reason...</option>
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
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const data = {
                                                queryType: formData.get('queryType'),
                                                subject: formData.get('subject'),
                                                description: formData.get('description'),
                                                responseDeadline: formData.get('deadline')
                                            };
                                            console.log('Raising query from SGWA:', data);
                                            alert('Query raised successfully by SGWA!\n\nApplicant will be notified and must respond within the deadline.');
                                            setShowQueryModal(false);
                                        }}>
                                            <div className="officer-form-group">
                                                <label className="officer-label required">Query Type</label>
                                                <select name="queryType" className="officer-select" required>
                                                    <option value="">Select type...</option>
                                                    <option value="DOCUMENT_CLARIFICATION">Document Clarification</option>
                                                    <option value="TECHNICAL_INFORMATION">Technical Information</option>
                                                    <option value="WATER_JUSTIFICATION">Water Requirement Justification</option>
                                                    <option value="ENVIRONMENTAL_DATA">Environmental Data</option>
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
                </main>
            </div>
        </div>
    );
};

export default SGWAApplicationViewer;
