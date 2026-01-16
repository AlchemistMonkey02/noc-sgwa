import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const ApplicationsList = () => {
    const navigate = useNavigate();
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        district: '',
        search: ''
    });

    // Expanded mock data - 15 applications across different districts and statuses
    const mockApplications = [
        { id: 'app-001', applicationNumber: 'RJ/CGWA/NOC/2026/001234', applicantName: 'Rajesh Kumar Sharma', projectName: 'ABC Textile Manufacturing Unit', projectType: 'Industrial', district: 'Jaipur', block: 'Sanganer', waterRequirement: 150.25, submittedDate: '2026-01-09T08:00:00Z', status: 'PENDING_VERIFICATION', daysInQueue: 2 },
        { id: 'app-002', applicationNumber: 'RJ/CGWA/NOC/2026/001235', applicantName: 'Sunita Devi', projectName: 'XYZ Food Processing Plant', projectType: 'Industrial', district: 'Jaipur', block: 'Sanganer', waterRequirement: 85.50, submittedDate: '2026-01-08T10:30:00Z', status: 'UNDER_REVIEW', daysInQueue: 3 },
        { id: 'app-003', applicationNumber: 'RJ/CGWA/NOC/2026/001236', applicantName: 'Green Valley Hotels Pvt Ltd', projectName: 'Luxury Resort Development', projectType: 'Commercial', district: 'Jaipur', block: 'Amber', waterRequirement: 200.00, submittedDate: '2026-01-07T09:15:00Z', status: 'PENDING_VERIFICATION', daysInQueue: 4 },
        { id: 'app-004', applicationNumber: 'RJ/CGWA/NOC/2026/001237', applicantName: 'Sharma Industries', projectName: 'Chemical Processing Unit', projectType: 'Industrial', district: 'Jodhpur', block: 'Jodhpur City', waterRequirement: 175.00, submittedDate: '2026-01-06T11:00:00Z', status: 'QUERY_RAISED', daysInQueue: 5 },
        { id: 'app-005', applicationNumber: 'RJ/CGWA/NOC/2026/001238', applicantName: 'Royal Farms Limited', projectName: 'Agricultural Processing', projectType: 'Agriculture', district: 'Udaipur', block: 'Bassi', waterRequirement: 120.00, submittedDate: '2026-01-05T14:30:00Z', status: 'UNDER_REVIEW', daysInQueue: 6 },
        { id: 'app-006', applicationNumber: 'RJ/CGWA/NOC/2026/001239', applicantName: 'Anita Constructions', projectName: 'Residential Complex Phase 2', projectType: 'Construction', district: 'Jaipur', block: 'Jagatpura', waterRequirement: 95.00, submittedDate: '2026-01-04T09:00:00Z', status: 'APPROVED', daysInQueue: 7 },
        { id: 'app-007', applicationNumber: 'RJ/CGWA/NOC/2026/001240', applicantName: 'Meena Beverages Co.', projectName: 'Soft Drink Bottling Plant', projectType: 'Industrial', district: 'Jodhpur', block: 'Pali Road', waterRequirement: 220.00, submittedDate: '2026-01-03T10:45:00Z', status: 'UNDER_REVIEW', daysInQueue: 8 },
        { id: 'app-008', applicationNumber: 'RJ/CGWA/NOC/2026/001241', applicantName: 'Pradeep Kumar', projectName: 'Dairy Farm Expansion', projectType: 'Agriculture', district: 'Udaipur', block: 'Mavli', waterRequirement: 60.00, submittedDate: '2026-01-02T13:20:00Z', status: 'PENDING_VERIFICATION', daysInQueue: 9 },
        { id: 'app-009', applicationNumber: 'RJ/CGWA/NOC/2026/001242', applicantName: 'Tech Park Developers', projectName: 'IT Park Development', projectType: 'Commercial', district: 'Jaipur', block: 'Sitapura', waterRequirement: 180.00, submittedDate: '2025-12-30T08:30:00Z', status: 'QUERY_RAISED', daysInQueue: 12 },
        { id: 'app-010', applicationNumber: 'RJ/CGWA/NOC/2026/001243', applicantName: 'Sunrise Textiles', projectName: 'Fabric Dyeing Unit', projectType: 'Industrial', district: 'Jodhpur', block: 'Basni', waterRequirement: 140.00, submittedDate: '2025-12-29T11:15:00Z', status: 'REJECTED', daysInQueue: 13 },
        { id: 'app-011', applicationNumber: 'RJ/CGWA/NOC/2026/001244', applicantName: 'Heritage Hotels Group', projectName: 'Boutique Hotel Renovation', projectType: 'Commercial', district: 'Udaipur', block: 'City', waterRequirement: 110.00, submittedDate: '2025-12-28T15:00:00Z', status: 'APPROVED', daysInQueue: 14 },
        { id: 'app-012', applicationNumber: 'RJ/CGWA/NOC/2026/001245', applicantName: 'Agarwal Pharma Ltd', projectName: 'Pharmaceutical Manufacturing', projectType: 'Industrial', district: 'Jaipur', block: 'Kukas', waterRequirement: 165.00, submittedDate: '2025-12-27T09:45:00Z', status: 'UNDER_REVIEW', daysInQueue: 15 },
        { id: 'app-013', applicationNumber: 'RJ/CGWA/NOC/2026/001246', applicantName: 'Green Energy Solutions', projectName: 'Solar Panel Manufacturing', projectType: 'Industrial', district: 'Jodhpur', block: 'Mandore', waterRequirement: 75.00, submittedDate: '2025-12-26T12:30:00Z', status: 'PENDING_VERIFICATION', daysInQueue: 16 },
        { id: 'app-014', applicationNumber: 'RJ/CGWA/NOC/2026/001247', applicantName: 'Lakeview Resorts', projectName: 'Eco Tourism Resort', projectType: 'Commercial', district: 'Udaipur', block: 'Gogunda', waterRequirement: 130.00, submittedDate: '2025-12-25T10:00:00Z', status: 'QUERY_RAISED', daysInQueue: 17 },
        { id: 'app-015', applicationNumber: 'RJ/CGWA/NOC/2026/001248', applicantName: 'Rajasthan Distilleries', projectName: 'Alcohol Manufacturing Plant', projectType: 'Industrial', district: 'Jaipur', block: 'Chomu', waterRequirement: 190.00, submittedDate: '2025-12-24T14:20:00Z', status: 'REJECTED', daysInQueue: 18 }
    ];

    useEffect(() => {
        fetchApplications();
    }, []);

    // Apply filters whenever filters change or data loads
    useEffect(() => {
        applyFilters();
    }, [filters, allApplications]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await officerService.getApplications({});
            if (response.success) {
                setAllApplications(response.data.applications);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            // Use mock data
            setAllApplications(mockApplications);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allApplications];

        // Search filter - searches in application number, applicant name, and project name
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(app =>
                app.applicationNumber.toLowerCase().includes(searchLower) ||
                app.applicantName.toLowerCase().includes(searchLower) ||
                app.projectName.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(app => app.status === filters.status);
        }

        // District filter
        if (filters.district) {
            filtered = filtered.filter(app => app.district === filters.district);
        }

        setFilteredApplications(filtered);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING_VERIFICATION': { label: 'Pending Verification', class: 'pending' },
            'UNDER_REVIEW': { label: 'Under Review', class: 'under-review' },
            'QUERY_RAISED': { label: 'Query Raised', class: 'query-raised' },
            'APPROVED': { label: 'Approved', class: 'approved' },
            'REJECTED': { label: 'Rejected', class: 'rejected' }
        };
        const statusData = statusMap[status] || { label: status, class: '' };
        return (
            <span className={`officer-badge ${statusData.class}`}>
                {statusData.label}
            </span>
        );
    };

    const handleViewApplication = (applicationId) => {
        navigate(`/officer/dgo/applications/${applicationId}`);
    };

    const clearFilters = () => {
        setFilters({ status: '', district: '', search: '' });
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
                                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="QUERY_RAISED">Query Raised</option>
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
                                        <th>District</th>
                                        <th>Water Req.</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
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
                                            <td>{app.projectType}</td>
                                            <td>{app.district}</td>
                                            <td>{app.waterRequirement} m³/day</td>
                                            <td>{new Date(app.submittedDate).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(app.status)}</td>
                                            <td>
                                                <span style={{
                                                    color: app.daysInQueue > 3 ? 'var(--officer-danger)' : 'var(--officer-text-light)',
                                                    fontWeight: app.daysInQueue > 3 ? '600' : '400'
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
                                                    View
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

export default ApplicationsList;
