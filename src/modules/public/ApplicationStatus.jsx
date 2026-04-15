import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/public-pages.css';

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
        <div className="public-info-page">
            <div className="public-content-container">
                <div className="public-tool-container">
                    <div className="public-tool-header">
                        <div className="public-tool-icon">📋</div>
                        <h1 className="public-tool-title">Check Application Status</h1>
                        <p className="public-tool-subtitle">
                            Enter your Application Reference Number to track the current status of your NOC request.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="officer-flex officer-gap-4" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                        <input
                            type="text"
                            placeholder="e.g. RJ-NOC-2025-001"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="officer-input"
                            style={{ flex: 1 }}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="officer-btn officer-btn-primary"
                            style={{ padding: '0 2rem' }}
                        >
                            {loading ? 'Tracking...' : 'Track'}
                        </button>
                    </form>

                    {error && (
                        <div className="officer-login-error" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {statusData && (
                        <div className="public-feature-card" style={{ borderTop: '6px solid var(--color-primary-600)' }}>
                            <div className="officer-flex officer-justify-between officer-items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase' }}>Application ID</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--gray-900)' }}>{statusData.id}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase' }}>Current Status</span>
                                    <span className={`officer-badge ${statusData.statusColor === 'success' ? 'approved' : statusData.statusColor === 'danger' ? 'rejected' : 'under-review'}`}>
                                        {statusData.status}
                                    </span>
                                </div>
                            </div>

                            <div className="public-timeline">
                                <div className="public-timeline-track">
                                    <div 
                                        className="public-timeline-progress" 
                                        style={{ width: `${((statusData.currentStage - 1) / (statusData.stages.length - 1)) * 100}%` }}
                                    />
                                </div>

                                <div className="public-timeline-steps">
                                    {statusData.stages.map((stage, idx) => {
                                        const isCompleted = idx + 1 <= statusData.currentStage;
                                        return (
                                            <div key={stage.id} className={`public-step-item ${isCompleted ? 'active' : ''}`}>
                                                <div className="public-step-icon">
                                                    {isCompleted ? '✓' : idx + 1}
                                                </div>
                                                <div className="public-step-content">
                                                    <div className="public-step-label">{stage.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '4px' }}>
                                                        {stage.date || 'Pending'}
                                                    </div>
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
        </div>
    );
};

export default ApplicationStatus;
