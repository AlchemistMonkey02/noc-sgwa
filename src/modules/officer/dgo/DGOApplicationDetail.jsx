import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentVerificationPanel from '../components/DocumentVerificationPanel';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import Timeline from '../shared/components/Timeline';
import StatusBadge from '../shared/components/StatusBadge';
import '../shared/styles/officer-portal.css';

import officerService from '../services/officerService';

const DGOApplicationDetail = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [documents, setDocuments] = useState([]);

    const fetchData = async () => {
        try {
            const response = await officerService.getApplicationDetails(applicationId);
            if (response.success && response.data) {
                const appData = response.data;
                setApplication({
                    applicationId: appData._id || appData.id,
                    applicationNumber: appData.applicationNumber || appData.trackingId,
                    applicantName: appData.applicantName || appData.applicantDetails?.name || 'N/A',
                    email: appData.email || appData.applicantDetails?.email || 'N/A',
                    mobile: appData.mobile || appData.applicantDetails?.mobile || 'N/A',
                    organizationName: appData.organizationName || appData.projectDetails?.applicantName || 'N/A',
                    projectName: appData.projectName || appData.projectDetails?.projectName || 'N/A',
                    projectType: appData.projectType || appData.projectDetails?.projectType || 'N/A',
                    district: appData.district || appData.locationDetails?.district || 'N/A',
                    block: appData.block || appData.locationDetails?.block || 'N/A',
                    waterRequirement: appData.waterRequirement?.totalTotalRequirement ? `${appData.waterRequirement.totalTotalRequirement} m³/day` : (appData.waterRequirement || '0 m³/day'),
                    submittedDate: appData.submittedDate || new Date().toISOString(),
                    status: appData.status || 'PENDING_VERIFICATION'
                });

                if (appData.history && appData.history.length > 0) {
                    setTimeline(appData.history.map(h => ({
                        type: h.action,
                        title: h.action,
                        timestamp: h.timestamp || h.date,
                        actor: h.actor?.name || 'System',
                        remarks: h.remarks || ''
                    })));
                } else {
                    setTimeline([{
                        type: 'SUBMITTED',
                        title: 'Application Submitted',
                        timestamp: appData.submittedDate || new Date().toISOString(),
                        actor: appData.applicantName || 'Applicant',
                        remarks: 'Application received'
                    }]);
                }

                if (appData.documents && appData.documents.length > 0) {
                    setDocuments(appData.documents.map(d => ({
                        id: d.documentId || d._id,
                        name: d.documentType ? d.documentType.replace('_', ' ') : 'Document',
                        type: d.documentType || 'unknown',
                        status: d.verified || d.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
                        required: true,
                        documentId: d.documentId
                    })));
                } else {
                    setDocuments([]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch application details", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [applicationId]);

    const handleVerifyDocuments = () => {
        navigate(`/officer/dgo/applications/${applicationId}/verify-documents`);
    };

    const handleRaiseQuery = () => {
        navigate(`/officer/dgo/applications/${applicationId}/raise-query`);
    };

    const handleScheduleInspection = () => {
        navigate(`/officer/dgo/applications/${applicationId}/schedule-inspection`);
    };

    if (!application) {
        return <div>Loading...</div>;
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Ramesh Kumar"
                officerRole="DGO"
                officerDesignation="District Groundwater Officer"
                district="Jaipur"
            />

            <div className="officer-layout">
                <OfficerSidebar role="DGO" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="officer-page-header">
                            <div className="officer-flex-between">
                                <div>
                                    <h1 className="officer-page-title">{application.projectName}</h1>
                                    <p className="officer-page-subtitle">
                                        Application No: {application.applicationNumber}
                                    </p>
                                </div>
                                <StatusBadge status={application.status} />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="officer-flex officer-gap-2 officer-mb-4">
                            <button className="officer-btn officer-btn-primary" onClick={handleVerifyDocuments}>
                                📄 Verify Documents
                            </button>
                            <button className="officer-btn officer-btn-secondary" onClick={handleRaiseQuery}>
                                ❓ Raise Query
                            </button>
                            <button className="officer-btn officer-btn-primary" onClick={handleScheduleInspection}>
                                🔍 Schedule Inspection
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            {/* Left Column */}
                            <div>
                                {/* Applicant Details */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                                        👤 Applicant Details
                                    </h3>
                                    <div style={{
                                        background: 'var(--officer-bg-light)',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--officer-border)'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <div className="officer-app-field-label">Name</div>
                                                <div className="officer-app-field-value">{application.applicantName}</div>
                                            </div>
                                            <div>
                                                <div className="officer-app-field-label">Email</div>
                                                <div className="officer-app-field-value">{application.email}</div>
                                            </div>
                                            <div>
                                                <div className="officer-app-field-label">Mobile</div>
                                                <div className="officer-app-field-value">{application.mobile}</div>
                                            </div>
                                            <div>
                                                <div className="officer-app-field-label">Organization</div>
                                                <div className="officer-app-field-value">{application.organizationName}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                                        🏭 Project Details
                                    </h3>
                                    <div style={{
                                        background: 'var(--officer-bg-light)',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--officer-border)'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <div className="officer-app-field-label">Project Type</div>
                                                <div className="officer-app-field-value">{application.projectType}</div>
                                            </div>
                                            <div>
                                                <div className="officer-app-field-label">Water Requirement</div>
                                                <div className="officer-app-field-value">{application.waterRequirement}</div>
                                            </div>
                                            <div>
                                                <div className="officer-app-field-label">District</div>
                                                <div className="officer-app-field-value">{application.district}</div>
                                            </div>
                                            <div>
                                                <div className="officer-app-field-label">Block</div>
                                                <div className="officer-app-field-value">{application.block}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DocumentVerificationPanel
                                    documents={documents}
                                    applicationId={applicationId}
                                    applicationDetails={application}
                                    onVerificationComplete={() => fetchData()} // Refresh list after verification
                                />
                            </div>

                            {/* Right Column - Timeline */}
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                                    📅 Application Timeline
                                </h3>
                                <Timeline events={timeline} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DGOApplicationDetail;
