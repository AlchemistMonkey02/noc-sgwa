import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from './components/OfficerHeader';
import StatusBadge from './components/StatusBadge';
import { mockApplications, getOfficerStats } from './utils/mockApplicationData';
import './styles/officer-portal.css';

const OfficerDashboard = () => {
    const navigate = useNavigate();
    const [officer, setOfficer] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [applications, setApplications] = useState(mockApplications);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        // Check if officer is logged in
        const officerData = localStorage.getItem('nocOfficer');
        if (!officerData) {
            navigate('/noc/officer/login');
            return;
        }

        setOfficer(JSON.parse(officerData));
        setStats(getOfficerStats());
    }, [navigate]);

    // Filter applications based on active tab
    const getFilteredApplications = () => {
        let filtered = mockApplications;

        // Filter by status tab
        if (activeTab !== 'All') {
            filtered = filtered.filter(app => app.status === activeTab);
        }

        // Filter by category dropdown
        if (filterCategory !== 'All') {
            filtered = filtered.filter(app => app.category === filterCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.companyName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const handleReviewClick = (applicationId) => {
        navigate(`/noc/officer/application/${applicationId}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!officer || !stats) {
        return null;
    }

    const filteredApplications = getFilteredApplications();

    return (
        <div className="officer-portal">
            <OfficerHeader officer={officer} />

            <div className="officer-container">
                {/* Welcome Section */}
                <div className="officer-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, color: 'var(--officer-primary)', fontSize: '1.8rem' }}>
                                Welcome, {officer.name}!
                            </h2>
                            <p style={{ margin: '5px 0 0 0', color: 'var(--officer-text-secondary)', fontSize: '1rem' }}>
                                {officer.role} - {officer.specialization}
                            </p>
                        </div>
                        <div style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #0f4c81 0%, #1a5490 100%)',
                            color: 'white',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Today's Date</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                                {new Date().toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="officer-stats-grid">
                    <div className="officer-stat-card">
                        <h3 className="officer-stat-value">{stats.totalApplications}</h3>
                        <p className="officer-stat-label">Total Applications</p>
                    </div>
                    <div className="officer-stat-card pending">
                        <h3 className="officer-stat-value">{stats.pending}</h3>
                        <p className="officer-stat-label">Pending Review</p>
                    </div>
                    <div className="officer-stat-card under-review">
                        <h3 className="officer-stat-value">{stats.underReview}</h3>
                        <p className="officer-stat-label">Under Review</p>
                    </div>
                    <div className="officer-stat-card approved">
                        <h3 className="officer-stat-value">{stats.approved}</h3>
                        <p className="officer-stat-label">Approved (This Month)</p>
                    </div>
                    <div className="officer-stat-card rejected">
                        <h3 className="officer-stat-value">{stats.rejected}</h3>
                        <p className="officer-stat-label">Rejected (This Month)</p>
                    </div>
                    <div className="officer-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                        <h3 className="officer-stat-value">{stats.clarificationRequired}</h3>
                        <p className="officer-stat-label">Clarification Required</p>
                    </div>
                </div>

                {/* Applications Section */}
                <div className="officer-card">
                    <div className="officer-card-header">
                        <span>📋 NOC Applications</span>
                    </div>

                    {/* Filters */}
                    <div className="officer-filters">
                        <div>
                            <label className="officer-form-label">🔍 Search</label>
                            <input
                                type="text"
                                className="officer-form-control"
                                placeholder="Search by ID, applicant, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="officer-form-label">🏷️ Category</label>
                            <select
                                className="officer-form-control"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Industry">Industry</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Mining">Mining</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="officer-tabs">
                        {['All', 'Pending Review', 'Under Review', 'Clarification Required', 'Approved', 'Rejected'].map(tab => (
                            <button
                                key={tab}
                                className={`officer-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {tab !== 'All' && (
                                    <span style={{
                                        marginLeft: '8px',
                                        background: activeTab === tab ? 'var(--officer-primary)' : '#cbd5e1',
                                        color: activeTab === tab ? 'white' : '#64748b',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {mockApplications.filter(app => app.status === tab).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Applications Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table className="officer-table">
                            <thead>
                                <tr>
                                    <th>Application ID</th>
                                    <th>Applicant</th>
                                    <th>Company/Project</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Quantity (KLD)</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.length > 0 ? (
                                    filteredApplications.map(app => (
                                        <tr key={app.id}>
                                            <td>
                                                <strong style={{ color: 'var(--officer-primary)' }}>
                                                    {app.id}
                                                </strong>
                                            </td>
                                            <td>{app.applicantName}</td>
                                            <td>
                                                <div style={{ maxWidth: '200px' }}>
                                                    <strong>{app.companyName}</strong>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                        {app.projectName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    background: '#e0e7ff',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#3730a3'
                                                }}>
                                                    {app.category}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>{app.applicationType}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                {app.withdrawalQuantity}
                                            </td>
                                            <td>{formatDate(app.submittedDate)}</td>
                                            <td>
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td>
                                                <button
                                                    className="officer-btn officer-btn-primary officer-btn-sm"
                                                    onClick={() => handleReviewClick(app.id)}
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
                                            <div style={{ fontSize: '1.1rem' }}>No applications found</div>
                                            <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                                                Try adjusting your filters or search terms
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <div className="officer-card">
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--officer-primary)', fontSize: '1.1rem' }}>
                            ⏱️ Average Processing Time
                        </h3>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--officer-info)' }}>
                            {stats.avgProcessingTime}
                        </div>
                        <p style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Time from submission to decision
                        </p>
                    </div>

                    <div className="officer-card">
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--officer-primary)', fontSize: '1.1rem' }}>
                            📈 Approval Rate
                        </h3>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--officer-success)' }}>
                            {stats.approved > 0 ? Math.round((stats.approved / (stats.approved + stats.rejected)) * 100) : 0}%
                        </div>
                        <p style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Based on processed applications
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficerDashboard;
