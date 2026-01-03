// Form data structure and dropdown options for NOC Application

export const applicationTypes = [
    'Provisional NOC (New Project)',
    'Regular NOC (Existing Project)',
    'NOC Renewal',
    'NOC Amendment / Modification'
];

export const applicationSubTypes = [
    'Construction',
    'Industrial',
    'Mining',
    'Infrastructure',
    // Domestic removed as primary subtype (handled via exemption/other)
    'Domestic (Bulk/Community)',
    'Agriculture',
    'Hotel/Resort',
    'Hospital',
    'Educational Institution',
    'Commercial Complex',
    'Group Housing',
    'Other'
];

export const projectTypes = [
    'New Project',
    'Existing Project',
    'Expansion',
    'Modernization'
];

export const waterQualityTypes = [
    'Potable',
    'Non-Potable',
    'Saline'
];

export const groundWaterUtilization = [
    'Drinking/Domestic',
    'Industry',
    'Mining',
    'Infrastructure',
    'Commercial',
    'Mixed Use'
];

export const msmeTypes = [
    'Micro',
    'Small',
    'Medium',
    'Not Applicable'
];

export const states = [
    'Rajasthan' // Locked to Rajasthan as per Act
];

export const geologyTypes = [
    'Alluvial',
    'Hard Rock',
    'Semi-Consolidated',
    'Coastal',
    'Mixed'
];

export const structureTypes = [
    'Borewell',
    'Tubewell',
    'Dugwell',
    'Dug cum Borewell',
    'Open Well',
    'Pump'
];

export const documentTypes = [
    {
        id: 'land_ownership',
        name: 'Land Ownership / Lease Documents',
        required: true,
        description: 'Sale deed, Jamabandi, or valid lease deed'
    },
    {
        id: 'nbc_calculation',
        name: 'Water Requirement Calculation',
        required: true,
        description: 'Detailed calculation as per NBC-2016 norms'
    },
    {
        id: 'project_report',
        name: 'Detailed Project Report (DPR)',
        required: true,
        description: 'Covering water balance and usage'
    },
    {
        id: 'site_plan',
        name: 'Site Plan / Location Map',
        required: true,
        description: 'Showing all existing/proposed wells with geo-coordinates'
    },
    {
        id: 'affidavit',
        name: 'Notarized Affidavit (Annexure-12)',
        required: true,
        description: 'On ₹100 Stamp Paper as per format'
    },
    {
        id: 'flow_meter_undertaking',
        name: 'Flow Meter Undertaking/Proposal',
        required: true,
        description: 'Proposal for digital flow meter with telemetry'
    },
    {
        id: 'rainwater_plan',
        name: 'Rainwater Harvesting Plan',
        required: true,
        description: 'Technical design for recharge structures'
    },
    {
        id: 'cte_cto',
        name: 'Consent to Establish/Operate (CTE/CTO)',
        required: false, // Mandatory for Industry/Mining but not all
        description: 'From Pollution Control Board'
    },
    {
        id: 'mining_plan',
        name: 'Approved Mining Plan',
        required: false, // Mandatory for Mining
        description: 'Approved by Dept of Mines & Geology'
    },
    {
        id: 'extra_doc_1',
        name: 'Previous NOC (If Applicable)',
        required: false,
        description: 'For Renewal/Existing projects'
    }
];

export const initialFormData = {
    // Application Type Details
    applicationType: '',
    applicationSubType: '',
    projectType: '',
    waterQualityType: '',
    groundWaterUtilizationFor: '',
    dateOfCommencement: '',
    existingNOCStatus: 'No',
    oldNOCNo: '',
    isMSME: 'No',
    msmeType: '',
    msmeRegistrationNumber: '',
    isExemptMSME: false,

    // Project Details
    projectName: '',
    projectNameType: '',

    // Location Details
    state: '',
    assessmentUnit: '',
    relevantBlocks: '',
    tehsil: '',
    projectAddress: '',
    pincode: '',
    latitude: '',
    longitude: '',
    geology: '',

    // Water Requirement
    waterRequiredForGreenbelt: '',
    greenbeltArea: '',
    wetlandAreasName: '',
    dailyWaterRequirement: '',
    annualWaterRequirement: '',

    // Existing Structures
    existingStructures: [],

    // Proposed Structures
    proposedBorewells: 0,
    proposedTubewells: 0,
    proposedDugwells: 0,
    proposedDugCumBorewells: 0,
    proposedPumps: 0,

    // Applicant Details
    applicantName: '',
    applicantEmail: '',
    applicantMobile: '',
    applicantAadhaar: '',
    applicantPAN: '',
    organizationName: '',
    organizationType: '',
    designation: '',

    // Documents
    uploadedDocuments: {},

    // Payment
    applicationFee: 0,
    gstAmount: 0,
    totalAmount: 0,
    paymentStatus: 'pending', // pending, paid, verified
    paymentTransactionId: '',
    paymentDate: '',
    paymentReceiptNumber: '',
    paymentMethod: 'online', // online/offline

    // Technical Compliance
    piezometerRequired: false,
    geologyType: '',
    piezometerDetails: {
        distanceFromWell: '',
        depth: '',
        monitoringFrequency: 'Monthly',
        qualityTestingFrequency: 'Annual',
        nablLabName: '',
        installationDate: '',
        piezometerLocation: '',
        coordinates: { latitude: '', longitude: '' }
    },
    flowMeterDetails: {
        meterType: '',
        manufacturer: '',
        modelNumber: '',
        serialNumber: '',
        bisStandard: '',
        telemetryEnabled: 'Yes',
        telemetryProvider: '',
        installationProposedDate: '',
        calibrationDate: '',
        calibrationCertificate: null
    }
};

export const formSteps = [
    {
        id: 1,
        title: 'Application Type',
        description: 'Select application type and project details'
    },
    {
        id: 2,
        title: 'Project & Location',
        description: 'Project information and site location'
    },
    {
        id: 3,
        title: 'Water Requirement',
        description: 'Water requirement and usage details'
    },
    {
        id: 4,
        title: 'Groundwater Structures',
        description: 'Existing and proposed structures'
    },
    {
        id: 5,
        title: 'Applicant Details',
        description: 'Applicant information'
    },
    {
        id: 6,
        title: 'Technical Compliance',
        description: 'Piezometer and Flow Meter requirements'
    },
    {
        id: 7,
        title: 'Document Upload',
        description: 'Upload required documents'
    },
    {
        id: 8,
        title: 'Payment',
        description: 'Application fee payment'
    },
    {
        id: 9,
        title: 'Review & Submit',
        description: 'Review application and submit'
    }
];
