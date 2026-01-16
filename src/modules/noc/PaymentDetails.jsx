import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const PaymentDetails = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const paymentHistory = [
        { id: 'PAY-2025-001', applicationId: 'NOC-2024-001234', amount: '₹15,000', date: '15-Dec-2024', status: 'Success', receipt: 'REC001.pdf' },
        { id: 'PAY-2025-002', applicationId: 'NOC-2024-001235', amount: '₹25,000', date: '20-Nov-2024', status: 'Success', receipt: 'REC002.pdf' },
        { id: 'PAY-2025-003', applicationId: 'NOC-2024-001236', amount: '₹18,500', date: '05-Jan-2025', status: 'Pending', receipt: null }
    ];

    const stats = [
        { label: 'Total Payments', value: '₹58,500', color: 'blue' },
        { label: 'Pending Payments', value: '₹18,500', color: 'orange' },
        { label: 'Completed', value: '₹40,000', color: 'green' }
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
                        <span className="current">Payment Details</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">💳 Payment Details</h1>
                        <p className="page-subtitle">View payment history and download receipts</p>
                    </div>

                    <div className="dashboard-stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className={`dashboard-stat-card ${stat.color}`}>
                                <div className="stat-card-content">
                                    <div className="stat-info">
                                        <div className="stat-number">{stat.value}</div>
                                        <div className="stat-label-text">{stat.label}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">📋 Payment History</h2>
                        </div>
                        <div className="card-content-area no-padding">
                            <div className="professional-table-wrapper">
                                <table className="professional-table">
                                    <thead>
                                        <tr>
                                            <th>Payment ID</th>
                                            <th>Application ID</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map(payment => (
                                            <tr key={payment.id}>
                                                <td><strong className="text-blue">{payment.id}</strong></td>
                                                <td>{payment.applicationId}</td>
                                                <td><strong>{payment.amount}</strong></td>
                                                <td>{payment.date}</td>
                                                <td>
                                                    <span className={`status-badge ${payment.status === 'Success' ? 'success' : 'warning'}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {payment.receipt ? (
                                                        <button className="table-action-btn">Download Receipt</button>
                                                    ) : (
                                                        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default PaymentDetails;
