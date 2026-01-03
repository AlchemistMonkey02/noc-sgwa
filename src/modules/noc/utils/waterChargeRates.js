// Water Budget Calculator - Charge Rates Configuration
// Based on SGWA documentation (Annexure-1)

// Application type options for dropdown
export const APPLICATION_TYPE_OPTIONS = [
    { value: 'DOMESTIC', label: 'Domestic' },
    { value: 'INDUSTRY', label: 'Industry' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'MINING', label: 'Mining' },
    { value: 'BULK_WATER', label: 'Bulk Water' }
];

// Application Types mapped to their categories
export const APPLICATION_TYPES = {
    DOMESTIC: [
        'Group Housing',
        'Individual Housing',
        'Hotel/Resort',
        'Hospital/Medical',
        'Educational Institution',
        'Commercial Complex',
        'Government Office'
    ],
    INDUSTRY: [
        'Agro Base Food Products',
        'Textile',
        'Paper & Pulp',
        'Chemical & Fertilizer',
        'Cement',
        'Steel & Iron',
        'Sugar',
        'Distillery',
        'Pharmaceuticals',
        'Leather',
        'Automobile',
        'Electronics',
        'Engineering',
        'Power Plant (Thermal)',
        'Power Plant (Other)',
        'Other Industry'
    ],
    INFRASTRUCTURE: [
        'Railway',
        'Highway',
        'Metro',
        'Airport',
        'Port',
        'Industrial Park/SEZ',
        'Smart City',
        'IT Park',
        'Other Infrastructure'
    ],
    MINING: [
        'Coal',
        'Iron Ore',
        'Limestone',
        'Granite',
        'Marble',
        'Sand (Construction)',
        'Sand (Silica)',
        'Bauxite',
        'Manganese',
        'Other Minerals'
    ],
    BULK_WATER: [
        'Water Supply (Urban)',
        'Water Supply (Rural)',
        'Industrial Water Supply',
        'Packaged Drinking Water'
    ]
};

export const WATER_QUALITY_TYPES = [
    { value: '1', label: 'Fresh Water' },
    { value: '2', label: 'Saline/ Brackish' },
    { value: '3', label: 'Saline-Rann of Kachch' }
];

export const AREA_TYPE_CATEGORIES = [
    { value: '1', label: 'Safe' },
    { value: '2', label: 'Semi Critical' },
    { value: '3', label: 'Critical' },
    { value: '4', label: 'Over Exploited' },
    { value: '5', label: 'Saline' }
];

// Base Charge Rates (₹ per KLD per year)
// NOTE: These are placeholder rates. Update from SGWA Annexure-1 documentation
export const BASE_CHARGE_RATES = {
    // Domestic
    '9': 5000,   // Group Housing
    '10': 3000,  // Individual Housing
    '11': 8000,  // Hotel/Resort
    '12': 6000,  // Hospital/Medical
    '13': 5000,  // Educational Institution
    '14': 7000,  // Commercial Complex
    '15': 4000,  // Government Office

    // Industry
    '112': 12000, // Agro Base Food Products
    '113': 15000, // Textile
    '114': 18000, // Paper & Pulp
    '115': 20000, // Chemical & Fertilizer
    '116': 16000, // Cement
    '117': 17000, // Steel & Iron
    '118': 14000, // Sugar
    '119': 16000, // Distillery
    '120': 15000, // Pharmaceuticals
    '121': 17000, // Leather
    '122': 13000, // Automobile
    '123': 12000, // Electronics
    '124': 11000, // Engineering
    '125': 25000, // Power Plant (Thermal)
    '126': 20000, // Power Plant (Other)
    '127': 12000, // Other Industry

    // Infrastructure
    '201': 10000, // Railway
    '202': 11000, // Highway
    '203': 12000, // Metro
    '204': 13000, // Airport
    '205': 14000, // Port
    '206': 15000, // Industrial Park/SEZ
    '207': 16000, // Smart City
    '208': 14000, // IT Park
    '209': 10000, // Other Infrastructure

    // Mining
    '301': 18000, // Coal
    '302': 17000, // Iron Ore
    '303': 15000, // Limestone
    '304': 14000, // Granite
    '305': 14000, // Marble
    '306': 12000, // Sand (Construction)
    '307': 13000, // Sand (Silica)
    '308': 16000, // Bauxite
    '309': 16000, // Manganese
    '310': 13000, // Other Minerals

    // Bulk Water
    '401': 8000,  // Water Supply (Urban)
    '402': 6000,  // Water Supply (Rural)
    '403': 10000, // Industrial Water Supply
    '404': 12000  // Packaged Drinking Water
};

// Area Type Multipliers
export const AREA_TYPE_MULTIPLIERS = {
    '1': 1.0,   // Safe
    '2': 1.5,   // Semi Critical
    '3': 2.0,   // Critical
    '4': 3.0,   // Over Exploited
    '5': 0.5    // Saline
};

// Water Quality Multipliers
export const WATER_QUALITY_MULTIPLIERS = {
    '1': 1.0,   // Fresh Water
    '2': 0.5,   // Saline/Brackish
    '3': 0.3    // Saline-Rann of Kachch
};

// NOC Validity Duration (in years)
export const NOC_VALIDITY_DURATION = {
    '1': 5,  // Domestic - 5 years
    '2': 3,  // Industry - 3 years
    '3': 5,  // Infrastructure - 5 years
    '4': 2,  // Mining - 2 years (lease-based)
    '5': 3   // Bulk Water - 3 years
};

/**
 * Calculate water budget charges
 * @param {object} params - Calculation parameters
 * @param {string} params.applicationType - Application type value
 * @param {string} params.applicationCategory - Category value
 * @param {string} params.waterQuality - Water quality type value
 * @param {string} params.areaType - Area type category value
 * @param {number} params.yearlyRequirement - Yearly water requirement in KLY
 * @returns {object} Calculation results
 */
export function calculateCharges({ applicationType, applicationCategory, waterQuality, areaType, yearlyRequirement }) {
    // For now, use simple placeholder rates since we don't have the category-to-rate mapping
    const baseRate = 10000; // Placeholder base rate per KLD per year

    // Get multipliers (keeping numeric IDs for now as placeholders)
    const areaMultiplier = AREA_TYPE_MULTIPLIERS[areaType] || 1.0;
    const waterQualityMultiplier = WATER_QUALITY_MULTIPLIERS[waterQuality] || 1.0;

    // Calculate effective rate per KLD
    const effectiveRatePerKLD = baseRate * areaMultiplier * waterQualityMultiplier;

    // Calculate yearly charge (yearlyRequirement is already in KLY)
    const dailyAverage = yearlyRequirement / 365; // Convert KLY to average KLD
    const oneYearCharge = effectiveRatePerKLD * dailyAverage;

    // Get NOC validity duration (using string keys that match our new structure)
    const typeToNumericMap = {
        'DOMESTIC': '1',
        'INDUSTRY': '2',
        'INFRASTRUCTURE': '3',
        'MINING': '4',
        'BULK_WATER': '5'
    };
    const nocDuration = NOC_VALIDITY_DURATION[typeToNumericMap[applicationType]] || 3;

    // Calculate total charge for entire NOC duration
    const totalCharge = oneYearCharge * nocDuration;

    return {
        baseRate,
        areaMultiplier,
        waterQualityMultiplier,
        effectiveRatePerKLD,
        oneYearCharge,
        nocDuration,
        totalCharge,
        applicationType,
        applicationCategory,
        yearlyRequirement
    };
}

