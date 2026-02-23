import React, { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EXTERNAL_URLS } from '../../config/constants';
import { nocApplicationService } from './services/nocApplicationService';
import BackButton from '../../components/BackButton';

import LayoutWithSidebar from './components/LayoutWithSidebar';
import './styles/noc-portal.css';

const NOCDashboard = () => {
    console.log("NOCDashboard mounting");
    const navigate = useNavigate();
    const { user, loading, isLoggingOut } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const sectionRefs = useRef([]);

    const addRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

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

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('nd-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => sectionRefs.current.forEach((el) => el && observer.unobserve(el));
    }, [dashboardData]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user && !isLoggingOut) {
            console.log("Redirecting to login from NOCDashboard");
            navigate('/noc/login');
        }
    }, [user, loading, isLoggingOut, navigate]);

    if (loading || dashboardLoading) {
        return (
            <LayoutWithSidebar>
                <div className="page-gradient-header"></div>
                <div className="content-container">
                    {/* Breadcrumb Skeleton */}
                    <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
                        <SkeletonLoader width="150px" height="1rem" />
                    </div>

                    {/* Title Skeleton */}
                    <div className="page-title-section">
                        <SkeletonLoader variant="title" width="300px" />
                        <SkeletonLoader variant="text" width="400px" />
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="dashboard-stats-grid">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="dashboard-stat-card">
                                <div className="stat-card-content">
                                    <div className="stat-info" style={{ width: '100%' }}>
                                        <SkeletonLoader width="40px" height="40px" style={{ marginBottom: '10px', borderRadius: '50%' }} />
                                        <SkeletonLoader width="60%" height="2rem" />
                                        <SkeletonLoader width="80%" height="1rem" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions Skeleton */}
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <SkeletonLoader variant="title" width="200px" height="1.5rem" style={{ marginBottom: 0 }} />
                        </div>
                        <div className="card-content-area">
                            <div className="quick-actions-grid">
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="quick-action-item" style={{ height: '80px' }}>
                                        <SkeletonLoader width="40px" height="40px" variant="circle" />
                                        <SkeletonLoader width="60%" height="1rem" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Apps Skeleton */}
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <SkeletonLoader variant="title" width="250px" height="1.5rem" style={{ marginBottom: 0 }} />
                        </div>
                        <div className="card-content-area no-padding">
                            <div className="professional-table-wrapper">
                                <table className="professional-table">
                                    <thead>
                                        <tr>
                                            {Array(6).fill(0).map((_, i) => (
                                                <th key={i}><SkeletonLoader width="80%" height="1rem" /></th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array(5).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                {Array(6).fill(0).map((_, j) => (
                                                    <td key={j}><SkeletonLoader width="90%" height="1rem" /></td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </LayoutWithSidebar>
        );
    }

    if (!user) return <div style={{ padding: '100px', textAlign: 'center' }}>Redirecting to login...</div>; // Will redirect via effect

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
        type: app.applicationTypeName || (app.applicationType === 'NEW' ? 'Fresh NOC' : app.applicationType === 'RENEWAL' ? 'NOC Renewal' : app.applicationType),
        purpose: app.projectDetails?.projectName || 'N/A',
        submittedDate: formatDate(app.updatedAt),
        status: formatStatus(app.status),
        statusClass: getStatusClass(app.status),
        uuid: app.uuid,
        applicationId: app.applicationId || app.id || app.trackingId,
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
            refId: app.trackingId || app.applicationId || app.id, // Capture Reference ID
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
    const handleDownloadCertificate = async (uuid) => {
        try {
            // Fetch latest summary to ensure we have the correct Tracking ID (Ref ID)
            const summaryResponse = await nocApplicationService.getApplication(uuid);

            if (summaryResponse.success && summaryResponse.data?.trackingId) {
                const refId = summaryResponse.data.trackingId;
                await nocApplicationService.downloadCertificate(refId);
            } else {
                console.warn('Tracking ID not found in summary, falling back to UUID');
                // Fallback to UUID if tracking ID is missing (though backend might fail)
                await nocApplicationService.downloadCertificate(uuid);
            }
        } catch (error) {
            console.error('Error downloading certificate:', error);
            alert('Failed to download certificate. Please try again.');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <LayoutWithSidebar>
            <div className="page-gradient-header"></div>

            <div className="nd-premium-bg">
                <div className="nd-shape nd-shape-1"></div>
                <div className="nd-shape nd-shape-2"></div>
                <div className="nd-shape nd-shape-3"></div>
            </div>

            <div className="content-container nd-dashboard-wrapper">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="separator">›</span>
                    <span className="current">Dashboard</span>
                </div>

                {/* Back Button */}
                <BackButton />

                {/* Page Title */}
                <div className="page-title-section nd-animate" ref={addRef}>
                    <h1 className="page-main-title">NOC Dashboard</h1>
                    <p className="page-subtitle">Welcome back, <span className="nd-user-highlight">{user?.username || 'User'}</span>! Here's your abstraction overview.</p>
                </div>

                {/* Dashboard Stats */}
                <div className="dashboard-stats-grid nd-animate" ref={addRef}>
                    {dashboardStats.map((stat, index) => (
                        <div
                            key={index}
                            className={`dashboard-stat-card nd-stat-${stat.color}`}
                            onClick={() => {
                                if (stat.label === 'Total Applications') navigate('/noc/track-status');
                                if (stat.label === 'Pending Payments') navigate('/noc/payment-details');
                            }}
                            style={{
                                cursor: stat.label === 'Total Applications' || stat.label === 'Pending Payments' ? 'pointer' : 'default',
                                transitionDelay: `${index * 100}ms`
                            }}
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
                            <div className="stat-card-bg-glow"></div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card nd-animate" ref={addRef}>
                    <div className="card-title-bar">
                        <h2 className="card-main-title">⚡ Quick Actions</h2>
                    </div>
                    <div className="card-content-area">
                        <div className="quick-actions-grid">
                            <Link to="/noc/application" className="quick-action-item nd-action-card">
                                <span className="action-icon-badge blue">📝</span>
                                <span className="action-text">Apply For Fresh NOC</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/check-eligibility" className="quick-action-item nd-action-card">
                                <span className="action-icon-badge indigo">✨</span>
                                <span className="action-text">Check Eligibility</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/application?type=renewal" className="quick-action-item nd-action-card">
                                <span className="action-icon-badge orange">🔄</span>
                                <span className="action-text">Renew Existing NOC</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/track-status" className="quick-action-item nd-action-card">
                                <span className="action-icon-badge red">🔍</span>
                                <span className="action-text">Track Application</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/queries" className="quick-action-item nd-action-card">
                                <span className="action-icon-badge purple">❓</span>
                                <span className="action-text">View Queries</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/payment-details" className="quick-action-item nd-action-card">
                                <span className="action-icon-badge teal">💳</span>
                                <span className="action-text">Payment Details</span>
                                <span className="action-chevron">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Approved NOC Certificates */}
                {approvedNOCs.length > 0 && (
                    <div className="dashboard-card nd-animate" ref={addRef}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">📜 Your NOC Certificates</h2>
                            <span className="status-badge success">{approvedNOCs.length} Active</span>
                        </div>
                        <div className="card-content-area">
                            <div className="nd-certificates-list">
                                {approvedNOCs.map((noc, index) => (
                                    <div
                                        key={index}
                                        className="nd-cert-premium-card"
                                    >
                                        <div className="nd-cert-info">
                                            <h3 className="nd-cert-project">
                                                📋 {noc.projectName}
                                            </h3>
                                            <p className="nd-cert-detail">
                                                <strong>NOC Number:</strong> {noc.nocNumber}
                                            </p>
                                            <p className="nd-cert-detail">
                                                <strong>Issue Date:</strong> {noc.issueDate} | <strong>Valid Until:</strong> 2 years from issue date
                                            </p>
                                            <span className="status-badge success nd-status-tag">
                                                ✅ {noc.status}
                                            </span>
                                        </div>
                                        <div className="nd-cert-actions">
                                            <button
                                                onClick={() => handleViewCertificate(noc.uuid, noc.nocNumber)}
                                                className="nd-btn-primary-sm"
                                            >
                                                👁️ View Certificate
                                            </button>
                                            <button
                                                className="nd-btn-outline-sm"
                                                onClick={() => handleDownloadCertificate(noc.uuid)}
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
                <div className="dashboard-card nd-animate" ref={addRef}>
                    <div className="card-title-bar">
                        <h2 className="card-main-title">📄 Recent Applications</h2>
                        <Link to="/noc/track-status" className="card-view-all">View All →</Link>
                    </div>
                    <div className="card-content-area no-padding">
                        <div className="professional-table-wrapper">
                            <table className="professional-table nd-dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Application ID</th>
                                        <th>Type</th>
                                        <th>Submitted Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((app, index) => (
                                        <tr key={index}>
                                            <td data-label="Application ID"><strong className="text-blue">{app.id}</strong></td>
                                            <td data-label="Type">{app.type}</td>
                                            <td data-label="Submitted Date">{app.submittedDate}</td>
                                            <td data-label="Status">
                                                <span className={`status-badge ${app.statusClass || (app.status === 'Exempt' ? 'success' : 'info')}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <button
                                                    className="nd-table-view-btn"
                                                    onClick={() => {
                                                        const targetId = app._id;
                                                        navigate(`/noc/application/${targetId}`);
                                                    }}
                                                >
                                                    View Details
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
                <div className="dashboard-two-column nd-animate" ref={addRef}>
                    {/* Upcoming Deadlines */}
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">⏰ Upcoming Deadlines</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="deadline-list">
                                {upcomingDeadlines.map((deadline, index) => (
                                    <div key={index} className="deadline-item nd-hover-lift">
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
                                <div className="announcement-item nd-hover-lift">
                                    <span className="announcement-badge new">NEW</span>
                                    <div className="announcement-text">
                                        <strong>Revised Water Extraction Charges</strong>
                                        <p>New tariff rates effective from January 1, 2026</p>
                                    </div>
                                </div>
                                <div className="announcement-item nd-hover-lift">
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
                <div className="dashboard-card nd-animate" ref={addRef}>
                    <div className="card-title-bar">
                        <h2 className="card-main-title">🛠️ Tools & Calculators</h2>
                    </div>
                    <div className="card-content-area">
                        <div className="utility-tools-grid">
                            <a href={EXTERNAL_URLS.CHARGES_CALCULATOR} target="_blank" rel="noopener noreferrer" className="utility-tool-card nd-tool-premium" style={{ textDecoration: 'none' }}>
                                <div className="utility-icon">💰</div>
                                <div className="utility-name">Abstraction Charges</div>
                            </a>
                            <Link to="/noc/check-eligibility" className="utility-tool-card nd-tool-premium">
                                <div className="utility-icon">✅</div>
                                <div className="utility-name">Eligibility Checker</div>
                            </Link>
                            <Link to="/tools/document-checklist" className="utility-tool-card nd-tool-premium">
                                <div className="utility-icon">📋</div>
                                <div className="utility-name">Document Checklist</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutWithSidebar >
    );
};

export default NOCDashboard;
