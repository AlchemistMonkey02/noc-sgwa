// Comprehensive Exemption Rules Engine for SGWA NOC Portal
// Based on 10-02-2025 Notification and Annexures

/**
 * Exemption Categories as per SGWA Regulations
 */
export const EXEMPTION_CATEGORIES = {
    AGRICULTURE: {
        code: 'AGR',
        name: 'Agricultural Activities',
        description: 'Groundwater extraction for agricultural purposes',
        maxLimit: null, // No limit specified
        requiresNOC: false
    },
    DOMESTIC_INDIVIDUAL: {
        code: 'DOM_IND',
        name: 'Individual Domestic Use',
        description: 'Individual consumers for domestic purposes',
        maxLimit: null,
        requiresNOC: false
    },
    DOMESTIC_LIMITED: {
        code: 'DOM_LIM',
        name: 'Domestic/Drinking (≤5 m³/day)',
        description: 'Any project using GW only for drinking/domestic purposes ≤5 cum/day',
        maxLimit: 5, // m³/day
        requiresNOC: false
    },
    RESIDENTIAL_EWS: {
        code: 'RES_EWS',
        name: 'EWS Residential Apartments',
        description: 'Residential apartments/group housing (EWS) for drinking/domestic',
        maxLimit: null,
        requiresNOC: false
    },
    GOVT_DRINKING_WATER: {
        code: 'GOVT_DW',
        name: 'Government Drinking Water Schemes',
        description: 'Government drinking water supply schemes',
        maxLimit: null,
        requiresNOC: false
    },
    ARMED_FORCES: {
        code: 'ARMED_F',
        name: 'Armed Forces',
        description: 'Armed Forces and Central Armed Police Forces',
        maxLimit: null,
        requiresNOC: false
    },
    MSME_SMALL: {
        code: 'MSME_SM',
        name: 'MSME (<10 m³/day)',
        description: 'Micro and Small Enterprises drawing less than 10 cum/day',
        maxLimit: 10, // m³/day
        requiresNOC: false
    }
};

/**
 * Check if applicant qualifies for exemption
 * @param {Object} formData - Application form data
 * @returns {Object} - Exemption status and details
 */
