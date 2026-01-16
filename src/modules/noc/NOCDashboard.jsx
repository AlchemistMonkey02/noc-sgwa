import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { nocApplicationService } from './services/nocApplicationService';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const NOCDashboard = () => {
    const navigate = useNavigate();
    const { user, loading, isLoggingOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setDashboardLoading(true);
                const response = await nocApplicationService.getDashboardData();
                if (response.success) {
                    setDashboardData(response.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setDashboardLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user && !isLoggingOut) {
            navigate('/noc/login');
        }
    }, [user, loading, isLoggingOut, navigate]);

    if (loading || dashboardLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!user) return null; // Will redirect via effect

    // Map API data to dashboard stats
    const stats = dashboardData?.stats || {};
    const dashboardStats = [
        { label: 'Total Applications', value: stats.totalApplications || '0', icon: '📝', color: 'blue' },
        { label: 'In Draft', value: stats.inDraft || '0', icon: '📄', color: 'gray' },
        { label: 'In Process', value: stats.inProcess || '0', icon: '⏳', color: 'orange' },
        { label: 'Approved NOCs', value: stats.approved || '0', icon: '✅', color: 'green' },
        { label: 'Queries Raised', value: stats.queriesRaised || '0', icon: '❓', color: 'purple' },
        { label: 'Rejected', value: stats.rejected || '0', icon: '❌', color: 'red' }
    ];

    // Map API recent applications data
    const getStatusClass = (status) => {
        const statusMap = {
            'DRAFT': 'info',
            'SUBMITTED': 'warning',
            'UNDER_REVIEW': 'warning',
            'QUERY_RAISED': 'danger',
            'APPROVED': 'success',
            'NOC_ISSUED': 'success',
            'REJECTED': 'danger',
            'CANCELLED': 'secondary'
        };
        return statusMap[status] || 'info';
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const recentApplications = (dashboardData?.recentApplications || []).map(app => ({
        id: app.applicationNumber || app.trackingId,
        type: app.applicationType === 'NEW' ? 'Fresh NOC' : app.applicationType === 'RENEWAL' ? 'NOC Renewal' : app.applicationType,
        purpose: app.projectDetails?.projectName || 'N/A',
        submittedDate: formatDate(app.updatedAt),
        status: formatStatus(app.status),
        statusClass: getStatusClass(app.status),
        _id: app._id
    }));

    const upcomingDeadlines = [
        { task: 'Q4 2025 Compliance Report', dueDate: '15-Jan-2026', daysLeft: 7 },
        { task: 'Meter Reading Submission', dueDate: '10-Jan-2026', daysLeft: 2 }
    ];

    // Filter approved NOCs from dashboard data
    const approvedNOCs = (dashboardData?.recentApplications || [])
        .filter(app => app.status === 'NOC_ISSUED' || app.status === 'APPROVED')
        .map(app => ({
            uuid: app.uuid || app._id, // Use UUID for API calls
            nocNumber: app.applicationNumber || 'N/A',
            projectName: app.projectDetails?.projectName || 'N/A',
            issueDate: app.nocIssuedDate ? formatDate(app.nocIssuedDate) : formatDate(app.updatedAt),
            validUpto: app.nocValidityDate ? formatDate(app.nocValidityDate) : 'N/A',
            status: 'Active'
        }));

    // Handle View Certificate
    const handleViewCertificate = async (uuid, nocNumber) => {
        try {
            navigate(`/noc/certificate/${uuid}`);
        } catch (error) {
            console.error('Error viewing certificate:', error);
            alert('Failed to view certificate. Please try again.');
        }
    };

    // Handle Download Certificate
    const handleDownloadCertificate = async (uuid, nocNumber) => {
        try {
            await nocApplicationService.downloadCertificate(uuid);
        } catch (error) {
            console.error('Error downloading certificate:', error);
            alert('Failed to download certificate. Please try again.');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                {/* Gradient Header Bar */}
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="separator">›</span>
                        <span className="current">Dashboard</span>
                    </div>

                    {/* Page Title */}
                    <div className="page-title-section">
                        <h1 className="page-main-title">Dashboard</h1>
                        <p className="page-subtitle">Welcome back, {user?.username || 'User'}! Here's your overview</p>
                    </div>

                    {/* Dashboard Stats */}
                    <div className="dashboard-stats-grid">
                        {dashboardStats.map((stat, index) => (
                            <div
                                key={index}
                                className={`dashboard-stat-card ${stat.color}`}
                                onClick={() => {
                                    if (stat.label === 'Total Applications') navigate('/noc/track-status');
                                    if (stat.label === 'Pending Payments') navigate('/noc/payment-details');
                                }}
                                style={{ cursor: stat.label === 'Total Applications' || stat.label === 'Pending Payments' ? 'pointer' : 'default' }}
                            >
                                <div className="stat-card-content">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">{stat.icon}</span>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stat.value}</div>
                                        <div className="stat-label-text">{stat.label}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">⚡ Quick Actions</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="quick-actions-grid">
                                <Link to="/noc/application" className="quick-action-item">
                                    <span className="action-icon-badge blue">📝</span>
                                    <span className="action-text">Apply For Fresh NOC</span>
                                    <span className="action-chevron">→</span>
                                </Link>
                                <Link to="/noc/check-eligibility" className="quick-action-item">
                                    <span className="action-icon-badge indigo">✨</span>
                                    <span className="action-text">Check Eligibility</span>
                                    <span className="action-chevron">→</span>
                                </Link>
                                <Link to="/noc/application?type=renewal" className="quick-action-item">
                                    <span className="action-icon-badge orange">🔄</span>
                                    <span className="action-text">Renew Existing NOC</span>
                                    <span className="action-chevron">→</span>
                                </Link>
                                <Link to="/noc/track-status" className="quick-action-item">
                                    <span className="action-icon-badge red">🔍</span>
                                    <span className="action-text">Track Application</span>
                                    <span className="action-chevron">→</span>
                                </Link>
                                <Link to="/noc/queries" className="quick-action-item">
                                    <span className="action-icon-badge purple">❓</span>
                                    <span className="action-text">View Queries</span>
                                    <span className="action-chevron">→</span>
                                </Link>
                                <Link to="/noc/payment-details" className="quick-action-item">
                                    <span className="action-icon-badge teal">💳</span>
                                    <span className="action-text">Payment Details</span>
                                    <span className="action-chevron">→</span>
                                </Link>

                            </div>
                        </div>
                    </div>

                    {/* Approved NOC Certificates */}
                    {approvedNOCs.length > 0 && (
                        <div className="dashboard-card">
                            <div className="card-title-bar">
                                <h2 className="card-main-title">📜 Your NOC Certificates</h2>
                                <span className="status-badge success">{approvedNOCs.length} Active</span>
                            </div>
                            <div className="card-content-area">
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {approvedNOCs.map((noc, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                                border: '2px solid #0284c7',
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e', fontSize: '1.125rem' }}>
                                                    📋 {noc.projectName}
                                                </h3>
                                                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#075985' }}>
                                                    <strong>NOC Number:</strong> {noc.nocNumber}
                                                </p>
                                                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#075985' }}>
                                                    <strong>Issue Date:</strong> {noc.issueDate} | <strong>Valid Until:</strong> {noc.validUpto}
                                                </p>
                                                <span className="status-badge success" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                                    ✅ {noc.status}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => handleViewCertificate(noc.uuid, noc.nocNumber)}
                                                    className="bhuneer-submit-btn"
                                                    style={{ fontSize: '0.9375rem', padding: '0.75rem 1.25rem' }}
                                                >
                                                    👁️ View Certificate
                                                </button>
                                                <button
                                                    className="bhuneer-secondary-btn"
                                                    style={{ fontSize: '0.9375rem', padding: '0.75rem 1.25rem' }}
                                                    onClick={() => handleDownloadCertificate(noc.uuid, noc.nocNumber)}
                                                >
                                                    📥 Download
                                                </button>
                                            </div>
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
                            <Link to="/noc/track-status" className="card-view-all">View All →</Link>
                        </div>
                        <div className="card-content-area no-padding">
                            <div className="professional-table-wrapper">
                                <table className="professional-table">
                                    <thead>
                                        <tr>
                                            <th>Application ID</th>
                                            <th>Type</th>
                                            <th>Purpose</th>
                                            <th>Submitted Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentApplications.map((app, index) => (
                                            <tr key={index}>
                                                <td><strong className="text-blue">{app.id}</strong></td>
                                                <td>{app.type}</td>
                                                <td>{app.purpose}</td>
                                                <td>{app.submittedDate}</td>
                                                <td>
                                                    <span className={`status-badge ${app.statusClass}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="table-action-btn"
                                                        onClick={() => navigate(`/noc/application/${app._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="dashboard-two-column">
                        {/* Upcoming Deadlines */}
                        <div className="dashboard-card">
                            <div className="card-title-bar">
                                <h2 className="card-main-title">⏰ Upcoming Deadlines</h2>
                            </div>
                            <div className="card-content-area">
                                <div className="deadline-list">
                                    {upcomingDeadlines.map((deadline, index) => (
                                        <div key={index} className="deadline-item">
                                            <div className="deadline-info">
                                                <div className="deadline-task">{deadline.task}</div>
                                                <div className="deadline-date">Due: {deadline.dueDate}</div>
                                            </div>
                                            <div className={`deadline-badge ${deadline.daysLeft <= 3 ? 'urgent' : 'normal'}`}>
                                                {deadline.daysLeft} days left
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Important Notices */}
                        <div className="dashboard-card">
                            <div className="card-title-bar">
                                <h2 className="card-main-title">📢 Announcements</h2>
                            </div>
                            <div className="card-content-area">
                                <div className="announcement-list">
                                    <div className="announcement-item">
                                        <span className="announcement-badge new">NEW</span>
                                        <div className="announcement-text">
                                            <strong>Revised Water Extraction Charges</strong>
                                            <p>New tariff rates effective from January 1, 2026</p>
                                        </div>
                                    </div>
                                    <div className="announcement-item">
                                        <span className="announcement-badge important">IMPORTANT</span>
                                        <div className="announcement-text">
                                            <strong>Mandatory Piezometer Installation</strong>
                                            <p>Required for all industries in semi-critical blocks</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Utility Tools */}
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">🛠️ Tools & Calculators</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="utility-tools-grid">
                                <Link to="/noc/water-budget-calculator" className="utility-tool-card">
                                    <div className="utility-icon">💧</div>
                                    <div className="utility-name">Water Budget Calculator</div>
                                </Link>
                                <Link to="/noc/abstraction-calculator" className="utility-tool-card">
                                    <div className="utility-icon">💰</div>
                                    <div className="utility-name">Abstraction Charges</div>
                                </Link>
                                <Link to="/noc/check-eligibility" className="utility-tool-card">
                                    <div className="utility-icon">✅</div>
                                    <div className="utility-name">Eligibility Checker</div>
                                </Link>
                                <Link to="/noc/document-requirements" className="utility-tool-card">
                                    <div className="utility-icon">📋</div>
                                    <div className="utility-name">Document Checklist</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCDashboard;
