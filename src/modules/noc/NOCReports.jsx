import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CommonPlaceholder from './components/CommonPlaceholder';

const NOCReports = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('type') || 'applications';

    const tabs = [
        { id: 'applications', label: 'Application Reports' },
        { id: 'compliance', label: 'Compliance Reports' },
        { id: 'payments', label: 'Payment Reports' }
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ type: tabId });
    };

    return (
        <CommonPlaceholder
            title="Reports"
            subtitle="Generate and view system reports"
            breadcrumb="Reports"
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
        >
            <div style={{ padding: '0 2rem' }}>
                {/* Filters */}
                <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                            <label className="bhuneer-label">Date Range</label>
                            <select className="bhuneer-input">
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                                <option>Financial Year 2025-26</option>
                                <option>Custom Range</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                            <label className="bhuneer-label">Filter By Status</label>
                            <select className="bhuneer-input">
                                <option>All Status</option>
                                <option>Approved</option>
                                <option>Pending</option>
                                <option>Rejected</option>
                            </select>
                        </div>
                        <button className="bhuneer-submit-btn" style={{ padding: '0.7rem 1.5rem', marginBottom: '2px' }}>Generate Report</button>
                        <button className="bhuneer-secondary-btn" style={{ padding: '0.7rem 1.5rem', marginBottom: '2px' }}>Export PDF</button>
                    </div>
                </div>

                {/* Report Content based on Tab */}
                <div className="dashboard-card">
                    <div className="card-title-bar">
                        <h2 className="card-main-title">
                            {tabs.find(t => t.id === currentTab)?.label}
                        </h2>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Showing data for: <strong>Last 30 Days</strong></span>
                    </div>

                    <div className="card-content-area no-padding">
                        <div className="professional-table-wrapper">
                            <table className="professional-table">
                                <thead>
                                    {currentTab === 'applications' && (
                                        <tr>
                                            <th>Application ID</th>
                                            <th>Applied Date</th>
                                            <th>Project Type</th>
                                            <th>District</th>
                                            <th>Status</th>
                                        </tr>
                                    )}
                                    {currentTab === 'compliance' && (
                                        <tr>
                                            <th>Report Year</th>
                                            <th>Submission Date</th>
                                            <th>NOC Number</th>
                                            <th>Compliance Status</th>
                                            <th>Review Status</th>
                                        </tr>
                                    )}
                                    {currentTab === 'payments' && (
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Payment Type</th>
                                            <th>Status</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {currentTab === 'applications' && (
                                        <>
                                            <tr>
                                                <td>21-4/3482/GJ/IND/2021</td>
                                                <td>10-Jan-2026</td>
                                                <td>Industrial</td>
                                                <td>Jaipur</td>
                                                <td><span className="status-badge warning">Under Parsing</span></td>
                                            </tr>
                                            <tr>
                                                <td>21-4/1102/RJ/INF/2024</td>
                                                <td>05-Dec-2025</td>
                                                <td>Infrastructure</td>
                                                <td>Udaipur</td>
                                                <td><span className="status-badge success">Approved</span></td>
                                            </tr>
                                        </>
                                    )}
                                    {currentTab === 'compliance' && (
                                        <tr>
                                            <td>2024-2025</td>
                                            <td>02-Apr-2025</td>
                                            <td>CGWA/NOC/IND/ORIG/2021/12345</td>
                                            <td>Compliant</td>
                                            <td><span className="status-badge success">Accepted</span></td>
                                        </tr>
                                    )}
                                    {currentTab === 'payments' && (
                                        <tr>
                                            <td>TXN_123456789</td>
                                            <td>10-Jan-2026</td>
                                            <td>₹ 5,000</td>
                                            <td>Application Fee</td>
                                            <td><span className="status-badge success">Successful</span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </CommonPlaceholder>
    );
};

export default NOCReports;
