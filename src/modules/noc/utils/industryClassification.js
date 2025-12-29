// Industry, Mining, and Other Project Classification
// Based on Annexure-8, Annexure-9, Annexure-10, and Annexure-3

/**
 * Complete Industry Types (from Annexure-8)
 */
export const INDUSTRY_TYPES = [
    // Food & Beverages
    { id: 1, name: 'Packaged Drinking Water', category: 'Food & Beverages', isPolluting: false, isPackagedWater: true },
    { id: 2, name: 'Mineral Water', category: 'Food & Beverages', isPolluting: false, isPackagedWater: true },
    { id: 3, name: 'Soft Drinks/Carbonated Beverages', category: 'Food & Beverages', isPolluting: false },
    { id: 4, name: 'Brewery/Distillery', category: 'Food & Beverages', isPolluting: true },
    { id: 5, name: 'Sugar', category: 'Food & Beverages', isPolluting: true },
    { id: 6, name: 'Food Processing', category: 'Food & Beverages', isPolluting: false },
    { id: 7, name: 'Dairy Products', category: 'Food & Beverages', isPolluting: false },
    { id: 8, name: 'Tea Processing', category: 'Food & Beverages', isPolluting: false },
    { id: 9, name: 'Edible Oil', category: 'Food & Beverages', isPolluting: false },

    // Textiles & Leather
    { id: 10, name: 'Textile/Fabric', category: 'Textile & Leather', isPolluting: true },
    { id: 11, name: 'Dyeing & Printing', category: 'Textile & Leather', isPolluting: true },
    { id: 12, name: 'Tannery/Leather', category: 'Textile & Leather', isPolluting: true },
    { id: 13, name: 'Garment Manufacturing', category: 'Textile & Leather', isPolluting: false },

    // Chemicals & Pharmaceuticals
    { id: 14, name: 'Pharmaceuticals', category: 'Chemicals & Pharma', isPolluting: true },
    { id: 15, name: 'Pesticides/Insecticides', category: 'Chemicals & Pharma', isPolluting: true },
    { id: 16, name: 'Fertilizers', category: 'Chemicals & Pharma', isPolluting: true },
    { id: 17, name: 'Dye & Dye Intermediates', category: 'Chemicals & Pharma', isPolluting: true },
    { id: 18, name: 'Bulk Drugs', category: 'Chemicals & Pharma', isPolluting: true },
    { id: 19, name: 'Paint & Varnish', category: 'Chemicals & Pharma', isPolluting: true },
    { id: 20, name: 'Acids/Alkalis/Chemicals', category: 'Chemicals & Pharma', isPolluting: true },

    // Metals & Mining
    { id: 21, name: 'Iron & Steel', category: 'Metals', isPolluting: true },
    { id: 22, name: 'Aluminium', category: 'Metals', isPolluting: true },
    { id: 23, name: 'Copper/Zinc/Lead', category: 'Metals', isPolluting: true },
    { id: 24, name: 'Ferro Alloys', category: 'Metals', isPolluting: true },
    { id: 25, name: 'Metal Fabrication', category: 'Metals', isPolluting: false },
    { id: 26, name: 'Electroplating', category: 'Metals', isPolluting: true },

    // Cement & Concrete
    { id: 27, name: 'Cement', category: 'Cement & Concrete', isPolluting: true },
    { id: 28, name: 'Ready Mix Concrete (RMC)', category: 'Cement & Concrete', isPolluting: false },
    { id: 29, name: 'Asbestos Cement', category: 'Cement & Concrete', isPolluting: true },

    // Pulp & Paper
    { id: 30, name: 'Pulp & Paper', category: 'Pulp & Paper', isPolluting: true },
    { id: 31, name: 'Printing & Publishing', category: 'Pulp & Paper', isPolluting: false },

    // Oil & Petroleum
    { id: 32, name: 'Oil Refinery', category: 'Oil & Petroleum', isPolluting: true },
    { id: 33, name: 'Petrochemical', category: 'Oil & Petroleum', isPolluting: true },
    { id: 34, name: 'Lubricants', category: 'Oil & Petroleum', isPolluting: true },

    // Power & Energy
    { id: 35, name: 'Thermal Power Plant', category: 'Power & Energy', isPolluting: true },
    { id: 36, name: 'Diesel Generator', category: 'Power & Energy', isPolluting: false },

    // Others
    { id: 37, name: 'Plastic Manufacturing', category: 'Manufacturing', isPolluting: false },
    { id: 38, name: 'Rubber Products', category: 'Manufacturing', isPolluting: false },
    { id: 39, name: 'Glass Manufacturing', category: 'Manufacturing', isPolluting: false },
    { id: 40, name: 'Ceramics/Pottery', category: 'Manufacturing', isPolluting: false },
    { id: 41, name: 'Electronics/Electrical', category: 'Manufacturing', isPolluting: false },
    { id: 42, name: 'Automobile Manufacturing', category: 'Manufacturing', isPolluting: false },
    { id: 43, name: 'Service Industry', category: 'Service', isPolluting: false },
    { id: 44, name: 'Other Manufacturing', category: 'Manufacturing', isPolluting: false }
];

