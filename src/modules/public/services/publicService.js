import apiClient from '../../../services/apiClient';

/**
 * Public Service - For unauthenticated public endpoints
 * Standardized to match backend routes in /api/master, /api/master-data, and /api/public
 */
const publicService = {
    // === Master Data (General) ===
    getStates: () => apiClient.get('/master/states'),
    getDistricts: (stateId) => apiClient.get(`/master/districts${stateId ? `?stateId=${stateId}` : ''}`),
    getBlocks: (districtId) => apiClient.get(`/master/blocks${districtId ? `?districtId=${districtId}` : ''}`),
    getTehsils: (districtId) => apiClient.get(`/master/tehsils${districtId ? `?districtId=${districtId}` : ''}`),
    getAssessmentUnits: (districtId) => apiClient.get(`/master/assessment-units${districtId ? `?districtId=${districtId}` : ''}`),
    getIndustryTypes: (category) => apiClient.get(`/master/industry-types${category ? `?category=${category}` : ''}`),
    getFeeStructure: () => apiClient.get('/master/fees'),
    getIdProofTypes: () => apiClient.get('/master/id-proof-types'),
    getUserTitles: () => apiClient.get('/master/titles'),
    getGenders: () => apiClient.get('/master/genders'),
    getRejectionReasons: () => apiClient.get('/master/rejection-reasons'),

    // === Master Data (NOC Specific) ===
    getApplicationTypes: () => apiClient.get('/master-data/application-types'),
    getApplicationSubTypes: (appTypeCode) => apiClient.get(`/master-data/application-sub-types${appTypeCode ? `?appTypeCode=${appTypeCode}` : ''}`),
    getProjectTypes: (appSubTypeCode) => apiClient.get(`/master-data/project-types${appSubTypeCode ? `?appSubTypeCode=${appSubTypeCode}` : ''}`),
    getProjectCategories: () => apiClient.get('/master-data/project-categories'),
    getWaterQualityTypes: () => apiClient.get('/master-data/water-quality-types'),
    getUtilizationPurposes: () => apiClient.get('/master-data/utilization-purposes'),
    getMSMETypes: () => apiClient.get('/master-data/msme-types'),
    getOrganizationTypes: () => apiClient.get('/master-data/organization-types'),
    getFlowMeterConfig: () => apiClient.get('/master-data/flow-meter-config'),
    getAreaCategories: () => apiClient.get('/master-data/area-categories'),
    getSectorTypes: () => apiClient.get('/master-data/sector-types'),
    getNABLLabs: () => apiClient.get('/master-data/nabl-labs'),

    // === Public Utilities ===
    calculateEC: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return apiClient.get(`/public/know-your-ec?${queryParams}`);
    },

    trackApplication: (applicationNumber) => apiClient.get(`/public/track/${applicationNumber}`),

    uploadPublicDocument: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.upload('/public/documents/upload', formData);
    }
};

export default publicService;
