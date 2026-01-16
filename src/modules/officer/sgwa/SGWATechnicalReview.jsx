import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const SGWATechnicalReview = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchTechnicalReviewApplications();
    }, []);

    const fetchTechnicalReviewApplications = async () => {
        try {
            setLoading(true);
            // Simulate fetching applications pending technical review
            // In a real app, this would be an API call like officerService.getTechnicalReviewApplications()

            // Mock data focusing on technical aspects
            const mockData = [
                {
                    id: 'sgwa-015',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001250',
                    applicantName: 'Mahindra Textiles Ltd',
                    projectType: 'Industrial',
                    waterRequirement: 250,
                    technicalStatus: 'PENDING_REVIEW',
                    dgoRecommendation: 'APPROVED',
                    borewells: 5,
                    depth: '150m',
                    aquiferType: 'Alluvium',
                    submittedDate: '2026-01-05',
                    priority: 'HIGH'
                },
                {
                    id: 'sgwa-016',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001251',
                    applicantName: 'Sunshine Resorts & Spa',
                    projectType: 'Commercial',
                    waterRequirement: 120,
                    technicalStatus: 'PENDING_REVIEW',
                    dgoRecommendation: 'CONDITIONAL',
                    borewells: 2,
                    depth: '120m',
                    aquiferType: 'Hard Rock',
                    submittedDate: '2026-01-06',
                    priority: 'MEDIUM'
                },
                {
                    id: 'sgwa-017',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001252',
                    applicantName: 'Global Tech Park',
                    projectType: 'Infrastructure',
                    waterRequirement: 450,
                    technicalStatus: 'REVIEW_IN_PROGRESS',
                    dgoRecommendation: 'APPROVED',
                    borewells: 8,
                    depth: '180m',
                    aquiferType: 'Alluvium',
                    submittedDate: '2026-01-04',
                    priority: 'HIGH'
                },
                {
                    id: 'sgwa-018',
                    applicationNumber: 'RJ/CGWA/NOC/2026/001253',
                    applicantName: 'Rajasthan Dairy Coop',
                    projectType: 'Industrial',
                    waterRequirement: 80,
                    technicalStatus: 'QUERY_RAISED',
                    dgoRecommendation: 'APPROVED',
                    borewells: 1,
                    depth: '100m',
                    aquiferType: 'Hard Rock',
                    submittedDate: '2026-01-07',
                    priority: 'LOW'
                }
            ];

            setApplications(mockData);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredApplications = () => {
        return applications.filter(app => {
            const matchesSearch =
                app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.applicantName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || app.technicalStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    };

    const handleReview = (id) => {
        navigate(`/officer/sgwa/applications/${id}`);
    };

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
                            <h1 className="officer-page-title">Technical Review</h1>
                            <p className="officer-page-subtitle">Assess technical feasibility and hydrogeological parameters</p>
                        </div>

                        {/* Filters */}
                        <div className="officer-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                            <div className="filter-group" style={{ flex: 1, minWidth: '300px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by Application No. or Applicant..."
                                    className="officer-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <select
                                    className="officer-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="PENDING_REVIEW">Pending Review</option>
                                    <option value="REVIEW_IN_PROGRESS">In Progress</option>
                                    <option value="QUERY_RAISED">Query Raised</option>
                                </select>
                            </div>
                        </div>

                        {/* Technical Review Table */}
                        <div className="table-responsive">
                            <table className="officer-table">
                                <thead>
                                    <tr>
                                        <th>Application No.</th>
                                        <th>Applicant / Type</th>
                                        <th>Water Demand</th>
                                        <th>Hydrogeology</th>
                                        <th>DGO Rec.</th>
                                        <th>Technical Status</th>
                                        <th>Priority</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                        </tr>
                                    ) : getFilteredApplications().length > 0 ? (
                                        getFilteredApplications().map((app) => (
                                            <tr key={app.id}>
                                                <td style={{ fontWeight: '500' }}>{app.applicationNumber}</td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{app.applicantName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.projectType}</div>
                                                </td>
                                                <td>{app.waterRequirement} m³/day</td>
                                                <td>
                                                    <div style={{ fontSize: '0.9rem' }}>{app.aquiferType}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.borewells} Wells @ {app.depth}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${app.dgoRecommendation.toLowerCase()}`}>
                                                        {app.dgoRecommendation}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${app.technicalStatus.toLowerCase().replace(/_/g, '-')}`}>
                                                        {app.technicalStatus.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        color: app.priority === 'HIGH' ? '#ef4444' : app.priority === 'MEDIUM' ? '#f59e0b' : '#22c55e',
                                                        fontWeight: '600',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {app.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="officer-btn-sm"
                                                        onClick={() => handleReview(app.id)}
                                                    >
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                No applications found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SGWATechnicalReview;
