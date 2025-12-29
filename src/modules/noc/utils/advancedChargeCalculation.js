// Enhanced Charge Calculation for NOC Applications
// Based on SGWA Regulations - Rate per cubic meter system
// Phase 1 Implementation

/**
 * Groundwater Charge Rates (Rate per cubic meter)
 * Based on block category and quantity slabs
 * These rates will be applied to annual extraction quantity
 */
export const GW_CHARGE_RATES = {
    // Safe Blocks
    Safe: {
        Industry: {
            '0-50': 5.0,      // ₹5 per cum for 0-50 KLD
            '50-100': 7.0,    // ₹7 per cum for 50-100 KLD
            '100+': 10.0      // ₹10 per cum for >100 KLD
        },
        Mining: {
            '0-50': 4.0,
            '50-100': 6.0,
            '100+': 8.0
        },
        Other: {
            '0-50': 4.0,
            '50-100': 6.0,
            '100+': 8.0
        }
    },
    // Semi-Critical Blocks
    'Semi-Critical': {
        Industry: {
            '0-50': 7.0,
            '50-100': 10.0,
            '100+': 15.0
        },
        Mining: {
            '0-50': 6.0,
            '50-100': 8.0,
            '100+': 12.0
        },
        Other: {
            '0-50': 6.0,
            '50-100': 8.0,
            '100+': 12.0
        }
    },
    // Critical Blocks
    'Critical': {
        Industry: {
            '0-50': 10.0,
            '50-100': 15.0,
            '100+': 20.0
        },
        Mining: {
            '0-50': 8.0,
            '50-100': 12.0,
            '100+': 18.0
        },
        Other: {
            '0-50': 8.0,
            '50-100': 12.0,
            '100+': 18.0
        }
    },
    // Over-Exploited Blocks
    'Over-Exploited': {
        Industry: {
            '0-50': 15.0,
            '50-100': 20.0,
            '100+': 30.0
        },
        Mining: {
            '0-50': 7.5,      // 50% of industry rate for mining in over-exploited
            '50-100': 10.0,
            '100+': 15.0
        },
        Other: {
            '0-50': 12.0,
            '50-100': 18.0,
            '100+': 25.0
        }
    }
};

/**
 * Application Fee (Fixed fee in addition to GW charges)
 */
export const APPLICATION_FEES = {
    'Fresh NOC': 5000,
    'Provisional NOC': 5000,
    'NOC Renewal': 3000,
    'NOC Amendment': 2500
};

/**
 * GST Rate
 */
export const GST_RATE = 0.18; // 18%

/**
 * Get rate per cum based on block category, quantity, and project type
 * @param {string} blockCategory - Block category name (Safe, Semi-Critical, Critical, Over-Exploited)
 * @param {number} dailyQuantity - Daily quantity in m³/day (KLD)
 * @param {string} projectType - Project type (Industry, Mining, Other)
 * @returns {number} - Rate per cubic meter
 */
export const getRatePerCum = (blockCategory, dailyQuantity, projectType = 'Industry') => {
    const categoryRates = GW_CHARGE_RATES[blockCategory] || GW_CHARGE_RATES.Safe;
    const typeRates = categoryRates[projectType] || categoryRates.Industry;

    // Determine slab
    let slab;
    if (dailyQuantity <= 50) {
        slab = '0-50';
    } else if (dailyQuantity <= 100) {
        slab = '50-100';
    } else {
        slab = '100+';
    }

    return typeRates[slab] || typeRates['100+'];
};

/**
 * Calculate annual extraction quantity
 * @param {number} dailyQuantity - Daily quantity in m³/day
 * @returns {number} - Annual quantity in m³
 */
export const calculateAnnualQuantity = (dailyQuantity) => {
    return dailyQuantity * 365;
};

/**
 * Enhanced charge calculation based on SGWA regulations
 * @param {Object} params - Calculation parameters
 * @param {number} params.dailyWaterRequirement - Daily water requirement in m³/day (KLD)
 * @param {string} params.blockCategory - Block category (Safe, Semi-Critical, Critical, Over-Exploited)
 * @param {string} params.applicationType - Application type (Fresh NOC, Provisional NOC, Renewal, Amendment)
 * @param {string} params.projectCategory - Project category (Industry, Mining, Other)
 * @param {boolean} params.isExempt - Whether applicant qualifies for exemption
 * @param {boolean} params.isProvisional - Whether this is a provisional NOC
 * @returns {Object} - Detailed charge breakdown
 */
