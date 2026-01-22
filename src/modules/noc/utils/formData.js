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

export const industryTypes = [
    'Packaged Drinking Water / Mineral Water',
    'Tannery',
    'Distillery / Breweries',
    'Textile / Dyeing & Printing',
    'Paper & Pulp',
    'Power Plant',
    'Chemical / Pharmaceutical',
    'Steel / Metal Industry',
    'Food Processing / Cold Storage',
    'Ice Factory',
    'Mining / Mineral Processing',
    'Infrastructure / Construction',
    'General Manufacturing (Non-Water Intensive)',
    'Other'
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
    'Submersible Pump',
    'Centrifugal Pump'
];

export const documentTypes = [
    {
        id: 'affidavit',
        name: 'Affidavit - Land Ownership Document',
        required: true,
        description: 'Notarized affidavit regarding land ownership'
    },
    {
        id: 'site_plan',
        name: 'Site Plan / Layout Plan',
        required: true,
        description: 'Detailed site map showing all structures'
    },
    {
        id: 'impact_assessment',
        name: 'Impact Assessment Report',
        required: false, // Mandatory if > 100 KLD
        description: 'Required if total water requirement > 100 KLD'
    },
    {
        id: 'gw_modelling',
        name: 'Ground Water Modelling Report',
        required: false, // Mandatory if > 100 KLD
        description: 'Required if total water requirement > 100 KLD'
    },
    {
        id: 'nabl_report',
        name: 'NABL Approved Lab Report',
        required: true,
        description: 'Water quality report from NABL accredited lab'
    },
    {
        id: 'cto_cte',
        name: 'CTO / CTE',
        required: true,
        description: 'Consent to Operate / Establish (Mandatory)'
    }
];

// Water activity types for breakup
export const waterActivityTypes = [
    'Industrial Process',
    'Boiler Feed',
    'Cooling Tower',
    'Domestic/Drinking',
    'Greenbelt/Horticulture',
    'Firefighting',
    'Construction',
    'Other'
];

export const waterSourceTypes = [
    'Fresh Ground Water',
    'Surface Water',
    'Recycled Water (STP)',
    'Recycled Water (ETP)',
    'Municipal Supply'
];

export const initialFormData = {
    // Application Type Details
    applicationType: '',
    applicationSubType: '',
    projectType: '',
    projectStatus: '', // Existing or New
    waterQualityType: '',
    groundWaterUtilizationFor: '',
    industryType: '',
    miningType: '',
    otherProjectType: '',
    industryNICCode: '',
    dateOfCommencement: '',
    existingNOCStatus: 'No',
    oldNOCNo: '',
    isMSME: 'No',
    msmeType: '',
    msmeRegistrationNumber: '',
    msmeRegistrationDate: '',
    isExemptMSME: false,

    // Project Details
    projectName: '',
    projectNameType: '',

    // Location Details
    state: '',
    district: '',
    block: '',
    assessmentUnit: '',
    relevantBlocks: '',
    tehsil: '',
    projectAddress: '',
    communicationAddress: '',
    sameAsProjectAddress: false,
    pincode: '',
    latitude: '',
    longitude: '',
    totalLandArea: '', // Kept for backward compatibility if needed, but Step 2 uses specific fields now
    greenBeltArea: '', // Kept for backward compatibility
    isInWetland: false,
    wetlandName: '',
    geology: '',

    // Step 2: Land Use Details
    landUseTotalArea: '',
    landUseRooftopArea: '',
    landUsePavedArea: '',
    landUseGreenBeltArea: '',
    landUseOpenArea: '',

    // Step 3: Water Requirement Details
    waterReqTotalFresh: '', // Fresh Water
    waterReqRecycled: '', // Recycled Water
    waterReqTotal: '', // Fresh + Recycled (Calculated)

    // Water Requirement Breakup
    waterReqDomestic: '',
    waterReqIndustrial: '',
    waterReqGreenBelt: '',
    waterReqOther: '',
    waterReqFreshRequirement: '', // Explicit field from user request

    // Existing Structures
    existingStructures: [],

    // Proposed Structures (Step 4)
    // We will use the existingStructures array model for proposed as well, or specific fields if simpler.
    // User asked for "ask for water pump submersible centrifugal pump capacity hp" in GW structures.
    // We'll add these to the structure object model, so no new top-level fields needed for structure details specifically,
    // but we need to ensure the structure object has them.

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
        title: 'Basic Details',
        description: 'Application type, project details, and MSME status'
    },
    {
        id: 2,
        title: 'Location Details',
        description: 'Project location, land use, and coordinates'
    },
    {
        id: 3,
        title: 'Water Requirement',
        description: 'Detailed water requirement breakdown'
    },
    {
        id: 4,
        title: 'GW Structures',
        description: 'Existing and proposed groundwater structures'
    },
    {
        id: 5,
        title: 'Documents Checklist',
        description: 'Checklist of required documents'
    },
    {
        id: 6,
        title: 'Upload Documents',
        description: 'Upload all required documents and certificates'
    },
    {
        id: 7,
        title: 'Fee Calculation',
        description: 'Application fee calculation'
    },
    {
        id: 8,
        title: 'Payment Receipt',
        description: 'Upload payment receipt'
    },
    {
        id: 9,
        title: 'Summary',
        description: 'Review and submit your application'
    }
];
