import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import nocApplicationService from '../../noc/services/nocApplicationService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import ScheduleInspectionModal from '../shared/components/ScheduleInspectionModal';
import '../shared/styles/officer-portal.css';
import './ApplicationViewer.css';

// Helper to resolve IDs to names from options
const resolveIdToName = (id, options, defaultVal = 'N/A') => {
    if (!id || !options || options.length === 0) return id || defaultVal;
    const match = options.find(opt =>
        String(opt.id || opt.appTypeCode || opt.appSubTypeCode || opt.projectTypeCode || opt.appTypeCatCode || opt.industryTypeId || opt.code || opt._id) === String(id)
    );
    return match ? (match.name || match.label || match.industryName) : id;
};

const ApplicationViewer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [inspectionOfficers, setInspectionOfficers] = useState([]);
    const [officerData, setOfficerData] = useState(null);

    // Master Data for Mapping
    const [appTypeOptions, setAppTypeOptions] = useState([]);
    const [appSubTypeOptions, setAppSubTypeOptions] = useState([]);
    const [orgTypeOptions, setOrgTypeOptions] = useState([]);
    const [projectTypeOptions, setProjectTypeOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [blockOptions, setBlockOptions] = useState([]);
    const [industryTypeOptions, setIndustryTypeOptions] = useState([]);

    useEffect(() => {
        const storedOfficer = localStorage.getItem('officerData');
        if (storedOfficer) {
            setOfficerData(JSON.parse(storedOfficer));
        }
    }, []);

    useEffect(() => {
        const fetchOfficers = async () => {
            try {
                console.log('ApplicationViewer: Fetching all eligible officers...');
                const response = await officerService.getOfficers(); 
                console.log('ApplicationViewer: Officers Response:', response);
                if (response.success) {
                    setInspectionOfficers(response.data);
                }
            } catch (error) {
                console.error('Error fetching officers:', error);
            }
        };
        fetchOfficers();
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [types, subTypes, orgs, projects, districts, industries] = await Promise.all([
                nocApplicationService.getApplicationTypes(),
                nocApplicationService.getApplicationSubTypes(),
                nocApplicationService.getOrganizationTypes(),
                nocApplicationService.getProjectTypes(),
                nocApplicationService.getDistricts('RAJ'), // Rajasthan is default
                nocApplicationService.getIndustryTypes()
            ]);

            if (types.success) setAppTypeOptions(types.data);
            if (subTypes.success) setAppSubTypeOptions(subTypes.data);
            if (orgs.success) setOrgTypeOptions(orgs.data);
            if (projects.success) setProjectTypeOptions(projects.data);
            if (districts.success) setDistrictOptions(districts.data);
            if (industries?.success) setIndustryTypeOptions(industries.data);

            // Blocks will be fetched when application data is available
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };


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
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getApplicationDetails(applicationId);
            if (response.success) {
                setRawApplication(response.data);

                // Fetch blocks if district is available
                if (response.data.location?.districtId) {
                    nocApplicationService.getBlocks(response.data.location.districtId)
                        .then(res => { if (res.success) setBlockOptions(res.data); });
                }
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            alert('Error fetching application details: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Helper to transform API data to component state structure
    // Helper to transform API data to component state structure
    const transformApplicationData = (data, options = {}) => {
        const { appTypes = [], subTypes = [], orgs = [], projects = [], districts = [], blocks = [] } = options;
        
        // Calculate total water requirement correctly
        const waterRequirement = data.waterRequirement || {};
        const waterBreakup = waterRequirement.purposeWiseBreakup || {};
        const sumOfBreakup = Object.values(waterBreakup).reduce((sum, val) => sum + (Number(val) || 0), 0);
        const totalWater = waterRequirement.totalRequirement || waterRequirement.dailyRequirement || sumOfBreakup || 0;

        // Resolve names for labels
        const resolvedAppType = resolveIdToName(data.applicationType, appTypes);
        const resolvedAppSubType = resolveIdToName(data.applicationSubType, subTypes);
        const resolvedOrgType = resolveIdToName(data.projectDetails?.organizationType, orgs);
        const resolvedDistrict = resolveIdToName(data.location?.districtId, districts);
        const resolvedBlock = resolveIdToName(data.location?.blockId, blocks);

        // Synthesize timeline if empty
        let timeline = data.progressTracking?.timeline || [];
        if (timeline.length === 0) {
            if (data.createdAt) {
                timeline.push({
                    stage: 'APPLICATION_CREATED',
                    date: data.createdAt,
                    actor: 'System',
                    remarks: 'Application draft created'
                });
            }
            if (data.submittedAt) {
                timeline.push({
                    stage: 'APPLICATION_SUBMITTED',
                    date: data.submittedAt,
                    actor: data.userId?.fullName || data.projectDetails?.applicantName || 'Applicant',
                    remarks: 'Application submitted for review'
                });
            }
            if (data.approvalFlow?.dgo?.reviewedAt) {
                timeline.push({
                    stage: 'DGO_REVIEW_UPDATE',
                    date: data.approvalFlow.dgo.reviewedAt,
                    actor: data.approvalFlow.dgo.reviewedBy || 'DGO Officer',
                    remarks: `Status updated to ${data.approvalFlow.dgo.status}`
                });
            }
            if (data.status === 'INSPECTION_SCHEDULED') {
                // We don't have a date for when it *was* scheduled in the root object usually,
                // but we can show it as a pending item or just rely on status.
                // For now, let's just stick to past events.
                // For now, let's just stick to past events.
            }
            // Sort by date descending
            timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        try {
            return {
            id: data._id || data.applicationId,
            applicationNumber: data.applicationNumber,
            status: data.status,
            applicantDetails: {
                name: data.applicantDetails?.name || 
                      data.ownerDetails?.ownerName || 
                      data.projectDetails?.applicantName || 
                      data.projectDetails?.name || 
                      data.applicantName || 
                      'N/A',
                type: data.applicantDetails?.type || 
                      data.projectDetails?.organizationType || 
                      data.organizationType || 
                      'N/A',
                organizationName: data.projectDetails?.organizationName || 
                                 data.projectDetails?.companyName || 
                                 'N/A',
                email: data.projectDetails?.email || 
                       data.ownerDetails?.ownerEmail || 
                       data.userId?.email ||
                       'N/A',
                phone: data.projectDetails?.mobile || 
                       data.ownerDetails?.ownerPhone || 
                       'N/A',
                contactPerson: data.applicantDetails?.contactPerson || 
                              data.companyId?.contactPerson || 
                              data.ownerDetails?.ownerName || 
                              'N/A',
                panNumber: data.projectDetails?.panNumber || 
                          data.applicantDetails?.panNumber || 
                          data.panNumber ||
                          'N/A'
            },
            projectDetails: {
                ...data.projectDetails,
                projectName: data.projectDetails?.projectName || data.projectName || 'N/A',
                projectType: (() => {
                    const typeLabel = resolvedAppType !== '3' && resolvedAppType !== 'N/A' ? resolvedAppType : null;
                    const subTypeLabel = resolvedAppSubType !== '6' && resolvedAppSubType !== 'N/A' ? resolvedAppSubType : null;
                    
                    if (typeLabel && subTypeLabel) return `${typeLabel} (${subTypeLabel})`;
                    if (typeLabel) return typeLabel;
                    if (subTypeLabel) return subTypeLabel;
                    
                    // Fallback to numeric or generic if still resolving
                    if (data.applicationType && data.applicationSubType) return `${data.applicationType} (${data.applicationSubType})`;
                    return data.applicationType || 'NOC';
                })(),
                sector: (() => {
                    const isValidSector = (val) => {
                        if (!val || val === 'N/A' || val === '' || typeof val !== 'string') return false;
                        const invalid = ['WITHDRAWAL', 'NEW', 'RENEWAL', 'SUBMITTED', 'PENDING', 'NOC', 'PVT_LTD', 'PVT', 'LIMITED', 'LTD'];
                        return !invalid.includes(val.toUpperCase()) && isNaN(val);
                    };

                    // Priority: 1. sectorType resolved, 2. subType label, 3. category, 4. industryType
                    if (data.sectorType && isValidSector(data.sectorType)) return data.sectorType;
                    
                    // IF categorical field is generic, use the resolved sub-type (e.g. Infrastructure)
                    if (resolvedAppSubType && resolvedAppSubType !== '6' && isValidSector(resolvedAppSubType)) return resolvedAppSubType;
                    if (resolvedAppType && resolvedAppType !== '3' && isValidSector(resolvedAppType)) return resolvedAppType;

                    if (data.applicationCategory && isValidSector(data.applicationCategory)) return data.applicationCategory;
                    if (data.projectDetails?.industryType && isValidSector(data.projectDetails.industryType)) return data.projectDetails.industryType;
                    
                    return 'Industry'; // Standard fallback
                })()
            },
            locationDetails: {
                ...data.locationDetails,
                district: resolvedDistrict,
                block: resolvedBlock,
                village: data.location?.village || 'N/A',
                address: data.location?.address || 'N/A'
            },
            waterRequirement: {
                ...data.waterRequirement,
                dailyRequirement: totalWater || 
                                 data.waterRequirement?.dailyRequirement || 
                                 data.exemptionDetails?.agriculturalDetails?.waterRequirementKLD || 
                                 data.waterRequirementKLD || 
                                 0,
                annualRequirement: data.waterRequirement?.annualRequirement || 
                                  data.drinkingDomesticUse?.totalAnnualDomestic || 
                                  (totalWater ? (totalWater * 365).toFixed(2) : 'N/A'),
                sourceType: data.waterRequirement?.sourceType || 
                           data.hydrogeologicalData?.aquiferType ||
                           data.hydrogeology?.aquiferType ||
                           data.waterQualityType || 
                           data.groundWaterUtilizationFor ||
                           (data.pumpingDetails?.pumpType ? 'Groundwater (' + data.pumpingDetails.pumpType + ')' : 'Groundwater'),
                numberOfBorewells: data.waterRequirement?.proposedExtraction?.numberOfBorewells || 
                                  data.waterRequirement?.numberOfBorewells || 
                                  (data.groundWaterStructures?.length || 0)
            },
            isExempted: data.isExempted || false,
            exemptionDetails: data.exemptionDetails || null,
            documents: data.documents || [],
            timeline: timeline,
            workflow: {
                currentStage: data.approvalFlow?.dgo?.status || 'PENDING',
                inspection: data.approvalFlow?.dgo?.inspectionAssignedTo ? {
                    status: data.status,
                    officer: data.approvalFlow.dgo.inspectionAssignedTo,
                    scheduledDate: data.approvalFlow.dgo.inspectionScheduledAt,
                    inspectionId: data.approvalFlow.dgo.inspectionId
                } : (data.inspection ? {
                    status: data.inspection.status,
                    officerId: data.inspection.officerId,
                    scheduledDate: data.inspection.scheduledDate,
                    report: data.inspection.report
                } : null),
                query: data.query ? {
                    queryId: data.query.queryId,
                    subject: data.query.subject,
                    description: data.query.query,
                    raisedAt: data.query.raisedAt,
                    status: data.query.status,
                    responseDeadline: data.query.responseDeadline
                } : null
            }
        };
        } catch (error) {
            console.error('CRITICAL ERROR transforming application data:', error, { data, options });
            return null; // Force error screen via !application
        }
    };

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
    };

    const handleDownloadDocument = async (documentId, fileName) => {
        // Placeholder for download logic if service supports it
        console.log("Download requested for:", documentId);
        // In a real app, this would use officerService.downloadDocument(documentId)
        alert("Download feature would trigger here for " + fileName);
    };

    const handleForwardApplication = async (formData) => {
        try {
            const data = {
                recommendation: 'RECOMMEND_APPROVAL',
                remarks: formData.get('remarks'),
                conditions: formData.get('conditions')
            };
            const response = await officerService.forwardApplication(applicationId, data);
            if (response.success) {
                alert('Application recommended for approval successfully!');
                setShowApprovalModal(false);
                fetchApplicationDetails(); // Refresh to update status
            } else {
                alert('Failed to forward application: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error forwarding:', error);
            alert('An error occurred while forwarding the application.');
        }
    };

    const handleVerifyDocument = async (doc, status) => {
        console.log('DGO - Individual Verification triggered for:', doc, status);
        try {
            const docId = doc.documentId || doc.id || doc._id;
            if (!docId) {
                alert('Document ID missing');
                return;
            }

            console.log('Calling officerService.verifyDocument with ID:', docId);
            const response = await officerService.verifyDocument(docId, {
                status: status || 'APPROVED',
                remarks: status === 'ACCEPTED' ? 'Verified by Officer' : 'Status: ' + status
            });
            if (response.success) {
                fetchApplicationDetails();
            } else {
                alert('Failed to verify document');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Error verifying document');
        }
    };

    const handleBulkVerify = async () => {
        if (!application.documents || application.documents.length === 0) return;

        if (!window.confirm(`Are you sure you want to verify all documents?`)) {
            return;
        }

        try {
            const response = await officerService.verifyAllDocuments(applicationId, {
                status: 'APPROVED',
                remarks: 'Verified by DGO'
            });
            if (response.success) {
                alert('All documents verified successfully!');
                fetchApplicationDetails();
            } else {
                alert('Bulk verification failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error during bulk verification');
        }
    };

    const handleScheduleInspection = async (formData) => {
        try {
            const date = formData.get('inspectionDate');
            const officerId = formData.get('officerId');

            if (!date) {
                alert('Please select an inspection date');
                return;
            }
            if (!officerId) {
                alert('Please select an inspection officer');
                return;
            }

            const response = await officerService.scheduleInspection(applicationId, {
                inspectionDate: date,
                officerId: officerId
            });

            if (response.success) {
                alert('Inspection scheduled successfully!');
                setShowInspectionModal(false);
                // Update state immediately with returned data
                if (response.data && response.data.application && response.data.inspection) {
                    const combinedData = {
                        ...response.data.application,
                        inspection: response.data.inspection
                    };
                    setApplication(transformApplicationData(combinedData));
                } else {
                    fetchApplicationDetails();
                }
            } else {
                alert('Failed to schedule inspection: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error scheduling inspection:', error);
            alert('An error occurred while scheduling the inspection.');
        }
    };

    const handleRaiseQuery = async (formData) => {
        try {
            const queryData = {
                queryType: formData.get('queryType'),
                subject: formData.get('subject'),
                description: formData.get('description'),
                responseDeadline: formData.get('deadline')
            };

            const response = await officerService.raiseQuery(applicationId, queryData);
            if (response.success) {
                alert('Query raised successfully!');
                setShowQueryModal(false);
                // Update state immediately with returned data
                if (response.data && response.data.application && response.data.query) {
                    const combinedData = {
                        ...response.data.application,
                        query: response.data.query
                    };
                    setApplication(transformApplicationData(combinedData));
                    setActiveTab('queries');
                } else {
                    fetchApplicationDetails();
                }
            } else {
                alert('Failed to raise query: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error raising query:', error);
            alert('An error occurred while raising the query.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading application...</p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="error-container">
                <h2>Application not found</h2>
                <button onClick={() => navigate('/officer/dgo/applications')}>
                    Back to Applications
                </button>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerData?.name || "Officer"}
                officerRole="DGO"
                officerDesignation={officerData?.designation || "District Ground Water Officer"}
                district={officerData?.district || ""}
            />

            <div className="officer-layout">
                <OfficerSidebar userType="DGO" />

                <main className="officer-main-content">
                    {/* Page Title Section with Gradient - Matching Applicant Detail */}
                    <div className="application-viewer-header">
                        <div className="header-details">
                            <button
                                className="btn-back"
                                onClick={() => navigate('/officer/dgo/applications')}
                                style={{ marginBottom: '1.5rem' }}
                            >
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

                    {/* Summary Row */}
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
                                 <p>{resolveIdToName(application.locationDetails?.district, districtOptions)}</p>
                             </div>
                            <div className="summary-item">
                                <label>💧 Daily Requirement</label>
                                <p>{application.waterRequirement?.dailyRequirement} m³/day</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="application-tabs">
                        <button
                            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            📋 Details
                        </button>
                        <button
                            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                            onClick={() => setActiveTab('documents')}
                        >
                            📂 Documents ({application.documents?.length || 0})
                        </button>
                        <button
                            className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                            onClick={() => setActiveTab('timeline')}
                        >
                            ⏱️ Timeline
                        </button>
                        <button
                            className={`tab ${activeTab === 'inspection' ? 'active' : ''}`}
                            onClick={() => setActiveTab('inspection')}
                        >
                            🔍 Inspection
                        </button>
                        <button
                            className={`tab ${activeTab === 'queries' ? 'active' : ''}`}
                            onClick={() => setActiveTab('queries')}
                        >
                            ❓ Queries
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'details' && (
                            <div className="details-tab">
                                <div className="detail-section">
                                    <h3>👤 Applicant Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Full Name</label>
                                            <p>{application.applicantDetails?.name}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Organization Type</label>
                                            <p>{resolveIdToName(application.applicantDetails?.type, orgTypeOptions)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Contact Person</label>
                                            <p>{application.applicantDetails?.contactPerson}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email Address</label>
                                            <p>{application.applicantDetails?.email}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Phone Number</label>
                                            <p>{application.applicantDetails?.phone}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>PAN Number</label>
                                            <p>{application.applicantDetails?.panNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>🏭 Project Specifications</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Project Title</label>
                                            <p>{application.projectDetails?.projectName}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Application Type</label>
                                            <p>{application.projectDetails?.projectType}</p>
                                        </div>
                                         <div className="detail-item">
                                             <label>Sector / Category</label>
                                             <p>{application.projectDetails?.sector}</p>
                                         </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>📍 Geolocation & Address</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>District</label>
                                            <p>{resolveIdToName(application.locationDetails?.district, districtOptions)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Tehsil/Block</label>
                                            <p>{resolveIdToName(application.locationDetails?.block, blockOptions)}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Village/Town</label>
                                            <p>{application.locationDetails?.village}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>💧 Water Extraction Details</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Daily Requirement</label>
                                            <p>{application.waterRequirement?.dailyRequirement} m³/day</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Annual Requirement</label>
                                            <p>{application.waterRequirement?.annualRequirement} m³/year</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Groundwater Source</label>
                                            <p>{application.waterRequirement?.sourceType}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Number of Structures</label>
                                            <p>{application.waterRequirement?.numberOfBorewells} Borewells</p>
                                        </div>
                                    </div>
                                </div>

                                {application.isExempted && application.exemptionDetails && (
                                    <div className="detail-section">
                                        <h3 style={{ color: '#059669' }}>🌾 Exemption Status</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Eligibility</label>
                                                <p style={{ color: application.exemptionDetails.exemptionEligible ? '#16a34a' : '#d97706' }}>
                                                    {application.exemptionDetails.exemptionEligible ? 'ELIGIBLE' : 'MANUAL REVIEW REQUIRED'}
                                                </p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Area (Ha)</label>
                                                <p>{application.exemptionDetails.agriculturalDetails?.landHoldingAreaHectare}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="documents-tab">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ margin: 0 }}>📂 Application Documents</h3>
                                    <button
                                        className="btn-success"
                                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                        onClick={handleBulkVerify}
                                        disabled={!application.documents?.some(d => d.status !== 'ACCEPTED')}
                                    >
                                        ✓ Verify All Pending
                                    </button>
                                </div>

                                <div className="documents-grid">
                                    {application.documents?.map((doc, index) => (
                                        <div key={index} className="document-card">
                                            <div className="document-header">
                                                <div className="document-icon">📄</div>
                                                <div className="document-info">
                                                    <h4>{doc.type?.replace(/_/g, ' ')}</h4>
                                                    <p className="document-filename">{doc.fileName}</p>
                                                    {doc.status === 'ACCEPTED' ? (
                                                        <span className="verified-badge">✓ Verified</span>
                                                    ) : (
                                                        <span className="verified-badge" style={{ background: '#fef3c7', color: '#b45309' }}>⚠ Pending</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="document-actions">
                                                <button className="btn-icon" onClick={() => handleViewDocument(doc)}>👁️ View</button>
                                                {doc.status !== 'ACCEPTED' && (
                                                    <button className="btn-icon" style={{ background: '#f0fdf4', color: '#16a34a' }} onClick={() => handleVerifyDocument(doc, 'ACCEPTED')}>✓ Verify</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="timeline-tab">
                                <div className="timeline">
                                    {application.timeline?.map((event, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <h4 style={{ margin: 0 }}>{event.stage?.replace(/_/g, ' ')}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(event.date).toLocaleString()}</span>
                                                </div>
                                                <p className="timeline-actor">👤 {event.actor}</p>
                                                {event.remarks && <p className="timeline-remarks">"{event.remarks}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'inspection' && (
                            <div className="inspection-tab">
                                {application.workflow?.inspection ? (
                                    <div className="detail-section">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ margin: 0 }}>🔍 Site Inspection Details</h3>
                                            <span className={`status-badge status-${application.workflow.inspection.status?.toLowerCase().replace(/_/g, '-')}`}>
                                                {application.workflow.inspection.status?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Scheduled Date</label>
                                                <p>{application.workflow.inspection.scheduledDate ? new Date(application.workflow.inspection.scheduledDate).toLocaleDateString() : 'Pending'}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Assigned Inspector</label>
                                                <p style={{ fontWeight: '600', color: '#1e293b' }}>
                                                    {application.workflow.inspection.officer ? 
                                                        `${application.workflow.inspection.officer.firstName} ${application.workflow.inspection.officer.lastName}` : 
                                                        (application.workflow.inspection.officerId || 'N/A')}
                                                </p>
                                            </div>
                                            {application.workflow.inspection.officer && (
                                                <>
                                                    <div className="detail-item">
                                                        <label>Inspector Email</label>
                                                        <p>{application.workflow.inspection.officer.email}</p>
                                                    </div>
                                                    <div className="detail-item">
                                                        <label>Inspector Phone</label>
                                                        <p>{application.workflow.inspection.officer.phone}</p>
                                                    </div>
                                                </>
                                            )}
                                            {application.workflow.inspection.inspectionId && (
                                                <div className="detail-item">
                                                    <label>Inspection ID</label>
                                                    <p>{application.workflow.inspection.inspectionId}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {application.status === 'INSPECTION_COMPLETED' && (
                                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                                <button 
                                                    className="btn-info" 
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    onClick={() => navigate(`/officer/dgo/applications/${applicationId}/inspection-report`)}
                                                >
                                                    📄 View Full Inspection Report
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                                        <h4>No inspection scheduled yet</h4>
                                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Schedule a site visit to verify the application details on-ground.</p>
                                        <button className="btn-success" style={{ margin: '0 auto' }} onClick={() => setShowInspectionModal(true)}>Schedule Inspection</button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'queries' && (
                            <div className="queries-tab">
                                {application.workflow?.query ? (
                                    <div className="detail-section">
                                        <h3>❓ Active Query Details</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item full-width" style={{ gridColumn: '1 / -1' }}>
                                                <label>Subject</label>
                                                <p>{application.workflow.query.subject}</p>
                                            </div>
                                            <div className="detail-item full-width" style={{ gridColumn: '1 / -1' }}>
                                                <label>Description</label>
                                                <p>{application.workflow.query.description}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Raised At</label>
                                                <p>{new Date(application.workflow.query.raisedAt).toLocaleString()}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Response Deadline</label>
                                                <p>{new Date(application.workflow.query.responseDeadline).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
                                        <h4>No active queries</h4>
                                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>You can raise a query to the applicant if you need additional clarification.</p>
                                        <button className="btn-warning" style={{ margin: '0 auto', color: 'white' }} onClick={() => setShowQueryModal(true)}>Raise New Query</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fixed Action Footer */}
                    <div className="action-buttons">
                        <button className="btn-success" onClick={() => setShowApprovalModal(true)}>✓ Recommend</button>
                        <button className="btn-warning" onClick={() => setShowQueryModal(true)}>❓ Raise Query</button>
                        <button className="btn-danger" onClick={() => setShowRejectionModal(true)}>✗ Reject</button>
                    </div>
                </main>
            </div>

            {/* Document Viewer Modal */}
            {selectedDocument && (
                <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>📄 {selectedDocument.type?.replace(/_/g, ' ')}</h3>
                            <button onClick={() => setSelectedDocument(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <iframe
                            src={officerService.getDocumentUrl(selectedDocument.documentId || selectedDocument.id)}
                            title={selectedDocument.fileName}
                            width="100%"
                            height="70vh"
                            style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>✓ Recommend for Approval</h3>
                            <button onClick={() => setShowApprovalModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleForwardApplication(new FormData(e.target));
                        }}>
                            <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Remarks</label>
                                <textarea name="remarks" className="detail-item" style={{ width: '100%', minHeight: '120px', padding: '1rem' }} placeholder="Enter recommendation remarks..." required />
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Conditions (if any)</label>
                                <textarea name="conditions" className="detail-item" style={{ width: '100%', minHeight: '80px', padding: '1rem' }} placeholder="Enter conditions..." />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-back" style={{ color: '#64748b', borderColor: '#e2e8f0' }} onClick={() => setShowApprovalModal(false)}>Cancel</button>
                                <button type="submit" className="btn-success">Submit Recommendation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>✗ Reject Application</h3>
                            <button onClick={() => setShowRejectionModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            // This would normally call a handleRejectApplication
                            alert('Application rejection submitted.');
                            setShowRejectionModal(false);
                        }}>
                            <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Reason for Rejection</label>
                                <select name="reason" className="detail-item" style={{ width: '100%', padding: '1rem' }} required>
                                    <option value="">Select a reason...</option>
                                    <option value="INCOMPLETE_DOCUMENTS">Incomplete Documents</option>
                                    <option value="TECHNICAL_NON_COMPLIANCE">Technical Non-Compliance</option>
                                    <option value="SITE_NOT_SUITABLE">Site Not Suitable</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Detailed Remarks</label>
                                <textarea name="remarks" className="detail-item" style={{ width: '100%', minHeight: '120px', padding: '1rem' }} placeholder="Enter detailed remarks..." required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-back" style={{ color: '#64748b', borderColor: '#e2e8f0' }} onClick={() => setShowRejectionModal(false)}>Cancel</button>
                                <button type="submit" className="btn-danger">Confirm Rejection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Query Modal */}
            {showQueryModal && (
                <div className="modal-overlay" onClick={() => setShowQueryModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>❓ Raise Query</h3>
                            <button onClick={() => setShowQueryModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleRaiseQuery(new FormData(e.target));
                        }}>
                            <div className="officer-form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Subject</label>
                                <input type="text" name="subject" className="detail-item" style={{ width: '100%', padding: '1rem' }} placeholder="Query subject..." required />
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Description</label>
                                <textarea name="description" className="detail-item" style={{ width: '100%', minHeight: '100px', padding: '1rem' }} placeholder="Enter detailed query..." required />
                            </div>
                            <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Response Deadline</label>
                                <input type="date" name="deadline" className="detail-item" style={{ width: '100%', padding: '1rem' }} required min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-back" style={{ color: '#64748b', borderColor: '#e2e8f0' }} onClick={() => setShowQueryModal(false)}>Cancel</button>
                                <button type="submit" className="btn-warning" style={{ color: 'white' }}>Send Query</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inspection Modal */}
            <ScheduleInspectionModal
                isOpen={showInspectionModal}
                onClose={() => setShowInspectionModal(false)}
                onSchedule={handleScheduleInspection}
                inspectionOfficers={inspectionOfficers}
            />
        </div>
    );
};

export default ApplicationViewer;
