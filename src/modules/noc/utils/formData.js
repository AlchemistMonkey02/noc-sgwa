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
    'Mixed',
    'Other'
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
    // 1. Common Documents (Required for ALL)
    {
        id: 'applicant_id_proof',
        name: 'Applicant ID Proof',
        required: true,
        description: 'Aadhaar Card / PAN Card / Voter ID of Authorized Signatory'
    },
    {
        id: 'land_ownership',
        name: 'Land Ownership Document / Lease Deed',
        required: true,
        description: 'Registered Sale Deed / Lease Deed / Jamabandi'
    },
    {
        id: 'site_plan',
        name: 'Site Location Map',
        required: true,
        description: 'Google Map with Site Marked + Revenue/Survey Map'
    },
    {
        id: 'project_report', // Merged "Project Description"
        name: 'Project Description / Brief Note',
        required: true,
        description: 'Brief note on project activity and water requirement'
    },
    {
        id: 'affidavit',
        name: 'Affidavit / Self Declaration',
        required: true,
        description: 'Notarized affidavit on Rs. 100 Non-Judicial Stamp Paper'
    },
    {
        id: 'rainwater_plan',
        name: 'Rainwater Harvesting Plan',
        required: true,
        description: 'Proposal/Plan for Rainwater Harvesting implementation'
    },
    {
        id: 'nabl_report',
        name: 'Water Quality Report (NABL)',
        required: true,
        description: 'Recent water quality test report from NABL accredited lab'
    },

    // 2. Industrial Specific
    {
        id: 'dpr',
        name: 'Detailed Project Report (DPR)',
        required: false,
        description: 'Comprehensive DPR covering production, water balance, etc.'
    },
    {
        id: 'industry_reg',
        name: 'Industry Registration',
        required: false,
        description: 'MSME / Udyam / DIC Registration / Factory License'
    },
    {
        id: 'msme_certificate',
        name: 'MSME Certificate',
        required: false,
        description: 'Copy of MSME / Udyam Registration Certificate'
    },
    {
        id: 'water_balance', // Covers "Water Balance Diagram"
        name: 'Water Balance Diagram',
        required: false,
        description: 'Flow chart showing water input, consumption, and discharge'
    },
    {
        id: 'etp_stp_details',
        name: 'ETP / STP Details',
        required: false,
        description: 'Design details, capacity, and technology of ETP/STP'
    },
    {
        id: 'cto_cte',
        name: 'Consent to Operate/Establish (CTO/CTE)',
        required: false,
        description: 'Consent from State Pollution Control Board'
    },
    {
        id: 'flow_meter_undertaking',
        name: 'Flow Meter Undertaking',
        required: false,
        description: 'Undertaking to install tamper-proof digital flow meter with telemetry'
    },

    // 3. Infrastructure / Commercial
    {
        id: 'building_plan',
        name: 'Approved Building Plan',
        required: false,
        description: 'Building plan approved by local development authority'
    },
    {
        id: 'occupancy_cert',
        name: 'Occupancy / Completion Certificate',
        required: false,
        description: 'Required for existing infrastructure projects'
    },
    {
        id: 'fire_noc',
        name: 'Fire NOC',
        required: false,
        description: 'Fire Safety Clearance (if applicable)'
    },

    // 4. Mining / Construction
    {
        id: 'mining_permit',
        name: 'Mining Permit / Lease',
        required: false,
        description: 'Valid mining lease / permit from Dept of Mines'
    },
    {
        id: 'dewatering_plan',
        name: 'Dewatering Plan',
        required: false,
        description: 'Plan for groundwater extraction and management'
    },

    // 5. Domestic / Agricultural (If ever needed for NOC)
    {
        id: 'proof_residence',
        name: 'Proof of Residence',
        required: false,
        description: 'Electricity Bill / Ration Card'
    },
    {
        id: 'land_records_agri',
        name: 'Agriculture Land Records',
        required: false,
        description: 'Khasra / Khatauni reflecting agriculture land use'
    },

    // 6. Conditional / Special
    {
        id: 'impact_assessment',
        name: 'Impact Assessment Report',
        required: false,
        description: 'Required if water demand > 100 m³/day'
    },
    {
        id: 'gw_modelling',
        name: 'Ground Water Modelling Report',
        required: false,
        description: 'Required if water demand > 100 m³/day'
    },
    {
        id: 'hydrogeological_report',
        name: 'Hydrogeological Report',
        required: false,
        description: 'Required for Mining or Over-exploited/Critical areas'
    },
    {
        id: 'drilling_permission',
        name: 'Drilling Permission',
        required: false,
        description: 'For new borewell drilling'
    },
    {
        id: 'previous_noc',
        name: 'Previous NOC',
        required: false,
        description: 'Copy of previous/expired NOC (for existing projects/renewals)'
    },
    {
        id: 'ec_clearance',
        name: 'Environmental Clearance (EC)',
        required: false,
        description: 'Environmental Clearance from MoEF&CC / SEIAA (if applicable)'
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
    otherGeology: '',

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

    // Population for Domestic Use
    numberOfWorkers: 0,
    numberOfResidents: 0,
    dailyRequirementPerPerson: 135,

    // Existing Structures
    existingStructures: [],

    // Proposed Structures (Step 4)
    proposedBorewells: 0,
    proposedTubewells: 0,
    proposedDugwells: 0,
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
