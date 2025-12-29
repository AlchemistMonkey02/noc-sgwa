// Form validation utilities for NOC Application

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validateMobile = (mobile) => {
    const re = /^[0-9]{10}$/;
    return re.test(mobile);
};

export const validatePAN = (pan) => {
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return re.test(pan);
};

export const validateAadhaar = (aadhaar) => {
    const re = /^[0-9]{12}$/;
    return re.test(aadhaar);
};

export const validatePincode = (pincode) => {
    const re = /^[0-9]{6}$/;
    return re.test(pincode);
};

export const validateLatitude = (lat) => {
    const num = parseFloat(lat);
    return !isNaN(num) && num >= -90 && num <= 90;
};

export const validateLongitude = (lon) => {
    const num = parseFloat(lon);
    return !isNaN(num) && num >= -180 && num <= 180;
};

export const validateStep1 = (formData) => {
    const errors = {};

    if (!formData.applicationType) {
        errors.applicationType = 'Application type is required';
    }

    if (!formData.applicationSubType) {
        errors.applicationSubType = 'Application sub type is required';
    }

    if (!formData.projectType) {
        errors.projectType = 'Project type is required';
    }

    if (!formData.waterQualityType) {
        errors.waterQualityType = 'Water quality type is required';
    }

    if (!formData.groundWaterUtilizationFor) {
        errors.groundWaterUtilizationFor = 'Ground water utilization purpose is required';
    }

    if (!formData.dateOfCommencement) {
        errors.dateOfCommencement = 'Date of commencement is required';
    }

    if (formData.existingNOCStatus === 'Yes' && !formData.oldNOCNo) {
        errors.oldNOCNo = 'Old NOC number is required';
    }

    if (formData.isMSME === 'Yes' && !formData.msmeType) {
        errors.msmeType = 'MSME type is required';
    }

    if (formData.isMSME === 'Yes' && !formData.msmeRegistrationNumber.trim()) {
        errors.msmeRegistrationNumber = 'MSME registration number is required';
    }

    return errors;
};

export const validateStep2 = (formData) => {
    const errors = {};

    if (!formData.projectName.trim()) {
        errors.projectName = 'Project name is required';
    }

    if (!formData.state) {
        errors.state = 'State is required';
    }

    if (!formData.assessmentUnit.trim()) {
        errors.assessmentUnit = 'Assessment unit is required';
    }

    if (!formData.projectAddress.trim()) {
        errors.projectAddress = 'Project address is required';
    }

    if (!formData.pincode) {
        errors.pincode = 'Pincode is required';
    } else if (!validatePincode(formData.pincode)) {
        errors.pincode = 'Invalid pincode format (6 digits required)';
    }

    if (formData.latitude && !validateLatitude(formData.latitude)) {
        errors.latitude = 'Invalid latitude (must be between -90 and 90)';
    }

    if (formData.longitude && !validateLongitude(formData.longitude)) {
        errors.longitude = 'Invalid longitude (must be between -180 and 180)';
    }

    if (!formData.geology) {
        errors.geology = 'Geology type is required';
    }

    return errors;
};

export const validateStep3 = (formData) => {
    const errors = {};

    if (!formData.dailyWaterRequirement || formData.dailyWaterRequirement <= 0) {
        errors.dailyWaterRequirement = 'Daily water requirement must be greater than 0';
    }

    if (!formData.annualWaterRequirement || formData.annualWaterRequirement <= 0) {
        errors.annualWaterRequirement = 'Annual water requirement must be greater than 0';
    }

    return errors;
};

export const validateStep4 = (formData) => {
    const errors = {};

    const totalProposed =
        parseInt(formData.proposedBorewells || 0) +
        parseInt(formData.proposedTubewells || 0) +
        parseInt(formData.proposedDugwells || 0) +
        parseInt(formData.proposedDugCumBorewells || 0) +
        parseInt(formData.proposedPumps || 0);

    if (totalProposed === 0) {
        errors.proposedStructures = 'At least one proposed structure is required';
    }

    return errors;
};

export const validateStep5 = (formData) => {
    const errors = {};

    if (!formData.applicantName.trim()) {
        errors.applicantName = 'Applicant name is required';
    }

    if (!formData.applicantEmail) {
        errors.applicantEmail = 'Email is required';
    } else if (!validateEmail(formData.applicantEmail)) {
        errors.applicantEmail = 'Invalid email format';
    }

    if (!formData.applicantMobile) {
        errors.applicantMobile = 'Mobile number is required';
    } else if (!validateMobile(formData.applicantMobile)) {
        errors.applicantMobile = 'Invalid mobile number (10 digits required)';
    }

    if (formData.applicantPAN && !validatePAN(formData.applicantPAN)) {
        errors.applicantPAN = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    if (formData.applicantAadhaar && !validateAadhaar(formData.applicantAadhaar)) {
        errors.applicantAadhaar = 'Invalid Aadhaar number (12 digits required)';
    }

    if (!formData.organizationName.trim()) {
        errors.organizationName = 'Organization name is required';
    }

    if (!formData.organizationType) {
        errors.organizationType = 'Organization type is required';
    }

    return errors;
};

export const validateStep6 = (formData) => {
    const errors = {};

    // Check if MSME is exempt
    if (formData.isExemptMSME) {
        // Exempt MSMEs only need MSME certificate and affidavit
        if (!formData.uploadedDocuments.msme) {
            errors.msme = 'MSME certificate is required for exempt applications';
        }
        if (!formData.uploadedDocuments.affidavit) {
            errors.affidavit = 'Affidavit/Declaration of water usage is required for exempt applications';
        }
    } else {
        // Full NOC process requires all standard documents
        const requiredDocs = ['cte', 'projectReport', 'siteplan', 'ownership', 'waterQuality', 'rwh', 'affidavit', 'noc_local'];

        requiredDocs.forEach(docId => {
            if (!formData.uploadedDocuments[docId]) {
                errors[docId] = 'This document is required';
            }
        });

        // MSME certificate required if MSME is selected (but not necessarily exempt)
        if (formData.isMSME === 'Yes' && !formData.uploadedDocuments.msme) {
            errors.msme = 'MSME certificate is required';
        }
    }

    return errors;
};

export const validateFileSize = (file, maxSizeMB = 5) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    return file.size <= maxSize;
};

export const validateFileType = (file, allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']) => {
    return allowedTypes.includes(file.type);
};
