import React, { useState, useEffect } from 'react';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import officerService from '../services/officerService';
import '../shared/styles/officer-portal.css';

const EnforcementRejectedList = () => {
    const [rejectedApps, setRejectedApps] = useState([]);
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

        const fetchRejected = async () => {
            try {
                const response = await officerService.getEnforcementApprovalQueue({ status: 'REJECTED' });
                if (response.success) {
                    // Assuming response.data is an array. If it returns everything, we filter.
                    const allData = response.data || [];
                    const rejected = allData.filter(app => app.status === 'REJECTED');
                    setRejectedApps(rejected);
                }
            } catch (error) {
                console.error("Failed to fetch rejected applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRejected();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading...</div>;

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
                                    {rejectedApps.length === 0 ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No rejected applications found.</td></tr>
                                    ) : (
                                        rejectedApps.map((app, index) => (
                                            <tr key={app._id || index}>
                                                <td style={{ fontWeight: '500' }}>{app.applicationNumber}</td>
                                                <td>{app.applicantName || app.companyId?.name || 'N/A'}</td>
                                                <td>{app.location?.districtId || 'N/A'}</td>
                                                <td>{app.statusDate ? new Date(app.statusDate).toLocaleDateString() : 'N/A'}</td>
                                                <td style={{ maxWidth: '300px' }}>{app.rejectionReason || 'N/A'}</td>
                                                <td>{app.assignedTo?.name || 'System'}</td>
                                                <td>
                                                    <button className="officer-btn-sm">View Details</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
