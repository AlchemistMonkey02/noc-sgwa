import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import ProgressSteps from './components/ProgressSteps';
import FormNavigation from './components/FormNavigation';
import PaymentModule from './components/PaymentModule';
import { initialFormData, formSteps, applicationTypes, applicationSubTypes, projectTypes, waterQualityTypes, groundWaterUtilization, msmeTypes, states, geologyTypes, structureTypes, documentTypes } from './utils/formData';
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateFileSize, validateFileType } from './utils/formValidation';
import './styles/noc-portal.css';

const NOCApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [existingStructures, setExistingStructures] = useState([]);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('nocUser');
        if (!userData) {
            navigate('/noc/login');
        }
    }, [navigate]);

    // Check for MSME exemption eligibility
    useEffect(() => {
        const isMicroOrSmall = formData.msmeType === 'Micro' || formData.msmeType === 'Small';
        const dailyRequirement = parseFloat(formData.dailyWaterRequirement) || 0;
        const isUnder10KLD = dailyRequirement > 0 && dailyRequirement < 10; // 10 m³/day = 10 KLD

        const isExempt = formData.isMSME === 'Yes' && isMicroOrSmall && isUnder10KLD;

        if (formData.isExemptMSME !== isExempt) {
            setFormData(prev => ({
                ...prev,
                isExemptMSME: isExempt
            }));
        }
    }, [formData.isMSME, formData.msmeType, formData.dailyWaterRequirement, formData.isExemptMSME]);

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

                                {/* MSME Exemption Banner */}
                                {formData.isExemptMSME && (
                                    <div className="noc-exemption-banner">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '2rem' }}>🎉</span>
                                            <h3 style={{ margin: 0, color: '#155724' }}>MSME Exemption Eligible!</h3>
                                        </div>
                                        <p style={{ marginBottom: '10px' }}>
                                            Your enterprise qualifies for <strong>MSME exemption</strong> under CGWA regulations
                                            (Daily extraction &lt; 10 KLD for Micro/Small enterprises).
                                        </p>
                                        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '6px', marginTop: '15px' }}>
                                            <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>📋 You only need to submit:</p>
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>✓ MSME Registration Certificate</li>
                                                <li>✓ Affidavit/Declaration of water usage</li>
                                            </ul>
                                            <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                                You do <strong>NOT</strong> need full NOC approval for groundwater extraction below 10 KLD.
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                                        <label className="noc-form-label required">Assessment Unit</label>
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

                        {/* Step 6: Document Upload */}
                        {currentStep === 6 && (
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

                        {/* Step 7: Review & Submit */}
                        {currentStep === 7 && (
                            <div>
                                <h3 className="noc-section-title">Review & Submit Application</h3>

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
                                        </div>
                                    </div>
                                </div>

                                <div className="noc-card">
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

                                <div className="noc-alert noc-alert-success" style={{ marginTop: '20px' }}>
                                    <strong>Application Fee:</strong> ₹10,000 (to be paid after submission)
                                </div>
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
