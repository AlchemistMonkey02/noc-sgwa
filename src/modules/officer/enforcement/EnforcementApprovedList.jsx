import React, { useState, useEffect } from 'react';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const EnforcementApprovedList = () => {
    const [approvedNocs, setApprovedNocs] = useState([]);

    useEffect(() => {
        // Mock data
        setApprovedNocs([
            {
                nocNumber: 'RJ/CGWA/NOC/2025/001101',
                applicantName: 'Maruti Textiles',
                issuedDate: '2025-11-15',
                validUpto: '2028-11-14',
                district: 'Bhilwara',
                maxDailyExtraction: 220.50,
                status: 'ACTIVE'
            },
            {
                nocNumber: 'RJ/CGWA/NOC/2025/001102',
                applicantName: 'Rajasthan Minerals Corp',
                issuedDate: '2025-12-01',
                validUpto: '2027-11-30',
                district: 'Udaipur',
                maxDailyExtraction: 180.00,
                status: 'ACTIVE'
            },
            {
                nocNumber: 'RJ/CGWA/NOC/2025/001005',
                applicantName: 'Sunrise Hospitality',
                issuedDate: '2025-06-20',
                validUpto: '2028-06-19',
                district: 'Jaipur',
                maxDailyExtraction: 50.00,
                status: 'ACTIVE'
            }
        ]);
    }, []);

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Suresh Patel"
                officerRole="ENFORCEMENT"
                officerDesignation="Chief Engineer"
                district=""
            />
            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📜 Issued NOCs</h1>
                            <p className="officer-page-subtitle">List of all active No Objection Certificates</p>
                        </div>
                        <div className="table-responsive">
                            <table className="officer-table">
                                <thead>
                                    <tr>
                                        <th>NOC Number</th>
                                        <th>Applicant Name</th>
                                        <th>District</th>
                                        <th>Issued Date</th>
                                        <th>Valid Upto</th>
                                        <th>Allowed Extraction</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedNocs.map((noc, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '600' }}>{noc.nocNumber}</td>
                                            <td>{noc.applicantName}</td>
                                            <td>{noc.district}</td>
                                            <td>{noc.issuedDate}</td>
                                            <td>{noc.validUpto}</td>
                                            <td>{noc.maxDailyExtraction} m³/day</td>
                                            <td><span className="officer-badge success">{noc.status}</span></td>
                                            <td>
                                                <button className="officer-btn-sm" style={{ marginRight: '0.5rem' }}>⬇ Download</button>
                                                <button className="officer-btn-sm danger">Revoke</button>
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
export default EnforcementApprovedList;
