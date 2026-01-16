import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';
import './styles/noc-certificate.css';

const ApplicationSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // In real app, get data from form context or state management
    const applicationData = {
        // Step 1: NOC Type
        nocType: 'Fresh NOC',
        purposeType: 'Industrial',

        // Step 2: Area Type & Block Details
        areaType: 'Safe',
        district: 'Jaipur',
        block: 'Sanganer',
        tehsil: 'Sanganer',
        blockCategory: 'Safe',

        // Step 3: Applicant Details
        applicantType: 'Company',
        companyName: 'ABC Industries Pvt Ltd',
        ownerName: 'Rajesh Kumar Sharma',
        fatherName: 'Mohan Lal Sharma',
        email: 'rajesh.sharma@abcindustries.com',
        mobile: '+91 9876543210',
        aadharNumber: 'XXXX-XXXX-1234',

        // Step 4: Communication Address
        address: 'Plot No. 123, RIICO Industrial Area',
        city: 'Jaipur',
        pincode: '302029',

        // Step 5: Project Details
        projectName: 'Textile Manufacturing Unit',
        projectType: 'Manufacturing',
        industryType: 'Textile',
        plotArea: '5000 sq.m',
        builtUpArea: '3500 sq.m',

        // Step 6: Water Requirement
        dailyRequirement: '150.25 m³/day',
        annualRequirement: '54,841.25 m³/year',
        sourceType: 'Borewell',
        numberOfBorewells: '2',
        depthOfBorewells: '150 meters',

        // Step 7: Documents
        documentsUploaded: 10,

        // Step 8: Fee Calculation
        applicationFee: '₹21,600',
        gstAmount: '₹3,888',
        totalFee: '₹25,488',

        // Step 9: Payment
        paymentMode: 'Online',
        transactionId: 'TXN123456789',
        paymentDate: '09-Jan-2026'
    };

    const handleSubmitApplication = async () => {
        if (!agreedToDeclaration) {
            alert('Please agree to the declaration before submitting');
            return;
        }

        setSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            alert('Application submitted successfully! Application ID: NOC-2026-001234');
            navigate('/noc/dashboard');
        }, 2000);
    };

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
                                    <span className="summary-value">{applicationData.nocType}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Purpose Type</span>
                                    <span className="summary-value">{applicationData.purposeType}</span>
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
                                    <span className="summary-value">{applicationData.district}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Block</span>
                                    <span className="summary-value">{applicationData.block}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Tehsil</span>
                                    <span className="summary-value">{applicationData.tehsil}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Block Category</span>
                                    <span className="summary-value">{applicationData.blockCategory}</span>
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
                                    <span className="summary-label">Company Name</span>
                                    <span className="summary-value">{applicationData.companyName}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Owner Name</span>
                                    <span className="summary-value">{applicationData.ownerName}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Email</span>
                                    <span className="summary-value">{applicationData.email}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Mobile</span>
                                    <span className="summary-value">{applicationData.mobile}</span>
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
                                    <span className="summary-value">{applicationData.projectName}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Industry Type</span>
                                    <span className="summary-value">{applicationData.industryType}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Plot Area</span>
                                    <span className="summary-value">{applicationData.plotArea}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Built-up Area</span>
                                    <span className="summary-value">{applicationData.builtUpArea}</span>
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
                                    <span className="summary-value">{applicationData.dailyRequirement}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Annual Requirement</span>
                                    <span className="summary-value">{applicationData.annualRequirement}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Source Type</span>
                                    <span className="summary-value">{applicationData.sourceType}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Number of Borewells</span>
                                    <span className="summary-value">{applicationData.numberOfBorewells}</span>
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
                                <span className="summary-value">{applicationData.documentsUploaded} documents uploaded successfully</span>
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
                                    <span className="summary-value">{applicationData.applicationFee}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">GST (18%)</span>
                                    <span className="summary-value">{applicationData.gstAmount}</span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Total Amount Paid</span>
                                    <span className="summary-value" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                                        {applicationData.totalFee}
                                    </span>
                                </div>
                                <div className="summary-field">
                                    <span className="summary-label">Payment Status</span>
                                    <span className="summary-value">
                                        <span className="status-badge success">✅ Paid</span>
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
