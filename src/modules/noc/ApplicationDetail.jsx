import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../components/SkeletonLoader';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyingDocs, setVerifyingDocs] = useState({}); // Track which docs are being auto-verified
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const response = await nocApplicationService.getApplication(id);
                if (response.success && response.data) {
                    // The API returns nested data, so we keep it as-is for now
                    // The component will destructure the nested fields correctly
                    setApplication(response.data);
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
            <div className="noc-portal">
                <NOCHeader />
                <div className="main-content">
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
                </div>
                <NOCFooter />
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="noc-portal">
                <NOCHeader />
                <div className="main-content">
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
                </div>
                <NOCFooter />
            </div>
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
        <div className="noc-portal">
            <NOCHeader />
            <div className="main-content">
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
                                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{basicDetails?.applicationTypeName || basicDetails?.applicationType || 'N/A'}</div>
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry Type</div>
                                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>{basicDetails?.sectorType || projectDetails?.industryType || 'N/A'}</div>
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
                                    { label: 'District', value: locationDetails?.districtId },
                                    { label: 'Block', value: locationDetails?.blockId || locationDetails?.assessmentUnit },
                                    { label: 'Assessment Unit', value: locationDetails?.blockId },
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
                        <div className="summary-section">
                            <div className="summary-section-title">💧 Water Requirement</div>
                            <div className="summary-grid">
                                {waterRequirementBreakup?.map((item, idx) => (
                                    <div key={idx} className="summary-field">
                                        <span className="summary-label">{item.activityType}</span>
                                        <span className="summary-value">{item.quantity || 0} m³/day</span>
                                    </div>
                                ))}
                                <div className="summary-field">
                                    <span className="summary-label">Daily Domestic Req. Per Person</span>
                                    <span className="summary-value">{drinkingDomesticUse?.dailyRequirementPerPerson} Ltrs</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Ground Water Structures */}
                        {groundWaterStructures && groundWaterStructures.length > 0 && (
                            <div className="summary-section">
                                <div className="summary-section-title">🏗️ Ground Water Structures</div>
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
                        {feeDetails && (
                            <div className="summary-section" style={{ borderLeft: '4px solid #10b981' }}>
                                <div className="summary-section-title">💳 Payment & Fee Information</div>
                                <div className="summary-grid">
                                    <div className="summary-field">
                                        <span className="summary-label">Base Fee</span>
                                        <span className="summary-value">₹{feeDetails.baseFee}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">GST ({feeDetails.gstRate}%)</span>
                                        <span className="summary-value">₹{feeDetails.gstAmount}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="summary-label">Total Amount</span>
                                        <span className="summary-value" style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '700' }}>
                                            ₹{feeDetails.totalAmount}
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
            </div>
            <NOCFooter />
        </div>
    );
};

export default ApplicationDetail;
