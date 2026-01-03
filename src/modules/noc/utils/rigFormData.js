
export const rigFormSteps = [
    { id: 1, label: 'Application Type', section: 'A' },
    { id: 2, label: 'Applicant Details', section: 'B' },
    { id: 3, label: 'Address & Location', section: 'C' },
    { id: 4, label: 'Vehicle Details', section: 'D1' }, // New Split
    { id: 5, label: 'Machine/Rig Specs', section: 'D2' }, // New Split
    { id: 6, label: 'Operator/Staff', section: 'D3' }, // New Section
    { id: 7, label: 'Proposed Work', section: 'E' },
    { id: 8, label: 'Movement Plan', section: 'F' }, // New Section
    { id: 9, label: 'Documents', section: 'G' },
    { id: 10, label: 'Sponsorship/Work Order', section: 'H' },
    { id: 11, label: 'Declaration', section: 'I' }
];

export const initialRigFormData = {
    // Section A: Type
    applicationType: '', // New / Renewal / Amendment
    rigCategory: '', // DTH / Rotary / Combination

    // Section B: Applicant
    applicantCategory: '', // Individual / Agency
    applicantName: '',
    fatherName: '',
    mobileNumber: '',
    email: '',
    gstNumber: '',
    panNumber: '',

    // Section C: Address
    address: '',
    state: 'Rajasthan',
    district: '',
    pincode: '',
    baseLocation: '', // Yard address

    // Section D1: Vehicle Details
    vehicleRegNo: '', // RJ-14-...
    vehicleChassisNo: '',
    vehicleEngineNo: '',
    vehicleMake: '',
    vehicleModel: '',
    roadTaxValidUpto: '',
    insuranceValidUpto: '',
    pucValidUpto: '',
    fitnessValidUpto: '',
    gpsImei: '', // Mandatory for tracking

    // Section D2: Machine/Rig Details
    rigSerialNo: '',
    rigMake: '',
    rigModel: '',
    yearOfMfg: '',
    rigCapacityDepth: '', // meters
    rigCapacityDiameter: '', // mm
    compressorMake: '',
    compressorModel: '',
    compressorSerialNo: '',
    compressorCapacity: '', // CFM/PSI

    // Section D3: Operator/Staff
    operatorName: '',
    operatorMobile: '',
    operatorLicenseNo: '', // Driver's license
    helperName: '',

    // Section E: Proposed Work
    proposedActivity: '', // Purpose of drilling
    workOrderNo: '', // If Govt work
    workOrderDate: '',
    sponsoringAgency: '', // PHED / Pvt

    // Section F: Movement Plan
    movementDistrict: [], // Multi select
    movementFromDate: '',
    movementToDate: '',

    // Section G: Docs (Managed via state mostly)
    uploadedDocuments: {},

    // Section I: Declaration
    declarationAgreed: false
};

export const rigTypes = ['DTH (Down-The-Hole)', 'Rotary', 'Combination (DTH+Rotary)', 'Percussion', 'Manual / Hand Boring'];

export const rigMountingTypes = ['Truck Mounted', 'Crawler Mounted', 'Tractor Mounted', 'Portable / Skid Mounted'];

export const applicantCategories = ['Individual Owner', 'Private Drilling Agency', 'Government Agency', 'Public Sector Undertaking'];

export const rigApplicationTypes = ['New Registration', 'Renewal of Registration', 'Amendment of Details'];

export const vehicleMakes = ['Ashok Leyland', 'Tata Motors', 'Eicher', 'Mahindra', 'BharatBenz', 'Other'];

export const compressorMakes = ['Atlas Copco', 'Elgi', 'Ingersoll Rand', 'Chicago Pneumatic', 'Kirloskar', 'Other'];

// Validation Helper
export const validateRigStep = (step, data) => {
    const errors = {};
    switch (step) {
        case 1:
            if (!data.applicationType) errors.applicationType = 'Required';
            if (!data.rigCategory) errors.rigCategory = 'Required';
            break;
        case 2:
            if (!data.applicantName) errors.applicantName = 'Required';
            if (!data.mobileNumber) errors.mobileNumber = 'Required';
            // Basic regex for mobile
            if (data.mobileNumber && !/^[0-9]{10}$/.test(data.mobileNumber)) errors.mobileNumber = 'Invalid Mobile';
            break;
        case 3:
            if (!data.address) errors.address = 'Required';
            if (!data.district) errors.district = 'Required';
            break;
        case 4: // Vehicle
            if (!data.vehicleRegNo) errors.vehicleRegNo = 'Required';
            if (!data.vehicleChassisNo) errors.vehicleChassisNo = 'Required';
            if (!data.insuranceValidUpto) errors.insuranceValidUpto = 'Required';
            break;
        case 5: // Machine
            if (!data.rigSerialNo) errors.rigSerialNo = 'Required';
            if (!data.rigCapacityDepth) errors.rigCapacityDepth = 'Required';
            break;
        case 11:
            if (!data.declarationAgreed) errors.declarationAgreed = 'Must agree';
            break;
    }
    return errors;
};
