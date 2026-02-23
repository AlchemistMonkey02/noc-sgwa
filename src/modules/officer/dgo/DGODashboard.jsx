import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ApplicationCard from '../shared/components/ApplicationCard';
import officerService from '../services/officerService';
import { getOfficerData } from '../shared/utils/officerAuth';
import '../shared/styles/officer-portal.css';

const DGODashboard = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        total: 0, pendingVerification: 0, underReview: 0,
        queriesRaised: 0, inspectionPending: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [district, setDistrict] = useState('');
    const [officerInfo, setOfficerInfo] = useState(null);
    const [pendingInspections, setPendingInspections] = useState([]);

    useEffect(() => {
        const userData = getOfficerData();
        setOfficerInfo(userData);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await officerService.getDGODashboard();
            if (response.success) {
                const data = response.data;
                setStatistics({
                    total: data.stats?.assignedApplications || 0,
                    pendingVerification: data.stats?.pendingInspection || 0,
                    underReview: data.stats?.underReview || 0,
                    queriesRaised: data.stats?.queriesRaised || 0,
                    inspectionPending: data.stats?.pendingInspection || 0
                });
                if (data.myDistrict) setDistrict(data.myDistrict);
                if (data.recentApplications?.length > 0) {
                    setRecentApplications(data.recentApplications.map(app => ({
                        applicationId: app.id || app._id,
                        applicationNumber: app.applicationNumber,
                        applicantName: app.applicantName,
                        projectName: app.projectName,
                        projectType: app.projectType || app.sector,
                        district: app.district,
                        block: app.block,
                        waterRequirement: `${app.waterRequirement || 0} m³/day`,
                        submittedDate: app.submittedDate,
                        status: app.status,
                        daysInQueue: app.daysInQueue || 0
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationClick = (application) => {
        navigate(`/officer/dgo/applications/${application.applicationId}`);
    };

    const statCards = [
        { label: 'Total Applications', value: statistics.total, icon: '📋', color: 'blue' },
        { label: 'Pending Verification', value: statistics.pendingVerification, icon: '⏳', color: 'orange' },
        { label: 'Under Review', value: statistics.underReview, icon: '🔍', color: 'teal' },
        { label: 'Queries Raised', value: statistics.queriesRaised, icon: '❓', color: 'purple' },
        { label: 'Inspection Pending', value: statistics.inspectionPending, icon: '📍', color: 'red' }
    ];

    if (loading) {
        return (
            <div className="officer-portal">
                <OfficerHeader
                    officerName={officerInfo?.name || 'DGO Officer'}
                    officerRole="DGO"
                    officerDesignation="District Groundwater Officer"
                    district={district || 'Jaipur'}
                />
                <div className="officer-layout">
                    <OfficerSidebar role="DGO" />
                    <main className="officer-content">
                        <div className="officer-container">
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
                                <p>Loading dashboard...</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'DGO Officer'}
                officerRole="DGO"
                officerDesignation={officerInfo?.designation || 'District Groundwater Officer'}
                district={district || officerInfo?.district || 'Jaipur'}
            />
            <div className="officer-layout">
                <OfficerSidebar role="DGO" />
                <main className="officer-content">
                    <div className="officer-container">
                        {/* Gradient Bar */}
                        <div className="page-gradient-header" />
                        <div style={{ padding: '1.75rem 1.5rem 0' }}>
                            <h1 className="officer-page-title">📊 DGO Dashboard</h1>
                            <p className="officer-page-subtitle">Overview of NOC applications and pending tasks</p>
                        </div>

                        <div style={{ padding: '0 1.5rem 2rem' }}>
                            {/* Stats using professional-ui classes */}
                            <div className="dashboard-stats-grid" style={{ marginBottom: '1.75rem' }}>
                                {statCards.map((s, i) => (
                                    <div key={i} className={`dashboard-stat-card ${s.color}`}>
                                        <div className="stat-card-content">
                                            <div className="stat-icon-wrapper">
                                                <span style={{ fontSize: '1.375rem' }}>{s.icon}</span>
                                            </div>
                                            <div className="stat-info">
                                                <div className="stat-number">{s.value}</div>
                                                <div className="stat-label-text">{s.label}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pending Inspections */}
                            {pendingInspections.length > 0 && (
                                <div className="dashboard-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                                    <div className="card-title-bar">
                                        <h2 className="card-main-title">🔍 Pending Inspections</h2>
                                    </div>
                                    <div className="card-content-area">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {pendingInspections.map(item => (
                                                <div key={item.id} className="dashboard-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span className="status-badge warning">Scheduled</span>
                                                        <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{item.projectName}</h3>
                                                    <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.875rem' }}>{item.applicationNumber}</p>
                                                    <button
                                                        className="officer-btn officer-btn-primary"
                                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                                        onClick={() => navigate(`/officer/dgo/applications/${item.id}/inspection-report`)}
                                                    >
                                                        📝 Submit Report
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Applications */}
                            <div className="dashboard-card">
                                <div className="card-title-bar">
                                    <h2 className="card-main-title">📄 Recent Applications</h2>
                                    <button
                                        className="bhuneer-submit-btn"
                                        style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                                        onClick={() => navigate('/officer/dgo/applications')}
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="card-content-area" style={{ padding: recentApplications.length > 0 ? 0 : undefined }}>
                                    {recentApplications.length > 0 ? (
                                        recentApplications.map((application) => (
                                            <ApplicationCard
                                                key={application.applicationId}
                                                application={application}
                                                onClick={handleApplicationClick}
                                            />
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📭</div>
                                            <div className="empty-state-title">No Recent Applications</div>
                                            <p className="empty-state-text">No applications are assigned to your district yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DGODashboard;
