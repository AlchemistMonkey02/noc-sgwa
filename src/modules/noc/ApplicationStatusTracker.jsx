import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const ApplicationStatusTracker = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [estimate, setEstimate] = useState(null);
    const [approvalFlow, setApprovalFlow] = useState(null);

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                // Determine if we are tracking by DB ID (UUID) or Application Number (NOC/...)
                const response = await nocApplicationService.trackApplication(encodeURIComponent(id));

                if (response.success && response.data) {
                    const data = response.data;

                    // Populate basic details
                    setApplication({
                        id: data.applicationId || data.applicationNumber || id,
                        applicationNumber: data.applicationNumber || data.applicationId,
                        trackingId: data.trackingId,
                        projectName: data.projectName || data.projectDetails?.projectName || 'N/A',
                        submittedDate: data.submittedDate ? new Date(data.submittedDate).toLocaleDateString() : 'N/A',
                        status: data.status,
                        statusColor: data.status === 'APPROVED' ? 'success' : (data.status === 'REJECTED' ? 'danger' : 'info'),
                        applicantName: data.applicantDetails?.name || 'Applicant',
                        applicationType: data.applicationType || 'NOC',
                        pendingWith: data.currentLocation || data.pendingWith || 'Processing',
                        rejectionReason: data.remarks || null
                    });

                    // Set Timeline if available
                    if (data.timeline && Array.isArray(data.timeline)) {
                        setTimeline(data.timeline);
                    }

                    // Fetch Processing Estimates
                    // Passing allApproved=true by default for optimistic estimate as per user request demo
                    // In real world, logic might depend on application.status or other flags
                    try {
                        const estimateRes = await nocApplicationService.getProcessingEstimates({ allApproved: true });
                        if (estimateRes.success && estimateRes.data && estimateRes.data.selectedEstimate) {
                            setEstimate(estimateRes.data.selectedEstimate);
                        }
                    } catch (estErr) {
                        console.error("Error fetching estimates", estErr);
                    }

                    // Fetch Approval Flow
                    try {
                        const flowRes = await nocApplicationService.getApprovalFlow(data.applicationId || id);
                        if (flowRes.success && flowRes.data) {
                            setApprovalFlow(flowRes.data.approvalFlow);
                        }
                    } catch (flowErr) {
                        console.error("Error fetching approval flow", flowErr);
                    }

                } else {
                    setApplication(null);
                }
            } catch (err) {
                console.error("Error fetching application details", err);
            }
        };

        if (id) {
            fetchApplicationDetails();
        }
    }, [id]);

    if (!application) return <div>Loading...</div>;

    // Helper to get status icon/color for timeline step
    const getStepStatusClass = (status) => {
        if (status === 'COMPLETED') return 'completed';
        if (status === 'IN_PROGRESS' || status === 'PENDING_ACTION') return 'current';
        if (status === 'REJECTED') return 'rejected';
        return 'pending';
    };

    return (
        <div className="noc-portal">
            <NOCHeader />
            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-form-header">
                    <h2>Track Application Status</h2>
                    <p>Real-time status updates for your application</p>
                </div>

                {/* Application Summary Card */}
                <div className="noc-card" style={{ marginBottom: '30px' }}>
                    <div className="noc-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            Application ID: <strong>{application.applicationNumber || application.id}</strong>
                            {application.trackingId && <span style={{ marginLeft: '15px', fontSize: '0.9rem', color: '#666' }}>(Ref: {application.trackingId})</span>}
                        </span>
                        <span className={`noc-badge noc-badge-${application.statusColor}`} style={{
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: application.statusColor === 'success' ? '#d4edda' : application.statusColor === 'warning' ? '#fff3cd' : '#cce5ff',
                            color: application.statusColor === 'success' ? '#155724' : application.statusColor === 'warning' ? '#856404' : '#004085'
                        }}>
                            {application.status}
                        </span>
                    </div>
                    <div className="noc-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Project Name</label>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{application.projectName}</div>
                            </div>
                            <div>
                                <label style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Application Type</label>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{application.applicationType}</div>
                            </div>
                            <div>
                                <label style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Submitted Date</label>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{application.submittedDate}</div>
                            </div>
                        </div>

                        <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                            <label style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>Current Location / Pending With</label>
                            <div style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '1.1rem' }}>{application.pendingWith}</div>
                        </div>

                        {application.status === 'REJECTED' && application.rejectionReason && (
                            <div style={{ marginTop: '20px', padding: '15px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '5px', color: '#b91c1c' }}>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>⚠️ Application Rejected</strong>
                                {application.rejectionReason}
                            </div>
                        )}
                    </div>
                </div>

                {/* Approval Flow Card */}
                {approvalFlow && (
                    <div className="noc-card" style={{ marginBottom: '30px' }}>
                        <div className="noc-card-header">Approval Workflow Status</div>
                        <div className="noc-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                {/* DGO Status */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: approvalFlow.dgo?.status === 'APPROVED' ? '#10b981' : approvalFlow.dgo?.status === 'REJECTED' ? '#ef4444' : '#94a3b8'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🏛️</span>
                                        <h4 style={{ margin: 0, color: '#1e293b' }}>DGO Review</h4>
                                    </div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        background: approvalFlow.dgo?.status === 'APPROVED' ? '#d1fae5' : approvalFlow.dgo?.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                                        color: approvalFlow.dgo?.status === 'APPROVED' ? '#065f46' : approvalFlow.dgo?.status === 'REJECTED' ? '#991b1b' : '#475569'
                                    }}>
                                        {approvalFlow.dgo?.status || 'PENDING'}
                                    </div>
                                    {approvalFlow.dgo?.reviewedBy && (
                                        <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#64748b' }}>
                                            Reviewed by: <strong>{approvalFlow.dgo.reviewedBy}</strong>
                                        </div>
                                    )}
                                    {approvalFlow.dgo?.documentsVerified && (
                                        <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#10b981' }}>
                                            ✓ Documents Verified
                                        </div>
                                    )}
                                </div>

                                {/* SGWA Status */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: approvalFlow.sgwa?.status === 'APPROVED' ? '#10b981' : approvalFlow.sgwa?.status === 'REJECTED' ? '#ef4444' : '#94a3b8'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>💧</span>
                                        <h4 style={{ margin: 0, color: '#1e293b' }}>SGWA Review</h4>
                                    </div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        background: approvalFlow.sgwa?.status === 'APPROVED' ? '#d1fae5' : approvalFlow.sgwa?.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                                        color: approvalFlow.sgwa?.status === 'APPROVED' ? '#065f46' : approvalFlow.sgwa?.status === 'REJECTED' ? '#991b1b' : '#475569'
                                    }}>
                                        {approvalFlow.sgwa?.status || 'PENDING'}
                                    </div>
                                    {approvalFlow.sgwa?.reviewedBy && (
                                        <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#64748b' }}>
                                            Reviewed by: <strong>{approvalFlow.sgwa.reviewedBy}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Enforcement Status */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: approvalFlow.enforcement?.status === 'APPROVED' ? '#10b981' : approvalFlow.enforcement?.status === 'REJECTED' ? '#ef4444' : '#94a3b8'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>⚖️</span>
                                        <h4 style={{ margin: 0, color: '#1e293b' }}>Enforcement</h4>
                                    </div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        background: approvalFlow.enforcement?.status === 'APPROVED' ? '#d1fae5' : approvalFlow.enforcement?.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                                        color: approvalFlow.enforcement?.status === 'APPROVED' ? '#065f46' : approvalFlow.enforcement?.status === 'REJECTED' ? '#991b1b' : '#475569'
                                    }}>
                                        {approvalFlow.enforcement?.status || 'PENDING'}
                                    </div>
                                    {approvalFlow.enforcement?.reviewedBy && (
                                        <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#64748b' }}>
                                            Reviewed by: <strong>{approvalFlow.enforcement.reviewedBy}</strong>
                                        </div>
                                    )}
                                    {approvalFlow.enforcement?.nocNumber && (
                                        <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#1e3a8a' }}>
                                            <strong>NOC #:</strong> {approvalFlow.enforcement.nocNumber}
                                        </div>
                                    )}
                                    {approvalFlow.enforcement?.remarks && (
                                        <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                                            "{approvalFlow.enforcement.remarks}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visual Timeline */}
                <div className="noc-card">
                    <div className="noc-card-header">Processing Timeline</div>
                    <div className="noc-card-body" style={{ padding: '40px 20px' }}>
                        {timeline.length > 0 ? (
                            <div className="status-timeline">
                                {timeline.map((step, index) => {
                                    // Map API 'status' (COMPLETED, PENDING) to UI classes
                                    let stepClass = 'pending';
                                    if (step.status === 'COMPLETED') stepClass = 'completed';
                                    else if (step.status === 'IN_PROGRESS' || (step.status === 'PENDING' && index === 0)) stepClass = 'current';

                                    return (
                                        <div key={index} className={`timeline-item ${stepClass}`}>
                                            <div className="timeline-marker">
                                                {step.status === 'COMPLETED' ? '✓' : (step.step || index + 1)}
                                            </div>
                                            <div className="timeline-content">
                                                <h4 style={{ margin: '0 0 5px 0', color: stepClass === 'pending' ? '#999' : '#333' }}>
                                                    {step.title}
                                                </h4>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                                    {step.description}
                                                </p>
                                                {step.date && (
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
                                                        {new Date(step.date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666' }}>No timeline information available.</div>
                        )}
                    </div>
                </div>

                {/* Processing Estimates Card */}
                {estimate && (
                    <div className="noc-card" style={{ marginTop: '30px', borderLeft: `5px solid ${estimate.color === 'green' ? '#10b981' : '#f59e0b'}` }}>
                        <div className="noc-card-header">Estimated Time for Completion</div>
                        <div className="noc-card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{estimate.duration}</h3>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        background: estimate.color === 'green' ? '#d1fae5' : '#fef3c7',
                                        color: estimate.color === 'green' ? '#065f46' : '#92400e',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>
                                        {estimate.label}
                                    </span>
                                </div>
                            </div>
                            {estimate.conditions && estimate.conditions.length > 0 && (
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>Based on:</strong>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                                        {estimate.conditions.map((cond, i) => (
                                            <li key={i} style={{ marginBottom: '4px' }}>{cond}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button className="noc-btn noc-btn-secondary" onClick={() => navigate('/noc/applications')}>
                        Back to List
                    </button>
                    {/* Only show Track another if coming from deep link, otherwise list is better */}
                </div>
            </div>

            <style jsx>{`
                .status-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    position: relative;
                    max-width: 1000px;
                    margin: 20px auto 0;
                }
                .timeline-item {
                    display: flex;
                    gap: 20px;
                    padding-bottom: 30px;
                    position: relative;
                }
                .timeline-item:last-child {
                    padding-bottom: 0;
                }
                /* Mobile Vertical Line */
                .timeline-item:not(:last-child)::before {
                    content: '';
                    position: absolute;
                    left: 24px; /* Center of marker */
                    top: 50px;
                    bottom: -10px;
                    width: 3px;
                    background: #e2e8f0;
                    z-index: 0;
                }
                
                .timeline-marker {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #fff;
                    border: 3px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    z-index: 1;
                    flex-shrink: 0;
                    color: #94a3b8;
                    transition: all 0.3s ease;
                }
                .timeline-item.completed .timeline-marker {
                    background: #1e3a8a; /* Navy Blue */
                    border-color: #1e3a8a;
                    color: #fff;
                }
                .timeline-item.current .timeline-marker {
                    background: #3b82f6; /* Lighter Blue */
                    border-color: #3b82f6;
                    color: #fff;
                    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.2);
                    transform: scale(1.1);
                }
                
                .timeline-content {
                    padding-top: 10px;
                }
                .timeline-content h4 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                    color: #1e293b;
                }
                .timeline-item.pending .timeline-content h4 {
                    color: #94a3b8;
                }

                @media (min-width: 900px) {
                    .status-timeline {
                        flex-direction: row;
                        justify-content: space-between;
                        gap: 0;
                        padding-top: 20px;
                    }
                    .timeline-item {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        flex: 1;
                        padding-bottom: 0;
                        padding: 0 10px;
                    }
                    /* Desktop Horizontal Line */
                    .timeline-item:not(:last-child)::before {
                        left: 50%;
                        top: 24px; /* Center of marker */
                        width: 100%;
                        height: 3px;
                        bottom: auto;
                        transform: translateX(50%);
                    }
                    .timeline-item.completed:not(:last-child)::before {
                        background: #1e3a8a;
                    }
                     /* Ensure line is behind markers */
                     .timeline-marker {
                        position: relative;
                        z-index: 2;
                        margin-bottom: 16px;
                     }
                }
            `}</style>
            <NOCFooter />
        </div>
    );
};

export default ApplicationStatusTracker;
