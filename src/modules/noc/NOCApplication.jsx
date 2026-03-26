import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../public/components/PublicHeader';
import NOCFooter from './components/NOCFooter';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import ProgressSteps from './components/ProgressSteps';
import FormNavigation from './components/FormNavigation';
import PaymentModule from './components/PaymentModule';
import ExemptionCertificate from './components/ExemptionCertificate';
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
import { useMasterData } from './hooks/useMasterData';
import BasicDetailsStep from './components/form-steps/BasicDetailsStep';
import ProjectLocationStep from './components/form-steps/ProjectLocationStep';
import WaterRequirementStep from './components/form-steps/WaterRequirementStep';
import GroundwaterStructuresStep from './components/form-steps/GroundwaterStructuresStep';
import FlowMeterDetailsStep from './components/form-steps/FlowMeterDetailsStep';
import DocumentChecklistStep from './components/form-steps/DocumentChecklistStep';
import DocumentUploadStep from './components/form-steps/DocumentUploadStep';
import FeeCalculationStep from './components/form-steps/FeeCalculationStep';
import PaymentReceiptStep from './components/form-steps/PaymentReceiptStep';
import SummaryStep from './components/form-steps/SummaryStep';




const NOCApplication = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [existingStructures, setExistingStructures] = useState([]);

    const {
        applicationTypes: appTypeOptions,
        waterQualityTypes: waterQualityOptions,
        utilizationPurposes: utilizationPurposeOptions,
        organizationTypes: organizationTypeOptions,
        msmeTypes: msmeTypeOptions,
        states: stateOptions,
        geologyTypes,
        meterTypes: meterTypeOptionsMaster,
        sectorTypes,
        loading: masterLoading,
        fetchSubTypes,
        fetchProjectTypes
    } = useMasterData();

    const [appSubTypeOptions, setAppSubTypeOptions] = useState([]);
    const [projectTypeOptions, setProjectTypeOptions] = useState([]);

    // Location Data State
    const [districtOptions, setDistrictOptions] = useState([]);
    const [tehsilOptions, setTehsilOptions] = useState([]);
    const [blockOptions, setBlockOptions] = useState([]);
    const [assessmentUnitOptions, setAssessmentUnitOptions] = useState([]);

    // Other State
    const [availableBlocks, setAvailableBlocks] = useState([]); // Used for Block dropdown (aliased to blockOptions logic)
    const [blockCategory, setBlockCategory] = useState(null);
    const [blockCategoryDetails, setBlockCategoryDetails] = useState(null);
    const [exemptionStatus, setExemptionStatus] = useState(null);
    const [showExemptionModal, setShowExemptionModal] = useState(false); // Modal state
    const [successData, setSuccessData] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingUploads, setPendingUploads] = useState({});
    const [verificationFeedback, setVerificationFeedback] = useState({});

    const [industryOptions, setIndustryOptions] = useState([]);
    const [miningOptions, setMiningOptions] = useState([]);

    const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();

    // Dynamic Document Requirements
    const [dynamicDocuments, setDynamicDocuments] = useState([]);
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

    // Cascade Fetch for Application Sub Types
    useEffect(() => {
        const fetchSubs = async () => {
            if (formData.applicationType) {
                const subs = await fetchSubTypes(formData.applicationType);
                setAppSubTypeOptions(subs);
                // Reset sub-type if no longer valid
                if (formData.applicationSubType && !subs.find(s => String(s.id || s.code) === String(formData.applicationSubType))) {
                    setFormData(prev => ({ ...prev, applicationSubType: '', projectType: '' }));
                }
            } else {
                setAppSubTypeOptions([]);
            }
        };
        fetchSubs();
    }, [formData.applicationType, fetchSubTypes]);

    // Cascade Fetch for Project Types (Categories)
    useEffect(() => {
        const fetchProjects = async () => {
            if (formData.applicationSubType) {
                const projects = await fetchProjectTypes(formData.applicationSubType);
                setProjectTypeOptions(projects);
                // Reset project type if no longer valid
                if (formData.projectType && !projects.find(p => String(p.id || p.code) === String(formData.projectType))) {
                    setFormData(prev => ({ ...prev, projectType: '' }));
                }
            } else {
                setProjectTypeOptions([]);
            }
        };
        fetchProjects();
    }, [formData.applicationSubType, fetchProjectTypes]);

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
    }, [stateOptions, formData.state]);

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
                        console.log('? API: User is EXEMPT:', result.exemptionType);

                        toastWarning("Activity is exempt from NOC. Redirecting to Exemption Form...");

                        // Construct basic formData to pass along
                        const redirectFormData = {
                            ...formData,
                            applicationType: result.exemptionType || appTypeName,
                            groundWaterUtilizationFor: result.exemptionType || utilName,
                            waterQualityType: formData.waterQualityType || "Fresh Water"
                        };

                        // Delay slightly to let the toast show
                        setTimeout(() => {
                            navigate('/noc/exempt-application', { state: { formData: redirectFormData } });
                        }, 1500);

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
    ]); 

    // Fetch Industry and Mining Options based on Utilization Purpose
    useEffect(() => {
        const fetchSubOptions = async () => {
            if (formData.groundWaterUtilizationFor === 'Industry') {
                const options = await fetchIndustryTypes();
                setIndustryOptions(options);
            } else if (formData.groundWaterUtilizationFor === 'Mining') {
                // Fetch minerals for mining
                const options = await fetchIndustryTypes('Mining'); // Example API usage
                setMiningOptions(options);
            }
        };
        fetchSubOptions();
    }, [formData.groundWaterUtilizationFor, fetchIndustryTypes]);

    // Cleanup: industryOptions and miningOptions are now fetched above



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

    useEffect(() => {
        const fresh = parseFloat(formData.waterReqFreshRequirement || 0);
        const recycled = parseFloat(formData.waterReqRecycled || 0);
        const total = (fresh + recycled).toFixed(2);

        if (formData.waterReqTotal !== total) {
            setFormData(prev => ({ ...prev, waterReqTotal: total }));
        }
    }, [formData.waterReqFreshRequirement, formData.waterReqRecycled]);

    // Auto-calculate Domestic Water Requirement based on population
    useEffect(() => {
        const workers = parseInt(formData.numberOfWorkers || 0);
        const residents = parseInt(formData.numberOfResidents || 0);
        const dailyPerPerson = parseFloat(formData.dailyRequirementPerPerson || 135);

        // CGWA Norms: 45L for workers, specified for residents
        const calculatedDomestic = ((workers * 45) + (residents * dailyPerPerson)) / 1000; // in m3/day

        if (formData.waterReqDomestic !== calculatedDomestic.toString() && (workers > 0 || residents > 0)) {
            setFormData(prev => ({ ...prev, waterReqDomestic: calculatedDomestic.toString() }));
        }
    }, [formData.numberOfWorkers, formData.numberOfResidents, formData.dailyRequirementPerPerson]);


    // Phase 2: Cascade Fetch for Models and Serial Numbers (Synced Flow)
    const [meterModels, setMeterModels] = useState([]);
    const [meterSerialNumbers, setMeterSerialNumbers] = useState([]);

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
                const possibleIds = [
                    opt.id, opt._id, opt.code, opt.value,
                    opt.appTypeCode, opt.appSubTypeCode,
                    opt.categoryCode, opt.projectTypeCode
                ];
                return possibleIds.some(id => id !== undefined && String(id) === String(value)) ||
                    opt.label === value ||
                    opt.name === value;
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

    // Empty placeholder for consolidation


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'applicationType') {
            // Check if the selected Application Type is an exempt category
            const selectedOpt = appTypeOptions.find(opt => {
                const optVal = typeof opt === 'object' ? (opt.id || opt.appTypeId || opt.appTypeCode || opt.typeCode || opt.code || opt._id || opt.name) : opt;
                return String(optVal) === String(value);
            });
            const optName = typeof selectedOpt === 'object' ? (selectedOpt.name || selectedOpt.label) : selectedOpt;

            if (optName === 'Agriculture Activities' || optName === 'Agriculture' || optName === 'Individual Domestic Consumer' ||
                String(value) === 'Agriculture Activities' || String(value) === 'Agriculture' || String(value) === 'Individual Domestic Consumer') {

                // Construct basic formData to pass along
                const redirectFormData = {
                    ...formData,
                    applicationType: optName || value,
                    groundWaterUtilizationFor: optName || value,
                    waterQualityType: "Fresh Water"
                };

                navigate('/noc/exempt-application', {
                    state: {
                        formData: redirectFormData
                    }
                });
                return; // Stop further processing here
            }
        }

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
            toastWarning("Please complete Basic Details first to generate an Application ID before uploading documents.");
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
                    },
                    uploadedDocumentsDetails: {
                        ...prev.uploadedDocumentsDetails,
                        [docId]: response.data?.documentId // Store server-provided UUID
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
    // Helper function to resolve Project Type Name
    const getProjectTypeName = () => {
        const selectedId = formData.projectType;
        if (!selectedId) return '';
        const match = projectTypeOptions.find(opt => {
            const id = typeof opt === 'object' ? (opt.id || opt.projectTypeCode || opt.code || opt._id) : opt;
            return String(id) === String(selectedId);
        });
        return match ? (match.name || match.label || selectedId) : selectedId;
    };

    const handleNext = async () => {
        if (!validateCurrentStep()) return;
        setIsSaving(true);
        try {
            let response;
            const userData = user || {};

            // Helper to get labels for payload enrichment
            const getAppTypeName = () => {
                const match = appTypeOptions.find(o => String(o.id || o.appTypeCode) === String(formData.applicationType));
                return match ? (match.name || match.label) : formData.applicationType;
            };

            const getSectorTypeName = () => {
                if (formData.groundWaterUtilizationFor === 'Industry') return 'INDUSTRIAL';
                if (formData.groundWaterUtilizationFor === 'Mining') return 'MINING';
                return 'INFRASTRUCTURE';
            };

            const stepCount = hasMeterInstalled ? 10 : 9;

            switch (currentStep) {
                case 1: // Basic Details
                    const normalizeYesNo = (val) => {
                        if (!val) return 'NO';
                        const upper = val.toString().toUpperCase();
                        if (upper === 'YES' || upper === 'TRUE') return 'YES';
                        return 'NO';
                    };
                    const step1Payload = {
                        applicationType: formData.applicationType,
                        applicationSubType: formData.applicationSubType,
                        sectorType: formData.sectorType || getSectorTypeName(),
                        projectType: formData.projectType,
                        waterQualityType: formData.waterQualityType,
                        groundWaterUtilizationFor: formData.groundWaterUtilizationFor,
                        industryType: formData.industryType,
                        miningType: formData.miningType,
                        isMSME: formData.isMSME,
                        msmeType: formData.msmeType,
                        msmeRegistrationNumber: formData.msmeRegistrationNumber,
                        oldNOCNumber: formData.oldNOCNo || formData.oldNOCNumber,
                        existingNOCStatus: normalizeYesNo(formData.existingNOCStatus),
                        dateOfCommencement: formData.dateOfCommencement || null,
                        applicantName: formData.applicantName,
                        applicantEmail: formData.applicantEmail,
                        applicantMobile: formData.applicantMobile,
                        applicantAadhaar: formData.applicantAadhaar,
                        applicantPAN: formData.applicantPAN,
                        organizationName: formData.organizationName,
                        organizationType: formData.organizationType,
                        designation: formData.designation,
                        companyId: userData.companyId || formData.companyId
                    };
                    
                    if (applicationId) {
                        response = await nocApplicationService.saveStep1(applicationId, step1Payload);
                    } else {
                        response = await nocApplicationService.createApplication(step1Payload);
                        const newAppId = response.data?.applicationId || response.applicationId || response.data?.id || response.id;
                        if (newAppId) {
                            setApplicationId(newAppId);
                            localStorage.setItem('currentApplicationId', newAppId);
                            response = await nocApplicationService.saveStep1(newAppId, step1Payload);
                        } else {
                            throw new Error('Failed to create application draft');
                        }
                    }

                    // Handle Pending Uploads for Step 1
                    const appIdToUse = applicationId || response?.applicationId || response?.data?.applicationId;
                    if (appIdToUse && Object.keys(pendingUploads).length > 0) {
                        const uploadPromises = Object.entries(pendingUploads).map(([key, file]) => 
                            nocApplicationService.uploadDocument(file, key.toUpperCase(), appIdToUse)
                        );
                        await Promise.all(uploadPromises);
                        setPendingUploads({});
                    }
                    break;

                case 2: // Location Details
                    const getStateName = () => {
                        const match = (stateOptions || []).find(o => String(o.stateId || o.id) === String(formData.state));
                        return match ? (match.stateName || match.name) : formData.state;
                    };
                    const getDistrictName = () => {
                        const match = (districtOptions || []).find(o => String(o.districtId || o.id) === String(formData.district));
                        return match ? (match.districtName || match.name) : formData.district;
                    };
                    const getBlockNameValue = () => {
                        const ops = availableBlocks.length > 0 ? availableBlocks : blockOptions;
                        const match = ops.find(o => String(o.blockId || o.id || o.code) === String(formData.block));
                        return match ? (match.blockName || match.name) : formData.block;
                    };
                    
                    const step2Payload = {
                        projectName: formData.projectName,
                        location: {
                            stateId: getStateName(),
                            districtId: getDistrictName(),
                            blockId: getBlockNameValue(),
                            tehsil: formData.tehsil,
                            village: formData.village,
                            address: formData.projectAddress,
                            pincode: formData.pincode,
                            latitude: parseFloat(formData.latitude),
                            longitude: parseFloat(formData.longitude),
                            geology: formData.geology,
                            blockCategory: formData.blockCategory
                        },
                        projectDetails: {
                            projectName: formData.projectName,
                            landArea: parseFloat(formData.landUseTotalArea || 0),
                            builtUpArea: parseFloat(formData.landUseRooftopArea || 0) + parseFloat(formData.landUsePavedArea || 0),
                            openLandArea: parseFloat(formData.landUseGreenBeltArea || 0) + parseFloat(formData.landUseOpenArea || 0),
                            landUseDetails: {
                                totalArea: parseFloat(formData.landUseTotalArea || 0),
                                rooftopArea: parseFloat(formData.landUseRooftopArea || 0),
                                pavedArea: parseFloat(formData.landUsePavedArea || 0),
                                greenBeltArea: parseFloat(formData.landUseGreenBeltArea || 0),
                                openArea: parseFloat(formData.landUseOpenArea || 0)
                            }
                        }
                    };
                    response = await nocApplicationService.saveStep2(applicationId, step2Payload);
                    break;

                case 3: // Water Requirement (Section 3 & 4)
                    const freshReq = parseFloat(formData.waterReqFreshRequirement || 0);
                    const recycledReq = parseFloat(formData.waterReqRecycled || 0);
                    const totalDaily = freshReq + recycledReq;

                    // Section 3: Drinking & Domestic Use
                    const section3Data = {
                        drinkingDomesticUse: {
                            numberOfWorkers: parseInt(formData.numberOfWorkers || 0),
                            numberOfResidents: parseInt(formData.numberOfResidents || 0),
                            dailyRequirementPerPerson: parseFloat(formData.dailyRequirementPerPerson || 135)
                        },
                        waterRequirement: {
                            totalDaily: totalDaily,
                            annualRequirement: totalDaily * 365,
                            freshWaterRequirement: freshReq,
                            recycledWaterUsage: recycledReq,
                            purpose: formData.groundWaterUtilizationFor
                        }
                    };
                    await nocApplicationService.saveStep3(applicationId, section3Data);

                    // Section 4: Water Requirement Breakup
                    const waterActivities = [];
                    if (parseFloat(formData.waterReqDomestic || 0) > 0) waterActivities.push({ activityType: 'Domestic/Drinking', totalRequirement: parseFloat(formData.waterReqDomestic || 0) });
                    if (parseFloat(formData.waterReqIndustrial || 0) > 0) waterActivities.push({ activityType: 'Industrial Process', totalRequirement: parseFloat(formData.waterReqIndustrial || 0) });
                    if (parseFloat(formData.waterReqGreenBelt || 0) > 0) waterActivities.push({ activityType: 'Greenbelt/Horticulture', totalRequirement: parseFloat(formData.waterReqGreenBelt || 0) });
                    if (parseFloat(formData.waterReqOther || 0) > 0) waterActivities.push({ activityType: 'Other', totalRequirement: parseFloat(formData.waterReqOther || 0), description: formData.waterReqOtherDescription });

                    const section4Data = {
                        waterRequirementBreakup: waterActivities,
                        stpEtpDetails: {
                            stpCapacity: parseFloat(formData.stpCapacity || 0),
                            etpCapacity: parseFloat(formData.etpCapacity || 0),
                            stpInstalled: parseFloat(formData.stpCapacity || 0) > 0,
                            etpInstalled: parseFloat(formData.etpCapacity || 0) > 0
                        }
                    };
                    response = await nocApplicationService.saveStep4(applicationId, section4Data);
                    break;

                case 4: // GW Structures (Section 5)
                    const structuresPayload = (existingStructures || []).map(s => ({
                        structureType: s.type?.toUpperCase().replace(/\s+/g, '_') || 'BOREWELL',
                        category: s.category || 'EXISTING',
                        depth: parseFloat(s.depth || 0),
                        diameter: parseFloat(s.diameter || 0),
                        discharge: parseFloat(s.discharge || 0),
                        depthToWaterLevel: parseFloat(s.depthToWaterLevel || 0),
                        waterMeterFitted: s.hasMeter === 'Yes',
                        yearOfConstruction: parseInt(s.yearOfConstruction || 0),
                        pumpDetails: {
                            pumpType: s.pumpType || 'SUBMERSIBLE',
                            capacityHP: parseFloat(s.pumpCapacity || 0)
                        }
                    }));
                    const section5Data = {
                        groundWaterStructures: structuresPayload,
                        waterRequirement: {
                            proposedExtraction: {
                                numberOfBorewells: parseInt(formData.proposedBorewells || 0),
                                numberOfTubewells: parseInt(formData.proposedTubewells || 0),
                                numberOfDugwells: parseInt(formData.proposedDugwells || 0),
                                totalDailyExtraction: parseFloat(formData.proposedExtraction || 0) || (parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0))
                            }
                        }
                    };
                    response = await nocApplicationService.saveStep5(applicationId, section5Data);
                    break;

                case 5: // Meter Details (Section 9) or Checklist
                    if (hasMeterInstalled) {
                        const section9Data = {
                            digitalFlowMeter: {
                                meterType: formData.flowMeterDetails?.meterType,
                                manufacturer: formData.flowMeterDetails?.manufacturer,
                                modelNumber: formData.flowMeterDetails?.modelNumber,
                                serialNumber: formData.flowMeterDetails?.serialNumber,
                                calibrationDate: formData.flowMeterDetails?.calibrationDate || new Date().toISOString().split('T')[0],
                                telemetry: {
                                    enabled: formData.flowMeterDetails?.telemetryEnabled === 'Yes',
                                    serviceProvider: formData.flowMeterDetails?.telemetryProvider,
                                    proposedInstallationDate: formData.flowMeterDetails?.installationProposedDate
                                }
                            }
                        };
                        response = await nocApplicationService.saveStep9(applicationId, section9Data);
                    } else {
                        // Checklist step (UI only)
                        response = { success: true };
                    }
                    break;

                case 6: // Checklist or Upload Documents
                    if (hasMeterInstalled) {
                        // Step 6 is Checklist which is UI only
                        response = { success: true };
                    } else {
                        // Step 6 is Document Upload (Section 6)
                        const documentsList = Object.entries(formData.uploadedDocumentsDetails || {}).map(([key, docId]) => ({
                            documentType: key.toUpperCase(),
                            documentId: docId,
                            fileName: formData.uploadedDocuments?.[key]?.name || 'Document'
                        }));
                        response = await nocApplicationService.saveStep6(applicationId, {
                            documents: documentsList,
                            documentsReviewed: true
                        });
                    }
                    break;

                case 7: // Upload (with meter) or Fee Calc (without meter)
                    if (hasMeterInstalled) {
                        const documentsList = Object.entries(formData.uploadedDocumentsDetails || {}).map(([key, docId]) => ({
                            documentType: key.toUpperCase(),
                            documentId: docId,
                            fileName: formData.uploadedDocuments?.[key]?.name || 'Document'
                        }));
                        response = await nocApplicationService.saveStep6(applicationId, {
                            documents: documentsList,
                            documentsReviewed: true
                        });
                    } else {
                        // Fee calculation step (UI only)
                        response = { success: true };
                    }
                    break;

                case 8: // Fee Calc (with meter) or Payment Receipt (without meter)
                    if (hasMeterInstalled) {
                        response = { success: true };
                    } else {
                        // Payment Receipt (Section 7)
                        const paymentPayload = {
                            feeDetails: {
                                isPaid: true,
                                paymentMode: formData.paymentMethod || 'online',
                                transactionDate: formData.paymentDate || new Date().toISOString().split('T')[0],
                                paymentId: formData.paymentTransactionId,
                                paymentReceiptDocumentId: formData.uploadedDocumentsDetails?.paymentReceipt,
                                amount: formData.totalAmount
                            }
                        };
                        response = await nocApplicationService.saveStep7(applicationId, paymentPayload);
                    }
                    break;

                case 9: // Payment Receipt (with meter) or Summary
                    if (hasMeterInstalled) {
                        const paymentPayload = {
                            feeDetails: {
                                isPaid: true,
                                paymentMode: formData.paymentMethod || 'online',
                                transactionDate: formData.paymentDate || new Date().toISOString().split('T')[0],
                                paymentId: formData.paymentTransactionId,
                                paymentReceiptDocumentId: formData.uploadedDocumentsDetails?.paymentReceipt,
                                amount: formData.totalAmount
                            }
                        };
                        response = await nocApplicationService.saveStep7(applicationId, paymentPayload);
                    } else {
                        // Summary step (Section 8)
                        response = await nocApplicationService.saveStep8(applicationId, {
                            undertakings: { accepted: true, signedAt: new Date().toISOString() }
                        });
                    }
                    break;

                case 10: // Summary (with meter)
                    response = await nocApplicationService.saveStep8(applicationId, {
                        undertakings: { accepted: true, signedAt: new Date().toISOString() }
                    });
                    break;

                default:
                    response = { success: true };
            }

            if (response && response.success === false) {
                // Ignore if it's just fee calculation failure in local env
                if (!response.message) response.success = true;
            }

            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);

        } catch (error) {
            console.error("Failed to save step:", error);
            // toastError("Failed to save progress. Please try again. " + error.message);
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
        // Check final declaration
        const declarationCheckbox = document.getElementById('finalDeclaration');
        if (declarationCheckbox && !declarationCheckbox.checked) {
            toastWarning('Please check the final declaration box to proceed.');
            return;
        }

        if (validateCurrentStep()) {
            setIsSaving(true);
            try {
                if (!applicationId) throw new Error("Application ID missing for submission");

                // Construct Submission Payload
                const submissionPayload = {
                    companyId: user.companyId || formData.companyId,
                    submittedAt: new Date().toISOString(),
                    undertakings: {
                        accepted: true,
                        signedAt: new Date().toISOString(),
                        ipAddress: 'detected-by-backend'
                    }
                };

                // Final Submit
                const response = await nocApplicationService.submitApplication(applicationId, submissionPayload);

                if (response.success) {
                    toastSuccess('Application submitted successfully!');
                    setSuccessData(response.data);
                    // Clear local draft reference
                    localStorage.removeItem('currentApplicationId');
                    // Navigate to dashboard or success page after brief delay
                    setTimeout(() => navigate('/noc/dashboard'), 2000);
                } else {
                    toastError(response.message || 'Submission failed. Please check all sections.');
                }
            } catch (error) {
                console.error("Submission failed:", error);
                toastError("Critical error during submission. Please contact support.");
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
        <LayoutWithSidebar defaultCollapsed={true} showSidebar={true}>
            {/* Custom Exemption Modal */}
            {showExemptionModal && exemptionStatus && (
                <div className="noc-modal-overlay">
                    <div className="noc-modal-content">
                        <div className="noc-modal-header">
                            <h3 style={{ margin: 0 }}>?? Applicable for Exempted NOC</h3>
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
                                className="btn-secondary"
                                onClick={() => setShowExemptionModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
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

            <div className="">
                <div className="content-container">
                    {/* Form Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                        <h1 className="card-title">NOC Application Form</h1>
                        <p className="bhuneer-form-subtitle">Application for Groundwater Abstraction - Central Ground Water Authority</p>
                    </div>

                    {/* Progress Steps */}
                    <ProgressSteps
                        steps={dynamicFormSteps}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                    />

                    {/* Exemption Certificate - Show if user is exempted */}
                    {exemptionStatus && exemptionStatus.isExempt ? (
                        <ExemptionCertificate
                            formData={formData}
                            exemptionResult={exemptionStatus}
                            onDownload={(certNumber) => {
                                console.log('Certificate downloaded:', certNumber);
                            }}
                            onSubmit={async (certData) => {
                                try {
                                    // Construct payload matching the user's cURL request structure
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

                                    // Submit exemption record to API
                                    const result = await nocApplicationService.submitExemption(payload);

                                    if (result.success) {
                                        toastSuccess('Exemption record submitted successfully to SGWA!');
                                        setSuccessData({
                                            applicationNumber: result.data.applicationNumber || certData.certificateNumber,
                                            status: 'Exempt',
                                            totalAmount: 0,
                                            exemptionType: certData.exemptionType
                                        });
                                    } else {
                                        toastError('Submission failed: ' + (result.message || 'Unknown error'));
                                    }
                                } catch (error) {
                                    console.error('Exemption submission error:', error);
                                    toastWarning('Sync failed. You can still proceed with the downloaded certificate.');
                                }
                            }}
                        />
                    ) : (
                        /* Normal Form Content for Non-Exempted Users */
                        <div className="card card-body">
                            {/* Step 1: Application Type Details */}
                            {currentStep === 1 && (
                                <BasicDetailsStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                    appTypeOptions={appTypeOptions}
                                    appSubTypeOptions={appSubTypeOptions}
                                    projectTypeOptions={projectTypeOptions}
                                    waterQualityOptions={waterQualityOptions}
                                    utilizationPurposeOptions={utilizationPurposeOptions}
                                    organizationTypeOptions={organizationTypeOptions}
                                    msmeTypeOptions={msmeTypeOptions}
                                    handlePendingFileChange={handlePendingFileChange}
                                    pendingUploads={pendingUploads}
                                    exemptionStatus={exemptionStatus}
                                    industryOptions={industryOptions}
                                    miningOptions={miningOptions}
                                    getDisplayLabel={getDisplayLabel}
                                />
                            )}

                            {/* Step 2: Project & Location Details */}
                            {currentStep === 2 && (
                                <ProjectLocationStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                    stateOptions={stateOptions}
                                    districtOptions={districtOptions}
                                    availableBlocks={availableBlocks}
                                    blockCategoryDetails={blockCategoryDetails}
                                    assessmentUnitOptions={assessmentUnitOptions}
                                    geologyTypes={geologyTypes}
                                    waterQualityOptions={waterQualityOptions}
                                />
                            )}

                            {/* Step 3: Water Requirement Details (Consolidated) */}
                            {currentStep === 3 && (
                                <WaterRequirementStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            )}

                            {/* Step 4: Groundwater Abstraction Structures */}
                            {currentStep === 4 && (
                                <GroundwaterStructuresStep
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                    existingStructures={existingStructures}
                                    addExistingStructure={addExistingStructure}
                                    removeExistingStructure={removeExistingStructure}
                                    updateExistingStructure={updateExistingStructure}
                                    structureTypes={structureTypes}
                                />
                            )}



                            {/* Step 5: Conditional - Meter Details (with meter) OR Documents Checklist (without meter) */}
                            {currentStep === 5 && hasMeterInstalled && (
                                <FlowMeterDetailsStep
                                    formData={formData}
                                    setFormData={setFormData}
                                    meterManufacturers={meterManufacturers}
                                    meterModels={meterModels}
                                    telemetryProviders={telemetryProviders}
                                    bisStandards={bisStandards}
                                    meterTypes={meterTypes}
                                    meterSerialNumbers={meterSerialNumbers}
                                />
                            )}

                            {currentStep === 5 && !hasMeterInstalled && (
                                <DocumentChecklistStep
                                    requiredDocs={requiredDocs}
                                    documentsLoading={documentsLoading}
                                />
                            )}

                            {/* Step 6: Conditional - Documents Checklist (with meter) OR Document Upload (without meter) */}
                            {currentStep === 6 && hasMeterInstalled && (
                                <DocumentChecklistStep
                                    requiredDocs={requiredDocs}
                                    documentsLoading={documentsLoading}
                                />
                            )}

                            {currentStep === 6 && !hasMeterInstalled && (
                                <DocumentUploadStep
                                    formData={formData}
                                    errors={errors}
                                    handleFileUpload={handleFileUpload}
                                    verificationFeedback={verificationFeedback}
                                    requiredDocs={requiredDocs}
                                />
                            )}

                            {/* Step 7: Conditional - Document Upload (with meter) OR Fee Calculation (without meter) */}
                            {currentStep === 7 && hasMeterInstalled && (
                                <DocumentUploadStep
                                    formData={formData}
                                    errors={errors}
                                    handleFileUpload={handleFileUpload}
                                    verificationFeedback={verificationFeedback}
                                    requiredDocs={requiredDocs}
                                />
                            )}

                            {currentStep === 7 && !hasMeterInstalled && (
                                <FeeCalculationStep
                                    formData={formData}
                                    handlePaymentComplete={handlePaymentComplete}
                                />
                            )}

                            {/* Step 8: Conditional - Fee Calculation (with meter) OR Payment Receipt (without meter) */}
                            {currentStep === 8 && hasMeterInstalled && (
                                <FeeCalculationStep
                                    formData={formData}
                                    handlePaymentComplete={handlePaymentComplete}
                                />
                            )}

                            {currentStep === 8 && !hasMeterInstalled && (
                                <PaymentReceiptStep
                                    formData={formData}
                                    errors={errors}
                                    handleFileUpload={handleFileUpload}
                                    getDisplayLabel={getDisplayLabel}
                                    appTypeOptions={appTypeOptions}
                                    validateFileSize={validateFileSize}
                                    toastWarning={toastWarning}
                                />
                            )}

                            {/* Step 9: Conditional - Payment Receipt (with meter) OR Summary (without meter) */}
                            {currentStep === 9 && hasMeterInstalled && (
                                <PaymentReceiptStep
                                    formData={formData}
                                    errors={errors}
                                    handleFileUpload={handleFileUpload}
                                    getDisplayLabel={getDisplayLabel}
                                    appTypeOptions={appTypeOptions}
                                    validateFileSize={validateFileSize}
                                    toastWarning={toastWarning}
                                />
                            )}

                            {currentStep === 9 && !hasMeterInstalled && (
                                <SummaryStep
                                    formData={formData}
                                    existingStructures={existingStructures}
                                    getDisplayLabel={getDisplayLabel}
                                    formatDisplayValue={formatDisplayValue}
                                    appTypeOptions={appTypeOptions}
                                    appSubTypeOptions={appSubTypeOptions}
                                    projectTypeOptions={projectTypeOptions}
                                    waterQualityOptions={waterQualityOptions}
                                    utilizationPurposeOptions={utilizationPurposeOptions}
                                    msmeTypeOptions={msmeTypeOptions}
                                    stateOptions={stateOptions}
                                    organizationTypeOptions={organizationTypeOptions}
                                    blockCategory={blockCategory}
                                    exemptionStatus={exemptionStatus}
                                />
                            )}

                            {/* Step 10: Summary (only when meter is installed) */}
                            {currentStep === 10 && hasMeterInstalled && (
                                <SummaryStep
                                    formData={formData}
                                    existingStructures={existingStructures}
                                    getDisplayLabel={getDisplayLabel}
                                    formatDisplayValue={formatDisplayValue}
                                    appTypeOptions={appTypeOptions}
                                    appSubTypeOptions={appSubTypeOptions}
                                    projectTypeOptions={projectTypeOptions}
                                    waterQualityOptions={waterQualityOptions}
                                    utilizationPurposeOptions={utilizationPurposeOptions}
                                    msmeTypeOptions={msmeTypeOptions}
                                    stateOptions={stateOptions}
                                    organizationTypeOptions={organizationTypeOptions}
                                    blockCategory={blockCategory}
                                    exemptionStatus={exemptionStatus}
                                />
                            )}
                        </div>
                    )}
                    {/* Form Navigation - Only show for non-exempted users */}
                    {!exemptionStatus || !exemptionStatus.isExempt ? (
                        <FormNavigation
                            currentStep={currentStep}
                            totalSteps={dynamicFormSteps.length}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onSubmit={handleSubmit}
                            isLastStep={currentStep === dynamicFormSteps.length}
                        />
                    ) : null}
                </div>

            </div>

            {/* Success Modal */}
            {
                successData && (
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
                                ?
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
                                    <strong>Total Fee Paid:</strong> <span style={{ float: 'right', fontWeight: 'bold' }}>?{successData.totalAmount?.toLocaleString('en-IN') || 0}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    className="noc-btn noc-btn-primary"
                                    style={{ padding: '12px 40px', fontSize: '1.2rem', background: 'var(--cgwa-primary)', border: 'none' }}
                                    onClick={() => {
                                        // Auto-redirect to details for verification flow
                                        const targetId = successData.applicationId || successData.id || successData._id;
                                        navigate(`/noc/application/${targetId}`);
                                    }}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </LayoutWithSidebar>
    );
};

export default NOCApplication;








