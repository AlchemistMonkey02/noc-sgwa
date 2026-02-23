import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const SGWAApplicationsList = () => {
    const navigate = useNavigate();
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'APPROVED_DGO',
        district: '',
        search: '',
        dgoRecommendation: ''
    });

    useEffect(() => {
        fetchApplications();
    }, [filters]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            let response;
            if (filters.status === 'APPROVED_DGO') {
                response = await officerService.getSGWAPendingApplications(filters);
            } else {
                response = await officerService.getSGWAApplications(filters);
            }

            if (response.success && response.data) {
                const rawData = response.data.applications || response.data || [];
                const calculateDays = (dateString) => {
                    if (!dateString) return 0;
                    const submitted = new Date(dateString);
                    const now = new Date();
                    return Math.ceil(Math.abs(now - submitted) / (1000 * 60 * 60 * 24));
                };

                const mappedApps = rawData.map(app => ({
                    id: app.id || app._id || app.applicationId,
                    applicationNumber: app.applicationNumber || 'N/A',
                    applicantName: app.applicantDetails?.name || app.projectDetails?.applicantName || 'N/A',
                    projectName: app.projectDetails?.projectName || 'N/A',
                    district: app.locationDetails?.district || app.locationDetails?.state || 'N/A',
                    waterRequirement: (app.waterRequirement?.total || app.waterRequirement?.dailyRequirement || app.waterRequirement) || 'N/A',
                    status: app.status,
                    dgoRecommendation: app.dgoRecommendation?.status || app.dgoRecommendation || 'N/A',
                    daysInQueue: app.daysInQueue || calculateDays(app.submittedDate),
                    submittedDate: app.submittedDate
                }));

                setAllApplications(mappedApps);
                setFilteredApplications(mappedApps);
            } else {
                setAllApplications([]);
                setFilteredApplications([]);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            setAllApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'DGO_RECOMMENDED': { label: 'DGO Recommended', cls: 'info' },
            'APPROVED_DGO': { label: 'DGO Approved', cls: 'info' },
            'PENDING_SGWA_APPROVAL': { label: 'Pending Approval', cls: 'warning' },
            'SGWA_APPROVED': { label: 'SGWA Approved', cls: 'success' },
            'SGWA_REJECTED': { label: 'SGWA Rejected', cls: 'danger' },
            'SGWA_QUERY_RAISED': { label: 'Query Raised', cls: 'warning' }
        };
        const sd = statusMap[status] || { label: status, cls: 'secondary' };
        return <span className={`status-badge ${sd.cls}`}>{sd.label}</span>;
    };

    const clearFilters = () => setFilters({ status: '', district: '', search: '', dgoRecommendation: '' });

    if (loading) {
        return (
            <div className="officer-portal">
                <OfficerHeader officerName="SGWA Officer" officerRole="SGWA" officerDesignation="Technical Officer" district="State Level" />
                <div className="officer-layout">
                    <OfficerSidebar role="SGWA" />
                    <main className="officer-content">
                        <div className="officer-container">
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
                                <p>Loading applications...</p>
                            </div>
                        </div>
                    </main>
                </div>
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
                        <div className="page-gradient-header" />
                        <div style={{ padding: '1.75rem 1.5rem 0' }}>
                            <h1 className="officer-page-title">📋 All Applications</h1>
                            <p className="officer-page-subtitle">
                                Showing {filteredApplications.length} of {allApplications.length} applications
                            </p>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem 2rem' }}>
                            {/* Filters */}
                            <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="card-content-area">
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '1rem',
                                        alignItems: 'flex-end'
                                    }}>
                                        <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                            <label className="auth-label">Search</label>
                                            <input
                                                type="text"
                                                className="auth-input"
                                                placeholder="Application no., applicant..."
                                                value={filters.search}
                                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                            />
                                        </div>
                                        <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                            <label className="auth-label">Status</label>
                                            <select
                                                className="auth-input"
                                                value={filters.status}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            >
                                                <option value="">All Status</option>
                                                <option value="APPROVED_DGO">Pending SGWA Review</option>
                                                <option value="SGWA_APPROVED">SGWA Approved</option>
                                                <option value="SGWA_REJECTED">SGWA Rejected</option>
                                                <option value="SGWA_QUERY_RAISED">Query Raised</option>
                                            </select>
                                        </div>
                                        <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                            <label className="auth-label">District</label>
                                            <select
                                                className="auth-input"
                                                value={filters.district}
                                                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                            >
                                                <option value="">All Districts</option>
                                                {['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Bharatpur', 'Chittorgarh', 'Jaisalmer'].map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="auth-form-group" style={{ marginBottom: 0 }}>
                                            <label className="auth-label">DGO Recommendation</label>
                                            <select
                                                className="auth-input"
                                                value={filters.dgoRecommendation}
                                                onChange={(e) => setFilters({ ...filters, dgoRecommendation: e.target.value })}
                                            >
                                                <option value="">All</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="CONDITIONAL">Conditional</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button
                                                className="officer-btn officer-btn-secondary"
                                                onClick={clearFilters}
                                                style={{ width: '100%' }}
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Applications Table */}
                            <div className="dashboard-card">
                                <div className="card-content-area no-padding">
                                    {filteredApplications.length > 0 ? (
                                        <div className="professional-table-wrapper">
                                            <table className="professional-table">
                                                <thead>
                                                    <tr>
                                                        <th>Application No.</th>
                                                        <th>Applicant Name</th>
                                                        <th>Project</th>
                                                        <th>District</th>
                                                        <th>Water Req.</th>
                                                        <th>DGO Status</th>
                                                        <th>SGWA Status</th>
                                                        <th>Days</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredApplications.map((app) => (
                                                        <tr key={app.id}>
                                                            <td><strong className="text-blue">{app.applicationNumber}</strong></td>
                                                            <td>{app.applicantName}</td>
                                                            <td>{app.projectName}</td>
                                                            <td>{app.district}</td>
                                                            <td>{app.waterRequirement} m³/day</td>
                                                            <td>
                                                                <span className={`status-badge ${app.dgoRecommendation === 'APPROVED' ? 'success' : app.dgoRecommendation === 'CONDITIONAL' ? 'warning' : 'danger'}`}>
                                                                    {app.dgoRecommendation}
                                                                </span>
                                                            </td>
                                                            <td>{getStatusBadge(app.status)}</td>
                                                            <td>
                                                                <span style={{
                                                                    color: app.daysInQueue > 5 ? '#dc2626' : '#6b7280',
                                                                    fontWeight: app.daysInQueue > 5 ? 700 : 400,
                                                                    fontSize: '0.875rem'
                                                                }}>
                                                                    {app.daysInQueue}d
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="table-action-btn"
                                                                    onClick={() => navigate(`/officer/sgwa/applications/${app.id}`)}
                                                                >
                                                                    Review
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🔍</div>
                                            <div className="empty-state-title">No Applications Found</div>
                                            <p className="empty-state-text">No applications match your current filters.</p>
                                            <button className="officer-btn officer-btn-primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                                                Clear Filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SGWAApplicationsList;
