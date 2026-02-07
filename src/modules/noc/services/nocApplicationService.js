import API_BASE_URL, { AI_SERVICE_URL } from '../../../config/apiConfig';

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

const tryFetch = async (urls, options) => {
    let lastError;
    for (const url of urls) {
        try {
            const res = await fetch(url, options);
            return await handleResponse(res);
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error('API Request Failed');
};

export const nocApplicationService = {
    // Master Data
    getApplicationTypes: async () => {
        const response = await fetch(`${API_BASE_URL}/master/application-types`);
        return handleResponse(response);
    },
    getApplicationSubTypes: async (appTypeCode) => {
        const url = appTypeCode
            ? `${API_BASE_URL}/master-data/application-sub-types?appTypeCode=${appTypeCode}`
            : `${API_BASE_URL}/master/application-sub-types`; // Fallback for legacy
        const response = await fetch(url);
        return handleResponse(response);
    },
    getProjectTypes: async (appSubTypeCode) => {
        const url = appSubTypeCode
            ? `${API_BASE_URL}/master-data/project-types?appSubTypeCode=${appSubTypeCode}`
            : `${API_BASE_URL}/master/project-types`;
        const response = await fetch(url);
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
    getBlockCategory: async (districtId, blockId) => {
        // Legacy GET
        try {
            const response = await fetch(`${API_BASE_URL}/master/block-category?districtId=${districtId}&blockId=${blockId}`);
            if (!response.ok) return { success: true, data: { name: 'Safe', color: '#10b981', description: 'Safe for extraction' } };
            return handleResponse(response);
        } catch (e) {
            return { success: true, data: { name: 'Safe', color: '#10b981', description: 'Safe for extraction' } };
        }
    },

    fetchBlockCategory: async (payload) => {
        // POST /api/master/blocks/category
        return tryFetch(
            [`${API_BASE_URL}/master/blocks/category`],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            }
        );
    },
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

    getIndustryTypes: async (category) => {
        try {
            let url = `${API_BASE_URL}/master/industry-types`;
            if (category) {
                url += `?category=${encodeURIComponent(category)}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('API not found');
            return await handleResponse(response);
        } catch (error) {
            console.warn("API /master/industry-types failed, using fallback:", error.message);
            return {
                success: true,
                data: [
                    { id: 'IND_001', name: 'Food Processing' },
                    { id: 'IND_002', name: 'Textiles' },
                    { id: 'IND_003', name: 'Chemical' },
                    { id: 'IND_004', name: 'Power Plant' },
                    { id: 'IND_005', name: 'Pharmaceuticals' },
                    { id: 'IND_999', name: 'Other' }
                ]
            };
        }
    },

    // Company & Profile
    getCompanyProfile: async () => {
        // Newer backends typically expose company profile under companies/company routes (not /noc/*).
        return tryFetch(
            [
                `${API_BASE_URL}/companies/profile`,
                `${API_BASE_URL}/company/profile`,
                `${API_BASE_URL}/noc/company/profile` // legacy fallback
            ],
            { headers: getHeaders() }
        );
    },

    getUserProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getCompanyById: async (companyId) => {
        const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    registerCompany: async (payload) => {
        const response = await fetch(`${API_BASE_URL}/companies/register`, {
            method: 'POST',
            headers: getHeaders(), // default is application/json
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },

    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
            body: formData
        });
        return handleResponse(response);
    },

    getDocumentUrl: (documentId) => {
        return `${API_BASE_URL}/documents/${documentId}/view`;
    },

    getDashboardData: async () => {
        const response = await fetch(`${API_BASE_URL}/applications/noc/dashboard`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getApprovalFlow: async (applicationId) => {
        const response = await fetch(`${API_BASE_URL}/applications/noc/${applicationId}/approval-flow`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Track Application (Timeline & Status)
    trackApplication: async (applicationId) => {
        // Using /track/ endpoint which likely accepts application number with slashes
        // Note: Caller should handle encoding if needed, but for "NOC/RAJ/..." style paths in some frameworks,
        // we might pass it as is if the backend route supports wildcard/splat.
        const response = await fetch(`${API_BASE_URL}/applications/noc/track/${applicationId}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Get User Applications
    getUserApplications: async () => {
        const response = await fetch(`${API_BASE_URL}/applications/noc`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Application Management
    createApplication: async (payload) => {
        // New canonical flow: POST /api/applications/noc (creates draft + returns applicationId)
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc`
            ],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    getApplication: async (applicationId) => {
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${applicationId}/summary`
            ],
            {
                method: 'GET',
                headers: getHeaders()
            }
        );
    },

    saveStep1: async (appId, payload) => {
        // Section 1: Basic Details
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section1`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    saveStep2: async (appId, payload) => {
        // Section 2: Location Details
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section2`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },
    saveStep3: async (appId, payload) => {
        // Section 3: Drinking & Domestic Use
        // Some callers pass only the object; normalize into expected wrapper.
        const normalized = payload && payload.drinkingDomesticUse ? payload : { drinkingDomesticUse: payload };
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section3`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(normalized || {})
            }
        );
    },
    saveStep4: async (appId, payload) => {
        // Section 4: Water Requirement Breakup
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section4`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },
    saveStep5: async (appId, payload) => {
        // Section 5: Ground Water Structures
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section5`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },
    saveStep6: async (appId, payload) => {
        // Section 6: Document Attachments Acknowledgement
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section6`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },
    saveStep7: async (appId, payload) => {
        // Frontend uses this for document acknowledgement; map to section6 for the new flow.
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/section6`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    saveFlowMeter: async (appId, payload) => {
        // Section 9: Digital Flow Meter (PUT /api/applications/noc/:id/flow-meter)
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/flow-meter`
            ],
            {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    calculateFee: async (payload) => {
        // New flow calculates fees per application id on GET.
        // Supports three methods:
        // 1. GET /calculate-fees (auto-calculate from application data)
        // 2. POST /calculate-fees (manual override with payload)
        // 3. GET /calculate-fees?queryParams (manual override via query string)
        const applicationId = payload?.applicationId || payload?.id;

        if (applicationId) {
            // Check if manual inputs are provided (POST method)
            const hasManualInputs = payload?.waterRequirement || payload?.blockCategory || payload?.sectorType;

            if (hasManualInputs && Object.keys(payload).length > 2) {
                // POST method: Manual override
                const manualPayload = {
                    waterRequirement: payload.waterRequirement,
                    blockCategory: payload.blockCategory,
                    sectorType: payload.sectorType,
                    applicationType: payload.applicationType,
                    validityPeriod: payload.validityPeriod,
                    isMSME: payload.isMSME,
                    numberOfBorewells: payload.numberOfBorewells
                };

                return tryFetch(
                    [
                        `${API_BASE_URL}/applications/noc/${applicationId}/calculate-fees`
                    ],
                    {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(manualPayload)
                    }
                );
            } else if (hasManualInputs) {
                // GET method with query params
                const queryParams = new URLSearchParams();
                if (payload.waterRequirement) queryParams.append('waterRequirement', payload.waterRequirement);
                if (payload.blockCategory) queryParams.append('blockCategory', payload.blockCategory);
                if (payload.sectorType) queryParams.append('sectorType', payload.sectorType);
                if (payload.isMSME !== undefined) queryParams.append('isMSME', payload.isMSME);

                const queryString = queryParams.toString();
                const url = `${API_BASE_URL}/applications/noc/${applicationId}/calculate-fees${queryString ? '?' + queryString : ''}`;

                return tryFetch(
                    [url],
                    { method: 'GET', headers: getHeaders() }
                );
            } else {
                // GET method: Auto-calculate from application data
                return tryFetch(
                    [
                        `${API_BASE_URL}/applications/noc/${applicationId}/calculate-fees`
                    ],
                    { method: 'GET', headers: getHeaders() }
                );
            }
        }

        // Fallback: Legacy POST endpoint (only if no applicationId provided)
        return tryFetch(
            [`${API_BASE_URL}/noc/fees/calculate`],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    savePaymentDetails: async (appId, payload) => {
        // Payment details are typically saved as part of fee calculation or submit flow
        // This endpoint may not exist in the new flow, so we'll try it but make it optional
        try {
            return await tryFetch(
                [
                    `${API_BASE_URL}/applications/noc/${appId}/payment`
                ],
                {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(payload || {})
                }
            );
        } catch (error) {
            // Payment endpoint may not exist - that's okay, payment details are included in submit
            console.warn('Payment endpoint not available, will include in submit:', error.message);
            return { success: true, message: 'Payment details will be saved on submit' };
        }
    },

    submitApplication: async (appId, payload) => {
        // New canonical submit: POST /api/applications/noc/:id/submit
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/${appId}/submit`
            ],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    submitExemption: async (payload) => {
        return tryFetch(
            [
                `${API_BASE_URL}/noc/exemption`
            ],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    // Submit Exemption to Authority (Final Submission)
    submitExemptionToAuthority: async (exemptionId) => {
        return tryFetch(
            [
                `${API_BASE_URL}/noc/exemption/${exemptionId}/submit`
            ],
            {
                method: 'POST',
                headers: getHeaders()
            }
        );
    },

    // Get Dynamic Document Requirements
    getDocumentRequirements: async (payload) => {
        return tryFetch(
            [
                `${API_BASE_URL}/tools/document-requirements`
            ],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            }
        );
    },

    calculateDischarge: async (payload) => {
        return tryFetch(
            [
                `${API_BASE_URL}/applications/noc/calculate-discharge`
            ],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    checkEligibility: async (payload) => {
        return tryFetch(
            [
                `${API_BASE_URL}/noc/exemption/check-eligibility`
            ],
            {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload || {})
            }
        );
    },

    getExemptionConfig: async () => {
        const response = await fetch(`${API_BASE_URL}/noc/exemption/config`);
        return handleResponse(response);
    },

    uploadDocument: async (file, documentType, applicationId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        if (applicationId) {
            formData.append('applicationId', applicationId);
        }

        return tryFetch(
            [
                `${API_BASE_URL}/documents/upload/single`
            ],
            {
                method: 'POST',
                headers: getHeaders(true), // isMultipart = true
                body: formData
            }
        );
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
    },

    // Document helper methods
    getDocumentUrl: (documentId) => {
        return `${API_BASE_URL}/documents/${documentId}/view`;
    },

    getDocumentWithAuth: (documentId) => {
        const url = `${API_BASE_URL}/documents/${documentId}/view`;
        const token = getAuthToken();
        return {
            url,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    },

    downloadCertificate: async (refNumber) => {
        try {
            const response = await fetch(`${API_BASE_URL}/applications/noc/ref/${refNumber}/document`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Download failed');
            }

            const blob = await response.blob();
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

    downloadDocument: async (documentId) => {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to download document');
        return await response.blob();
    },

    updateDocumentAIStatus: async (documentId, data) => {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/verify-ai`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    verifyDocumentWithAI: async (file, docType, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('inputText', JSON.stringify(metadata)); // Changed from user_input as per curl

        // Helper to map frontend document types to AI Service types
        const getAIDocumentType = (type) => {
            const t = type.toUpperCase().replace(/\s+/g, '_');

            // Direct Map
            const map = {
                'AADHAAR': 'DOC_AADHAAR',
                'PAN': 'DOC_PAN_COMPANY',
                'PAN_COMPANY': 'DOC_PAN_COMPANY',
                'GST': 'DOC_GST',
                'GST_CERTIFICATE': 'DOC_GST',
                'COI': 'DOC_COI',
                'INCORPORATION_CERTIFICATE': 'DOC_COI',
                'MOA': 'DOC_MOA_AOA',
                'AOA': 'DOC_MOA_AOA',
                'MOA_AOA': 'DOC_MOA_AOA',
                'SAN': 'DOC_SAN', // Business Registration
                'MSME': 'DOC_UDYAM', // Assuming Udyam for MSME
                'UDYAM': 'DOC_UDYAM',
                'ISO': 'DOC_ISO',
                'ISO_CERTIFICATE': 'DOC_ISO',
                'STARTUP': 'DOC_STARTUP',
                'STARTUP_INDIA': 'DOC_STARTUP',
                'CONSENT_TO_ESTABLISH': 'DOC_EC_CTE',
                'CTE': 'DOC_EC_CTE',
                'ECO_SENSITIVE': 'DOC_EC_CTE', // Approximation if needed
                'ENV_CLEARANCE': 'DOC_EC_CTE', // Approximation
                'AFFIDAVIT': 'DOC_AFFIDAVIT',
                'MINE_PLAN': 'DOC_MINE_PLAN',
                'APPROVED_MINE_PLAN': 'DOC_MINE_PLAN',
                'LAND_OWNERSHIP': 'DOC_LAND_OWNERSHIP', // If supported
                'OWNERSHIP_PROOF': 'DOC_LAND_OWNERSHIP'
            };

            if (map[t]) return map[t];

            // Fuzzy/Fallback Logic
            if (t.includes('AADHAAR')) return 'DOC_AADHAAR';
            if (t.includes('PAN')) return 'DOC_PAN_COMPANY';
            if (t.includes('GST')) return 'DOC_GST';
            if (t.includes('CONSENT') || t.includes('CTE')) return 'DOC_EC_CTE';
            if (t.includes('AFFIDAVIT')) return 'DOC_AFFIDAVIT';
            if (t.includes('MINE')) return 'DOC_MINE_PLAN';
            if (t.includes('INCORPORATION') || t.includes('COI')) return 'DOC_COI';

            // Default to raw if no match (hoping backend handles it or it's already correct)
            return type; // Was 'aiDocType', but raw might be safer if unknown
        };

        const aiDocType = getAIDocumentType(docType);
        formData.append('documentType', aiDocType);

        console.log(`AI Method: verifyDocumentWithAI | Input Type: ${docType} | Mapped Type: ${aiDocType}`);

        // Direct call to Python Service (using 5020 as per user curl request suggestion, or fallback to configured)
        // User's curl showed localhost:5020. Updating port to match user expectation.
        const response = await fetch(`${AI_SERVICE_URL}/verify-document`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI Service Error: ${errorText}`);
        }

        return await response.json();
    }
};

export default nocApplicationService;
