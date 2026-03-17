import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ScheduleInspectionModal from '../shared/components/ScheduleInspectionModal';
import { useAuth } from '../../../context/AuthContext';
import '../shared/styles/officer-portal.css';

const InspectionList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '', // All for Inspection Management view
        district: '',
        search: ''
    });
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, SCHEDULED, COMPLETED
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [selectedAppForInspection, setSelectedAppForInspection] = useState(null);
    const [inspectionOfficers, setInspectionOfficers] = useState([]);

    useEffect(() => {
        fetchApplications();
    }, [filters, activeTab]);

    useEffect(() => {
        fetchInspectionOfficers();
    }, []);

    const fetchInspectionOfficers = async () => {
        try {
            // Fetch all eligible officers for assignment
            console.log('FETCHING INSPECTION OFFICERS...');
            const resp = await officerService.getOfficers('INSPECTION'); 
            console.log('OFFICERS API RESPONSE:', resp);
            if (resp.success) {
                console.log('SETTING OFFICERS:', resp.data);
                setInspectionOfficers(resp.data);
            }
        } catch (error) {
            console.error('Error fetching inspection officers:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            
            // Map tab to status filters
            let statusFilter = filters.status;
            if (!statusFilter) {
                if (activeTab === 'PENDING') statusFilter = 'SUBMITTED,PENDING_DGO_REVIEW,UNDER_REVIEW_DGO';
                if (activeTab === 'SCHEDULED') statusFilter = 'INSPECTION_SCHEDULED';
                if (activeTab === 'COMPLETED') statusFilter = 'INSPECTION_COMPLETED';
            }

            const queryFilters = { ...filters, status: statusFilter };
            const response = await officerService.getApplications(queryFilters);
            
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
                fetchApplications();
            } else {
                alert('Error: ' + resp.message);
            }
        } catch (error) {
            console.error('Error scheduling inspection:', error);
            alert('Failed to schedule inspection.');
        }
    };

    const handleViewApplication = (applicationId) => {
        navigate(`/officer/dgo/applications/${applicationId}`);
    };

    const getNestedValue = (obj, path) => {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={user?.name || user?.username || 'Officer'}
                officerRole="DGO"
                officerDesignation={user?.designation || 'District Officer'}
                district={user?.district || 'Jaipur'}
            />
            <div className="officer-layout">
                <OfficerSidebar role="DGO" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">🔍 Site Inspection Management</h1>
                            <p className="officer-page-subtitle">
                                Schedule site visits, track assigned inspectors, and review inspection reports
                            </p>
                        </div>

                        {/* Custom Tabs */}
                        <div className="officer-mb-4" style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                            <button 
                                onClick={() => setActiveTab('PENDING')}
                                style={{ 
                                    padding: '1rem 0.5rem', 
                                    background: 'none', 
                                    border: 'none', 
                                    borderBottom: activeTab === 'PENDING' ? '3px solid var(--officer-primary)' : '3px solid transparent',
                                    color: activeTab === 'PENDING' ? 'var(--officer-primary)' : '#64748b',
                                    fontWeight: activeTab === 'PENDING' ? '600' : '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Pending Schedule
                            </button>
                            <button 
                                onClick={() => setActiveTab('SCHEDULED')}
                                style={{ 
                                    padding: '1rem 0.5rem', 
                                    background: 'none', 
                                    border: 'none', 
                                    borderBottom: activeTab === 'SCHEDULED' ? '3px solid var(--officer-primary)' : '3px solid transparent',
                                    color: activeTab === 'SCHEDULED' ? 'var(--officer-primary)' : '#64748b',
                                    fontWeight: activeTab === 'SCHEDULED' ? '600' : '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Scheduled Visits
                            </button>
                            <button 
                                onClick={() => setActiveTab('COMPLETED')}
                                style={{ 
                                    padding: '1rem 0.5rem', 
                                    background: 'none', 
                                    border: 'none', 
                                    borderBottom: activeTab === 'COMPLETED' ? '3px solid var(--officer-primary)' : '3px solid transparent',
                                    color: activeTab === 'COMPLETED' ? 'var(--officer-primary)' : '#64748b',
                                    fontWeight: activeTab === 'COMPLETED' ? '600' : '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Completed Reports
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="officer-filters" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">Search</label>
                                <input
                                    type="text"
                                    className="officer-input"
                                    placeholder="Application No, Project Name..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: 0 }}>
                                <label className="officer-label">District Filter</label>
                                <input
                                    type="text"
                                    className="officer-input"
                                    placeholder="Search by district..."
                                    value={filters.district}
                                    onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-container" style={{ padding: '5rem' }}><div className="loading-spinner"></div></div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="officer-table">
                                    <thead>
                                        <tr>
                                            <th>Application</th>
                                            <th>Project & Location</th>
                                            <th>{activeTab === 'PENDING' ? 'Submission Date' : 'Inspection Date'}</th>
                                            <th>{activeTab === 'PENDING' ? 'Status' : 'Inspector'}</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.length > 0 ? (
                                            applications.map((app) => (
                                                <tr key={app._id || app.applicationId}>
                                                    <td>
                                                        <div style={{ fontWeight: '600', color: 'var(--officer-primary)' }}>{app.applicationNumber}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{getNestedValue(app, 'projectDetails.applicantName') || app.applicantName}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '500' }}>{getNestedValue(app, 'projectDetails.projectName') || 'N/A'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                            {getNestedValue(app, 'location.village') || 'N/A'}, {getNestedValue(app, 'location.blockId') || 'N/A'}
                                                        </div>
                                                    </td>
                                                    {activeTab === 'PENDING' ? (
                                                        <>
                                                            <td>
                                                                <span>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</span>
                                                            </td>
                                                            <td>
                                                                <span className="officer-badge status-pending">{app.status?.replace(/_/g, ' ')}</span>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                <span>{app.approvalFlow?.dgo?.inspectionScheduledAt ? new Date(app.approvalFlow.dgo.inspectionScheduledAt).toLocaleDateString() : 'TBD'}</span>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <div style={{ fontWeight: '500' }}>
                                                                        {app.approvalFlow?.dgo?.inspectionAssignedTo ? 
                                                                            (app.approvalFlow.dgo.inspectionAssignedTo.firstName && app.approvalFlow.dgo.inspectionAssignedTo.lastName ?
                                                                                `${app.approvalFlow.dgo.inspectionAssignedTo.firstName} ${app.approvalFlow.dgo.inspectionAssignedTo.lastName}` :
                                                                                app.approvalFlow.dgo.inspectionAssignedTo.name || 
                                                                                app.approvalFlow.dgo.inspectionAssignedTo.username || 
                                                                                'Officer Assigned') : 
                                                                            'Not Assigned'}
                                                                    </div>
                                                                    {app.approvalFlow?.dgo?.inspectionAssignedTo?.phone && (
                                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📞 {app.approvalFlow.dgo.inspectionAssignedTo.phone}</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="officer-btn officer-btn-primary"
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                                onClick={() => handleViewApplication(app._id || app.applicationId || app.applicationNumber)}
                                                            >
                                                                View
                                                            </button>
                                                            {activeTab === 'PENDING' && (
                                                                <button
                                                                    className="officer-btn officer-btn-success"
                                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                                    onClick={() => handleOpenScheduleModal(app)}
                                                                >
                                                                    Schedule
                                                                </button>
                                                            )}
                                                            {activeTab === 'COMPLETED' && (
                                                                <button
                                                                    className="officer-btn officer-btn-info"
                                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                                    onClick={() => navigate(`/officer/dgo/applications/${app._id || app.applicationId || app.applicationNumber}/inspection-report`)}
                                                                >
                                                                    Report
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                                                    No applications found for this section.
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

            <ScheduleInspectionModal
                isOpen={showInspectionModal}
                onClose={() => setShowInspectionModal(false)}
                onSchedule={handleScheduleInspection}
                inspectionOfficers={inspectionOfficers}
            />
        </div>
    );
};

export default InspectionList;