export const checkExemption = (formData) => {
    const result = {
        isExempt: false,
        exemptionType: null,
        exemptionCode: null,
        reason: '',
        message: ''
    };

    // 1. Check Agriculture
    if (formData.groundWaterUtilizationFor === 'Agriculture' ||
        formData.projectType === 'Agricultural') {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.AGRICULTURE.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.AGRICULTURE.code;
        result.reason = 'Agricultural activities are exempt from NOC requirement';
        result.message = '✅ Your agricultural activity is EXEMPT from NOC requirement as per SGWA Regulations.';
        return result;
    }

    // 2. Check Individual Domestic Use
    if (formData.applicationType === 'Individual Domestic Use') {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.DOMESTIC_INDIVIDUAL.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.DOMESTIC_INDIVIDUAL.code;
        result.reason = 'Individual domestic consumers are exempt';
        result.message = '✅ Individual domestic use is EXEMPT from NOC requirement.';
        return result;
    }

    // 3. Check Domestic/Drinking ≤5 m³/day
    const dailyRequirement = parseFloat(formData.dailyWaterRequirement) || 0;
    if (formData.groundWaterUtilizationFor === 'Drinking/Domestic' &&
        dailyRequirement > 0 &&
        dailyRequirement <= 5) {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.DOMESTIC_LIMITED.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.DOMESTIC_LIMITED.code;
        result.reason = 'Drinking/Domestic use ≤5 m³/day is exempt';
        result.message = `✅ Your project (${dailyRequirement} m³/day for drinking/domestic) is EXEMPT from NOC requirement.`;
        return result;
    }

    // 4. Check EWS Residential
    if (formData.projectType === 'Residential (EWS)' ||
        formData.projectType === 'Group Housing (EWS)') {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.RESIDENTIAL_EWS.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.RESIDENTIAL_EWS.code;
        result.reason = 'EWS residential projects for drinking/domestic are exempt';
        result.message = '✅ EWS residential project is EXEMPT from NOC requirement.';
        return result;
    }

    // 5. Check Government Drinking Water Schemes
    if (formData.projectType === 'Government Drinking Water Scheme' ||
        formData.organizationType === 'Government' &&
        formData.groundWaterUtilizationFor === 'Public Water Supply') {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.GOVT_DRINKING_WATER.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.GOVT_DRINKING_WATER.code;
        result.reason = 'Government drinking water supply schemes are exempt';
        result.message = '✅ Government drinking water scheme is EXEMPT from NOC requirement.';
        return result;
    }

    // 6. Check Armed Forces
    if (formData.organizationType === 'Armed Forces' ||
        formData.organizationType === 'Central Armed Police Forces' ||
        formData.organizationName?.toLowerCase().includes('armed forces') ||
        formData.organizationName?.toLowerCase().includes('capf')) {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.ARMED_FORCES.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.ARMED_FORCES.code;
        result.reason = 'Armed Forces and CAPF are exempt';
        result.message = '✅ Armed Forces/CAPF are EXEMPT from NOC requirement.';
        return result;
    }

    // 7. Check MSME <10 m³/day (Enhanced from existing logic)
    const isMicroOrSmall = formData.msmeType === 'Micro' || formData.msmeType === 'Small';
    const isUnder10M3 = dailyRequirement > 0 && dailyRequirement < 10;

    if (formData.isMSME === 'Yes' && isMicroOrSmall && isUnder10M3) {
        result.isExempt = true;
        result.exemptionType = EXEMPTION_CATEGORIES.MSME_SMALL.name;
        result.exemptionCode = EXEMPTION_CATEGORIES.MSME_SMALL.code;
        result.reason = `MSME (${formData.msmeType}) drawing less than 10 m³/day is exempt`;
        result.message = `✅ Your MSME (${dailyRequirement} m³/day) is EXEMPT from NOC requirement.`;
        return result;
    }

    // Not exempt
    result.message = '⚠️ Your project does NOT qualify for exemption. NOC application is mandatory.';
    return result;
};

/**
 * Get exemption eligibility explanation
 * @returns {Array} - List of exemption categories with descriptions
 */
export const getExemptionCategories = () => {
    return Object.values(EXEMPTION_CATEGORIES).map(cat => ({
        name: cat.name,
        description: cat.description,
        limit: cat.maxLimit ? `≤${cat.maxLimit} m³/day` : 'No limit',
        code: cat.code
    }));
};

/**
 * Validate if exemption claim is valid
 * @param {Object} formData - Form data
 * @param {string} claimedExemptionCode - Claimed exemption code
 * @returns {boolean} - Whether claim is valid
 */
export const validateExemptionClaim = (formData, claimedExemptionCode) => {
    const exemptionCheck = checkExemption(formData);
    return exemptionCheck.isExempt && exemptionCheck.exemptionCode === claimedExemptionCode;
};

/**
 * Get user-friendly exemption message for display
 * @param {Object} exemptionResult - Result from checkExemption
 * @returns {Object} - Display configuration
 */
export const getExemptionDisplayConfig = (exemptionResult) => {
    if (!exemptionResult.isExempt) {
        return {
            show: false,
            type: 'info',
            icon: 'ℹ️',
            title: 'NOC Required',
            message: exemptionResult.message
        };
    }

    return {
        show: true,
        type: 'success',
        icon: '🎉',
        title: 'NOC Exemption Applicable',
        message: exemptionResult.message,
        details: [
            `Exemption Category: ${exemptionResult.exemptionType}`,
            `Reason: ${exemptionResult.reason}`,
            'You do not need to proceed with the full NOC application.',
            'However, you may need to maintain records for compliance purposes.'
        ]
    };
};
