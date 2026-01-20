import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const InspectionList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'INSPECTION_SCHEDULED', // Default filter
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
            console.error('Error fetching inspections:', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = (applicationId, hasReport) => {
        if (hasReport) {
            // If report exists, view application details (Inspection tab)
            navigate(`/officer/dgo/applications/${applicationId}`);
        } else {
            // If pending, go to report form or application details
            // Going to application details is safer as it has the tab context
            // Link directly to report form?
            navigate(`/officer/dgo/applications/${applicationId}/inspection-report`);
        }
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
                            <h1 className="officer-page-title">🔍 Site Inspections</h1>
                            <p className="officer-page-subtitle">
                                Manage scheduled inspections and view reports
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
                                        placeholder="App No, Project..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>
                                <div className="officer-form-group">
                                    <label className="officer-label">District</label>
                                    <select
                                        className="officer-select"
                                        value={filters.district}
                                        onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                    >
                                        <option value="">All Districts</option>
                                        <option value="Jaipur">Jaipur</option>
                                        <option value="Jodhpur">Jodhpur</option>
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
                                            <th>Project Name</th>
                                            <th>Location</th>
                                            <th>Scheduled Date</th>
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
                                                    <td>{getNestedValue(app, 'projectDetails.projectName') || 'N/A'}</td>
                                                    <td>{getNestedValue(app, 'location.village') || 'N/A'}</td>
                                                    <td>
                                                        {app.workflow?.inspectionReport?.scheduledDate ?
                                                            new Date(app.workflow.inspectionReport.scheduledDate).toLocaleDateString() :
                                                            (app.status === 'INSPECTION_SCHEDULED' ? 'Date Pending' : 'Not Scheduled')}
                                                    </td>
                                                    <td>
                                                        <span className="officer-badge under-review">
                                                            {app.status ? app.status.replace(/_/g, ' ') : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="officer-btn officer-btn-primary"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleViewApplication(app._id || app.applicationId, app.workflow?.inspectionReport?.report)}
                                                        >
                                                            {app.workflow?.inspectionReport?.report ? 'View Report' : '📝 Submit Report'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                                    No scheduled inspections found.
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

export default InspectionList;
