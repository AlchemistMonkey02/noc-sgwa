import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ConsultationCallButton from '../../../components/ConsultationCallButton';
import { getOfficerData } from '../shared/utils/officerAuth';
import '../shared/styles/officer-portal.css';

const SGWADashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        total: 0,
        pendingApproval: 0,
        approved: 0,
        rejected: 0,
        dgoRecommended: 0,
        queriesRaised: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [officerInfo, setOfficerInfo] = useState(null);

    useEffect(() => {
        // Load officer data from localStorage
        const userData = getOfficerData();
        setOfficerInfo(userData);

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

                if (data.recentApplications && data.recentApplications.length > 0) {
                    const mappedRecents = data.recentApplications.map(app => ({
                        applicationId: app.id || app._id,
                        applicationNumber: app.applicationNumber,
                        applicantName: app.projectDetails?.applicantName || 'N/A',
                        projectName: app.projectDetails?.projectName || 'N/A',
                        district: app.location?.districtId || 'N/A',
                        // Handle both string and object water requirement
                        waterRequirement: app.waterRequirement?.totalDailyExtraction
                            ? `${app.waterRequirement.totalDailyExtraction} m³/day`
                            : (typeof app.waterRequirement === 'object'
                                ? `${app.waterRequirement.total || 0} m³/day`
                                : app.waterRequirement || 'N/A'),
                        submittedDate: app.submittedAt || app.submittedDate,
                        status: app.status,
                        daysInQueue: app.submittedAt
                            ? Math.floor((new Date() - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24))
                            : (app.daysInQueue || 0)
                    }));
                    setRecentApplications(mappedRecents);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Strictly API driven - no mock fallback
            setStatistics({
                total: 0,
                pendingApproval: 0,
                approved: 0,
                rejected: 0,
                dgoRecommended: 0,
                queriesRaised: 0
            });
            setRecentApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationClick = (application) => {
        navigate(`/officer/sgwa/applications/${application.applicationId}`);
    };

    const handleViewAll = () => {
        navigate('/officer/sgwa/applications');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t('officer.dashboard.loading')}</p>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'SGWA Officer'}
                officerRole="SGWA"
                officerDesignation={officerInfo?.designation || t('officer.login.roles.SGWA')}
                district={t('officer.dashboard.stateLevel')}
            />

            <div className="officer-layout">
                <OfficerSidebar role="SGWA" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">🏛️ {t('officer.dashboard.sgwaTitle')}</h1>
                            <p className="officer-page-subtitle">
                                {t('officer.dashboard.sgwaSubtitle')}
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="officer-stats-grid">
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.total')}</span>
                                    <div className="officer-stat-icon primary">📋</div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.total}</h2>
                                <p className="officer-stat-footer">{t('officer.dashboard.stats.allTime')}</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.pendingApproval')}</span>
                                    <div className="officer-stat-icon warning">⏳</div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.pendingApproval}</h2>
                                <p className="officer-stat-footer">{t('officer.dashboard.stats.requiresAttention')}</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.dgoRecommended')}</span>
                                    <div className="officer-stat-icon primary">✓</div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.dgoRecommended}</h2>
                                <p className="officer-stat-footer">{t('officer.dashboard.stats.readyForReview')}</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.approved')}</span>
                                    <div className="officer-stat-icon success">🎯</div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.approved}</h2>
                                <p className="officer-stat-footer">{t('officer.dashboard.stats.completed')}</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.queriesRaised')}</span>
                                    <div className="officer-stat-icon warning">❓</div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.queriesRaised}</h2>
                                <p className="officer-stat-footer">{t('officer.dashboard.stats.awaitingResponse')}</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.rejected')}</span>
                                    <div className="officer-stat-icon danger">✗</div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.rejected}</h2>
                                <p className="officer-stat-footer">{t('officer.dashboard.stats.notApproved')}</p>
                            </div>
                        </div>

                        {/* Recent Applications Section */}
                        <div style={{ marginTop: '2rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--officer-primary)', margin: 0 }}>
                                    {t('officer.dashboard.recent.title')}
                                </h2>
                                <button
                                    className="officer-btn officer-btn-primary"
                                    onClick={handleViewAll}
                                >
                                    {t('officer.dashboard.recent.viewAll')}
                                </button>
                            </div>

                            {recentApplications.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recentApplications.map((app) => (
                                        <div
                                            key={app.applicationId}
                                            className="officer-app-card"
                                            onClick={() => handleApplicationClick(app)}
                                        >
                                            <div className="officer-app-header">
                                                <div>
                                                    <h3 className="officer-app-title notranslate">{app.projectName}</h3>
                                                    <p className="officer-app-number notranslate">{app.applicationNumber}</p>
                                                </div>
                                                <span className={`officer-badge ${app.status.toLowerCase().replace(/_/g, '-')}`}>
                                                    {app.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="officer-app-body">
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">{t('officer.dashboard.fields.applicant')}</span>
                                                    <span className="officer-app-field-value notranslate">{app.applicantName}</span>
                                                </div>
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">{t('officer.dashboard.fields.district')}</span>
                                                    <span className="officer-app-field-value notranslate">{app.district}</span>
                                                </div>
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">{t('officer.dashboard.fields.waterRequirement')}</span>
                                                    <span className="officer-app-field-value notranslate">{app.waterRequirement}</span>
                                                </div>
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">{t('officer.dashboard.fields.daysInQueue')}</span>
                                                    <span className="officer-app-field-value notranslate" style={{
                                                        color: app.daysInQueue > 5 ? 'var(--officer-danger)' : 'inherit',
                                                        fontWeight: app.daysInQueue > 5 ? '600' : '400'
                                                    }}>
                                                        {app.daysInQueue} {t('officer.dashboard.fields.daysSuffix')}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Call Applicant */}
                                            <div className="officer-app-footer"
                                                style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ConsultationCallButton
                                                    applicationNumber={app.applicationNumber}
                                                    officerType="SGWA"
                                                    label="📞 Call Applicant"
                                                    variant="mini"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: 'var(--officer-bg-light)',
                                    borderRadius: '12px'
                                }}>
                                    <p style={{ color: 'var(--officer-text-light)', fontSize: '1.125rem' }}>
                                        {t('officer.dashboard.recent.none')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SGWADashboard;