export const calculateAdvancedCharges = ({
    dailyWaterRequirement,
    blockCategory = 'Safe',
    applicationType = 'Fresh NOC',
    projectCategory = 'Industry',
    isExempt = false,
    isProvisional = false
}) => {
    // Check if exempt
    if (isExempt) {
        const applicationFee = APPLICATION_FEES[applicationType] || APPLICATION_FEES['Fresh NOC'];
        return {
            applicationFee: 0,
            groundwaterCharge: 0,
            provisionalMultiplier: 0,
            subtotal: 0,
            gstAmount: 0,
            totalAmount: 0,
            isExempt: true,
            breakdown: {
                applicationFeeDescription: 'Exempted',
                gwChargeDescription: 'Exempted',
                blockCategory: blockCategory,
                dailyQuantity: dailyWaterRequirement,
                annualQuantity: 0,
                ratePerCum: 0,
                provisionalNOC: false,
                gstRate: '18%'
            }
        };
    }

    const dailyQty = parseFloat(dailyWaterRequirement) || 0;
    
    // Get application fee
    const applicationFee = APPLICATION_FEES[applicationType] || APPLICATION_FEES['Fresh NOC'];

    // Get rate per cum
    const ratePerCum = getRatePerCum(blockCategory, dailyQty, projectCategory);

    // Calculate annual quantity
    const annualQuantity = calculateAnnualQuantity(dailyQty);

    // Calculate base groundwater charge
    let groundwaterCharge = ratePerCum * annualQuantity;

    // Apply provisional NOC multiplier (1.5x)
    let provisionalMultiplier = 0;
    if (isProvisional || applicationType === 'Provisional NOC') {
        provisionalMultiplier = groundwaterCharge * 0.5; // Additional 50%
        groundwaterCharge = groundwaterCharge * 1.5;
    }

    // Mining in over-exploited already has 50% rate built into the rate table
    // No additional adjustment needed

    // Calculate subtotal
    const subtotal = applicationFee + groundwaterCharge;
    
    // Calculate GST
    const gstAmount = subtotal * GST_RATE;
    
    // Calculate total
    const totalAmount = subtotal + gstAmount;

    return {
        applicationFee: Math.round(applicationFee),
        groundwaterCharge: Math.round(groundwaterCharge),
        provisionalMultiplier: Math.round(provisionalMultiplier),
        subtotal: Math.round(subtotal),
        gstAmount: Math.round(gstAmount),
        totalAmount: Math.round(totalAmount),
        isExempt: false,
        breakdown: {
            applicationFeeDescription: `${applicationType} Application Fee`,
            gwChargeDescription: `Groundwater charges for ${blockCategory} block`,
            blockCategory: blockCategory,
            projectCategory: projectCategory,
            dailyQuantity: dailyQty,
            annualQuantity: annualQuantity,
            ratePerCum: ratePerCum,
            provisionalNOC: isProvisional || applicationType === 'Provisional NOC',
            miningDiscount: (projectCategory === 'Mining' && blockCategory === 'Over-Exploited') ? '50% rate applied' : null,
            gstRate: `${GST_RATE * 100}%`
        }
    };
};

/**
 * Get charge breakdown for display
 * @param {Object} charges - Charges object from calculateAdvancedCharges()
 * @returns {Object} - Formatted breakdown for UI
 */
export const getChargeBreakdown = (charges) => {
    if (charges.isExempt) {
        return {
            summary: '✅ EXEMPTED - No charges applicable',
            details: []
        };
    }

    const details = [
        {
            label: 'Application Fee',
            value: `₹${charges.applicationFee.toLocaleString('en-IN')}`,
            description: charges.breakdown.applicationFeeDescription
        },
        {
            label: 'Groundwater Charges (Annual)',
            value: `₹${charges.groundwaterCharge.toLocaleString('en-IN')}`,
            description: `${charges.breakdown.dailyQuantity} m³/day × 365 days × ₹${charges.breakdown.ratePerCum}/cum (${charges.breakdown.blockCategory} block, ${charges.breakdown.projectCategory})`
        }
    ];

    if (charges.provisionalMultiplier > 0) {
        details.push({
            label: 'Provisional NOC Surcharge (50%)',
            value: `+₹${charges.provisionalMultiplier.toLocaleString('en-IN')}`,
            description: 'Additional 50% charge for provisional NOC'
        });
    }

    if (charges.breakdown.miningDiscount) {
        details.push({
            label: 'Mining Discount',
            value: '50% rate',
            description: charges.breakdown.miningDiscount
        });
    }

    details.push({
        label: 'Subtotal',
        value: `₹${charges.subtotal.toLocaleString('en-IN')}`,
        description: null,
        isSubtotal: true
    });

    details.push({
        label: 'GST (18%)',
        value: `₹${charges.gstAmount.toLocaleString('en-IN')}`,
        description: null
    });

    details.push({
        label: 'Total Amount',
        value: `₹${charges.totalAmount.toLocaleString('en-IN')}`,
        description: null,
        isTotal: true
    });

    return {
        summary: `Total: ₹${charges.totalAmount.toLocaleString('en-IN')}`,
        details: details
    };
};

