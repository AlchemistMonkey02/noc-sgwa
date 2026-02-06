import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentVerificationPanel from '../components/DocumentVerificationPanel';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import Timeline from '../shared/components/Timeline';
import StatusBadge from '../shared/components/StatusBadge';
import '../shared/styles/officer-portal.css';

const DGOApplicationDetail = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        fetchApplicationDetails();
        fetchTimeline();
        fetchDocuments();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        // Mock data
        setApplication({
            applicationId: 'NOC2026001234',
            applicationNumber: 'RJ/CGWA/NOC/2026/001234',
            applicantName: 'Rajesh Kumar Sharma',
            email: 'rajesh.sharma@example.com',
            mobile: '9876543210',
            organizationName: 'ABC Industries Pvt Ltd',
            projectName: 'ABC Textile Manufacturing Unit',
            projectType: 'Industrial',
            district: 'Jaipur',
            block: 'Sanganer',
            waterRequirement: '150.25 m³/day',
            submittedDate: '2026-01-09T08:00:00Z',
            status: 'PENDING_VERIFICATION'
        });
    };

    const fetchTimeline = async () => {
        setTimeline([
            {
                type: 'SUBMITTED',
                title: 'Application Submitted',
                timestamp: '2026-01-09T08:00:00Z',
                actor: 'Rajesh Kumar Sharma (Applicant)',
                remarks: 'NOC application submitted for groundwater extraction'
            },
            {
                type: 'PAYMENT_VERIFIED',
                title: 'Payment Verified',
                timestamp: '2026-01-09T08:30:00Z',
                actor: 'System',
                remarks: 'Payment of ₹21,600 verified successfully'
            }
        ]);
    };

    const fetchDocuments = async () => {
        setDocuments([
            { id: 'DOC001', name: 'Land Ownership Certificate', type: 'land_ownership', status: 'PENDING', required: true },
            { id: 'DOC002', name: 'Site Map with GPS Coordinates', type: 'site_map', status: 'PENDING', required: true },
            { id: 'DOC003', name: 'Water Balance Plan', type: 'water_balance', status: 'PENDING', required: true }
        ]);
    };

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
                                    onVerificationComplete={() => fetchDocuments()} // Refresh list after verification
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
