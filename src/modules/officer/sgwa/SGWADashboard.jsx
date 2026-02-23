import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import { getOfficerData } from '../shared/utils/officerAuth';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const SGWADashboard = () => {
    const navigate = useNavigate();
    const [officerInfo, setOfficerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        total: 0, pendingApproval: 0, approved: 0,
        rejected: 0, dgoRecommended: 0, queriesRaised: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);

    useEffect(() => {
        setOfficerInfo(getOfficerData());
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await officerService.getSGWADashboard();
            if (response.success) {
                const data = response.data;
                setStatistics({
                    total: data.stats?.totalApplications || 0,
                    pendingApproval: data.stats?.pendingApproval || 0,
                    approved: data.stats?.approved || 0,
                    rejected: data.stats?.rejected || 0,
                    dgoRecommended: data.stats?.dgoRecommended || 0,
                    queriesRaised: data.stats?.queriesRaised || 0
                });
                if (data.recentApplications?.length > 0) {
                    setRecentApplications(data.recentApplications.map(app => ({
                        applicationId: app.id || app._id,
                        applicationNumber: app.applicationNumber,
                        applicantName: app.applicantDetails?.name || app.projectDetails?.applicantName || 'N/A',
                        projectName: app.projectDetails?.projectName || 'N/A',
                        district: app.locationDetails?.district || 'N/A',
                        waterRequirement: typeof app.waterRequirement === 'object'
                            ? `${app.waterRequirement.total || app.waterRequirement.dailyRequirement || 0} m³/day`
                            : app.waterRequirement,
                        submittedDate: app.submittedDate,
                        status: app.status,
                        daysInQueue: app.daysInQueue || 0
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStatistics({ total: 0, pendingApproval: 0, approved: 0, rejected: 0, dgoRecommended: 0, queriesRaised: 0 });
            setRecentApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            SUBMITTED: 'info', UNDER_REVIEW: 'warning', DGO_RECOMMENDED: 'info',
            APPROVED_DGO: 'info', SGWA_APPROVED: 'success', NOC_ISSUED: 'success',
            SGWA_REJECTED: 'danger', REJECTED: 'danger', SGWA_QUERY_RAISED: 'warning'
        };
        const cls = map[status] || 'secondary';
        const label = status?.replace(/_/g, ' ') || 'Unknown';
        return <span className={`status-badge ${cls}`}>{label}</span>;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    if (loading) {
        return (
            <div className="officer-portal">
                <OfficerHeader officerName="SGWA Officer" officerRole="SGWA" officerDesignation="Technical Officer" district="State Level" />
                <div className="officer-layout">
                    <OfficerSidebar role="SGWA" />
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

    const statCards = [
        { label: 'Total Applications', value: statistics.total, icon: '📋', color: 'blue' },
        { label: 'Pending Approval', value: statistics.pendingApproval, icon: '⏳', color: 'orange' },
        { label: 'DGO Recommended', value: statistics.dgoRecommended, icon: '✅', color: 'teal' },
        { label: 'Approved & Issued', value: statistics.approved, icon: '🎯', color: 'green' },
        { label: 'Queries Raised', value: statistics.queriesRaised, icon: '❓', color: 'purple' },
        { label: 'Rejected', value: statistics.rejected, icon: '✗', color: 'red' }
    ];

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'SGWA Officer'}
                officerRole="SGWA"
                officerDesignation={officerInfo?.designation || 'Technical Officer'}
                district={officerInfo?.district || 'State Level'}
            />
            <div className="officer-layout">
                <OfficerSidebar role="SGWA" />
                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="page-gradient-header" />
                        <div style={{ padding: '1.75rem 1.5rem 0' }}>
                            <h1 className="officer-page-title">🏛️ SGWA Dashboard</h1>
                            <p className="officer-page-subtitle">State Groundwater Authority — Rajasthan</p>
                        </div>

                        {/* Stats Grid — using professional-ui classes */}
                        <div style={{ padding: '0 1.5rem' }}>
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

                            {/* Recent Applications */}
                            <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                                <div className="card-title-bar">
                                    <h2 className="card-main-title">📄 Recent Applications</h2>
                                    <button
                                        className="bhuneer-submit-btn"
                                        style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}
                                        onClick={() => navigate('/officer/sgwa/applications')}
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="card-content-area no-padding">
                                    {recentApplications.length > 0 ? (
                                        <div className="professional-table-wrapper">
                                            <table className="professional-table">
                                                <thead>
                                                    <tr>
                                                        <th>Application No.</th>
                                                        <th>Applicant</th>
                                                        <th>Project</th>
                                                        <th>District</th>
                                                        <th>Water Req.</th>
                                                        <th>Status</th>
                                                        <th>Days</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentApplications.map((app) => (
                                                        <tr key={app.applicationId}>
                                                            <td><strong className="text-blue">{app.applicationNumber}</strong></td>
                                                            <td>{app.applicantName}</td>
                                                            <td>{app.projectName}</td>
                                                            <td>{app.district}</td>
                                                            <td>{app.waterRequirement}</td>
                                                            <td>{getStatusBadge(app.status)}</td>
                                                            <td>
                                                                <span style={{
                                                                    color: app.daysInQueue > 5 ? '#dc2626' : '#6b7280',
                                                                    fontWeight: app.daysInQueue > 5 ? 700 : 400
                                                                }}>
                                                                    {app.daysInQueue}d
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="table-action-btn"
                                                                    onClick={() => navigate(`/officer/sgwa/applications/${app.applicationId}`)}
                                                                >
                                                                    Review
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📭</div>
                                            <div className="empty-state-title">No Recent Applications</div>
                                            <p className="empty-state-text">No applications have been submitted recently.</p>
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

export default SGWADashboard;
