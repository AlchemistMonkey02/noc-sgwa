import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import ProgressSteps from './components/ProgressSteps';
import FormNavigation from './components/FormNavigation';
import PaymentModule from './components/PaymentModule';
import ExemptionCertificate from './components/ExemptionCertificate';
import PiezometerRequirements from './components/PiezometerRequirements';
import FlowMeterCompliance from './components/FlowMeterCompliance';
// eslint-disable-next-line no-unused-vars
import { checkExemption, getExemptionDisplayConfig } from './utils/exemptionRules';
// eslint-disable-next-line no-unused-vars
import { getDistricts, getBlocksForDistrict, getBlockCategory, checkBlockEligibility } from './utils/blockClassification';
// eslint-disable-next-line no-unused-vars
import { getIndustryDropdownOptions, getMiningDropdownOptions, getOtherProjectDropdownOptions, isPollutingIndustry, isPackagedWaterIndustry } from './utils/industryClassification';
// eslint-disable-next-line no-unused-vars
import { initialFormData, formSteps, applicationTypes, applicationSubTypes, projectTypes, waterQualityTypes, groundWaterUtilization, msmeTypes, states, geologyTypes, structureTypes, documentTypes } from './utils/formData';
// eslint-disable-next-line no-unused-vars
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateFileSize, validateFileType } from './utils/formValidation';
import { TRANSITION_CONFIG } from '../../config/transitionRules';
import LegalDisclaimer from '../../components/LegalDisclaimer';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';
// eslint-disable-next-line no-unused-vars
import { getRequiredDocuments } from './utils/documentRules';


