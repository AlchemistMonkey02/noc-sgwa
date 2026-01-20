import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const ApplicationsList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        district: '',
        search: ''
    });

    useEffect(() => {
        // Debounce search to avoid too many API calls
        const timer = setTimeout(() => {
            fetchApplications();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await officerService.getApplications(filters);
            if (response.success) {
                // Ensure we handle both array directly or nested in applications property
                const appData = Array.isArray(response.data) ? response.data :
                    (response.data.applications || []);
                setApplications(appData);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            // Fallback for demo/dev if API fails
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'SUBMITTED': { label: 'Submitted', class: 'pending' },
            'PENDING_DGO_REVIEW': { label: 'Pending Review', class: 'pending' },
            'UNDER_REVIEW_DGO': { label: 'Under Review', class: 'under-review' },
            'QUERY_RAISED_DGO': { label: 'Query Raised', class: 'query-raised' },
            'INSPECTION_SCHEDULED': { label: 'Inspection Scheduled', class: 'under-review' },
            'APPROVED': { label: 'Approved', class: 'approved' },
            'REJECTED': { label: 'Rejected', class: 'rejected' }
        };
        const statusData = statusMap[status] || { label: status?.replace(/_/g, ' '), class: 'pending' };
        return (
            <span className={`officer-badge ${statusData.class}`}>
                {statusData.label}
            </span>
        );
    };

    // Helper to calculate days since submission
    const getDaysInQueue = (dateString) => {
        if (!dateString) return 0;
        const submitted = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - submitted);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleViewApplication = (applicationId) => {
        navigate(`/officer/dgo/applications/${applicationId}`);
    };

    const clearFilters = () => {
        setFilters({ status: '', district: '', search: '' });
    };

    // Helper to get nested value safely
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
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
                            <h1 className="officer-page-title">📋 All Applications</h1>
                            <p className="officer-page-subtitle">
                                Showing {applications.length} applications
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
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="PENDING_DGO_REVIEW">Pending Review</option>
                                    <option value="UNDER_REVIEW_DGO">Under Review</option>
                                    <option value="QUERY_RAISED_DGO">Query Raised</option>
                                    <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
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
                                        <th>Type</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Days</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app._id || app.applicationId}>
                                            <td style={{ fontWeight: '600', color: 'var(--officer-primary)' }}>
                                                {app.applicationNumber}
                                            </td>
                                            <td>{getNestedValue(app, 'projectDetails.applicantName') || app.applicantName || 'N/A'}</td>
                                            <td>{getNestedValue(app, 'projectDetails.projectName') || app.projectName || 'N/A'}</td>
                                            <td>{app.sectorType || app.applicationSubType || 'N/A'}</td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    {getNestedValue(app, 'location.village')}<br />
                                                    <span style={{ color: '#666' }}>{getNestedValue(app, 'location.blockId')}</span>
                                                </div>
                                            </td>
                                            <td>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</td>
                                            <td>{getStatusBadge(app.status)}</td>
                                            <td>
                                                <span style={{
                                                    color: getDaysInQueue(app.submittedAt) > 3 ? 'var(--officer-danger)' : 'var(--officer-text-light)',
                                                    fontWeight: getDaysInQueue(app.submittedAt) > 3 ? '600' : '400'
                                                }}>
                                                    {getDaysInQueue(app.submittedAt)} days
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="officer-btn officer-btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    onClick={() => handleViewApplication(app.applicationId || app._id)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {applications.length === 0 && (
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

export default ApplicationsList;
