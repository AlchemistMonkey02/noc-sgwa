import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import ProgressSteps from './components/ProgressSteps';
import FormNavigation from './components/FormNavigation';
import PaymentModule from './components/PaymentModule';
import PiezometerRequirements from './components/PiezometerRequirements';
import FlowMeterCompliance from './components/FlowMeterCompliance';
import { checkExemption, getExemptionDisplayConfig } from './utils/exemptionRules';
import { getDistricts, getBlocksForDistrict, getBlockCategory, checkBlockEligibility } from './utils/blockClassification';
import { getIndustryDropdownOptions, getMiningDropdownOptions, getOtherProjectDropdownOptions, isPollutingIndustry, isPackagedWaterIndustry } from './utils/industryClassification';
import { initialFormData, formSteps, applicationTypes, applicationSubTypes, projectTypes, waterQualityTypes, groundWaterUtilization, msmeTypes, states, geologyTypes, structureTypes, documentTypes } from './utils/formData';
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateFileSize, validateFileType } from './utils/formValidation';
import { TRANSITION_CONFIG } from '../../config/transitionRules';
import LegalDisclaimer from '../../components/LegalDisclaimer';
import './styles/noc-portal.css';

const NOCApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [existingStructures, setExistingStructures] = useState([]);

    // Phase  1: Block Classification State
    const [availableBlocks, setAvailableBlocks] = useState([]);
    const [blockCategory, setBlockCategory] = useState(null);
    const [exemptionStatus, setExemptionStatus] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('nocUser');
        if (!userData) {
            navigate('/noc/login');
        }
    }, [navigate]);

    // Phase 1: Comprehensive Exemption Check (replaces old MSME-only check)
    useEffect(() => {
        if (formData.isMSME || formData.groundWaterUtilizationFor || formData.dailyWaterRequirement || formData.organizationType) {
            const exemption = checkExemption(formData);
            setExemptionStatus(exemption);

            if (exemption.isExempt) {
                setFormData(prev => ({
                    ...prev,
                    isExempt: true,
                    exemptionType: exemption.exemptionType,
                    exemptionCode: exemption.exemptionCode,
                    isExemptMSME: exemption.exemptionCode === 'MSME_SM' // Keep for backward compatibility
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    isExempt: false,
                    exemptionType: null,
                    exemptionCode: null
                }));
            }
        }
    }, [formData.isMSME, formData.msmeType, formData.dailyWaterRequirement, formData.groundWaterUtilizationFor, formData.organizationType, formData.applicationType]);



    // Phase 1: Load districts and blocks based on state selection

    useEffect(() => {

        if (formData.state) {

            const districts = getDistricts(formData.state);

            // For now, we'll use a simple implementation

            // In production, this would fetch from blockClassification.js

        }

    }, [formData.state]);



    // Phase 1: Load blocks when district changes

    useEffect(() => {

        if (formData.district) {

            const blocks = getBlocksForDistrict(formData.state, formData.district);

            setAvailableBlocks(blocks);

        }

    }, [formData.district, formData.state]);



    // Phase 1: Check block category and eligibility
    useEffect(() => {
        if (formData.district && formData.block) {
            const category = getBlockCategory(formData.district, formData.block);
            setBlockCategory(category);

            // Check eligibility based on block category and project details
            if (category) {
                // Rule: Strictly Ban Packaged Water in Over-Exploited Blocks (from Transition Config)
                const isOE = category.code === 'OVER_EXPLOITED';
                const industryType = formData.industryType || '';
                const isPackagedWater = industryType.includes('Packaged') || industryType.includes('Mineral Water');

                if (isOE && isPackagedWater) {
                    setFormData(prev => ({
                        ...prev,
                        blockEligibilityWarning: '❌ CRITICAL: Packaged Drinking Water / Mineral Water industries are STRICTLY PROHIBITED in Over-Exploited blocks as per 2025 Act Interim Directions. Application will be Auto-Rejected.'
                    }));
                    return;
                }

                const projectDetails = {
                    industryType: formData.industryType,
                    dailyWaterRequirement: parseFloat(formData.dailyWaterRequirement) || 0
                };

                const eligibility = checkBlockEligibility(
                    formData.district,
                    formData.block,
                    projectDetails
                );

                if (!eligibility.allowed) {
                    // Show warning but don't block application (officer will review)
                    console.warn('Block eligibility warning:', eligibility.reason);
                    setFormData(prev => ({
                        ...prev,
                        blockEligibilityWarning: eligibility.reason
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        blockEligibilityWarning: null
                    }));
                }
            }
        } else {
            setBlockCategory(null);
        }
    }, [formData.block, formData.district, formData.industryType, formData.dailyWaterRequirement]);



    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileUpload = (docId, file) => {
        if (!validateFileSize(file)) {
            setErrors(prev => ({
                ...prev,
                [docId]: 'File size must be less than 5MB'
            }));
            return;
        }

        if (!validateFileType(file)) {
            setErrors(prev => ({
                ...prev,
                [docId]: 'Only PDF, JPEG, and PNG files are allowed'
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            uploadedDocuments: {
                ...prev.uploadedDocuments,
                [docId]: file
            }
        }));

        setErrors(prev => ({
            ...prev,
            [docId]: ''
        }));
    };

    const addExistingStructure = () => {
        setExistingStructures([...existingStructures, {
            id: Date.now(),
            type: '',
            yearOfConstruction: '',
            depth: '',
            diameter: '',
            depthToWaterLevel: '',
            discharge: '',
            hasMeter: 'No'
        }]);
    };

    const removeExistingStructure = (id) => {
        setExistingStructures(existingStructures.filter(s => s.id !== id));
    };

    const updateExistingStructure = (id, field, value) => {
        setExistingStructures(existingStructures.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const validateCurrentStep = () => {
        let stepErrors = {};

        switch (currentStep) {
            case 1:
                stepErrors = validateStep1(formData);
                break;
            case 2:
                stepErrors = validateStep2(formData);
                break;
            case 3:
                stepErrors = validateStep3(formData);
                break;
            case 4:
                stepErrors = validateStep4(formData);
                break;
            case 5:
                stepErrors = validateStep5(formData);
                break;
            case 6:
                stepErrors = validateStep6(formData);
                break;
            case 7:
                // Step 7 validation will be handled separately for documents
                stepErrors = {};
                break;
            default:
                break;
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = () => {
        // Check if payment receipt is uploaded
        if (!formData.uploadedDocuments.paymentReceipt) {
            setErrors({ paymentReceipt: 'Payment receipt is required before submission' });
            return;
        }

        if (validateCurrentStep()) {
            const applicationData = {
                ...formData,
                existingStructures,
                submittedDate: new Date().toISOString(),
                applicationId: 'NOC' + Date.now()
            };

            console.log('Application submitted:', applicationData);

            alert('Application submitted successfully! Application ID: ' + applicationData.applicationId);
            navigate('/noc/dashboard');
        }
    };

    const handlePaymentComplete = (paymentDetails) => {
        setFormData(prev => ({
            ...prev,
            applicationFee: paymentDetails.baseFee,
            gstAmount: paymentDetails.gstAmount,
            totalAmount: paymentDetails.totalAmount,
            paymentStatus: paymentDetails.paymentStatus,
            paymentTransactionId: paymentDetails.transactionId,
            paymentDate: paymentDetails.date,
            paymentReceiptNumber: paymentDetails.receiptNumber,
            paymentMethod: paymentDetails.method
        }));
    };

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-application-wrapper">
                    {/* Form Header */}
                    <div className="noc-form-header">
                        <h2>NOC Application Form</h2>
                        <p>Application for Groundwater Abstraction - Central Ground Water Authority</p>
                    </div>

                    {/* Progress Steps */}
                    <ProgressSteps steps={formSteps} currentStep={currentStep} />

                    {/* Form Content */}
                    <div className="noc-form-content">
                        {/* Step 1: Application Type Details */}
                        {currentStep === 1 && (
                            <div>
                                <h3 className="noc-section-title">Application Type Details</h3>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Application Type</label>
                                        <select
                                            name="applicationType"
                                            className={`noc-form-control ${errors.applicationType ? 'error' : ''}`}
                                            value={formData.applicationType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Application Type</option>
                                            {applicationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors.applicationType && <span className="noc-form-error">{errors.applicationType}</span>}
                                        {formData.applicationType === 'NOC Renewal' && (
                                            <div className="noc-alert noc-alert-warning" style={{ marginTop: '10px' }}>
                                                ⚠️ <strong>Renewal Notice:</strong> Applications must be submitted at least 90 days before expiry. Late applications may attract Environmental Compensation Charges.
                                            </div>
                                        )}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Application Sub Type</label>
                                        <select
                                            name="applicationSubType"
                                            className={`noc-form-control ${errors.applicationSubType ? 'error' : ''}`}
                                            value={formData.applicationSubType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Application Sub Type</option>
                                            {applicationSubTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors.applicationSubType && <span className="noc-form-error">{errors.applicationSubType}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Project Type</label>
                                        <select
                                            name="projectType"
                                            className={`noc-form-control ${errors.projectType ? 'error' : ''}`}
                                            value={formData.projectType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Project Type</option>
                                            {projectTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors.projectType && <span className="noc-form-error">{errors.projectType}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Water Quality Type</label>
                                        <select
                                            name="waterQualityType"
                                            className={`noc-form-control ${errors.waterQualityType ? 'error' : ''}`}
                                            value={formData.waterQualityType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Water Quality Type</option>
                                            {waterQualityTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors.waterQualityType && <span className="noc-form-error">{errors.waterQualityType}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Ground Water Utilization For</label>
                                        <select
                                            name="groundWaterUtilizationFor"
                                            className={`noc-form-control ${errors.groundWaterUtilizationFor ? 'error' : ''}`}
                                            value={formData.groundWaterUtilizationFor}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Utilization Purpose</option>
                                            {groundWaterUtilization.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors.groundWaterUtilizationFor && <span className="noc-form-error">{errors.groundWaterUtilizationFor}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Date of Commencement</label>
                                        <input
                                            type="date"
                                            name="dateOfCommencement"
                                            className={`noc-form-control ${errors.dateOfCommencement ? 'error' : ''}`}
                                            value={formData.dateOfCommencement}
                                            onChange={handleChange}
                                        />
                                        {errors.dateOfCommencement && <span className="noc-form-error">{errors.dateOfCommencement}</span>}
                                    </div>
                                </div>

                                {/* Dynamic Industry/Mining/Other Dropdown */}
                                {formData.groundWaterUtilizationFor === 'Industry' && (
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Industry Type</label>
                                        <select
                                            name="industryType"
                                            className={`noc-form-control ${errors.industryType ? 'error' : ''}`}
                                            value={formData.industryType || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Industry Type</option>
                                            {(() => {
                                                const industryOptions = getIndustryDropdownOptions();
                                                const categories = [...new Set(industryOptions.map(ind => ind.category))];
                                                return categories.map(category => (
                                                    <optgroup key={category} label={category}>
                                                        {industryOptions
                                                            .filter(item => item.category === category)
                                                            .map(item => (
                                                                <option key={item.value} value={item.value}>
                                                                    {item.label} {item.isPolluting ? '(Polluting)' : ''}
                                                                </option>
                                                            ))}
                                                    </optgroup>
                                                ));
                                            })()}
                                        </select>
                                        {errors.industryType && <span className="noc-form-error">{errors.industryType}</span>}
                                        {formData.industryType && isPollutingIndustry(formData.industryType) && (
                                            <div className="noc-alert noc-alert-warning" style={{ marginTop: '10px' }}>
                                                ⚠️ <strong>Polluting Industry:</strong> Additional compliance requirements apply including well-head protection and water quality monitoring.
                                            </div>
                                        )}
                                        {formData.industryType && isPackagedWaterIndustry(formData.industryType) && (
                                            <div className="noc-alert noc-alert-info" style={{ marginTop: '10px' }}>
                                                ℹ️ <strong>Packaged Water:</strong> BIS license and regular product quality testing required.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.groundWaterUtilizationFor === 'Mining' && (
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Mining Type</label>
                                        <select
                                            name="miningType"
                                            className={`noc-form-control ${errors.miningType ? 'error' : ''}`}
                                            value={formData.miningType || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Mining Type</option>
                                            {getMiningDropdownOptions().map(mining => (
                                                <option key={mining.value} value={mining.value}>
                                                    {mining.label} ({mining.category})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.miningType && <span className="noc-form-error">{errors.miningType}</span>}
                                        <div className="noc-alert noc-alert-info" style={{ marginTop: '10px' }}>
                                            ℹ️ <strong>Mining Projects:</strong> Piezometer installation in core and buffer zones is mandatory. Dewatering treatment plan required.
                                        </div>
                                    </div>
                                )}

                                {formData.groundWaterUtilizationFor &&
                                    formData.groundWaterUtilizationFor !== 'Industry' &&
                                    formData.groundWaterUtilizationFor !== 'Mining' &&
                                    formData.groundWaterUtilizationFor !== 'Domestic' && (
                                        <div className="noc-form-group">
                                            <label className="noc-form-label required">Project Category</label>
                                            <select
                                                name="otherProjectType"
                                                className={`noc-form-control ${errors.otherProjectType ? 'error' : ''}`}
                                                value={formData.otherProjectType || ''}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Project Category</option>
                                                {getOtherProjectDropdownOptions().map(project => (
                                                    <option key={project.value} value={project.value}>
                                                        {project.label} ({project.category})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.otherProjectType && <span className="noc-form-error">{errors.otherProjectType}</span>}
                                        </div>
                                    )}

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Existing NOC Status</label>
                                        <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                                            <div className="noc-radio-item">
                                                <input
                                                    type="radio"
                                                    name="existingNOCStatus"
                                                    id="nocYes"
                                                    value="Yes"
                                                    checked={formData.existingNOCStatus === 'Yes'}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="nocYes">Yes</label>
                                            </div>
                                            <div className="noc-radio-item">
                                                <input
                                                    type="radio"
                                                    name="existingNOCStatus"
                                                    id="nocNo"
                                                    value="No"
                                                    checked={formData.existingNOCStatus === 'No'}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="nocNo">No</label>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.existingNOCStatus === 'Yes' && (
                                        <div className="noc-form-group">
                                            <label className="noc-form-label required">Old NOC Number</label>
                                            <input
                                                type="text"
                                                name="oldNOCNo"
                                                className={`noc-form-control ${errors.oldNOCNo ? 'error' : ''}`}
                                                value={formData.oldNOCNo}
                                                onChange={handleChange}
                                                placeholder="Enter old NOC number"
                                            />
                                            {errors.oldNOCNo && <span className="noc-form-error">{errors.oldNOCNo}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Whether Industry is MSME</label>
                                        <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                                            <div className="noc-radio-item">
                                                <input
                                                    type="radio"
                                                    name="isMSME"
                                                    id="msmeYes"
                                                    value="Yes"
                                                    checked={formData.isMSME === 'Yes'}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="msmeYes">Yes</label>
                                            </div>
                                            <div className="noc-radio-item">
                                                <input
                                                    type="radio"
                                                    name="isMSME"
                                                    id="msmeNo"
                                                    value="No"
                                                    checked={formData.isMSME === 'No'}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="msmeNo">No</label>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.isMSME === 'Yes' && (
                                        <div className="noc-form-group">
                                            <label className="noc-form-label required">MSME Type</label>
                                            <select
                                                name="msmeType"
                                                className={`noc-form-control ${errors.msmeType ? 'error' : ''}`}
                                                value={formData.msmeType}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select MSME Type</option>
                                                {msmeTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {errors.msmeType && <span className="noc-form-error">{errors.msmeType}</span>}
                                        </div>
                                    )}
                                </div>

                                {formData.isMSME === 'Yes' && (
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">MSME Registration Number</label>
                                        <input
                                            type="text"
                                            name="msmeRegistrationNumber"
                                            className={`noc-form-control ${errors.msmeRegistrationNumber ? 'error' : ''}`}
                                            value={formData.msmeRegistrationNumber}
                                            onChange={handleChange}
                                            placeholder="Enter MSME/Udyam registration number"
                                        />
                                        {errors.msmeRegistrationNumber && <span className="noc-form-error">{errors.msmeRegistrationNumber}</span>}
                                        <span className="noc-form-help">Enter your valid MSME/Udyam registration number</span>
                                    </div>
                                )}

                                {/* Comprehensive Exemption Banner */}
                                {exemptionStatus?.isExempt && (() => {
                                    const displayConfig = getExemptionDisplayConfig(exemptionStatus);
                                    return (
                                        <div className="noc-exemption-banner">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '2rem' }}>{displayConfig.icon}</span>
                                                <h3 style={{ margin: 0, color: '#155724' }}>{displayConfig.title}</h3>
                                            </div>
                                            <p style={{ marginBottom: '10px' }}>
                                                {exemptionStatus.message || displayConfig.message}
                                            </p>
                                            {displayConfig.details && displayConfig.details.length > 0 && (
                                                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '6px', marginTop: '15px' }}>
                                                    <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>📋 Details:</p>
                                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                        {displayConfig.details.map((detail, idx) => (
                                                            <li key={idx}>{detail}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Step 2: Project & Location Details */}
                        {currentStep === 2 && (
                            <div>
                                <h3 className="noc-section-title">Project & Location Details</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Project Name</label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        className={`noc-form-control ${errors.projectName ? 'error' : ''}`}
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        placeholder="Enter project name"
                                    />
                                    {errors.projectName && <span className="noc-form-error">{errors.projectName}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">State</label>
                                        <select
                                            name="state"
                                            className={`noc-form-control ${errors.state ? 'error' : ''}`}
                                            value={formData.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {errors.state && <span className="noc-form-error">{errors.state}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">District</label>
                                        <select
                                            name="district"
                                            className={`noc-form-control ${errors.district ? 'error' : ''}`}
                                            value={formData.district || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select District</option>
                                            {formData.state && getDistricts(formData.state).map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
                                        {errors.district && <span className="noc-form-error">{errors.district}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Block</label>
                                        <select
                                            name="block"
                                            className={`noc-form-control ${errors.block ? 'error' : ''}`}
                                            value={formData.block || ''}
                                            onChange={handleChange}
                                            disabled={!formData.district}
                                        >
                                            <option value="">Select Block</option>
                                            {availableBlocks.map(block => (
                                                <option key={block} value={block}>{block}</option>
                                            ))}
                                        </select>
                                        {errors.block && <span className="noc-form-error">{errors.block}</span>}
                                        {!formData.district && (
                                            <span className="noc-form-help">Please select a district first</span>
                                        )}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Tehsil</label>
                                        <input
                                            type="text"
                                            name="tehsil"
                                            className="noc-form-control"
                                            value={formData.tehsil}
                                            onChange={handleChange}
                                            placeholder="Enter tehsil"
                                        />
                                    </div>
                                </div>

                                {/* Block Category Display */}
                                {blockCategory && (
                                    <div className="noc-alert" style={{
                                        marginBottom: '20px',
                                        background: blockCategory.color === '#28a745' ? 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)' :
                                            blockCategory.color === '#ffc107' ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)' :
                                                blockCategory.color === '#ff9800' ? 'linear-gradient(135deg, #f8d7da 0%, #fab1a0 100%)' :
                                                    'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                        border: `2px solid ${blockCategory.color}`,
                                        color: '#000'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {blockCategory.code === 'SAFE' ? '✅' :
                                                    blockCategory.code === 'SEMI_CRITICAL' ? '⚠️' :
                                                        blockCategory.code === 'CRITICAL' ? '🚨' : '❌'}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <strong>Block Category: {blockCategory.name}</strong>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                                                    {blockCategory.description}
                                                </p>
                                                {blockCategory.restrictions && blockCategory.restrictions.length > 0 && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <strong>Restrictions:</strong>
                                                        <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                                                            {blockCategory.restrictions.map((restriction, idx) => (
                                                                <li key={idx} style={{ fontSize: '0.9rem' }}>{restriction}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontWeight: '600' }}>
                                                    NOC Validity: {blockCategory.validityYears} years
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Block Eligibility Warning */}
                                {formData.blockEligibilityWarning && (
                                    <div className="noc-alert noc-alert-danger" style={{ marginBottom: '20px' }}>
                                        <strong>⚠️ Restriction Notice:</strong>
                                        <p style={{ margin: '5px 0 0 0' }}>{formData.blockEligibilityWarning}</p>
                                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            This application will be subject to additional scrutiny by the authority.
                                        </p>
                                    </div>
                                )}

                                <div className="noc-form-row">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Assessment Unit</label>
                                        <input
                                            type="text"
                                            name="assessmentUnit"
                                            className={`noc-form-control ${errors.assessmentUnit ? 'error' : ''}`}
                                            value={formData.assessmentUnit}
                                            onChange={handleChange}
                                            placeholder="Enter assessment unit"
                                        />
                                        {errors.assessmentUnit && <span className="noc-form-error">{errors.assessmentUnit}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Relevant Blocks</label>
                                        <input
                                            type="text"
                                            name="relevantBlocks"
                                            className="noc-form-control"
                                            value={formData.relevantBlocks}
                                            onChange={handleChange}
                                            placeholder="Enter relevant blocks"
                                        />
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Tehsil</label>
                                        <input
                                            type="text"
                                            name="tehsil"
                                            className="noc-form-control"
                                            value={formData.tehsil}
                                            onChange={handleChange}
                                            placeholder="Enter tehsil"
                                        />
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Project Address</label>
                                    <textarea
                                        name="projectAddress"
                                        className={`noc-form-control ${errors.projectAddress ? 'error' : ''}`}
                                        value={formData.projectAddress}
                                        onChange={handleChange}
                                        placeholder="Enter complete project address"
                                        rows="3"
                                    />
                                    {errors.projectAddress && <span className="noc-form-error">{errors.projectAddress}</span>}
                                </div>

                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">PIN Code</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className={`noc-form-control ${errors.pincode ? 'error' : ''}`}
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="6-digit pincode"
                                            maxLength="6"
                                        />
                                        {errors.pincode && <span className="noc-form-error">{errors.pincode}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Latitude</label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            className={`noc-form-control ${errors.latitude ? 'error' : ''}`}
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            placeholder="e.g., 28.7041"
                                        />
                                        {errors.latitude && <span className="noc-form-error">{errors.latitude}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Longitude</label>
                                        <input
                                            type="text"
                                            name="longitude"
                                            className={`noc-form-control ${errors.longitude ? 'error' : ''}`}
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            placeholder="e.g., 77.1025"
                                        />
                                        {errors.longitude && <span className="noc-form-error">{errors.longitude}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Geology</label>
                                    <select
                                        name="geology"
                                        className={`noc-form-control ${errors.geology ? 'error' : ''}`}
                                        value={formData.geology}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Geology Type</option>
                                        {geologyTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.geology && <span className="noc-form-error">{errors.geology}</span>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Water Requirement */}
                        {currentStep === 3 && (
                            <div>
                                <h3 className="noc-section-title">Water Requirement Details</h3>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Daily Water Requirement (m³/day)</label>
                                        <input
                                            type="number"
                                            name="dailyWaterRequirement"
                                            className={`noc-form-control ${errors.dailyWaterRequirement ? 'error' : ''}`}
                                            value={formData.dailyWaterRequirement}
                                            onChange={handleChange}
                                            placeholder="Enter daily requirement"
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.dailyWaterRequirement && <span className="noc-form-error">{errors.dailyWaterRequirement}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Annual Water Requirement (m³/year)</label>
                                        <input
                                            type="number"
                                            name="annualWaterRequirement"
                                            className={`noc-form-control ${errors.annualWaterRequirement ? 'error' : ''}`}
                                            value={formData.annualWaterRequirement}
                                            onChange={handleChange}
                                            placeholder="Enter annual requirement"
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.annualWaterRequirement && <span className="noc-form-error">{errors.annualWaterRequirement}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Water Required for Greenbelt (m³/day)</label>
                                        <input
                                            type="number"
                                            name="waterRequiredForGreenbelt"
                                            className="noc-form-control"
                                            value={formData.waterRequiredForGreenbelt}
                                            onChange={handleChange}
                                            placeholder="Enter greenbelt requirement"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Green Belt Area (sq. m)</label>
                                        <input
                                            type="number"
                                            name="greenbeltArea"
                                            className="noc-form-control"
                                            value={formData.greenbeltArea}
                                            onChange={handleChange}
                                            placeholder="Enter greenbelt area"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">Wetland Areas Name (if any)</label>
                                    <input
                                        type="text"
                                        name="wetlandAreasName"
                                        className="noc-form-control"
                                        value={formData.wetlandAreasName}
                                        onChange={handleChange}
                                        placeholder="Enter wetland areas name if applicable"
                                    />
                                    <span className="noc-form-help">Leave blank if project is not near any wetland area</span>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Groundwater Structures */}
                        {currentStep === 4 && (
                            <div>
                                <h3 className="noc-section-title">Groundwater Abstraction Structures</h3>

                                {/* Existing Structures */}
                                <div className="noc-card" style={{ marginBottom: '30px' }}>
                                    <div className="noc-card-header">
                                        Existing Structures
                                        <button
                                            type="button"
                                            onClick={addExistingStructure}
                                            className="noc-btn noc-btn-primary"
                                            style={{ float: 'right', padding: '5px 15px', fontSize: '0.85rem' }}
                                        >
                                            + Add Structure
                                        </button>
                                    </div>
                                    <div className="noc-card-body">
                                        {existingStructures.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: 'var(--cgwa-text-secondary)', padding: '20px' }}>
                                                No existing structures added. Click "Add Structure" to add details.
                                            </p>
                                        ) : (
                                            existingStructures.map((structure, index) => (
                                                <div key={structure.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--cgwa-border-light)', borderRadius: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                        <h4 style={{ margin: 0 }}>Structure #{index + 1}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingStructure(structure.id)}
                                                            className="noc-btn noc-btn-danger"
                                                            style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <div className="noc-form-row three-col">
                                                        <div className="noc-form-group">
                                                            <label className="noc-form-label">Type of Structure</label>
                                                            <select
                                                                className="noc-form-control"
                                                                value={structure.type}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'type', e.target.value)}
                                                            >
                                                                <option value="">Select Type</option>
                                                                {structureTypes.map(type => (
                                                                    <option key={type} value={type}>{type}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="noc-form-group">
                                                            <label className="noc-form-label">Year of Construction</label>
                                                            <input
                                                                type="number"
                                                                className="noc-form-control"
                                                                value={structure.yearOfConstruction}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'yearOfConstruction', e.target.value)}
                                                                placeholder="YYYY"
                                                                min="1900"
                                                                max={new Date().getFullYear()}
                                                            />
                                                        </div>

                                                        <div className="noc-form-group">
                                                            <label className="noc-form-label">Depth (meters)</label>
                                                            <input
                                                                type="number"
                                                                className="noc-form-control"
                                                                value={structure.depth}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'depth', e.target.value)}
                                                                placeholder="Depth in meters"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="noc-form-row three-col">
                                                        <div className="noc-form-group">
                                                            <label className="noc-form-label">Diameter (mm)</label>
                                                            <input
                                                                type="number"
                                                                className="noc-form-control"
                                                                value={structure.diameter}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'diameter', e.target.value)}
                                                                placeholder="Diameter in mm"
                                                                min="0"
                                                            />
                                                        </div>

                                                        <div className="noc-form-group">
                                                            <label className="noc-form-label">Depth to Water Level (m)</label>
                                                            <input
                                                                type="number"
                                                                className="noc-form-control"
                                                                value={structure.depthToWaterLevel}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'depthToWaterLevel', e.target.value)}
                                                                placeholder="Meters below ground"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>

                                                        <div className="noc-form-group">
                                                            <label className="noc-form-label">Discharge (m³/hour)</label>
                                                            <input
                                                                type="number"
                                                                className="noc-form-control"
                                                                value={structure.discharge}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'discharge', e.target.value)}
                                                                placeholder="Discharge rate"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="noc-form-group">
                                                        <label className="noc-form-label">Water Meter Fitted?</label>
                                                        <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                                                            <div className="noc-radio-item">
                                                                <input
                                                                    type="radio"
                                                                    name={`hasMeter_${structure.id}`}
                                                                    value="Yes"
                                                                    checked={structure.hasMeter === 'Yes'}
                                                                    onChange={(e) => updateExistingStructure(structure.id, 'hasMeter', e.target.value)}
                                                                />
                                                                <label>Yes</label>
                                                            </div>
                                                            <div className="noc-radio-item">
                                                                <input
                                                                    type="radio"
                                                                    name={`hasMeter_${structure.id}`}
                                                                    value="No"
                                                                    checked={structure.hasMeter === 'No'}
                                                                    onChange={(e) => updateExistingStructure(structure.id, 'hasMeter', e.target.value)}
                                                                />
                                                                <label>No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Proposed Structures */}
                                <div className="noc-card">
                                    <div className="noc-card-header">Proposed Structures</div>
                                    <div className="noc-card-body">
                                        {errors.proposedStructures && (
                                            <div className="noc-alert noc-alert-danger" style={{ marginBottom: '20px' }}>
                                                {errors.proposedStructures}
                                            </div>
                                        )}

                                        <div className="noc-form-row three-col">
                                            <div className="noc-form-group">
                                                <label className="noc-form-label">Number of Borewells</label>
                                                <input
                                                    type="number"
                                                    name="proposedBorewells"
                                                    className="noc-form-control"
                                                    value={formData.proposedBorewells}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>

                                            <div className="noc-form-group">
                                                <label className="noc-form-label">Number of Tubewells</label>
                                                <input
                                                    type="number"
                                                    name="proposedTubewells"
                                                    className="noc-form-control"
                                                    value={formData.proposedTubewells}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>

                                            <div className="noc-form-group">
                                                <label className="noc-form-label">Number of Dugwells</label>
                                                <input
                                                    type="number"
                                                    name="proposedDugwells"
                                                    className="noc-form-control"
                                                    value={formData.proposedDugwells}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="noc-form-row three-col">
                                            <div className="noc-form-group">
                                                <label className="noc-form-label">Number of Dug cum Borewells</label>
                                                <input
                                                    type="number"
                                                    name="proposedDugCumBorewells"
                                                    className="noc-form-control"
                                                    value={formData.proposedDugCumBorewells}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>

                                            <div className="noc-form-group">
                                                <label className="noc-form-label">Number of Pumps</label>
                                                <input
                                                    type="number"
                                                    name="proposedPumps"
                                                    className="noc-form-control"
                                                    value={formData.proposedPumps}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Applicant Details */}
                        {currentStep === 5 && (
                            <div>
                                <h3 className="noc-section-title">Applicant Details</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Applicant Name</label>
                                    <input
                                        type="text"
                                        name="applicantName"
                                        className={`noc-form-control ${errors.applicantName ? 'error' : ''}`}
                                        value={formData.applicantName}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                    />
                                    {errors.applicantName && <span className="noc-form-error">{errors.applicantName}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Email ID</label>
                                        <input
                                            type="email"
                                            name="applicantEmail"
                                            className={`noc-form-control ${errors.applicantEmail ? 'error' : ''}`}
                                            value={formData.applicantEmail}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.applicantEmail && <span className="noc-form-error">{errors.applicantEmail}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Mobile Number</label>
                                        <input
                                            type="tel"
                                            name="applicantMobile"
                                            className={`noc-form-control ${errors.applicantMobile ? 'error' : ''}`}
                                            value={formData.applicantMobile}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            maxLength="10"
                                        />
                                        {errors.applicantMobile && <span className="noc-form-error">{errors.applicantMobile}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            name="applicantAadhaar"
                                            className={`noc-form-control ${errors.applicantAadhaar ? 'error' : ''}`}
                                            value={formData.applicantAadhaar}
                                            onChange={handleChange}
                                            placeholder="12-digit Aadhaar number"
                                            maxLength="12"
                                        />
                                        {errors.applicantAadhaar && <span className="noc-form-error">{errors.applicantAadhaar}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">PAN Number</label>
                                        <input
                                            type="text"
                                            name="applicantPAN"
                                            className={`noc-form-control ${errors.applicantPAN ? 'error' : ''}`}
                                            value={formData.applicantPAN}
                                            onChange={handleChange}
                                            placeholder="PAN number"
                                            maxLength="10"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                        {errors.applicantPAN && <span className="noc-form-error">{errors.applicantPAN}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Organization Name</label>
                                        <input
                                            type="text"
                                            name="organizationName"
                                            className={`noc-form-control ${errors.organizationName ? 'error' : ''}`}
                                            value={formData.organizationName}
                                            onChange={handleChange}
                                            placeholder="Enter organization name"
                                        />
                                        {errors.organizationName && <span className="noc-form-error">{errors.organizationName}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Organization Type</label>
                                        <select
                                            name="organizationType"
                                            className={`noc-form-control ${errors.organizationType ? 'error' : ''}`}
                                            value={formData.organizationType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Organization Type</option>
                                            <option value="Individual">Individual</option>
                                            <option value="Private Limited">Private Limited Company</option>
                                            <option value="Public Limited">Public Limited Company</option>
                                            <option value="Partnership">Partnership Firm</option>
                                            <option value="Proprietorship">Proprietorship</option>
                                            <option value="Government">Government Organization</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.organizationType && <span className="noc-form-error">{errors.organizationType}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        className="noc-form-control"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Your designation"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 6: Technical Compliance (Piezometer & Flow Meter) */}
                        {currentStep === 6 && (
                            <div>
                                <h3 className="noc-section-title">Technical Compliance Requirements</h3>

                                <div className="noc-alert noc-alert-info" style={{ marginBottom: '30px' }}>
                                    <strong>ℹ️ Compliance Requirements:</strong>
                                    <p style={{ margin: '10px 0 0 0' }}>
                                        As per SGWA regulations, all NOC holders must comply with technical requirements including piezometer installation (if applicable) and digital flow meter with telemetry.
                                    </p>
                                </div>

                                {/* Piezometer Requirements */}
                                <div style={{ marginBottom: '40px' }}>
                                    <h4 style={{
                                        padding: '12px 20px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        marginBottom: '20px'
                                    }}>
                                        1. Piezometer Requirements (Annexure-2)
                                    </h4>
                                    <PiezometerRequirements
                                        formData={formData}
                                        onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
                                    />
                                </div>

                                {/* Flow Meter Compliance */}
                                <div>
                                    <h4 style={{
                                        padding: '12px 20px',
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        marginBottom: '20px'
                                    }}>
                                        2. Digital Flow Meter (MANDATORY for ALL)
                                    </h4>
                                    <FlowMeterCompliance
                                        formData={formData}
                                        onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 7: Document Upload */}
                        {currentStep === 7 && (
                            <div>
                                <h3 className="noc-section-title">Document Upload</h3>

                                <div className="noc-alert noc-alert-info" style={{ marginBottom: '20px' }}>
                                    <strong>Note:</strong> Please upload all required documents in PDF, JPEG, or PNG format. Maximum file size: 5MB per document.
                                </div>

                                {documentTypes.map(doc => (
                                    <div key={doc.id} className="noc-card" style={{ marginBottom: '20px' }}>
                                        <div className="noc-card-header">
                                            {doc.name} {doc.required && <span style={{ color: 'var(--cgwa-danger)' }}>*</span>}
                                        </div>
                                        <div className="noc-card-body">
                                            <p style={{ marginBottom: '15px', color: 'var(--cgwa-text-secondary)' }}>
                                                {doc.description}
                                            </p>

                                            <div className="noc-file-upload">
                                                <input
                                                    type="file"
                                                    id={`file_${doc.id}`}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            handleFileUpload(doc.id, e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`file_${doc.id}`} style={{ cursor: 'pointer' }}>
                                                    <div className="noc-file-upload-icon">📎</div>
                                                    <div className="noc-file-upload-text">
                                                        {formData.uploadedDocuments[doc.id] ? (
                                                            <span style={{ color: 'var(--cgwa-success)', fontWeight: '600' }}>
                                                                ✓ {formData.uploadedDocuments[doc.id].name}
                                                            </span>
                                                        ) : (
                                                            <span>Click to upload or drag and drop</span>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            {errors[doc.id] && <span className="noc-form-error">{errors[doc.id]}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 8: Payment */}
                        {currentStep === 8 && (
                            <div>
                                <h3 className="noc-section-title">Application Fee Payment</h3>

                                <PaymentModule
                                    formData={formData}
                                    onPaymentComplete={handlePaymentComplete}
                                />
                            </div>
                        )}

                        {/* Step 9: Review & Submit */}
                        {currentStep === 9 && (
                            <div>
                                <h3 className="noc-section-title">Upload Payment Receipt & Submit Application</h3>

                                <div className="noc-alert noc-alert-warning" style={{ marginBottom: '20px' }}>
                                    <strong>Important:</strong> Please review all the information carefully before submitting. Once submitted, you cannot edit the application.
                                </div>

                                {/* Summary Cards */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">Application Summary</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Application Type:</strong> {formData.applicationType}
                                            </div>
                                            <div>
                                                <strong>Project Name:</strong> {formData.projectName}
                                            </div>
                                            <div>
                                                <strong>State:</strong> {formData.state}
                                            </div>
                                            <div>
                                                <strong>Daily Water Requirement:</strong> {formData.dailyWaterRequirement} m³/day
                                            </div>
                                            <div>
                                                <strong>Applicant Name:</strong> {formData.applicantName}
                                            </div>
                                            <div>
                                                <strong>Organization:</strong> {formData.organizationName}
                                            </div>
                                            {formData.paymentTransactionId && (
                                                <>
                                                    <div>
                                                        <strong>Payment Status:</strong> <span style={{ color: 'var(--cgwa-success)', fontWeight: 'bold' }}>✓ PAID</span>
                                                    </div>
                                                    <div>
                                                        <strong>Transaction ID:</strong> {formData.paymentTransactionId}
                                                    </div>
                                                    <div>
                                                        <strong>Receipt Number:</strong> {formData.paymentReceiptNumber}
                                                    </div>
                                                    <div>
                                                        <strong>Amount Paid:</strong> ₹{formData.totalAmount?.toLocaleString('en-IN')}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Receipt Upload */}
                                <div className="noc-card" style={{ marginBottom: '20px', border: '2px solid var(--cgwa-warning)' }}>
                                    <div className="noc-card-header" style={{ background: 'var(--cgwa-warning)', color: 'white' }}>
                                        Upload Payment Receipt * (MANDATORY)
                                    </div>
                                    <div className="noc-card-body">
                                        <div className="noc-alert noc-alert-info" style={{ marginBottom: '20px' }}>
                                            <strong>📤 Upload Required:</strong> Please upload the payment receipt you downloaded in the previous step. You cannot submit your application without uploading the payment proof.
                                        </div>

                                        <div className="noc-form-group">
                                            <label className="noc-form-label required">Payment Receipt (PDF/JPG/PNG)</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (validateFileSize(file)) {
                                                            handleFileUpload('paymentReceipt', file);
                                                            setErrors(prev => ({ ...prev, paymentReceipt: '' }));
                                                        } else {
                                                            alert('File size must be less than 5MB');
                                                        }
                                                    }
                                                }}
                                                className="noc-form-control"
                                                style={{ padding: '10px' }}
                                            />
                                            <span className="noc-form-help">Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                                            {errors.paymentReceipt && <span className="noc-form-error">{errors.paymentReceipt}</span>}

                                            {formData.uploadedDocuments.paymentReceipt && (
                                                <div style={{
                                                    marginTop: '15px',
                                                    padding: '15px',
                                                    background: 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)',
                                                    borderRadius: '8px',
                                                    border: '2px solid var(--cgwa-success)',
                                                    color: '#155724'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '1.5rem' }}>✓</span>
                                                        <div>
                                                            <strong>Receipt Uploaded Successfully!</strong>
                                                            <p style={{ margin: '5px 0 0 0' }}>File: {formData.uploadedDocuments.paymentReceipt.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Declaration */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">Declaration</div>
                                    <div className="noc-card-body">
                                        <div className="noc-checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="declaration"
                                                required
                                            />
                                            <label htmlFor="declaration">
                                                I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of the application and legal action.
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Status Alert */}
                                {!formData.uploadedDocuments.paymentReceipt && (
                                    <div className="noc-alert noc-alert-danger">
                                        <strong>❌ Cannot Submit Application</strong>
                                        <p style={{ margin: '10px 0 0 0' }}>Please upload the payment receipt to enable the submit button.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Navigation */}
                    <FormNavigation
                        currentStep={currentStep}
                        totalSteps={formSteps.length}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onSubmit={handleSubmit}
                        isLastStep={currentStep === formSteps.length}
                    />
                </div>
            </div>

            <NOCFooter />
        </div >
    );
};

export default NOCApplication;
