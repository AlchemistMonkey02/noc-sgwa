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
    const [officerInfo, setOfficerInfo] = useState(null);
    const [filters, setFilters] = useState({
        status: 'APPROVED_DGO', // Default to pending view as requested
        district: '',
        search: '',
        dgoRecommendation: ''
    });

    const getOfficerData = () => {
        try {
            const data = localStorage.getItem('officerData');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const userData = getOfficerData();
        setOfficerInfo(userData);
        fetchApplications();
    }, []);

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
                    const diffTime = Math.abs(now - submitted);
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            'DGO_RECOMMENDED': { label: 'DGO Recommended', class: 'primary' },
            'APPROVED_DGO': { label: 'DGO Approved', class: 'primary' },
            'PENDING_SGWA_APPROVAL': { label: 'Pending Approval', class: 'warning' },
            'SGWA_APPROVED': { label: 'SGWA Approved', class: 'success' },
            'SGWA_REJECTED': { label: 'SGWA Rejected', class: 'danger' },
            'SGWA_QUERY_RAISED': { label: 'Query Raised', class: 'query-raised' }
        };
        const statusData = statusMap[status] || { label: status, class: '' };
        return <span className={`officer-badge ${statusData.class}`}>{statusData.label}</span>;
    };

    const handleViewApplication = (applicationId) => {
        navigate(`/officer/sgwa/applications/${applicationId}`);
    };

    const clearFilters = () => {
        setFilters({ status: '', district: '', search: '', dgoRecommendation: '' });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading applications...</p>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'Officer'}
                officerRole="SGWA"
                officerDesignation={officerInfo?.designation || 'Technical Officer'}
                district="State Level"
            />

            <div className="officer-layout">
                <OfficerSidebar role="SGWA" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📋 All Applications</h1>
                            <p className="officer-page-subtitle">
                                Showing {filteredApplications.length} of {allApplications.length} applications
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="officer-filters" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">Search</label>
                                <input
                                    type="text"
                                    className="officer-input"
                                    placeholder="Application number, name, project..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">Status</label>
                                <select
                                    className="officer-select"
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
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">District</label>
                                <select
                                    className="officer-select"
                                    value={filters.district}
                                    onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                >
                                    <option value="">All Districts</option>
                                    <option value="Jaipur">Jaipur</option>
                                    <option value="Jodhpur">Jodhpur</option>
                                    <option value="Udaipur">Udaipur</option>
                                    <option value="Kota">Kota</option>
                                    <option value="Ajmer">Ajmer</option>
                                    <option value="Bikaner">Bikaner</option>
                                    <option value="Alwar">Alwar</option>
                                    <option value="Bhilwara">Bhilwara</option>
                                    <option value="Bharatpur">Bharatpur</option>
                                    <option value="Chittorgarh">Chittorgarh</option>
                                    <option value="Jaisalmer">Jaisalmer</option>
                                </select>
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">DGO Recommendation</label>
                                <select
                                    className="officer-select"
                                    value={filters.dgoRecommendation}
                                    onChange={(e) => setFilters({ ...filters, dgoRecommendation: e.target.value })}
                                >
                                    <option value="">All Recommendations</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="CONDITIONAL">Conditional</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    className="officer-btn officer-btn-secondary"
                                    onClick={clearFilters}
                                    style={{ width: '100%' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Applications Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table className="officer-table">
                                <thead>
                                    <tr>
                                        <th>Application No.</th>
                                        <th>Applicant Name</th>
                                        <th>Project Name</th>
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
                                            <td style={{ fontWeight: '600', color: 'var(--officer-primary)' }}>
                                                {app.applicationNumber}
                                            </td>
                                            <td>{app.applicantName}</td>
                                            <td>{app.projectName}</td>
                                            <td>{app.district}</td>
                                            <td>{app.waterRequirement} m³/day</td>
                                            <td>
                                                <span className={`officer-badge ${app.dgoRecommendation === 'APPROVED' ? 'success' : app.dgoRecommendation === 'CONDITIONAL' ? 'warning' : 'danger'}`}>
                                                    {app.dgoRecommendation}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(app.status)}</td>
                                            <td>
                                                <span style={{
                                                    color: app.daysInQueue > 5 ? 'var(--officer-danger)' : 'var(--officer-text-light)',
                                                    fontWeight: app.daysInQueue > 5 ? '600' : '400'
                                                }}>
                                                    {app.daysInQueue} days
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="officer-btn officer-btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    onClick={() => handleViewApplication(app.id)}
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredApplications.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'var(--officer-text-light)'
                            }}>
                                <p style={{ fontSize: '1.125rem' }}>No applications found matching your filters</p>
                                <button
                                    className="officer-btn officer-btn-primary"
                                    onClick={clearFilters}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SGWAApplicationsList;
