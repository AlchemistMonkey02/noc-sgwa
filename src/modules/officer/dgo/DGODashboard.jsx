import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ApplicationCard from '../shared/components/ApplicationCard';
import officerService from '../services/officerService';
import '../shared/styles/officer-portal.css';

const DGODashboard = () => {
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

    useEffect(() => {
        // Fetch dashboard statistics
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await officerService.getDGODashboard();

            if (response.success) {
                const data = response.data;

                // Update statistics
                setStatistics({
                    total: data.stats?.assignedApplications || 0,
                    pendingVerification: data.stats?.pendingInspection || 0,
                    underReview: data.stats?.underReview || 0,
                    queriesRaised: data.stats?.queriesRaised || 0,
                    inspectionPending: data.stats?.pendingInspection || 0
                });

                // Set district
                if (data.myDistrict) {
                    setDistrict(data.myDistrict);
                }

                // Update recent applications
                if (data.recentApplications && data.recentApplications.length > 0) {
                    const formattedApps = data.recentApplications.map(app => ({
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
                    }));
                    setRecentApplications(formattedApps);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            // Use mock data as fallback for demonstration
            console.log('Using mock data - backend API not available');

            setStatistics({
                total: 45,
                pendingVerification: 15,
                underReview: 20,
                queriesRaised: 5,
                inspectionPending: 5
            });

            setDistrict('Jaipur');

            setRecentApplications([
                {
                    applicationId: 'app-mock-001',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001234',
                    applicantName: 'Rajesh Kumar Sharma',
                    projectName: 'ABC Textile Manufacturing Unit',
                    projectType: 'Industrial',
                    district: 'Jaipur',
                    block: 'Sanganer',
                    waterRequirement: '150.25 m³/day',
                    submittedDate: '2026-01-09T08:00:00Z',
                    status: 'PENDING_VERIFICATION',
                    daysInQueue: 2
                },
                {
                    applicationId: 'app-mock-002',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001235',
                    applicantName: 'Sunita Devi',
                    projectName: 'XYZ Food Processing Plant',
                    projectType: 'Industrial',
                    district: 'Jaipur',
                    block: 'Sanganer',
                    waterRequirement: '85.50 m³/day',
                    submittedDate: '2026-01-08T10:30:00Z',
                    status: 'UNDER_REVIEW',
                    daysInQueue: 3
                },
                {
                    applicationId: 'app-mock-003',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001236',
                    applicantName: 'Green Valley Hotels Pvt Ltd',
                    projectName: 'Luxury Resort Development',
                    projectType: 'Commercial',
                    district: 'Jaipur',
                    block: 'Amber',
                    waterRequirement: '200.00 m³/day',
                    submittedDate: '2026-01-07T09:15:00Z',
                    status: 'PENDING_VERIFICATION',
                    daysInQueue: 4
                }
            ]);
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
                officerName="Ramesh Kumar"
                officerRole="DGO"
                officerDesignation="District Groundwater Officer"
                district="Jaipur"
            />

            <div className="officer-layout">
                <OfficerSidebar role="DGO" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📊 Dashboard</h1>
                            <p className="officer-page-subtitle">
                                Overview of NOC applications and pending tasks
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="officer-stats-grid">
                            {/* Total Applications */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Total Applications</span>
                                    <div className="officer-stat-icon primary">
                                        📋
                                    </div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.total}</h2>
                                <div className="officer-stat-footer">
                                    <span>All time</span>
                                </div>
                            </div>

                            {/* Pending Verification */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Pending Verification</span>
                                    <div className="officer-stat-icon warning">
                                        ⏳
                                    </div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.pendingVerification}</h2>
                                <div className="officer-stat-footer">
                                    <span style={{ color: 'var(--officer-warning)' }}>⚠️ Requires attention</span>
                                </div>
                            </div>

                            {/* Under Review */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Under Review</span>
                                    <div className="officer-stat-icon primary">
                                        🔍
                                    </div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.underReview}</h2>
                                <div className="officer-stat-footer">
                                    <span>In progress</span>
                                </div>
                            </div>

                            {/* Queries Raised */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Queries Raised</span>
                                    <div className="officer-stat-icon danger">
                                        ❓
                                    </div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.queriesRaised}</h2>
                                <div className="officer-stat-footer">
                                    <span>Awaiting response</span>
                                </div>
                            </div>

                            {/* Inspection Pending */}
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Inspection Pending</span>
                                    <div className="officer-stat-icon warning">
                                        🔍
                                    </div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.inspectionPending}</h2>
                                <div className="officer-stat-footer">
                                    <span>Site visits required</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Applications */}
                        <div className="officer-mt-4">
                            <div className="officer-flex-between officer-mb-3">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--officer-primary)', margin: 0 }}>
                                    Recent Applications
                                </h2>
                                <button
                                    className="officer-btn officer-btn-primary"
                                    onClick={handleViewAll}
                                >
                                    View All →
                                </button>
                            </div>

                            {recentApplications.length > 0 ? (
                                recentApplications.map((application) => (
                                    <ApplicationCard
                                        key={application.applicationId}
                                        application={application}
                                        onClick={handleApplicationClick}
                                    />
                                ))
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: 'var(--officer-text-light)'
                                }}>
                                    <p style={{ fontSize: '1.125rem' }}>No recent applications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DGODashboard;
