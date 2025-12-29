// Applicant Compliance Dashboard
// Tracks monthly data submissions, pending reports, renewal eligibility, and penalties

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const ApplicantComplianceDashboard = () => {
    const navigate = useNavigate();
    const [nocData, setNocData] = useState({
        nocNumber: 'NOC/2024/SGWA/001234',
        issueDate: '2024-06-15',
        validityDate: '2029-06-14',
        status: 'Active',
        dailyAllocation: 150, // m³/day
        blockCategory: 'Semi-Critical'
    });

    const [complianceStatus, setComplianceStatus] = useState({
        flowMeterInstalled: true,
        piezometerInstalled: true,
        monthlyDataStatus: 'Pending',
        annualQualityReport: 'Overdue',
        renewalEligible: false,
        outstandingDues: 15000
    });

    const [monthlySubmissions, setMonthlySubmissions] = useState([
        { month: 'Dec 2024', waterLevel: 'Submitted', extractionData: 'Submitted', status: 'Complete' },
        { month: 'Nov 2024', waterLevel: 'Submitted', extractionData: 'Submitted', status: 'Complete' },
        { month: 'Oct 2024', waterLevel: 'Submitted', extractionData: 'Submitted', status: 'Complete' },
        { month: 'Sep 2024', waterLevel: 'Pending', extractionData: 'Pending', status: 'Overdue' },
        { month: 'Aug 2024', waterLevel: 'Pending', extractionData: 'Pending', status: 'Overdue' }
    ]);

    const [penalties, setPenalties] = useState([
        { id: 1, violationType: 'Data Non-Submission (2 months)', amount: 50000, status: 'Pending', date: '2024-11-01' }
    ]);

    return (
        <div className="noc-portal">
            <NOCHeader />

            <main className="noc-main-content">
                <div className="noc-container">
                    {/* Page Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div>
                            <h2 className="noc-page-title">Compliance Dashboard</h2>
                            <p style={{ color: 'var(--cgwa-text-secondary)', margin: '5px 0 0 0' }}>
                                Monitor your NOC compliance status and submit required data
                            </p>
                        </div>
                        <button
                            className="noc-btn noc-btn-secondary"
                            onClick={() => navigate('/noc/dashboard')}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* NOC Details Summary */}
                    <div className="noc-card" style={{ marginBottom: '30px' }}>
                        <div className="noc-card-header">NOC Details</div>
                        <div className="noc-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                <div>
                                    <strong>NOC Number:</strong>
                                    <p style={{ margin: '5px 0 0 0', color: 'var(--cgwa-primary)' }}>{nocData.nocNumber}</p>
                                </div>
                                <div>
                                    <strong>Issue Date:</strong>
                                    <p style={{ margin: '5px 0 0 0' }}>{nocData.issueDate}</p>
                                </div>
                                <div>
                                    <strong>Valid Until:</strong>
                                    <p style={{ margin: '5px 0 0 0' }}>{nocData.validityDate}</p>
                                </div>
                                <div>
                                    <strong>Status:</strong>
                                    <p style={{ margin: '5px 0 0 0' }}>
                                        <span className="noc-status-badge noc-status-approved">{nocData.status}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Status Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        {/* Flow Meter Status */}
                        <div className="noc-card" style={{ background: complianceStatus.flowMeterInstalled ? '#e8f5e9' : '#ffebee' }}>
                            <div className="noc-card-body" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                                    {complianceStatus.flowMeterInstalled ? '✅' : '❌'}
                                </div>
                                <h4 style={{ margin: '0 0 5px 0' }}>Flow Meter</h4>
                                <p style={{ margin: 0, color: 'var(--cgwa-text-secondary)' }}>
                                    {complianceStatus.flowMeterInstalled ? 'Installed & Active' : 'Not Installed'}
                                </p>
                            </div>
                        </div>

                        {/* Piezometer Status */}
                        <div className="noc-card" style={{ background: complianceStatus.piezometerInstalled ? '#e8f5e9' : '#ffebee' }}>
                            <div className="noc-card-body" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                                    {complianceStatus.piezometerInstalled ? '✅' : '❌'}
                                </div>
                                <h4 style={{ margin: '0 0 5px 0' }}>Piezometer</h4>
                                <p style={{ margin: 0, color: 'var(--cgwa-text-secondary)' }}>
                                    {complianceStatus.piezometerInstalled ? 'Installed & Monitoring' : 'Not Installed'}
                                </p>
                            </div>
                        </div>

                        {/* Renewal Status */}
                        <div className="noc-card" style={{ background: complianceStatus.renewalEligible ? '#e8f5e9' : '#fff3e0' }}>
                            <div className="noc-card-body" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                                    {complianceStatus.renewalEligible ? '✅' : '⏳'}
                                </div>
                                <h4 style={{ margin: '0 0 5px 0' }}>Renewal Eligibility</h4>
                                <p style={{ margin: 0, color: 'var(--cgwa-text-secondary)' }}>
                                    {complianceStatus.renewalEligible ? 'Eligible' : 'Pending Compliance'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Outstanding Dues Alert */}
                    {complianceStatus.outstandingDues > 0 && (
                        <div className="noc-alert noc-alert-danger" style={{ marginBottom: '30px' }}>
                            <strong>⚠️ Outstanding Dues:</strong>
                            <p style={{ margin: '10px 0 0 0' }}>
                                You have pending dues of ₹{complianceStatus.outstandingDues.toLocaleString('en-IN')}.
                                Please clear all dues to maintain NOC validity and renewal eligibility.
                            </p>
                            <button className="noc-btn noc-btn-danger" style={{ marginTop: '15px' }}>
                                Pay Now
                            </button>
                        </div>
                    )}

                    {/* Monthly Data Submissions */}
                    <div className="noc-card" style={{ marginBottom: '30px' }}>
                        <div className="noc-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Monthly Data Submissions</span>
                            <button className="noc-btn noc-btn-primary noc-btn-sm">
                                + Submit Data
                            </button>
                        </div>
                        <div className="noc-card-body" style={{ padding: 0 }}>
                            <table className="noc-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Water Level Data (Piezometer)</th>
                                        <th>Extraction Data (Flow Meter)</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlySubmissions.map((submission, index) => (
                                        <tr key={index}>
                                            <td><strong>{submission.month}</strong></td>
                                            <td>
                                                <span className={`noc-status-badge ${submission.waterLevel === 'Submitted' ? 'noc-status-approved' : 'noc-status-pending'
                                                    }`}>
                                                    {submission.waterLevel}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`noc-status-badge ${submission.extractionData === 'Submitted' ? 'noc-status-approved' : 'noc-status-pending'
                                                    }`}>
                                                    {submission.extractionData}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`noc-status-badge ${submission.status === 'Complete' ? 'noc-status-approved' :
                                                        submission.status === 'Overdue' ? 'noc-status-rejected' : 'noc-status-pending'
                                                    }`}>
                                                    {submission.status}
                                                </span>
                                            </td>
                                            <td>
                                                {submission.status !== 'Complete' && (
                                                    <button className="noc-btn noc-btn-primary noc-btn-sm">
                                                        Submit
                                                    </button>
                                                )}
                                                {submission.status === 'Complete' && (
                                                    <button className="noc-btn noc-btn-secondary noc-btn-sm">
                                                        View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Annual Quality Report */}
                    <div className="noc-card" style={{ marginBottom: '30px' }}>
                        <div className="noc-card-header">Annual Water Quality Report (NABL Lab)</div>
                        <div className="noc-card-body">
                            <div className="noc-alert noc-alert-warning">
                                <strong>⚠️ Overdue:</strong> Your annual water quality report is overdue. Please submit NABL accredited lab report immediately.
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                                <button className="noc-btn noc-btn-primary">
                                    📤 Upload Quality Report
                                </button>
                                <button className="noc-btn noc-btn-secondary">
                                    View Previous Reports
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Penalties & Notices */}
                    {penalties.length > 0 && (
                        <div className="noc-card" style={{ border: '2px solid var(--cgwa-danger)' }}>
                            <div className="noc-card-header" style={{ background: 'var(--cgwa-danger)', color: 'white' }}>
                                Penalties & Notices
                            </div>
                            <div className="noc-card-body" style={{ padding: 0 }}>
                                <table className="noc-table">
                                    <thead>
                                        <tr>
                                            <th>Violation Type</th>
                                            <th>Penalty Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {penalties.map((penalty) => (
                                            <tr key={penalty.id}>
                                                <td>{penalty.violationType}</td>
                                                <td style={{ color: 'var(--cgwa-danger)', fontWeight: 'bold' }}>
                                                    ₹{penalty.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td>{penalty.date}</td>
                                                <td>
                                                    <span className="noc-status-badge noc-status-rejected">
                                                        {penalty.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="noc-btn noc-btn-danger noc-btn-sm">
                                                        Pay Penalty
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <NOCFooter />
        </div>
    );
};

export default ApplicantComplianceDashboard;