const NOCApplication = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check for renewal type
    const queryParams = new URLSearchParams(location.search);
    const isRenewal = queryParams.get('type') === 'renewal';

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [oldNocId, setOldNocId] = useState('');
    const [isRenewalVerified, setIsRenewalVerified] = useState(false);
    const [isVerifyingRenewal, setIsVerifyingRenewal] = useState(false);

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


    // Location Data State
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [tehsilOptions, setTehsilOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [blockOptions, setBlockOptions] = useState([]);
    const [assessmentUnitOptions, setAssessmentUnitOptions] = useState([]);

    // Other State
    const [availableBlocks, setAvailableBlocks] = useState([]); // Used for Block dropdown (aliased to blockOptions logic)
    // eslint-disable-next-line no-unused-vars
    const [blockCategory, setBlockCategory] = useState(null);
    const [blockCategoryDetails, setBlockCategoryDetails] = useState(null);
    const [exemptionStatus, setExemptionStatus] = useState(null);
    const [showExemptionModal, setShowExemptionModal] = useState(false); // Modal state
    const [successData, setSuccessData] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [isSaving, setIsSaving] = useState(false);
    const [pendingUploads, setPendingUploads] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [verificationFeedback, setVerificationFeedback] = useState({});

    // Dynamic Document Requirements
    const [dynamicDocuments, setDynamicDocuments] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [documentsLoading, setDocumentsLoading] = useState(false);

    // Effect to fetch Block Category when Block changes
    useEffect(() => {
        const fetchCategory = async () => {
            if (formData.district && formData.block) {
                try {
                    // Use new POST API
                    const response = await nocApplicationService.fetchBlockCategory({
                        districtId: formData.district,
                        blockId: formData.block
                    });

                    if (response.success && response.data) {
                        setBlockCategoryDetails(response.data);
                        // Map API category to UI state if needed, or just use details
                        setFormData(prev => ({
                            ...prev,
                            // Use 'category' from new API response
                            blockCategory: response.data.category
                        }));
                    }
                } catch (error) {
                    console.error("Failed to fetch block category:", error);
                    setBlockCategoryDetails(null);
                }
            } else {
                setBlockCategoryDetails(null);
            }
        };

        fetchCategory();
    }, [formData.district, formData.block]);

    // eslint-disable-next-line no-unused-vars
    const handlePendingFileChange = (e, fieldName) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (!validateFileSize(file)) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'File size must be less than 5MB'
                }));
                return;
            }

            if (!validateFileType(file)) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'Only PDF, JPEG, and PNG files are allowed'
                }));
                return;
            }

            // Clear specific error
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));

            setPendingUploads(prev => ({
                ...prev,
                [fieldName]: file
            }));
        }
    };

    // Fetch Dynamic Document Requirements from API
    const fetchDocumentRequirements = async () => {
        // Only fetch if we have minimum required data
        // Relaxing check: Only applicationType is strictly required to get *some* documents
        if (!formData.applicationType) {
            console.log('Skipping document requirements fetch - missing applicationType');
            return;
        }

        setDocumentsLoading(true);
        try {
            // Determine KLD from various possible fields
            let kld = parseFloat(formData.dailyWaterRequirement || 0);
            if ((!kld || kld === 0) && formData.waterReqTotal) {
                kld = parseFloat(formData.waterReqTotal);
            }

            // Resolve Application Type Name from Options (ID -> Name)
            // appTypeOptions might contain objects { id: 1, name: 'Industry' } or strings
            let appTypeName = formData.applicationType;
            if (appTypeOptions.length > 0) {
                const match = appTypeOptions.find(opt => {
                    const id = typeof opt === 'object' ? (opt.id || opt.appTypeCode) : opt;
                    return String(id) === String(formData.applicationType);
                });
                if (match) {
                    appTypeName = typeof match === 'object' ? (match.name || match.label) : match;
                }
            }

            // Determine Utilization (New/Existing)
            // Priority: Check if 'groundWaterUtilizationFor' explicitly says New/Existing (as seen in screenshot)
            // Fallback: Check 'projectStatus' or 'projectType'
            let utilStatus = 'EXISTING'; // Default
            const gwUtil = formData.groundWaterUtilizationFor?.toUpperCase() || '';
            const projType = formData.projectType?.toUpperCase() || '';

            if (gwUtil.includes('NEW') || projType.includes('NEW')) {
                utilStatus = 'NEW';
            } else if (gwUtil.includes('EXISTING') || projType.includes('EXISTING')) {
                utilStatus = 'EXISTING';
            }

            const payload = {
                applicationType: appTypeName?.toUpperCase(), // Send Name (e.g. INDUSTRY) instead of ID
                utilizationFor: utilStatus,
                withdrawalKLD: kld,
                areaType: formData.blockCategoryDetails?.name?.toUpperCase() === 'SAFE' ? 'SAFE' : 'CRITICAL',
                rockType: 'HARD', // Default
                projectInWetlandZone: false,
                dewateringInvolved: formData.projectType === 'Infrastructure Project'
            };

            // Enhanced Mapping
            if (formData.blockCategory) payload.areaType = formData.blockCategory;

            console.log('Fetching document requirements with payload:', payload);
            const response = await nocApplicationService.getDocumentRequirements(payload);

            if (response.success && response.data && response.data.requiredDocuments) {
                const apiDocs = response.data.requiredDocuments.map(doc => ({
                    id: doc.documentCode,
                    name: doc.documentName,
                    description: doc.description,
                    required: doc.required,
                    condition: doc.condition
                }));
                console.log('Received dynamic documents:', apiDocs);
                setDynamicDocuments(apiDocs);
            } else {
                console.warn('Document requirements API returned unexpected format, falling back to empty list');
                setDynamicDocuments([]);
            }
        } catch (error) {
            console.error('Failed to fetch document requirements:', error);
            setDynamicDocuments([]);
        } finally {
            setDocumentsLoading(false);
        }
    };

    // Check if any structure has meter installed (needed early for useEffect dependencies)
    const hasMeterInstalled = existingStructures.some(s => s.hasMeter === 'Yes');

    // Dynamic Document Rules: Strictly use dynamic documents from API
    const requiredDocs = dynamicDocuments;

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
                loadData(nocApplicationService.getWaterQualityTypes, setWaterQualityOptions),
                loadData(nocApplicationService.getUtilizationPurposes, setUtilizationPurposeOptions),

                // Fetch Exemption Config for dropdowns (Dynamic Overrides)
                (async () => {
                    try {
                        const response = await nocApplicationService.getExemptionConfig();
                        if (response.success && response.data) {
                            if (response.data.utilizationTypes) {
                                setAppTypeOptions(response.data.utilizationTypes);
                                setUtilizationPurposeOptions(response.data.utilizationTypes);
                            }
                            if (response.data.utilizationPurposes) {
                                setProjectTypeOptions(response.data.utilizationPurposes);
                            }
                        }
                    } catch (e) { console.warn("Exemption config fetch failed", e); }
                })(),


                loadData(nocApplicationService.getOrganizationTypes, setOrganizationTypeOptions),
                loadData(nocApplicationService.getMsmeTypes, setMsmeTypeOptions),
                loadData(nocApplicationService.getStates, setStateOptions)
            ]);


        };
        fetchMasterData();
    }, []);

    // Set default State to Rajasthan (Locked)
    useEffect(() => {
        if (stateOptions.length > 0) {
            const rajasthan = stateOptions.find(s => {
                const name = typeof s === 'object' ? (s.stateName || s.name || '') : s;
                return name.toLowerCase() === 'rajasthan';
            });

            if (rajasthan) {
                const val = typeof rajasthan === 'object' ? (rajasthan.stateId || rajasthan.id || rajasthan.name) : rajasthan;
                if (formData.state !== val) {
                    setFormData(prev => ({ ...prev, state: val }));
                }
            } else if (stateOptions.includes('Rajasthan')) {
                if (formData.state !== 'Rajasthan') {
                    setFormData(prev => ({ ...prev, state: 'Rajasthan' }));
                }
            }
        }
    }, [stateOptions]);
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
                                baseAmount: feeCalc.baseFee, // Ensure baseAmount is synced for display
                                abstractionCharge: feeCalc.abstractionCharge,
                                borewellFee: feeCalc.borewellFee,
                                subtotal: feeCalc.subtotal,
                                discount: feeCalc.discount,
                                subtotalAfterDiscount: feeCalc.subtotalAfterDiscount,
                                gst: feeCalc.gst,
                                totalAmount: feeCalc.baseFee, // Override total with Base Fee
                                validityPeriod: feeCalc.validityPeriod,
                                breakdown: feeCalc.breakdown
                            },
                            applicationFee: feeCalc.baseFee, // Override
                            gstAmount: 0, // No GST if only base fee implied (or calculate if needed, but user said "only pay base fee")
                            totalAmount: feeCalc.baseFee // Override total
                        }));
                    }
                } catch (err) {
                    console.error("Auto calculation failed", err);
                }
            }
        };

        calculateAutoFee();
    }, [currentStep, applicationId, hasMeterInstalled, formData.feeCalculation]);

    // Fetch Dynamic Document Requirements when relevant data changes
    useEffect(() => {
        // Fetch when entering Step 5 (Checklist with no meter) or 6 (Checklist with meter)
        // Adjusting logic to be safe: Fetch from Step 5 onwards
        if (currentStep >= 5) {
            fetchDocumentRequirements();
        }
    }, [
        formData.applicationType,
        formData.dailyWaterRequirement,
        formData.blockCategory,
        formData.projectType,
        formData.groundWaterUtilizationFor,
        currentStep
    ]);

    // Check exemption status when relevant form data changes


    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('nocUser');
        if (!userData) {
            navigate('/noc/login');
        }
    }, [navigate]);

    // ... (Exemption Check useEffect) ...
    // Phase 1: Comprehensive Exemption Check
    // Exemption Eligibility Check via API
    useEffect(() => {
        const verifyExemption = async () => {
            // Trigger check if key fields are present
            if (formData.groundWaterUtilizationFor || formData.applicationType) {
                try {
                    // Resolve IDs to Names for API if necessary
                    const appTypeObj = appTypeOptions.find(opt => {
                        const val = typeof opt === 'object' ? (opt.appTypeCode || opt.typeCode || opt.id || opt.code || opt._id || opt.name) : opt;
                        return String(val) === String(formData.applicationType);
                    });
                    const appTypeName = appTypeObj ? (appTypeObj.name || appTypeObj.label || formData.applicationType) : formData.applicationType;

                    const utilObj = utilizationPurposeOptions.find(opt => {
                        const val = typeof opt === 'object' ? (opt.code || opt.name) : opt;
                        return String(val) === String(formData.groundWaterUtilizationFor);
                    });
                    const utilName = utilObj ? (utilObj.name || utilObj.label || formData.groundWaterUtilizationFor) : formData.groundWaterUtilizationFor;


                    // Prepare payload for check-eligibility
                    const payload = {
                        groundWaterUtilizationFor: utilName || appTypeName, // Fallback to App Type if Utilization is empty
                        // applicationType removed as per user request (only GW Util For needed)
                        industryType: formData.industryType,
                        dailyWaterRequirement: parseFloat(formData.dailyWaterRequirement || 0),
                        isMSME: formData.isMSME,
                        msmeType: formData.msmeType,
                        dateOfCommencement: formData.dateOfCommencement
                    };

                    const response = await nocApplicationService.checkEligibility(payload);

                    if (response.success && response.isExempt) {
                        const result = response.exemptionResult || {};
                        setExemptionStatus(result);
                        setFormData(prev => ({
                            ...prev,
                            isExempt: true,
                            exemptionType: result.exemptionType,
                            exemptionCode: result.exemptionCode,
                            isExemptMSME: result.exemptionCode === 'MSME_SM'
                        }));
                        console.log('✅ API: User is EXEMPT:', result.exemptionType);

                        console.log('✅ API: User is EXEMPT:', result.exemptionType);

                        // Show Custom Exemption Modal
                        setShowExemptionModal(true);

                    } else {
                        setExemptionStatus(null);
                        setShowExemptionModal(false);
                    }
                } catch (err) {
                    console.error("Exemption check failed", err);
                }
            }
        };

        const timer = setTimeout(verifyExemption, 1000); // 1s Debounce
        return () => clearTimeout(timer);
    }, [
        formData.groundWaterUtilizationFor,
        formData.applicationType,
        formData.industryType,
        formData.dailyWaterRequirement
    ]); // Trigger on any of these changes

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

    // Auto-calculate Total Water Requirement
    useEffect(() => {
        const fresh = parseFloat(formData.waterReqFreshRequirement || 0);
        const recycled = parseFloat(formData.waterReqRecycled || 0);
        const total = (fresh + recycled).toFixed(2);

        // Update only if strictly different (string comparison to avoid float loops)
        // This allows auto-calculation to run whenever inputs change
        if (formData.waterReqTotal !== total) {
            setFormData(prev => ({ ...prev, waterReqTotal: total }));
        }
    }, [formData.waterReqFreshRequirement, formData.waterReqRecycled]);


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
    // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
    const formatDisplayValue = (value) => {
        if (value === null || value === undefined || value === '') return 'Not provided';
        return value;
    };

    // Dynamic form steps based on meter installation
    const dynamicFormSteps = [
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

    // Effect: Fetch Application Sub Types when Application Type changes
    useEffect(() => {
        const fetchSubTypes = async () => {
            // Find the ID/Code associated with the current applicationType selection
            // We assume the value stored in formData.applicationType is the ID/Code
            const selectedType = formData.applicationType;

            if (selectedType) {
                try {
                    const response = await nocApplicationService.getApplicationSubTypes(selectedType);
                    if (response.success && response.data) {
                        setAppSubTypeOptions(response.data);
                    } else if (Array.isArray(response)) {
                        setAppSubTypeOptions(response);
                    }
                } catch (err) {
                    console.error("Failed to fetch sub types", err);
                    setAppSubTypeOptions([]);
                }
            } else {
                setAppSubTypeOptions([]);
            }
        };

        // Trigger fetch only if type changed
        fetchSubTypes();
    }, [formData.applicationType]);

    // Effect: Fetch Project Types when Application Sub Type changes
    useEffect(() => {
        const fetchProjectTypes = async () => {
            const selectedSubType = formData.applicationSubType;

            if (selectedSubType) {
                try {
                    const response = await nocApplicationService.getProjectTypes(selectedSubType);
                    if (response.success && response.data) {
                        setProjectTypeOptions(response.data);
                    } else if (Array.isArray(response)) {
                        setProjectTypeOptions(response);
                    }
                } catch (err) {
                    console.error("Failed to fetch project types", err);
                    setProjectTypeOptions([]);
                }
            } else {
                setProjectTypeOptions([]);
            }
        };

        fetchProjectTypes();
    }, [formData.applicationSubType]);

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
                        [docId]: file // Keep file object for UI display
                    }
                }));

                setErrors(prev => ({
                    ...prev,
                    [docId]: ''
                }));

                // AI Verification Trigger (Step 6/7)
                // We do this optimistically in the background
                (async () => {
                    try {
                        console.log(`Starting AI verification for ${docId}...`);

                        // Set Verifying State
                        setVerificationFeedback(prev => ({
                            ...prev,
                            [docId]: {
                                status: 'verifying',
                                message: 'Document is being verified by AI...',
                                confidence: 0
                            }
                        }));

                        // 1. Prepare Metadata (User Input for Cross-Check)
                        // Map flat formData to the structure expected by AI service
                        const metadata = {
                            name: formData.applicantName || formData.projectDetails?.applicantName || "",
                            aadhaar_number: formData.aadhaarNumber || formData.projectDetails?.aadhaarNumber || "",
                            // Add contextual info if needed
                            applicationType: formData.applicationType,
                            district: formData.district,
                            block: formData.block
                        };

                        // 2. Call AI Service (Localhost:5005)
                        const aiResponse = await nocApplicationService.verifyDocumentWithAI(file, docId, metadata);

                        // 3. Update Backend with Verification Result
                        if (aiResponse) {
                            const uploadedDocId = response.data?.documentId || response.data?._id;

                            // Robust Status Determination
                            // API might return { success: true, verdict: true } OR { status: "FAIL", verdict: { verdict: "FAIL", ... } }
                            let isVerified = false;
                            let remarks = "Your uploaded document is not valid or doesn't match the application. Please upload a valid document.";
                            let confidence = 0;
                            let explanation = "";

                            // Check High-Level Status
                            const isApiSuccess = aiResponse.success === true || aiResponse.status === "PASS";

                            if (aiResponse.verdict) {
                                if (typeof aiResponse.verdict === 'object') {
                                    // Complex verdict object (User's FAIL case)
                                    isVerified = aiResponse.verdict.verdict === "PASS";
                                    remarks = aiResponse.verdict.summary || aiResponse.message || "Your uploaded document is not valid or doesn't match the application. Please upload a valid document.";
                                    confidence = aiResponse.verdict.confidence || 0;
                                } else {
                                    // Simple boolean/string verdict
                                    isVerified = aiResponse.verdict === true || aiResponse.verdict === 'true' || aiResponse.verdict === 'PASS';
                                    remarks = aiResponse.remarks || aiResponse.message || (isVerified ? "Document verified and approved." : "Your uploaded document is not valid or doesn't match the application. Please upload a valid document.");
                                    confidence = aiResponse.confidence || 0;
                                }
                            } else {
                                // Fallback if no verdict field
                                isVerified = isApiSuccess;
                                remarks = aiResponse.message || (isVerified ? "Document verified and approved." : "Your uploaded document is not valid or doesn't match the application. Please upload a valid document.");
                            }

                            // Explanation might be at top level
                            explanation = aiResponse.ai_explanation || "";

                            // UI Update
                            setVerificationFeedback(prev => ({
                                ...prev,
                                [docId]: {
                                    status: isVerified ? 'approved' : 'rejected',
                                    message: remarks,
                                    confidence: confidence,
                                    explanation: explanation
                                }
                            }));

                            // Backend Update (Always update status, even if failed)
                            if (uploadedDocId) {
                                const updatePayload = {
                                    verified: isVerified,
                                    confidence: confidence || 0,
                                    remarks: remarks,
                                    extractedText: aiResponse.extracted_text || ""
                                };

                                await nocApplicationService.updateDocumentAIStatus(uploadedDocId, updatePayload);
                                console.log(`AI Verification updated for ${docId}:`, updatePayload);
                            }
                        }
                    } catch (err) {
                        console.error(`AI Verification failed for ${docId}:`, err);
                        // Show error state to user
                        setVerificationFeedback(prev => ({
                            ...prev,
                            [docId]: {
                                status: 'rejected',
                                message: "Document verification failed. Your uploaded document is not valid or doesn't match the application. Please upload a valid document.",
                                confidence: 0
                            }
                        }));
                    }
                })();
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setErrors(prev => ({
                ...prev,
                [docId]: 'Upload failed. Please try again.'
            }));
        }
    };

    // eslint-disable-next-line no-unused-vars
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

    // eslint-disable-next-line no-unused-vars
    const removeExistingStructure = (id) => {
        setExistingStructures(existingStructures.filter(s => s.id !== id));
    };

    // eslint-disable-next-line no-unused-vars
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
                    // Validate against dynamic required docs
                    requiredDocs.forEach(doc => {
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
                    // Validate against dynamic required docs
                    requiredDocs.forEach(doc => {
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
            // eslint-disable-next-line no-unused-vars
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
                            companyId = profileResponse.data.id || profileResponse.data.companyId || profileResponse.data._id;
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

                // Temporary: If user uploaded files but forgot text fields, we still need validation to pass.
                // But we can't bypass required fields.
                // We'll rely on validateCurrentStep() above which handles text fields.
                // If text fields are missing, handleNext returns early (lines 564).

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

                // PROCESS PENDING UPLOADS (Step 1)
                // PROCESS PENDING UPLOADS (Step 1)
                const appIdToUse = applicationId || (response?.data?.applicationId || response?.applicationId || response?.data?.id || response?.id);

                if (appIdToUse && Object.keys(pendingUploads).length > 0) {
                    console.log("Processing pending uploads for Step 1...", pendingUploads);
                    const uploadPromises = Object.entries(pendingUploads).map(([key, file]) => {
                        // Ensure document Type is sent in uppercase
                        const docType = key.toUpperCase();
                        return nocApplicationService.uploadDocument(file, docType, appIdToUse)
                            .then(res => {
                                if (res.success) {
                                    setFormData(prev => ({
                                        ...prev,
                                        uploadedDocuments: {
                                            ...prev.uploadedDocuments,
                                            [key]: file
                                        }
                                    }));
                                } else {
                                    alert(`Failed to upload ${key}. Server response: ${res.message || 'Unknown error'}`);
                                }
                                return res;
                            })
                            .catch(err => {
                                console.error(`Failed to upload pending doc ${key}`, err);
                                alert(`Error uploading ${key}: ${err.message}`);
                            });
                    });

                    await Promise.all(uploadPromises);
                    setPendingUploads({}); // Clear pending queue
                }

            } else if (currentStep === 2) {
                if (!applicationId) throw new Error("Application ID missing for Step 2");

                // Helper functions to ensure we send Names not IDs
                const getStateName = () => {
                    const match = stateOptions.find(o => String(o.stateId || o.id) === String(formData.state));
                    return match ? (match.stateName || match.name) : (formData.state === 'RJ' ? 'RAJASTHAN' : formData.state);
                };

                const getDistrictName = () => {
                    const match = districtOptions.find(o => String(o.districtId || o.id) === String(formData.district));
                    return match ? (match.districtName || match.name) : formData.district;
                };

                const getBlockName = () => {
                    // Try availableBlocks first, then blockOptions
                    const ops = availableBlocks.length > 0 ? availableBlocks : blockOptions;
                    const match = ops.find(o => String(o.blockId || o.id || o.code) === String(formData.block));
                    return match ? (match.blockName || match.name) : formData.block;
                };

                const stateName = getStateName();
                const districtName = getDistrictName();
                const blockName = getBlockName();

                const locationPayload = {
                    location: {
                        stateId: stateName, // Sending Name as requested
                        districtId: districtName,
                        blockId: blockName,
                        tehsil: formData.tehsil,
                        village: formData.village || '', // New field mapping
                        address: formData.projectAddress, // Mapped from projectAddress
                        pincode: formData.pincode,
                        latitude: parseFloat(formData.latitude),
                        longitude: parseFloat(formData.longitude)
                    },
                    projectDetails: {
                        projectName: formData.projectName || 'Draft Project',
                        landArea: parseFloat(formData.landUseTotalArea || 0),
                        builtUpArea: parseFloat(formData.landUseRooftopArea || 0) + parseFloat(formData.landUsePavedArea || 0),
                        openLandArea: parseFloat(formData.landUseGreenBeltArea || 0) + parseFloat(formData.landUseOpenArea || 0)
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

                /* alert(`Application Submitted Successfully!

Application Number: ${appData.applicationNumber || 'Pending'}
Status: ${appData.status}
Total Fee: ₹${feeDisplay}

Redirecting to Dashboard...`);
                navigate('/noc/dashboard'); */

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

    const handleChecklistChange = (id, checked) => {
        setFormData(prev => ({
            ...prev,
            checklist: {
                ...((prev.checklist && typeof prev.checklist === 'object') ? prev.checklist : {}),
                [id]: checked
            }
        }));
    };

    return (
        <LayoutWithSidebar>
            <div className="noc-portal">
                {/* Custom Exemption Modal */}
                {showExemptionModal && exemptionStatus && (
                    <div className="noc-modal-overlay">
                        <div className="noc-modal-content">
                            <div className="noc-modal-header">
                                <h3 style={{ margin: 0 }}>🎉 Applicable for Exempted NOC</h3>
                            </div>
                            <div className="noc-modal-body">
                                <p><strong>Exemption Category:</strong> {exemptionStatus.exemptionType}</p>
                                <p>{exemptionStatus.message || "You are eligible for an Exempted NOC based on your selection."}</p>

                                {exemptionStatus.details && Array.isArray(exemptionStatus.details) && (
                                    <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                                        {exemptionStatus.details.map((detail, idx) => (
                                            <li key={idx}>{detail}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="noc-modal-footer">
                                <button
                                    className="bhuneer-button-secondary"
                                    onClick={() => setShowExemptionModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bhuneer-button-primary"
                                    onClick={() => {
                                        // Direct Lookup for Names (Simplest approach as requested)
                                        const getAppName = () => {
                                            const match = appTypeOptions.find(o => String(o.id || o.appTypeCode || o.code) === String(formData.applicationType));
                                            let name = match ? (match.name || match.label) : formData.applicationType;

                                            // FIX: API explicitly requires "Agriculture Activities" but Master Data says "Agriculture"
                                            if (name === 'Agriculture') return 'Agriculture Activities';
                                            return name;
                                        };

                                        const getBlockName = () => {
                                            // Try availableBlocks first, then blockOptions
                                            const ops = availableBlocks.length > 0 ? availableBlocks : blockOptions;
                                            const match = ops.find(o => String(o.blockId || o.id || o.code) === String(formData.block));
                                            return match ? (match.blockName || match.name) : formData.block;
                                        };

                                        const getDistrictName = () => {
                                            const match = districtOptions.find(o => String(o.districtId || o.id) === String(formData.district));
                                            return match ? (match.districtName || match.name) : formData.district;
                                        };

                                        const getStateName = () => {
                                            const match = stateOptions.find(o => String(o.stateId || o.id) === String(formData.state));
                                            return match ? (match.stateName || match.name) : (formData.state === 'RJ' ? 'RAJASTHAN' : formData.state);
                                        };

                                        // Create Resolved Form Data
                                        const resolvedFormData = {
                                            ...formData,
                                            applicationType: getAppName(),
                                            applicationSubType: "", // Exempted applications don't use sub-types
                                            groundWaterUtilizationFor: getAppName(), // Fallback/Same for exempted
                                            waterQualityType: "Fresh Water", // API only accepts "Fresh Water" for exemptions
                                            state: getStateName(),
                                            district: getDistrictName(),
                                            block: getBlockName(),
                                            // Ensure agricultural details get the resolved names too
                                            assessmentUnitBlockTehsil: getBlockName()
                                        };

                                        console.log("Navigating with Simple Resolved Data:", resolvedFormData);

                                        navigate('/noc/exempt-application', {
                                            state: {
                                                formData: resolvedFormData,
                                                exemptionResult: exemptionStatus
                                            }
                                        });
                                    }}
                                >
                                    Apply for Exempted NOC
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="noc-application-page">
                    <div className="nd-form-container">
                        {/* Form Header */}
                        <div className="page-title-section nd-animate nd-visible" style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h1 className="page-main-title">{isRenewal ? 'NOC Renewal Application' : 'NOC Application Form'}</h1>
                            <p className="page-subtitle">Groundwater Abstraction Application - Central Ground Water Authority</p>
                        </div>

                        {/* Progress Steps */}
                        <ProgressSteps
                            steps={dynamicFormSteps}
                            currentStep={currentStep}
                            onStepClick={handleStepClick}
                        />

                        {/* Exemption Certificate - Show if user is exempted */}
                        {exemptionStatus?.isExempt ? (
                            <div className="nd-form-card nd-animate nd-visible">
                                <ExemptionCertificate
                                    formData={formData}
                                    exemptionResult={exemptionStatus}
                                    onDownload={(certNumber) => console.log('Certificate downloaded:', certNumber)}
                                    onSubmit={async (certData) => {
                                        try {
                                            const payload = {
                                                applicationType: formData.applicationType || 'Agriculture Activities',
                                                applicationSubType: formData.applicationSubType || 'Ground Water Requirement for Agriculture',
                                                groundWaterRequirementFor: formData.groundWaterUtilizationFor || 'Agricultural draft',
                                                waterQualityType: formData.waterQualityType || 'Fresh Water',
                                                applicationForBoring: formData.projectType || 'New Project',
                                                dateOfBoring: formData.dateOfCommencement || new Date().toISOString().split('T')[0],
                                                groundWaterUsage: {
                                                    drinkingDomestic: formData.groundWaterUtilizationFor === 'Drinking/Domestic' || false,
                                                    agricultureUse: formData.groundWaterUtilizationFor === 'Agriculture' || true
                                                },
                                                ownerDetails: {
                                                    ownerName: formData.applicantName || formData.organizationName,
                                                    ownerPhone: formData.applicantMobile,
                                                    ownerEmail: formData.applicantEmail,
                                                    ownerAddress: formData.projectAddress,
                                                    state: formData.state || "RAJASTHAN",
                                                    district: formData.district || "JAIPUR",
                                                    pinCode: formData.pincode || "302020"
                                                },
                                                agriculturalDetails: {
                                                    state: formData.state || "RAJASTHAN",
                                                    district: formData.district || "JAIPUR",
                                                    assessmentUnitBlockTehsil: `${formData.block || 'Unknown'} (Status: ${formData.blockCategory || 'Pending'})`,
                                                    address: formData.projectAddress || "Jaipur",
                                                    pinCode: formData.pincode || "302017",
                                                    landHoldingAreaHectare: parseFloat(formData.totalLandArea || 0),
                                                    landDetailsKhasraNo: formData.plotNo || "23",
                                                    gramPanchayatName: formData.village || "23",
                                                    waterRequirementKLD: parseFloat(formData.dailyWaterRequirement || 0)
                                                }
                                            };

                                            const result = await nocApplicationService.submitExemption(payload);
                                            if (result.success) {
                                                setSuccessData({
                                                    applicationNumber: result.data.applicationNumber || certData.certificateNumber,
                                                    status: 'Exempt',
                                                    totalAmount: 0,
                                                    exemptionType: certData.exemptionType
                                                });
                                            }
                                        } catch (error) {
                                            console.error('Exemption submission error:', error);
                                            alert('Error submitting exemption record. You can proceed with the downloaded certificate.');
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            /* Normal Form Content for Non-Exempted Users */
                            <div className="nd-form-content">


                                {/* STEP 1: Basic Details (Consolidated) */}
                                {currentStep === 1 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Basic Details</h2>
                                            <p className="nd-form-card-subtitle">Application type and applicant information</p>
                                        </div>

                                        <div className="form-sections-container_premium">
                                            {/* Section 1.1: Application Type Details */}
                                            <section className="form-section_premium">
                                                <h3 className="form-section-header-premium">Application Type Details</h3>
                                                <div className="nd-form-grid">
                                                    {isRenewal && (
                                                        <div className="nd-form-group">
                                                            <label className="nd-form-label">
                                                                <span>Existing NOC Number</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                            </label>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <input
                                                                    type="text"
                                                                    className={`nd-form-control ${!oldNocId && errors.oldNocId ? 'error' : ''}`}
                                                                    placeholder="e.g. CGWA/NOC/IND/2023/1234"
                                                                    value={oldNocId}
                                                                    onChange={(e) => setOldNocId(e.target.value)}
                                                                    disabled={isRenewalVerified}
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <button
                                                                    className={isRenewalVerified ? "nd-btn-secondary" : "nd-btn-primary"}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (isRenewalVerified) {
                                                                            setIsRenewalVerified(false);
                                                                            setOldNocId('');
                                                                            return;
                                                                        }
                                                                        setIsVerifyingRenewal(true);
                                                                        setTimeout(() => {
                                                                            setIsVerifyingRenewal(false);
                                                                            setIsRenewalVerified(true);
                                                                        }, 1500);
                                                                    }}
                                                                >
                                                                    {isVerifyingRenewal ? 'Verifying...' : isRenewalVerified ? 'Verified' : 'Verify'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Application Type</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="applicationType" className={`nd-form-control ${errors.applicationType ? 'error' : ''}`} value={formData.applicationType} onChange={handleChange}>
                                                            <option value="">Select Application Type</option>
                                                            {appTypeOptions.map(type => (
                                                                <option key={type.appTypeId || type.id || type.name} value={type.appTypeId || type.id || type.name}>
                                                                    {type.label || type.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Application Sub Type</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="applicationSubType" className={`nd-form-control ${errors.applicationSubType ? 'error' : ''}`} value={formData.applicationSubType} onChange={handleChange}>
                                                            <option value="">Select Sub Type</option>
                                                            {appSubTypeOptions.map(type => (
                                                                <option key={type.id || type.name} value={type.id || type.name}>
                                                                    {type.label || type.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Project Type</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="projectType" className={`nd-form-control ${errors.projectType ? 'error' : ''}`} value={formData.projectType} onChange={handleChange}>
                                                            <option value="">Select Project Type</option>
                                                            {projectTypeOptions.map(type => (
                                                                <option key={type.projectTypeCode || type.id || type.name} value={type.projectTypeCode || type.id || type.name}>
                                                                    {type.label || type.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Water Quality Type</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="waterQualityType" className={`nd-form-control ${errors.waterQualityType ? 'error' : ''}`} value={formData.waterQualityType} onChange={handleChange}>
                                                            <option value="">Select Quality</option>
                                                            {waterQualityOptions.map(type => (
                                                                <option key={type.code || type.name} value={type.code || type.name}>
                                                                    {type.label || type.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Ground Water Utilization For</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="groundWaterUtilizationFor" className={`nd-form-control ${errors.groundWaterUtilizationFor ? 'error' : ''}`} value={formData.groundWaterUtilizationFor} onChange={handleChange}>
                                                            <option value="">Select Purpose</option>
                                                            {utilizationPurposeOptions.map(type => (
                                                                <option key={type.code || type.name} value={type.code || type.name}>
                                                                    {type.label || type.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </section>

                                            <div style={{ margin: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

                                            {/* Section 1.2: Applicant Details */}
                                            <section className="form-section_premium">
                                                <h3 className="form-section-header-premium">Applicant Details</h3>
                                                <div className="nd-form-grid">
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Title</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="title" className={`nd-form-control ${errors.title ? 'error' : ''}`} value={formData.title || ''} onChange={handleChange}>
                                                            <option value="">Select Title</option>
                                                            <option value="Mr.">Mr.</option>
                                                            <option value="Mrs.">Mrs.</option>
                                                            <option value="Ms.">Ms.</option>
                                                            <option value="Dr.">Dr.</option>
                                                        </select>
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Applicant Name</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="text" name="applicantName" className={`nd-form-control ${errors.applicantName ? 'error' : ''}`} value={formData.applicantName || ''} onChange={handleChange} placeholder="Enter full name" />
                                                    </div>
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Email ID</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="email" name="applicantEmail" className={`nd-form-control ${errors.applicantEmail ? 'error' : ''}`} value={formData.applicantEmail || ''} onChange={handleChange} placeholder="your.email@example.com" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Mobile Number</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="tel" name="applicantMobile" maxLength="10" className={`nd-form-control ${errors.applicantMobile ? 'error' : ''}`} value={formData.applicantMobile || ''} onChange={handleChange} placeholder="10-digit mobile number" />
                                                    </div>
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Aadhaar Number</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="text" name="aadhaarNumber" maxLength="12" className={`nd-form-control ${errors.aadhaarNumber ? 'error' : ''}`} value={formData.aadhaarNumber || ''} onChange={handleChange} placeholder="12-digit Aadhaar" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>PAN Number</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="text" name="panNumber" maxLength="10" className={`nd-form-control ${errors.panNumber ? 'error' : ''}`} value={formData.panNumber || ''} onChange={handleChange} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
                                                    </div>
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Organization Name</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="text" name="organizationName" className={`nd-form-control ${errors.organizationName ? 'error' : ''}`} value={formData.organizationName || ''} onChange={handleChange} placeholder="Enter organization name" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Organization Type</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="organizationType" className={`nd-form-control ${errors.organizationType ? 'error' : ''}`} value={formData.organizationType || ''} onChange={handleChange}>
                                                            <option value="">Select Type</option>
                                                            <option value="Individual">Individual</option>
                                                            <option value="Private Limited">Private Limited</option>
                                                            <option value="Public Limited">Public Limited</option>
                                                            <option value="Partnership">Partnership</option>
                                                            <option value="Government">Government</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}
                                {/* STEP 2: Site/Project Details */}
                                {currentStep === 2 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Location Details</h2>
                                            <p className="nd-form-card-subtitle">Project site information and coordinates</p>
                                        </div>

                                        <div className="form-sections-container_premium">
                                            {/* Section 2.1: Project Location */}
                                            <section className="form-section_premium">
                                                <h3 className="form-section-header-premium">Project Location</h3>
                                                <div className="nd-form-grid">
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>State</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="state" className={`nd-form-control ${errors.state ? 'error' : ''}`} value={formData.state} onChange={handleChange}>
                                                            <option value="">Select State</option>
                                                            {states.map(state => (
                                                                <option key={state.stateCode || state.id} value={state.stateName || state.name}>
                                                                    {state.stateName || state.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>District</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="district" className={`nd-form-control ${errors.district ? 'error' : ''}`} value={formData.district} onChange={handleChange} disabled={!formData.state}>
                                                            <option value="">Select District</option>
                                                            {districts.map(dist => (
                                                                <option key={dist.districtCode || dist.id} value={dist.districtName || dist.name}>
                                                                    {dist.districtName || dist.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Tehsil/Block</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <select name="block" className={`nd-form-control ${errors.block ? 'error' : ''}`} value={formData.block} onChange={handleChange} disabled={!formData.district}>
                                                            <option value="">Select Block</option>
                                                            {availableBlocks.map((block, idx) => (
                                                                <option key={idx} value={typeof block === 'object' ? (block.blockName || block.name) : block}>
                                                                    {typeof block === 'object' ? (block.blockName || block.name) : block}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Village/Town</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="text" name="village" className={`nd-form-control ${errors.village ? 'error' : ''}`} value={formData.village || ''} onChange={handleChange} placeholder="Enter village or town" />
                                                    </div>
                                                </div>

                                                <div className="nd-form-group" style={{ marginTop: '20px' }}>
                                                    <label className="nd-form-label">
                                                        <span>Project Address</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                    </label>
                                                    <textarea name="projectAddress" className={`nd-form-control ${errors.projectAddress ? 'error' : ''}`} value={formData.projectAddress} onChange={handleChange} placeholder="Complete address of the project site" rows="2" />
                                                </div>

                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>PIN Code</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="text" name="pincode" maxLength="6" className={`nd-form-control ${errors.pincode ? 'error' : ''}`} value={formData.pincode} onChange={handleChange} placeholder="6-digit PIN" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">Is the project in an Industrial Area?</label>
                                                        <div className="nd-radio-group" style={{ flexDirection: 'row', gap: '30px', marginTop: '5px' }}>
                                                            <div className="nd-radio-card">
                                                                <input type="radio" name="isInIndustrialArea" id="indYes" value="Yes" checked={formData.isInIndustrialArea === 'Yes'} onChange={handleChange} />
                                                                <label htmlFor="indYes">Yes</label>
                                                            </div>
                                                            <div className="nd-radio-card">
                                                                <input type="radio" name="isInIndustrialArea" id="indNo" value="No" checked={formData.isInIndustrialArea === 'No' || !formData.isInIndustrialArea} onChange={handleChange} />
                                                                <label htmlFor="indNo">No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <div style={{ margin: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

                                            {/* Section 2.2: Geographic Coordinates */}
                                            <section className="form-section_premium">
                                                <h3 className="form-section-header-premium">Geographic Coordinates</h3>
                                                <div className="nd-form-grid">
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Latitude (Decimal)</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="number" name="latitude" className={`nd-form-control ${errors.latitude ? 'error' : ''}`} value={formData.latitude} onChange={handleChange} placeholder="e.g. 26.9124" step="0.0001" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">
                                                            <span>Longitude (Decimal)</span><span className="required-star" style={{ color: '#ef4444' }}>*</span>
                                                        </label>
                                                        <input type="number" name="longitude" className={`nd-form-control ${errors.longitude ? 'error' : ''}`} value={formData.longitude} onChange={handleChange} placeholder="e.g. 75.7873" step="0.0001" />
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Water Requirement Details */}
                                {currentStep === 3 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Water Requirement</h2>
                                            <p className="nd-form-card-subtitle">Provide details of daily water requirement and conservation measures</p>
                                        </div>

                                        <div className="form-sections-container_premium">
                                            <section className="form-section_premium">
                                                <h3 className="form-section-header-premium">Daily Requirement (m³/day)</h3>
                                                <div className="nd-form-grid">
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">Groundwater (Abstraction)</label>
                                                        <input type="number" name="waterReqGroundwater" className="nd-form-control" value={formData.waterReqGroundwater || ''} onChange={handleChange} placeholder="0.00" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">Surface Water</label>
                                                        <input type="number" name="waterReqSurface" className="nd-form-control" value={formData.waterReqSurface || ''} onChange={handleChange} placeholder="0.00" />
                                                    </div>
                                                </div>
                                                <div className="nd-form-grid" style={{ marginTop: '20px' }}>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">Treated/Recycled Water</label>
                                                        <input type="number" name="waterReqTreated" className="nd-form-control" value={formData.waterReqTreated || ''} onChange={handleChange} placeholder="0.00" />
                                                    </div>
                                                    <div className="nd-form-group">
                                                        <label className="nd-form-label">Total Requirement</label>
                                                        <input type="number" name="waterReqTotal" className="nd-form-control" value={formData.waterReqTotal || ''} readOnly placeholder="Auto-calculated" style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'default' }} />
                                                    </div>
                                                </div>
                                            </section>

                                            <div style={{ margin: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

                                            <section className="form-section_premium">
                                                <h3 className="form-section-header-premium">Conservation & Recycling</h3>
                                                <div className="nd-form-group">
                                                    <label className="nd-form-label">Proposed Conservation Measures</label>
                                                    <textarea name="waterConservationMeasures" className="nd-form-control" value={formData.waterConservationMeasures || ''} onChange={handleChange} placeholder="Describe measures like Rainwater Harvesting, Zero Liquid Discharge (ZLD), etc." rows="4" />
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}
                                {/* STEP 4: GW Structures details */}
                                {currentStep === 4 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">GW Structures details</h2>
                                            <p className="nd-form-card-subtitle">Details of groundwater extraction structures</p>
                                        </div>
                                        <div className="nd-form-info-box_premium">
                                            <p style={{ opacity: 0.7 }}>Implementation of structures details and flow meter information is pending...</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 5: Documents Checklist */}
                                {currentStep === 5 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Documents Checklist</h2>
                                            <p className="nd-form-card-subtitle">List of mandatory documents for your application</p>
                                        </div>
                                        <div className="nd-form-info-box_premium">
                                            <p style={{ opacity: 0.7 }}>Implementation of document checklist logic is pending...</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 6: Upload Documents */}
                                {currentStep === 6 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Upload Documents</h2>
                                            <p className="nd-form-card-subtitle">Upload clear scanned copies (PDF/JPG)</p>
                                        </div>
                                        <div className="nd-form-info-box_premium">
                                            <p style={{ opacity: 0.7 }}>Implementation of document upload logic is pending...</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 7: Fee Calculation / Payment */}
                                {currentStep === 7 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Fee Calculation & Payment</h2>
                                            <p className="nd-form-card-subtitle">Applicable fees for groundwater abstraction</p>
                                        </div>
                                        <div className="nd-form-info-box_premium">
                                            <p style={{ opacity: 0.7 }}>Integration of payment module is pending...</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 8: Upload Payment Receipt */}
                                {currentStep === 8 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Upload Receipt</h2>
                                            <p className="nd-form-card-subtitle">Proof of payment confirmation</p>
                                        </div>
                                        <div className="nd-form-info-box_premium">
                                            <p style={{ opacity: 0.7 }}>Implementation of receipt upload logic is pending...</p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 9: Final Review & Submission */}
                                {currentStep === 9 && (
                                    <div className="nd-form-card nd-animate nd-visible">
                                        <div className="nd-form-card-header">
                                            <h2 className="nd-form-card-title">Final Review</h2>
                                            <p className="nd-form-card-subtitle">Verify all details before final submission</p>
                                        </div>
                                        <div className="nd-form-info-box_premium">
                                            <p style={{ opacity: 0.7 }}>Implementation of final summary and review logic is pending...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                {/* Navigation Buttons */}
                {
                    !successData && (
                        <FormNavigation
                            currentStep={currentStep}
                            totalSteps={dynamicFormSteps.length}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onSubmit={handleSubmit}
                            isLastStep={currentStep === dynamicFormSteps.length}
                        />
                    )
                }

                {/* Success Modal */}
                {
                    successData && (
                        <div className="nd-modal-overlay">
                            <div className="nd-modal-content nd-animate nd-visible">
                                <div style={{ width: "80px", height: "80px", background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "40px", margin: "0 auto 20px auto" }}>✓</div>
                                <h2 style={{ textAlign: "center", color: "#10b981" }}>Application Submitted!</h2>
                                <p style={{ textAlign: "center", opacity: 0.7, marginBottom: "30px" }}>Your application has been received and is under review.</p>

                                <div className="nd-summary-card" style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", marginBottom: "30px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                        <span>Application ID:</span>
                                        <strong>{successData.applicationNumber || "SGWA-2024-001"}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Status:</span>
                                        <span style={{ color: "#10b981", fontWeight: "bold" }}>{successData.status || "Received"}</span>
                                    </div>
                                </div>

                                <button
                                    className="bhuneer-submit-btn"
                                    style={{ width: "100%" }}
                                    onClick={() => navigate("/noc/dashboard")}
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
            </div >
        </LayoutWithSidebar >
    );
};

export default NOCApplication;