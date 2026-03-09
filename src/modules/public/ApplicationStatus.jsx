import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/public-landing.css';

import PublicHeader from './components/PublicHeader';
import publicService from './services/publicService';

const ApplicationStatus = () => {
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchId.trim()) {
            setError('Please enter a valid Application Reference Number');
            return;
        }

        setLoading(true);
        setError('');
        setStatusData(null);

        try {
            const response = await publicService.trackApplication(searchId.trim());
            if (response.success && response.data) {
                const appInfo = response.data;

                // Map API response to UI state
                let currentStageIndex = 1;
                const backendStages = appInfo.stages || [];

                // Find current active stage or highest completed
                for (let i = 0; i < backendStages.length; i++) {
                    if (backendStages[i].status === 'COMPLETED' || backendStages[i].status === 'IN_PROGRESS') {
                        currentStageIndex = i + 1;
                    }
                }

                setStatusData({
                    id: appInfo.applicationNumber || appInfo.trackingId,
                    projectName: appInfo.projectName || 'Groundwater Extraction Project',
                    applicantName: appInfo.applicantName || 'Applicant',
                    submittedDate: appInfo.submittedDate ? new Date(appInfo.submittedDate).toLocaleDateString() : 'N/A',
                    status: appInfo.status,
                    statusColor: appInfo.statusColor || (appInfo.status === 'APPROVED' ? 'success' : appInfo.status === 'REJECTED' ? 'danger' : 'warning'),
                    currentStage: currentStageIndex,
                    stages: backendStages.length > 0 ? backendStages : [
                        { id: 1, label: 'Submitted', date: appInfo.submittedDate ? new Date(appInfo.submittedDate).toLocaleDateString() : 'Pending' },
                        { id: 2, label: 'Document Verification', date: appInfo.currentStage === 'Document Verification' ? 'In Progress' : 'Pending' },
                        { id: 3, label: 'Technical Review', date: 'Pending' },
                        { id: 4, label: 'NOC Issuance', date: 'Pending' }
                    ]
                });
            } else {
                setError(response.message || 'Application not found. Please check the reference number.');
            }
        } catch (err) {
            console.error("Tracking Error:", err);
            setError(err.message || 'Failed to fetch tracking data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gov-portal" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PublicHeader />

            <div className="portal-main" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '40px 20px',
                flex: 1
            }}>
                <div className="status-container" style={{
                    maxWidth: '800px',
                    width: '100%',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    padding: '40px',
                    border: '1px solid #eef2f6'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#eff6ff',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '30px',
                            marginBottom: '15px'
                        }}>
                            📋
                        </div>
                        <h2 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: '700', marginBottom: '10px' }}>
                            Check Application Status
                        </h2>
                        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                            Enter your Application Reference Number to track the current status of your NOC request.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
                        <input
                            type="text"
                            placeholder="e.g. RJ-NOC-2025-001"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="gov-input"
                            style={{
                                flex: 1,
                                padding: '14px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0 25px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>

                    {error && (
                        <div style={{
                            maxWidth: '600px',
                            margin: '0 auto 20px',
                            padding: '12px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {statusData && (
                        <div className="status-result" style={{
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '30px',
                            marginTop: '10px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                background: '#f8fafc',
                                padding: '15px 20px',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Application ID</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{statusData.id}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Current Status</span>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: statusData.statusColor === 'success' ? '#dcfce7' : statusData.statusColor === 'danger' ? '#fee2e2' : '#fff7ed',
                                        color: statusData.statusColor === 'success' ? '#166534' : statusData.statusColor === 'danger' ? '#b91c1c' : '#c2410c',
                                        fontWeight: '700',
                                        fontSize: '0.9rem'
                                    }}>
                                        {statusData.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ position: 'relative', padding: '20px 0' }}>
                                {/* Simple Timeline */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                    {/* Line */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        left: '40px',
                                        right: '40px',
                                        height: '3px',
                                        background: '#e2e8f0',
                                        zIndex: 0
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(statusData.currentStage / 4) * 100}%`,
                                            background: '#3b82f6',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>

                                    {statusData.stages.map((stage, idx) => {
                                        const isCompleted = idx + 1 <= statusData.currentStage;
                                        return (
                                            <div key={stage.id} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '25%' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: isCompleted ? '#3b82f6' : '#fff',
                                                    border: `3px solid ${isCompleted ? '#3b82f6' : '#e2e8f0'}`,
                                                    color: isCompleted ? 'white' : '#94a3b8',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '700',
                                                    margin: '0 auto 10px'
                                                }}>
                                                    {isCompleted ? '✓' : idx + 1}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: isCompleted ? '#1e293b' : '#94a3b8' }}>
                                                    {stage.label}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                                    {stage.date}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="portal-footer" style={{ marginTop: 'auto' }}>
                <p>
                    © 2026 Ground Water Department, Rajasthan
                </p>
            </footer>
        </div>
    );
};

export default ApplicationStatus;
