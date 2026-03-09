import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

import officerService from '../services/officerService';

const InspectionHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [officerInfo, setOfficerInfo] = useState(null);

    useEffect(() => {
        const userData = getOfficerData();
        setOfficerInfo(userData);
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await officerService.getMyInspections({ status: 'COMPLETED' });
            if (response.success && response.data.inspections) {
                const mappedHistory = response.data.inspections.map(item => ({
                    id: item.inspectionId,
                    appId: item.applicationNumber,
                    applicantName: item.holderName || item.applicantName,
                    location: item.location,
                    date: item.scheduledDate.split('T')[0],
                    result: item.reportResult || 'SUBMITTED',
                    remarks: item.reportRemarks || ''
                }));
                setHistory(mappedHistory);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const getOfficerData = () => {
        try {
            const data = localStorage.getItem('officerData');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    const getStatusColor = (status) => {
        if (!status) return '#374151';
        switch (status.toUpperCase()) {
            case 'COMPLETED':
            case 'SUBMITTED': return '#047857';
            case 'REJECTED': return '#b91c1c';
            case 'PENDING': return '#b45309';
            default: return '#374151';
        }
    };

    const getStatusBg = (status) => {
        if (!status) return '#f3f4f6';
        switch (status.toUpperCase()) {
            case 'COMPLETED':
            case 'SUBMITTED': return '#d1fae5';
            case 'REJECTED': return '#fee2e2';
            case 'PENDING': return '#fef3c7';
            default: return '#f3f4f6';
        }
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerInfo?.name || officerInfo?.username || 'Officer'}
                officerRole="INSPECTION"
                officerDesignation={officerInfo?.designation || 'Field Inspector'}
                district={officerInfo?.district || 'Jaipur'}
            />

            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">Inspection History</h1>
                            <p className="officer-page-subtitle">Archive of all site visits conducted</p>
                        </div>

                        <div className="officer-card">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '600' }}>Date</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '600' }}>Application</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '600' }}>Applicant</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '600' }}>Inspection Result</th>
                                        <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '600' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record) => (
                                        <tr key={record.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '1rem' }}>{record.date}</td>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{record.appId}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600' }}>{record.applicantName}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{record.location}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    backgroundColor: getStatusBg(record.result),
                                                    color: getStatusColor(record.result)
                                                }}>
                                                    {record.result.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    className="officer-btn officer-btn-secondary"
                                                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                                                    onClick={() => navigate(`/officer/inspection/report/${record.id}`)}
                                                >
                                                    View Report
                                                </button>
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

export default InspectionHistory;
