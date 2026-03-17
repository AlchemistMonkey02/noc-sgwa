import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import officerService from '../services/officerService';
import '../shared/styles/officer-portal.css';

import { getOfficerData } from '../shared/utils/officerAuth';

const ViewInspectionReport = () => {
    const { inspectionId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [officerData, setOfficerData] = useState(null);

    useEffect(() => {
        const userData = getOfficerData();
        setOfficerData(userData);

        const fetchReport = async () => {
            setLoading(true);
            try {
                const response = await officerService.getInspectionReport(inspectionId);
                if (response.success && response.data) {
                    const data = response.data;
                    setReport({
                        inspectionId: data.inspectionId,
                        appId: data.applicationNumber || data.appId || 'N/A',
                        applicantName: data.holderName || data.applicantName || 'N/A',
                        address: data.address || data.location || 'N/A',
                        projectType: data.projectType || 'N/A',
                        inspectionDate: data.inspectionDate || data.submittedAt || new Date().toISOString(),
                        submittedAt: data.submittedAt || new Date().toISOString(),
                        locationMatch: data.locationMatch === true,
                        landUseMatch: data.landUseMatch === true,
                        existingSources: data.existingSources || 0,
                        meterInstalled: data.meterInstalled || 'NO',
                        rainwaterHarvesting: data.rainwaterHarvesting || 'NOT_STARTED',
                        plantationStatus: data.plantationStatus || 'NOT_STARTED',
                        remarks: data.remarks || 'No remarks',
                        recommendation: data.recommendation || 'PENDING',
                        officerName: data.officerName || userData?.name || 'Officer',
                        geoLocation: data.geoLocation || { lat: 0, lng: 0, accuracy: 0 },
                        photos: data.photos || []
                    });
                } else {
                    throw new Error(response.message || 'Failed to load report');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [inspectionId]);

    if (loading) return (
        <div className="officer-portal">
            <OfficerHeader officerName={officerData?.name || "Officer"} officerRole="INSPECTION" />
            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading report...</div>
                    </div>
                </main>
            </div>
        </div>
    );

    if (!report) return (
        <div className="officer-portal">
            <OfficerHeader officerName={officerData?.name || "Officer"} officerRole="INSPECTION" />
            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Report not found.</div>
                    </div>
                </main>
            </div>
        </div>
    );

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerData?.name || officerData?.username || "Officer"}
                officerRole="INSPECTION"
                officerDesignation={officerData?.designation || "Field Inspector"}
                district={officerData?.district || "Jaipur"}
            />

            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => navigate(-1)}
                                className="officer-btn officer-btn-secondary"
                                style={{ padding: '0.5rem' }}
                            >
                                ← Back
                            </button>
                            <div>
                                <h1 className="officer-page-title">Inspection Report</h1>
                                <p className="officer-page-subtitle">Report ID: {inspectionId}</p>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <button className="officer-btn officer-btn-secondary" onClick={() => window.print()}>
                                    🖨️ Print Report
                                </button>
                            </div>
                        </div>

                        {/* Official Report Header (Visible primarily in Print, but good for context) */}
                        <div className="officer-report-header" style={{ display: 'none', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase' }}>Government of Rajasthan</h2>
                                <h3 style={{ margin: '0.25rem 0', fontSize: '1.1rem', fontWeight: '500' }}>Ground Water Department</h3>
                                <p style={{ margin: 0 }}>District Program Management Unit, Jaipur</p>
                            </div>
                        </div>

                        {/* Status Banner */}
                        <div className={`officer-card ${report.recommendation === 'RECOMMENDED' ? 'status-success' : report.recommendation === 'NOT_RECOMMENDED' ? 'status-danger' : 'status-warning'}`}
                        // ... existing styles ...
                        >
                            {/* ... existing content ... */}
                        </div>

                        {/* Application Summary */}
                        <div className="officer-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Application Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div><span style={{ color: '#666' }}>Application No:</span> <strong>{report.appId}</strong></div>
                                <div><span style={{ color: '#666' }}>Applicant:</span> <strong>{report.applicantName}</strong></div>
                                <div><span style={{ color: '#666' }}>Project Type:</span> <strong>{report.projectType}</strong></div>
                                <div><span style={{ color: '#666' }}>Address:</span> <strong>{report.address}</strong></div>
                            </div>
                        </div>

                        {/* Inspection Findings */}
                        <div className="officer-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Site Verification Findings</h3>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>Location Matches Application?</td>
                                        <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>{report.locationMatch ? 'Yes' : 'No'}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>Land Use Aligns with Project?</td>
                                        <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>{report.landUseMatch ? 'Yes' : 'No'}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>No. of Existing Borewells</td>
                                        <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>{report.existingSources}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>Flow Meter Installed?</td>
                                        <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                                            {report.meterInstalled === true ? 'Yes' : report.meterInstalled === false ? 'No' : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>Rainwater Harvesting</td>
                                        <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                                            {report.rainwaterHarvesting.replace(/_/g, ' ').toUpperCase()}
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>Plantation Status</td>
                                        <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                                            {report.plantationStatus.replace(/_/g, ' ').toUpperCase()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ marginTop: '1.5rem' }}>
                                <label className="officer-label" style={{ marginBottom: '0.5rem' }}>Captured Geolocation</label>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    <div>Latitude: <strong>{report.geoLocation?.lat}</strong></div>
                                    <div>Longitude: <strong>{report.geoLocation?.lng}</strong></div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Accuracy: {report.geoLocation?.accuracy}m</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <label className="officer-label" style={{ marginBottom: '0.5rem' }}>Officer Remarks</label>
                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontStyle: 'italic' }}>
                                    "{report.remarks}"
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', pageBreakInside: 'avoid' }}>
                                <label className="officer-label" style={{ marginBottom: '0.5rem' }}>Site Photographs</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {report.photos && report.photos.length > 0 ? (
                                        report.photos.map((photoId, i) => (
                                            <div key={i} style={{ aspectRatio: '4/3', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                <img 
                                                    src={officerService.getDocumentUrl(photoId)} 
                                                    alt={`Site Photo ${i + 1}`} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', gridColumn: '1 / -1' }}>
                                            No photographs attached to this report.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', borderTop: '2px dashed #e5e7eb', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Inspected By</p>
                                    <p style={{ margin: 0 }}>{report.officerName}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Date</p>
                                    <p style={{ margin: 0 }}>{new Date(report.inspectionDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ViewInspectionReport;
