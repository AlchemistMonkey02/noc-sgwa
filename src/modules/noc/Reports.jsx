import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const Reports = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const reportTypes = [
        { icon: '📊', name: 'NOC Summary Report', description: 'Comprehensive report of all NOC applications' },
        { icon: '✅', name: 'Compliance Report', description: 'Self-compliance submission records' },
        { icon: '💰', name: 'Payment Report', description: 'Payment history and receipts' },
        { icon: '💧', name: 'Water Extraction Report', description: 'Monthly water extraction data' }
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
                        <span className="current">Reports</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">📈 Reports</h1>
                        <p className="page-subtitle">Generate and download various reports</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">🎯 Select Report Type</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="utility-tools-grid">
                                {reportTypes.map((report, index) => (
                                    <div key={index} className="utility-tool-card">
                                        <div className="utility-icon">{report.icon}</div>
                                        <div className="utility-name">{report.name}</div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>{report.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">📋 Generate Report</h2>
                        </div>
                        <div className="card-content-area">
                            <form className="report-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Report Type *</label>
                                        <select required>
                                            <option value="">Select Report Type</option>
                                            <option value="noc">NOC Summary Report</option>
                                            <option value="compliance">Compliance Report</option>
                                            <option value="payment">Payment Report</option>
                                            <option value="extraction">Water Extraction Report</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Format *</label>
                                        <select required>
                                            <option value="pdf">PDF</option>
                                            <option value="excel">Excel</option>
                                            <option value="csv">CSV</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="date" />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input type="date" />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary">📥 Generate & Download Report</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default Reports;
