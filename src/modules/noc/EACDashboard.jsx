import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CommonPlaceholder from './components/CommonPlaceholder';

const EACDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'submit';

    const tabs = [
        { id: 'submit', label: 'Submit EAC Request' },
        { id: 'track', label: 'Track Status' }
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    return (
        <CommonPlaceholder
            title="Environment Attitude Certificate (EAC)"
            subtitle="Submit and track your EAC requests"
            breadcrumb="EAC"
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
        >
            <div style={{ padding: '0 2rem' }}>
                {currentTab === 'submit' && (
                    <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Submit EAC Request</h2>
                        </div>
                        <div className="card-content-area">
                            <form>
                                <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="bhuneer-label">Application Number <span className="text-red">*</span></label>
                                        <input type="text" className="bhuneer-input" placeholder="Enter App No." />
                                    </div>
                                    <div className="form-group">
                                        <label className="bhuneer-label">Request Type <span className="text-red">*</span></label>
                                        <select className="bhuneer-input">
                                            <option value="">Select Type</option>
                                            <option value="Amendment">Amendment in NOC</option>
                                            <option value="Extension">Extension of Validity</option>
                                            <option value="Expansion">Expansion of Project</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="bhuneer-label">Reason for Request <span className="text-red">*</span></label>
                                    <textarea className="bhuneer-input" rows="4" placeholder="Describe why you are requesting this change..."></textarea>
                                </div>

                                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                    <label className="bhuneer-label">Upload Supporting Documents (PDF)</label>
                                    <input type="file" className="bhuneer-input" accept=".pdf" style={{ padding: '0.5rem' }} />
                                </div>

                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <button className="bhuneer-submit-btn">Submit Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {currentTab === 'track' && (
                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Track EAC Requests</h2>
                        </div>
                        <div className="card-content-area no-padding">
                            <div className="professional-table-wrapper">
                                <table className="professional-table">
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Application No</th>
                                            <th>Type</th>
                                            <th>Submitted On</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>EAC-2025-0012</strong></td>
                                            <td>21-4/3482/GJ/IND/2021</td>
                                            <td>Amendment</td>
                                            <td>02-Jan-2026</td>
                                            <td><span className="status-badge warning">In Process</span></td>
                                            <td><button className="table-action-btn">View</button></td>
                                        </tr>
                                        <tr>
                                            <td><strong>EAC-2024-0890</strong></td>
                                            <td>21-4/3482/GJ/IND/2021</td>
                                            <td>Extension</td>
                                            <td>15-Nov-2024</td>
                                            <td><span className="status-badge success">Approved</span></td>
                                            <td><button className="table-action-btn">View Order</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CommonPlaceholder>
    );
};

export default EACDashboard;
