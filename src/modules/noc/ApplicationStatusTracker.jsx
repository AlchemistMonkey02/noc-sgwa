import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const ApplicationStatusTracker = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);

    // Mock stages definition
    const stages = [
        { id: 1, label: 'Application Submitted', description: 'Application received by the system.' },
        { id: 2, label: 'Document Verification', description: 'Reviewing uploaded documents for completeness.' },
        { id: 3, label: 'Technical Scrutiny', description: 'Assessing technical feasibility and compliance.' },
        { id: 4, label: 'Site Inspection', description: 'Field visit by officer (if required).' },
        { id: 5, label: 'Final Approval', description: 'NOC generated and ready for download.' }
    ];

    useEffect(() => {
        // Mock API call to fetch application details based on ID
        // In reality, this would be an API call
        const fetchApplicationDetails = () => {
            let mockStatus = 'submitted';
            let currentStageId = 1;
            let statusColor = 'primary';

            // Simulate different statuses based on ID patterns
            if (id.endsWith('002')) {
                mockStatus = 'approved';
                currentStageId = 5;
                statusColor = 'success';
            } else if (id.endsWith('001')) {
                mockStatus = 'scrutiny';
                currentStageId = 3;
                statusColor = 'warning';
            } else if (id.includes('RIG')) {
                mockStatus = 'document_verification';
                currentStageId = 2;
                statusColor = 'info';
            }

            setApplication({
                id: id,
                projectName: id.includes('RIG') ? 'Borewell Construction Project' : 'Industrial Water Supply',
                submittedDate: '2024-12-01',
                currentStageId: currentStageId,
                status: mockStatus.replace('_', ' ').toUpperCase(),
                statusColor: statusColor,
                applicantName: 'John Doe',
                applicationType: id.includes('RIG') ? 'Rig NOC' : 'Groundwater NOC'
            });
        };

        fetchApplicationDetails();
    }, [id]);

    if (!application) return <div>Loading...</div>;

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
                        <span>Application ID: <strong>{application.id}</strong></span>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ color: '#666', fontSize: '0.9rem' }}>Project Name</label>
                                <div style={{ fontWeight: '600' }}>{application.projectName}</div>
                            </div>
                            <div>
                                <label style={{ color: '#666', fontSize: '0.9rem' }}>Application Type</label>
                                <div style={{ fontWeight: '600' }}>{application.applicationType}</div>
                            </div>
                            <div>
                                <label style={{ color: '#666', fontSize: '0.9rem' }}>Submitted Date</label>
                                <div style={{ fontWeight: '600' }}>{application.submittedDate}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div className="noc-card">
                    <div className="noc-card-header">Processing Timeline</div>
                    <div className="noc-card-body" style={{ padding: '40px 20px' }}>
                        <div className="status-timeline">
                            {stages.map((stage, index) => {
                                const isCompleted = stage.id < application.currentStageId;
                                const isCurrent = stage.id === application.currentStageId;
                                const isPending = stage.id > application.currentStageId;

                                return (
                                    <div key={stage.id} className={`timeline-item ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
                                        <div className="timeline-marker">
                                            {isCompleted ? '✓' : stage.id}
                                        </div>
                                        <div className="timeline-content">
                                            <h4 style={{ margin: '0 0 5px 0', color: isPending ? '#999' : '#333' }}>
                                                {stage.label}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                                {stage.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button className="noc-btn noc-btn-secondary" onClick={() => navigate('/noc/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <style jsx>{`
                .status-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    position: relative;
                    max-width: 800px;
                    margin: 0 auto;
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
                /* Vertical Line */
                .timeline-item:not(:last-child)::before {
                    content: '';
                    position: absolute;
                    left: 20px; /* Center of marker (40px/2) */
                    top: 40px;
                    bottom: 0;
                    width: 2px;
                    background: #e9ecef;
                    z-index: 0;
                }
                .timeline-item.completed:not(:last-child)::before {
                    background: #28a745;
                }
                
                .timeline-marker {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #e9ecef;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    z-index: 1;
                    flex-shrink: 0;
                    color: #999;
                }
                .timeline-item.completed .timeline-marker {
                    background: #28a745;
                    border-color: #28a745;
                    color: #fff;
                }
                .timeline-item.current .timeline-marker {
                    background: #007bff;
                    border-color: #007bff;
                    color: #fff;
                    box-shadow: 0 0 0 4px rgba(0,123,255,0.2);
                }
                
                .timeline-content {
                    padding-top: 8px;
                }

                @media (min-width: 768px) {
                    .status-timeline {
                        flex-direction: row;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .timeline-item {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        flex: 1;
                        padding-bottom: 0;
                    }
                    /* Horizontal Line */
                    .timeline-item:not(:last-child)::before {
                        left: 50%;
                        top: 20px;
                        width: 100%;
                        height: 2px;
                        bottom: auto;
                    }
                }
            `}</style>

            <NOCFooter />
        </div>
    );
};

export default ApplicationStatusTracker;
