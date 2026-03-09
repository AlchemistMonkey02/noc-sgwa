import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../components/SkeletonLoader';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyingDocs, setVerifyingDocs] = useState({}); // Track which docs are being auto-verified
    const [error, setError] = useState(null);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [appTypes, setAppTypes] = useState([]);
    const [appSubTypes, setAppSubTypes] = useState([]);
    const [industryTypes, setIndustryTypes] = useState([]);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const response = await nocApplicationService.getApplication(id);
                if (response.success && response.data) {
                    setApplication(response.data);

                    // Fetch master data based on application details
                    const sResponse = await nocApplicationService.getStates();
                    if (sResponse.success) setStates(sResponse.data);

                    const atResponse = await nocApplicationService.getApplicationTypes();
                    if (atResponse.success) setAppTypes(atResponse.data);

                    const astResponse = await nocApplicationService.getApplicationSubTypes();
                    if (astResponse.success) setAppSubTypes(astResponse.data);

                    const iResponse = await nocApplicationService.getIndustryTypes();
                    if (iResponse.success) setIndustryTypes(iResponse.data);

                    if (response.data.location?.stateId) {
                        const dResponse = await nocApplicationService.getDistricts(response.data.location.stateId);
                        if (dResponse.success) setDistricts(dResponse.data);
                    }
                    if (response.data.location?.districtId) {
                        const bResponse = await nocApplicationService.getBlocks(response.data.location.districtId);
                        if (bResponse.success) setBlocks(bResponse.data);
                    }
                } else {
                    setError('Failed to load application details');
                }
            } catch (err) {
                console.error("Error fetching application:", err);
                setError('An error occurred while fetching application details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchApplication();
        }
    }, [id]);

    const getDisplayLabel = (value, options) => {
        if (!value) return 'N/A';
        if (!options || !options.length) return value;
        const option = options.find(opt => {
            if (typeof opt === 'object') {
                const possibleIds = [
                    opt.id, opt._id, opt.code, opt.value,
                    opt.appTypeCode, opt.appSubTypeCode,
                    opt.categoryCode, opt.projectTypeCode,
                    opt.industryTypeId, opt.stateId, opt.districtId, opt.blockId
                ];
                return possibleIds.some(id => id !== undefined && String(id) === String(value)) ||
                    opt.label === value ||
                    opt.name === value;
            }
            return opt === value;
        });
        if (option) {
            return typeof option === 'object' ? (option.label || option.name || option.industryName || option.value || option.code) : option;
        }
        return value;
    };

    // Auto-Verify Documents Effect
    useEffect(() => {
        if (!application || !application.documents) return;

        const verifyPendingDocuments = async () => {
            const pendingDocs = application.documents.filter(doc => !doc.verification?.ai?.verified && !doc.verification?.ai?.status);

            if (pendingDocs.length === 0) return;

            // Mark as verifying
            const newVerifying = {};
            pendingDocs.forEach(d => newVerifying[d.documentId || d._id] = true);
            setVerifyingDocs(prev => ({ ...prev, ...newVerifying }));

            for (const doc of pendingDocs) {
                const docId = doc.documentId || doc._id;
                try {
                    // 1. Download
                    const blob = await nocApplicationService.downloadDocument(docId);
                    const file = new File([blob], doc.fileName || 'doc.pdf', { type: doc.mimeType || 'application/pdf' });

                    // 2. Metadata
                    const metadata = {
                        name: application.basicDetails?.projectDetails?.applicantName || "Applicant",
                    };
                    const docType = (doc.documentType || '').toLowerCase();
                    if (docType.includes('aadhaar')) {
                        metadata.aadhaar_number = application.basicDetails?.projectDetails?.aadhaarNumber || "";
                    }

                    // 3. Verify
                    const aiResponse = await nocApplicationService.verifyDocumentWithAI(file, doc.documentType, metadata);

                    // 4. Update Backend
                    if (aiResponse && aiResponse.success) {
                        const updatePayload = {
                            verified: true,
                            confidence: aiResponse.confidence || 0.95,
                            remarks: aiResponse.remarks || "Verified by AI",
                            extractedText: aiResponse.extracted_text
                        };
                        await nocApplicationService.updateDocumentAIStatus(docId, updatePayload);

                        // Update local state to reflect change immediately
                        setApplication(prev => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                documents: prev.documents.map(d => {
                                    if ((d.documentId || d._id) === docId) {
                                        return { ...d, verification: { ai: updatePayload } };
                                    }
                                    return d;
                                })
                            };
                        });
                    }

                } catch (err) {
                    console.error(`Auto-verification failed for ${docId}:`, err);
                } finally {
                    setVerifyingDocs(prev => ({ ...prev, [docId]: false }));
                }
            }
        };

        verifyPendingDocuments();
    }, [application]);

    if (loading) {
        return (
            <LayoutWithSidebar>
                <div className="page-gradient-header"></div>
                <div className="content-container">
                    {/* Title Section Skeleton */}
                    <div className="page-title-section" style={{
                        padding: '2.5rem 2rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        background: 'white' // Placeholder bg
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <SkeletonLoader variant="title" width="300px" height="2.5rem" style={{ marginBottom: '0.5rem' }} />
                                <SkeletonLoader width="200px" />
                            </div>
                            <SkeletonLoader width="120px" height="40px" style={{ borderRadius: '50px' }} />
                        </div>
                    </div>

                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {/* Basic Details Skeleton */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.75rem',
                            marginBottom: '1.5rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            <SkeletonLoader variant="title" width="250px" height="2rem" style={{ marginBottom: '1.5rem' }} />
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1.25rem'
                            }}>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <SkeletonLoader width="40%" height="0.8rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="70%" height="1.2rem" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Details Skeleton */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.75rem',
                            marginBottom: '1.5rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            <SkeletonLoader variant="title" width="250px" height="2rem" style={{ marginBottom: '1.5rem' }} />
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1.25rem'
                            }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <SkeletonLoader width="40%" height="0.8rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="70%" height="1.2rem" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents Skeleton */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.75rem',
                            marginBottom: '1.5rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            <SkeletonLoader variant="title" width="250px" height="2rem" style={{ marginBottom: '1.5rem' }} />
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {[1, 2, 3].map(i => (
                                    <SkeletonLoader key={i} width="100%" height="80px" style={{ borderRadius: '12px' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </LayoutWithSidebar>
        );
    }

    if (error || !application) {
        return (
            <LayoutWithSidebar>
                <div className="page-gradient-header"></div>
                <div className="content-container">
                    <div className="application-summary-container" style={{ textAlign: 'center', padding: '50px' }}>
                        <div className="error-message">
                            <h2 style={{ color: '#ef4444' }}>⚠️ {error || 'Application not found'}</h2>
                            <p style={{ marginTop: '10px', color: '#64748b' }}>
                                Check the Application ID or try again from the dashboard.
                            </p>
                            <button
                                className="bhuneer-secondary-btn"
                                style={{ marginTop: '20px' }}
                                onClick={() => navigate('/noc/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </LayoutWithSidebar>
        );
    }

    const {
        basicDetails,
        locationDetails,
        drinkingDomesticUse,
        waterRequirementBreakup,
        groundWaterStructures,
        digitalFlowMeter,
        documents,
        feeDetails,
        companyDetails,
        status,
        timestamps
    } = application;

    const projectDetails = basicDetails?.projectDetails;

    return (
        <LayoutWithSidebar>
            <div className="page-gradient-header"></div>
            <div className="content-container">
                {/* Header Section with Premium Styling */}
                <div className="page-title-section" style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    padding: '2.5rem 2rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: '700',
                                margin: '0 0 0.5rem 0',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                📋 Application Summary
                            </h1>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '1.1rem',
                                margin: 0,
                                fontWeight: '500'
                            }}>
                                Application ID: <span style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '6px',
                                    fontWeight: '600'
                                }}>{application.trackingId || application.applicationNumber}</span>
                            </p>
                        </div>
                        <span style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            background: status === 'APPROVED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : status === 'DRAFT' ? '#94a3b8' : '#f59e0b',
                            color: 'white',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {status === 'DRAFT' ? '📝 DRAFT' : status === 'SUBMITTED' ? '✅ SUBMITTED' : status === 'APPROVED' ? '🎉 APPROVED' : status === 'REJECTED' ? '❌ REJECTED' : `${status || 'PENDING'}`}
                        </span>
                    </div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* 1. Basic Details with Enhanced Styling */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        ':hover': {
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }
                    }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '1.5rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '3px solid #3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🏭</span> Basic Information
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                transition: 'transform 0.2s ease'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Name</div>
                                <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{projectDetails?.projectName || 'N/A'}</div>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Type</div>
                                <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{basicDetails?.applicationTypeName || getDisplayLabel(basicDetails?.applicationType, appTypes) || 'N/A'}</div>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry Type</div>
                                <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{getDisplayLabel(basicDetails?.sectorType || projectDetails?.industryType, industryTypes)}</div>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</div>
                                <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{projectDetails?.organizationName || 'N/A'} ({projectDetails?.organizationType || 'N/A'})</div>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant Name</div>
                                <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{projectDetails?.applicantName || 'N/A'}</div>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied On</div>
                                <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{application?.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Applicant Contact Details with Enhanced Styling */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '1.5rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '3px solid #8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>👤</span> Applicant Contact Details
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem'
                        }}>
                            {[
                                { label: 'Email', value: projectDetails?.email },
                                { label: 'Mobile', value: projectDetails?.mobile },
                                { label: 'Aadhaar Number', value: projectDetails?.aadhaarNumber },
                                { label: 'PAN Number', value: projectDetails?.panNumber },
                                { label: 'Designation', value: projectDetails?.designation },
                                { label: 'MSME', value: projectDetails?.isMSME ? 'Yes' : 'No' }
                            ].map((field, idx) => (
                                <div key={idx} style={{
                                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e9d5ff'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</div>
                                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{field.value || 'N/A'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Location Details with Enhanced Styling */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '1.5rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '3px solid #10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📍</span> Location Details
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem'
                        }}>
                            {[
                                { label: 'State', value: getDisplayLabel(locationDetails?.stateId, states) },
                                { label: 'District', value: getDisplayLabel(locationDetails?.districtId, districts) },
                                { label: 'Block', value: getDisplayLabel(locationDetails?.blockId || locationDetails?.assessmentUnit, blocks) },
                                { label: 'Assessment Unit', value: getDisplayLabel(locationDetails?.blockId, blocks) },
                                { label: 'Geology', value: locationDetails?.geology },
                                { label: 'Coordinates', value: locationDetails?.latitude && locationDetails?.longitude ? `Lat: ${locationDetails.latitude}, Lon: ${locationDetails.longitude}` : null },
                                { label: 'Pincode', value: locationDetails?.pincode }
                            ].map((field, idx) => (
                                <div key={idx} style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</div>
                                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{field.value || 'N/A'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Water Requirement */}
                    <div className="summary-section" style={{ borderLeft: '4px solid #0ea5e9' }}>
                        <div className="summary-section-title">💧 Water Requirement</div>
                        <div className="summary-grid">
                            {application.drinkingDomesticUse?.dailyRequirementPerPerson ? (
                                <>
                                    <div className="summary-field">
                                        <span className="summary-label">Number of Residents</span>
                                        <span className="summary-value">{application.drinkingDomesticUse.numberOfResidents || 0}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">Number of Workers</span>
                                        <span className="summary-value">{application.drinkingDomesticUse.numberOfWorkers || 0}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">Daily Domestic Req. Per Person</span>
                                        <span className="summary-value">{application.drinkingDomesticUse.dailyRequirementPerPerson} Ltrs</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">Domestic / Drinking Total</span>
                                        <span className="summary-value">
                                            {application.drinkingDomesticUse.totalRequirement ||
                                                (((application.drinkingDomesticUse.numberOfResidents || 0) * (application.drinkingDomesticUse.dailyRequirementPerPerson || 135)) + ((application.drinkingDomesticUse.numberOfWorkers || 0) * 45)) / 1000 || 0} m³/day
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="summary-field">
                                        <span className="summary-label">Domestic/Drinking</span>
                                        <span className="summary-value">{application.waterRequirement?.breakup?.domestic || 0} m³/day</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">Industrial Process</span>
                                        <span className="summary-value">{application.waterRequirement?.breakup?.industrial || 0} m³/day</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">Greenbelt/Horticulture</span>
                                        <span className="summary-value">{application.waterRequirement?.breakup?.greenBelt || 0} m³/day</span>
                                    </div>
                                    {application.waterRequirement?.breakup?.other > 0 && (
                                        <div className="summary-field">
                                            <span className="summary-label">Other ({application.waterRequirement?.breakup?.otherDescription || 'N/A'})</span>
                                            <span className="summary-value">{application.waterRequirement?.breakup?.other || 0} m³/day</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="summary-field" style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                                <span className="summary-label" style={{ color: '#0f172a', fontWeight: '600' }}>Total Daily Requirement</span>
                                <span className="summary-value" style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: '700' }}>
                                    {application.waterRequirement?.totalRequirement !== undefined
                                        ? application.waterRequirement.totalRequirement
                                        : (application.drinkingDomesticUse?.totalRequirement || application.waterRequirement?.dailyRequirement || 0)} m³/day
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3B. Hydrogeology & Proposed Extraction */}
                    <div className="summary-section">
                        <div className="summary-section-title">🌍 Hydrogeology & Proposed Extraction</div>
                        <div className="summary-grid">
                            <div className="summary-field">
                                <span className="summary-label">Aquifer Type</span>
                                <span className="summary-value">{application.hydrogeology?.aquiferType || 'N/A'}</span>
                            </div>
                            <div className="summary-field">
                                <span className="summary-label">Water Quality</span>
                                <span className="summary-value">{application.hydrogeology?.waterQualityType || 'N/A'}</span>
                            </div>
                            <div className="summary-field">
                                <span className="summary-label">Proposed Borewells</span>
                                <span className="summary-value">{application.waterRequirement?.proposedExtraction?.numberOfBorewells || 0}</span>
                            </div>
                            <div className="summary-field">
                                <span className="summary-label">Proposed Tubewells</span>
                                <span className="summary-value">{application.waterRequirement?.proposedExtraction?.numberOfTubewells || 0}</span>
                            </div>
                            <div className="summary-field">
                                <span className="summary-label">Proposed Dugwells</span>
                                <span className="summary-value">{application.waterRequirement?.proposedExtraction?.numberOfDugwells || 0}</span>
                            </div>
                            <div className="summary-field">
                                <span className="summary-label">Total Proposed Extraction</span>
                                <span className="summary-value">{application.waterRequirement?.proposedExtraction?.totalDailyExtraction || 0} m³/day</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Ground Water Structures */}
                    {groundWaterStructures && groundWaterStructures.length > 0 && (
                        <div className="summary-section">
                            <div className="summary-section-title">🏗️ Existing Ground Water Structures</div>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {groundWaterStructures.map((struct, idx) => (
                                    <div key={idx} style={{
                                        padding: '12px',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                                            {struct.structureType} ({struct.category})
                                        </div>
                                        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                            <div className="summary-field">
                                                <span className="summary-label">Year</span>
                                                <span className="summary-value">{struct.yearOfConstruction || 'N/A'}</span>
                                            </div>
                                            <div className="summary-field">
                                                <span className="summary-label">Depth</span>
                                                <span className="summary-value">{struct.depth} m</span>
                                            </div>
                                            <div className="summary-field">
                                                <span className="summary-label">Pump</span>
                                                <span className="summary-value">{struct.pumpDetails?.pumpType || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 5. Documents with Enhanced Styling and View/Download */}
                    {documents && documents.length > 0 && (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.75rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#1e293b',
                                marginBottom: '1.5rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '3px solid #f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📄</span> Uploaded Documents
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {documents.map((doc, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem',
                                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid #fde68a',
                                        transition: 'all 0.2s ease',
                                        cursor: 'default'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: '600',
                                                color: '#0f172a',
                                                fontSize: '1.05rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {doc.documentType || 'Document'}
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#d97706',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <span>📎</span>
                                                {doc.fileName || doc.documentId || 'Unknown file'}
                                            </div>

                                            {/* AI Verification Status for Applicant */}
                                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {verifyingDocs[doc.documentId || doc._id] ? (
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: '#0369a1',
                                                        background: '#e0f2fe',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '4px',
                                                        border: '1px solid #bae6fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        <span className="sc-spinner">🔄</span> Verifying...
                                                    </span>
                                                ) : doc.verification?.ai ? (
                                                    <>
                                                        {doc.verification.ai.verified ? (
                                                            <span style={{ fontSize: '0.75rem', color: '#166534', background: '#dcfce7', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                                                ✅ AI Verified
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: '#991b1b', background: '#fee2e2', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid #fecaca' }}>
                                                                ⚠️ Verification Failed
                                                            </span>
                                                        )}
                                                        {doc.verification.ai.confidence && (
                                                            <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                                                                Confidence: {(doc.verification.ai.confidence * 100).toFixed(1)}%
                                                            </span>
                                                        )}
                                                        {doc.verification.ai.remarks && (
                                                            <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
                                                                "{doc.verification.ai.remarks}"
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid #fde68a' }}>
                                                        ⌛ Pending AI Verification
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            {false && ( // Hidden - handled above now
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.35rem 0.75rem',
                                                    background: '#dcfce7',
                                                    color: '#166534',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    border: '1px solid #bbf7d0'
                                                }}>
                                                    ✓ AI Verified
                                                </span>
                                            )}
                                            <button
                                                style={{
                                                    padding: '0.65rem 1.5rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                                onClick={() => {
                                                    const docUrl = nocApplicationService.getDocumentUrl(doc.documentId || doc._id);
                                                    window.open(docUrl, '_blank');
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                }}
                                            >
                                                👁️ View Document
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. Fee Details */}
                    {status !== 'DRAFT' && feeDetails && (
                        <div className="summary-section" style={{ borderLeft: '4px solid #10b981' }}>
                            <div className="summary-section-title">💳 Payment & Fee Information</div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">Base Fee</span>
                                    <span className="summary-value">₹{feeDetails.baseFee || feeDetails.baseAmount || 1000}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">GST ({feeDetails.gstRate || 18}%)</span>
                                    <span className="summary-value">₹{feeDetails.gstAmount || Math.round((feeDetails.baseFee || feeDetails.baseAmount || 1000) * 0.18)}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Total Amount</span>
                                    <span className="summary-value" style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '700' }}>
                                        ₹{feeDetails.totalAmount || ((feeDetails.baseFee || feeDetails.baseAmount || 1000) + Math.round((feeDetails.baseFee || feeDetails.baseAmount || 1000) * 0.18))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bhuneer-form-actions" style={{ marginTop: '2rem' }}>
                        <button className="bhuneer-secondary-btn" onClick={() => navigate('/noc/dashboard')}>
                            ← Back to Dashboard
                        </button>
                        {status === 'DRAFT' && (
                            <button className="bhuneer-submit-btn" onClick={() => navigate(`/noc/application?id=${id}`)}>
                                ✏️ Edit Application
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </LayoutWithSidebar>
    );
};

export default ApplicationDetail;
