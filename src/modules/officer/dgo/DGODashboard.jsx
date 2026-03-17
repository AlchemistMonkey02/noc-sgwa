import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ApplicationCard from '../shared/components/ApplicationCard';
import ScheduleInspectionModal from '../shared/components/ScheduleInspectionModal';
import officerService from '../services/officerService';
import { nocApplicationService } from '../../noc/services/nocApplicationService';
import { useAuth } from '../../../context/AuthContext';
import '../shared/styles/officer-portal.css';

const resolveIdToName = (id, options, defaultVal = 'N/A') => {
    if (!id || !options || options.length === 0) return id || defaultVal;
    const match = options.find(opt =>
        String(opt.id || opt.appTypeCode || opt.appSubTypeCode || opt.projectTypeCode || opt.appTypeCatCode || opt.industryTypeId || opt.code || opt._id) === String(id)
    );
    return match ? (match.name || match.label || match.industryName) : id;
};

const DGODashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [statistics, setStatistics] = useState({
        total: 0,
        pendingVerification: 0,
        underReview: 0,
        queriesRaised: 0,
        inspectionPending: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [rawApplications, setRawApplications] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [district, setDistrict] = useState('');
    const [officerInfo, setOfficerInfo] = useState(null);
    const [pendingInspections, setPendingInspections] = useState([]);
    const [masterData, setMasterData] = useState({
        districts: [],
        blocks: [],
        appTypes: []
    });
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [selectedAppForInspection, setSelectedAppForInspection] = useState(null);
    const [inspectionOfficers, setInspectionOfficers] = useState([]);

    useEffect(() => {
        if (!authLoading && user) {
            setOfficerInfo(user);
            fetchDashboardData();
            fetchMasterData();
            fetchInspectionOfficers();
        }
    }, [user, authLoading]);

    const fetchInspectionOfficers = async () => {
        try {
            console.log('DGODashboard: Fetching officers...');
            const resp = await officerService.getOfficers();
            console.log('DGODashboard: Officers Response:', resp);
            if (resp.success) {
                setInspectionOfficers(resp.data);
            }
        } catch (error) {
            console.error('Error fetching inspection officers:', error);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [distResp, typeResp] = await Promise.all([
                nocApplicationService.getDistricts('Rajasthan'),
                nocApplicationService.getApplicationTypes()
            ]);

            if (distResp.success && typeResp.success) {
                const districts = distResp.data || [];
                setMasterData(prev => ({
                    ...prev,
                    districts: districts,
                    appTypes: typeResp.data || []
                }));

                // If we have an officer district, fetch its blocks
                const myDistrictName = district || user?.communicationAddress?.district || user?.district;
                if (myDistrictName && districts.length > 0) {
                    const myDist = districts.find(d => 
                        d.name === myDistrictName || d.id === myDistrictName || d.code === myDistrictName
                    );
                    if (myDist) {
                        const blockResp = await nocApplicationService.getBlocks(myDist.id || myDist.code);
                        if (blockResp.success) {
                            setMasterData(prev => ({
                                ...prev,
                                blocks: blockResp.data || []
                            }));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard master data:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setDashboardLoading(true);
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
                    setRawApplications(data.recentApplications);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Error state handled by showing 0s as per initial state
        } finally {
            setDashboardLoading(false);
        }
    };

    useEffect(() => {
        if (rawApplications.length > 0) {
            const formattedApps = rawApplications.map(app => {
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

                const submittedDateRaw = app.submittedAt || app.submittedDate || app.updatedAt;

                return {
                    applicationId: app.applicationId || app.id || app._id,
                    applicationNumber: app.applicationNumber || app.trackingId || 'N/A',
                    applicantName: getApplicantName(app),
                    projectName: app.projectName || 
                               app.projectDetails?.projectName || 
                               app.projectDetails?.name || 
                               app.id || 
                               'N/A',
                    projectType: resolveIdToName(app.projectDetails?.projectType || app.projectType || app.applicationSubType || app.applicationType, masterData.appTypes),
                    district: districtValue || app.districtName || 'N/A',
                    block: blockValue || app.blockName || 'N/A',
                    waterRequirement: getWaterValue(app),
                    submittedDate: submittedDateRaw,
                    status: app.status || 'PENDING',
                    daysInQueue: submittedDateRaw
                            ? Math.floor((new Date() - new Date(submittedDateRaw)) / (1000 * 60 * 60 * 24))
                            : 0
                };
            });
            setRecentApplications(formattedApps);
        }
    }, [rawApplications, masterData]);

    const handleApplicationClick = (application) => {
        navigate(`/officer/dgo/applications/${application.applicationId}`);
    };

    const handleOpenScheduleModal = (application) => {
        setSelectedAppForInspection(application);
        setShowInspectionModal(true);
    };

    const handleScheduleInspection = async (formData) => {
        try {
            const data = {
                inspectionDate: formData.get('inspectionDate'),
                officerId: formData.get('officerId')
            };
            const resp = await officerService.scheduleInspection(selectedAppForInspection.applicationId, data);
            if (resp.success) {
                alert('Inspection scheduled successfully!');
                setShowInspectionModal(false);
                fetchDashboardData(); // Refresh data
            } else {
                alert('Error: ' + resp.message);
            }
        } catch (error) {
            console.error('Error scheduling inspection:', error);
            alert('Failed to schedule inspection.');
        }
    };

    const handleViewAll = () => {
        navigate('/officer/dgo/applications');
    };

    if (authLoading || dashboardLoading) {
        return <div className="officer-portal-loading text-center p-10 mt-10">
            <div className="officer-spinner"></div>
            <p>Loading Dashboard...</p>
        </div>;
    }

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
                                recentApplications.map((application) => {
                                    const needsInspection = ['SUBMITTED', 'PENDING_DGO_REVIEW', 'UNDER_REVIEW_DGO'].includes(application.status);
                                    const actions = needsInspection ? [
                                        {
                                            label: t('officer.dashboard.inspections.schedule'),
                                            icon: '📅',
                                            onClick: () => handleOpenScheduleModal(application),
                                            className: 'officer-btn-success'
                                        }
                                    ] : [];

                                    return (
                                        <ApplicationCard
                                            key={application.applicationId}
                                            application={application}
                                            onClick={handleApplicationClick}
                                            showCallButton={true}
                                            officerType="DGO"
                                            showActions={actions.length > 0}
                                            actions={actions}
                                        />
                                    );
                                })
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

            <ScheduleInspectionModal
                isOpen={showInspectionModal}
                onClose={() => setShowInspectionModal(false)}
                onSchedule={handleScheduleInspection}
                inspectionOfficers={inspectionOfficers}
            />
        </div >
    );
};

export default DGODashboard;
