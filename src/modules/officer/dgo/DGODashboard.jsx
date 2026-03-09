import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ApplicationCard from '../shared/components/ApplicationCard';
import officerService from '../services/officerService';
import { getOfficerData } from '../shared/utils/officerAuth';
import '../shared/styles/officer-portal.css';

const DGODashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        total: 0,
        pendingVerification: 0,
        underReview: 0,
        queriesRaised: 0,
        inspectionPending: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [district, setDistrict] = useState('');
    const [officerInfo, setOfficerInfo] = useState(null);
    const [pendingInspections, setPendingInspections] = useState([]);

    useEffect(() => {
        // Load officer data from localStorage
        const userData = getOfficerData();
        setOfficerInfo(userData);

        // Fetch dashboard statistics
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log('Fetching DGO dashboard data...');
            const response = await officerService.getDGODashboard();

            console.log('Dashboard response:', response);

            if (response.success) {
                const data = response.data;

                // Update statistics
                setStatistics({
                    total: data.stats?.totalApplications || 0,
                    pendingVerification: data.stats?.pendingVerification || 0,
                    underReview: data.stats?.underReview || 0,
                    queriesRaised: data.stats?.queriesRaised || 0,
                    inspectionPending: data.stats?.inspectionPending || 0
                });

                // Set district
                if (data.myDistrict) {
                    setDistrict(data.myDistrict);
                }

                // Update recent applications
                if (data.recentApplications && data.recentApplications.length > 0) {
                    const formattedApps = data.recentApplications.map(app => ({
                        applicationId: app.applicationId || app._id,
                        applicationNumber: app.applicationNumber,
                        applicantName: app.projectDetails?.applicantName || 'N/A',
                        projectName: app.projectDetails?.projectName || 'N/A',
                        projectType: app.sectorType || app.applicationSubType || 'N/A',
                        district: app.location?.districtId || 'N/A',
                        block: app.location?.blockId || 'N/A',
                        waterRequirement: `${app.waterRequirement?.totalDailyExtraction || 0} m³/day`,
                        submittedDate: app.submittedAt,
                        status: app.status,
                        daysInQueue: Math.floor((new Date() - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24)) || 0
                    }));
                    setRecentApplications(formattedApps);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Error state handled by showing 0s as per initial state
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationClick = (application) => {
        navigate(`/officer/dgo/applications/${application.applicationId}`);
    };

    const handleViewAll = () => {
        navigate('/officer/dgo/applications');
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'DGO Officer'}
                officerRole="DGO"
                officerDesignation={officerInfo?.designation || t('officer.login.roles.DGO')}
                district={district || officerInfo?.communicationAddress?.district || officerInfo?.district || 'Jaipur'}
            />

            <div className="officer-layout">
                <OfficerSidebar role="DGO" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📊 {t('officer.dashboard.title')}</h1>
                            <p className="officer-page-subtitle">
                                {t('officer.dashboard.subtitle')}
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="officer-stats-grid">
                            {/* Total Applications */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.total')}</span>
                                    <div className="officer-stat-icon primary">
                                        📋
                                    </div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.total}</h2>
                                <div className="officer-stat-footer">
                                    <span>{t('officer.dashboard.stats.allTime')}</span>
                                </div>
                            </div>

                            {/* Pending Verification */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.pendingVerification')}</span>
                                    <div className="officer-stat-icon warning">
                                        ⏳
                                    </div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.pendingVerification}</h2>
                                <div className="officer-stat-footer">
                                    <span style={{ color: 'var(--officer-warning)' }}>⚠️ {t('officer.dashboard.stats.requiresAttention')}</span>
                                </div>
                            </div>

                            {/* Under Review */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.underReview')}</span>
                                    <div className="officer-stat-icon primary">
                                        🔍
                                    </div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.underReview}</h2>
                                <div className="officer-stat-footer">
                                    <span>{t('officer.dashboard.stats.inProgress')}</span>
                                </div>
                            </div>

                            {/* Queries Raised */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.queriesRaised')}</span>
                                    <div className="officer-stat-icon danger">
                                        ❓
                                    </div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.queriesRaised}</h2>
                                <div className="officer-stat-footer">
                                    <span>{t('officer.dashboard.stats.awaitingResponse')}</span>
                                </div>
                            </div>

                            {/* Inspection Pending */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">{t('officer.dashboard.stats.inspectionPending')}</span>
                                    <div className="officer-stat-icon warning">
                                        🔍
                                    </div>
                                </div>
                                <h2 className="officer-stat-value notranslate">{statistics.inspectionPending}</h2>
                                <div className="officer-stat-footer">
                                    <span>{t('officer.dashboard.stats.siteVisitsRequired')}</span>
                                </div>
                            </div>
                        </div>


                        {/* Pending Inspections Section */}
                        {pendingInspections.length > 0 && (
                            <div className="officer-mt-4">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--officer-warning)', margin: '0 0 1rem 0' }}>
                                    🔍 {t('officer.dashboard.inspections.title')}
                                </h2>
                                <div className="inspection-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {pendingInspections.map(item => (
                                        <div key={item.id} className="officer-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--officer-warning)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span className="status-badge status-inspection-scheduled">{t('officer.dashboard.inspections.scheduled')}</span>
                                                <span className="notranslate" style={{ fontSize: '0.875rem', color: '#666' }}>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="notranslate" style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>{item.projectName}</h3>
                                            <p className="notranslate" style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>{item.applicationNumber}</p>
                                            <button
                                                className="officer-btn officer-btn-primary"
                                                style={{ width: '100%' }}
                                                onClick={() => navigate(`/officer/dgo/applications/${item.id}/inspection-report`)}
                                            >
                                                📝 {t('officer.dashboard.inspections.submitReport')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Applications */}
                        <div className="officer-mt-4">
                            <div className="officer-flex-between officer-mb-3">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--officer-primary)', margin: 0 }}>
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
                                recentApplications.map((application) => (
                                    <ApplicationCard
                                        key={application.applicationId}
                                        application={application}
                                        onClick={handleApplicationClick}
                                        showCallButton={true}
                                        officerType="DGO"
                                    />
                                ))
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: 'var(--officer-text-light)'
                                }}>
                                    <p style={{ fontSize: '1.125rem' }}>{t('officer.dashboard.recent.none')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
};

export default DGODashboard;
