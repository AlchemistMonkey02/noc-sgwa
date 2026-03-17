import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import nocApplicationService from '../../noc/services/nocApplicationService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ScheduleInspectionModal from '../shared/components/ScheduleInspectionModal';
import '../shared/styles/officer-portal.css';

const ApplicationsList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [officerInfo, setOfficerInfo] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        district: '',
        search: ''
    });
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [selectedAppForInspection, setSelectedAppForInspection] = useState(null);
    const [inspectionOfficers, setInspectionOfficers] = useState([]);

    const [masterData, setMasterData] = useState({
        districts: [],
        blocks: [],
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
        const timer = setTimeout(() => {
            fetchApplications();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        const userData = getOfficerData();
        setOfficerInfo(userData);
        fetchMasterData();
        fetchInspectionOfficers();
    }, []);

    const fetchInspectionOfficers = async () => {
        try {
            const resp = await officerService.getOfficers();
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

                // Fetch blocks for officer's district
                const userData = getOfficerData();
                const myDistrictName = userData?.communicationAddress?.district || userData?.district;
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
            console.error('Error fetching master data in ApplicationsList:', error);
        }
    };

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
            console.error('Error fetching applications:', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const getOfficerData = () => {
        try {
            const data = localStorage.getItem('officerData');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    const clearFilters = () => {
        setFilters({ status: '', district: '', search: '' });
    };

    const getNestedValue = (obj, path) => {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const getStatusBadge = (status) => {
        if (!status) return <span className="officer-badge">UNKNOWN</span>;
        const normalized = status.toLowerCase().replace(/_/g, '-');
        return (
            <span className={`officer-badge status-${normalized}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    const getDaysInQueue = (dateString) => {
        if (!dateString) return 0;
        const diff = new Date() - new Date(dateString);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const handleViewApplication = (id) => {
        if (id) {
            navigate(`/officer/dgo/applications/${id}`);
        }
    };

    const handleOpenScheduleModal = (app) => {
        setSelectedAppForInspection({
            applicationId: app.applicationId || app._id,
            applicationNumber: app.applicationNumber
        });
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
                fetchApplications(); // Refresh list
            } else {
                alert('Error: ' + resp.message);
            }
        } catch (error) {
            console.error('Error scheduling inspection:', error);
            alert('Failed to schedule inspection.');
        }
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
                officerRole="DGO"
                officerDesignation={officerInfo?.designation || 'District Officer'}
                district={officerInfo?.district || filters.district || 'Jaipur'}
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
                                    <option value="INSPECTED">Inspected</option>
                                    <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">District</label>
                                <input
                                    type="text"
                                    className="officer-input"
                                    placeholder="Enter district name..."
                                    value={filters.district}
                                    onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                />
                                <small style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
                                    Your district: {officerInfo?.communicationAddress?.district || 'None'}
                                </small>
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
                                            <td>{resolveIdToName(app.sectorType || app.applicationSubType, masterData.appTypes)}</td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    {getNestedValue(app, 'location.village')}<br />
                                                    <span style={{ color: '#666' }}>
                                                        {resolveIdToName(getNestedValue(app, 'location.blockId'), masterData.blocks)}
                                                        {getNestedValue(app, 'location.districtId') && `, ${resolveIdToName(getNestedValue(app, 'location.districtId'), masterData.districts)}`}
                                                    </span>
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
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="officer-btn officer-btn-primary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                        onClick={() => handleViewApplication(app.applicationId || app._id)}
                                                    >
                                                        View
                                                    </button>
                                                    {['SUBMITTED', 'PENDING_DGO_REVIEW', 'UNDER_REVIEW_DGO'].includes(app.status) && (
                                                        <button
                                                            className="officer-btn officer-btn-success"
                                                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                            onClick={() => handleOpenScheduleModal(app)}
                                                        >
                                                            Schedule
                                                        </button>
                                                    )}
                                                </div>
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

            <ScheduleInspectionModal
                isOpen={showInspectionModal}
                onClose={() => setShowInspectionModal(false)}
                onSchedule={handleScheduleInspection}
                inspectionOfficers={inspectionOfficers}
            />
        </div>
    );
};

export default ApplicationsList;
