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

    // Step 6: Technical Compliance (Flow Meter & Piezometer)
    // Note: Checkboxes use HTML5 required attribute, so we focus on field validations
    
    // Flow Meter validation (MANDATORY for ALL)
    const flowMeter = formData.flowMeterDetails || {};
    
    if (!flowMeter.meterType || !flowMeter.meterType.trim()) {
        errors['flowMeter.meterType'] = 'Meter type is required';
    }
    
    if (!flowMeter.manufacturer || !flowMeter.manufacturer.trim()) {
        errors['flowMeter.manufacturer'] = 'Manufacturer name is required';
    }
    
    if (!flowMeter.modelNumber || !flowMeter.modelNumber.trim()) {
        errors['flowMeter.modelNumber'] = 'Model number is required';
    }
    
    if (!flowMeter.bisStandard || !flowMeter.bisStandard.trim()) {
        errors['flowMeter.bisStandard'] = 'BIS/IS Standard Certification Number is required';
    }
    
    if (!flowMeter.telemetryEnabled || flowMeter.telemetryEnabled !== 'Yes') {
        errors['flowMeter.telemetryEnabled'] = 'Telemetry must be enabled (mandatory)';
    }
    
    if (!flowMeter.telemetryProvider || !flowMeter.telemetryProvider.trim()) {
        errors['flowMeter.telemetryProvider'] = 'Telemetry service provider is required';
    }
    
    if (!flowMeter.installationProposedDate) {
        errors['flowMeter.installationProposedDate'] = 'Proposed installation date is required';
    }
    
    // Piezometer validation (only if required)
    if (formData.piezometerRequired) {
        const piezometer = formData.piezometerDetails || {};
        
        if (!piezometer.distanceFromWell || !piezometer.distanceFromWell.toString().trim()) {
            errors['piezometer.distanceFromWell'] = 'Distance from pumping well is required';
        } else if (parseFloat(piezometer.distanceFromWell) < 50) {
            errors['piezometer.distanceFromWell'] = 'Distance must be at least 50 meters from pumping well';
        }
        
        if (!piezometer.depth || !piezometer.depth.toString().trim()) {
            errors['piezometer.depth'] = 'Piezometer depth is required';
        }
        
        if (!piezometer.piezometerLocation || !piezometer.piezometerLocation.trim()) {
            errors['piezometer.piezometerLocation'] = 'Piezometer location is required';
        }
        
        if (!piezometer.coordinates || !piezometer.coordinates.latitude || !piezometer.coordinates.latitude.toString().trim()) {
            errors['piezometer.coordinates.latitude'] = 'GPS Latitude is required';
        }
        
        if (!piezometer.coordinates || !piezometer.coordinates.longitude || !piezometer.coordinates.longitude.toString().trim()) {
            errors['piezometer.coordinates.longitude'] = 'GPS Longitude is required';
        }
        
        if (!piezometer.nablLabName || !piezometer.nablLabName.trim()) {
            errors['piezometer.nablLabName'] = 'NABL accredited lab name is required';
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
