import React from 'react';
import CommonPlaceholder from './components/CommonPlaceholder';

const ChargeRevision = () => {
    return (
        <CommonPlaceholder
            title="Charge Revision Report"
            subtitle="View revised water abstraction charges"
            breadcrumb="Charge Revision"
        >
            <div style={{ padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                    <div className="dashboard-card" style={{ padding: '1.5rem', borderLeft: '5px solid #0ea5e9' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Current Applicable Rate</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>₹ 25.00 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ KLD</span></div>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Effective from 01-Jan-2026</p>
                    </div>

                    <div className="dashboard-card" style={{ padding: '1.5rem', borderLeft: '5px solid #22c55e' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Last Payment Cleared</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>₹ 12,500</div>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>For Q4 2025</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-title-bar">
                        <h2 className="card-main-title">Charge Revision History</h2>
                    </div>
                    <div className="card-content-area no-padding">
                        <div className="professional-table-wrapper">
                            <table className="professional-table">
                                <thead>
                                    <tr>
                                        <th>Revision Order No</th>
                                        <th>Effective Date</th>
                                        <th>Previous Rate</th>
                                        <th>Revised Rate</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Order Copy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>REV-2026-001</strong></td>
                                        <td>01-Jan-2026</td>
                                        <td>₹ 22.00 / KLD</td>
                                        <td><strong>₹ 25.00 / KLD</strong></td>
                                        <td>Industrial (Cat A)</td>
                                        <td><span className="status-badge success">Active</span></td>
                                        <td><button className="text-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Download</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>REV-2024-055</strong></td>
                                        <td>01-Jan-2024</td>
                                        <td>₹ 20.00 / KLD</td>
                                        <td><strong>₹ 22.00 / KLD</strong></td>
                                        <td>Industrial (Cat A)</td>
                                        <td><span className="status-badge secondary">Superseded</span></td>
                                        <td><button className="text-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Download</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </CommonPlaceholder>
    );
};

export default ChargeRevision;
