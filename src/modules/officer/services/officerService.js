import apiClient from '../../../services/apiClient';
import { AI_SERVICE_URL } from '../../../config/apiConfig';

/**
 * Officer Service - Standardized using apiClient
 */
const officerService = {
    // ==================== DASHBOARD ====================

    getDGODashboard: () => apiClient.get('/officer/dgo/dashboard'),
    getSGWADashboard: () => apiClient.get('/officer/sgwa/dashboard'),
    getEnforcementDashboard: () => apiClient.get('/officer/enforcement/dashboard'),

    getEnforcementApprovalQueue: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/enforcement/applications/queue?${queryParams.toString()}`);
    },
    getSGWAApplications: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/sgwa/applications?${queryParams.toString()}`);
    },

    getSGWAApplicationDetails: (applicationId) => apiClient.get(`/officer/sgwa/applications/${applicationId}`),
    getSGWAPendingApplications: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/sgwa/applications/pending?${queryParams.toString()}`);
    },
    getTechnicalReviewApplications: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/sgwa/applications/technical-review?${queryParams.toString()}`);
    },

    getApplications: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/dgo/applications?${queryParams.toString()}`);
    },
    getApplicationDetails: (applicationId) => apiClient.get(`/officer/dgo/applications/${applicationId}`),
    getEnforcementApplicationDetails: (applicationId) => apiClient.get(`/officer/enforcement/applications/${applicationId}`),

    enforcementApproveApplication: (applicationId, data) => apiClient.post(`/officer/enforcement/applications/${applicationId}/issue-noc`, data),
    enforcementRejectApplication: (applicationId, data) => apiClient.post(`/officer/enforcement/applications/${applicationId}/reject`, data),
    enforcementReturnToSGWA: (applicationId, data) => apiClient.post(`/officer/enforcement/applications/${applicationId}/return`, data),
    enforcementRaiseQuery: (applicationId, data) => apiClient.post(`/officer/enforcement/applications/${applicationId}/query`, data),

    forwardApplication: (applicationId, data) => apiClient.post(`/officer/dgo/applications/${applicationId}/forward`, data),
    verifyDocuments: (applicationId, documents) => apiClient.post(`/officer/dgo/applications/${applicationId}/verify-documents`, { documents }),
    getOfficers: (role) => {
        const query = role ? `?role=${role}` : '';
        return apiClient.get(`/officer/dgo/officers${query}`);
    },
    scheduleInspection: (applicationId, data) => apiClient.post(`/officer/dgo/applications/${applicationId}/schedule-inspection`, data),
    raiseQuery: (applicationId, queryData) => apiClient.post(`/officer/dgo/applications/${applicationId}/raise-query`, queryData),
    submitDGOInspectionReport: (applicationId, reportData) => apiClient.post(`/officer/dgo/applications/${applicationId}/inspection-report`, reportData),

    getInspectionDashboard: () => apiClient.get('/officer/inspection/dashboard'),
    getMyInspections: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/inspection/my-inspections?${queryParams.toString()}`);
    },
    getInspectionDetails: (inspectionId) => apiClient.get(`/officer/inspection/${inspectionId}/details`),
    submitInspectionReport: (inspectionId, reportData) => apiClient.post(`/officer/inspection/${inspectionId}/submit`, reportData),
    getInspectionReport: (inspectionId) => apiClient.get(`/officer/inspection/${inspectionId}/report`),
    startInspection: (inspectionId, locationData) => apiClient.post(`/officer/inspection/${inspectionId}/start`, locationData),
    updateInspectionStatus: (inspectionId, status, remarks) => apiClient.put(`/officer/inspection/${inspectionId}/status`, { status, remarks }),

    forwardToSGWA: (applicationId, recommendationData) => apiClient.post(`/officer/dgo/applications/${applicationId}/forward`, recommendationData),
    rejectApplication: (applicationId, rejectionData) => apiClient.post(`/officer/dgo/applications/${applicationId}/reject`, rejectionData),
    raiseQuery: (applicationId, queryData) => apiClient.post(`/officer/dgo/applications/${applicationId}/query`, queryData),

    // ==================== SGWA SPECIFIC ====================

    approveApplication: (applicationId, approvalData) => apiClient.post(`/officer/sgwa/applications/${applicationId}/approve`, approvalData),
    verifySGWADocumentsBulk: (data) => apiClient.post('/officer/sgwa/verify-documents-bulk', data),
    sgwaRejectApplication: (applicationId, rejectionData) => apiClient.post(`/officer/sgwa/applications/${applicationId}/reject`, rejectionData),
    sgwaRaiseQuery: (applicationId, queryData) => apiClient.post(`/officer/sgwa/applications/${applicationId}/query`, queryData),
    assignApplication: (applicationId, assignmentData) => apiClient.post(`/officer/sgwa/applications/${applicationId}/assign`, assignmentData),
    verifyAllDocuments: (appId, data) => apiClient.post(`/officer/common/applications/${appId}/documents/verify-all`, data),
    verifyDocument: (docId, data) => apiClient.post(`/officer/common/verify-doc/${docId}`, data),

    // ==================== QUERIES ====================

    getQueries: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/dgo/queries?${queryParams.toString()}`);
    },
    getQueryDetails: (queryId) => apiClient.get(`/officer/dgo/queries/${queryId}`),
    acceptQueryResponse: (queryId, acceptanceData) => apiClient.post(`/officer/dgo/queries/${queryId}/accept`, acceptanceData),
    rejectQueryResponse: (queryId, rejectionData) => apiClient.post(`/officer/dgo/queries/${queryId}/reject`, rejectionData),

    // ==================== DOCUMENTS ====================

    uploadDocument: (formData) => apiClient.upload('/officer/common/documents/upload', formData),
    downloadDocument: (documentId) => apiClient.request(`/officer/documents/${documentId}/download`).then(res => res.blob()),

    getDocumentUrl: (documentId) => {
        const token = localStorage.getItem('officerToken');
        return `${apiClient.baseUrl}/officer/documents/${documentId}/view?token=${token}`;
    },

    updateDocumentAIStatus: (documentId, data) => apiClient.post(`/documents/${documentId}/verify-ai`, data),
    verifyDocumentWithAI: async (file, docType, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_input', JSON.stringify(metadata));
        let aiDocType = docType.toUpperCase().replace(/\s+/g, '_');
        if (aiDocType.includes('AADHAAR')) aiDocType = 'AADHAAR';

        return apiClient.upload(`${AI_SERVICE_URL}/verify-document/${aiDocType}`, formData);
    },

    // ==================== NOTIFICATIONS ====================

    getNotifications: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/notifications?${queryParams.toString()}`);
    },
    markNotificationRead: (notificationId) => apiClient.put(`/officer/notifications/${notificationId}/read`),
    markAllNotificationsRead: () => apiClient.put('/officer/notifications/mark-all-read'),

    // ==================== REPORTS ====================

    generateReport: (reportData) => apiClient.post('/officer/dgo/reports/generate', reportData),
    getComplianceReport: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/dgo/compliance-report?${queryParams.toString()}`);
    },

    // ==================== PROFILE ====================

    getProfile: () => apiClient.get('/officer/common/profile'),
    updateProfile: (profileData) => apiClient.put('/officer/common/profile', profileData),
    changePassword: (passwordData) => apiClient.post('/officer/change-password', passwordData),

    // ==================== ACTIVITY LOG ====================

    getActivityLog: (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        return apiClient.get(`/officer/activity-log?${queryParams.toString()}`);
    },

    // ==================== MASTER DATA ====================

    getDistricts: (stateId = 'RAJ') => apiClient.get(`/master/districts?stateId=${stateId}`),
    getBlocks: (districtId) => apiClient.get(`/master/blocks?districtId=${districtId}`),
    getRejectionReasons: () => apiClient.get('/master/rejection-reasons'),

    // Standardized Room ID Helper
    getConsultationRoomId: (appNumber) => {
        if (!appNumber) return null;
        const cleanNumber = appNumber.toString()
            .replace(/[\/\s]/g, '-')
            .replace(/--+/g, '-'); // collapse multiple dashes
        return `consultation-${cleanNumber}-SGWA`;
    },
};

export default officerService;
