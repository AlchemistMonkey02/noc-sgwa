import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { EXTERNAL_URLS } from '../../config/constants';
import { nocApplicationService } from './services/nocApplicationService';
import ConsultationCallButton from '../../components/ConsultationCallButton';
import BackButton from '../../components/BackButton';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import './styles/noc-portal.css';

const NOCDashboard = () => {
    console.log("NOCDashboard mounting");
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { error: toastError } = useToast();
    const { user, loading, isLoggingOut } = useAuth();
    console.log("NOCDashboard auth state:", { user, loading, isLoggingOut });
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return; // Prevent fetching without user
            
            try {
                setDashboardLoading(true);
                const response = await nocApplicationService.getDashboardData();
                if (response.success) {
                    console.log("Dashboard Data received:", response.data);
                    setDashboardData(response.data);
                } else {
                    console.error('API returned failure for dashboard data:', response);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setDashboardLoading(false);
            }
        };

        // Only fetch if we are NOT loading auth AND we have a user
        if (!loading && user) {
            fetchDashboardData();
        }
    }, [user, loading]);



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



    // Map API data to dashboard stats
    const stats = dashboardData?.stats || {};
    const dashboardStats = [
        { label: t('dashboard.totalApps'), value: stats.totalApplications || '0', icon: '📝', color: 'blue' },
        { label: t('dashboard.inDraft'), value: stats.inDraft || '0', icon: '📄', color: 'gray' },
        { label: t('dashboard.inProcess'), value: stats.inProcess || '0', icon: '⏳', color: 'orange' },
        { label: t('dashboard.approvedNocs'), value: stats.approved || '0', icon: '✅', color: 'green' },
        { label: t('dashboard.queriesRaised'), value: stats.queriesRaised || '0', icon: '❓', color: 'purple' },
        { label: t('dashboard.rejected'), value: stats.rejected || '0', icon: '❌', color: 'red' }
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

    const formatDate = (dateString, fallback = 'N/A') => {
        if (!dateString) return fallback;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return fallback;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getValidityFallback = (baseDate) => {
        const date = baseDate ? new Date(baseDate) : new Date();
        const validDate = isNaN(date.getTime()) ? new Date() : date;
        validDate.setFullYear(validDate.getFullYear() + 2);
        return formatDate(validDate);
    };

    const recentApplications = (dashboardData?.recentApplications || []).map(app => ({
        id: app.applicationNumber || app.trackingId || app.applicationId || app.id || 'N/A',
        type: app.applicationTypeName || (app.applicationType === 'NEW' ? 'Fresh NOC' : app.applicationType === 'RENEWAL' ? 'NOC Renewal' : app.applicationType) || 'N/A',
        purpose: app.projectName || 
                 app.projectDetails?.projectName || 
                 app.projectDetails?.name || 
                 app.id || 
                 'N/A',
        submittedDate: formatDate(app.updatedAt || app.submittedAt || app.submittedDate),
        status: formatStatus(app.status || 'PENDING'),
        statusClass: getStatusClass(app.status || 'PENDING'),
        uuid: app.uuid || app._id,
        applicationId: app.applicationId || app.id || app.trackingId,
        _id: app._id || app.id
    }));

    const upcomingDeadlines = (dashboardData?.deadlines || []).map(d => ({
        task: d.task,
        dueDate: formatDate(d.dueDate),
        daysLeft: d.daysLeft
    }));

    const announcements = dashboardData?.announcements || [];

    // Filter approved NOCs from dashboard data
    const approvedNOCs = (dashboardData?.recentApplications || [])
        .filter(app => app.status === 'NOC_ISSUED' || app.status === 'APPROVED' || app.status === 'SGWA_APPROVED' || app.status === 'ACTIVE')
        .map(app => {
            const issueDateRaw = app.nocIssuedDate || app.updatedAt || app.submittedAt;
            return {
                uuid: app.uuid || app._id,
                nocNumber: app.applicationNumber || app.trackingId || 'N/A',
                refId: app.trackingId || app.applicationId || app.id,
                projectName: app.projectName || 
                           app.projectDetails?.projectName || 
                           app.projectDetails?.name || 
                           app.id || 
                           'N/A',
                issueDate: formatDate(issueDateRaw),
                validUpto: app.nocValidityDate ? formatDate(app.nocValidityDate) : getValidityFallback(issueDateRaw),
                status: t('dashboard.active')
            };
        });

    // Handle View Certificate
    const handleViewCertificate = async (uuid, nocNumber) => {
        try {
            navigate(`/noc/certificate/${uuid}`);
        } catch (error) {
            console.error('Error viewing certificate:', error);
            toastError('Failed to view certificate. Please try again.');
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
            toastError('Failed to download certificate. Please try again.');
        }
    };



    return (
        <LayoutWithSidebar>
            {/* Gradient Header Bar Removed for clean SaaS look */}

            <div className="content-container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">{t('dashboard.home')}</Link>
                    <span className="separator">›</span>
                    <span className="current">{t('dashboard.title')}</span>
                </div>

                {/* Back Button */}
                <BackButton />

                {/* Page Title */}
                <div className="page-title-section">
                    <h1 className="page-main-title">{t('dashboard.title')}</h1>
                    <p className="page-subtitle">
                        {t('dashboard.welcome')}, <span className="notranslate">
                            {user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 
                             user?.name || 
                             user?.username || 
                             'User'}
                        </span>! {t('dashboard.overview')}
                    </p>
                </div>

                {/* Dashboard Stats */}
                <div className="dashboard-stats-grid">
                    {dashboardStats.map((stat, index) => (
                        <div
                            key={index}
                            className={`dashboard-stat-card ${stat.color}`}
                            onClick={() => {
                                if (stat.label === t('dashboard.totalApps')) navigate('/noc/track-status');
                                if (stat.label === t('dashboard.paymentDetails')) navigate('/noc/payment-details');
                            }}
                            style={{ cursor: stat.label === t('dashboard.totalApps') || stat.label === t('dashboard.paymentDetails') ? 'pointer' : 'default' }}
                        >
                            <div className="stat-card-content">
                                <div className="stat-icon-wrapper">
                                    <span className="stat-icon">{stat.icon}</span>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number notranslate">{stat.value}</div>
                                    <div className="stat-label-text">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card">
                    <div className="card-title-bar">
                        <h2 className="card-main-title">{t('dashboard.quickActions')}</h2>
                    </div>
                    <div className="card-content-area">
                        <div className="quick-actions-grid">
                            <Link to="/noc/application" className="quick-action-item">
                                <span className="action-icon-badge blue">📝</span>
                                <span className="action-text">{t('dashboard.applyFresh')}</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/check-eligibility" className="quick-action-item">
                                <span className="action-icon-badge indigo">✨</span>
                                <span className="action-text">{t('dashboard.checkEligibility')}</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/application?type=renewal" className="quick-action-item">
                                <span className="action-icon-badge orange">🔄</span>
                                <span className="action-text">{t('dashboard.renewNoc')}</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/track-status" className="quick-action-item">
                                <span className="action-icon-badge red">🔍</span>
                                <span className="action-text">{t('dashboard.trackApp')}</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/queries" className="quick-action-item">
                                <span className="action-icon-badge purple">❓</span>
                                <span className="action-text">{t('dashboard.viewQueries')}</span>
                                <span className="action-chevron">→</span>
                            </Link>
                            <Link to="/noc/payment-details" className="quick-action-item">
                                <span className="action-icon-badge teal">💳</span>
                                <span className="action-text">{t('dashboard.paymentDetails')}</span>
                                <span className="action-chevron">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Approved NOC Certificates */}
                {approvedNOCs.length > 0 && (
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">{t('dashboard.yourNocs')}</h2>
                            <span className="status-badge success">{approvedNOCs.length} {t('dashboard.active')}</span>
                        </div>
                        <div className="card-content-area">
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {approvedNOCs.map((noc, index) => (
                                    <div
                                        key={index}
                                        className="card"
                                        style={{
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-900)', fontSize: '1.125rem' }}>
                                                📋 <span className="notranslate">{noc.projectName}</span>
                                            </h3>
                                            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                <strong>{t('dashboard.nocNumberLabel')}</strong> <span className="notranslate">{noc.nocNumber}</span>
                                            </p>
                                            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                <strong>{t('dashboard.issueDateLabel')}</strong> <span className="notranslate">{noc.issueDate}</span> | <strong>{t('dashboard.validUntilLabel')}</strong> <span className="notranslate">{noc.validUpto}</span>
                                            </p>
                                            <span className="badge badge-success notranslate" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                                ✅ {noc.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => handleViewCertificate(noc.uuid, noc.nocNumber)}
                                                className="btn btn-secondary"
                                            >
                                                {t('dashboard.viewCert')}
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleDownloadCertificate(noc.uuid)}
                                            >
                                                {t('dashboard.download')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Connect with Officers */}
                {recentApplications.length > 0 && (
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">🎥 Connect with your Case Officers</h2>
                            <span className="status-badge info">Video / Voice</span>
                        </div>
                        <div className="card-content-area">
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                                Start a live consultation with your assigned officer for your most recent application:{' '}
                                <strong className="notranslate">{recentApplications[0]?.applicationNumber || recentApplications[0]?.id}</strong>.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <ConsultationCallButton
                                    applicationNumber={recentApplications[0]?.applicationNumber || recentApplications[0]?.id}
                                    officerType="DGO"
                                    label="📞 Call DGO"
                                    variant="primary"
                                />
                                <ConsultationCallButton
                                    applicationNumber={recentApplications[0]?.applicationNumber || recentApplications[0]?.id}
                                    officerType="SGWA"
                                    label="📞 Call SGWA"
                                    variant="primary"
                                />
                                <ConsultationCallButton
                                    applicationNumber={recentApplications[0]?.applicationNumber || recentApplications[0]?.id}
                                    officerType="ENFORCEMENT"
                                    label="📞 Call Enforcement"
                                    variant="primary"
                                />
                            </div>
                            {recentApplications.length > 1 && (
                                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                                    💡 Showing buttons for your most recent application. Go to{' '}
                                    <Link to="/noc/track-status">Application Status</Link> to call for a specific application.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Applications */}
                <div className="dashboard-card">
                    <div className="card-title-bar">
                        <h2 className="card-main-title">{t('dashboard.recentApps')}</h2>
                        <Link to="/noc/track-status" className="card-view-all">{t('dashboard.viewAll')}</Link>
                    </div>
                    <div className="card-content-area no-padding">
                        <div className="professional-table-wrapper">
                            <table className="professional-table">
                                <thead>
                                    <tr>
                                        <th>{t('dashboard.appId')}</th>
                                        <th>{t('dashboard.type')}</th>
                                        <th>{t('dashboard.submittedDate')}</th>
                                        <th>{t('dashboard.status')}</th>
                                        <th>{t('dashboard.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((app, index) => (
                                        <tr key={index}>
                                            <td data-label={t('dashboard.appId')} className="notranslate"><strong className="text-blue">{app.id}</strong></td>
                                            <td data-label={t('dashboard.type')} className="notranslate">{app.type}</td>
                                            <td data-label={t('dashboard.submittedDate')} className="notranslate">{app.submittedDate}</td>
                                            <td data-label={t('dashboard.status')}>
                                                <span className={`status-badge notranslate ${app.statusClass || (app.status === 'Exempt' ? 'success' : 'info')}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td data-label={t('dashboard.actions')}>
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', minWidth: '150px' }}>
                                                    <button
                                                        className="table-action-btn"
                                                        onClick={() => {
                                                            const targetId = app._id;
                                                            navigate(`/noc/application/${targetId}`);
                                                        }}
                                                        style={{ height: '28px', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        {t('dashboard.view')}
                                                    </button>
                                                    <ConsultationCallButton
                                                        applicationNumber={app.id}
                                                        officerType="DGO"
                                                        label="📞 DGO"
                                                        variant="mini"
                                                        style={{ padding: '4px 8px' }}
                                                    />
                                                    <ConsultationCallButton
                                                        applicationNumber={app.id}
                                                        officerType="SGWA"
                                                        label="📞 SGWA"
                                                        variant="mini"
                                                        style={{ padding: '4px 8px' }}
                                                    />
                                                    <ConsultationCallButton
                                                        applicationNumber={app.id}
                                                        officerType="ENFORCEMENT"
                                                        label="📞 Enf."
                                                        variant="mini"
                                                        style={{ padding: '4px 8px' }}
                                                    />
                                                </div>
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
                            <h2 className="card-main-title">{t('dashboard.deadlinesTitle')}</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="deadline-list">
                                {upcomingDeadlines.length > 0 ? (
                                    upcomingDeadlines.map((deadline, index) => (
                                        <div key={index} className="deadline-item">
                                            <div className="deadline-info">
                                                <div className="deadline-task">{deadline.task}</div>
                                                <div className="deadline-date">{t('dashboard.due')} {deadline.dueDate}</div>
                                            </div>
                                            <div className={`deadline-badge ${deadline.daysLeft <= 3 ? 'urgent' : 'normal'}`}>
                                                {deadline.daysLeft} {t('dashboard.daysLeft')}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-text">{t('dashboard.noUpcomingDeadlines') || 'No upcoming deadlines'}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Important Notices */}
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">{t('dashboard.announcements')}</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="announcement-list">
                                {announcements.length > 0 ? (
                                    announcements.map((ann, index) => (
                                        <div key={index} className="announcement-item">
                                            <span className={`announcement-badge ${ann.type.toLowerCase()}`}>
                                                {ann.type === 'NEW' ? t('dashboard.new') : t('dashboard.important')}
                                            </span>
                                            <div className="announcement-text">
                                                <strong>{ann.title}</strong>
                                                <p>{ann.description}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-text">{t('dashboard.noAnnouncements') || 'No new announcements'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Utility Tools */}
                <div className="dashboard-card">
                    <div className="card-title-bar">
                        <h2 className="card-main-title">{t('dashboard.toolsTitle')}</h2>
                    </div>
                    <div className="card-content-area">
                        <div className="utility-tools-grid">
                            <a href={EXTERNAL_URLS.CHARGES_CALCULATOR} target="_blank" rel="noopener noreferrer" className="utility-tool-card" style={{ textDecoration: 'none' }}>
                                <div className="utility-icon">💰</div>
                                <div className="utility-name">{t('dashboard.abstraction')}</div>
                            </a>
                            <Link to="/noc/check-eligibility" className="utility-tool-card">
                                <div className="utility-icon">✅</div>
                                <div className="utility-name">{t('dashboard.checkEligibility')}</div>
                            </Link>
                            <Link to="/tools/document-checklist" className="utility-tool-card">
                                <div className="utility-icon">📋</div>
                                <div className="utility-name">{t('dashboard.docChecklist')}</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutWithSidebar>
    );
};

export default NOCDashboard;
