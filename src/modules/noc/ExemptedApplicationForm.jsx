import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../public/components/PublicHeader'; // Adjust path as needed
import { nocApplicationService } from './services/nocApplicationService';
import ExemptionCertificate from './components/ExemptionCertificate';
import './styles/noc-portal.css'; // Reuse existing styles

const ExemptedApplicationForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize form data from navigation state (if available) or defaults
    const [formData, setFormData] = useState({
        applicationType: 'Agriculture Activities',
        applicationSubType: 'Ground Water Requirement for Agriculture',
        groundWaterUtilizationFor: 'Agricultural draft',
        waterQualityType: 'Fresh Water',
        projectType: 'New Project',
        dateOfCommencement: new Date().toISOString().split('T')[0],

        // Owner Details
        applicantName: '',
        applicantMobile: '',
        applicantEmail: '',
        projectAddress: '',
        state: 'RAJASTHAN',
        district: 'JAIPUR',
        pincode: '',

        // Agricultural Details
        block: '',
        blockCategory: '',
        village: '', // Maps to gramPanchayatName
        plotNo: '', // Maps to landDetailsKhasraNo
        totalLandArea: '', // Maps to landHoldingAreaHectare
        dailyWaterRequirement: '', // Maps to waterRequirementKLD

        // Usage
        drinkingDomestic: false,
        agricultureUse: true,

        ...location.state?.formData // Merge any passed data
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [exemptionId, setExemptionId] = useState(null); // Store exemption ID for authority submission
    const [exemptionResult, setExemptionResult] = useState(location.state?.exemptionResult || {
        exemptionType: 'Agricultural Activities',
        exemptionCode: 'AGR'
    });

    useEffect(() => {
        // Ensure user is authorized or has context
        if (!localStorage.getItem('nocUser')) {
            // navigate('/noc/login'); // Uncomment if auth is strictly required
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Construct payload strictly matching user request
            const payload = {
                applicationType: formData.applicationType,
                applicationSubType: formData.applicationSubType,
                groundWaterRequirementFor: formData.groundWaterUtilizationFor,
                waterQualityType: formData.waterQualityType,
                applicationForBoring: formData.projectType,
                dateOfBoring: formData.dateOfCommencement,
                groundWaterUsage: {
                    drinkingDomestic: formData.drinkingDomestic,
                    agricultureUse: formData.agricultureUse
                },
                ownerDetails: {
                    ownerName: formData.applicantName,
                    ownerPhone: formData.applicantMobile,
                    ownerEmail: formData.applicantEmail,
                    ownerAddress: formData.projectAddress,
                    state: formData.state,
                    district: formData.district,
                    pinCode: formData.pincode
                },
                agriculturalDetails: {
                    state: formData.state,
                    district: formData.district,
                    assessmentUnitBlockTehsil: formData.block || 'Unknown',
                    address: formData.projectAddress,
                    pinCode: formData.pincode,
                    landHoldingAreaHectare: parseFloat(formData.totalLandArea || 0),
                    landDetailsKhasraNo: formData.plotNo,
                    gramPanchayatName: formData.village,
                    waterRequirementKLD: parseFloat(formData.dailyWaterRequirement || 0)
                }
            };

            const response = await nocApplicationService.submitExemption(payload);

            if (response.success) {
                setSubmitSuccess(true);
                // Store the exemption ID from response for authority submission
                setExemptionId(response.data?._id || response.data?.id || response.applicationId);
                setExemptionResult(prev => ({
                    ...prev,
                    certificateNumber: response.applicationId || 'EXP-PENDING' // API returns applicationId
                }));
            } else {
                alert('Submission failed: ' + response.message);
            }
        } catch (error) {
            console.error('Exemption submission error:', error);
            alert('An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitToAuthority = async () => {
        if (!exemptionId) {
            alert('Exemption ID not found. Please submit the application first.');
            return;
        }

        try {
            const response = await nocApplicationService.submitExemptionToAuthority(exemptionId);
            if (response.success) {
                alert('✅ Successfully submitted to SGWA Authority!');
            } else {
                // Display the actual error message from the API
                const errorMsg = response.message || response.error?.message || 'Unknown error occurred';
                alert(`❌ ${errorMsg}`);
            }
        } catch (error) {
            console.error('Submit to authority error:', error);
            // Also try to extract message from error object
            const errorMsg = error.message || 'Error submitting to authority. Please try again.';
            alert(`❌ ${errorMsg}`);
        }
    };

    if (submitSuccess) {
        return (
            <div className="noc-portal">
                <PublicHeader />
                <div className="noc-application-page">
                    <div className="bhuneer-form-container">
                        <div className="noc-alert noc-alert-success" style={{ marginBottom: '20px' }}>
                            ✅ Application Submitted Successfully! Reference ID: {exemptionResult.certificateNumber}
                        </div>
                        <ExemptionCertificate
                            formData={formData}
                            exemptionResult={exemptionResult}
                            onSubmit={handleSubmitToAuthority}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="noc-portal">
            <PublicHeader />
            <div className="noc-application-page">
                <div className="bhuneer-form-container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                        <h1 className="bhuneer-form-title">Exempted NOC Application</h1>
                        <p className="bhuneer-form-subtitle">For Agricultural and Exempted Categories</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Owner Details Section */}
                        <div className="form-section">
                            <h3 className="form-section-header">Owner Details</h3>
                            <div className="noc-form-row two-col">
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Applicant Name</label>
                                    <input
                                        type="text"
                                        name="applicantName"
                                        className="bhuneer-input"
                                        value={formData.applicantName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="applicantMobile"
                                        className="bhuneer-input"
                                        value={formData.applicantMobile}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="noc-form-row two-col">
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Email</label>
                                    <input
                                        type="email"
                                        name="applicantEmail"
                                        className="bhuneer-input"
                                        value={formData.applicantEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Address</label>
                                    <input
                                        type="text"
                                        name="projectAddress"
                                        className="bhuneer-input"
                                        value={formData.projectAddress}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="noc-form-row three-col">
                                <div className="noc-form-group">
                                    <label className="bhuneer-label">State</label>
                                    <input type="text" className="bhuneer-input" value={formData.state} readOnly />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label">District</label>
                                    <input type="text" className="bhuneer-input" value={formData.district} readOnly />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Pin Code</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className="bhuneer-input"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Agricultural / Site Details Section */}
                        <div className="form-section">
                            <h3 className="form-section-header">Site & Agricultural Details</h3>
                            <div className="noc-form-row two-col">
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Block / Tehsil</label>
                                    <input
                                        type="text"
                                        name="block"
                                        className="bhuneer-input"
                                        value={formData.block}
                                        onChange={handleChange}
                                        placeholder="e.g. Amber"
                                        required
                                    />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Village / Gram Panchayat</label>
                                    <input
                                        type="text"
                                        name="village"
                                        className="bhuneer-input"
                                        value={formData.village}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="noc-form-row three-col">
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Khasra No / Plot No</label>
                                    <input
                                        type="text"
                                        name="plotNo"
                                        className="bhuneer-input"
                                        value={formData.plotNo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Land Area (Hectare)</label>
                                    <input
                                        type="number"
                                        name="totalLandArea"
                                        className="bhuneer-input"
                                        value={formData.totalLandArea}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Water Req. (KLD)</label>
                                    <input
                                        type="number"
                                        name="dailyWaterRequirement"
                                        className="bhuneer-input"
                                        value={formData.dailyWaterRequirement}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Usage Details Section */}
                        <div className="form-section">
                            <h3 className="form-section-header">Ground Water Usage</h3>
                            <div className="noc-form-row">
                                <div className="noc-checkbox-group">
                                    <input
                                        type="checkbox"
                                        name="drinkingDomestic"
                                        id="drinkingDomestic"
                                        checked={formData.drinkingDomestic}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="drinkingDomestic">Drinking / Domestic Use</label>
                                </div>
                                <div className="noc-checkbox-group" style={{ marginLeft: '20px' }}>
                                    <input
                                        type="checkbox"
                                        name="agricultureUse"
                                        id="agricultureUse"
                                        checked={formData.agricultureUse}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="agricultureUse">Agriculture Use</label>
                                </div>
                            </div>
                        </div>

                        <div className="noc-form-actions">
                            <button type="submit" className="bhuneer-button-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Exemption Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExemptedApplicationForm;
