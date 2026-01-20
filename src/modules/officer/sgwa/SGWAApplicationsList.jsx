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
        status: 'APPROVED_DGO', // Default to pending view as requested
        district: '',
        search: '',
        dgoRecommendation: ''
    });

    // Mock data - State-level applications (all districts)
    const mockApplications = [
        { id: 'sgwa-001', applicationNumber: 'RJ/CGWA/NOC/2026/001250', applicantName: 'Mahindra Textiles Ltd', projectName: 'Industrial Dyeing Unit', projectType: 'Industrial', district: 'Jaipur', waterRequirement: 250.00, submittedDate: '2026-01-10T08:00:00Z', status: 'DGO_RECOMMENDED', dgoRecommendation: 'APPROVED', daysInQueue: 1 },
        { id: 'sgwa-002', applicationNumber: 'RJ/CGWA/NOC/2026/001251', applicantName: 'Rajasthan Hotels Pvt Ltd', projectName: '5-Star Resort Complex', projectType: 'Commercial', district: 'Udaipur', waterRequirement: 350.00, submittedDate: '2026-01-09T11:30:00Z', status: 'DGO_RECOMMENDED', dgoRecommendation: 'APPROVED', daysInQueue: 2 },
        { id: 'sgwa-003', applicationNumber: 'RJ/CGWA/NOC/2026/001252', applicantName: 'Aditya Power Generation', projectName: 'Thermal Power Plant', projectType: 'Industrial', district: 'Jodhpur', waterRequirement: 500.00, submittedDate: '2026-01-08T09:15:00Z', status: 'PENDING_SGWA_APPROVAL', dgoRecommendation: 'APPROVED', daysInQueue: 3 },
        { id: 'sgwa-004', applicationNumber: 'RJ/CGWA/NOC/2026/001253', applicantName: 'Golden Harvest Agro', projectName: 'Food Processing Unit', projectType: 'Industrial', district: 'Kota', waterRequirement: 180.00, submittedDate: '2026-01-07T10:00:00Z', status: 'DGO_RECOMMENDED', dgoRecommendation: 'APPROVED', daysInQueue: 4 },
        { id: 'sgwa-005', applicationNumber: 'RJ/CGWA/NOC/2026/001254', applicantName: 'Cement Corporation Ltd', projectName: 'Cement Manufacturing Plant', projectType: 'Industrial', district: 'Chittorgarh', waterRequirement: 400.00, submittedDate: '2026-01-06T14:30:00Z', status: 'PENDING_SGWA_APPROVAL', dgoRecommendation: 'APPROVED', daysInQueue: 5 },
        { id: 'sgwa-006', applicationNumber: 'RJ/CGWA/NOC/2026/001255', applicantName: 'Tech City Developers', projectName: 'IT Park Phase 3', projectType: 'Commercial', district: 'Jaipur', waterRequirement: 220.00, submittedDate: '2026-01-05T09:45:00Z', status: 'SGWA_APPROVED', dgoRecommendation: 'APPROVED', daysInQueue: 6 },
        { id: 'sgwa-007', applicationNumber: 'RJ/CGWA/NOC/2026/001256', applicantName: 'Marble Industries', projectName: 'Marble Processing Unit', projectType: 'Industrial', district: 'Udaipur', waterRequirement: 150.00, submittedDate: '2026-01-04T11:00:00Z', status: 'DGO_RECOMMENDED', dgoRecommendation: 'CONDITIONAL', daysInQueue: 7 },
        { id: 'sgwa-008', applicationNumber: 'RJ/CGWA/NOC/2026/001257', applicantName: 'Royal Breweries', projectName: 'Beverage Manufacturing', projectType: 'Industrial', district: 'Jodhpur', waterRequirement: 300.00, submittedDate: '2026-01-03T13:20:00Z', status: 'PENDING_SGWA_APPROVAL', dgoRecommendation: 'APPROVED', daysInQueue: 8 },
        { id: 'sgwa-009', applicationNumber: 'RJ/CGWA/NOC/2026/001258', applicantName: 'Green Paradise Resorts', projectName: 'Eco-Tourism Complex', projectType: 'Commercial', district: 'Jaisalmer', waterRequirement: 120.00, submittedDate: '2026-01-02T08:30:00Z', status: 'SGWA_QUERY_RAISED', dgoRecommendation: 'APPROVED', daysInQueue: 9 },
        { id: 'sgwa-010', applicationNumber: 'RJ/CGWA/NOC/2026/001259', applicantName: 'Pharma Solutions Ltd', projectName: 'Pharmaceutical Unit', projectType: 'Industrial', district: 'Ajmer', waterRequirement: 190.00, submittedDate: '2025-12-30T15:00:00Z', status: 'SGWA_APPROVED', dgoRecommendation: 'APPROVED', daysInQueue: 12 },
        { id: 'sgwa-011', applicationNumber: 'RJ/CGWA/NOC/2026/001260', applicantName: 'Sunrise Chemicals', projectName: 'Chemical Manufacturing', projectType: 'Industrial', district: 'Kota', waterRequirement: 280.00, submittedDate: '2025-12-29T10:15:00Z', status: 'SGWA_REJECTED', dgoRecommendation: 'REJECTED', daysInQueue: 13 },
        { id: 'sgwa-012', applicationNumber: 'RJ/CGWA/NOC/2026/001261', applicantName: 'Heritage Homes', projectName: 'Residential Township', projectType: 'Construction', district: 'Jaipur', waterRequirement: 350.00, submittedDate: '2025-12-28T12:00:00Z', status: 'DGO_RECOMMENDED', dgoRecommendation: 'APPROVED', daysInQueue: 14 },
        { id: 'sgwa-013', applicationNumber: 'RJ/CGWA/NOC/2026/001262', applicantName: 'Solar Power Ltd', projectName: 'Solar Farm with Storage', projectType: 'Industrial', district: 'Bikaner', waterRequirement: 80.00, submittedDate: '2025-12-27T09:30:00Z', status: 'PENDING_SGWA_APPROVAL', dgoRecommendation: 'APPROVED', daysInQueue: 15 },
        { id: 'sgwa-014', applicationNumber: 'RJ/CGWA/NOC/2026/001263', applicantName: 'Luxury Living Pvt Ltd', projectName: 'Mall & Entertainment Complex', projectType: 'Commercial', district: 'Udaipur', waterRequirement: 420.00, submittedDate: '2025-12-26T14:45:00Z', status: 'SGWA_QUERY_RAISED', dgoRecommendation: 'APPROVED', daysInQueue: 16 },
        { id: 'sgwa-015', applicationNumber: 'RJ/CGWA/NOC/2026/001264', applicantName: 'Steel Industries', projectName: 'Steel Rolling Mill', projectType: 'Industrial', district: 'Alwar', waterRequirement: 380.00, submittedDate: '2025-12-25T11:20:00Z', status: 'SGWA_APPROVED', dgoRecommendation: 'APPROVED', daysInQueue: 17 },
        { id: 'sgwa-016', applicationNumber: 'RJ/CGWA/NOC/2026/001265', applicantName: 'Food Park Developers', projectName: 'Food Processing Park', projectType: 'Industrial', district: 'Bharatpur', waterRequirement: 450.00, submittedDate: '2025-12-24T08:00:00Z', status: 'DGO_RECOMMENDED', dgoRecommendation: 'CONDITIONAL', daysInQueue: 18 },
        { id: 'sgwa-017', applicationNumber: 'RJ/CGWA/NOC/2026/001266', applicantName: 'Textile Park Ltd', projectName: 'Integrated Textile Park', projectType: 'Industrial', district: 'Bhilwara', waterRequirement: 520.00, submittedDate: '2025-12-23T10:30:00Z', status: 'PENDING_SGWA_APPROVAL', dgoRecommendation: 'APPROVED', daysInQueue: 19 },
        { id: 'sgwa-018', applicationNumber: 'RJ/CGWA/NOC/2026/001267', applicantName: 'Premium Hotels Chain', projectName: 'Luxury Hotel Chain', projectType: 'Commercial', district: 'Jaisalmer', waterRequirement: 280.00, submittedDate: '2025-12-22T13:15:00Z', status: 'SGWA_REJECTED', dgoRecommendation: 'REJECTED', daysInQueue: 20 }
    ];

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [filters]); // Refetch when filters change (server-side filtering)

    // Removed applyFilters client-side logic as we are now doing server-side filtering via fetchApplications
    /*
    useEffect(() => {
        applyFilters();
    }, [filters, allApplications]);
    */

    const fetchApplications = async () => {
        try {
            setLoading(true);
            let response;

            // If status is 'APPROVED_DGO' (Pending SGWA Review), use the specific /pending endpoint
            if (filters.status === 'APPROVED_DGO') {
                response = await officerService.getSGWAPendingApplications(filters);
            } else {
                response = await officerService.getSGWAApplications(filters);
            }

            if (response.success && response.data) {
                const rawData = response.data.applications || response.data || [];

                // Helper to calculate days in queue
                const calculateDays = (dateString) => {
                    if (!dateString) return 0;
                    const submitted = new Date(dateString);
                    const now = new Date();
                    const diffTime = Math.abs(now - submitted);
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                };

                // Map API data to component structure
                const mappedApps = rawData.map(app => ({
                    id: app.id || app._id || app.applicationId,
                    applicationNumber: app.applicationNumber || 'N/A',
                    applicantName: app.applicantDetails?.name || app.projectDetails?.applicantName || 'N/A',
                    projectName: app.projectDetails?.projectName || 'N/A',
                    district: app.locationDetails?.district || app.locationDetails?.state || 'N/A', // Fallback to state if district is coded/missing
                    // Handle waterRequirement - check root or nested, default to 'N/A' to avoid showing 0 if just missing
                    waterRequirement: (app.waterRequirement?.total || app.waterRequirement?.dailyRequirement || app.waterRequirement) || 'N/A',
                    status: app.status,
                    dgoRecommendation: app.dgoRecommendation?.status || app.dgoRecommendation || 'N/A',
                    daysInQueue: app.daysInQueue || calculateDays(app.submittedDate),
                    submittedDate: app.submittedDate
                }));

                // Update both states since filters are applied server-side
                setAllApplications(mappedApps);
                setFilteredApplications(mappedApps);
            } else {
                setAllApplications([]);
                setFilteredApplications([]);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            // Strict API Usage: No mock data
            setAllApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allApplications];

        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(app =>
                app.applicationNumber.toLowerCase().includes(searchLower) ||
                app.applicantName.toLowerCase().includes(searchLower) ||
                app.projectName.toLowerCase().includes(searchLower)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(app => app.status === filters.status);
        }

        if (filters.district) {
            filtered = filtered.filter(app => app.district === filters.district);
        }

        if (filters.dgoRecommendation) {
            filtered = filtered.filter(app => app.dgoRecommendation === filters.dgoRecommendation);
        }

        setFilteredApplications(filtered);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'DGO_RECOMMENDED': { label: 'DGO Recommended', class: 'primary' },
            'APPROVED_DGO': { label: 'DGO Approved', class: 'primary' }, // Added match for API
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
                officerName="Dr. Priya Sharma"
                officerRole="SGWA"
                officerDesignation="Technical Officer"
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
