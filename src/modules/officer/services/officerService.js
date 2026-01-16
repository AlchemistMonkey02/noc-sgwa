import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper to get auth token
const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Helper to get refresh token
const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// API request helper with auto token refresh
const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle token refresh on 401
    if (response.status === 401) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    if (refreshData.success && refreshData.data.token) {
                        localStorage.setItem('authToken', refreshData.data.token);
                        if (refreshData.data.refreshToken) {
                            localStorage.setItem('refreshToken', refreshData.data.refreshToken);
                        }

                        // Retry original request with new token
                        headers['Authorization'] = `Bearer ${refreshData.data.token}`;
                        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
                    }
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
            }
        }
    }

    return response;
};

// Handle response
const handleResponse = async (response) => {
    if (response.status === 401) {
        // Clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('nocUser');
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const error = await response.json();
            errorMessage = error.error?.message || error.message || errorMessage;
        } catch (e) {
            // Response was not JSON
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
};

// Officer Service
const officerService = {
    // ==================== DASHBOARD ====================

    // Get DGO Dashboard
    getDGODashboard: async () => {
        const response = await apiRequest('/officer/dgo/dashboard');
        return handleResponse(response);
    },

    // Get SGWA Dashboard
    getSGWADashboard: async () => {
        const response = await apiRequest('/officer/sgwa/dashboard');
        return handleResponse(response);
    },

    // Get Enforcement Dashboard
    getEnforcementDashboard: async () => {
        const response = await apiRequest('/officer/enforcement/dashboard');
        return handleResponse(response);
    },

    // ==================== APPLICATIONS ====================

    // Get Applications (with filters)
    getApplications: async (filters = {}) => {
        const queryParams = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                queryParams.append(key, filters[key]);
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/officer/dgo/applications${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(endpoint);
        return handleResponse(response);
    },

    // Get Single Application Details
    getApplicationDetails: async (applicationId) => {
        const response = await apiRequest(`/officer/dgo/applications/${applicationId}`);
        return handleResponse(response);
    },

    // ==================== INSPECTIONS (STATEFUL MOCK) ====================

    // Helper to get or initialize mock inspections
    _getMockInspections: () => {
        const stored = localStorage.getItem('mock_inspections');
        if (stored) return JSON.parse(stored);

        // Initial Seed Data
        const seedData = [
            {
                inspectionId: 'insp-001',
                applicationNumber: 'RJ/CGWA/NOC/2026/001234',
                holderName: 'Rajesh Kumar Sharma',
                location: 'Sanganer, Jaipur',
                inspectionType: 'New NOC Verification',
                scheduledDate: new Date().toISOString().split('T')[0] + 'T10:00:00',
                status: 'SCHEDULED', // SCHEDULED, COMPLETED, OVERDUE
                priority: 'HIGH',
                address: 'Plot 45, Industrial Area, Sanganer, Jaipur',
                projectType: 'Industrial (Textile)',
                reportResult: null,
                reportRemarks: null
            },
            {
                inspectionId: 'insp-002',
                applicationNumber: 'RJ/CGWA/NOC/2026/01452',
                holderName: 'Hotel Blue Diamond',
                location: 'Ajmer Road, Jaipur',
                inspectionType: 'New NOC Verification',
                scheduledDate: new Date().toISOString().split('T')[0] + 'T14:00:00',
                status: 'SCHEDULED',
                priority: 'MEDIUM',
                address: 'Near 200ft Bypass, Ajmer Road, Jaipur',
                projectType: 'Infrastructure (Hotel)',
                reportResult: null,
                reportRemarks: null
            },
            {
                inspectionId: 'insp-003',
                applicationNumber: 'RJ/CGWA/NOC/2026/01111',
                holderName: 'Green Valley Gardens',
                location: 'Jhotwara, Jaipur',
                inspectionType: 'Compliance Check',
                scheduledDate: '2026-01-20T11:00:00',
                status: 'SCHEDULED',
                priority: 'LOW',
                address: 'Plot 12, Kalwar Road, Jhotwara',
                projectType: 'Infrastructure (Residential)',
                reportResult: null,
                reportRemarks: null
            },
            {
                inspectionId: 'insp-004',
                applicationNumber: 'RJ/CGWA/NOC/2026/00099',
                holderName: 'Apex Hospitals',
                location: 'Malviya Nagar, Jaipur',
                inspectionType: 'Renewal Verification',
                scheduledDate: '2026-01-17T09:30:00',
                status: 'SCHEDULED',
                priority: 'HIGH',
                address: 'Sector 5, Malviya Nagar, Jaipur',
                projectType: 'Infrastructure (Hospital)',
                reportResult: null,
                reportRemarks: null
            },
            {
                inspectionId: 'insp-005',
                applicationNumber: 'RJ/CGWA/NOC/2026/0098',
                holderName: 'Modern Tex Corp',
                location: 'Sitapura, Jaipur',
                inspectionType: 'New NOC Verification',
                scheduledDate: '2026-01-10T14:30:00',
                status: 'COMPLETED',
                priority: 'MEDIUM',
                address: 'Sitapura Ind. Area, Tonk Road',
                projectType: 'Industrial',
                reportResult: 'RECOMMENDED',
                reportRemarks: 'All documents verified on site.',
                submittedAt: '2026-01-10T16:45:00',
                locationMatch: true,
                landUseMatch: true,
                existingSources: 2,
                meterInstalled: true,
                rainwaterHarvesting: 'implemented',
                officerName: 'Vikram Singh',
                geoLocation: { lat: 26.7891, lng: 75.8231, accuracy: 15 }
            }
        ];

        localStorage.setItem('mock_inspections', JSON.stringify(seedData));
        return seedData;
    },

    // Get Inspection Dashboard Stats (Mock with persistence)
    getInspectionDashboard: async () => {
        try {
            // Try API first
            const response = await apiRequest('/officer/inspection/dashboard');
            return handleResponse(response);
            // throw new Error("Use Mock");
        } catch (e) {
            const inspections = officerService._getMockInspections();
            const today = new Date().toISOString().split('T')[0];

            const stats = {
                todayCount: inspections.filter(i => i.scheduledDate.startsWith(today) && i.status === 'SCHEDULED').length,
                pendingCount: inspections.filter(i => i.status === 'SCHEDULED').length,
                completedMonth: inspections.filter(i => i.status === 'COMPLETED').length,
                overdueCount: inspections.filter(i => {
                    const d = new Date(i.scheduledDate);
                    const now = new Date();
                    return i.status === 'SCHEDULED' && d < now && !i.scheduledDate.startsWith(today);
                }).length
            };

            return { success: true, data: { stats } };
        }
    },

    // Get My Assigned Inspections (Mock with persistence)
    getMyInspections: async (filters = {}) => {
        try {
            // const response = await apiRequest('/officer/inspection/my-inspections');
            // return handleResponse(response);
            throw new Error("Use Mock");
        } catch (e) {
            let inspections = officerService._getMockInspections();

            // Apply Date Filter if present
            if (filters.date) {
                inspections = inspections.filter(i => i.scheduledDate.startsWith(filters.date));
            }

            // Apply Status Filter
            if (filters.status) {
                inspections = inspections.filter(i => i.status === filters.status);
            }

            // Sort by Date
            inspections.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

            return { success: true, data: { inspections } };
        }
    },

    // Get Inspection Details (Mock with persistence)
    getInspectionDetails: async (inspectionId) => {
        try {
            // const response = await apiRequest(`/officer/inspection/${inspectionId}/details`);
            // return handleResponse(response);
            throw new Error("Use Mock");
        } catch (e) {
            const inspections = officerService._getMockInspections();
            const item = inspections.find(i => i.inspectionId === inspectionId);

            if (item) {
                return {
                    success: true,
                    data: {
                        appId: item.applicationNumber,
                        applicantName: item.holderName,
                        projectType: item.projectType,
                        address: item.address,
                        coordinates: { lat: 26.9124, lng: 75.7873 }, // Default for now
                        waterSource: 'Borewell',
                        proposedExtraction: '150 m³/day'
                    }
                };
            }
            return { success: false, message: 'Inspection not found' };
        }
    },

    // Submit Inspection Report (Updates Mock State)
    submitInspectionReport: async (inspectionId, reportData) => {
        try {
            // const response = await apiRequest(...)
            // return handleResponse(response);
            throw new Error("Use Mock");
        } catch (e) {
            const inspections = officerService._getMockInspections();
            const index = inspections.findIndex(i => i.inspectionId === inspectionId);

            if (index !== -1) {
                // Update the record
                inspections[index] = {
                    ...inspections[index],
                    status: 'COMPLETED',
                    reportResult: reportData.recommendation,
                    reportRemarks: reportData.remarks,
                    submittedAt: new Date().toISOString(),
                    ...reportData // Spread all form data
                };

                // Save back to storage
                localStorage.setItem('mock_inspections', JSON.stringify(inspections));
                return { success: true, message: 'Report submitted successfully' };
            }
            return { success: false, message: 'Inspection not found' };
        }
    },

    // Get Inspection Report (Mock with persistence)
    getInspectionReport: async (inspectionId) => {
        try {
            // const response = await apiRequest(...)
            throw new Error("Use Mock");
        } catch (e) {
            const inspections = officerService._getMockInspections();
            const item = inspections.find(i => i.inspectionId === inspectionId);

            if (item && item.status === 'COMPLETED') {
                return { success: true, data: item };
            }
            return { success: false, message: 'Report not found' };
        }
    },

    // Start Inspection (Mock no-op)
    startInspection: async (inspectionId, locationData) => {
        return { success: true };
    },

    // Schedule Site Inspection (DGO Action - for reference, keeping original)
    scheduleInspection: async (applicationId, inspectionData) => {
        const response = await apiRequest(
            `/officer/dgo/applications/${applicationId}/schedule-inspection`,
            {
                method: 'POST',
                body: JSON.stringify(inspectionData)
            }
        );
        return handleResponse(response);
    },

    // ==================== APPROVALS & ACTIONS ====================

    // Forward to SGWA with Recommendation
    forwardToSGWA: async (applicationId, recommendationData) => {
        const response = await apiRequest(
            `/officer/dgo/applications/${applicationId}/forward`,
            {
                method: 'POST',
                body: JSON.stringify(recommendationData)
            }
        );
        return handleResponse(response);
    },

    // Reject Application (DGO Level)
    rejectApplication: async (applicationId, rejectionData) => {
        const response = await apiRequest(
            `/officer/dgo/applications/${applicationId}/reject`,
            {
                method: 'POST',
                body: JSON.stringify(rejectionData)
            }
        );
        return handleResponse(response);
    },

    // Raise Query to Applicant
    raiseQuery: async (applicationId, queryData) => {
        const response = await apiRequest(
            `/officer/dgo/applications/${applicationId}/query`,
            {
                method: 'POST',
                body: JSON.stringify(queryData)
            }
        );
        return handleResponse(response);
    },

    // ==================== SGWA SPECIFIC ====================

    // Approve Application and Issue NOC (SGWA)
    approveApplication: async (applicationId, approvalData) => {
        const response = await apiRequest(
            `/officer/sgwa/applications/${applicationId}/approve`,
            {
                method: 'POST',
                body: JSON.stringify(approvalData)
            }
        );
        return handleResponse(response);
    },

    // Reject Application (SGWA)
    sgwaRejectApplication: async (applicationId, rejectionData) => {
        const response = await apiRequest(
            `/officer/sgwa/applications/${applicationId}/reject`,
            {
                method: 'POST',
                body: JSON.stringify(rejectionData)
            }
        );
        return handleResponse(response);
    },

    // Assign Application to Officer
    assignApplication: async (applicationId, assignmentData) => {
        const response = await apiRequest(
            `/officer/sgwa/applications/${applicationId}/assign`,
            {
                method: 'POST',
                body: JSON.stringify(assignmentData)
            }
        );
        return handleResponse(response);
    },

    // ==================== QUERIES ====================

    // Get All Queries
    getQueries: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        const queryString = queryParams.toString();
        const endpoint = `/officer/dgo/queries${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(endpoint);
        return handleResponse(response);
    },

    // Get Query Details
    getQueryDetails: async (queryId) => {
        const response = await apiRequest(`/officer/dgo/queries/${queryId}`);
        return handleResponse(response);
    },

    // Accept Query Response
    acceptQueryResponse: async (queryId, acceptanceData) => {
        const response = await apiRequest(
            `/officer/dgo/queries/${queryId}/accept`,
            {
                method: 'POST',
                body: JSON.stringify(acceptanceData)
            }
        );
        return handleResponse(response);
    },

    // Reject Query Response
    rejectQueryResponse: async (queryId, rejectionData) => {
        const response = await apiRequest(
            `/officer/dgo/queries/${queryId}/reject`,
            {
                method: 'POST',
                body: JSON.stringify(rejectionData)
            }
        );
        return handleResponse(response);
    },

    // ==================== DOCUMENTS ====================

    // Upload Document
    uploadDocument: async (formData) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/officer/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // multipart/form-data
        });
        return handleResponse(response);
    },

    // Download Document
    downloadDocument: async (documentId) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/officer/documents/${documentId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download document');
        }

        return response.blob();
    },

    // View Document
    getDocumentUrl: (documentId) => {
        const token = getAuthToken();
        return `${API_BASE_URL}/officer/documents/${documentId}/view?token=${token}`;
    },

    // ==================== NOTIFICATIONS ====================

    // Get Notifications
    getNotifications: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        const queryString = queryParams.toString();
        const endpoint = `/officer/notifications${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(endpoint);
        return handleResponse(response);
    },

    // Mark Notification as Read
    markNotificationRead: async (notificationId) => {
        const response = await apiRequest(
            `/officer/notifications/${notificationId}/read`,
            { method: 'PUT' }
        );
        return handleResponse(response);
    },

    // Mark All Notifications as Read
    markAllNotificationsRead: async () => {
        const response = await apiRequest(
            '/officer/notifications/mark-all-read',
            { method: 'PUT' }
        );
        return handleResponse(response);
    },

    // ==================== REPORTS ====================

    // Generate Report
    generateReport: async (reportData) => {
        const response = await apiRequest(
            '/officer/dgo/reports/generate',
            {
                method: 'POST',
                body: JSON.stringify(reportData)
            }
        );
        return handleResponse(response);
    },

    // Get Compliance Report
    getComplianceReport: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        const queryString = queryParams.toString();
        const endpoint = `/officer/dgo/compliance-report${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(endpoint);
        return handleResponse(response);
    },

    // ==================== PROFILE ====================

    // Get Officer Profile
    getProfile: async () => {
        const response = await apiRequest('/officer/profile');
        return handleResponse(response);
    },

    // Update Profile
    updateProfile: async (profileData) => {
        const response = await apiRequest(
            '/officer/profile',
            {
                method: 'PUT',
                body: JSON.stringify(profileData)
            }
        );
        return handleResponse(response);
    },

    // Change Password
    changePassword: async (passwordData) => {
        const response = await apiRequest(
            '/officer/change-password',
            {
                method: 'POST',
                body: JSON.stringify(passwordData)
            }
        );
        return handleResponse(response);
    },

    // ==================== ACTIVITY LOG ====================

    // Get Activity Log
    getActivityLog: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters);
        const queryString = queryParams.toString();
        const endpoint = `/officer/activity-log${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(endpoint);
        return handleResponse(response);
    },

    // ==================== MASTER DATA ====================

    // Get Districts
    getDistricts: async () => {
        const response = await apiRequest('/officer/master-data/districts');
        return handleResponse(response);
    },

    // Get Blocks by District
    getBlocks: async (districtId) => {
        const response = await apiRequest(`/officer/master-data/blocks?districtId=${districtId}`);
        return handleResponse(response);
    },

    // Get Rejection Reasons
    getRejectionReasons: async () => {
        const response = await apiRequest('/officer/master-data/rejection-reasons');
        return handleResponse(response);
    }
};

export default officerService;
