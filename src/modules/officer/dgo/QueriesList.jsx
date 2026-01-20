import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const QueriesList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'QUERY_RAISED_DGO', // Default filter to show active queries
        district: '',
        search: ''
    });

    useEffect(() => {
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
                const appData = Array.isArray(response.data) ? response.data :
                    (response.data.applications || []);
                setApplications(appData);
            }
        } catch (error) {
            console.error('Error fetching queries:', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = (applicationId) => {
        // Navigate to application viewer, defaults to general or can implement query tab default
        navigate(`/officer/dgo/applications/${applicationId}`);
    };

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
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
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">💬 Queries</h1>
                            <p className="officer-page-subtitle">
                                Manage active queries and applicant responses
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="officer-filters" style={{ marginBottom: '2rem' }}>
                            <div className="officer-grid-row">
                                <div className="officer-form-group">
                                    <label className="officer-label">Search</label>
                                    <input
                                        type="text"
                                        className="officer-input"
                                        placeholder="App No, Applicant..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>
                                <div className="officer-form-group">
                                    <label className="officer-label">Filter</label>
                                    <select
                                        className="officer-select"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="QUERY_RAISED_DGO">Active Queries</option>
                                        <option value="">All Applications</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-container"><div className="loading-spinner"></div></div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="officer-table">
                                    <thead>
                                        <tr>
                                            <th>Application No.</th>
                                            <th>Applicant Name</th>
                                            <th>Query Subject</th>
                                            <th>Raised Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.length > 0 ? (
                                            applications.map((app) => (
                                                <tr key={app._id || app.applicationId}>
                                                    <td style={{ fontWeight: '600', color: 'var(--officer-primary)' }}>
                                                        {app.applicationNumber}
                                                    </td>
                                                    <td>{getNestedValue(app, 'projectDetails.applicantName') || 'N/A'}</td>
                                                    <td>{app.workflow?.query?.subject || 'N/A'}</td>
                                                    <td>
                                                        {app.workflow?.query?.raisedAt ?
                                                            new Date(app.workflow.query.raisedAt).toLocaleDateString() :
                                                            'N/A'}
                                                    </td>
                                                    <td>
                                                        <span className="officer-badge query-raised">
                                                            Query Raised
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="officer-btn officer-btn-primary"
                                                            onClick={() => handleViewApplication(app._id || app.applicationId)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                                    No active queries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QueriesList;
