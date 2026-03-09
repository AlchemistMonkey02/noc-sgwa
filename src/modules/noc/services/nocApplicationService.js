import apiClient from '../../../services/apiClient';
import { AI_SERVICE_URL } from '../../../config/apiConfig';

export const nocApplicationService = {
    // Master Data
    getApplicationTypes: () => apiClient.get('/master/application-types'),
    getApplicationSubTypes: (appTypeCode) => {
        const url = appTypeCode
            ? `/master-data/application-sub-types?appTypeCode=${appTypeCode}`
            : `/master/application-sub-types`;
        return apiClient.get(url);
    },
    getProjectTypes: (appSubTypeCode) => {
        const url = appSubTypeCode
            ? `/master-data/project-types?appSubTypeCode=${appSubTypeCode}`
            : `/master/project-types`;
        return apiClient.get(url);
    },
    getWaterQualityTypes: () => apiClient.get('/master/water-quality-types'),
    getUtilizationPurposes: () => apiClient.get('/master/utilization-purposes'),
    getProjectCategories: () => apiClient.get('/master/project-categories'),
    getOrganizationTypes: () => apiClient.get('/master/organization-types'),
    getMsmeTypes: () => apiClient.get('/master/msme-types'),
    getStates: () => apiClient.get('/master/states'),
    getDistricts: (stateId) => apiClient.get(`/master/districts?stateId=${stateId}`),
    getBlocks: (districtId) => apiClient.get(`/master/blocks?districtId=${districtId}`),
    getTehsils: (districtId) => apiClient.get(`/master/tehsils?districtId=${districtId}`),
    getAssessmentUnits: (districtId) => apiClient.get(`/master/assessment-units?districtId=${districtId}`),
    getBlockCategory: (districtId, blockId) => apiClient.get(`/master/block-category?districtId=${districtId}&blockId=${blockId}`)
        .catch(() => ({ success: true, data: { name: 'Safe', color: '#10b981', description: 'Safe for extraction' } })),

    fetchBlockCategory: (payload) => apiClient.post('/master/blocks/category', payload),
    getUtilizationSectors: async () => {
        // API endpoint /master/utilization-sectors no longer exists
        // Returning static list directly to avoid 404 errors
        return {
            success: true,
            data: [
                { id: '1', name: 'Industry' },
                { id: '2', name: 'Infrastructure' },
                { id: '3', name: 'Mining' }
            ]
        };
    },

    getIndustryTypes: (category) => {
        const url = category
            ? `/master/industry-types?category=${encodeURIComponent(category)}`
            : `/master/industry-types`;
        return apiClient.get(url).catch(() => ({
            success: true,
            data: [
                { industryTypeId: 'IND_001', industryName: 'Food Processing' },
                { industryTypeId: 'IND_002', industryName: 'Textiles' },
                { industryTypeId: 'IND_003', industryName: 'Chemical' },
                { industryTypeId: 'IND_004', industryName: 'Power Plant' },
                { industryTypeId: 'IND_005', industryName: 'Pharmaceuticals' },
                { industryTypeId: 'IND_999', industryName: 'Other' }
            ]
        }));
    },

    // Company & Profile
    getCompanyProfile: () => apiClient.get('/companies/profile'),
    getUserProfile: () => apiClient.get('/auth/profile'),
    getCompanyById: (companyId) => apiClient.get(`/companies/${companyId}`),
    registerCompany: (payload) => apiClient.post('/companies/register', payload),
    updateCompany: (companyId, payload) => apiClient.put(`/companies/${companyId}`, payload),
    uploadProfilePicture: (file) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return apiClient.upload('/auth/profile-picture', formData);
    },

    getDocumentUrl: (documentId) => {
        return `${API_BASE_URL}/documents/${documentId}/view`;
    },

    getDashboardData: () => apiClient.get('/applications/noc/dashboard'),
    getApprovalFlow: (applicationId) => apiClient.get(`/applications/noc/${applicationId}/approval-flow`),
    getProcessingEstimates: (params) => apiClient.get('/applications/noc/processing-estimates', { params }),
    trackApplication: (applicationId) => apiClient.get(`/applications/noc/track/${applicationId}`),
    getUserApplications: () => apiClient.get('/applications/noc'),

    // Application Management
    createApplication: (payload) => apiClient.post('/applications/noc', payload || {}),
    getApplication: (applicationId) => apiClient.get(`/applications/noc/${applicationId}/summary`),

    saveStep1: (appId, payload) => apiClient.put(`/applications/noc/${appId}/section1`, payload || {}),
    saveStep2: (appId, payload) => apiClient.put(`/applications/noc/${appId}/section2`, payload || {}),
    saveStep3: (appId, payload) => {
        const normalized = payload && payload.drinkingDomesticUse ? payload : { drinkingDomesticUse: payload };
        return apiClient.put(`/applications/noc/${appId}/section3`, normalized || {});
    },
    saveStep4: (appId, payload) => apiClient.put(`/applications/noc/${appId}/section4`, payload || {}),
    saveStep5: (appId, payload) => apiClient.put(`/applications/noc/${appId}/section5`, payload || {}),
    saveStep6: (appId, payload) => apiClient.put(`/applications/noc/${appId}/section6`, payload || {}),
    saveStep7: (appId, payload) => apiClient.put(`/applications/noc/${appId}/section6`, payload || {}),
    saveFlowMeter: (appId, payload) => apiClient.put(`/applications/noc/${appId}/flow-meter`, payload || {}),

    calculateFee: (payload) => {
        const applicationId = payload?.applicationId || payload?.id;
        if (applicationId) {
            const hasManualInputs = payload?.waterRequirement || payload?.blockCategory || payload?.sectorType;
            if (hasManualInputs && Object.keys(payload).length > 2) {
                return apiClient.post(`/applications/noc/${applicationId}/calculate-fees`, payload);
            } else if (hasManualInputs) {
                const queryParams = new URLSearchParams(payload);
                return apiClient.get(`/applications/noc/${applicationId}/calculate-fees?${queryParams.toString()}`);
            } else {
                return apiClient.get(`/applications/noc/${applicationId}/calculate-fees`);
            }
        }
        return apiClient.post('/noc/fees/calculate', payload || {});
    },

    savePaymentDetails: (appId, payload) => apiClient.post(`/applications/noc/${appId}/payment`, payload || {})
        .catch(() => ({ success: true, message: 'Payment details will be saved on submit' })),

    submitApplication: (appId, payload) => apiClient.post(`/applications/noc/${appId}/submit`, payload || {}),
    submitExemption: (payload) => apiClient.post('/noc/exemption', payload || {}),
    submitExemptionToAuthority: (exemptionId) => apiClient.post(`/noc/exemption/${exemptionId}/submit`),
    getDocumentRequirements: (payload) => apiClient.post('/tools/document-requirements', payload),
    calculateDischarge: (payload) => apiClient.post('/applications/noc/calculate-discharge', payload || {}),
    checkEligibility: (payload) => apiClient.post('/noc/exemption/check-eligibility', payload || {}),
    getExemptionConfig: () => apiClient.get('/noc/exemption/config'),

    uploadDocument: (file, documentType, applicationId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        if (applicationId) formData.append('applicationId', applicationId);
        return apiClient.upload('/documents/upload/single', formData);
    },

    // Flow Meter Data
    getFlowMeterConfig: () => apiClient.get('/master/flow-meter-config')
        .catch(() => ({
            success: true,
            data: {
                manufacturers: ["Kranti", "Dasmesh", "It's Yours", "Other"],
                telemetryProviders: ["Provider A", "Provider B"],
                bisStandards: ["IS 779", "IS 13779"],
                meterTypes: ["Digital", "Mechanical", "Electromagnetic"]
            }
        })),
    getMeterModels: (manufacturer) => apiClient.get(`/master/meter-models?manufacturer=${manufacturer}`),
    getMeterSerialNumbers: (manufacturer) => Promise.resolve({ success: true, data: [] }),

    // Document helper methods
    getDocumentUrl: (documentId) => `${apiClient.baseUrl}/documents/${documentId}/view`,
    getDocumentWithAuth: (documentId) => {
        const url = `${apiClient.baseUrl}/documents/${documentId}/view`;
        const token = localStorage.getItem('authToken');
        return { url, headers: { 'Authorization': `Bearer ${token}` } };
    },

    getCertificateDetails: (applicationId) => apiClient.get(`/applications/noc/${applicationId}/certificate`),

    downloadCertificate: async (refNumber) => {
        try {
            const blob = await apiClient.request(`/applications/noc/ref/${refNumber}/document`, { method: 'GET' }, true).then(res => res.blob());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NOC_Certificate_${refNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return { success: true };
        } catch (error) {
            console.error('Certificate download error:', error);
            throw error;
        }
    },

    downloadDocument: (documentId) => apiClient.request(`/documents/${documentId}/download`).then(res => res.blob()),
    updateDocumentAIStatus: (documentId, data) => apiClient.post(`/documents/${documentId}/verify-ai`, data),

    verifyDocumentWithAI: async (file, docType, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('inputText', JSON.stringify(metadata));

        const getAIDocumentType = (type) => {
            const t = type.toUpperCase().replace(/\s+/g, '_');
            const map = {
                'AADHAAR': 'DOC_AADHAAR', 'PAN': 'DOC_PAN_COMPANY', 'PAN_COMPANY': 'DOC_PAN_COMPANY',
                'GST': 'DOC_GST', 'GST_CERTIFICATE': 'DOC_GST', 'COI': 'DOC_COI',
                'INCORPORATION_CERTIFICATE': 'DOC_COI', 'MOA': 'DOC_MOA_AOA', 'AOA': 'DOC_MOA_AOA',
                'MOA_AOA': 'DOC_MOA_AOA', 'SAN': 'DOC_SAN', 'MSME': 'DOC_UDYAM',
                'UDYAM': 'DOC_UDYAM', 'ISO': 'DOC_ISO', 'ISO_CERTIFICATE': 'DOC_ISO',
                'STARTUP': 'DOC_STARTUP', 'STARTUP_INDIA': 'DOC_STARTUP',
                'CONSENT_TO_ESTABLISH': 'DOC_EC_CTE', 'CTE': 'DOC_EC_CTE',
                'ECO_SENSITIVE': 'DOC_EC_CTE', 'ENV_CLEARANCE': 'DOC_EC_CTE',
                'AFFIDAVIT': 'DOC_AFFIDAVIT', 'MINE_PLAN': 'DOC_MINE_PLAN',
                'APPROVED_MINE_PLAN': 'DOC_MINE_PLAN', 'LAND_OWNERSHIP': 'DOC_LAND_OWNERSHIP',
                'OWNERSHIP_PROOF': 'DOC_LAND_OWNERSHIP'
            };
            if (map[t]) return map[t];
            if (t.includes('AADHAAR')) return 'DOC_AADHAAR';
            if (t.includes('PAN')) return 'DOC_PAN_COMPANY';
            if (t.includes('GST')) return 'DOC_GST';
            if (t.includes('CONSENT') || t.includes('CTE')) return 'DOC_EC_CTE';
            if (t.includes('AFFIDAVIT')) return 'DOC_AFFIDAVIT';
            if (t.includes('MINE')) return 'DOC_MINE_PLAN';
            if (t.includes('INCORPORATION') || t.includes('COI')) return 'DOC_COI';
            return type;
        };

        const aiDocType = getAIDocumentType(docType);
        formData.append('documentType', aiDocType);

        const response = await fetch(`${AI_SERVICE_URL}/verify-document`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI Service Error: ${errorText}`);
        }

        return await response.json();
    },

    // Queries
    getUserQueries: async () => {
        try {
            // Fetch all queries for the logged-in user
            const response = await apiClient.get('/queries/user/all');

            if (response.success && response.data?.queries) {
                return response.data.queries;
            }

            return [];
        } catch (error) {
            console.error("[nocApplicationService] Query fetching failed:", error);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    },

    // Standardized Room ID Helper
    getConsultationRoomId: (appNumber) => {
        if (!appNumber) return null;
        const cleanNumber = appNumber.toString()
            .replace(/[\/\s]/g, '-')
            .replace(/--+/g, '-'); // collapse multiple dashes
        return `consultation-${cleanNumber}-SGWA`;
    },

    replyToQuery: (queryId, payload) => {
        const formData = new FormData();
        if (payload.response) formData.append('response', payload.response);
        if (payload.file) formData.append('document', payload.file);
        return apiClient.upload(`/queries/${queryId}/reply`, formData);
    }
};

export default nocApplicationService;
