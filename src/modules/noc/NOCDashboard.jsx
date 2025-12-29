import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleNewApplication = () => {
        navigate('/noc/application');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-container" style={{ padding: '30px 15px' }}>
                {/* Welcome Section */}
                <div className="noc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, color: 'var(--cgwa-primary)' }}>
                                Welcome, {user.username}!
                            </h2>
                            <p style={{ margin: '5px 0 0 0', color: 'var(--cgwa-text-secondary)' }}>
                                Applicant Dashboard - BhuNeer NOC Portal
                            </p>
                        </div>
                        <button onClick={handleLogout} className="noc-btn noc-btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="noc-card">
                    <div className="noc-card-header">Quick Actions</div>
                    <div className="noc-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <button onClick={handleNewApplication} className="noc-btn noc-btn-primary">
                                📝 New NOC Application
                            </button>
                            <button className="noc-btn noc-btn-outline">
                                📋 View All Applications
                            </button>
                            <button className="noc-btn noc-btn-outline">
                                💳 Payment History
                            </button>
                            <button className="noc-btn noc-btn-outline">
                                📄 Download NOC
                            </button>
                        </div>
                    </div>
                </div>

                {/* Application Statistics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="noc-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: '10px 0' }}>2</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>Total Applications</p>
                    </div>
                    <div className="noc-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: '10px 0' }}>1</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>Under Review</p>
                    </div>
                    <div className="noc-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: '10px 0' }}>1</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>Approved</p>
                    </div>
                    <div className="noc-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: '10px 0' }}>0</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>Rejected</p>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="noc-card">
                    <div className="noc-card-header">My Applications</div>
                    <div className="noc-card-body">
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
                                                <td><strong>{app.id}</strong></td>
                                                <td>{app.applicationType}</td>
                                                <td>{app.projectName}</td>
                                                <td>{app.submittedDate}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '5px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        background: app.statusColor === 'success' ? '#d4edda' : app.statusColor === 'warning' ? '#fff3cd' : '#f8d7da',
                                                        color: app.statusColor === 'success' ? '#155724' : app.statusColor === 'warning' ? '#856404' : '#721c24'
                                                    }}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="noc-btn noc-btn-primary" style={{ padding: '5px 15px', fontSize: '0.85rem' }}>
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cgwa-text-secondary)' }}>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No applications found</p>
                                <p style={{ margin: '10px 0 20px 0' }}>Click "New NOC Application" to submit your first application</p>
                                <button onClick={handleNewApplication} className="noc-btn noc-btn-primary">
                                    Start New Application
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Important Links */}
                <div className="noc-card">
                    <div className="noc-card-header">Important Links & Resources</div>
                    <div className="noc-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            <a href="#" className="noc-link">📖 User Manual</a>
                            <a href="#" className="noc-link">❓ Frequently Asked Questions</a>
                            <a href="#" className="noc-link">📋 Guidelines & Notifications</a>
                            <a href="#" className="noc-link">💰 Fee Structure</a>
                            <a href="#" className="noc-link">📞 Help & Support</a>
                            <a href="#" className="noc-link">📝 Application Forms</a>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCDashboard;
