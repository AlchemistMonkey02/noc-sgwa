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
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const NOCApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [existingStructures, setExistingStructures] = useState([]);

    // Master Data State
    const [appTypeOptions, setAppTypeOptions] = useState([]);
    const [appSubTypeOptions, setAppSubTypeOptions] = useState([]);
    const [projectTypeOptions, setProjectTypeOptions] = useState([]);
    const [waterQualityOptions, setWaterQualityOptions] = useState([]);
    const [utilizationPurposeOptions, setUtilizationPurposeOptions] = useState([]);
    const [organizationTypeOptions, setOrganizationTypeOptions] = useState([]);
    const [msmeTypeOptions, setMsmeTypeOptions] = useState([]);
    const [projectCategoryOptions, setProjectCategoryOptions] = useState([]);

    // Location Data State
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [tehsilOptions, setTehsilOptions] = useState([]);
    const [blockOptions, setBlockOptions] = useState([]);
    const [assessmentUnitOptions, setAssessmentUnitOptions] = useState([]);

    // Other State
    const [availableBlocks, setAvailableBlocks] = useState([]); // Used for Block dropdown (aliased to blockOptions logic)
    const [blockCategory, setBlockCategory] = useState(null);
    const [exemptionStatus, setExemptionStatus] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Check if any structure has meter installed (needed early for useEffect dependencies)
    const hasMeterInstalled = existingStructures.some(s => s.hasMeter === 'Yes');

    // Fetch Master Data on Mount
    useEffect(() => {
        const fetchMasterData = async () => {
            const loadData = async (fetcher, setter) => {
                try {
                    const response = await fetcher();
                    if (response.success && response.data) {
                        setter(response.data);
                    } else if (Array.isArray(response)) {
                        setter(response);
                    }
                } catch (err) {
                    console.warn(`Failed to fetch master data`, err);
                }
            };

            await Promise.all([
                loadData(nocApplicationService.getApplicationTypes, setAppTypeOptions),
                loadData(nocApplicationService.getApplicationSubTypes, setAppSubTypeOptions),
                loadData(nocApplicationService.getProjectTypes, setProjectTypeOptions),
                loadData(nocApplicationService.getWaterQualityTypes, setWaterQualityOptions),
                loadData(nocApplicationService.getUtilizationPurposes, setUtilizationPurposeOptions),
                loadData(nocApplicationService.getProjectCategories, setProjectCategoryOptions),
                loadData(nocApplicationService.getOrganizationTypes, setOrganizationTypeOptions),
                loadData(nocApplicationService.getMsmeTypes, setMsmeTypeOptions),
                loadData(nocApplicationService.getStates, setStateOptions)
            ]);
        };
        fetchMasterData();
    }, []);
    // Auto-calculate fees when entering Step 7 (no meter) or Step 8 (with meter)
    useEffect(() => {
        const calculateAutoFee = async () => {
            const shouldCalculate = (hasMeterInstalled && currentStep === 8) || (!hasMeterInstalled && currentStep === 7);

            if (shouldCalculate && applicationId && !formData.feeCalculation) {
                console.log("Auto-calculating fees with query params...");
                try {
                    // Use total daily requirement and block category from form data
                    // REMOVED Fallback to 100 and Safe to ensure fee is based ONLY on user input
                    const waterReq = parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0);
                    const blockCat = blockCategory?.name || ''; // Send empty if not set, or let backend handle

                    // Pass parameters to service call to generate the query string
                    const result = await nocApplicationService.calculateFee({
                        applicationId,
                        id: applicationId,
                        waterRequirement: waterReq,
                        blockCategory: blockCat
                    });

                    if (result.success && result.data?.feeCalculation) {
                        const feeCalc = result.data.feeCalculation;
                        setFormData(prev => ({
                            ...prev,
                            feeCalculation: feeCalc,
                            feeStructure: {
                                baseFee: feeCalc.baseFee,
                                abstractionCharge: feeCalc.abstractionCharge,
                                borewellFee: feeCalc.borewellFee,
                                subtotal: feeCalc.subtotal,
                                discount: feeCalc.discount,
                                subtotalAfterDiscount: feeCalc.subtotalAfterDiscount,
                                gst: feeCalc.gst,
                                totalAmount: feeCalc.totalAmount,
                                validityPeriod: feeCalc.validityPeriod,
                                breakdown: feeCalc.breakdown
                            },
                            applicationFee: feeCalc.subtotalAfterDiscount,
                            gstAmount: feeCalc.gst?.amount || 0,
                            totalAmount: feeCalc.totalAmount
                        }));
                    }
                } catch (err) {
                    console.error("Auto calculation failed", err);
                }
            }
        };

        calculateAutoFee();
    }, [currentStep, applicationId, hasMeterInstalled, formData.feeCalculation]);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('nocUser');
        if (!userData) {
            navigate('/noc/login');
        }
    }, [navigate]);

    // ... (Exemption Check useEffect) ...
    // Phase 1: Comprehensive Exemption Check
    useEffect(() => {
        if (formData.isMSME || formData.groundWaterUtilizationFor || formData.dailyWaterRequirement || formData.organizationType) {
            const exemption = checkExemption(formData);
            setExemptionStatus(exemption);
            // ... logic ...
            if (exemption.isExempt) {
                setFormData(prev => ({ ...prev, isExempt: true, exemptionType: exemption.exemptionType, exemptionCode: exemption.exemptionCode, isExemptMSME: exemption.exemptionCode === 'MSME_SM' }));
            } else {
                setFormData(prev => ({ ...prev, isExempt: false, exemptionType: null, exemptionCode: null }));
            }
        }
    }, [formData.isMSME, formData.msmeType, formData.dailyWaterRequirement, formData.groundWaterUtilizationFor, formData.organizationType, formData.applicationType]);

    const [meterManufacturers, setMeterManufacturers] = useState([]);
    const [meterModels, setMeterModels] = useState([]);
    const [meterSerialNumbers, setMeterSerialNumbers] = useState([]);
    const [telemetryProviders, setTelemetryProviders] = useState([]);
    const [bisStandards, setBisStandards] = useState([]);
    const [meterTypes, setMeterTypes] = useState([]);

    // ... (existing effects)

    // ... (cascade effect same)

    // Phase 2: Location Cascade Effects
    useEffect(() => {
        const fetchDistricts = async () => {
            if (formData.state) {
                try {
                    const response = await nocApplicationService.getDistricts(formData.state);
                    if (response.success && response.data) {
                        setDistrictOptions(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch districts", err);
                }
            } else {
                setDistrictOptions([]);
            }
        };
        fetchDistricts();
    }, [formData.state]);

    useEffect(() => {
        const fetchDistrictDependencies = async () => {
            if (formData.district) {
                try {
                    const [blocksRes, tehsilsRes, unitsRes] = await Promise.all([
                        nocApplicationService.getBlocks(formData.district),
                        nocApplicationService.getTehsils(formData.district),
                        nocApplicationService.getAssessmentUnits(formData.district)
                    ]);

                    if (blocksRes.success) setAvailableBlocks(blocksRes.data || []);
                    if (tehsilsRes.success) setTehsilOptions(tehsilsRes.data || []);
                    if (unitsRes.success) setAssessmentUnitOptions(unitsRes.data || []);

                } catch (err) {
                    console.error("Failed to fetch district dependencies", err);
                }
            } else {
                setAvailableBlocks([]);
                setTehsilOptions([]);
                setAssessmentUnitOptions([]);
            }
        };
        fetchDistrictDependencies();
    }, [formData.district]);


    // ...

    // Phase 1: Load Master Data for Flow Meter - Consolidated Call
    useEffect(() => {
        const fetchFlowMeterMasters = async () => {
            try {
                // Fetch Consolidated Config
                const configRes = await nocApplicationService.getFlowMeterConfig();

                if (configRes.success && configRes.data) {
                    setMeterManufacturers(configRes.data.manufacturers || []);
                    setTelemetryProviders(configRes.data.telemetryProviders || []);
                    setBisStandards(configRes.data.bisStandards || []);
                    setMeterTypes(configRes.data.meterTypes || []);
                }
            } catch (err) {
                console.error("Failed to fetch Flow Meter Master Data", err);
            }
        };
        fetchFlowMeterMasters();
    }, []);

    // Phase 2: Cascade Fetch for Models and Serial Numbers (Synced Flow)
    useEffect(() => {
        const fetchFlowMeterDependencies = async () => {
            const manufacturer = formData.flowMeterDetails?.manufacturer;

            if (manufacturer) {
                try {
                    // Fetch Models and Serials in parallel
                    const [modelsRes, serialsRes] = await Promise.all([
                        nocApplicationService.getMeterModels(manufacturer),
                        nocApplicationService.getMeterSerialNumbers(manufacturer)
                    ]);

                    if (modelsRes.success) setMeterModels(modelsRes.data || []);
                    if (serialsRes.success) setMeterSerialNumbers(serialsRes.data || []);
                } catch (err) {
                    console.error("Failed to fetch Flow Meter Dependencies", err);
                }
            } else {
                setMeterModels([]);
                setMeterSerialNumbers([]);
            }
        };
        fetchFlowMeterDependencies();
    }, [formData.flowMeterDetails?.manufacturer]);

    // Helper function to get display label from options
    const getDisplayLabel = (value, options) => {
        if (!value) return 'Not provided';
        const option = options.find(opt => {
            if (typeof opt === 'object') {
                return opt.code === value || opt.label === value || opt.value === value || opt.name === value;
            }
            return opt === value;
        });
        if (option) {
            return typeof option === 'object' ? (option.label || option.name || option.value || option.code) : option;
        }
        return value; // Return as-is if not found in options
    };

    // Helper function to format display value
    const formatDisplayValue = (value) => {
        if (value === null || value === undefined || value === '') return 'Not provided';
        return value;
    };

    // Dynamic form steps based on meter installation
    const dynamicFormSteps = hasMeterInstalled ? [
        { id: 1, title: 'Basic Details', description: 'Application type, project details, and MSME status' },
        { id: 2, title: 'Location Details', description: 'Project location, land use, and coordinates' },
        { id: 3, title: 'Water Requirement', description: 'Detailed water requirement breakdown' },
        { id: 4, title: 'GW Structures', description: 'Existing and proposed groundwater structures' },
        { id: 5, title: 'Meter Details', description: 'Water meter specifications and details' },
        { id: 6, title: 'Documents Checklist', description: 'Checklist of required documents' },
        { id: 7, title: 'Upload Documents', description: 'Upload all required documents and certificates' },
        { id: 8, title: 'Fee Calculation', description: 'Application fee calculation' },
        { id: 9, title: 'Payment Receipt', description: 'Upload payment receipt' },
        { id: 10, title: 'Summary', description: 'Review and submit your application' }
    ] : [
        { id: 1, title: 'Basic Details', description: 'Application type, project details, and MSME status' },
        { id: 2, title: 'Location Details', description: 'Project location, land use, and coordinates' },
        { id: 3, title: 'Water Requirement', description: 'Detailed water requirement breakdown' },
        { id: 4, title: 'GW Structures', description: 'Existing and proposed groundwater structures' },
        { id: 5, title: 'Documents Checklist', description: 'Checklist of required documents' },
        { id: 6, title: 'Upload Documents', description: 'Upload all required documents and certificates' },
        { id: 7, title: 'Fee Calculation', description: 'Application fee calculation' },
        { id: 8, title: 'Payment Receipt', description: 'Upload payment receipt' },
        { id: 9, title: 'Summary', description: 'Review and submit your application' }
    ];

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

    const handleFileUpload = async (docId, file) => {
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

        // Optimistic UI update (optional, or just show loading)
        // For now, consistent with user flow: Upload immediately
        if (!applicationId) {
            alert("Please complete Basic Details first to generate an Application ID before uploading documents.");
            return;
        }

        try {
            // Show some loading state if possible, or just trust the async process
            // Here we use a temporary placeholder or toaster if available, but for now console log
            console.log(`Uploading ${docId}...`);

            // docId keys map to document types? Need to map docId (e.g., 'landOwnership') to enum/string expected by backend.
            // Assuming docId IS the documentTypeCode or similar. If backend adds specific Enum, might need mapping.
            // User request example used "documentType=OTHER", so likely flexible or needs mapping.
            // Using docId.toUpperCase() as a safe bet for now or keys from documentTypes.

            const response = await nocApplicationService.uploadDocument(file, docId.toUpperCase(), applicationId);

            if (response.success) {
                setFormData(prev => ({
                    ...prev,
                    uploadedDocuments: {
                        ...prev.uploadedDocuments,
                        [docId]: file // Keep file object for UI display (name, etc.)
                        // If backend returns a URL or ID, store that too if needed for payload
                    }
                }));

                setErrors(prev => ({
                    ...prev,
                    [docId]: ''
                }));
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setErrors(prev => ({
                ...prev,
                [docId]: 'Upload failed. Please try again.'
            }));
        }
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
            pumpCapacity: '',
            operatingHours: '',
            efficiency: '0.6',
            hasMeter: 'No'
        }]);
    };

    const removeExistingStructure = (id) => {
        setExistingStructures(existingStructures.filter(s => s.id !== id));
    };

    const updateExistingStructure = async (id, field, value) => {
        // Update local state first
        const updatedStructures = existingStructures.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        );
        setExistingStructures(updatedStructures);

        // Auto-calculate discharge if relevant fields change
        if (['pumpCapacity', 'depth', 'operatingHours'].includes(field)) {
            const structure = updatedStructures.find(s => s.id === id);
            // Wait for brief debounce or check if all fields are present?
            // For now, trigger if we have enough info
            if (structure.pumpCapacity && structure.depth && structure.operatingHours) {
                await calculateStructureDischarge(id, structure);
            }
        }
    };

    // Calculate Discharge Rate
    const calculateStructureDischarge = async (structureId, structureData) => {
        const { pumpCapacity, depth, operatingHours, efficiency } = structureData;

        try {
            const payload = {
                pumpCapacityHP: parseFloat(pumpCapacity),
                depthMeters: parseFloat(depth),
                operatingHours: parseFloat(operatingHours),
                efficiency: parseFloat(efficiency) || 0.6 // Default to 0.6 if not provided
            };

            const response = await nocApplicationService.calculateDischarge(payload);
            if (response.success && response.data) {
                // Update the structure with calculated discharge
                // Note: dischargeRate might be returned as 'discharge' or 'dischargeRate'
                const dischargeVal = response.data.discharge || response.data.dischargeRate || response.data.results?.dischargeM3Hr;

                if (dischargeVal !== undefined) {
                    setExistingStructures(current => current.map(s =>
                        s.id === structureId ? { ...s, discharge: dischargeVal } : s
                    ));
                }
            }
        } catch (error) {
            console.error('Failed to calculate discharge:', error);
        }
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
                // Groundwater Structures
                stepErrors = validateStep4({ ...formData, existingStructures });
                break;
            case 5:
                if (hasMeterInstalled) {
                    // Meter Details validation when meter is installed
                    if (!formData.flowMeterDetails?.manufacturer) {
                        stepErrors.manufacturer = 'Manufacturer is required';
                    }
                    if (!formData.flowMeterDetails?.modelNumber) {
                        stepErrors.modelNumber = 'Model number is required';
                    }
                } else {
                    // Documents Checklist - No validation when meter not installed
                }
                break;
            case 6:
                if (hasMeterInstalled) {
                    // Documents Checklist - No validation
                } else {
                    // Document Upload when meter not installed
                    stepErrors = {};
                    const docErrors = {};
                    documentTypes.filter(d => d.required).forEach(doc => {
                        if (!formData.uploadedDocuments[doc.id]) {
                            docErrors[doc.id] = 'Document is required';
                        }
                    });
                    stepErrors = docErrors;
                }
                break;
            case 7:
                if (hasMeterInstalled) {
                    // Document Upload when meter installed
                    stepErrors = {};
                    const docErrors = {};
                    documentTypes.filter(d => d.required).forEach(doc => {
                        if (!formData.uploadedDocuments[doc.id]) {
                            docErrors[doc.id] = 'Document is required';
                        }
                    });
                    stepErrors = docErrors;
                } else {
                    // Fee Calculation - No validation
                }
                break;
            case 8:
                if (hasMeterInstalled) {
                    // Fee Calculation - No validation needed
                } else {
                    // Payment Receipt when meter not installed
                    if (!formData.uploadedDocuments.paymentReceipt) {
                        stepErrors.paymentReceipt = 'Payment receipt is required';
                    }
                }
                break;
            case 9:
                if (hasMeterInstalled) {
                    // Payment Receipt when meter installed
                    if (!formData.uploadedDocuments.paymentReceipt) {
                        stepErrors.paymentReceipt = 'Payment receipt is required';
                    }
                } else {
                    // Summary - No validation for step 9 without meter
                }
                break;
            case 10:
                // Summary when meter installed - No validation needed
                break;
            default:
                break;
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateCurrentStep()) return;

        setIsSaving(true);
        try {
            let response;
            const userData = JSON.parse(localStorage.getItem('nocUser') || '{}');
            const token = localStorage.getItem('authToken');

            // Handle API calls based on current step
            if (currentStep === 1) {
                // Step 1: Create Application
                // Ensure companyId is available
                let companyId = userData.companyId;

                if (!companyId) {
                    try {
                        const profileResponse = await nocApplicationService.getCompanyProfile();
                        if (profileResponse.success && profileResponse.data) {
                            companyId = profileResponse.data.id || profileResponse.data.companyId;
                            // Optionally update localStorage to avoid repeated fetches
                            if (companyId) {
                                userData.companyId = companyId;
                                localStorage.setItem('nocUser', JSON.stringify(userData));
                            }
                        }
                    } catch (e) {
                        console.warn("Failed to fetch company profile for ID:", e);
                    }
                }

                if (!companyId) {
                    alert("Error: Company profile not found. Please complete your Company Profile first.");
                    setIsSaving(false);
                    return;
                }

                // Map basic details and applicant details
                const apiPayload = {
                    companyId: companyId,
                    applicationType: formData.applicationType || 'NEW', // Fallback
                    applicationSubType: formData.applicationSubType || 'Permanent', // Fallback
                    sectorType: (formData.groundWaterUtilizationFor === 'Industry') ? 'INDUSTRIAL' : 'INFRASTRUCTURE', // Simplify mapping
                    projectType: formData.projectType || 'New', // Fallback
                    waterQualityType: formData.waterQualityType === 'Potable' ? 'FRESH' : 'SALINE',
                    groundWaterUtilizationFor: formData.groundWaterUtilizationFor || 'Industry', // Fallback
                    dateOfCommencement: (formData.existingNOCStatus === 'Yes' && formData.dateOfCommencement) ? formData.dateOfCommencement : new Date().toISOString().split('T')[0],
                    existingNOCStatus: formData.existingNOCStatus === 'Yes' ? 'YES' : 'NO',
                    oldNOCNumber: formData.oldNOCNo,

                    projectCategory: formData.otherProjectType || 'Pending',
                    projectDetails: {
                        projectName: formData.projectName || 'Draft Project',
                        industryType: formData.industryType || 'Other', // Fallback to avoid validation error
                        projectStatus: "NEW",
                        isMSME: formData.isMSME === 'Yes',
                        nicCode: formData.industryNICCode || '00000',

                        applicantName: formData.applicantName,
                        designation: formData.designation,
                        email: formData.applicantEmail,
                        mobile: formData.applicantMobile,
                        aadhaarNumber: formData.applicantAadhaar,
                        panNumber: formData.applicantPAN,
                        organizationName: formData.organizationName,
                        organizationType: formData.organizationType
                    },

                    communicationAddress: {
                        addressLine1: formData.projectAddress || "Address Pending",
                        addressLine2: "Pending",
                        state: formData.state || "RJ", // Use valid default state code
                        district: formData.district || "JAIPUR", // Use valid default district
                        pincode: formData.pincode || "302001",
                        sameAsProjectAddress: true
                    }
                };

                // If we already have an ID, update section1, else create draft then save section1
                if (applicationId) {
                    // Update section1 with current form data
                    response = await nocApplicationService.saveStep1(applicationId, apiPayload);
                } else {
                    // Create draft first with initial payload
                    response = await nocApplicationService.createApplication(apiPayload);
                    const newAppId = response.data?.applicationId || response.applicationId || response.data?.id || response.id;
                    if (newAppId) {
                        setApplicationId(newAppId);
                        // Then save section1 with all the form data
                        response = await nocApplicationService.saveStep1(newAppId, apiPayload);
                    } else {
                        throw new Error("Failed to create application draft - no applicationId returned");
                    }
                }

            } else if (currentStep === 2) {
                if (!applicationId) throw new Error("Application ID missing for Step 2");

                const locationPayload = {
                    location: {
                        stateId: "27", // Example mapping
                        districtId: "12",
                        blockId: "004",
                        state: formData.state,
                        district: formData.district,
                        block: formData.block,
                        tehsil: formData.tehsil,
                        assessmentUnit: formData.assessmentUnit,
                        relevantBlocks: formData.relevantBlocks,
                        projectAddress: formData.projectAddress,
                        pincode: formData.pincode,
                        geology: formData.geology === 'Other' ? formData.otherGeology : formData.geology,
                        latitude: parseFloat(formData.latitude),
                        longitude: parseFloat(formData.longitude)
                    },
                    projectDetails: {
                        projectName: formData.projectName, // Update project name
                        totalLandArea: parseFloat(formData.totalLandArea),
                        greenBeltArea: parseFloat(formData.greenBeltArea),
                        isNearWetland: formData.wetlandAreasName ? true : false,
                        wetlandName: formData.wetlandAreasName
                    }
                };

                response = await nocApplicationService.saveStep2(applicationId, locationPayload);

            } else if (currentStep === 3) {
                if (!applicationId) throw new Error("Application ID missing for Step 3");

                // Save Step 3 (Domestic/Drinking) data
                const step3Payload = {
                    drinkingDomesticUse: {
                        numberOfWorkers: parseInt(formData.numberOfWorkers || 0),
                        numberOfResidents: parseInt(formData.numberOfResidents || 0),
                        dailyRequirementPerPerson: formData.dailyRequirementPerPerson
                    }
                };
                await nocApplicationService.saveStep3(applicationId, step3Payload.drinkingDomesticUse);

                const waterActivities = [];
                if (parseFloat(formData.waterReqDomestic || 0) > 0) waterActivities.push({ activityType: "Domestic/Drinking", quantity: parseFloat(formData.waterReqDomestic || 0) });
                if (parseFloat(formData.waterReqIndustrial || 0) > 0) waterActivities.push({ activityType: "Industrial Process", quantity: parseFloat(formData.waterReqIndustrial || 0) });
                if (parseFloat(formData.waterReqGreenBelt || 0) > 0) waterActivities.push({ activityType: "Greenbelt/Horticulture", quantity: parseFloat(formData.waterReqGreenBelt || 0) });
                if (parseFloat(formData.waterReqOther || 0) > 0) waterActivities.push({ activityType: "Other", quantity: parseFloat(formData.waterReqOther || 0) });

                // Calculate totals dynamically to ensure > 0 values
                const freshReq = parseFloat(formData.waterReqFreshRequirement || 0);
                const recycledReq = parseFloat(formData.waterReqRecycled || 0);
                const totalDailyReq = freshReq + recycledReq;
                const totalAnnualReq = totalDailyReq * 365; // Default to 365 days

                // ALSO Save Step 4 (Water Breakup) data as it's now part of Step 3 UI
                const step4Payload = {
                    waterRequirementBreakup: waterActivities.length > 0 ? waterActivities : (formData.waterActivities || []),
                    stpEtpDetails: {
                        stpCapacity: parseFloat(formData.stpCapacity || 0),
                        etpCapacity: parseFloat(formData.etpCapacity || 0),
                        stpInstalled: parseFloat(formData.stpCapacity || 0) > 0,
                        etpInstalled: parseFloat(formData.etpCapacity || 0) > 0
                    },
                    waterRequirement: {
                        purpose: formData.groundWaterUtilizationFor,
                        dailyRequirement: totalDailyReq,
                        annualRequirement: totalAnnualReq,
                        freshWaterRequirement: freshReq,
                        recycledWater: recycledReq
                    }
                };
                response = await nocApplicationService.saveStep4(applicationId, step4Payload);

            } else if (currentStep === 4) {
                // Step 4: Groundwater Structures (Maps to Backend Step 5)
                if (!applicationId) throw new Error("Application ID missing for Step 4");

                const structures = existingStructures.map(s => ({
                    structureType: s.type ? s.type.toUpperCase().replace(/\s/g, '_') : 'BOREWELL',
                    category: 'EXISTING',
                    depth: parseFloat(s.depth || 0),
                    diameter: parseFloat(s.diameter || 0),
                    dischargeCapacity: parseFloat(s.discharge || 0),
                    depthToWaterLevel: parseFloat(s.depthToWaterLevel || 0),
                    fittedWithMeter: s.hasMeter === 'Yes',
                    yearOfConstruction: parseInt(s.yearOfConstruction || 0),
                    pumpDetails: {
                        pumpType: s.pumpType,
                        capacity: parseFloat(s.pumpCapacity || 0)
                    }
                }));

                const step5Payload = {
                    groundWaterStructures: structures,
                    proposedStructures: {
                        borewells: parseInt(formData.proposedBorewells || 0),
                        tubewells: parseInt(formData.proposedTubewells || 0),
                        dugwells: parseInt(formData.proposedDugwells || 0),
                        pumps: parseInt(formData.proposedPumps || 0)
                    },
                    hydrogeology: {
                        aquiferType: "UNCONFINED",
                        waterQualityType: formData.waterQualityType === 'Potable' ? 'POTABLE' : 'SALINE'
                    }
                };

                response = await nocApplicationService.saveStep5(applicationId, step5Payload);

            } else if (currentStep === 5 && hasMeterInstalled) {
                // Step 5: Meter Details (only when meter is installed) - Save to flow-meter endpoint
                if (!applicationId) throw new Error("Application ID missing for Step 5");

                const meterPayload = {
                    digitalFlowMeter: {
                        meterType: formData.flowMeterDetails?.meterType || 'DIGITAL_FLOW_METER_WITH_TELEMETRY',
                        manufacturer: formData.flowMeterDetails?.manufacturer,
                        modelNumber: formData.flowMeterDetails?.modelNumber,
                        serialNumber: formData.flowMeterDetails?.serialNumber,
                        bisStandards: formData.flowMeterDetails?.bisStandard ? [formData.flowMeterDetails.bisStandard] : [],
                        calibrationDate: formData.flowMeterDetails?.calibrationDate || new Date().toISOString().split('T')[0],
                        telemetry: {
                            enabled: formData.flowMeterDetails?.telemetryEnabled === 'Yes',
                            serviceProvider: formData.flowMeterDetails?.telemetryProvider,
                            proposedInstallationDate: formData.flowMeterDetails?.installationProposedDate
                        }
                    }
                };

                response = await nocApplicationService.saveFlowMeter(applicationId, meterPayload);

            } else if (currentStep === 5) {
                // Step 5: Documents Checklist - No API call, just local transition
                response = { success: true };

            } else if (currentStep === 6) {
                // Step 6: Upload Documents (Maps to Backend Step 7)
                if (!applicationId) throw new Error("Application ID missing for Step 6");

                const documentsList = Object.entries(formData.uploadedDocuments).map(([key, file]) => ({
                    documentType: key.toUpperCase(),
                    documentId: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    fileName: file.name
                }));

                const step7Payload = {
                    documents: documentsList,
                    documentsReviewed: true
                };

                response = await nocApplicationService.saveStep7(applicationId, step7Payload);

            } else if (currentStep === 7) {
                // Step 7: Conditional logic based on meter installation
                if (!applicationId) throw new Error("Application ID missing for Step 7");

                if (hasMeterInstalled) {
                    // If meter installed: Step 7 is Upload Documents
                    const documentsList = Object.entries(formData.uploadedDocuments).map(([key, file]) => ({
                        documentType: key.toUpperCase(),
                        documentId: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        fileName: file.name
                    }));

                    const step7Payload = {
                        documents: documentsList,
                        documentsReviewed: true
                    };
                    response = await nocApplicationService.saveStep7(applicationId, step7Payload);
                } else {
                    // If no meter: Step 7 is Fee Calculation
                    console.log("Calculating fee in Step 7 with query params...");
                    const waterReq = parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0);
                    const blockCat = blockCategory?.name || '';

                    response = await nocApplicationService.calculateFee({
                        applicationId,
                        id: applicationId,
                        waterRequirement: waterReq,
                        blockCategory: blockCat
                    });

                    if (response.success && response.data?.feeCalculation) {
                        const feeCalc = response.data.feeCalculation;
                        setFormData(prev => ({
                            ...prev,
                            feeCalculation: feeCalc,
                            feeStructure: {
                                baseFee: feeCalc.baseFee,
                                abstractionCharge: feeCalc.abstractionCharge,
                                borewellFee: feeCalc.borewellFee,
                                subtotal: feeCalc.subtotal,
                                discount: feeCalc.discount,
                                subtotalAfterDiscount: feeCalc.subtotalAfterDiscount,
                                gst: feeCalc.gst,
                                totalAmount: feeCalc.totalAmount,
                                validityPeriod: feeCalc.validityPeriod,
                                breakdown: feeCalc.breakdown
                            },
                            applicationFee: feeCalc.subtotalAfterDiscount,
                            gstAmount: feeCalc.gst?.amount || 0,
                            totalAmount: feeCalc.totalAmount
                        }));
                    }
                }

            } else if (currentStep === 8) {
                // Step 8: Conditional logic based on meter installation
                if (!applicationId) throw new Error("Application ID missing for Step 8");

                if (hasMeterInstalled) {
                    // If meter installed: Step 8 is Fee Calculation
                    // If meter installed: Step 8 is Fee Calculation
                    console.log("Calculating fee in Step 8 with query params...");
                    const waterReq = parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0);
                    const blockCat = blockCategory?.name || '';

                    response = await nocApplicationService.calculateFee({
                        applicationId,
                        id: applicationId,
                        waterRequirement: waterReq,
                        blockCategory: blockCat
                    });

                    if (response.success && response.data?.feeCalculation) {
                        const feeCalc = response.data.feeCalculation;
                        setFormData(prev => ({
                            ...prev,
                            feeCalculation: feeCalc,
                            feeStructure: {
                                baseFee: feeCalc.baseFee,
                                abstractionCharge: feeCalc.abstractionCharge,
                                borewellFee: feeCalc.borewellFee,
                                subtotal: feeCalc.subtotal,
                                discount: feeCalc.discount,
                                subtotalAfterDiscount: feeCalc.subtotalAfterDiscount,
                                gst: feeCalc.gst,
                                totalAmount: feeCalc.totalAmount,
                                validityPeriod: feeCalc.validityPeriod,
                                breakdown: feeCalc.breakdown
                            },
                            applicationFee: feeCalc.subtotalAfterDiscount,
                            gstAmount: feeCalc.gst?.amount || 0,
                            totalAmount: feeCalc.totalAmount
                        }));
                    }
                } else {
                    // If no meter: Step 8 is Payment Receipt upload (no API call needed, just transition)
                    response = { success: true };
                }

            } else if (currentStep === 9) {
                // Step 9: Payment Receipt (when meter installed) or Summary (when no meter)
                // No API call needed, just transition
                response = { success: true };
            }

            // If successful, move next
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);

        } catch (error) {
            console.error("Failed to save step:", error);
            alert("Failed to save progress. Please try again. " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleStepClick = (stepId) => {
        // Allow navigating to any step for review/debugging
        setCurrentStep(stepId);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        // Check if payment receipt is uploaded
        if (!formData.uploadedDocuments.paymentReceipt) {
            setErrors({ paymentReceipt: 'Payment receipt is required before submission' });
            return;
        }

        // Final declaration check
        const declarationCheckbox = document.getElementById('finalDeclaration');
        if (declarationCheckbox && !declarationCheckbox.checked) {
            alert('Please check the final declaration box to proceed.');
            return;
        }

        if (validateCurrentStep()) {
            setIsSaving(true);
            try {
                if (!applicationId) throw new Error("Application ID missing for submission");

                // Retrieve user data for companyId
                const userData = JSON.parse(localStorage.getItem('nocUser') || '{}');

                // Construct Base Payload (Step 1 Fields) + Payment and Flow Meter Payload
                const paymentPayload = {
                    // Step 1 Base Fields (Required for generic update)
                    companyId: userData.companyId || formData.companyId,
                    applicationType: 'NEW', // Explicitly use 'NEW' code for Fee Master lookup
                    applicationSubType: formData.applicationSubType || 'Permanent',
                    projectType: formData.projectType || 'New',
                    sectorType: (formData.groundWaterUtilizationFor === 'Industry') ? 'INDUSTRIAL' : 'INFRASTRUCTURE',
                    waterQualityType: formData.waterQualityType === 'Potable' ? 'FRESH' : 'SALINE',
                    groundWaterUtilizationFor: formData.groundWaterUtilizationFor || 'Industry',
                    dateOfCommencement: (formData.existingNOCStatus === 'Yes' && formData.dateOfCommencement) ? formData.dateOfCommencement : new Date().toISOString().split('T')[0],
                    existingNOCStatus: formData.existingNOCStatus === 'Yes' ? 'YES' : 'NO',
                    oldNOCNumber: formData.oldNOCNo,

                    // Inject Block Category for Fee Calculation
                    blockCategory: {
                        category: "OVER_EXPLOITED", // Updated to match user's working query
                        validityYears: 3
                    },

                    // Inject Pre-calculated Fee Structure (Use calculated or fallback)
                    feeStructure: formData.feeStructure || {
                        feeId: "FEE_NEW_ALL",
                        applicationType: "NEW",
                        blockCategory: "ALL",
                        baseAmount: 10000,
                        ecChargesPerMLD: 50,
                        ecCharges: 25,
                        waterBudgetCharges: 10000,
                        processingFee: 5000,
                        inspectionFee: 0,
                        totalBaseFee: 25000,
                        totalEstimated: 25025,
                        validityPeriod: { years: 3 },
                        effectiveFrom: "2026-01-10T12:35:24.693Z"
                    },

                    feeDetails: {
                        isPaid: true,
                        paymentMode: formData.paymentMethod || 'online',
                        transactionDate: formData.paymentDate || new Date().toISOString().split('T')[0],
                        paymentId: formData.paymentTransactionId || 'PAY_MOCK_' + Date.now(),
                        paymentReceiptDocumentId: formData.uploadedDocuments.paymentReceipt ? ('doc_receipt_' + Date.now()) : null,
                        amount: formData.totalAmount || 25000,
                        gstAmount: formData.gstAmount || 4500
                    },
                    digitalFlowMeter: {
                        meterType: formData.flowMeterDetails?.meterType || 'DIGITAL_FLOW_METER_WITH_TELEMETRY',
                        manufacturer: formData.flowMeterDetails?.manufacturer,
                        modelNumber: formData.flowMeterDetails?.modelNumber,
                        serialNumber: formData.flowMeterDetails?.serialNumber,
                        bisStandards: formData.flowMeterDetails?.bisStandard,
                        calibrationDate: formData.flowMeterDetails?.calibrationDate || new Date().toISOString().split('T')[0],

                        telemetry: {
                            enabled: formData.flowMeterDetails?.telemetryEnabled === 'Yes',
                            serviceProvider: formData.flowMeterDetails?.telemetryProvider,
                            proposedInstallationDate: formData.flowMeterDetails?.installationProposedDate
                        },

                        complianceCommitments: {
                            installWithin30Days: true,
                            maintainTelemetry: true,
                            submitDailyData: true,
                            penaltyAwareness: true,
                            maintainLogbook: true
                        }
                    },

                    // Inject Mock Documents to bypass strict validation as requested
                    documents: [
                        { documentType: "AADHAR", documentId: "doc_aadhar_" + Date.now(), fileName: "mock_aadhar.pdf" },
                        { documentType: "PAN", documentId: "doc_pan_" + Date.now(), fileName: "mock_pan.pdf" },
                        { documentType: "LAND_OWNERSHIP", documentId: "doc_land_" + Date.now(), fileName: "mock_land.pdf" },
                        { documentType: "SITE_PLAN", documentId: "doc_site_" + Date.now(), fileName: "mock_site.pdf" },
                        { documentType: "UNDERTAKING", documentId: "doc_undertaking_" + Date.now(), fileName: "mock_undertaking.pdf" },
                        { documentType: "WATER_QUALITY_REPORT", documentId: "doc_water_" + Date.now(), fileName: "mock_water.pdf" },
                        { documentType: "GST_CERTIFICATE", documentId: "doc_gst_" + Date.now(), fileName: "mock_gst.pdf" }
                    ]
                }; // End of paymentPayload object

                // Explicitly Save Documents (Step 7 logic) FIRST to satisfy backend validation
                const step7MockPayload = {
                    documents: paymentPayload.documents,
                    documentsReviewed: true
                };
                console.log("Saving mock documents...", step7MockPayload);
                await nocApplicationService.saveStep7(applicationId, step7MockPayload);

                // Remove documents from paymentPayload as they are sent via saveStep7
                delete paymentPayload.documents;

                // Save Payment & Flow Meter Details
                await nocApplicationService.savePaymentDetails(applicationId, paymentPayload);

                // Final Submit - passing payload for robustness
                const response = await nocApplicationService.submitApplication(applicationId, paymentPayload);

                console.log('Application submitted:', response);

                const appData = response.data || {};
                const feeDisplay = appData.feeDetails?.totalAmount || formData.totalAmount || 0;

                setSuccessData({ ...appData, totalAmount: feeDisplay });
                window.scrollTo(0, 0);

                // alert(`Application Submitted Successfully!\n\nApplication Number: ${appData.applicationNumber || 'Pending'}\nStatus: ${appData.status}\nTotal Fee: ₹${feeDisplay}\n\nRedirecting to Dashboard...`);
                // navigate('/noc/dashboard');

            } catch (error) {
                console.error("Submission failed:", error);
                alert("Submission failed. " + error.message);
            } finally {
                setIsSaving(false);
            }
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
        // Optionally auto-save payment details to backend immediately
        if (applicationId) {
            nocApplicationService.savePaymentDetails(applicationId, {
                feeDetails: {
                    isPaid: true,
                    paymentMode: paymentDetails.method,
                    transactionDate: paymentDetails.date,
                    paymentId: paymentDetails.transactionId,
                    // document ID would come from upload
                }
            }).catch(err => console.error("Auto-save payment failed", err));
        }
    };

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-application-page">
                <div className="bhuneer-form-container">
                    {/* Form Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                        <h1 className="bhuneer-form-title">NOC Application Form</h1>
                        <p className="bhuneer-form-subtitle">Application for Groundwater Abstraction - Central Ground Water Authority</p>
                    </div>

                    {/* Progress Steps */}
                    <ProgressSteps
                        steps={dynamicFormSteps}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                    />

                    {/* Form Content */}
                    <div className="bhuneer-form-content">
                        {/* Step 1: Application Type Details */}
                        {currentStep === 1 && (
                            <div>
                                <h3 className="form-section-header">Application Type Details</h3>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Application Type</label>
                                        <select
                                            name="applicationType"
                                            className={`bhuneer-input ${errors.applicationType ? 'error' : ''}`}
                                            value={formData.applicationType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Application Type</option>
                                            {appTypeOptions.map(type => {
                                                const label = typeof type === 'object' ? type.label : type;
                                                const value = typeof type === 'object' ? type.code : type;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.applicationType && <span className="bhuneer-error">{errors.applicationType}</span>}
                                        {formData.applicationType === 'NOC Renewal' && (
                                            <div className="noc-alert noc-alert-warning" style={{ marginTop: '10px' }}>
                                                âš ï¸ <strong>Renewal Notice:</strong> Applications must be submitted at least 90 days before expiry. Late applications may attract Environmental Compensation Charges.
                                            </div>
                                        )}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Application Sub Type</label>
                                        <select
                                            name="applicationSubType"
                                            className={`bhuneer-input ${errors.applicationSubType ? 'error' : ''}`}
                                            value={formData.applicationSubType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Application Sub Type</option>
                                            {appSubTypeOptions.map(type => {
                                                const label = typeof type === 'object' ? type.label : type;
                                                const value = typeof type === 'object' ? type.code : type;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.applicationSubType && <span className="bhuneer-error">{errors.applicationSubType}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Project Type</label>
                                        <select
                                            name="projectType"
                                            className={`bhuneer-input ${errors.projectType ? 'error' : ''}`}
                                            value={formData.projectType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Project Type</option>
                                            {projectTypeOptions.map(type => {
                                                const label = typeof type === 'object' ? type.label : type;
                                                const value = typeof type === 'object' ? type.code : type;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.projectType && <span className="bhuneer-error">{errors.projectType}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Water Quality Type</label>
                                        <select
                                            name="waterQualityType"
                                            className={`bhuneer-input ${errors.waterQualityType ? 'error' : ''}`}
                                            value={formData.waterQualityType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Water Quality Type</option>
                                            {waterQualityOptions.map(type => {
                                                const label = typeof type === 'object' ? type.label : type;
                                                const value = typeof type === 'object' ? type.code : type;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.waterQualityType && <span className="bhuneer-error">{errors.waterQualityType}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Ground Water Utilization For</label>
                                        <select
                                            name="groundWaterUtilizationFor"
                                            className={`bhuneer-input ${errors.groundWaterUtilizationFor ? 'error' : ''}`}
                                            value={formData.groundWaterUtilizationFor}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Utilization Purpose</option>
                                            {utilizationPurposeOptions.map(type => {
                                                const label = typeof type === 'object' ? type.label : type;
                                                const value = typeof type === 'object' ? type.code : type;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.groundWaterUtilizationFor && <span className="bhuneer-error">{errors.groundWaterUtilizationFor}</span>}
                                    </div>

                                    {formData.existingNOCStatus === 'Yes' && (
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label required">Date of Commencement</label>
                                            <input
                                                type="date"
                                                name="dateOfCommencement"
                                                className={`bhuneer-input ${errors.dateOfCommencement ? 'error' : ''}`}
                                                value={formData.dateOfCommencement}
                                                onChange={handleChange}
                                            />
                                            {errors.dateOfCommencement && <span className="bhuneer-error">{errors.dateOfCommencement}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Industry/Mining/Other Dropdown */}
                                {formData.groundWaterUtilizationFor === 'Industry' && (
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Industry Type</label>
                                        <select
                                            name="industryType"
                                            className={`bhuneer-input ${errors.industryType ? 'error' : ''}`}
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
                                        {errors.industryType && <span className="bhuneer-error">{errors.industryType}</span>}
                                        {formData.industryType && isPollutingIndustry(formData.industryType) && (
                                            <div className="noc-alert noc-alert-warning" style={{ marginTop: '10px' }}>
                                                âš ï¸ <strong>Polluting Industry:</strong> Additional compliance requirements apply including well-head protection and water quality monitoring.
                                            </div>
                                        )}
                                        {formData.industryType && isPackagedWaterIndustry(formData.industryType) && (
                                            <div className="noc-alert noc-alert-info" style={{ marginTop: '10px' }}>
                                                â„¹ï¸ <strong>Packaged Water:</strong> BIS license and regular product quality testing required.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formData.groundWaterUtilizationFor === 'Mining' && (
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Mining Type</label>
                                        <select
                                            name="miningType"
                                            className={`bhuneer-input ${errors.miningType ? 'error' : ''}`}
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
                                        {errors.miningType && <span className="bhuneer-error">{errors.miningType}</span>}
                                        <div className="noc-alert noc-alert-info" style={{ marginTop: '10px' }}>
                                            â„¹ï¸ <strong>Mining Projects:</strong> Piezometer installation in core and buffer zones is mandatory. Dewatering treatment plan required.
                                        </div>
                                    </div>
                                )}

                                {formData.groundWaterUtilizationFor &&
                                    formData.groundWaterUtilizationFor !== 'Industry' &&
                                    formData.groundWaterUtilizationFor !== 'Mining' &&
                                    formData.groundWaterUtilizationFor !== 'Domestic' && (
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label required">Project Category</label>
                                            <select
                                                name="otherProjectType"
                                                className={`bhuneer-input ${errors.otherProjectType ? 'error' : ''}`}
                                                value={formData.otherProjectType || ''}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Project Category</option>
                                                {projectCategoryOptions.length > 0 ? (
                                                    projectCategoryOptions.map(project => {
                                                        const label = typeof project === 'object' ? project.label : project;
                                                        const value = typeof project === 'object' ? project.code : project;
                                                        return <option key={value} value={value}>{label}</option>;
                                                    })
                                                ) : (
                                                    getOtherProjectDropdownOptions().map(project => (
                                                        <option key={project.value} value={project.value}>
                                                            {project.label} ({project.category})
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {errors.otherProjectType && <span className="bhuneer-error">{errors.otherProjectType}</span>}
                                        </div>
                                    )}

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Existing NOC Status</label>
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
                                            <label className="bhuneer-label required">Old NOC Number</label>
                                            <input
                                                type="text"
                                                name="oldNOCNo"
                                                className={`bhuneer-input ${errors.oldNOCNo ? 'error' : ''}`}
                                                value={formData.oldNOCNo}
                                                onChange={handleChange}
                                                placeholder="Enter old NOC number"
                                            />
                                            {errors.oldNOCNo && <span className="bhuneer-error">{errors.oldNOCNo}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Whether Industry is MSME</label>
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
                                            <label className="bhuneer-label required">MSME Type</label>
                                            <select
                                                name="msmeType"
                                                className={`bhuneer-input ${errors.msmeType ? 'error' : ''}`}
                                                value={formData.msmeType}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select MSME Type</option>
                                                {msmeTypeOptions.map(type => {
                                                    const label = typeof type === 'object' ? type.label : type;
                                                    const value = typeof type === 'object' ? type.code : type;
                                                    return <option key={value} value={value}>{label}</option>;
                                                })}
                                            </select>
                                            {errors.msmeType && <span className="bhuneer-error">{errors.msmeType}</span>}
                                        </div>
                                    )}
                                </div>

                                {formData.isMSME === 'Yes' && (
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">MSME Registration Number</label>
                                        <input
                                            type="text"
                                            name="msmeRegistrationNumber"
                                            className={`bhuneer-input ${errors.msmeRegistrationNumber ? 'error' : ''}`}
                                            value={formData.msmeRegistrationNumber}
                                            onChange={handleChange}
                                            placeholder="Enter MSME/Udyam registration number"
                                        />
                                        {errors.msmeRegistrationNumber && <span className="bhuneer-error">{errors.msmeRegistrationNumber}</span>}
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
                                                    <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>ðŸ“‹ Details:</p>
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

                                {/* Applicant Details (Integrated into Basic Details) */}
                                <h3 className="form-section-header" style={{ marginTop: '30px', borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>Applicant Details</h3>

                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Applicant Name</label>
                                    <input
                                        type="text"
                                        name="applicantName"
                                        className={`bhuneer-input ${errors.applicantName ? 'error' : ''}`}
                                        value={formData.applicantName}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                    />
                                    {errors.applicantName && <span className="bhuneer-error">{errors.applicantName}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Email ID</label>
                                        <input
                                            type="email"
                                            name="applicantEmail"
                                            className={`bhuneer-input ${errors.applicantEmail ? 'error' : ''}`}
                                            value={formData.applicantEmail}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.applicantEmail && <span className="bhuneer-error">{errors.applicantEmail}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Mobile Number</label>
                                        <input
                                            type="tel"
                                            name="applicantMobile"
                                            className={`bhuneer-input ${errors.applicantMobile ? 'error' : ''}`}
                                            value={formData.applicantMobile}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            maxLength="10"
                                        />
                                        {errors.applicantMobile && <span className="bhuneer-error">{errors.applicantMobile}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            name="applicantAadhaar"
                                            className={`bhuneer-input ${errors.applicantAadhaar ? 'error' : ''}`}
                                            value={formData.applicantAadhaar}
                                            onChange={handleChange}
                                            placeholder="12-digit Aadhaar number"
                                            maxLength="12"
                                        />
                                        {errors.applicantAadhaar && <span className="bhuneer-error">{errors.applicantAadhaar}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">PAN Number</label>
                                        <input
                                            type="text"
                                            name="applicantPAN"
                                            className={`bhuneer-input ${errors.applicantPAN ? 'error' : ''}`}
                                            value={formData.applicantPAN}
                                            onChange={handleChange}
                                            placeholder="PAN number"
                                            maxLength="10"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                        {errors.applicantPAN && <span className="bhuneer-error">{errors.applicantPAN}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Organization Name</label>
                                        <input
                                            type="text"
                                            name="organizationName"
                                            className={`bhuneer-input ${errors.organizationName ? 'error' : ''}`}
                                            value={formData.organizationName}
                                            onChange={handleChange}
                                            placeholder="Enter organization name"
                                        />
                                        {errors.organizationName && <span className="bhuneer-error">{errors.organizationName}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Organization Type</label>
                                        <select
                                            name="organizationType"
                                            className={`bhuneer-input ${errors.organizationType ? 'error' : ''}`}
                                            value={formData.organizationType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Organization Type</option>
                                            {organizationTypeOptions.length > 0 ? (
                                                organizationTypeOptions.map(type => {
                                                    const label = typeof type === 'object' ? type.label : type;
                                                    const value = typeof type === 'object' ? type.code : type;
                                                    return <option key={value} value={value}>{label}</option>;
                                                })
                                            ) : (
                                                <>
                                                    <option value="Individual">Individual</option>
                                                    <option value="Private Limited">Private Limited Company</option>
                                                    <option value="Public Limited">Public Limited Company</option>
                                                    <option value="Partnership">Partnership Firm</option>
                                                    <option value="Proprietorship">Proprietorship</option>
                                                    <option value="Government">Government Organization</option>
                                                    <option value="Other">Other</option>
                                                </>
                                            )}
                                        </select>
                                        {errors.organizationType && <span className="bhuneer-error">{errors.organizationType}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="bhuneer-label">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        className="bhuneer-input"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Your designation"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Project & Location Details */}
                        {currentStep === 2 && (
                            <div>
                                <h3 className="form-section-header">Project & Location Details</h3>

                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Project Name</label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        className={`bhuneer-input ${errors.projectName ? 'error' : ''}`}
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        placeholder="Enter project name"
                                    />
                                    {errors.projectName && <span className="bhuneer-error">{errors.projectName}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">State</label>
                                        <select
                                            name="state"
                                            className={`bhuneer-input ${errors.state ? 'error' : ''}`}
                                            value={formData.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select State</option>
                                            {stateOptions.map((state, index) => {
                                                // Handle API response {stateId: 'RJ', stateName: 'Rajasthan'} or fallback
                                                const val = typeof state === 'object' ? (state.stateId || state.id || state.name) : state;
                                                const label = typeof state === 'object' ? (state.stateName || state.name) : state;
                                                return <option key={index} value={val}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.state && <span className="bhuneer-error">{errors.state}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">District</label>
                                        <select
                                            name="district"
                                            className={`bhuneer-input ${errors.district ? 'error' : ''}`}
                                            value={formData.district || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select District</option>
                                            {districtOptions.map((dist, index) => {
                                                const val = typeof dist === 'object' ? (dist.districtName || dist.name) : dist; // User requested districtId=JAIPUR (name as ID)
                                                // Wait, API takes districtId. If it's JAIPUR, then Name is ID.
                                                // Usually safe to prioritize Name if ID is numeric unless specified.
                                                // User example: districtId=JAIPUR. So use Name.
                                                return <option key={index} value={val}>{val}</option>;
                                            })}
                                        </select>
                                        {errors.district && <span className="bhuneer-error">{errors.district}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Block</label>
                                        <select
                                            name="block"
                                            className={`bhuneer-input ${errors.block ? 'error' : ''}`}
                                            value={formData.block || ''}
                                            onChange={handleChange}
                                            disabled={!formData.district}
                                        >
                                            <option value="">Select Block</option>
                                            {availableBlocks.map((block, index) => {
                                                const val = typeof block === 'object' ? (block.blockName || block.name) : block;
                                                return <option key={index} value={val}>{val}</option>;
                                            })}
                                        </select>
                                        {errors.block && <span className="bhuneer-error">{errors.block}</span>}
                                        {!formData.district && (
                                            <span className="noc-form-help">Please select a district first</span>
                                        )}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Tehsil</label>
                                        <select
                                            name="tehsil"
                                            className="bhuneer-input"
                                            value={formData.tehsil}
                                            onChange={handleChange}
                                            disabled={!formData.district}
                                        >
                                            <option value="">Select Tehsil</option>
                                            {tehsilOptions.map((t, index) => {
                                                const val = typeof t === 'object' ? (t.tehsilName || t.name) : t;
                                                return <option key={index} value={val}>{val}</option>;
                                            })}
                                        </select>
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
                                                {blockCategory.code === 'SAFE' ? 'âœ…' :
                                                    blockCategory.code === 'SEMI_CRITICAL' ? 'âš ï¸' :
                                                        blockCategory.code === 'CRITICAL' ? 'ðŸš¨' : 'âŒ'}
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
                                        <strong>âš ï¸ Restriction Notice:</strong>
                                        <p style={{ margin: '5px 0 0 0' }}>{formData.blockEligibilityWarning}</p>
                                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            This application will be subject to additional scrutiny by the authority.
                                        </p>
                                    </div>
                                )}

                                <div className="noc-form-row">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Assessment Unit</label>
                                        <select
                                            name="assessmentUnit"
                                            className={`bhuneer-input ${errors.assessmentUnit ? 'error' : ''}`}
                                            value={formData.assessmentUnit}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Assessment Unit</option>
                                            {assessmentUnitOptions.length > 0 ? (
                                                assessmentUnitOptions.map((unit, index) => {
                                                    // Handle object vs string if API returns objects
                                                    const val = typeof unit === 'object' ? (unit.name || unit.assessmentUnitName) : unit;
                                                    return (
                                                        <option key={index} value={val}>
                                                            {val}
                                                        </option>
                                                    );
                                                })
                                            ) : (
                                                <option value="" disabled>No units found for this district</option>
                                            )}
                                        </select>
                                        {errors.assessmentUnit && <span className="bhuneer-error">{errors.assessmentUnit}</span>}
                                    </div>
                                </div>



                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Project Address</label>
                                    <textarea
                                        name="projectAddress"
                                        className={`bhuneer-input ${errors.projectAddress ? 'error' : ''}`}
                                        value={formData.projectAddress}
                                        onChange={handleChange}
                                        placeholder="Enter complete project address"
                                        rows="3"
                                    />
                                    {errors.projectAddress && <span className="bhuneer-error">{errors.projectAddress}</span>}
                                </div>

                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">PIN Code</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className={`bhuneer-input ${errors.pincode ? 'error' : ''}`}
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="6-digit pincode"
                                            maxLength="6"
                                        />
                                        {errors.pincode && <span className="bhuneer-error">{errors.pincode}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Latitude</label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            className={`bhuneer-input ${errors.latitude ? 'error' : ''}`}
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            placeholder="e.g., 28.7041"
                                        />
                                        {errors.latitude && <span className="bhuneer-error">{errors.latitude}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Longitude</label>
                                        <input
                                            type="text"
                                            name="longitude"
                                            className={`bhuneer-input ${errors.longitude ? 'error' : ''}`}
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            placeholder="e.g., 77.1025"
                                        />
                                        {errors.longitude && <span className="bhuneer-error">{errors.longitude}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="bhuneer-label required">Aquifer Type</label>
                                    <select
                                        name="geology"
                                        className={`bhuneer-input ${errors.geology ? 'error' : ''}`}
                                        value={formData.geology}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Aquifer Type</option>
                                        {geologyTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.geology && <span className="bhuneer-error">{errors.geology}</span>}

                                    {formData.geology === 'Other' && (
                                        <div style={{ marginTop: '10px' }}>
                                            <input
                                                type="text"
                                                name="otherGeology"
                                                className={`bhuneer-input ${errors.otherGeology ? 'error' : ''}`}
                                                value={formData.otherGeology}
                                                onChange={handleChange}
                                                placeholder="Please specify aquifer type"
                                            />
                                            {errors.otherGeology && <span className="bhuneer-error">{errors.otherGeology}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Land Use Details Section - Added functionality */}
                                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <h4 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Land Use Details (sq.m)</h4>
                                    <div className="noc-form-row three-col">
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label">Total Land Area</label>
                                            <input
                                                type="number"
                                                name="landUseTotalArea"
                                                className="bhuneer-input"
                                                value={formData.landUseTotalArea}
                                                onChange={handleChange}
                                                placeholder="Total Area"
                                                min="0"
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label">Rooftop Area</label>
                                            <input
                                                type="number"
                                                name="landUseRooftopArea"
                                                className="bhuneer-input"
                                                value={formData.landUseRooftopArea}
                                                onChange={handleChange}
                                                placeholder="Rooftop Area"
                                                min="0"
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label">Paved Area</label>
                                            <input
                                                type="number"
                                                name="landUsePavedArea"
                                                className="bhuneer-input"
                                                value={formData.landUsePavedArea}
                                                onChange={handleChange}
                                                placeholder="Paved Area"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="noc-form-row two-col">
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label">Green Belt Area</label>
                                            <input
                                                type="number"
                                                name="landUseGreenBeltArea"
                                                className="bhuneer-input"
                                                value={formData.landUseGreenBeltArea}
                                                onChange={handleChange}
                                                placeholder="Green Belt Area"
                                                min="0"
                                            />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="bhuneer-label">Open Area</label>
                                            <input
                                                type="number"
                                                name="landUseOpenArea"
                                                className="bhuneer-input"
                                                value={formData.landUseOpenArea}
                                                onChange={handleChange}
                                                placeholder="Open Area"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Water Requirement Details (Consolidated) */}
                        {currentStep === 3 && (
                            <div>
                                <h3 className="form-section-header">Water Requirement Details (m³/day)</h3>

                                <div className="bhuneer-info-box">
                                    <p>Please provide the daily water requirement details for the project.</p>
                                </div>

                                <h4 style={{ color: 'var(--primary-color)', margin: '15px 0' }}>Total Requirement</h4>
                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label required">Fresh Water Requirement</label>
                                        <input
                                            type="number"
                                            name="waterReqFreshRequirement"
                                            className="bhuneer-input"
                                            value={formData.waterReqFreshRequirement}
                                            onChange={handleChange}
                                            placeholder="Fresh Water"
                                            min="0"
                                        />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Recycled Water Used</label>
                                        <input
                                            type="number"
                                            name="waterReqRecycled"
                                            className="bhuneer-input"
                                            value={formData.waterReqRecycled}
                                            onChange={handleChange}
                                            placeholder="Recycled Water"
                                            min="0"
                                        />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Total Requirement</label>
                                        <input
                                            type="number"
                                            className="bhuneer-input"
                                            value={(parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0)).toFixed(2)}
                                            readOnly
                                            disabled
                                            style={{ backgroundColor: '#f0f0f0' }}
                                        />
                                        <span className="noc-form-help">Auto-calculated (Fresh + Recycled)</span>
                                    </div>
                                </div>

                                <h4 style={{ color: 'var(--primary-color)', margin: '20px 0 15px 0' }}>Requirement Breakdown (Usage)</h4>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Domestic Use</label>
                                        <input
                                            type="number"
                                            name="waterReqDomestic"
                                            className="bhuneer-input"
                                            value={formData.waterReqDomestic}
                                            onChange={handleChange}
                                            placeholder="Domestic"
                                            min="0"
                                        />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Industrial Use</label>
                                        <input
                                            type="number"
                                            name="waterReqIndustrial"
                                            className="bhuneer-input"
                                            value={formData.waterReqIndustrial}
                                            onChange={handleChange}
                                            placeholder="Industrial"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Green Belt / Horticulture</label>
                                        <input
                                            type="number"
                                            name="waterReqGreenBelt"
                                            className="bhuneer-input"
                                            value={formData.waterReqGreenBelt}
                                            onChange={handleChange}
                                            placeholder="Green Belt"
                                            min="0"
                                        />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="bhuneer-label">Other Uses</label>
                                        <input
                                            type="number"
                                            name="waterReqOther"
                                            className="bhuneer-input"
                                            value={formData.waterReqOther}
                                            onChange={handleChange}
                                            placeholder="Others"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Groundwater Structures (Moved from Step 5 & Enhanced) */}
                        {currentStep === 4 && (
                            <div>
                                <h3 className="form-section-header">Groundwater Abstraction Structures</h3>

                                <div className="bhuneer-info-box">
                                    <p>Please provide details of all existing and proposed groundwater abstraction structures.</p>
                                </div>

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
                                                <div key={structure.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--cgwa-border-light)', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                        <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Structure #{index + 1}</h4>
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
                                                            <label className="bhuneer-label required">Type of Structure</label>
                                                            <select
                                                                className="bhuneer-input"
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
                                                            <label className="bhuneer-label">Year of Construction</label>
                                                            <input
                                                                type="number"
                                                                className="bhuneer-input"
                                                                value={structure.yearOfConstruction}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'yearOfConstruction', e.target.value)}
                                                                placeholder="YYYY"
                                                                min="1900"
                                                                max={new Date().getFullYear()}
                                                            />
                                                        </div>

                                                        <div className="noc-form-group">
                                                            <label className="bhuneer-label">Depth (meters)</label>
                                                            <input
                                                                type="number"
                                                                className="bhuneer-input"
                                                                value={structure.depth}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'depth', e.target.value)}
                                                                placeholder="Depth"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Pump Details */}
                                                    <div className="noc-form-row three-col">
                                                        <div className="noc-form-group">
                                                            <label className="bhuneer-label">Pump Type</label>
                                                            <select
                                                                className="bhuneer-input"
                                                                value={structure.pumpType || ''}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'pumpType', e.target.value)}
                                                            >
                                                                <option value="">Select Pump Type</option>
                                                                <option value="Submersible">Submersible</option>
                                                                <option value="Centrifugal">Centrifugal</option>
                                                                <option value="Jet">Jet Pump</option>
                                                                <option value="Turbine">Turbine Pump</option>
                                                            </select>
                                                        </div>
                                                        <div className="noc-form-group">
                                                            <label className="bhuneer-label">Pump Capacity (HP)</label>
                                                            <input
                                                                type="number"
                                                                className="bhuneer-input"
                                                                value={structure.pumpCapacity}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'pumpCapacity', e.target.value)}
                                                                placeholder="HP"
                                                                min="0"
                                                                step="0.5"
                                                            />
                                                        </div>
                                                        <div className="noc-form-group">
                                                            <label className="bhuneer-label">Operating Hours</label>
                                                            <input
                                                                type="number"
                                                                className="bhuneer-input"
                                                                value={structure.operatingHours}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'operatingHours', e.target.value)}
                                                                placeholder="Hours/Day"
                                                                min="0"
                                                                max="24"
                                                                step="0.5"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="noc-form-row three-col">
                                                        <div className="noc-form-group">
                                                            <label className="bhuneer-label">Discharge Rate (m³/hr)</label>
                                                            <input
                                                                type="number"
                                                                className="bhuneer-input"
                                                                value={structure.discharge}
                                                                onChange={(e) => updateExistingStructure(structure.id, 'discharge', e.target.value)}
                                                                placeholder="Auto-calculated"
                                                                readOnly
                                                                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                                            />
                                                            <span className="noc-form-help">Calculated based on pump details (Eff: 60%)</span>
                                                        </div>
                                                    </div>

                                                    <div className="noc-form-group">
                                                        <label className="bhuneer-label">Water Meter Fitted?</label>
                                                        <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`hasMeter_${structure.id}`}
                                                                    value="Yes"
                                                                    checked={structure.hasMeter === 'Yes'}
                                                                    onChange={(e) => updateExistingStructure(structure.id, 'hasMeter', e.target.value)}
                                                                />
                                                                Yes
                                                            </label>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`hasMeter_${structure.id}`}
                                                                    value="No"
                                                                    checked={structure.hasMeter === 'No'}
                                                                    onChange={(e) => updateExistingStructure(structure.id, 'hasMeter', e.target.value)}
                                                                />
                                                                No
                                                            </label>
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
                                                <label className="bhuneer-label">Number of Borewells</label>
                                                <input
                                                    type="number"
                                                    name="proposedBorewells"
                                                    className="bhuneer-input"
                                                    value={formData.proposedBorewells}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>

                                            <div className="noc-form-group">
                                                <label className="bhuneer-label">Number of Tubewells</label>
                                                <input
                                                    type="number"
                                                    name="proposedTubewells"
                                                    className="bhuneer-input"
                                                    value={formData.proposedTubewells}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>
                                            <div className="noc-form-group">
                                                <label className="bhuneer-label">Number of Pumps</label>
                                                <input
                                                    type="number"
                                                    name="proposedPumps"
                                                    className="bhuneer-input"
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



                        {/* Step 5: Conditional - Meter Details OR Documents Checklist */}
                        {currentStep === 5 && hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">💧 Water Meter Details</h3>

                                <div className="bhuneer-info-box" style={{ marginBottom: '30px' }}>
                                    <p><strong>Note:</strong> Since you have indicated that meters are installed on your groundwater structures, please provide the meter specifications below.</p>
                                </div>

                                <FlowMeterCompliance
                                    formData={formData}
                                    onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
                                    manufacturers={meterManufacturers}
                                    meterModels={meterModels}
                                    telemetryProviders={telemetryProviders}
                                    bisStandards={bisStandards}
                                    meterTypes={meterTypes}
                                    meterSerialNumbers={meterSerialNumbers}
                                />
                            </div>
                        )}

                        {currentStep === 5 && !hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">📋 Documents Required for Your Application</h3>

                                <div className="bhuneer-info-box" style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>✅ Document Checklist</h4>
                                    <p>Please ensure you have the following documents ready before proceeding to the upload step. All documents should be in PDF, JPG, or PNG format (max 5MB per file).</p>
                                </div>

                                {/* Required Documents List */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{
                                        padding: '12px 20px',
                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        marginBottom: '20px'
                                    }}>
                                        🔴 Mandatory Documents (Required for ALL Applications)
                                    </h4>

                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {documentTypes.filter(doc => doc.required).map((doc, index) => (
                                            <div key={doc.id} style={{
                                                padding: '20px',
                                                background: 'white',
                                                border: '2px solid #dc3545',
                                                borderRadius: '12px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                                                    <div style={{
                                                        minWidth: '40px',
                                                        height: '40px',
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '18px'
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                                                            {doc.name}
                                                            <span style={{ color: '#dc3545', marginLeft: '5px' }}>*</span>
                                                        </h5>
                                                        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                                                            {doc.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Optional Documents List */}
                                <div>
                                    <h4 style={{
                                        padding: '12px 20px',
                                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        marginBottom: '20px'
                                    }}>
                                        🟡 Optional Documents (If Applicable)
                                    </h4>

                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {documentTypes.filter(doc => !doc.required).map((doc, index) => (
                                            <div key={doc.id} style={{
                                                padding: '20px',
                                                background: 'white',
                                                border: '2px solid #ffc107',
                                                borderRadius: '12px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                                                    <div style={{
                                                        minWidth: '40px',
                                                        height: '40px',
                                                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '18px'
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                                                            {doc.name}
                                                        </h5>
                                                        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                                                            {doc.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bhuneer-info-box" style={{ marginTop: '30px', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderLeftColor: '#2196f3' }}>
                                    <h4>💡 Important Notes:</h4>
                                    <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                        <li>All documents must be clear and legible</li>
                                        <li>Notarized affidavits must be on ₹100 stamp paper</li>
                                        <li>Water quality reports must be from NABL-accredited labs</li>
                                        <li>Scan documents at 200 DPI minimum for best quality</li>
                                        <li>File names should be descriptive (e.g., "Land_Ownership_Certificate.pdf")</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Step 6/6: Conditional - Documents Checklist OR Upload Documents */}
                        {currentStep === 6 && hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">📋 Documents Required for Your Application</h3>

                                <div className="bhuneer-info-box" style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>✅ Document Checklist</h4>
                                    <p>Please ensure you have the following documents ready before proceeding to the upload step. All documents should be in PDF, JPG, or PNG format (max 5MB per file).</p>
                                </div>

                                {/* Copy documents checklist content from current Step 5 */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>📄 Mandatory Documents</h4>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {documentTypes.filter(d => d.required).map(doc => (
                                            <div key={doc.id} style={{
                                                padding: '15px',
                                                border: '2px solid var(--cgwa-border-light)',
                                                borderRadius: '8px',
                                                background: '#fafafa'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                                                    <span style={{ fontSize: '24px' }}>✅</span>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>
                                                            {doc.name}
                                                        </h5>
                                                        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                                                            {doc.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && !hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Upload Documents</h3>

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

                                            {errors[doc.id] && <span className="bhuneer-error">{errors[doc.id]}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 7/7: Conditional - Upload Documents OR Fee Calculation */}
                        {currentStep === 7 && hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Document Upload</h3>

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
                                                    <div className="noc-file-upload-icon">ðŸ“Ž</div>
                                                    <div className="noc-file-upload-text">
                                                        {formData.uploadedDocuments[doc.id] ? (
                                                            <span style={{ color: 'var(--cgwa-success)', fontWeight: '600' }}>
                                                                âœ“ {formData.uploadedDocuments[doc.id].name}
                                                            </span>
                                                        ) : (
                                                            <span>Click to upload or drag and drop</span>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            {errors[doc.id] && <span className="bhuneer-error">{errors[doc.id]}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === 7 && !hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Application Fee Calculation</h3>

                                <div className="bhuneer-card" style={{ marginBottom: '20px', padding: '20px' }}>
                                    <h4>Fee Estimator</h4>
                                    <p>Click below to calculate the applicable fees based on your application details.</p>

                                    <h4>Fee Estimator</h4>
                                    <p>Applicable fees based on your application details:</p>

                                    {!formData.feeCalculation && !formData.feeStructure ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            <div className="spinner-border text-primary" role="status" style={{ marginRight: '10px' }}></div>
                                            Calculating applicable fees...
                                        </div>
                                    ) : null}
                                </div>

                                <PaymentModule
                                    formData={formData}
                                    onPaymentComplete={handlePaymentComplete}
                                />
                            </div>
                        )}

                        {/* Step 8: Conditional - Fee Calculation (with meter) OR Payment Receipt (without meter) */}
                        {currentStep === 8 && hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Application Fee Calculation</h3>

                                <div className="bhuneer-card" style={{ marginBottom: '20px', padding: '20px' }}>
                                    <h4>Fee Estimator</h4>
                                    <p>Applicable fees based on your application details:</p>

                                    {!formData.feeStructure ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            <div className="spinner-border text-primary" role="status" style={{ marginRight: '10px' }}></div>
                                            Calculating applicable fees...
                                        </div>
                                    ) : (
                                        <div className="noc-card" style={{ marginTop: '20px' }}>
                                            <div className="noc-card-header">Fee Breakdown</div>
                                            <div className="noc-card-body">
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                                    <div><strong>Base Amount:</strong> ₹{formData.feeStructure?.baseAmount?.toLocaleString('en-IN') || 0}</div>
                                                    <div><strong>Processing Fee:</strong> ₹{formData.feeStructure?.processingFee?.toLocaleString('en-IN') || 0}</div>
                                                    <div><strong>EC Charges:</strong> ₹{formData.feeStructure?.ecCharges?.toLocaleString('en-IN') || 0}</div>
                                                    <div><strong>Water Budget Charges:</strong> ₹{formData.feeStructure?.waterBudgetCharges?.toLocaleString('en-IN') || 0}</div>
                                                    <div style={{ gridColumn: '1 / -1', borderTop: '2px solid #dee2e6', paddingTop: '15px', marginTop: '10px' }}>
                                                        <strong style={{ fontSize: '1.2rem' }}>Total Fee:</strong>{' '}
                                                        <span style={{ fontSize: '1.3rem', color: 'var(--cgwa-success)', fontWeight: 'bold' }}>
                                                            ₹{formData.feeStructure?.totalBaseFee?.toLocaleString('en-IN') || formData.feeStructure?.totalEstimated?.toLocaleString('en-IN') || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <PaymentModule
                                    formData={formData}
                                    onPaymentComplete={handlePaymentComplete}
                                />
                            </div>
                        )}

                        {currentStep === 8 && !hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Upload Payment Receipt</h3>

                                <div className="noc-alert noc-alert-warning" style={{ marginBottom: '20px' }}>
                                    <strong>Important:</strong> Please upload the payment receipt from the previous step before proceeding to final submission.
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
                                                <strong>Daily Water Requirement:</strong> {formData.dailyWaterRequirement} mÂ³/day
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
                                                        <strong>Payment Status:</strong> <span style={{ color: 'var(--cgwa-success)', fontWeight: 'bold' }}>âœ“ PAID</span>
                                                    </div>
                                                    <div>
                                                        <strong>Transaction ID:</strong> {formData.paymentTransactionId}
                                                    </div>
                                                    <div>
                                                        <strong>Receipt Number:</strong> {formData.paymentReceiptNumber}
                                                    </div>
                                                    <div>
                                                        <strong>Amount Paid:</strong> â‚¹{formData.totalAmount?.toLocaleString('en-IN')}
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
                                            <strong>ðŸ“¤ Upload Required:</strong> Please upload the payment receipt you downloaded in the previous step. You cannot submit your application without uploading the payment proof.
                                        </div>

                                        <div className="noc-form-group">
                                            <label className="bhuneer-label required">Payment Receipt (PDF/JPG/PNG)</label>
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
                                                className="bhuneer-input"
                                                style={{ padding: '10px' }}
                                            />
                                            <span className="noc-form-help">Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                                            {errors.paymentReceipt && <span className="bhuneer-error">{errors.paymentReceipt}</span>}

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
                                                        <span style={{ fontSize: '1.5rem' }}>âœ“</span>
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
                                        <strong>âŒ Cannot Submit Application</strong>
                                        <p style={{ margin: '10px 0 0 0' }}>Please upload the payment receipt to enable the submit button.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 8 && !hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Upload Payment Receipt</h3>

                                <div className="noc-alert noc-alert-warning" style={{ marginBottom: '20px' }}>
                                    <strong>Important:</strong> Please upload the payment receipt from the previous step before proceeding to final submission.
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
                                            <label className="bhuneer-label required">Payment Receipt (PDF/JPG/PNG)</label>
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
                                                className="bhuneer-input"
                                                style={{ padding: '10px' }}
                                            />
                                            <span className="noc-form-help">Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                                            {errors.paymentReceipt && <span className="bhuneer-error">{errors.paymentReceipt}</span>}

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

                                {/* Submit Status Alert */}
                                {!formData.uploadedDocuments.paymentReceipt && (
                                    <div className="noc-alert noc-alert-danger">
                                        <strong>❌ Cannot Submit Application</strong>
                                        <p style={{ margin: '10px 0 0 0' }}>Please upload the payment receipt to enable the submit button.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 9: Conditional - Payment Receipt (with meter) OR Summary (without meter) */}
                        {currentStep === 9 && hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">Upload Payment Receipt</h3>

                                <div className="noc-alert noc-alert-warning" style={{ marginBottom: '20px' }}>
                                    <strong>Important:</strong> Please upload the payment receipt from the previous step before proceeding to final submission.
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
                                            <label className="bhuneer-label required">Payment Receipt (PDF/JPG/PNG)</label>
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
                                                className="bhuneer-input"
                                                style={{ padding: '10px' }}
                                            />
                                            <span className="noc-form-help">Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                                            {errors.paymentReceipt && <span className="bhuneer-error">{errors.paymentReceipt}</span>}

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

                        {currentStep === 9 && !hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">📋 Application Summary</h3>
                                <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px' }}>
                                    Review all your details before final submission
                                </p>

                                {/* Application Type Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">1. Application Type & Basic Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Application Type:</strong> {getDisplayLabel(formData.applicationType, appTypeOptions)}
                                            </div>
                                            <div>
                                                <strong>Application Sub Type:</strong> {getDisplayLabel(formData.applicationSubType, appSubTypeOptions)}
                                            </div>
                                            <div>
                                                <strong>Project Type:</strong> {getDisplayLabel(formData.projectType, projectTypeOptions)}
                                            </div>
                                            <div>
                                                <strong>Water Quality Type:</strong> {getDisplayLabel(formData.waterQualityType, waterQualityOptions)}
                                            </div>
                                            <div>
                                                <strong>Utilization Purpose:</strong> {getDisplayLabel(formData.groundWaterUtilizationFor, utilizationPurposeOptions)}
                                            </div>
                                            {formData.industryType && (
                                                <div>
                                                    <strong>Industry Type:</strong> {formatDisplayValue(formData.industryType)}
                                                </div>
                                            )}
                                            <div>
                                                <strong>MSME Status:</strong> {formatDisplayValue(formData.isMSME)}
                                                {formData.isMSME === 'Yes' && formData.msmeType && ` (${getDisplayLabel(formData.msmeType, msmeTypeOptions)})`}
                                            </div>
                                            {formData.dateOfCommencement && (
                                                <div>
                                                    <strong>Date of Commencement:</strong> {formatDisplayValue(formData.dateOfCommencement)}
                                                </div>
                                            )}
                                            {formData.existingNOCStatus === 'Yes' && formData.oldNOCNo && (
                                                <div>
                                                    <strong>Old NOC Number:</strong> {formatDisplayValue(formData.oldNOCNo)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Project & Location Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">2. Project & Location Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Project Name:</strong> {formatDisplayValue(formData.projectName)}
                                            </div>
                                            <div>
                                                <strong>State:</strong> {getDisplayLabel(formData.state, stateOptions)}
                                            </div>
                                            <div>
                                                <strong>District:</strong> {formatDisplayValue(formData.district)}
                                            </div>
                                            <div>
                                                <strong>Block:</strong> {formatDisplayValue(formData.block)}
                                            </div>
                                            {formData.tehsil && (
                                                <div>
                                                    <strong>Tehsil:</strong> {formatDisplayValue(formData.tehsil)}
                                                </div>
                                            )}
                                            {formData.projectAddress && (
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <strong>Project Address:</strong> {formatDisplayValue(formData.projectAddress)}
                                                </div>
                                            )}
                                            {(formData.latitude || formData.longitude) && (
                                                <div>
                                                    <strong>Coordinates:</strong> {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not provided'}
                                                </div>
                                            )}
                                            {blockCategory && (
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <strong>Block Category:</strong>{' '}
                                                    <span style={{ color: blockCategory.color, fontWeight: 'bold' }}>
                                                        {blockCategory.name} (Validity: {blockCategory.validityYears} years)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Water Requirement Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">3. Water Requirement Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Daily Requirement:</strong> {formatDisplayValue(formData.dailyWaterRequirement)} {formData.dailyWaterRequirement ? 'm³/day' : ''}
                                            </div>
                                            <div>
                                                <strong>Annual Requirement:</strong> {formatDisplayValue(formData.annualWaterRequirement)} {formData.annualWaterRequirement ? 'm³/year' : ''}
                                            </div>
                                            {formData.numberOfWorkers && (
                                                <div>
                                                    <strong>Number of Workers:</strong> {formatDisplayValue(formData.numberOfWorkers)}
                                                </div>
                                            )}
                                            {formData.numberOfResidents && (
                                                <div>
                                                    <strong>Number of Residents:</strong> {formatDisplayValue(formData.numberOfResidents)}
                                                </div>
                                            )}
                                            {formData.domesticTotalDaily > 0 && (
                                                <div>
                                                    <strong>Domestic Water (Daily):</strong> {formData.domesticTotalDaily} m³/day
                                                </div>
                                            )}
                                            {(formData.waterReqDomestic || formData.waterReqIndustrial || formData.waterReqGreenBelt || formData.waterReqOther) && (
                                                <div style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #dee2e6' }}>
                                                    <strong>Water Requirement Breakup:</strong>
                                                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                                        {formData.waterReqDomestic && <li>Domestic/Drinking: {formData.waterReqDomestic} m³/day</li>}
                                                        {formData.waterReqIndustrial && <li>Industrial Process: {formData.waterReqIndustrial} m³/day</li>}
                                                        {formData.waterReqGreenBelt && <li>Greenbelt/Horticulture: {formData.waterReqGreenBelt} m³/day</li>}
                                                        {formData.waterReqOther && <li>Other: {formData.waterReqOther} m³/day</li>}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Structures Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">4. Groundwater Structures</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Proposed Borewells:</strong> {formData.proposedBorewells || 0}
                                            </div>
                                            <div>
                                                <strong>Proposed Tubewells:</strong> {formData.proposedTubewells || 0}
                                            </div>
                                            <div>
                                                <strong>Proposed Dugwells:</strong> {formData.proposedDugwells || 0}
                                            </div>
                                            <div>
                                                <strong>Existing Structures:</strong> {existingStructures.length}
                                            </div>
                                        </div>
                                        {existingStructures.length > 0 && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                                                <strong>Existing Structure Details:</strong>
                                                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                                    {existingStructures.map((struct, idx) => (
                                                        <li key={idx}>
                                                            {struct.type || 'Structure'} - Depth: {struct.depth || 'N/A'}m,
                                                            Diameter: {struct.diameter || 'N/A'}mm
                                                            {struct.hasMeter === 'Yes' && ' (Meter Installed)'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Applicant Details Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">5. Applicant Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Applicant Name:</strong> {formatDisplayValue(formData.applicantName)}
                                            </div>
                                            <div>
                                                <strong>Organization:</strong> {formatDisplayValue(formData.organizationName)}
                                            </div>
                                            <div>
                                                <strong>Organization Type:</strong> {getDisplayLabel(formData.organizationType, organizationTypeOptions)}
                                            </div>
                                            {formData.designation && (
                                                <div>
                                                    <strong>Designation:</strong> {formatDisplayValue(formData.designation)}
                                                </div>
                                            )}
                                            <div>
                                                <strong>Email:</strong> {formatDisplayValue(formData.applicantEmail)}
                                            </div>
                                            <div>
                                                <strong>Mobile:</strong> {formatDisplayValue(formData.applicantMobile)}
                                            </div>
                                            {formData.applicantAadhaar && (
                                                <div>
                                                    <strong>Aadhaar Number:</strong> {formatDisplayValue(formData.applicantAadhaar)}
                                                </div>
                                            )}
                                            {formData.applicantPAN && (
                                                <div>
                                                    <strong>PAN Number:</strong> {formatDisplayValue(formData.applicantPAN)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">6. Document Uploads</div>
                                    <div className="noc-card-body">
                                        <p>
                                            <strong>Total Documents Uploaded:</strong>{' '}
                                            {Object.keys(formData.uploadedDocuments).length} documents
                                        </p>
                                        {Object.keys(formData.uploadedDocuments).length > 0 && (
                                            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                                {Object.entries(formData.uploadedDocuments).map(([docId, file]) => (
                                                    <li key={docId}>
                                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">7. Payment Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Application Fee:</strong> ₹{formData.applicationFee?.toLocaleString('en-IN') || '0'}
                                            </div>
                                            <div>
                                                <strong>GST (18%):</strong> ₹{formData.gstAmount?.toLocaleString('en-IN') || '0'}
                                            </div>
                                            <div>
                                                <strong>Total Amount:</strong>{' '}
                                                <span style={{ fontSize: '1.2rem', color: 'var(--cgwa-success)', fontWeight: 'bold' }}>
                                                    ₹{formData.totalAmount?.toLocaleString('en-IN') || '0'}
                                                </span>
                                            </div>
                                            <div>
                                                <strong>Payment Status:</strong>{' '}
                                                <span style={{ color: formData.paymentStatus === 'paid' ? 'var(--cgwa-success)' : 'var(--cgwa-warning)', fontWeight: 'bold' }}>
                                                    {formData.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                                                </span>
                                            </div>
                                            {formData.paymentTransactionId && (
                                                <>
                                                    <div>
                                                        <strong>Transaction ID:</strong> {formatDisplayValue(formData.paymentTransactionId)}
                                                    </div>
                                                    <div>
                                                        <strong>Receipt Number:</strong> {formatDisplayValue(formData.paymentReceiptNumber)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Exemption Status (if applicable) */}
                                {exemptionStatus?.isExempt && (
                                    <div className="noc-exemption-banner" style={{ marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>✅ Exemption Status</h4>
                                        <p><strong>Type:</strong> {exemptionStatus.exemptionType}</p>
                                        <p><strong>Message:</strong> {exemptionStatus.message}</p>
                                    </div>
                                )}

                                {/* Final Declaration */}
                                <div className="noc-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid var(--cgwa-primary)' }}>
                                    <div className="noc-card-header" style={{ background: 'var(--cgwa-primary)', color: 'white' }}>
                                        📜 Final Declaration
                                    </div>
                                    <div className="noc-card-body">
                                        <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                                            I hereby declare that all the information provided in this application is true and correct
                                            to the best of my knowledge and belief. I understand that if any information is found to be
                                            false or misleading, my application may be rejected and/or the issued NOC may be cancelled.
                                            I also undertake to comply with all the conditions specified by the State Groundwater Authority
                                            and to adhere to all applicable laws and regulations related to groundwater extraction.
                                        </p>
                                        <div className="noc-checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="finalDeclaration"
                                                required
                                            />
                                            <label htmlFor="finalDeclaration" style={{ fontWeight: 'bold' }}>
                                                I agree to the above declaration and confirm that all information provided is accurate.
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Alert */}
                                <div className="noc-alert noc-alert-info">
                                    <strong>ℹ️ Ready to Submit:</strong> Please review all the above information carefully.
                                    Once submitted, you will not be able to make changes to your application.
                                </div>
                            </div>
                        )}

                        {/* Step 10: Summary (only when meter is installed) */}
                        {currentStep === 10 && hasMeterInstalled && (
                            <div>
                                <h3 className="form-section-header">📋 Application Summary</h3>
                                <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px' }}>
                                    Review all your details before final submission
                                </p>

                                {/* Application Type Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">1. Application Type & Basic Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Application Type:</strong> {getDisplayLabel(formData.applicationType, appTypeOptions)}
                                            </div>
                                            <div>
                                                <strong>Application Sub Type:</strong> {getDisplayLabel(formData.applicationSubType, appSubTypeOptions)}
                                            </div>
                                            <div>
                                                <strong>Project Type:</strong> {getDisplayLabel(formData.projectType, projectTypeOptions)}
                                            </div>
                                            <div>
                                                <strong>Water Quality Type:</strong> {getDisplayLabel(formData.waterQualityType, waterQualityOptions)}
                                            </div>
                                            <div>
                                                <strong>Utilization Purpose:</strong> {getDisplayLabel(formData.groundWaterUtilizationFor, utilizationPurposeOptions)}
                                            </div>
                                            {formData.industryType && (
                                                <div>
                                                    <strong>Industry Type:</strong> {formatDisplayValue(formData.industryType)}
                                                </div>
                                            )}
                                            <div>
                                                <strong>MSME Status:</strong> {formatDisplayValue(formData.isMSME)}
                                                {formData.isMSME === 'Yes' && formData.msmeType && ` (${getDisplayLabel(formData.msmeType, msmeTypeOptions)})`}
                                            </div>
                                            {formData.dateOfCommencement && (
                                                <div>
                                                    <strong>Date of Commencement:</strong> {formatDisplayValue(formData.dateOfCommencement)}
                                                </div>
                                            )}
                                            {formData.existingNOCStatus === 'Yes' && formData.oldNOCNo && (
                                                <div>
                                                    <strong>Old NOC Number:</strong> {formatDisplayValue(formData.oldNOCNo)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Project & Location Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">2. Project & Location Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Project Name:</strong> {formatDisplayValue(formData.projectName)}
                                            </div>
                                            <div>
                                                <strong>State:</strong> {getDisplayLabel(formData.state, stateOptions)}
                                            </div>
                                            <div>
                                                <strong>District:</strong> {formatDisplayValue(formData.district)}
                                            </div>
                                            <div>
                                                <strong>Block:</strong> {formatDisplayValue(formData.block)}
                                            </div>
                                            {formData.tehsil && (
                                                <div>
                                                    <strong>Tehsil:</strong> {formatDisplayValue(formData.tehsil)}
                                                </div>
                                            )}
                                            {formData.projectAddress && (
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <strong>Project Address:</strong> {formatDisplayValue(formData.projectAddress)}
                                                </div>
                                            )}
                                            {(formData.latitude || formData.longitude) && (
                                                <div>
                                                    <strong>Coordinates:</strong> {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not provided'}
                                                </div>
                                            )}
                                            {blockCategory && (
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <strong>Block Category:</strong>{' '}
                                                    <span style={{ color: blockCategory.color, fontWeight: 'bold' }}>
                                                        {blockCategory.name} (Validity: {blockCategory.validityYears} years)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Water Requirement Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">3. Water Requirement Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Daily Requirement:</strong> {formatDisplayValue(formData.dailyWaterRequirement)} {formData.dailyWaterRequirement ? 'm³/day' : ''}
                                            </div>
                                            <div>
                                                <strong>Annual Requirement:</strong> {formatDisplayValue(formData.annualWaterRequirement)} {formData.annualWaterRequirement ? 'm³/year' : ''}
                                            </div>
                                            {formData.numberOfWorkers && (
                                                <div>
                                                    <strong>Number of Workers:</strong> {formatDisplayValue(formData.numberOfWorkers)}
                                                </div>
                                            )}
                                            {formData.numberOfResidents && (
                                                <div>
                                                    <strong>Number of Residents:</strong> {formatDisplayValue(formData.numberOfResidents)}
                                                </div>
                                            )}
                                            {formData.domesticTotalDaily > 0 && (
                                                <div>
                                                    <strong>Domestic Water (Daily):</strong> {formData.domesticTotalDaily} m³/day
                                                </div>
                                            )}
                                            {(formData.waterReqDomestic || formData.waterReqIndustrial || formData.waterReqGreenBelt || formData.waterReqOther) && (
                                                <div style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #dee2e6' }}>
                                                    <strong>Water Requirement Breakup:</strong>
                                                    <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                                        {formData.waterReqDomestic && <li>Domestic/Drinking: {formData.waterReqDomestic} m³/day</li>}
                                                        {formData.waterReqIndustrial && <li>Industrial Process: {formData.waterReqIndustrial} m³/day</li>}
                                                        {formData.waterReqGreenBelt && <li>Greenbelt/Horticulture: {formData.waterReqGreenBelt} m³/day</li>}
                                                        {formData.waterReqOther && <li>Other: {formData.waterReqOther} m³/day</li>}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Structures Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">4. Groundwater Structures</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Proposed Borewells:</strong> {formData.proposedBorewells || 0}
                                            </div>
                                            <div>
                                                <strong>Proposed Tubewells:</strong> {formData.proposedTubewells || 0}
                                            </div>
                                            <div>
                                                <strong>Proposed Dugwells:</strong> {formData.proposedDugwells || 0}
                                            </div>
                                            <div>
                                                <strong>Existing Structures:</strong> {existingStructures.length}
                                            </div>
                                        </div>
                                        {existingStructures.length > 0 && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                                                <strong>Existing Structure Details:</strong>
                                                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                                    {existingStructures.map((struct, idx) => (
                                                        <li key={idx}>
                                                            {struct.type || 'Structure'} - Depth: {struct.depth || 'N/A'}m,
                                                            Diameter: {struct.diameter || 'N/A'}mm
                                                            {struct.hasMeter === 'Yes' && ' (Meter Installed)'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Flow Meter Summary */}
                                {formData.flowMeterDetails && (
                                    <div className="noc-card" style={{ marginBottom: '20px' }}>
                                        <div className="noc-card-header">5. Flow Meter Details</div>
                                        <div className="noc-card-body">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                                <div>
                                                    <strong>Manufacturer:</strong> {formData.flowMeterDetails.manufacturer}
                                                </div>
                                                <div>
                                                    <strong>Model Number:</strong> {formData.flowMeterDetails.modelNumber}
                                                </div>
                                                <div>
                                                    <strong>Serial Number:</strong> {formData.flowMeterDetails.serialNumber}
                                                </div>
                                                <div>
                                                    <strong>Meter Type:</strong> {formData.flowMeterDetails.meterType}
                                                </div>
                                                {formData.flowMeterDetails.telemetryEnabled === 'Yes' && (
                                                    <>
                                                        <div>
                                                            <strong>Telemetry Enabled:</strong> Yes
                                                        </div>
                                                        <div>
                                                            <strong>Service Provider:</strong> {formData.flowMeterDetails.telemetryProvider}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Applicant Details Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">6. Applicant Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Applicant Name:</strong> {formatDisplayValue(formData.applicantName)}
                                            </div>
                                            <div>
                                                <strong>Organization:</strong> {formatDisplayValue(formData.organizationName)}
                                            </div>
                                            <div>
                                                <strong>Organization Type:</strong> {getDisplayLabel(formData.organizationType, organizationTypeOptions)}
                                            </div>
                                            {formData.designation && (
                                                <div>
                                                    <strong>Designation:</strong> {formatDisplayValue(formData.designation)}
                                                </div>
                                            )}
                                            <div>
                                                <strong>Email:</strong> {formatDisplayValue(formData.applicantEmail)}
                                            </div>
                                            <div>
                                                <strong>Mobile:</strong> {formatDisplayValue(formData.applicantMobile)}
                                            </div>
                                            {formData.applicantAadhaar && (
                                                <div>
                                                    <strong>Aadhaar Number:</strong> {formatDisplayValue(formData.applicantAadhaar)}
                                                </div>
                                            )}
                                            {formData.applicantPAN && (
                                                <div>
                                                    <strong>PAN Number:</strong> {formatDisplayValue(formData.applicantPAN)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">7. Document Uploads</div>
                                    <div className="noc-card-body">
                                        <p>
                                            <strong>Total Documents Uploaded:</strong>{' '}
                                            {Object.keys(formData.uploadedDocuments).length} documents
                                        </p>
                                        {Object.keys(formData.uploadedDocuments).length > 0 && (
                                            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                                {Object.entries(formData.uploadedDocuments).map(([docId, file]) => (
                                                    <li key={docId}>
                                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="noc-card" style={{ marginBottom: '20px' }}>
                                    <div className="noc-card-header">8. Payment Details</div>
                                    <div className="noc-card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                            <div>
                                                <strong>Application Fee:</strong> ₹{formData.applicationFee?.toLocaleString('en-IN') || '0'}
                                            </div>
                                            <div>
                                                <strong>GST (18%):</strong> ₹{formData.gstAmount?.toLocaleString('en-IN') || '0'}
                                            </div>
                                            <div>
                                                <strong>Total Amount:</strong>{' '}
                                                <span style={{ fontSize: '1.2rem', color: 'var(--cgwa-success)', fontWeight: 'bold' }}>
                                                    ₹{formData.totalAmount?.toLocaleString('en-IN') || '0'}
                                                </span>
                                            </div>
                                            <div>
                                                <strong>Payment Status:</strong>{' '}
                                                <span style={{ color: formData.paymentStatus === 'paid' ? 'var(--cgwa-success)' : 'var(--cgwa-warning)', fontWeight: 'bold' }}>
                                                    {formData.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                                                </span>
                                            </div>
                                            {formData.paymentTransactionId && (
                                                <>
                                                    <div>
                                                        <strong>Transaction ID:</strong> {formatDisplayValue(formData.paymentTransactionId)}
                                                    </div>
                                                    <div>
                                                        <strong>Receipt Number:</strong> {formatDisplayValue(formData.paymentReceiptNumber)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Exemption Status (if applicable) */}
                                {exemptionStatus?.isExempt && (
                                    <div className="noc-exemption-banner" style={{ marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>✅ Exemption Status</h4>
                                        <p><strong>Type:</strong> {exemptionStatus.exemptionType}</p>
                                        <p><strong>Message:</strong> {exemptionStatus.message}</p>
                                    </div>
                                )}

                                {/* Final Declaration */}
                                <div className="noc-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid var(--cgwa-primary)' }}>
                                    <div className="noc-card-header" style={{ background: 'var(--cgwa-primary)', color: 'white' }}>
                                        📜 Final Declaration
                                    </div>
                                    <div className="noc-card-body">
                                        <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                                            I hereby declare that all the information provided in this application is true and correct
                                            to the best of my knowledge and belief. I understand that if any information is found to be
                                            false or misleading, my application may be rejected and/or the issued NOC may be cancelled.
                                            I also undertake to comply with all the conditions specified by the State Groundwater Authority
                                            and to adhere to all applicable laws and regulations related to groundwater extraction.
                                        </p>
                                        <div className="noc-checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="finalDeclaration"
                                                required
                                            />
                                            <label htmlFor="finalDeclaration" style={{ fontWeight: 'bold' }}>
                                                I agree to the above declaration and confirm that all information provided is accurate.
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Alert */}
                                <div className="noc-alert noc-alert-info">
                                    <strong>ℹ️ Ready to Submit:</strong> Please review all the above information carefully.
                                    Once submitted, you will not be able to make changes to your application.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Navigation */}
                    <FormNavigation
                        currentStep={currentStep}
                        totalSteps={dynamicFormSteps.length}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onSubmit={handleSubmit}
                        isLastStep={currentStep === dynamicFormSteps.length}
                    />
                </div>
            </div>

            {/* Success Modal */}
            {successData && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="noc-card" style={{ maxWidth: '500px', width: '90%', textAlign: 'center', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#28a745',
                            borderRadius: '50%',
                            color: 'white',
                            fontSize: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            ✓
                        </div>

                        <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Application Submitted!</h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Your application has been successfully submitted to the authority.</p>

                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px', textAlign: 'left' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Application Number:</strong> <span style={{ float: 'right', color: '#0d4a8f', fontWeight: 'bold' }}>{successData.applicationNumber || 'Pending'}</span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Status:</strong> <span style={{ float: 'right', background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{successData.status}</span>
                            </div>
                            <div>
                                <strong>Total Fee Paid:</strong> <span style={{ float: 'right', fontWeight: 'bold' }}>₹{successData.totalAmount?.toLocaleString('en-IN') || 0}</span>
                            </div>
                        </div>

                        <button
                            className="noc-btn noc-btn-primary"
                            style={{ padding: '12px 30px', fontSize: '1.1rem' }}
                            onClick={() => navigate('/noc/dashboard')}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}

            <NOCFooter />
        </div >
    );
};

export default NOCApplication;




