import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import BackButton from '../../components/BackButton';
import nocApplicationService from './services/nocApplicationService';
import './styles/noc-portal.css';
import './styles/noc-certificate.css';

const ApplicationSummary = () => {
    const navigate = useNavigate();
    const { success: toastSuccess, warning: toastWarning } = useToast();
    const [searchParams] = useSearchParams();
    const appId = searchParams.get('id') || searchParams.get('appId');
    const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(!!appId);
    const [application, setApplication] = useState(null);

    useEffect(() => {
        if (appId) {
            fetchApplicationData();
        }
    }, [appId]);

    const fetchApplicationData = async () => {
        try {
            setLoading(true);
            const response = await nocApplicationService.getApplication(appId);
            if (response.success) {
                setApplication(response.data);
            } else {
                toastWarning('Failed to load application data');
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            toastWarning('Error loading application data');
        } finally {
            setLoading(false);
        }
    };

    // In real app, get data from form context or state management
    const handleSubmitApplication = async () => {
        if (!agreedToDeclaration) {
            toastWarning('Please agree to the declaration before submitting');
            return;
        }

        if (!appId) {
            toastWarning('Invalid application ID');
            return;
        }

        setSubmitting(true);
        try {
            const response = await nocApplicationService.submitApplication(appId);
            if (response.success) {
                toastSuccess('Application submitted successfully!');
                navigate('/noc/dashboard');
            } else {
                toastWarning(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            toastWarning('Error submitting application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="noc-portal">
                <NOCHeader />
                <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading application data...</p>
                </div>
                <NOCFooter />
            </div>
        );
    }

    if (!application && appId) {
        return (
            <div className="noc-portal">
                <NOCHeader />
                <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>⚠️ Application Not Found</h2>
                    <p>We couldn't find the application you're looking for.</p>
                    <button onClick={() => navigate('/noc/dashboard')} className="bhuneer-primary-btn">Back to Dashboard</button>
                </div>
                <NOCFooter />
            </div>
        );
    }

    // Use fetched application data or fallback to a dummy structure for visual reference if needed
    const data = application || {};

    const handleEditSection = (step) => {
        // Navigate back to specific step to edit
        navigate(`/noc/application?step=${step}`);
    };

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="main-content">
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    <BackButton />
                    {/* Page Title */}
                    <div className="page-title-section">
                        <h1 className="page-main-title">📋 Application Summary</h1>
                        <p className="page-subtitle">Review all your details before final submission</p>
                    </div>

                    <div className="application-summary-container">
                        {/* NOC Type Section */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                📝 NOC Type Information
                                <button className="bhuneer-secondary-btn" style={{ marginLeft: 'auto', fontSize: '0.875rem' }} onClick={() => handleEditSection(1)}>
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">NOC Type</span>
                                    <span className="summary-value">{data.applicationType || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Purpose Type</span>
                                    <span className="summary-value">{data.applicationSubType || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Area & Block Details */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                🗺️ Area & Block Details
                                <button className="bhuneer-secondary-btn" style={{ marginLeft: 'auto', fontSize: '0.875rem' }} onClick={() => handleEditSection(2)}>
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">District</span>
                                    <span className="summary-value">{data.locationDetails?.districtId || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Block</span>
                                    <span className="summary-value">{data.locationDetails?.blockId || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Tehsil</span>
                                    <span className="summary-value">{data.locationDetails?.tehsil || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Block Category</span>
                                    <span className="summary-value">{data.blockCategory?.name || 'Safe'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Applicant Details */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                👤 Applicant Details
                                <button className="bhuneer-secondary-btn" style={{ marginLeft: 'auto', fontSize: '0.875rem' }} onClick={() => handleEditSection(3)}>
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">Organization Name</span>
                                    <span className="summary-value">{data.organizationName || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Applicant Name</span>
                                    <span className="summary-value">{data.applicantName || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Email</span>
                                    <span className="summary-value">{data.applicantEmail || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Mobile</span>
                                    <span className="summary-value">{data.applicantMobile || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                🏭 Project Details
                                <button className="bhuneer-secondary-btn" style={{ marginLeft: 'auto', fontSize: '0.875rem' }} onClick={() => handleEditSection(5)}>
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">Project Name</span>
                                    <span className="summary-value">{data.projectName || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Industry Type</span>
                                    <span className="summary-value">{data.industryType || 'N/A'}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Total Land Area</span>
                                    <span className="summary-value">{data.landUseTotalArea || 0} sq.m</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Aquifer Type</span>
                                    <span className="summary-value">{data.hydrogeology?.aquiferType || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Water Requirement */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                💧 Water Requirement
                                <button className="bhuneer-secondary-btn" style={{ marginLeft: 'auto', fontSize: '0.875rem' }} onClick={() => handleEditSection(5)}>
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">Daily Requirement</span>
                                    <span className="summary-value">{data.waterRequirement?.dailyRequirement || 0} m³/day</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Annual Requirement</span>
                                    <span className="summary-value">{data.waterRequirement?.annualRequirement || 0} m³/year</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Proposed Borewells</span>
                                    <span className="summary-value">{data.waterRequirement?.proposedExtraction?.numberOfBorewells || 0}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Proposed Tubewells</span>
                                    <span className="summary-value">{data.waterRequirement?.proposedExtraction?.numberOfTubewells || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                📄 Documents Uploaded
                                <button className="bhuneer-secondary-btn" style={{ marginLeft: 'auto', fontSize: '0.875rem' }} onClick={() => handleEditSection(7)}>
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="summary-field">
                                <span className="summary-label">Total Documents</span>
                                <span className="summary-value">{data.documents?.length || 0} documents uploaded successfully</span>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="summary-section">
                            <div className="summary-section-title">
                                💳 Payment Details
                            </div>
                            <div className="summary-grid">
                                <div className="summary-field">
                                    <span className="summary-label">Application Fee</span>
                                    <span className="summary-value">₹{(data.fees?.applicationFee || 0).toLocaleString()}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">GST (18%)</span>
                                    <span className="summary-value">₹{(data.fees?.gstAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Total Amount Paid</span>
                                    <span className="summary-value" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                                        ₹{(data.fees?.totalAmount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Payment Status</span>
                                    <span className="summary-value">
                                        <span className={`status-badge ${data.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                                            {data.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Declaration */}
                        <div className="summary-declaration">
                            <h3 style={{ color: '#0c4a6e', marginBottom: '1rem' }}>📜 Declaration</h3>
                            <p className="summary-declaration-text">
                                I hereby declare that all the information provided by me in this application is true and correct
                                to the best of my knowledge and belief. I understand that if any information is found to be false
                                or misleading, my application may be rejected and/or the issued NOC may be cancelled. I also
                                undertake to comply with all the conditions specified by the State Groundwater Authority and to
                                adhere to all applicable laws and regulations related to groundwater extraction.
                            </p>

                            <div className="summary-checkbox-group">
                                <label className="summary-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={agreedToDeclaration}
                                        onChange={(e) => setAgreedToDeclaration(e.target.checked)}
                                    />
                                    <strong>I agree to the above declaration and confirm that all information provided is accurate.</strong>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bhuneer-form-actions" style={{ marginTop: '2rem' }}>
                            <button
                                type="button"
                                className="bhuneer-secondary-btn"
                                onClick={() => navigate(-1)}
                            >
                                ← Previous Step
                            </button>

                            <button
                                className="bhuneer-submit-btn"
                                onClick={handleSubmitApplication}
                                disabled={!agreedToDeclaration || submitting}
                                style={{
                                    opacity: !agreedToDeclaration || submitting ? 0.5 : 1,
                                    cursor: !agreedToDeclaration || submitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? '⏳ Submitting...' : '✅ Submit Application'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default ApplicationSummary;
