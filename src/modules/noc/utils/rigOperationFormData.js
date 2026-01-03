
export const rigOperationSteps = [
    { id: 1, label: 'Applicant Details', section: 'A' },
    { id: 2, label: 'Rig Identification', section: 'B' }, // Fetch & Link
    { id: 3, label: 'Ownership & Auth', section: 'C' }, // If not owner
    { id: 4, label: 'Operation Area', section: 'D' }, // Jurisdiction
    { id: 5, label: 'Purpose & Period', section: 'E' },
    { id: 6, label: 'Compliance & History', section: 'F' },
    { id: 7, label: 'Documents', section: 'G' },
    { id: 8, label: 'Fee Payment', section: 'H' },
    { id: 9, label: 'Declaration', section: 'I' }
];

export const initialRigOperationData = {
    // Section A: Applicant
    applicantType: '', // Individual, Firm, etc.
    applicantName: '',
    fatherName: '', // Father's / Authorized Signatory Name
    mobileNumber: '',
    email: '',
    address: '',
    district: '',
    state: 'Rajasthan',
    idProofType: '',
    idProofNumber: '', // New field

    // Section B: Rig ID
    linkedRigRegistrationNo: '', // The key to fetch
    linkedRigId: '',
    linkedRigType: '',
    linkedRigCapacity: '',
    linkedRigOwner: '',
    linkedRigValidity: '',
    isRigActive: false,

    // Section C: Ownership
    isApplicantRigOwner: 'Yes', // Yes / No
    relationshipType: '', // Lease, Contract, Hiring, POA
    authorizationType: '', // Lease, Contract, POA
    authorizationValidityDate: '',

    // Section D: Jurisdiction
    operationDistricts: [], // Multi-select
    operationBlocks: [], // Optional text or multi-select
    areaType: '', // Urban / Rural

    // Section E: Purpose & Period
    operationPurposes: [], // Multi-select (Domestic, Ag, etc.)
    operationMode: 'Duration', // Duration or DateRange
    operationDuration: '', // 3 Months, 6 Months, 1 Year
    startDate: '',
    endDate: '',

    // Section F: Compliance
    pastViolations: 'No',
    violationReference: '',
    violationYear: '',
    violationStatus: '',

    // Checkboxes
    complianceGroundwater: false,
    complianceNotifiedArea: false,
    complianceDepth: false,
    complianceGPS: false,
    complianceLogs: false,

    // Section G: Docs
    uploadedDocuments: {},

    // Section H: Fees
    applicationFee: 10000,
    securityDeposit: 0,
    lateFee: 0,
    paymentMode: '',

    // Section I: Declaration
    declarationAgreed: false
};

export const applicantTypes = ['Individual', 'Firm / Company', 'Cooperative Society', 'Government / PSU'];

export const idProofTypes = ['Aadhaar', 'PAN', 'GST Certificate', 'Government ID', 'Voter ID'];

export const authorizationTypes = ['Lease Agreement', 'Work Contract', 'Power of Attorney', 'Partnership Deed'];

export const relationshipTypes = ['Lease', 'Contract', 'Hiring Basis', 'Authorization / Power of Attorney'];

export const operationDurations = ['3 Months', '6 Months', '1 Year'];

export const operationPurposesList = [
    'Domestic Borewell Drilling',
    'Agricultural Borewell Drilling',
    'Industrial / Commercial Drilling',
    'Infrastructure Projects',
    'Government Works (PHED/JJM)',
    'Repair / Deepening of Existing Wells'
];

// Mock DB for Rig Registry Search
export const MOCK_REGISTRY_DB = [
    {
        regNo: 'RG-RAJ-2024-001',
        type: 'Truck Mounted',
        capacity: '450m',
        owner: 'Sharma Drilling Agency',
        validity: '2026-12-31',
        status: 'Active'
    },
    {
        regNo: 'RG-RAJ-2024-002',
        type: 'DTH Hydraulic',
        capacity: '300m',
        owner: 'Verma Earthworks',
        validity: '2025-06-30',
        status: 'Active'
    },
    {
        regNo: 'RG-RAJ-2023-999',
        type: 'Portable',
        capacity: '100m',
        owner: 'Old Drill Co',
        validity: '2023-12-31',
        status: 'Expired' // Should not be allowed
    }
];

export const validateOperationStep = (step, data) => {
    const errors = {};
    switch (step) {
        case 1:
            if (!data.applicantName) errors.applicantName = 'Required';
            if (!data.mobileNumber) errors.mobileNumber = 'Required';
            break;
        case 2:
            if (!data.linkedRigRegistrationNo) errors.linkedRigRegistrationNo = 'Required';
            if (!data.isRigActive) errors.linkedRigRegistrationNo = 'Valid Active Rig Required';
            break;
        case 3:
            if (data.isApplicantRigOwner === 'No' && !data.authorizationType) errors.authorizationType = 'Required';
            break;
        case 4:
            if (data.operationDistricts.length === 0) errors.operationDistricts = 'Select at least one district';
            break;
        case 5:
            if (data.operationPurposes.length === 0) errors.operationPurposes = 'Select at least one purpose';
            if (!data.operationDuration && !data.endDate) errors.operationDuration = 'Required';
            break;
        case 6:
            if (!data.complianceGPS) errors.complianceGPS = 'Mandatory';
            if (!data.complianceGroundwater) errors.complianceGroundwater = 'Mandatory';
            break;
        case 9:
            if (!data.declarationAgreed) errors.declarationAgreed = 'Must agree';
            break;
    }
    return errors;
};
