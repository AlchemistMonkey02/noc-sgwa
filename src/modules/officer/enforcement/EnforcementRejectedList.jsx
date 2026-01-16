import React, { useState, useEffect } from 'react';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const EnforcementRejectedList = () => {
    const [rejectedApps, setRejectedApps] = useState([]);

    useEffect(() => {
        // Mock data
        setRejectedApps([
            {
                applicationNumber: 'RJ/CGWA/NOC/2026/001150',
                applicantName: 'Illegal Mining Co',
                rejectedDate: '2026-01-05',
                district: 'Sikar',
                rejectionReason: 'Prohibited area for groundwater extraction',
                rejectedBy: 'Suresh Patel (Chief Engineer)'
            },
            {
                applicationNumber: 'RJ/CGWA/NOC/2026/001145',
                applicantName: 'City Car Wash',
                rejectedDate: '2026-01-02',
                district: 'Jaipur',
                rejectionReason: 'Commercial use not allowed in Over-Exploited zone',
                rejectedBy: 'Suresh Patel (Chief Engineer)'
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
                            <h1 className="officer-page-title">❌ Rejected Applications</h1>
                            <p className="officer-page-subtitle">History of rejected NOC requests</p>
                        </div>
                        <div className="table-responsive">
                            <table className="officer-table">
                                <thead>
                                    <tr>
                                        <th>Application No.</th>
                                        <th>Applicant Name</th>
                                        <th>District</th>
                                        <th>Rejected Date</th>
                                        <th>Reason</th>
                                        <th>Rejected By</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rejectedApps.map((app, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '500' }}>{app.applicationNumber}</td>
                                            <td>{app.applicantName}</td>
                                            <td>{app.district}</td>
                                            <td>{app.rejectedDate}</td>
                                            <td style={{ maxWidth: '300px' }}>{app.rejectionReason}</td>
                                            <td>{app.rejectedBy}</td>
                                            <td>
                                                <button className="officer-btn-sm">View Details</button>
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
export default EnforcementRejectedList;
