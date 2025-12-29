// Form data structure and dropdown options for NOC Application

export const applicationTypes = [
    'Fresh NOC',
    'NOC Renewal',
    'NOC Amendment',
    'NOC Transfer'
];

export const applicationSubTypes = [
    'Construction',
    'Industrial',
    'Mining',
    'Infrastructure',
    'Domestic/Drinking',
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
    'Expansion of Existing Project',
    'Modernization'
];

export const waterQualityTypes = [
    'Potable',
    'Non-Potable'
];

export const groundWaterUtilization = [
    'Drinking/Domestic',
    'Industrial',
    'Irrigation',
    'Construction',
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
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
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
        id: 'cte',
        name: 'Consent to Establish (CTE)',
        required: true,
        description: 'Valid CTE from State Pollution Control Board'
    },
    {
        id: 'projectReport',
        name: 'Detailed Project Report',
        required: true,
        description: 'Comprehensive project report with water requirement calculations'
    },
    {
        id: 'siteplan',
        name: 'Site Plan',
        required: true,
        description: 'Detailed site plan showing location of borewells'
    },
    {
        id: 'ownership',
        name: 'Land Ownership Documents',
        required: true,
        description: 'Sale deed, lease agreement, or ownership proof'
    },
    {
        id: 'waterQuality',
        name: 'Water Quality Report',
        required: true,
        description: 'From NABL accredited laboratory'
    },
    {
        id: 'rwh',
        name: 'Rainwater Harvesting Plan',
        required: true,
        description: 'Detailed RWH and recharge plan'
    },
    {
        id: 'msme',
        name: 'MSME Certificate',
        required: false,
        description: 'Required for MSME applicants',
        exemptRequired: true // Required for exempt MSMEs
    },
    {
        id: 'affidavit',
        name: 'Affidavit',
        required: true,
        description: 'On non-judicial stamp paper (Declaration of water usage for exempt MSMEs)',
        exemptRequired: true // Required for exempt MSMEs
    },
    {
        id: 'noc_local',
        name: 'NOC from Local Authority',
        required: true,
        description: 'From Municipal Corporation/Panchayat'
    },
    {
        id: 'environmental',
        name: 'Environmental Clearance',
        required: false,
        description: 'If applicable for the project'
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
    paymentMethod: 'online' // online/offline
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
        title: 'Document Upload',
        description: 'Upload required documents'
    },
    {
        id: 7,
        title: 'Payment',
        description: 'Application fee payment'
    },
    {
        id: 8,
        title: 'Review & Submit',
        description: 'Review application and submit'
    }
];
