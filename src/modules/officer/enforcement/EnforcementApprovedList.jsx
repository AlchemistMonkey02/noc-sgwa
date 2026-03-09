import React, { useState, useEffect } from 'react';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import officerService from '../services/officerService';
import '../shared/styles/officer-portal.css';

const EnforcementApprovedList = () => {
    const [approvedNocs, setApprovedNocs] = useState([]);
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

        const fetchApproved = async () => {
            try {
                // Fetch issued NOCs
                const response = await officerService.getEnforcementApprovalQueue({ status: 'NOC_ISSUED' });
                if (response.success) {
                    const queueData = response.data?.queue || [];
                    const mapped = queueData.map(app => ({
                        _id: app.id || app._id,
                        applicationNumber: app.applicationNumber,
                        applicantName: app.applicantDetails?.name || app.projectDetails?.applicantName || 'N/A',
                        projectName: app.projectDetails?.projectName || 'N/A',
                        district: app.locationDetails?.district || app.location?.districtId || 'N/A',
                        issuedDate: app.submittedAt || app.updatedAt, // Fallback
                        validUpto: app.validUpto || new Date(new Date(app.submittedAt).setFullYear(new Date(app.submittedAt).getFullYear() + 3)),
                        waterRequirement: app.waterRequirement?.total || app.waterRequirement?.dailyRequirement || 0,
                        status: app.status
                    }));
                    setApprovedNocs(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch approved applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApproved();
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
                                    {approvedNocs.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No approved applications found.</td></tr>
                                    ) : (
                                        approvedNocs.map((noc, index) => (
                                            <tr key={noc._id || index}>
                                                <td style={{ fontWeight: '600' }}>{noc.applicationNumber}</td>
                                                <td>
                                                    <div style={{ fontWeight: '500' }}>{noc.applicantName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--officer-text-secondary)' }}>{noc.projectName}</div>
                                                </td>
                                                <td>{noc.district}</td>
                                                <td>{noc.issuedDate ? new Date(noc.issuedDate).toLocaleDateString() : 'N/A'}</td>
                                                <td>{noc.validUpto ? new Date(noc.validUpto).toLocaleDateString() : 'N/A'}</td>
                                                <td>{noc.waterRequirement} m³/day</td>
                                                <td><span className="officer-badge success">{noc.status}</span></td>
                                                <td>
                                                    <button className="officer-btn-sm" style={{ marginRight: '0.5rem' }}>⬇ Download</button>
                                                    <button className="officer-btn-sm danger">Revoke</button>
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
export default EnforcementApprovedList;
