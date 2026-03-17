import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import nocApplicationService from '../../noc/services/nocApplicationService';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import OfficerHeader from '../shared/components/OfficerHeader';
import '../shared/styles/officer-portal.css';
import '../dgo/ApplicationViewer.css';

const SGWAApplicationViewer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [showNOCModal, setShowNOCModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    
    // Master data options for resolving IDs
    const [districtOptions, setDistrictOptions] = useState([]);
    const [blockOptions, setBlockOptions] = useState([]);
    const [orgTypeOptions, setOrgTypeOptions] = useState([]);
    const [appTypeOptions, setAppTypeOptions] = useState([]);
    const [appSubTypeOptions, setAppSubTypeOptions] = useState([]);
    const [projectTypeOptions, setProjectTypeOptions] = useState([]);
    const [officerData, setOfficerData] = useState(null);

    // Store raw data for re-transformation
    const [rawApplication, setRawApplication] = useState(null);

    // Re-run transformation as master data loads
    useEffect(() => {
        if (rawApplication) {
            setApplication(transformApplicationData(rawApplication, {
                appTypes: appTypeOptions,
                subTypes: appSubTypeOptions,
                orgs: orgTypeOptions,
                projects: projectTypeOptions,
                districts: districtOptions,
                blocks: blockOptions
            }));
        }
    }, [rawApplication, appTypeOptions, appSubTypeOptions, orgTypeOptions, projectTypeOptions, districtOptions, blockOptions]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch officer profile for header
                const profileRes = await officerService.getProfile();
                if (profileRes.success) setOfficerData(profileRes.data);

                // Fetch essential master data
                const [dists, orgTypes, appTypes, subTypes] = await Promise.all([
                    nocApplicationService.getDistricts('RAJ'),
                    nocApplicationService.getOrganizationTypes(),
                    nocApplicationService.getApplicationTypes(),
                    nocApplicationService.getApplicationSubTypes()
                ]);

                if (dists.success) setDistrictOptions(dists.data);
                if (orgTypes.success) setOrgTypeOptions(orgTypes.data);
                if (appTypes.success) setAppTypeOptions(appTypes.data);
                if (subTypes.success) setAppSubTypeOptions(subTypes.data);

                await fetchApplicationDetails();
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        loadInitialData();
    }, [applicationId]);

    const resolveIdToName = (id, list) => {
        if (!id) return 'N/A';
        if (isNaN(id) && id !== 'N/A') return id; // Already a name
        const item = list.find(it => String(it.id || it._id || it.value) === String(id));
        return item ? (item.name || item.label || item.text) : id;
    };

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getSGWAApplicationDetails(applicationId);
            if (response.success) {
                const apiData = response.data.application || response.data;
                const transformed = transformApplicationData(apiData);
                setApplication(transformed);

                // Fetch contextual blocks
                if (apiData.locationDetails?.districtId || apiData.location?.districtId) {
                    const distId = apiData.locationDetails?.districtId || apiData.location?.districtId;
                    nocApplicationService.getBlocks(distId)
                        .then(res => { if (res.success) setBlockOptions(res.data); });
                }

                // Fetch contextual project types
                const subType = apiData.applicationSubType || apiData.projectDetails?.organizationType;
                if (subType) {
                    nocApplicationService.getProjectTypes(subType)
                        .then(res => { if (res.success) setProjectTypeOptions(res.data); });
                }
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            setApplication(null);
        } finally {
            setLoading(false);
        }
    };

    // Helper to transform API data to component state structure
    const transformApplicationData = (data, options = {}) => {
        const { appTypes = [], subTypes = [], orgs = [], projects = [], districts = [], blocks = [] } = options;
        
        // Calculate total water requirement correctly
        const waterReq = data.waterRequirement || {};
        const breakup = waterReq.purposeWiseBreakup || {};
        const sumOfBreakup = Object.values(breakup).reduce((s, v) => s + (Number(v) || 0), 0);
        const daily = waterReq.totalRequirement || waterReq.dailyRequirement || sumOfBreakup || 0;

        // Resolve names for labels
        const resolvedAppType = resolveIdToName(data.applicationType, appTypes);
        const resolvedAppSubType = resolveIdToName(data.applicationSubType, subTypes);
        const resolvedOrgType = resolveIdToName(data.projectDetails?.organizationType, orgs);
        const resolvedDistrict = resolveIdToName(data.location?.districtId, districts);
        const resolvedBlock = resolveIdToName(data.location?.blockId, blocks);

        // Synthesize timeline if empty
        let timeline = (data.progressTracking?.timeline || []).map(t => ({...t}));
        if (timeline.length === 0) {
            if (data.createdAt) timeline.push({ stage: 'CREATED', date: data.createdAt, actor: 'System', remarks: 'Application initiated' });
            if (data.submittedAt) timeline.push({ stage: 'SUBMITTED', date: data.submittedAt, actor: 'Applicant', remarks: 'Submitted for review' });
            timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return {
            ...data,
            id: data._id || data.applicationId,
            applicantDetails: {
                name: data.applicantDetails?.name || data.projectDetails?.applicantName || 'N/A',
                type: resolvedOrgType,
                contactPerson: data.applicantDetails?.contactPerson || data.projectDetails?.applicantName || 'N/A',
                email: data.applicantDetails?.email || data.projectDetails?.email || 'N/A',
                phone: data.applicantDetails?.phone || data.projectDetails?.mobile || 'N/A',
                panNumber: data.applicantDetails?.panNumber || data.projectDetails?.panNumber || 'N/A'
            },
            projectDetails: {
                ...data.projectDetails,
                projectName: data.projectDetails?.projectName || data.projectName || 'N/A',
                projectType: (() => {
                    const typeLabel = resolvedAppType && resolvedAppType !== '3' && resolvedAppType !== 'N/A' ? resolvedAppType : null;
                    const subTypeLabel = resolvedAppSubType && resolvedAppSubType !== '6' && resolvedAppSubType !== 'N/A' ? resolvedAppSubType : null;
                    
                    if (typeLabel && subTypeLabel) return `${typeLabel} (${subTypeLabel})`;
                    if (typeLabel) return typeLabel;
                    if (subTypeLabel) return subTypeLabel;
                    
                    if (data.applicationType && data.applicationSubType) {
                         const rawType = data.applicationType === '3' ? 'Infrastructure' : data.applicationType;
                         const rawSubType = data.applicationSubType === '6' ? 'Industrial' : data.applicationSubType;
                         return `${rawType} (${rawSubType})`;
                    }
                    return data.applicationType || 'NOC';
                })(),
                sector: (() => {
                    const isValidSector = (val) => {
                        if (!val || val === 'N/A' || val === '' || typeof val !== 'string') return false;
                        const invalid = ['WITHDRAWAL', 'NEW', 'RENEWAL', 'SUBMITTED', 'PENDING', 'NOC', 'PVT_LTD', 'PVT', 'LIMITED', 'LTD'];
                        return !invalid.includes(val.toUpperCase()) && isNaN(val);
                    };

                    if (data.sectorType && isValidSector(data.sectorType)) return data.sectorType;
                    if (resolvedAppSubType && resolvedAppSubType !== '6' && isValidSector(resolvedAppSubType)) return resolvedAppSubType;
                    if (resolvedAppType && resolvedAppType !== '3' && isValidSector(resolvedAppType)) return resolvedAppType;

                    if (data.applicationCategory && isValidSector(data.applicationCategory)) return data.applicationCategory;
                    if (data.projectDetails?.industryType && isValidSector(data.projectDetails.industryType)) return data.projectDetails.industryType;
                    
                    return 'Industry';
                })()
            },
            locationDetails: {
                ...data.locationDetails,
                district: resolvedDistrict,
                block: resolvedBlock,
                village: data.locationDetails?.village || data.location?.village || 'N/A',
                address: data.locationDetails?.plotNumber || data.location?.address || 'N/A'
            },
            waterRequirement: {
                ...waterReq,
                dailyRequirement: daily,
                annualRequirement: waterReq.annualRequirement || (daily * 365).toFixed(2),
                sourceType: waterReq.sourceType || data.hydrogeologicalData?.aquiferType || 'Groundwater',
                numberOfBorewells: waterReq.numberOfBorewells || data.groundWaterStructures?.length || 0
            },
            timeline
        };
    };

    const handleViewDocument = (doc) => {
        setSelectedDocument(doc);
    };

    const handleDownloadDocument = async (docId, fileName) => {
        try {
            const blob = await officerService.downloadDocument(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleVerifyAllDocuments = async () => {
        if (!application.documents?.length) return;
        try {
            const res = await officerService.verifyAllDocuments(application.id, {
                status: 'APPROVED',
                remarks: 'Verified by State Authority'
            });
            if (res.success) {
                alert('All documents verified!');
                fetchApplicationDetails();
            }
        } catch (error) {
            alert('Verification failed: ' + error.message);
        }
    };

    const handleVerifyDocument = async (docId) => {
        console.log('SGWA - Individual Verification triggered for:', docId);
        try {
            const res = await officerService.verifyDocument(docId, {
                status: 'APPROVED',
                remarks: 'Verified'
            });
            if (res.success) {
                alert('Document verified!');
                fetchApplicationDetails();
            }
        } catch (error) {
            alert('Verification failed: ' + error.message);
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading application...</p></div>;
    if (!application) return <div className="error-container"><h2>Application not found</h2><button onClick={() => navigate('/officer/sgwa/applications')}>Back</button></div>;

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerData?.fullName || "Officer"}
                officerRole="SGWA"
                officerDesignation={officerData?.designation || "Technical Officer"}
                district="State Level"
            />

            <div className="officer-layout">
                <OfficerSidebar userType="SGWA" />

                <main className="officer-main-content">
                    <div className="application-viewer-header">
                        <div className="header-details">
                            <button className="btn-back" onClick={() => navigate('/officer/sgwa/applications')}>
                                <span>←</span> Back to Dashboard
                            </button>
                            <h1>📋 Application Summary</h1>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>
                                Application ID: <span className="application-id-tag">{application.applicationNumber}</span>
                            </p>
                        </div>
                        <span className={`status-badge status-${application.status?.toLowerCase().replace(/_/g, '-')}`}>
                            {application.status === 'SUBMITTED' ? '✅ SUBMITTED' : application.status?.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <div className="application-summary-card">
                        <div className="summary-row">
                            <div className="summary-item">
                                <label>🏭 Project Name</label>
                                <p>{application.projectDetails?.projectName}</p>
                            </div>
                            <div className="summary-item">
                                <label>👤 Applicant</label>
                                <p>{application.applicantDetails?.name}</p>
                            </div>
                            <div className="summary-item">
                                <label>📍 District</label>
                                <p>{application.locationDetails?.district}</p>
                            </div>
                            <div className="summary-item">
                                <label>💧 Daily Requirement</label>
                                <p>{application.waterRequirement?.dailyRequirement} m³/day</p>
                            </div>
                        </div>
                    </div>

                    {/* DGO Recommendation Row */}
                    {application.approvalFlow?.dgo && (
                        <div style={{
                            background: application.approvalFlow.dgo.status === 'APPROVED' 
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)' 
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            border: `2px solid ${application.approvalFlow.dgo.status === 'APPROVED' ? '#22c55e' : '#ef4444'}`,
                            borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem'
                        }}>
                             <h3 style={{ margin: '0 0 1rem 0', color: application.approvalFlow.dgo.status === 'APPROVED' ? '#16a34a' : '#dc2626', fontSize: '1.125rem', fontWeight: '600' }}>
                                {application.approvalFlow.dgo.status === 'APPROVED' ? '✓' : '✗'} DGO Recommendation: {application.approvalFlow.dgo.status}
                            </h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <p><strong>Remarks:</strong> {application.approvalFlow.dgo.remarks || 'No remarks provided'}</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    Recommended by: {application.assignedTo?.fullName || 'DGO Officer'} on {new Date(application.approvalFlow.dgo.assignedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="application-tabs">
                        {['details', 'documents', 'timeline', 'inspection', 'queries'].map(t => (
                            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)} {t === 'documents' ? `(${application.documents?.length || 0})` : ''}
                            </button>
                        ))}
                    </div>

                    <div className="tab-content">
                        {activeTab === 'details' && (
                            <div className="details-tab">
                                <div className="detail-section">
                                    <h3>👤 Applicant Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item"><label>Full Name</label><p>{application.applicantDetails?.name}</p></div>
                                        <div className="detail-item"><label>Organization Type</label><p>{resolveIdToName(application.applicantDetails?.type, orgTypeOptions)}</p></div>
                                        <div className="detail-item"><label>Contact Person</label><p>{application.applicantDetails?.contactPerson}</p></div>
                                        <div className="detail-item"><label>Email</label><p>{application.applicantDetails?.email}</p></div>
                                        <div className="detail-item"><label>Phone</label><p>{application.applicantDetails?.phone}</p></div>
                                        <div className="detail-item"><label>PAN Number</label><p>{application.applicantDetails?.panNumber}</p></div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h3>🏭 Project Specifications</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item"><label>Project Name</label><p>{application.projectDetails?.projectName}</p></div>
                                        <div className="detail-item"><label>Application Type</label><p>{application.projectDetails?.projectType}</p></div>
                                        <div className="detail-item"><label>Sector / Category</label><p>{application.projectDetails?.sector}</p></div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h3>📍 Location Details</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item"><label>District</label><p>{application.locationDetails?.district}</p></div>
                                        <div className="detail-item"><label>Block</label><p>{application.locationDetails?.block}</p></div>
                                        <div className="detail-item"><label>Village</label><p>{application.locationDetails?.village}</p></div>
                                        <div className="detail-item"><label>Address / Plot</label><p>{application.locationDetails?.plotNumber}</p></div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h3>💧 Water Requirement</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item"><label>Daily Requirement</label><p>{application.waterRequirement?.dailyRequirement} m³/day</p></div>
                                        <div className="detail-item"><label>Annual Requirement</label><p>{application.waterRequirement?.annualRequirement} m³/year</p></div>
                                        <div className="detail-item"><label>Source Type</label><p>{application.waterRequirement?.sourceType}</p></div>
                                        <div className="detail-item"><label>Borewells</label><p>{application.waterRequirement?.numberOfBorewells}</p></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="documents-tab">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                    <button className="btn-success" onClick={handleVerifyAllDocuments} style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                                        ✓ Verify All Documents
                                    </button>
                                </div>
                                <div className="documents-grid">
                                    {application.documents?.map((doc, idx) => (
                                        <div key={idx} className="document-card">
                                            <div className="document-header">
                                                <div className="document-icon">📄</div>
                                                <div className="document-info">
                                                    <h4>{doc.documentType?.replace(/_/g, ' ')}</h4>
                                                    <p className="document-filename">{doc.fileName}</p>
                                                    {doc.isVerified && <span className="verified-badge">✓ Verified</span>}
                                                </div>
                                            </div>
                                            <div className="document-actions">
                                                {!doc.isVerified && (
                                                    <button className="btn-icon btn-verify" onClick={() => handleVerifyDocument(doc.documentId || doc.id)}>✅ Verify</button>
                                                )}
                                                <button className="btn-icon" onClick={() => handleViewDocument(doc)}>👁️ View</button>
                                                <button className="btn-icon" onClick={() => handleDownloadDocument(doc.documentId || doc.id, doc.fileName)}>📥 Download</button>
                                            </div>
                                        </div>
                                    )) || <div className="empty-state">No documents found</div>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="timeline-tab">
                                <div className="timeline">
                                    {application.timeline?.map((ev, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <h4>{ev.stage?.replace(/_/g, ' ')}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(ev.date).toLocaleString()}</p>
                                                <p><strong>{ev.actor}:</strong> {ev.remarks}</p>
                                            </div>
                                        </div>
                                    )) || <div className="empty-state">No events traced</div>}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'inspection' && <div className="empty-state">No inspection report filed yet</div>}
                        {activeTab === 'queries' && <div className="empty-state">No queries raised</div>}
                    </div>

                    <div className="action-buttons">
                        <button className="btn-success" onClick={() => setShowNOCModal(true)}>✓ Approve & Issue NOC</button>
                        <button className="btn-danger" onClick={() => setShowRejectionModal(true)}>✗ Reject</button>
                        <button className="btn-warning" onClick={() => setShowQueryModal(true)}>❓ Raise Query</button>
                    </div>
                </main>
            </div>

            {/* Modals for Action - simplified as placeholders since they require specific SGWA API logic */}
            {selectedDocument && (
                <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>{selectedDocument.fileName}</h3>
                            <button onClick={() => setSelectedDocument(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>
                        <iframe 
                            src={officerService.getDocumentUrl(selectedDocument.documentId || selectedDocument.id)} 
                            width="100%" 
                            height="600px" 
                            title="Preview"
                            style={{ border: '1px solid #eee', borderRadius: '8px' }}
                        />
                    </div>
                </div>
            )}

            {showNOCModal && (
                <div className="modal-overlay" onClick={() => setShowNOCModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <h2>Issue NOC</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const res = await officerService.approveApplication(applicationId, {
                                remarks: formData.get('remarks'),
                                nocValidityYears: parseInt(formData.get('validity')),
                                waterAllocation: parseFloat(formData.get('waterAllocation'))
                            });
                            if (res.success) { alert('NOC Issued!'); setShowNOCModal(false); fetchApplicationDetails(); }
                        }}>
                            <div className="officer-form-group">
                                <label>Validity (Years)</label>
                                <select name="validity" className="officer-select" required>
                                    {[1, 2, 3, 5, 10].map(v => <option key={v} value={v}>{v} Year{v>1?'s':''}</option>)}
                                </select>
                            </div>
                            <div className="officer-form-group">
                                <label>Water Allocation (m³/day)</label>
                                <input type="number" name="waterAllocation" className="officer-input" defaultValue={application.waterRequirement?.dailyRequirement} required />
                            </div>
                            <div className="officer-form-group">
                                <label>Remarks</label>
                                <textarea name="remarks" className="officer-textarea" rows="4" required placeholder="Application reviewed and approved for NOC issuance."></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn-back" onClick={() => setShowNOCModal(false)} style={{ color: '#666' }}>Cancel</button>
                                <button type="submit" className="btn-success">Finalize & Issue NOC</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SGWAApplicationViewer;
