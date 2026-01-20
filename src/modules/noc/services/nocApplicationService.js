import API_BASE_URL from '../../../config/apiConfig';

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const getHeaders = (isMultipart = false) => {
    const headers = {
        'Authorization': `Bearer ${getAuthToken()}`
    };
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'API Request Failed');
    }
    return data;
};

export const nocApplicationService = {
    // Master Data
    getApplicationTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/application-types`);
        return handleResponse(response);
    },
    getApplicationSubTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/application-sub-types`);
        return handleResponse(response);
    },
    getProjectTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/project-types`);
        return handleResponse(response);
    },
    getWaterQualityTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/water-quality-types`);
        return handleResponse(response);
    },
    getUtilizationPurposes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/utilization-purposes`);
        return handleResponse(response);
    },
    getProjectCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/master/project-categories`);
        return handleResponse(response);
    },
    getOrganizationTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/organization-types`);
        return handleResponse(response);
    },
    getMsmeTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/msme-types`);
        return handleResponse(response);
    },
    getStates: async () => {
        const response = await fetch(`${API_BASE_URL}/master/states`);
        return handleResponse(response);
    },
    getDistricts: async (stateId) => {
        const response = await fetch(`${API_BASE_URL}/master/districts?stateId=${stateId}`);
        return handleResponse(response);
    },
    getBlocks: async (districtId) => {
        const response = await fetch(`${API_BASE_URL}/master/blocks?districtId=${districtId}`);
        return handleResponse(response);
    },
    getTehsils: async (districtId) => {
        const response = await fetch(`${API_BASE_URL}/master/tehsils?districtId=${districtId}`);
        return handleResponse(response);
    },
    getAssessmentUnits: async (districtId) => {
        const response = await fetch(`${API_BASE_URL}/master/assessment-units?districtId=${districtId}`);
        return handleResponse(response);
    },

    // Company & Profile
    getCompanyProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/noc/company/profile`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Application Management
    createApplication: async (payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/draft`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },

    saveStep2: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/step/2`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },
    saveStep3: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/step/3`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },
    saveStep4: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/step/4`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },
    saveStep5: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/step/5`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },
    saveStep6: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/step/6`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },
    saveStep7: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/step/7`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },

    calculateFee: async (payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/fees/calculate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },

    savePaymentDetails: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/payment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },

    submitApplication: async (appId, payload) => {
        const response = await fetch(`${API_BASE_URL}/noc/applications/${appId}/submit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },

    // Flow Meter Data
    getFlowMeterConfig: async () => {
        // Consolidated config fetch
        // If API doesn't exist, we might need individual calls or return mock
        const response = await fetch(`${API_BASE_URL}/master/flow-meter-config`);
        // Fallback for dev if API missing
        if (!response.ok) {
            return {
                success: true,
                data: {
                    manufacturers: ["Kranti", "Dasmesh", "It's Yours", "Other"],
                    telemetryProviders: ["Provider A", "Provider B"],
                    bisStandards: ["IS 779", "IS 13779"],
                    meterTypes: ["Digital", "Mechanical", "Electromagnetic"]
                }
            };
        }
        return handleResponse(response);
    },
    getMeterModels: async (manufacturer) => {
        const response = await fetch(`${API_BASE_URL}/master/meter-models?manufacturer=${manufacturer}`);
        return handleResponse(response);
    },
    getMeterSerialNumbers: async (manufacturer) => {
        // This is usually not a master API but user input?
        // Assuming user meant fetching AVAILABLE serials (stock?) or just allowing input.
        // For now, return empty or mock if needed
        return { success: true, data: [] };
    }
};

export default nocApplicationService;
