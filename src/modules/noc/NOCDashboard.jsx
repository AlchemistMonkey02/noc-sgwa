import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('nocUser');
        if (!userData) {
            navigate('/noc/login');
            return;
        }

        setUser(JSON.parse(userData));

        // Load user's applications (mock data)
        setApplications([
            {
                id: 'NOC2024001',
                applicationType: 'Fresh NOC',
                projectName: 'Industrial Water Supply',
                submittedDate: '2024-12-15',
                status: 'Under Review',
                statusColor: 'warning'
            },
            {
                id: 'NOC2024002',
                applicationType: 'NOC Renewal',
                projectName: 'Hotel Water Requirement',
                submittedDate: '2024-11-20',
                status: 'Approved',
                statusColor: 'success'
            }
        ]);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('nocUser');
        navigate('/noc/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="dashboard-wrapper">
                <div className="container-xl">

                    {/* Welcome Banner */}
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h2>Welcome, {user.username}!</h2>
                            <p>Applicant Dashboard &middot; Central Ground Water Authority</p>
                        </div>
                        <button onClick={handleLogout} className="action-btn-sm" style={{ fontWeight: '600' }}>
                            Sign Out
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="section-header">
                        <span>Application Overview</span>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-value">2</div>
                            <div className="stat-label">Total Applications</div>
                        </div>
                        <div className="stat-card orange">
                            <div className="stat-value">1</div>
                            <div className="stat-label">Under Scrutiny</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-value">1</div>
                            <div className="stat-label">Approved NOCs</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-value">0</div>
                            <div className="stat-label">Rejected / Returned</div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="section-header">
                        <span>Quick Actions (Transition Mode)</span>
                    </div>
                    <div className="actions-grid">
                        <Link to="/noc/application" className="action-card">
                            <div className="action-icon-wrapper">📝</div>
                            <div className="action-content">
                                <h4>Provisional NOC</h4>
                                <p>For New Projects (Not yet operational)</p>
                            </div>
                        </Link>

                        <Link to="/noc/application" className="action-card">
                            <div className="action-icon-wrapper">🏭</div>
                            <div className="action-content">
                                <h4>Regular NOC</h4>
                                <p>For Existing Projects (Operational)</p>
                            </div>
                        </Link>

                        <Link to="/noc/application" className="action-card">
                            <div className="action-icon-wrapper">🔄</div>
                            <div className="action-content">
                                <h4>NOC Renewal</h4>
                                <p>Apply 90 days before expiry</p>
                            </div>
                        </Link>


                        <Link to="/noc/rig-application" className="action-card">
                            <div className="action-icon-wrapper">🏗️</div>
                            <div className="action-content">
                                <h4>Rig Registration</h4>
                                <p><strong>For NEW rigs:</strong> Register drilling machinery with full details</p>
                            </div>
                        </Link>

                        <Link to="/noc/rig-operation" className="action-card">
                            <div className="action-icon-wrapper">📜</div>
                            <div className="action-content">
                                <h4>Rig Operation NOC</h4>
                                <p><strong>For EXISTING rigs:</strong> Get permission to operate in specific areas</p>
                            </div>
                        </Link>

                        <Link to="/noc/water-budget-calculator" className="action-card">
                            <div className="action-icon-wrapper">💧</div>
                            <div className="action-content">
                                <h4>Water Budget Calculator</h4>
                                <p>Calculate water requirements & charges</p>
                            </div>
                        </Link>

                        <Link to="/noc/penalties" className="action-card">
                            <div className="action-icon-wrapper">⚠️</div>
                            <div className="action-content">
                                <h4>Penalties & EC</h4>
                                <p>View fixed penalties & compensation</p>
                            </div>
                        </Link>

                        <Link to="/noc/document-requirements" className="action-card">
                            <div className="action-icon-wrapper">📋</div>
                            <div className="action-content">
                                <h4>Checklist</h4>
                                <p>Mandatory documents for SDO scrutiny</p>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Applications Table */}
                    <div className="section-header" style={{ marginTop: '50px' }}>
                        <span>Recent Applications</span>
                    </div>

                    <div className="recent-apps-container">
                        <div className="table-header-row">
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Latest Submissions</span>
                            <a href="#" className="view-all-link">View All Applications &rarr;</a>
                        </div>
                        {applications.length > 0 ? (
                            <div className="noc-table-wrapper">
                                <table className="noc-table">
                                    <thead>
                                        <tr>
                                            <th>Application ID</th>
                                            <th>Application Type</th>
                                            <th>Project Name</th>
                                            <th>Submitted Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td><span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{app.id}</span></td>
                                                <td>{app.applicationType}</td>
                                                <td>{app.projectName}</td>
                                                <td>{app.submittedDate}</td>
                                                <td>
                                                    <span className={`status-badge ${app.statusColor}`}>
                                                        {app.statusColor === 'success' && '✅'}
                                                        {app.statusColor === 'warning' && '⏳'}
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="action-btn-sm"
                                                        onClick={() => navigate(`/noc/track-status/${app.id}`)}
                                                    >
                                                        Track Status
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--cgwa-text-secondary)' }}>
                                <p style={{ fontSize: '1.2rem', margin: 0 }}>No applications found</p>
                                <p style={{ margin: '10px 0 25px 0' }}>Get started by submitting your first application today.</p>
                                <button onClick={() => navigate('/noc/application')} className="noc-btn noc-btn-primary">
                                    Start New Application
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resources Footer Section */}
                    <div style={{ marginTop: '50px' }}>
                        <div className="section-header">
                            <span>Help & Resources</span>
                        </div>
                        <div className="resource-grid">
                            <a href="#" className="resource-link">📖 User Manual</a>
                            <a href="#" className="resource-link">❓ FAQ for Applicants</a>
                            <a href="#" className="resource-link">📋 Guidelines v2.0</a>
                            <a href="#" className="resource-link">📝 Download Forms (PDF)</a>
                            <a href="#" className="resource-link">📞 Contact Support</a>
                        </div>
                    </div>

                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCDashboard;
