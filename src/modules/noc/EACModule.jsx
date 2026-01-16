import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const EACModule = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('submit');

    const eacHistory = [
        { id: 'EAC-2025-001', applicationId: 'NOC-2024-001234', submittedDate: '15-Dec-2024', status: 'Approved', approvalDate: '22-Dec-2024' },
        { id: 'EAC-2025-002', applicationId: 'NOC-2024-001235', submittedDate: '20-Nov-2024', status: 'Under Review', approvalDate: null }
    ];

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Home</Link>
                        <span className="separator">›</span>
                        <span className="current">EAC Module</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">👥 EAC (Expert Appraisal Committee)</h1>
                        <p className="page-subtitle">Submit and track EAC requests for your applications</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <div className="tabs-container">
                                <button
                                    className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('submit')}
                                >
                                    📤 Submit EAC Request
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'track' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('track')}
                                >
                                    📊 Track Status
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    📋 History
                                </button>
                            </div>
                        </div>

                        <div className="card-content-area">
                            {activeTab === 'submit' && (
                                <form className="eac-form">
                                    <div className="form-group">
                                        <label>Select Application *</label>
                                        <select required>
                                            <option value="">Choose an application</option>
                                            <option value="NOC-2024-001234">NOC-2024-001234 - Industrial Water Supply</option>
                                            <option value="NOC-2024-001235">NOC-2024-001235 - Hotel Project</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Project Details *</label>
                                        <textarea rows="4" placeholder="Provide detailed project information..." required></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label>Environmental Impact Assessment *</label>
                                        <input type="file" required accept=".pdf" />
                                        <small>Upload EIA report in PDF format</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Supporting Documents</label>
                                        <input type="file" multiple accept=".pdf,.jpg,.png" />
                                    </div>

                                    <button type="submit" className="btn-primary">Submit EAC Request</button>
                                </form>
                            )}

                            {activeTab === 'track' && (
                                <div className="timeline-container">
                                    <div className="timeline-item completed">
                                        <div className="timeline-marker">✓</div>
                                        <div className="timeline-content">
                                            <h4>Request Submitted</h4>
                                            <p>15-Dec-2024, 10:30 AM</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item completed">
                                        <div className="timeline-marker">✓</div>
                                        <div className="timeline-content">
                                            <h4>Under Review</h4>
                                            <p>16-Dec-2024, 02:15 PM</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item active">
                                        <div className="timeline-marker">⟳</div>
                                        <div className="timeline-content">
                                            <h4>Expert Committee Review</h4>
                                            <p>In Progress</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker">○</div>
                                        <div className="timeline-content">
                                            <h4>Final Decision</h4>
                                            <p>Pending</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="professional-table-wrapper">
                                    <table className="professional-table">
                                        <thead>
                                            <tr>
                                                <th>EAC ID</th>
                                                <th>Application ID</th>
                                                <th>Submitted Date</th>
                                                <th>Status</th>
                                                <th>Approval Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eacHistory.map(eac => (
                                                <tr key={eac.id}>
                                                    <td><strong className="text-blue">{eac.id}</strong></td>
                                                    <td>{eac.applicationId}</td>
                                                    <td>{eac.submittedDate}</td>
                                                    <td>
                                                        <span className={`status-badge ${eac.status === 'Approved' ? 'success' : 'warning'}`}>
                                                            {eac.status}
                                                        </span>
                                                    </td>
                                                    <td>{eac.approvalDate || '-'}</td>
                                                    <td>
                                                        <button className="table-action-btn">View Details</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default EACModule;
