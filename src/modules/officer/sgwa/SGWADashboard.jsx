import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const SGWADashboard = () => {
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

    useEffect(() => {
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
                    setRecentApplications(data.recentApplications);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            // Use mock data as fallback
            console.log('Using mock data - backend API not available');

            setStatistics({
                total: 95,
                pendingApproval: 25,
                approved: 45,
                rejected: 10,
                dgoRecommended: 15,
                queriesRaised: 8
            });

            setRecentApplications([
                {
                    applicationId: 'app-sgwa-001',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001250',
                    applicantName: 'Mahindra Textiles Ltd',
                    projectName: 'Industrial Dyeing Unit',
                    district: 'Jaipur',
                    block: 'Sanganer',
                    waterRequirement: '250.00 m³/day',
                    submittedDate: '2026-01-10T08:00:00Z',
                    status: 'DGO_RECOMMENDED',
                    dgoRecommendation: 'APPROVED',
                    daysInQueue: 1
                },
                {
                    applicationId: 'app-sgwa-002',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001251',
                    applicantName: 'Rajasthan Hotels Pvt Ltd',
                    projectName: '5-Star Resort Complex',
                    district: 'Udaipur',
                    block: 'City',
                    waterRequirement: '350.00 m³/day',
                    submittedDate: '2026-01-09T11:30:00Z',
                    status: 'DGO_RECOMMENDED',
                    dgoRecommendation: 'APPROVED',
                    daysInQueue: 2
                },
                {
                    applicationId: 'app-sgwa-003',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001252',
                    applicantName: 'Aditya Power Generation',
                    projectName: 'Thermal Power Plant',
                    district: 'Jodhpur',
                    block: 'Pali Road',
                    waterRequirement: '500.00 m³/day',
                    submittedDate: '2026-01-08T09:15:00Z',
                    status: 'PENDING_SGWA_APPROVAL',
                    dgoRecommendation: 'APPROVED',
                    daysInQueue: 3
                }
            ]);
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
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Dr. Priya Sharma"
                officerRole="SGWA"
                officerDesignation="Technical Officer"
                district="State Level"
            />

            <div className="officer-layout">
                <OfficerSidebar role="SGWA" />

                <main className="officer-content">
                    <div className="officer-container">
                        {/* Page Header */}
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">🏛️ SGWA Dashboard</h1>
                            <p className="officer-page-subtitle">
                                State Groundwater Authority - Rajasthan
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="officer-stats-grid">
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Total Applications</span>
                                    <div className="officer-stat-icon primary">📋</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.total}</h2>
                                <p className="officer-stat-footer">All time</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Pending Approval</span>
                                    <div className="officer-stat-icon warning">⏳</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.pendingApproval}</h2>
                                <p className="officer-stat-footer">Requires attention</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">DGO Recommended</span>
                                    <div className="officer-stat-icon primary">✓</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.dgoRecommended}</h2>
                                <p className="officer-stat-footer">Ready for review</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Approved & NOC Issued</span>
                                    <div className="officer-stat-icon success">🎯</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.approved}</h2>
                                <p className="officer-stat-footer">Completed</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Queries Raised</span>
                                    <div className="officer-stat-icon warning">❓</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.queriesRaised}</h2>
                                <p className="officer-stat-footer">Awaiting response</p>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Rejected</span>
                                    <div className="officer-stat-icon danger">✗</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.rejected}</h2>
                                <p className="officer-stat-footer">Not approved</p>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recentApplications.map((app) => (
                                        <div
                                            key={app.applicationId}
                                            className="officer-app-card"
                                            onClick={() => handleApplicationClick(app)}
                                        >
                                            <div className="officer-app-header">
                                                <div>
                                                    <h3 className="officer-app-title">{app.projectName}</h3>
                                                    <p className="officer-app-number">{app.applicationNumber}</p>
                                                </div>
                                                <span className={`officer-badge ${app.status.toLowerCase().replace(/_/g, '-')}`}>
                                                    {app.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="officer-app-body">
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">Applicant</span>
                                                    <span className="officer-app-field-value">{app.applicantName}</span>
                                                </div>
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">District</span>
                                                    <span className="officer-app-field-value">{app.district}</span>
                                                </div>
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">Water Requirement</span>
                                                    <span className="officer-app-field-value">{app.waterRequirement}</span>
                                                </div>
                                                <div className="officer-app-field">
                                                    <span className="officer-app-field-label">Days in Queue</span>
                                                    <span className="officer-app-field-value" style={{
                                                        color: app.daysInQueue > 5 ? 'var(--officer-danger)' : 'inherit',
                                                        fontWeight: app.daysInQueue > 5 ? '600' : '400'
                                                    }}>
                                                        {app.daysInQueue} days
                                                    </span>
                                                </div>
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
                                        No recent applications
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
