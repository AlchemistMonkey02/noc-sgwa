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
    'Pump'
];

export const documentTypes = [
    {
        id: 'loa',
        name: 'Authorization Letter / Letter of Authority (LOA)',
        required: true,
        description: 'Authorized signatory letter on company letterhead'
    },
    {
        id: 'land_ownership',
        name: 'Certificate/Affidavit of Land Ownership',
        required: true,
        description: 'Sale deed, Jamabandi, or valid lease deed'
    },
    {
        id: 'site_map',
        name: 'Site Map / Plot Plan',
        required: true,
        description: 'Showing all existing/proposed wells with GPS coordinates'
    },
    {
        id: 'water_balance',
        name: 'Water Balance Chart / Flow Diagram',
        required: true,
        description: 'Detailed water usage and recycling flow'
    },
    {
        id: 'dpr',
        name: 'Detailed Project Report (DPR)',
        required: true,
        description: 'Comprehensive project report with water requirements'
    },
    {
        id: 'cte',
        name: 'Consent to Establish (CTE)',
        required: false,
        description: 'From State Pollution Control Board (for industries)'
    },
    {
        id: 'cto',
        name: 'Consent to Operate (CTO)',
        required: false,
        description: 'From State Pollution Control Board (for existing industries)'
    },
    {
        id: 'gw_quality',
        name: 'Ground Water Quality Report',
        required: true,
        description: 'Recent water quality test report from NABL lab'
    },
    {
        id: 'rwh_plan',
        name: 'Rainwater Harvesting Plan/Affidavit',
        required: true,
        description: 'Technical design for rainwater recharge structures'
    },
    {
        id: 'msme_cert',
        name: 'MSME Certificate',
        required: false,
        description: 'Udyam registration certificate (if MSME)'
    },
    {
        id: 'previous_noc',
        name: 'Previous NOC Copy',
        required: false,
        description: 'For renewal/amendment applications'
    },
    {
        id: 'env_clearance',
        name: 'Environmental Clearance',
        required: false,
        description: 'EC from MoEF (for projects above threshold)'
    },
    {
        id: 'impact_assessment',
        name: 'Impact Assessment Report',
        required: false,
        description: 'For mining or large-scale dewatering projects'
    },
    {
        id: 'bis_license',
        name: 'BIS License Copy',
        required: false,
        description: 'For packaged drinking water industries'
    },
    {
        id: 'mining_lease',
        name: 'Mining Lease Copy',
        required: false,
        description: 'Approved mining lease document'
    },
    {
        id: 'affidavit',
        name: 'Notarized Affidavit',
        required: true,
        description: 'On ₹100 stamp paper as per prescribed format'
    },
    {
        id: 'flow_meter',
        name: 'Flow Meter Undertaking',
        required: true,
        description: 'Proposal for digital flow meter installation with telemetry'
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
    totalLandArea: '',
    greenBeltArea: '',
    isInWetland: false,
    wetlandName: '',
    geology: '',

    // Drinking & Domestic Water
    numberOfWorkers: '',
    numberOfResidents: '',
    dailyRequirementPerPerson: 135, // CGWA standard in liters
    domesticTotalDaily: 0,
    domesticTotalAnnual: 0,

    // Water Requirement Breakup
    waterActivities: [], // Array of {activity, total, freshGW, surface, recycled}
    stpCapacity: '',
    etpCapacity: '',
    recycledWaterUsage: '',
    netFreshWaterRequired: 0,
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
        title: 'Basic Details',
        description: 'Application type, project details, and MSME status'
    },
    {
        id: 2,
        title: 'Location Details',
        description: 'Project location, coordinates, and land information'
    },
    {
        id: 3,
        title: 'Drinking & Domestic',
        description: 'Drinking and domestic water requirements'
    },
    {
        id: 4,
        title: 'Water Requirement',
        description: 'Activity-wise water breakup and sources'
    },
    {
        id: 5,
        title: 'GW Structures',
        description: 'Existing and proposed groundwater structures'
    },
    {
        id: 6,
        title: 'Documents Required',
        description: 'Checklist of required documents for your application'
    },
    {
        id: 7,
        title: 'Upload Documents',
        description: 'Upload all required documents and certificates'
    },
    {
        id: 8,
        title: 'Fee Calculation',
        description: 'Application fee calculation and payment gateway'
    },
    {
        id: 9,
        title: 'Payment Receipt',
        description: 'Upload payment receipt and transaction details'
    },
    {
        id: 10,
        title: 'Summary',
        description: 'Review and submit your application'
    }
];
