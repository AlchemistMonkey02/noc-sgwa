

const API_BASE_URL = 'http://localhost:3000/api';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const getAuthHeaders = () => {
    // Strategy 1: Direct localStorage token
    let token = localStorage.getItem('authToken');

    // Strategy 2: Check inside stored user object
    if (!token) {
        try {
            const userStr = localStorage.getItem('nocUser');
            if (userStr) {
                const updatedUser = JSON.parse(userStr);
                token = updatedUser.token || updatedUser.accessToken;
            }
        } catch (e) { console.error('Error parsing token from user object', e); }
    }

    // Strategy 3: Cookies (Only for non-HttpOnly, unlikely to work for JWT but good fallback)
    if (!token) {
        token = getCookie('authToken') || getCookie('token') || getCookie('jwt');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const apiRequest = async (endpoint, options = {}, isRetry = false) => {
    // Determine headers
    const headers = options.headers || getAuthHeaders();

    // Handle FormData: Remove Content-Type to allow browser to set boundary
    if (options.body instanceof FormData && headers['Content-Type']) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    // Handle 401/403 - Token Expired
    if ((response.status === 401 || response.status === 403) && !isRetry) {
        console.group('Token Refresh Debug');
        console.log('Detected 401/403. Attempting refresh...');

        const refreshToken = localStorage.getItem('refreshToken');
        const currentToken = localStorage.getItem('authToken');

        if (!refreshToken) {
            console.error('No refresh token found in localStorage');
            console.groupEnd();
            return response;
        }

        try {
            console.log('Sending refresh request...');
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentToken}`, // Required by backend
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            console.log('Refresh response status:', refreshResponse.status);

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                console.log('Refresh successful, new token received');

                // Robust handling of response structure
                const responseData = data.data || data;
                const newToken = responseData.token || responseData.accessToken || data.token || data.accessToken;
                const newRefreshToken = responseData.refreshToken || data.refreshToken;

                if (newToken) {
                    // Update LocalStorage
                    localStorage.setItem('authToken', newToken);
                    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                    // Dispatch event for other tabs/components
                    window.dispatchEvent(new Event('storage'));

                    // Retry Original Request
                    console.log('Retrying original request with new token...');
                    const newHeaders = getAuthHeaders();
                    // Ensure Content-Type handling for FormData is preserved
                    if (options.body instanceof FormData && newHeaders['Content-Type']) {
                        delete newHeaders['Content-Type'];
                    }

                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers: newHeaders
                    });

                    console.log('Retry response status:', retryResponse.status);
                    console.groupEnd();
                    return retryResponse;
                }
            } else {
                console.error('Refresh request failed:', await refreshResponse.text());
            }
        } catch (err) {
            console.error('Token refresh execution failed', err);
        }
        console.groupEnd();
    }


    return response;
};

// Helper to handle response parsing and error throwing
const handleResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Parse error to get specific message
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: { message: 'Session expired' } };
        }

        // Check if it's a user not found error (database was reset)
        if (errorData.error?.code === 'USER_NOT_FOUND' || errorData.error?.code === 'INVALID_CREDENTIALS') {
            // Redirect to login page
            if (window.location.pathname !== '/' && !window.location.pathname.includes('/login')) {
                window.location.href = '/';
            }
            throw new Error("Your session has expired or your account no longer exists. Please login again.");
        }

        throw new Error("Session expired. Please login again.");
    }
    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const error = await response.json();
            errorMessage = error.message || error.error?.message || errorMessage;
        } catch (e) {
            // response was not json
        }
        throw new Error(errorMessage);
    }
    return await response.json();
};

export const nocApplicationService = {
    // Company Registration
    registerCompany: async (companyData) => {
        // Handle FormData vs JSON
        let body;
        let headers = getAuthHeaders();

        if (companyData instanceof FormData) {
            body = companyData;
            // Let apiRequest handle header cleanup for FormData
        } else {
            body = JSON.stringify(companyData);
        }

        const response = await apiRequest('/companies/register', {
            method: 'POST',
            body
        });
        return handleResponse(response);
    },

    getCompanyProfile: async () => {
        const response = await apiRequest('/companies/profile');
        return handleResponse(response);
    },

    // Create Application (Step 1 & 2 data)
    createApplication: async (applicationData) => {
        const response = await apiRequest('/applications/noc', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
        return handleResponse(response);
    },

    // Update Application (General Update)
    updateApplication: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Step 2: Location Details
    saveStep2: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}/section2`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Step 3: Drinking & Domestic Use
    saveStep3: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}/section3`, {
            method: 'PUT',
            body: JSON.stringify({ drinkingDomesticUse: data })
        });
        return handleResponse(response);
    },

    // Step 4: Water Requirement Breakup
    saveStep4: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}/section4`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Step 5: Groundwater Structures
    saveStep5: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}/section5`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Step 7: Document Linking
    saveStep7: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}/section6`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Step 8 & 9: Fee & Payment
    savePaymentDetails: async (applicationId, data) => {
        const response = await apiRequest(`/applications/noc/${applicationId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Master Data
    getApplicationTypes: async () => {
        const response = await apiRequest('/master-data/application-types');
        if (!response.ok) throw new Error('Failed to fetch application types');
        return await response.json();
    },

    getApplicationSubTypes: async () => {
        const response = await apiRequest('/master-data/application-sub-types');
        if (!response.ok) throw new Error('Failed to fetch application sub types');
        return await response.json();
    },

    getProjectTypes: async () => {
        const response = await apiRequest('/master-data/project-types');
        if (!response.ok) throw new Error('Failed to fetch project types');
        return await response.json();
    },

    getWaterQualityTypes: async () => {
        const response = await apiRequest('/master-data/water-quality-types');
        if (!response.ok) throw new Error('Failed to fetch water quality types');
        return await response.json();
    },

    getUtilizationPurposes: async () => {
        const response = await apiRequest('/master-data/utilization-purposes');
        if (!response.ok) throw new Error('Failed to fetch utilization purposes');
        return await response.json();
    },

    getMsmeTypes: async () => {
        const response = await apiRequest('/master-data/msme-types');
        if (!response.ok) throw new Error('Failed to fetch MSME types');
        return await response.json();
    },

    getStates: async () => {
        const response = await apiRequest('/master/states');
        if (!response.ok) throw new Error('Failed to fetch states');
        return await response.json();
    },

    getDistricts: async (stateId) => {
        const query = stateId ? `?stateId=${encodeURIComponent(stateId)}` : '';
        const response = await apiRequest(`/master/districts${query}`);
        return handleResponse(response);
    },

    getTehsils: async (districtId) => {
        const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
        const response = await apiRequest(`/master/tehsils${query}`);
        return handleResponse(response);
    },

    getBlocks: async (districtId) => {
        const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
        const response = await apiRequest(`/master/blocks${query}`);
        return handleResponse(response);
    },

    // Step 8: Fee Calculation
    calculateFee: async (data) => {
        const response = await apiRequest('/tools/fee-calculator', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    getAssessmentUnits: async (districtId) => {
        const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
        const response = await apiRequest(`/master/assessment-units${query}`);
        return handleResponse(response);
    },

    getIndustryTypes: async () => {
        const response = await apiRequest('/master/industry-types');
        if (!response.ok) throw new Error('Failed to fetch industry types');
        return await response.json();
    },

    getProjectCategories: async () => {
        const response = await apiRequest('/master-data/project-categories');
        if (!response.ok) throw new Error('Failed to fetch project categories');
        return await response.json();
    },

    getOrganizationTypes: async () => {
        const response = await apiRequest('/master-data/organization-types');
        if (!response.ok) throw new Error('Failed to fetch organization types');
        return await response.json();
    },

    getMeterManufacturers: async () => {
        const response = await apiRequest('/master-data/meter-manufacturers');
        return handleResponse(response);
    },

    getMeterModels: async (manufacturerCode) => {
        if (!manufacturerCode) return { success: true, data: [] };
        const response = await apiRequest(`/master-data/meter-models?manufacturer=${encodeURIComponent(manufacturerCode)}`);
        return handleResponse(response);
    },

    getFlowMeterConfig: async () => {
        const response = await apiRequest('/master-data/flow-meter-config');
        return handleResponse(response);
    },

    getMeterSerialNumbers: async (manufacturerCode) => {
        const query = manufacturerCode ? `?manufacturer=${encodeURIComponent(manufacturerCode)}` : '';
        const response = await apiRequest(`/master-data/meter-serial-numbers${query}`);
        return handleResponse(response);
    },

    getTelemetryProviders: async () => {
        const response = await apiRequest('/master-data/telemetry-providers');
        return handleResponse(response);
    },

    getBisStandards: async () => {
        const response = await apiRequest('/master-data/bis-standards');
        return handleResponse(response);
    },

    // Step 10: Final Submission
    submitApplication: async (applicationId, data) => {
        const options = {
            method: 'POST'
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        const response = await apiRequest(`/applications/noc/${applicationId}/submit`, options);
        // Let handleResponse manage errors
        return handleResponse(response);
    },
    getUserProfile: async () => {
        const response = await apiRequest('/auth/profile');
        return handleResponse(response);
    },

    // Contact Update APIs
    requestContactOtp: async (data) => {
        // data: { type: 'EMAIL' | 'PHONE', value: '...' }
        const response = await apiRequest('/auth/profile/contact/otp', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    verifyContactUpdate: async (data) => {
        // data: { type: 'EMAIL' | 'PHONE', value: '...', otp: '...' }
        const response = await apiRequest('/auth/profile/contact/verify', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Application Listing & Tracking
    getUserApplications: async (params = {}) => {
        // params: { status, type, page, limit }
        const query = new URLSearchParams(params).toString();
        const response = await apiRequest(`/applications/noc?${query}`);
        return handleResponse(response);
    },

    trackApplication: async (applicationId) => {
        // Public or Protected endpoint depending on auth requirement.
        // Using the public tracking endpoint from docs: GET /applications/track/{applicationId}
        // OR authenticated GET /applications/noc/{applicationId} if strictly user-bound.
        // Based on functionality, likely the track endpoint handles diverse ID types (UUID, REF, NOC numbers)
        const response = await apiRequest(`/applications/noc/track/${applicationId}`);
        return handleResponse(response);
    },

    getProcessingEstimates: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await apiRequest(`/applications/noc/processing-estimates?${query}`);
        return handleResponse(response);
    },

    // AI-Based Self Compliance APIs (No auth required)
    startComplianceSession: async (applicationId) => {
        const response = await fetch(`${API_BASE_URL}/self-compliance/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId })
        });
        return await response.json();
    },

    submitComplianceStep: async (complianceId, stepData) => {
        const response = await fetch(`${API_BASE_URL}/self-compliance/${complianceId}/step`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stepData)
        });
        return await response.json();
    },

    uploadComplianceDocument: async (complianceId, formData) => {
        const response = await fetch(`${API_BASE_URL}/self-compliance/${complianceId}/upload`, {
            method: 'POST',
            body: formData // FormData with file, documentType, step, description
        });
        return await response.json();
    },

    submitForAIValidation: async (complianceId, finalData) => {
        const response = await fetch(`${API_BASE_URL}/self-compliance/${complianceId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        return await response.json();
    },

    getComplianceStatus: async (complianceId) => {
        const response = await fetch(`${API_BASE_URL}/self-compliance/${complianceId}/status`);
        return await response.json();
    },

    getComplianceDetails: async (complianceId) => {
        const response = await fetch(`${API_BASE_URL}/self-compliance/${complianceId}/details`);
        return await response.json();
    },

    // Query Management APIs
    getApplicationQueries: async (applicationId, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await apiRequest(`/queries/applications/${applicationId}/queries?${query}`);
        return handleResponse(response);
    },

    getQueryDetails: async (queryId) => {
        const response = await apiRequest(`/queries/${queryId}`);
        return handleResponse(response);
    },

    replyToQuery: async (queryId, replyData) => {
        // replyData can be an object {response: string} or FormData with file
        let options = { method: 'POST' };

        if (replyData instanceof FormData) {
            options.body = replyData;
            // Let browser set Content-Type with boundary for FormData
        } else {
            options.body = JSON.stringify(replyData);
            options.headers = getAuthHeaders();
        }

        const response = await apiRequest(`/queries/${queryId}/reply`, options);
        return handleResponse(response);
    },

    // Eligibility Checker APIs
    getBlockCategory: async (districtId, blockId) => {
        const query = new URLSearchParams({ districtId, blockId }).toString();
        const response = await apiRequest(`/tools/eligibility/block-category?${query}`);
        return handleResponse(response);
    },

    checkEligibility: async (eligibilityData) => {
        // Transform frontend data to match backend expectations
        // Backend expects: stateId (name), districtId (name), blockId (name), SectorType, waterRequirement
        const backendPayload = {
            stateId: eligibilityData.state,           // Backend wants state NAME in stateId field
            districtId: eligibilityData.district,     // Backend wants district NAME in districtId field
            blockId: eligibilityData.block,           // Backend wants block NAME in blockId field
            SectorType: eligibilityData.sector,       // Note: Capital S
            projectType: eligibilityData.projectType,
            waterRequirement: eligibilityData.groundWaterRequirement, // Different field name
            industryType: eligibilityData.industryType || undefined,
            isMSME: eligibilityData.isMSME || false,
            msmeType: eligibilityData.msmeType || undefined,
            isWetland: eligibilityData.isWetland || false
        };

        // Remove undefined values
        Object.keys(backendPayload).forEach(key => {
            if (backendPayload[key] === undefined || backendPayload[key] === '') {
                delete backendPayload[key];
            }
        });

        const response = await apiRequest('/tools/check-eligibility', {
            method: 'POST',
            body: JSON.stringify(backendPayload)
        });
        return handleResponse(response);
    },

    // Get utilization sectors/purposes for eligibility checker
    getUtilizationSectors: async () => {
        const response = await apiRequest('/master-data/utilization-purposes');
        return handleResponse(response);
    },

    // Dashboard Data
    getDashboardData: async () => {
        const response = await apiRequest('/applications/noc/dashboard');
        return handleResponse(response);
    },

    // Certificate APIs
    viewCertificate: async (applicationUuid) => {
        const response = await apiRequest(`/applications/noc/${applicationUuid}/certificate`);
        return handleResponse(response);
    },

    downloadCertificate: async (applicationUuid) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/applications/noc/${applicationUuid}/certificate/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download certificate');
        }

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'certificate.pdf';
        if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        // Convert response to blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Certificate downloaded successfully' };
    }
};
