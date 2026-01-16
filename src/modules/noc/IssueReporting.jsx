import React from 'react';
import CommonPlaceholder from './components/CommonPlaceholder';

const IssueReporting = () => {
    return (
        <CommonPlaceholder
            title="Issue Reporting"
            subtitle="Report technical issues or grievances"
            breadcrumb="Issue Reporting"
        >
            <div style={{ padding: '0 2rem' }}>
                <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="card-title-bar">
                        <h2 className="card-main-title">Report New Issue</h2>
                    </div>
                    <div className="card-content-area">
                        <form>
                            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="bhuneer-label">Category</label>
                                    <select className="bhuneer-input">
                                        <option value="">Select Category</option>
                                        <option value="Technical">Technical Error / Bug</option>
                                        <option value="Payment">Payment Issue</option>
                                        <option value="Application">Application Correction</option>
                                        <option value="Account">Login / Profile Issue</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="bhuneer-label">Related Application No. (Optional)</label>
                                    <input type="text" className="bhuneer-input" placeholder="e.g. 21-4/3482/GJ/IND/2021" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="bhuneer-label">Subject</label>
                                <input type="text" className="bhuneer-input" placeholder="Brief summary of the issue" />
                            </div>

                            <div className="form-group">
                                <label className="bhuneer-label">Detailed Description</label>
                                <textarea className="bhuneer-input" rows="5" placeholder="Please provide detailed information about the issue you are facing..."></textarea>
                            </div>

                            <div className="form-group">
                                <label className="bhuneer-label">Screenshot / Error Log</label>
                                <div className="file-upload-input-group">
                                    <input type="file" style={{ padding: '0.5rem' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <button className="bhuneer-submit-btn">Submit Grievance</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ color: '#334155', marginBottom: '1rem' }}>Past Issues</h3>
                    <div className="dashboard-card">
                        <div className="card-content-area no-padding">
                            <div className="professional-table-wrapper">
                                <table className="professional-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>Category</th>
                                            <th>Subject</th>
                                            <th>Reported On</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>TKT-9921</strong></td>
                                            <td>Payment</td>
                                            <td>Transaction Failed but Amount Debited</td>
                                            <td>05-Jan-2026</td>
                                            <td><span className="status-badge warning">Open</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CommonPlaceholder>
    );
};

export default IssueReporting;