/**
 * Mining Types (from Annexure-9)
 */
export const MINING_TYPES = [
    { id: 1, name: 'Coal Mining', category: 'Minerals', requiresSpecialClearance: true },
    { id: 2, name: 'Limestone Mining', category: 'Non-Metallic', requiresSpecialClearance: false },
    { id: 3, name: 'Granite/Marble Mining', category: 'Dimensional Stone', requiresSpecialClearance: false },
    { id: 4, name: 'Sandstone Mining', category: 'Dimensional Stone', requiresSpecialClearance: false },
    { id: 5, name: 'Clay/Brick Earth', category: 'Minor Minerals', requiresSpecialClearance: false },
    { id: 6, name: 'Sand Mining', category: 'Minor Minerals', requiresSpecialClearance: false },
    { id: 7, name: 'Stone/Boulder/Gravel', category: 'Minor Minerals', requiresSpecialClearance: false },
    { id: 8, name: 'Iron Ore', category: 'Metallic Ores', requiresSpecialClearance: true },
    { id: 9, name: 'Bauxite', category: 'Metallic Ores', requiresSpecialClearance: true },
    { id: 10, name: 'Other Minerals', category: 'Others', requiresSpecialClearance: false }
];

/**
 * Other Than Industry & Mining (from Annexure-10)
 */
export const OTHER_PROJECT_TYPES = [
    // Infrastructure
    { id: 1, name: 'Airport', category: 'Infrastructure', waterIntensive: true },
    { id: 2, name: 'Railway Station/Metro', category: 'Infrastructure', waterIntensive: false },
    { id: 3, name: 'Bus Terminal', category: 'Infrastructure', waterIntensive: false },
    { id: 4, name: 'Highway/Road Construction', category: 'Infrastructure', waterIntensive: false },

    // Commercial
    { id: 5, name: 'Hotel/Resort', category: 'Commercial', waterIntensive: true },
    { id: 6, name: 'Shopping Mall', category: 'Commercial', waterIntensive: true },
    { id: 7, name: 'Office Complex', category: 'Commercial', waterIntensive: false },
    { id: 8, name: 'Commercial Building', category: 'Commercial', waterIntensive: false },
    { id: 9, name: 'Convention Center', category: 'Commercial', waterIntensive: false },
    { id: 10, name: 'Warehouse/Storage', category: 'Commercial', waterIntensive: false },

    // Healthcare & Education
    { id: 11, name: 'Hospital/Medical College', category: 'Healthcare', waterIntensive: true },
    { id: 12, name: 'Clinic/Diagnostic Center', category: 'Healthcare', waterIntensive: false },
    { id: 13, name: 'School/College/University', category: 'Education', waterIntensive: true },
    { id: 14, name: 'Hostel/Dormitory', category: 'Education', waterIntensive: true },

    // Residential
    { id: 15, name: 'Residential Apartment (Non-EWS)', category: 'Residential', waterIntensive: true },
    { id: 16, name: 'Group Housing', category: 'Residential', waterIntensive: true },
    { id: 17, name: 'Township', category: 'Residential', waterIntensive: true },

    // Recreation
    { id: 18, name: 'Water Park/Amusement Park', category: 'Recreation', waterIntensive: true },
    { id: 19, name: 'Golf Course', category: 'Recreation', waterIntensive: true },
    { id: 20, name: 'Swimming Pool', category: 'Recreation', waterIntensive: true },
    { id: 21, name: 'Sports Complex/Stadium', category: 'Recreation', waterIntensive: false },

    // Utilities
    { id: 22, name: 'Sewage Treatment Plant (STP)', category: 'Utilities', waterIntensive: false },
    { id: 23, name: 'Effluent Treatment Plant (ETP)', category: 'Utilities', waterIntensive: false },
    { id: 24, name: 'Common Effluent Treatment Plant (CETP)', category: 'Utilities', waterIntensive: false },

    // Others
    { id: 25, name: 'Agriculture Related (Non-Farming)', category: 'Others', waterIntensive: false },
    { id: 26, name: 'Research & Development', category: 'Others', waterIntensive: false },
    { id: 27, name: 'Other Projects', category: 'Others', waterIntensive: false }
];

