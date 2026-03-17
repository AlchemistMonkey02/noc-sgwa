import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ConsultationCallButton from '../../../components/ConsultationCallButton';
import { useAuth } from '../../../context/AuthContext';
import { nocApplicationService } from '../../noc/services/nocApplicationService';
import '../shared/styles/officer-portal.css';

const SGWADashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [dashboardLoading, setDashboardLoading] = useState(true);
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

    const [masterData, setMasterData] = useState({
        districts: [],
        appTypes: []
    });

    const resolveIdToName = (id, options, defaultVal = 'N/A') => {
        if (!id || !options || options.length === 0) return id || defaultVal;
        const match = options.find(opt =>
            String(opt.id || opt.appTypeCode || opt.appSubTypeCode || opt.projectTypeCode || opt.appTypeCatCode || opt.industryTypeId || opt.code || opt._id) === String(id)
        );
        return match ? (match.name || match.label || match.industryName) : id;
    };

    useEffect(() => {
        if (!authLoading && user) {
            setOfficerInfo(user);
            fetchDashboardData();
            fetchMasterData();
        }
    }, [user, authLoading]);

    const fetchMasterData = async () => {
        try {
            // Fetch all districts for resolution
            const [distResp, typeResp] = await Promise.all([
                nocApplicationService.getDistricts('Rajasthan'),
                nocApplicationService.getApplicationTypes()
            ]);

            let blocksData = [];
            // Try to fetch blocks for officer's district, but also fetch all blocks if needed
            // or fetch unique districts' blocks from the applications list (handled reactively)
            const districtIdToFetch = user?.districtId || user?.location?.districtId;
            if (districtIdToFetch) {
                try {
                    const blockResp = await nocApplicationService.getBlocks(districtIdToFetch);
                    if (blockResp.success) blocksData = blockResp.data || [];
                } catch (e) {
                    console.warn('Failed to fetch officer-specific blocks');
                }
            }

            if (distResp.success && typeResp.success) {
                setMasterData({
                    districts: distResp.data || [],
                    blocks: blocksData,
                    appTypes: typeResp.data || []
                });
            }
        } catch (error) {
            console.error('Error fetching SGWA dashboard master data:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setDashboardLoading(true);
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
                    const recentApps = (data.recentApplications || []).map(app => {
                        // 1. Applicant Name - Exhaustive Fallbacks
                        const getApplicantName = (app) => {
                            return app.applicantName || 
                                   app.applicantDetails?.name || 
                                   app.ownerDetails?.ownerName ||
                                   app.projectDetails?.applicantName || 
                                   app.projectDetails?.name || 
                                   app.companyId?.contactPerson || 
                                   (app.userId?.firstName ? `${app.userId.firstName} ${app.userId.lastName || ''}`.trim() : '') ||
                                   app.userId?.name ||
                                   app.projectDetails?.companyName ||
                                   'N/A';
                        };

                        // 2. District & Block - Multi-layered Fallbacks
                        const districtId = app.districtId ||
                                         app.district ||
                                         app.location?.districtId || 
                                         app.locationDetails?.districtId ||
                                         app.locationDetails?.district ||
                                         app.ownerDetails?.district ||
                                         app.agriculturalDetails?.district ||
                                         app.projectDetails?.districtId ||
                                         app.projectDetails?.district ||
                                         app.communicationAddress?.district;

                        const blockId = app.blockId ||
                                      app.block ||
                                      app.location?.blockId || 
                                      app.locationDetails?.blockId ||
                                      app.locationDetails?.block ||
                                      app.locationDetails?.assessmentUnitBlockTehsil ||
                                      app.locationDetails?.assessmentUnit ||
                                      app.locationDetails?.tehsil ||
                                      app.agriculturalDetails?.assessmentUnitBlockTehsil ||
                                      app.agriculturalDetails?.tehsil ||
                                      app.projectDetails?.blockId ||
                                      app.projectDetails?.block ||
                                      app.communicationAddress?.subDistrict;

                        // Improved resolver that returns ID if name not found
                        const resolveName = (id, list) => {
                            if (!id || String(id).toLowerCase() === 'unknown') return null;
                            if (!list || list.length === 0) return id;
                            const found = list.find(item => 
                                String(item.id || item.districtId || item.blockId || item.code || item._id) === String(id) ||
                                String(item.name || item.districtName || item.blockName) === String(id)
                            );
                            return found ? (found.name || found.districtName || found.blockName) : id;
                        };

                        const districtValue = resolveName(districtId, masterData.districts);
                        const blockValue = resolveName(blockId, masterData.blocks);

                        // 3. Water Requirement - Comprehensive Resolver
                        const getWaterValue = (app) => {
                            const val = app.waterReqFreshRequirement || 
                                       app.dailyWaterRequirement ||
                                       app.waterReqTotal ||
                                       app.waterRequirementKLD ||
                                       app.agriculturalDetails?.waterRequirementKLD ||
                                       app.waterRequirement?.totalDailyExtraction || 
                                       app.waterRequirement?.dailyRequirement || 
                                       app.waterRequirement?.total || 
                                       app.waterRequirement?.daily ||
                                       app.waterRequirement?.breakup?.total ||
                                       app.drinkingDomesticUse?.totalRequirement ||
                                       app.domesticTotalDaily ||
                                       (typeof app.waterRequirement === 'number' || typeof app.waterRequirement === 'string' ? app.waterRequirement : null) ||
                                       app.projectDetails?.waterRequirement ||
                                       app.projectDetails?.dailyWaterRequirement;
                            
                            if (val === undefined || val === null || val === '' || val === 0) {
                                return app.totalWaterRequirement ? `${app.totalWaterRequirement} m³/day` : 'N/A';
                            }
                            return `${val} m³/day`;
                        };

                        const submittedDateRaw = app.submittedDate || app.submittedAt || app.updatedAt;

                        return {
                            applicationId: app.id || app._id || app.applicationId,
                            applicationNumber: app.applicationNumber || app.trackingId || 'N/A',
                            applicantName: getApplicantName(app),
                            projectName: app.projectName || 
                                       app.projectDetails?.projectName || 
                                       app.projectDetails?.name || 
                                       app.id || 
                                       'N/A',
                            district: districtValue || app.districtName || 'N/A',
                            block: blockValue || app.blockName || 'N/A',
                            waterRequirement: getWaterValue(app),
                            projectType: app.projectDetails?.projectType || 
                                       app.projectDetails?.sector || 
                                       app.projectDetails?.projectCategory ||
                                       app.applicationType || 
                                       app.groundWaterUtilizationFor ||
                                       'N/A',
                            status: app.status || 'PENDING',
                            submittedDate: submittedDateRaw,
                            priority: app.priority || 'MEDIUM',
                            daysInQueue: submittedDateRaw
                                    ? Math.floor((new Date() - new Date(submittedDateRaw)) / (1000 * 60 * 60 * 24))
                                    : (app.daysInQueue || 0)
                        };
                    });
                    setRecentApplications(recentApps);
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
            setDashboardLoading(false);
        }
    };

    const handleApplicationClick = (application) => {
        navigate(`/officer/sgwa/applications/${application.applicationId}`);
    };

    const handleViewAll = () => {
        navigate('/officer/sgwa/applications');
    };

    if (authLoading || dashboardLoading) {
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
                                                    <span className="officer-app-field-label">{t('officer.dashboard.fields.location')}</span>
                                                    <span className="officer-app-field-value notranslate">{app.block}, {app.district}</span>
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
