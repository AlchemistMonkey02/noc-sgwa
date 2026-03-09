import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const EnforcementApprovalQueue = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
        fetchApprovalQueue();
    }, []);

    const fetchApprovalQueue = async () => {
        try {
            setLoading(true);
            const response = await officerService.getEnforcementApprovalQueue();
            if (response.success && response.data.queue) {
                const mapped = response.data.queue.map(app => ({
                    id: app.id || app._id,
                    applicationNumber: app.applicationNumber || 'N/A',
                    applicantName: app.applicantDetails?.name || 'N/A',
                    projectName: app.projectDetails?.projectName || 'N/A',
                    district: app.locationDetails?.district || 'N/A',
                    waterRequirement: app.waterRequirement?.total || 0,
                    submittedDate: app.submittedAt || app.createdAt,
                    status: app.status,
                    dgoRecommendation: app.reviewHistory?.find(r => r.role === 'DGO')?.action || 'PENDING',
                    sgwaRecommendation: app.reviewHistory?.find(r => r.role === 'SGWA')?.action || 'PENDING',
                    daysInQueue: app.daysInQueue || 0
                }));
                setApplications(mapped);
            }
        } catch (error) {
            console.error('Error fetching queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter(app =>
        (app.applicationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.applicantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.projectName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReview = (id) => {
        navigate(`/officer/enforcement/applications/${id}`);
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
                            <h1 className="officer-page-title">✅ Final Approval Queue</h1>
                            <p className="officer-page-subtitle">Applications recommended by SGWA awaiting final NOC issuance</p>
                        </div>

                        {/* Search */}
                        <div className="officer-filters" style={{ marginBottom: '2rem' }}>
                            <div className="officer-form-group" style={{ maxWidth: '400px' }}>
                                <input
                                    type="text"
                                    className="officer-input"
                                    placeholder="Search by Application No. or Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="officer-table">
                                <thead>
                                    <tr>
                                        <th>Application No.</th>
                                        <th>Applicant / Project</th>
                                        <th>District</th>
                                        <th>Water Req.</th>
                                        <th>DGO Rec.</th>
                                        <th>SGWA Rec.</th>
                                        <th>Days</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                    ) : filteredApplications.length > 0 ? (
                                        filteredApplications.map((app) => (
                                            <tr key={app.id}>
                                                <td style={{ fontWeight: '500' }}>{app.applicationNumber}</td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{app.applicantName}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.projectName}</div>
                                                </td>
                                                <td>{app.district}</td>
                                                <td>{app.waterRequirement} m³/day</td>
                                                <td>
                                                    <span className={`status-badge status-${app.dgoRecommendation.toLowerCase()}`}>
                                                        {app.dgoRecommendation}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="officer-badge success">
                                                        {app.sgwaRecommendation}
                                                    </span>
                                                </td>
                                                <td>{app.daysInQueue}</td>
                                                <td>
                                                    <button
                                                        className="officer-btn-sm"
                                                        onClick={() => handleReview(app.id)}
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No applications pending approval.</td></tr>
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

export default EnforcementApprovalQueue;
