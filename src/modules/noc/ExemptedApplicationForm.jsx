import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { nocApplicationService } from './services/nocApplicationService';
import ExemptionCertificate from './components/ExemptionCertificate';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import ProgressSteps from './components/ProgressSteps';
import FormNavigation from './components/FormNavigation';
import './styles/noc-portal.css';

const ExemptedApplicationForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();

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

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [exemptionId, setExemptionId] = useState(null);
    const [exemptionResult, setExemptionResult] = useState(location.state?.exemptionResult || {
        exemptionType: 'Agricultural Activities',
        exemptionCode: 'AGR'
    });

    const formSteps = [
        { id: 1, title: 'Owner Details', description: 'Basic and applicant information' },
        { id: 2, title: 'Project & Site Details', description: 'Location and water requirement' },
        { id: 3, title: 'Usage & Submit', description: 'Profile review and final submission' }
    ];

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

    const handleNext = () => {
        // Basic validation before proceding (you can add more robust validation here)
        if (currentStep === 1) {
            if (!formData.applicantName || !formData.applicantMobile || !formData.applicantEmail || !formData.projectAddress || !formData.pincode) {
                toastWarning('Please fill all required Owner Details before proceeding.');
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.block || !formData.village || !formData.plotNo || !formData.totalLandArea || !formData.dailyWaterRequirement) {
                toastWarning('Please fill all required Project & Site Details before proceeding.');
                return;
            }
            if (parseFloat(formData.dailyWaterRequirement) > 50) {
                toastError('Water requirement must be ≤ 50 KLD for exemption.');
                return;
            }
        }

        if (currentStep < formSteps.length) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleStepClick = (stepId) => {
        // Optional: allow direct click navigation if steps are filled
        if (stepId < currentStep) {
            setCurrentStep(stepId);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Final Validation inside step 3
        if (!formData.drinkingDomestic && !formData.agricultureUse) {
            toastWarning('Please select at least one Ground Water Usage Profile.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Construct payload strictly matching backend requirements
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
                // Store the exemption ID
                setExemptionId(response.data?._id || response.data?.id || response.applicationId);
                setExemptionResult(prev => ({
                    ...prev,
                    certificateNumber: response.applicationId || 'EXP-PENDING'
                }));
                window.scrollTo(0, 0);
            } else {
                toastError('Submission failed: ' + response.message);
            }
        } catch (error) {
            console.error('Exemption submission error:', error);
            toastError('An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitToAuthority = async () => {
        if (!exemptionId) {
            toastWarning('Exemption ID not found. Please submit the application first.');
            return;
        }

        try {
            const response = await nocApplicationService.submitExemptionToAuthority(exemptionId);
            if (response.success) {
                toastSuccess('Successfully submitted to SGWA Authority!');
            } else {
                const errorMsg = response.message || response.error?.message || 'Unknown error occurred';
                toastError(errorMsg);
            }
        } catch (error) {
            console.error('Submit to authority error:', error);
            const errorMsg = error.message || 'Error submitting to authority. Please try again.';
            toastError(errorMsg);
        }
    };

    if (submitSuccess) {
        return (
            <LayoutWithSidebar defaultCollapsed={true} showSidebar={true}>
                <div className="noc-application-container">
                    <div className="noc-alert noc-alert-success" style={{ marginBottom: '20px' }}>
                        ✅ Application Submitted Successfully! Reference ID: {exemptionResult.certificateNumber}
                    </div>
                    <ExemptionCertificate
                        formData={formData}
                        exemptionResult={exemptionResult}
                        onSubmit={handleSubmitToAuthority}
                    />
                </div>
            </LayoutWithSidebar>
        );
    }

    return (
        <LayoutWithSidebar defaultCollapsed={true} showSidebar={true}>
            <div className="">
                <div className="content-container">
                    {/* Form Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)', marginTop: '60px' }}>
                        <h1 className="card-title">Exempted NOC Application</h1>
                    </div>

                    <ProgressSteps
                        steps={formSteps}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                    />

                    <div className="noc-form-content">
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

                            {/* Step 1: Owner Details */}
                            {currentStep === 1 && (
                                <div>
                                    <h3 className="form-section-header">Owner Details</h3>

                                    <div className="noc-form-row two-col">
                                        <div className="noc-form-group">
                                            <label className="form-label required">Applicant Name</label>
                                            <input
                                                type="text"
                                                name="applicantName"
                                                className="form-input"
                                                value={formData.applicantName}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label required">Mobile Number</label>
                                            <input
                                                type="tel"
                                                name="applicantMobile"
                                                className="form-input"
                                                value={formData.applicantMobile}
                                                onChange={handleChange}
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="noc-form-row two-col">
                                        <div className="noc-form-group">
                                            <label className="form-label required">Email Address</label>
                                            <input
                                                type="email"
                                                name="applicantEmail"
                                                className="form-input"
                                                value={formData.applicantEmail}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label required">Complete Address</label>
                                            <input
                                                type="text"
                                                name="projectAddress"
                                                className="form-input"
                                                value={formData.projectAddress}
                                                onChange={handleChange}
                                                placeholder="House No, Street, Landmark"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="noc-form-row three-col">
                                        <div className="noc-form-group">
                                            <label className="form-label">State</label>
                                            <input type="text" className="form-input" style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} value={formData.state} readOnly />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label">District</label>
                                            <input type="text" className="form-input" style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} value={formData.district} readOnly />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label required">Pin Code</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                className="form-input"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                placeholder="6-digit PIN"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Project & Site Details */}
                            {currentStep === 2 && (
                                <div>
                                    <h3 className="form-section-header">Project & Site Details</h3>

                                    <div className="noc-form-row two-col">
                                        <div className="noc-form-group">
                                            <label className="form-label required">Block / Tehsil</label>
                                            <input
                                                type="text"
                                                name="block"
                                                className="form-input"
                                                value={formData.block}
                                                onChange={handleChange}
                                                placeholder="e.g. Amber"
                                                required
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label required">Village / Gram Panchayat</label>
                                            <input
                                                type="text"
                                                name="village"
                                                className="form-input"
                                                value={formData.village}
                                                onChange={handleChange}
                                                placeholder="Enter village name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="noc-form-row three-col">
                                        <div className="noc-form-group">
                                            <label className="form-label required">Khasra No / Plot No</label>
                                            <input
                                                type="text"
                                                name="plotNo"
                                                className="form-input"
                                                value={formData.plotNo}
                                                onChange={handleChange}
                                                placeholder="Plot details"
                                                required
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label required">Land Area (Hectare)</label>
                                            <input
                                                type="number"
                                                name="totalLandArea"
                                                className="form-input"
                                                value={formData.totalLandArea}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="form-label required">Water Req. (KLD)</label>
                                            <input
                                                type="number"
                                                name="dailyWaterRequirement"
                                                className="form-input"
                                                value={formData.dailyWaterRequirement}
                                                onChange={handleChange}
                                                placeholder="Max 50 for Exemption"
                                                required
                                            />
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', margin: 0 }}>Must be ≤ 50 KLD</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Ground Water Usage & Submission */}
                            {currentStep === 3 && (
                                <div>
                                    <h3 className="form-section-header">Ground Water Usage Profile</h3>

                                    <div className="noc-form-group">
                                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', padding: '10px 0' }}>
                                            <div className="noc-checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id="drinkingDomestic"
                                                    name="drinkingDomestic"
                                                    checked={formData.drinkingDomestic}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="drinkingDomestic">Drinking / Domestic Use</label>
                                            </div>

                                            <div className="noc-checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id="agricultureUse"
                                                    name="agricultureUse"
                                                    checked={formData.agricultureUse}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="agricultureUse">{exemptionResult?.exemptionType || formData.applicationType || 'Exempted Purpose'} Use</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Overview */}
                                    <div className="noc-card" style={{ marginTop: '30px' }}>
                                        <div className="noc-card-header">Application Overview</div>
                                        <div className="noc-card-body">
                                            <div className="noc-form-row two-col">
                                                <div><strong>Name:</strong> {formData.applicantName || 'Not provided'}</div>
                                                <div><strong>Water Req:</strong> {formData.dailyWaterRequirement || '0'} KLD</div>
                                                <div><strong>Village:</strong> {formData.village || 'Not provided'}</div>
                                                <div><strong>Purpose:</strong> {formData.agricultureUse ? (exemptionResult?.exemptionType || formData.applicationType || 'Exempted Purpose') : 'Other'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="noc-alert noc-alert-info" style={{ marginTop: '20px' }}>
                                        <strong>ℹ️ Ready to Submit:</strong> Please review all the above information carefully.
                                        Once submitted, you will receive an Exemption Certificate instantly if eligible.
                                    </div>
                                </div>
                            )}

                            <FormNavigation
                                currentStep={currentStep}
                                totalSteps={formSteps.length}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onSubmit={handleSubmit}
                                isLastStep={currentStep === formSteps.length}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </LayoutWithSidebar>
    );
};

export default ExemptedApplicationForm;
