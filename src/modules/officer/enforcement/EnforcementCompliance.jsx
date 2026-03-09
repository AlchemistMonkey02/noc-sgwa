import React, { useState, useEffect } from 'react';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import officerService from '../services/officerService';
import '../shared/styles/officer-portal.css';

const EnforcementCompliance = () => {
    const [complianceData, setComplianceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [officerInfo, setOfficerInfo] = useState(null);

    const getOfficerData = () => {
        try {
            const data = localStorage.getItem('officerData');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const userData = getOfficerData();
        setOfficerInfo(userData);
        fetchCompliance();
    }, []);

    const fetchCompliance = async () => {
        try {
            setLoading(true);
            const response = await officerService.getEnforcementDashboard(); // Or a targeted compliance endpoint if exists
            if (response.success && response.data.compliance) {
                setComplianceData(response.data.compliance);
            }
        } catch (error) {
            console.error('Error fetching compliance:', error);
            setComplianceData([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        if (!status) return 'status-pending';
        switch (status.toUpperCase()) {
            case 'COMPLIANT': return 'status-approved';
            case 'NON_COMPLIANT': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'Officer'}
                officerRole="ENFORCEMENT"
                officerDesignation={officerInfo?.designation || 'Chief Engineer'}
                district={officerInfo?.district || ''}
            />
            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📋 Compliance Monitoring</h1>
                            <p className="officer-page-subtitle">Track adherence to NOC conditions and statutory requirements</p>
                        </div>

                        {/* Stats Summary */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="officer-card" style={{ flex: 1, textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: '#22c55e' }}>85%</h3>
                                <p>Compliance Rate</p>
                            </div>
                            <div className="officer-card" style={{ flex: 1, textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: '#ef4444' }}>12</h3>
                                <p>Violations Detected</p>
                            </div>
                            <div className="officer-card" style={{ flex: 1, textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: '#f59e0b' }}>5</h3>
                                <p>Notices Issued (Active)</p>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="officer-table">
                                <thead>
                                    <tr>
                                        <th>NOC Number</th>
                                        <th>Project / Company</th>
                                        <th>Telemetry</th>
                                        <th>Last Report</th>
                                        <th>Abst. Charges</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complianceData.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '600' }}>{item.nocNumber}</td>
                                            <td>
                                                <div>{item.company}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.district}</div>
                                            </td>
                                            <td>
                                                <span className={item.telemetryStatus === 'Installed' ? 'text-success' : 'text-danger'}>
                                                    {item.telemetryStatus}
                                                </span>
                                            </td>
                                            <td>{item.lastReportDate}</td>
                                            <td>{item.paymentStatus}</td>
                                            <td>
                                                <span className={`officer-badge ${getStatusStyle(item.complianceStatus)}`}>
                                                    {item.complianceStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="officer-btn-sm" style={{ marginRight: '0.5rem' }}>Report</button>
                                                {item.complianceStatus === 'NON_COMPLIANT' &&
                                                    <button className="officer-btn-sm warning">Issue Notice</button>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default EnforcementCompliance;
