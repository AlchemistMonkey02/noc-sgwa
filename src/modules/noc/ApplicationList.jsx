import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../components/SkeletonLoader';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

import { useAuth } from '../../context/AuthContext';

const ApplicationList = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [searchId, setSearchId] = useState('');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Applications
    useEffect(() => {
        const fetchApplications = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const response = await nocApplicationService.getUserApplications();
                console.log('Application List API Response:', response);

                // Handle various response structures
                let apps = [];
                if (Array.isArray(response)) {
                    apps = response;
                } else if (response.success && Array.isArray(response.applications)) {
                    apps = response.applications;
                } else if (response.data && Array.isArray(response.data.applications)) {
                    apps = response.data.applications;
                } else if (response.data && Array.isArray(response.data)) {
                    apps = response.data;
                } else if (response.applications && Array.isArray(response.applications)) {
                    // Fallback if success flag is missing but applications exist
                    apps = response.applications;
                }

                setApplications(apps);

                if (apps.length === 0 && response.success === false) {
                    console.warn('API might have returned an specific error or just empty list');
                }

            } catch (err) {
                console.error('Failed to fetch applications:', err);
                if (err.message.includes('401') || err.message.toLowerCase().includes('token')) {
                    setError('Login Required First');
                } else {
                    setError('Failed to load applications. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [isAuthenticated]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchId.trim()) {
            navigate(`/noc/track-status/${searchId.trim()}`);
        }
    };

    const getStatusColor = (status) => {
        const s = status?.toUpperCase();
        if (s === 'APPROVED' || s === 'EXEMPT') return 'success';
        if (s === 'REJECTED') return 'danger';
        if (s === 'SUBMITTED' || s === 'PENDING') return 'info';
        return 'warning';
    };

    const filteredApplications = activeTab === 'all'
        ? applications
        : applications.filter(app =>
            activeTab === 'active'
                ? ['SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'UNDER_SCRUTINY', 'QUERY_RAISED'].includes(app.status?.toUpperCase())
                : ['APPROVED', 'REJECTED', 'WITHDRAWN', 'EXEMPT'].includes(app.status?.toUpperCase())
        );

    return (
        <LayoutWithSidebar>
            <div className="page-gradient-header"></div>

            <div className="content-container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/noc/dashboard">Home</Link>
                    <span className="separator">›</span>
                    <span className="current">Track Applications</span>
                </div>

                <div className="page-title-section">
                    <h1 className="page-main-title">My Applications</h1>
                    <p className="page-subtitle">View and track status of all your submitted applications</p>
                </div>

                {/* Track by ID Search */}
                <div className="dashboard-card" style={{ marginBottom: '30px', padding: '24px' }}>
                    <h3 onClick={() => { }} style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', color: '#1e3a8a' }}>
                        🔍 Track Application Status
                    </h3>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="noc-form-control"
                            placeholder="Enter Application ID (e.g., RJ-NOC-2025-OFF)"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{ flex: 1, padding: '10px 15px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                        />
                        <button
                            type="submit"
                            className="noc-btn noc-btn-primary"
                            style={{ padding: '0 25px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Track Status
                        </button>
                    </form>
                </div>

                {loading ? (
                    <>
                        {/* Stats Skeleton */}
                        <div className="dashboard-stats-grid" style={{ marginBottom: '30px' }}>
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="dashboard-stat-card">
                                    <div className="stat-card-content">
                                        <div className="stat-info" style={{ width: '100%' }}>
                                            <SkeletonLoader width="40px" height="40px" style={{ marginBottom: '10px', borderRadius: '50%' }} />
                                            <SkeletonLoader width="60%" height="2rem" />
                                            <SkeletonLoader width="80%" height="1rem" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* List Skeleton */}
                        <div className="dashboard-card">
                            <div className="card-title-bar">
                                <SkeletonLoader variant="title" width="200px" height="1.5rem" style={{ marginBottom: 0 }} />
                            </div>
                            <div className="card-content-area no-padding">
                                <div className="professional-table-wrapper">
                                    <table className="professional-table">
                                        <thead>
                                            <tr>
                                                <th>Application ID</th>
                                                <th>Project Details</th>
                                                <th>Date</th>
                                                <th>Current Stage</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array(5).fill(0).map((_, i) => (
                                                <tr key={i}>
                                                    <td><SkeletonLoader width="120px" /></td>
                                                    <td>
                                                        <SkeletonLoader width="150px" style={{ marginBottom: '5px' }} />
                                                        <SkeletonLoader width="100px" height="0.8rem" />
                                                    </td>
                                                    <td><SkeletonLoader width="100px" /></td>
                                                    <td><SkeletonLoader width="120px" /></td>
                                                    <td><SkeletonLoader width="80px" height="1.5rem" style={{ borderRadius: '20px' }} /></td>
                                                    <td><SkeletonLoader width="100px" height="2rem" style={{ borderRadius: '6px' }} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (!isAuthenticated || error === 'Login Required First') ? (
                    <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
                        <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>Login Required</h3>
                        <p style={{ color: '#64748b', marginBottom: '25px' }}>Please log in to view and track your submitted applications.</p>
                        <button
                            className="noc-btn noc-btn-primary"
                            onClick={() => navigate('/noc/login')}
                        >
                            Go to Login
                        </button>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="dashboard-stats-grid" style={{ marginBottom: '30px' }}>
                            <div className="dashboard-stat-card blue">
                                <div className="stat-card-content">
                                    <div className="stat-info">
                                        <div className="stat-number">{applications.length}</div>
                                        <div className="stat-label-text">Total Applications</div>
                                    </div>
                                </div>
                            </div>
                            <div className="dashboard-stat-card orange">
                                <div className="stat-card-content">
                                    <div className="stat-info">
                                        <div className="stat-number">
                                            {applications.filter(a => ['SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'query_raised'].includes(a.status?.toLowerCase())).length}
                                        </div>
                                        <div className="stat-label-text">In Progress</div>
                                    </div>
                                </div>
                            </div>
                            <div className="dashboard-stat-card green">
                                <div className="stat-card-content">
                                    <div className="stat-info">
                                        <div className="stat-number">
                                            {applications.filter(a => a.status?.toUpperCase() === 'APPROVED').length}
                                        </div>
                                        <div className="stat-label-text">Approved</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applications List */}
                        <div className="dashboard-card">
                            <div className="card-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="filter-tabs">
                                    <button
                                        className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        All Applications
                                    </button>
                                    <button
                                        className={`filter-tab ${activeTab === 'active' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('active')}
                                    >
                                        In Progress
                                    </button>
                                    <button
                                        className={`filter-tab ${activeTab === 'history' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('history')}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>

                            <div className="card-content-area no-padding">
                                <div className="professional-table-wrapper">
                                    {filteredApplications.length === 0 ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                            No applications found in this category.
                                        </div>
                                    ) : (
                                        <table className="professional-table">
                                            <thead>
                                                <tr>
                                                    <th>Application ID</th>
                                                    <th>Project Details</th>
                                                    <th>Date</th>
                                                    <th>Current Stage</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredApplications.map(app => (
                                                    <tr key={app.applicationId || app.id || app._id}>
                                                        <td><strong className="text-blue">{app.applicationNumber || app.trackingId || 'N/A'}</strong></td>
                                                        <td>
                                                            <div style={{ fontWeight: '500' }}>{app.projectDetails?.projectName || app.projectName || 'N/A'}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{app.applicationType}</div>
                                                        </td>
                                                        <td>
                                                            {app.submittedAt
                                                                ? new Date(app.submittedAt).toLocaleDateString()
                                                                : (app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-')}
                                                        </td>
                                                        <td>{app.currentStage || 'Submitted'}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusColor(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="table-action-btn"
                                                                onClick={() => {
                                                                    // Prefer UUID (applicationId/id) for URL safety to avoid issues with slashes in application numbers
                                                                    const trackId = app.applicationId || app.id || app._id || app.applicationNumber;
                                                                    navigate(`/noc/track-status/${trackId}`);
                                                                }}
                                                            >
                                                                Track Status
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </LayoutWithSidebar>
    );
};

export default ApplicationList;