/**
 * Polluting Industries List (from Annexure-3)
 * These require additional compliance (well-head protection, water quality monitoring)
 */
export const POLLUTING_INDUSTRIES = [
    'Aluminium',
    'Cement',
    'Distillery',
    'Brewery',
    'Dye & Dye Intermediates',
    'Fertilizers',
    'Iron & Steel',
    'Oil Refinery',
    'Petrochemical',
    'Pesticides/Insecticides',
    'Pharmaceuticals',
    'Thermal Power Plant',
    'Pulp & Paper',
    'Sugar',
    'Tannery/Leather',
    'Copper/Zinc/Lead',
    'Textile/Fabric',
    'Dyeing & Printing',
    'Ferro Alloys',
    'Bulk Drugs',
    'Paint & Varnish',
    'Electroplating',
    'Acids/Alkalis/Chemicals'
];

/**
 * Check if industry is polluting
 * @param {string} industryName - Industry name
 * @returns {boolean}
 */
export const isPollutingIndustry = (industryName) => {
    return POLLUTING_INDUSTRIES.some(polluting =>
        industryName.toLowerCase().includes(polluting.toLowerCase())
    );
};

/**
 * Check if industry is packaged water
 * @param {string} industryName - Industry name
 * @returns {boolean}
 */
export const isPackagedWaterIndustry = (industryName) => {
    const packagedWaterTypes = ['Packaged Drinking Water', 'Mineral Water'];
    return packagedWaterTypes.some(type =>
        industryName.toLowerCase().includes(type.toLowerCase())
    );
};

/**
 * Get industry type details
 * @param {string} industryName - Industry name
 * @returns {Object|null} - Industry details
 */
export const getIndustryDetails = (industryName) => {
    return INDUSTRY_TYPES.find(ind => ind.name === industryName) || null;
};

/**
 * Get additional requirements based on project type
 * @param {Object} projectDetails - Project details
 * @returns {Object} - Additional requirements
 */
export const getAdditionalRequirements = (projectDetails) => {
    const requirements = {
        documents: [],
        conditions: [],
        monitoring: []
    };

    // Polluting industry requirements
    if (isPollutingIndustry(projectDetails.industryType)) {
        requirements.documents.push('Well-head Protection Plan');
        requirements.documents.push('Water Quality Monitoring Plan');
        requirements.conditions.push('Regular water quality testing required');
        requirements.monitoring.push('Quarterly water quality reports to SPCB');
    }

    // Mining requirements
    if (projectDetails.projectCategory === 'Mining') {
        requirements.documents.push('Mining Plan');
        requirements.documents.push('Dewatering Treatment Plan');
        requirements.documents.push('Core & Buffer Zone Piezometer Details');
        requirements.conditions.push('Piezometer in core and buffer zones mandatory');
        requirements.monitoring.push('Monthly water level monitoring');
    }

    // Packaged water requirements
    if (isPackagedWaterIndustry(projectDetails.industryType)) {
        requirements.conditions.push('BIS license mandatory');
        requirements.conditions.push('Regular product quality testing');
    }

    return requirements;
};

/**
 * Get dropdown options for UI
 */
export const getIndustryDropdownOptions = () => {
    return INDUSTRY_TYPES.map(ind => ({
        value: ind.name,
        label: ind.name,
        category: ind.category,
        isPolluting: ind.isPolluting
    }));
};

export const getMiningDropdownOptions = () => {
    return MINING_TYPES.map(mining => ({
        value: mining.name,
        label: mining.name,
        category: mining.category
    }));
};

export const getOtherProjectDropdownOptions = () => {
    return OTHER_PROJECT_TYPES.map(project => ({
        value: project.name,
        label: project.name,
        category: project.category
    }));
};
