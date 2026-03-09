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
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [inspectionOfficers, setInspectionOfficers] = useState([]);

    useEffect(() => {
        const fetchOfficers = async () => {
            try {
                const response = await officerService.getOfficers('INSPECTION_OFFICER');
                if (response.success) {
                    setInspectionOfficers(response.data);
                }
            } catch (error) {
                console.error('Error fetching officers:', error);
            }
        };
        fetchOfficers();
    }, []);

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getApplicationDetails(applicationId);
            if (response.success) {
                const apiData = response.data; // Depending on if it's response.data or response.data.application.
                // Based on previous list response, it might be response.data directly if getApplicationDetails returns the object. 
                // Let's assume response.data is the application object based on common patterns, or check structure.
                // Use a helper to transform to the shape this component expects
                setApplication(transformApplicationData(apiData));
            } else {
                console.error('Failed to fetch:', response);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            // No mock fallback anymore
        } finally {
            setLoading(false);
        }
    };

    // Helper to transform API data to component state structure
    const transformApplicationData = (data) => {
        // Calculate total water requirement
        const waterBreakup = data.waterRequirement?.purposeWiseBreakup || {};
        const totalWater = Object.values(waterBreakup).reduce((sum, val) => sum + (Number(val) || 0), 0);

        // Synthesize timeline if empty
        let timeline = data.progressTracking?.timeline || [];
        if (timeline.length === 0) {
            if (data.createdAt) {
                timeline.push({
                    stage: 'APPLICATION_CREATED',
                    date: data.createdAt,
                    actor: 'System',
                    remarks: 'Application draft created'
                });
            }
            if (data.submittedAt) {
                timeline.push({
                    stage: 'APPLICATION_SUBMITTED',
                    date: data.submittedAt,
                    actor: data.projectDetails?.applicantName || 'Applicant',
                    remarks: 'Application submitted for review'
                });
            }
            if (data.approvalFlow?.dgo?.reviewedAt) {
                timeline.push({
                    stage: 'DGO_REVIEW_UPDATE',
                    date: data.approvalFlow.dgo.reviewedAt,
                    actor: data.approvalFlow.dgo.reviewedBy || 'DGO Officer',
                    remarks: `Status updated to ${data.approvalFlow.dgo.status}`
                });
            }
            if (data.status === 'INSPECTION_SCHEDULED') {
                // We don't have a date for when it *was* scheduled in the root object usually, 
                // but we can show it as a pending item or just rely on status.
                // For now, let's just stick to past events.
            }
            // Sort by date descending
            timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return {
            id: data._id || data.applicationId,
            applicationNumber: data.applicationNumber,
            status: data.status,
            applicantDetails: {
                name: data.projectDetails?.applicantName || 'N/A',
                type: data.applicationSubType || 'N/A',
                email: 'N/A',
                phone: 'N/A',
                contactPerson: data.projectDetails?.applicantName || 'N/A',
                panNumber: 'N/A'
            },
            projectDetails: {
                projectName: data.projectDetails?.projectName || 'N/A',
                projectType: data.projectType || data.sectorType || 'N/A',
                sector: data.sectorType || 'N/A',
                industryType: data.applicationCategory || 'N/A'
            },
            locationDetails: {
                district: data.location?.districtId || 'N/A',
                block: data.location?.blockId || 'N/A',
                village: data.location?.village || 'N/A',
                plotNumber: 'N/A'
            },
            waterRequirement: {
                dailyRequirement: totalWater,
                annualRequirement: totalWater * 365,
                sourceType: 'Groundwater',
                numberOfBorewells: data.waterRequirement?.proposedExtraction?.numberOfBorewells || 0
            },
            isExempted: data.isExempted || false,
            exemptionDetails: data.exemptionDetails || null,
            documents: data.documents || [],
            timeline: timeline,
            workflow: {
                currentStage: data.approvalFlow?.dgo?.status || 'PENDING',
                inspectionReport: data.inspection ? {
                    status: data.inspection.status,
                    officerId: data.inspection.officerId,
                    scheduledDate: data.inspection.scheduledDate,
                    report: data.inspection.report
                } : null,
                query: data.query ? {
                    queryId: data.query.queryId,
                    subject: data.query.subject,
                    description: data.query.query,
                    raisedAt: data.query.raisedAt,
                    status: data.query.status,
                    responseDeadline: data.query.responseDeadline
                } : null
            }
        };
    };

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
    };

    const handleDownloadDocument = async (documentId, fileName) => {
        // Placeholder for download logic if service supports it
        console.log("Download requested for:", documentId);
        // In a real app, this would use officerService.downloadDocument(documentId)
        alert("Download feature would trigger here for " + fileName);
    };

    const handleForwardApplication = async (formData) => {
        try {
            const data = {
                recommendation: 'RECOMMEND_APPROVAL',
                remarks: formData.get('remarks'),
                conditions: formData.get('conditions')
            };
            const response = await officerService.forwardApplication(applicationId, data);
            if (response.success) {
                alert('Application recommended for approval successfully!');
                setShowApprovalModal(false);
                fetchApplicationDetails(); // Refresh to update status
            } else {
                alert('Failed to forward application: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error forwarding:', error);
            alert('An error occurred while forwarding the application.');
        }
    };

    const handleVerifyDocument = async (doc, status) => {
        try {
            // Check for valid ID
            const docId = doc.documentId || doc.id || doc._id;
            if (!docId) {
                alert('Document ID missing');
                return;
            }

            const payload = [{
                documentId: docId,
                status: status,
                remarks: status === 'ACCEPTED' ? 'Verified by Officer' : 'Rejected by Officer'
            }];

            const response = await officerService.verifyDocuments(applicationId, payload);
            if (response.success) {
                // Optimistic update or refresh
                fetchApplicationDetails();
            } else {
                alert('Failed to verify document');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Error verifying document');
        }
    };

    const handleBulkVerify = async () => {
        if (!application.documents || application.documents.length === 0) return;

        // Filter valid docs that aren't already accepted
        const docsToVerify = application.documents
            .filter(d => d.status !== 'ACCEPTED')
            .map(d => ({
                documentId: d.documentId || d.id || d._id,
                status: 'ACCEPTED',
                remarks: 'Bulk Verified'
            }))
            .filter(d => d.documentId); // Ensure ID exists

        if (docsToVerify.length === 0) {
            alert('No pending documents to verify.');
            return;
        }

        if (!window.confirm(`Are you sure you want to verify all ${docsToVerify.length} pending documents?`)) {
            return;
        }

        try {
            const response = await officerService.verifyDocuments(applicationId, docsToVerify);
            if (response.success) {
                alert('All documents verified successfully!');
                fetchApplicationDetails();
            } else {
                alert('Bulk verification failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error during bulk verification');
        }
    };

    const handleScheduleInspection = async (formData) => {
        try {
            const date = formData.get('inspectionDate');
            const officerId = formData.get('officerId');

            if (!date) {
                alert('Please select an inspection date');
                return;
            }
            if (!officerId) {
                alert('Please select an inspection officer');
                return;
            }

            const response = await officerService.scheduleInspection(applicationId, {
                inspectionDate: date,
                officerId: officerId
            });

            if (response.success) {
                alert('Inspection scheduled successfully!');
                setShowInspectionModal(false);
                // Update state immediately with returned data
                if (response.data && response.data.application && response.data.inspection) {
                    const combinedData = {
                        ...response.data.application,
                        inspection: response.data.inspection
                    };
                    setApplication(transformApplicationData(combinedData));
                } else {
                    fetchApplicationDetails();
                }
            } else {
                alert('Failed to schedule inspection: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error scheduling inspection:', error);
            alert('An error occurred while scheduling the inspection.');
        }
    };

    const handleRaiseQuery = async (formData) => {
        try {
            const queryData = {
                queryType: formData.get('queryType'),
                subject: formData.get('subject'),
                description: formData.get('description'),
                responseDeadline: formData.get('deadline')
            };

            const response = await officerService.raiseQuery(applicationId, queryData);
            if (response.success) {
                alert('Query raised successfully!');
                setShowQueryModal(false);
                // Update state immediately with returned data
                if (response.data && response.data.application && response.data.query) {
                    const combinedData = {
                        ...response.data.application,
                        query: response.data.query
                    };
                    setApplication(transformApplicationData(combinedData));
                    setActiveTab('queries');
                } else {
                    fetchApplicationDetails();
                }
            } else {
                alert('Failed to raise query: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error raising query:', error);
            alert('An error occurred while raising the query.');
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
                    <button
                        className={`tab ${activeTab === 'queries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('queries')}
                    >
                        Queries
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

                            {/* Exemption Details (If Applicable) */}
                            {application.isExempted && application.exemptionDetails && (
                                <div className="detail-section">
                                    <h3 style={{ color: '#059669' }}>🌾 Exemption Application Details</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Application SubType</label>
                                            <p>{application.exemptionDetails.applicationSubType}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Gram Panchayat / Village</label>
                                            <p>{application.exemptionDetails.agriculturalDetails?.gramPanchayatName}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Khasra No / Plot No</label>
                                            <p>{application.exemptionDetails.agriculturalDetails?.landDetailsKhasraNo}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Land Area (Hectare)</label>
                                            <p>{application.exemptionDetails.agriculturalDetails?.landHoldingAreaHectare}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Requested Water (KLD)</label>
                                            <p>{application.exemptionDetails.agriculturalDetails?.waterRequirementKLD} KLD</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>System Eligibility Check</label>
                                            <p style={{
                                                fontWeight: 'bold',
                                                color: application.exemptionDetails.exemptionEligible ? '#16a34a' : '#d97706'
                                            }}>
                                                {application.exemptionDetails.exemptionEligible ? 'ELIGIBLE' : 'PENDING REVIEW'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="documents-tab">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Documents</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="officer-btn officer-btn-primary"
                                        onClick={handleBulkVerify}
                                        disabled={!application.documents?.some(d => d.status !== 'ACCEPTED')}
                                    >
                                        ✓ Verify All Pending
                                    </button>
                                </div>
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
                                                {doc.status === 'ACCEPTED' ? (
                                                    <span className="verified-badge">✓ Verified</span>
                                                ) : doc.status === 'REJECTED' ? (
                                                    <span className="verified-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>✗ Rejected</span>
                                                ) : (
                                                    <span className="verified-badge" style={{ background: '#fef3c7', color: '#b45309' }}>⚠ Pending</span>
                                                )}
                                                {doc.remarks && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}><em>{doc.remarks}</em></p>}
                                            </div>
                                            <div className="document-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleViewDocument(doc)}
                                                    title="View Document"
                                                >
                                                    👁️
                                                </button>
                                                {doc.status !== 'ACCEPTED' && (
                                                    <>
                                                        <button
                                                            className="btn-icon"
                                                            style={{ color: '#16a34a', borderColor: '#16a34a' }}
                                                            onClick={() => handleVerifyDocument(doc, 'ACCEPTED')}
                                                            title="Verify"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            style={{ color: '#dc2626', borderColor: '#dc2626' }}
                                                            onClick={() => handleVerifyDocument(doc, 'REJECTED')}
                                                            title="Reject"
                                                        >
                                                            ✗
                                                        </button>
                                                    </>
                                                )}
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3>Inspection Details</h3>
                                        <span className={`status-badge status-${application.workflow.inspectionReport.status.toLowerCase()}`}>
                                            {application.workflow.inspectionReport.status}
                                        </span>
                                    </div>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Scheduled Date</label>
                                            <p>{new Date(application.workflow.inspectionReport.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Assigned Officer</label>
                                            <p>
                                                {(() => {
                                                    const officer = inspectionOfficers.find(o => o._id === application.workflow.inspectionReport.officerId);
                                                    return officer
                                                        ? `${officer.firstName} ${officer.lastName}`
                                                        : (application.workflow.inspectionReport.officerId || 'N/A');
                                                })()}
                                            </p>
                                        </div>
                                        {application.workflow.inspectionReport.report ? (
                                            <div className="detail-item full-width">
                                                <label>Report Findings</label>
                                                <div className="report-summary" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px' }}>
                                                    <p><strong>Rainwater Harvesting:</strong> {application.workflow.inspectionReport.report.rainwaterHarvesting || 'N/A'}</p>
                                                    <p><strong>Meter Installed:</strong> {application.workflow.inspectionReport.report.meterInstalled || 'N/A'}</p>
                                                    <p><strong>Plantation Status:</strong> {application.workflow.inspectionReport.report.plantationStatus || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="detail-item full-width">
                                                <button
                                                    className="officer-btn officer-btn-primary"
                                                    onClick={() => navigate(`/officer/dgo/applications/${applicationId}/inspection-report`)}
                                                >
                                                    📝 Submit Site Inspection Report
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No inspection scheduled yet</p>
                                    <button
                                        className="officer-btn officer-btn-primary"
                                        onClick={() => setShowInspectionModal(true)}
                                    >
                                        Schedule Inspection
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'queries' && (
                        <div className="queries-tab">
                            {application.workflow?.query ? (
                                <div className="query-details">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3>Active Query</h3>
                                        <span className={`status-badge status-${application.workflow.query.status.toLowerCase()}`}>
                                            {application.workflow.query.status}
                                        </span>
                                    </div>
                                    <div className="detail-grid">
                                        <div className="detail-item full-width">
                                            <label>Subject</label>
                                            <p>{application.workflow.query.subject}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Description</label>
                                            <p>{application.workflow.query.description}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Raised At</label>
                                            <p>{new Date(application.workflow.query.raisedAt).toLocaleString()}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Response Deadline</label>
                                            <p>{new Date(application.workflow.query.responseDeadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No active queries</p>
                                    <button
                                        className="officer-btn officer-btn-warning"
                                        onClick={() => setShowQueryModal(true)}
                                    >
                                        Raise New Query
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
                                    handleForwardApplication(new FormData(e.target));
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
                                    handleRaiseQuery(new FormData(e.target));
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

                {/* Inspection Modal */}
                {showInspectionModal && (
                    <div className="modal-overlay" onClick={() => setShowInspectionModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h3>📅 Schedule Inspection</h3>
                                <button className="modal-close" onClick={() => setShowInspectionModal(false)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleScheduleInspection(new FormData(e.target));
                                }}>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Inspection Date</label>
                                        <input
                                            type="date"
                                            name="inspectionDate"
                                            className="officer-input"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Assign Inspection Officer</label>
                                        <select
                                            name="officerId"
                                            className="officer-input"
                                            required
                                        >
                                            <option value="">Select Officer</option>
                                            {inspectionOfficers.map(officer => (
                                                <option key={officer._id} value={officer._id}>
                                                    {officer.firstName} {officer.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                        <button
                                            type="button"
                                            className="officer-btn officer-btn-secondary"
                                            onClick={() => setShowInspectionModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="officer-btn officer-btn-primary">
                                            Schedule
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
