import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import officerService from '../services/officerService';
import { getOfficerData } from '../shared/utils/officerAuth';
import { EXTERNAL_URLS } from '../../../config/constants';
import '../shared/styles/officer-portal.css';

const InspectionDashboard = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        todayCount: 0,
        pendingCount: 0,
        completedMonth: 0,
        overdueCount: 0
    });
    const [todaysSchedule, setTodaysSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [officerInfo, setOfficerInfo] = useState(null);



    useEffect(() => {
        const fetchDashboardData = async () => {
            const userData = getOfficerData();
            setOfficerInfo(userData);

            setLoading(true);
            try {
                // Fetch stats and today's schedule
                const [statsResponse, scheduleResponse] = await Promise.all([
                    officerService.getInspectionDashboard(),
                    officerService.getMyInspections({ date: new Date().toISOString().split('T')[0] })
                ]);

                if (statsResponse.success) {
                    setStatistics({
                        todayCount: statsResponse.data.stats.todayCount || 0,
                        pendingCount: statsResponse.data.stats.pendingCount || 0,
                        completedMonth: statsResponse.data.stats.completedMonth || 0,
                        overdueCount: statsResponse.data.stats.overdueCount || 0
                    });
                }

                if (scheduleResponse.success) {
                    // map API data to UI format
                    const mappedSchedule = scheduleResponse.data.inspections.map(item => ({
                        id: item.inspectionId,
                        applicationNumber: item.applicationNumber || 'N/A',
                        applicantName: item.holderName || item.applicantName || 'Unknown Applicant',
                        location: item.location || 'Unknown Location',
                        time: item.scheduledDate ? new Date(item.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                        status: item.status || 'SCHEDULED',
                        type: item.inspectionType || 'General'
                    }));
                    setTodaysSchedule(mappedSchedule);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleStartInspection = (inspectionId) => {
        navigate(`/officer/inspection/conduct/${inspectionId}`);
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'Field Inspector'}
                officerRole="INSPECTION"
                officerDesignation={officerInfo?.designation || 'Field Inspector'}
                district={officerInfo?.district || 'Jaipur'}
            />

            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📊 Inspection Dashboard</h1>
                            <p className="officer-page-subtitle">
                                Overview of assigned site inspections and daily schedule
                            </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="officer-stats-grid">
                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Scheduled Today</span>
                                    <div className="officer-stat-icon primary">📅</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.todayCount}</h2>
                                <div className="officer-stat-footer">
                                    <span>Inspections for today</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Pending Total</span>
                                    <div className="officer-stat-icon warning">⏳</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.pendingCount}</h2>
                                <div className="officer-stat-footer">
                                    <span>Assigned to you</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Completed (Month)</span>
                                    <div className="officer-stat-icon success">✅</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.completedMonth}</h2>
                                <div className="officer-stat-footer">
                                    <span>Reports submitted</span>
                                </div>
                            </div>

                            <div className="officer-stat-card">
                                <div className="officer-stat-header">
                                    <span className="officer-stat-label">Overdue</span>
                                    <div className="officer-stat-icon danger">⚠️</div>
                                </div>
                                <h2 className="officer-stat-value">{statistics.overdueCount}</h2>
                                <div className="officer-stat-footer">
                                    <span style={{ color: 'var(--officer-danger)' }}>Action required</span>
                                </div>
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="officer-mt-4">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--officer-text-primary)' }}>
                                Today's Schedule ({new Date().toISOString().split('T')[0]})
                            </h2>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {todaysSchedule.map((item) => (
                                    <div key={item.id} style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        border: '1px solid var(--officer-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                <span style={{
                                                    fontWeight: '700',
                                                    fontSize: '1.125rem',
                                                    color: 'var(--officer-primary)'
                                                }}>
                                                    {item.time}
                                                </span>
                                                <span style={{
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: 'var(--officer-primary)',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.applicantName}</h3>
                                            <p style={{ margin: 0, color: 'var(--officer-text-light)', fontSize: '0.875rem' }}>
                                                📍 {item.location} • {item.applicationNumber}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <button
                                                className="officer-btn officer-btn-primary"
                                                onClick={() => handleStartInspection(item.id)}
                                            >
                                                Start Inspection →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InspectionDashboard;
