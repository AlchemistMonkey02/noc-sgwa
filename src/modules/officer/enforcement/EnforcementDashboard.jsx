import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ApplicationCard from '../shared/components/ApplicationCard';
import '../shared/styles/officer-portal.css';

const EnforcementDashboard = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        total: 0,
        pendingFinalApproval: 0,
        approved: 0,
        rejected: 0,
        nocIssued: 0
    });

    const [approvalQueue, setApprovalQueue] = useState([]);

    useEffect(() => {
        fetchStatistics();
        fetchApprovalQueue();
    }, []);

    const fetchStatistics = async () => {
        // Mock data
        setStatistics({
            total: 20,
            pendingFinalApproval: 8,
            approved: 10,
            rejected: 2,
            nocIssued: 8
        });
    };

    const fetchApprovalQueue = async () => {
        // Mock data
        setApprovalQueue([
            {
                applicationId: 'NOC2026001234',
                applicationNumber: 'RJ/CGWA/NOC/2026/001234',
                applicantName: 'Rajesh Kumar Sharma',
                projectName: 'ABC Textile Manufacturing Unit',
                projectType: 'Industrial',
                district: 'Jaipur',
                block: 'Sanganer',
                blockCategory: 'SEMI_CRITICAL',
                waterRequirement: '150.25 m³/day',
                submittedDate: '2026-01-09T08:00:00Z',
                dgoRecommendation: 'RECOMMEND_APPROVAL',
                sgwaRecommendation: 'RECOMMEND_APPROVAL_WITH_CONDITIONS',
                proposedValidityYears: 3,
                conditionsCount: 5,
                status: 'PENDING_FINAL_APPROVAL',
                daysInQueue: 1
            }
        ]);
    };

    const handleApplicationClick = (application) => {
        navigate(`/officer/enforcement/applications/${application.applicationId}`);
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Suresh Patel"
                officerRole="ENFORCEMENT"
                officerDesignation="Chief Engineer"
                district=""
            />

            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">⚖️ Enforcement Wing Dashboard</h1>
                            <p className="officer-page-subtitle">
                                Final Approval & NOC Issuance
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="officer-stats-grid">
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Total Decisions</span>
                                    <div className="officer-stat-icon primary">📊</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.total}</h2>
                                <div className="officer-stat-footer">
                                    <span>All time</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Pending Approval</span>
                                    <div className="officer-stat-icon warning">⏳</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.pendingFinalApproval}</h2>
                                <div className="officer-stat-footer">
                                    <span style={{ color: 'var(--officer-warning)' }}>⚠️ Requires decision</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Approved</span>
                                    <div className="officer-stat-icon success">✅</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.approved}</h2>
                                <div className="officer-stat-footer">
                                    <span style={{ color: 'var(--officer-success)' }}>Applications approved</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Rejected</span>
                                    <div className="officer-stat-icon danger">❌</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.rejected}</h2>
                                <div className="officer-stat-footer">
                                    <span style={{ color: 'var(--officer-danger)' }}>Applications rejected</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">NOCs Issued</span>
                                    <div className="officer-stat-icon success">📜</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.nocIssued}</h2>
                                <div className="officer-stat-footer">
                                    <span>Certificates generated</span>
                                </div>
                            </div>
                        </div>

                        {/* Approval Queue */}
                        <div className="officer-mt-4">
                            <div className="officer-flex-between officer-mb-3">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--officer-primary)', margin: 0 }}>
                                    Final Approval Queue
                                </h2>
                                <button
                                    className="officer-btn officer-btn-primary"
                                    onClick={() => navigate('/officer/enforcement/approval-queue')}
                                >
                                    View All →
                                </button>
                            </div>

                            {approvalQueue.map((application) => (
                                <div key={application.applicationId}>
                                    <ApplicationCard
                                        application={application}
                                        onClick={handleApplicationClick}
                                    />
                                    {/* Additional info specific to enforcement */}
                                    <div style={{
                                        background: 'var(--officer-bg-light)',
                                        padding: '1rem',
                                        marginTop: '-1rem',
                                        marginBottom: '1rem',
                                        borderBottomLeftRadius: '12px',
                                        borderBottomRightRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.875rem'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '600' }}>DGO Recommendation:</span>{' '}
                                            <span className="officer-badge approved">{application.dgoRecommendation}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '600' }}>SGWA Recommendation:</span>{' '}
                                            <span className="officer-badge approved">{application.sgwaRecommendation}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '600' }}>Conditions:</span> {application.conditionsCount}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EnforcementDashboard;
