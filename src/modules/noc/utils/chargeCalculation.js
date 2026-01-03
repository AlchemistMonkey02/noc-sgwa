// Dynamic Charge Calculation for NOC Applications
// Based on block category, water requirement, and project type

/**
 * Fee Structure (as per CGWA guidelines)
 */
export const BASE_FEES = {
    // Water Requirement Slabs (in m³/day)
    SMALL: { threshold: 10, fee: 5000 },      // ≤ 10 m³/day
    MEDIUM: { threshold: 50, fee: 15000 },    // 10-50 m³/day  
    LARGE: { threshold: 100, fee: 30000 },    // 50-100 m³/day
    VERY_LARGE: { threshold: Infinity, fee: 50000 } // > 100 m³/day
};

/**
 * Block Category Multipliers
 */
export const BLOCK_CATEGORY_MULTIPLIERS = {
    'Safe': 1.0,              // No additional charge
    'Semi-Critical': 1.2,     // 20% increase
    'Critical': 1.5,          // 50% increase
    'Over-Exploited': 2.0     // 100% increase (double)
};

/**
 * Application Type Multipliers
 */
export const APPLICATION_TYPE_MULTIPLIERS = {
    'Fresh NOC': 1.0,
    'NOC Renewal': 0.7,       // 30% discount for renewals
    'NOC Amendment': 0.5       // 50% discount for amendments
};

/**
 * GST Rate
 */
export const GST_RATE = 0.18; // 18%

/**
 * Calculate base fee based on daily water requirement
 * @param {number} dailyWaterRequirement - Daily water requirement in m³/day
 * @returns {number} - Base fee in INR
 */
export const calculateBaseFee = (dailyWaterRequirement) => {
    const requirement = parseFloat(dailyWaterRequirement) || 0;

    if (requirement <= BASE_FEES.SMALL.threshold) {
        return BASE_FEES.SMALL.fee;
    } else if (requirement <= BASE_FEES.MEDIUM.threshold) {
        return BASE_FEES.MEDIUM.fee;
    } else if (requirement <= BASE_FEES.LARGE.threshold) {
        return BASE_FEES.LARGE.fee;
    } else {
        return BASE_FEES.VERY_LARGE.fee;
    }
};

/**
 * Calculate total charges for NOC application
 * @param {Object} params - Calculation parameters
 * @param {number} params.dailyWaterRequirement - Daily water requirement in m³/day
 * @param {string} params.blockCategory - Block category (Safe/Semi-Critical/Critical/Over-Exploited)
 * @param {string} params.applicationType - Type of application
 * @param {boolean} params.isExempt - Whether applicant qualifies for exemption
 * @returns {Object} - Detailed charge breakdown
 */
export const calculateCharges = ({
    dailyWaterRequirement,
    blockCategory,
    applicationType,
    isExempt = false
}) => {
    // Check if exempt
    if (isExempt) {
        return {
            baseFee: 0,
            blockCategoryCharge: 0,
            applicationTypeDiscount: 0,
            subtotal: 0,
            gstAmount: 0,
            totalAmount: 0,
            isExempt: true,
            exemptionSavings: calculateBaseFee(dailyWaterRequirement),
            breakdown: {
                baseFeeDescription: 'Exempted',
                blockCategoryMultiplier: 'N/A',
                applicationTypeMultiplier: 'N/A',
                gstRate: '18%'
            }
        };
    }

    // Calculate base fee
    const baseFee = calculateBaseFee(dailyWaterRequirement);

    // Get multipliers
    const blockMultiplier = BLOCK_CATEGORY_MULTIPLIERS[blockCategory] || 1.0;
    const appTypeMultiplier = APPLICATION_TYPE_MULTIPLIERS[applicationType] || 1.0;

    // Calculate charges
    const blockCategoryCharge = baseFee * (blockMultiplier - 1); // Additional charge due to block category
    const subtotalBeforeDiscount = baseFee * blockMultiplier;
    const applicationTypeDiscount = subtotalBeforeDiscount * (1 - appTypeMultiplier);
    const subtotal = subtotalBeforeDiscount * appTypeMultiplier;
    const gstAmount = subtotal * GST_RATE;
    const totalAmount = subtotal + gstAmount;

    return {
        baseFee,
        blockCategoryCharge,
        applicationTypeDiscount,
        subtotal,
        gstAmount,
        totalAmount: Math.round(totalAmount), // Round to nearest rupee
        isExempt: false,
        breakdown: {
            baseFeeDescription: getWaterRequirementSlab(dailyWaterRequirement),
            blockCategoryMultiplier: `${blockMultiplier}x (${blockCategory})`,
            applicationTypeMultiplier: `${appTypeMultiplier}x (${applicationType})`,
            gstRate: `${GST_RATE * 100}%`
        }
    };
};

/**
 * Get water requirement slab description
 * @param {number} dailyWaterRequirement - Daily water requirement in m³/day
 * @returns {string} - Slab description
 */
export const getWaterRequirementSlab = (dailyWaterRequirement) => {
    const requirement = parseFloat(dailyWaterRequirement) || 0;

    if (requirement <= BASE_FEES.SMALL.threshold) {
        return `Small (≤ ${BASE_FEES.SMALL.threshold} m³/day)`;
    } else if (requirement <= BASE_FEES.MEDIUM.threshold) {
        return `Medium (${BASE_FEES.SMALL.threshold}-${BASE_FEES.MEDIUM.threshold} m³/day)`;
    } else if (requirement <= BASE_FEES.LARGE.threshold) {
        return `Large (${BASE_FEES.MEDIUM.threshold}-${BASE_FEES.LARGE.threshold} m³/day)`;
    } else {
        return `Very Large (> ${BASE_FEES.LARGE.threshold} m³/day)`;
    }
};

/**
 * Get charge preview message
 * @param {Object} charges - Charges object from calculateCharges()
 * @returns {string} - Human-readable charge preview
 */
export const getChargePreview = (charges) => {
    if (charges.isExempt) {
        return `✅ **EXEMPTED** - You save ₹${charges.exemptionSavings.toLocaleString('en-IN')} on application fees!`;
    }

    let preview = `**Application Fee:** ₹${charges.totalAmount.toLocaleString('en-IN')}\n\n`;
    preview += `**Breakdown:**\n`;
    preview += `• Base Fee (${charges.breakdown.baseFeeDescription}): ₹${charges.baseFee.toLocaleString('en-IN')}\n`;

    if (charges.blockCategoryCharge > 0) {
        preview += `• Block Category Surcharge ${charges.breakdown.blockCategoryMultiplier}: +₹${charges.blockCategoryCharge.toLocaleString('en-IN')}\n`;
    }

    if (charges.applicationTypeDiscount > 0) {
        preview += `• Application Type Discount ${charges.breakdown.applicationTypeMultiplier}: -₹${charges.applicationTypeDiscount.toLocaleString('en-IN')}\n`;
    }

    preview += `• GST (${charges.breakdown.gstRate}): ₹${charges.gstAmount.toLocaleString('en-IN')}\n`;

    return preview;
};
