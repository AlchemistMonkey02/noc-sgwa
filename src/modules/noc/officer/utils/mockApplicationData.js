// Mock Application Data for Officer Portal

export const mockApplications = [
    {
        id: 'NOC2024001',
        applicationType: 'Fresh NOC',
        category: 'Industry',
        industryType: 'Manufacturing',
        applicantName: 'Rajesh Kumar',
        companyName: 'ABC Industries Pvt Ltd',
        email: 'rajesh.kumar@abcindustries.com',
        phone: '+91 9876543210',
        projectName: 'Industrial Water Supply - Manufacturing Unit',
        location: 'Plot No. 45, GIDC Estate, Ankleshwar, Gujarat',
        district: 'Bharuch',
        state: 'Gujarat',
        withdrawalQuantity: 150, // KLD
        submittedDate: '2024-12-15T10:30:00',
        lastUpdated: '2024-12-15T10:30:00',
        status: 'Pending Review',
        priority: 'Normal',
        assignedTo: null,
        documents: [
            { name: 'Application Form', uploaded: true, verified: false },
            { name: 'Proof of Ownership', uploaded: true, verified: false },
            { name: 'Water Use Plan', uploaded: true, verified: false },
            { name: 'SPCB Consent', uploaded: true, verified: false },
            { name: 'Hydrogeological Report', uploaded: true, verified: false },
            { name: 'Recharge Plan', uploaded: true, verified: false },
            { name: 'Groundwater Quality Report', uploaded: true, verified: false }
        ],
        reviewComments: [],
        approvalHistory: [
            {
                action: 'Submitted',
                by: 'Applicant',
                date: '2024-12-15T10:30:00',
                comments: 'Initial application submission'
            }
        ]
    },
    {
        id: 'NOC2024002',
        applicationType: 'NOC Renewal',
        category: 'Infrastructure',
        industryType: 'Hotel',
        applicantName: 'Priya Sharma',
        companyName: 'Grand Hotel & Resorts',
        email: 'priya.sharma@grandhotel.com',
        phone: '+91 9123456789',
        projectName: 'Hotel Water Requirement Renewal',
        location: 'MG Road, Sector 15, Gurgaon, Haryana',
        district: 'Gurgaon',
        state: 'Haryana',
        withdrawalQuantity: 75, // KLD
        submittedDate: '2024-11-20T14:15:00',
        lastUpdated: '2024-12-10T09:45:00',
        status: 'Under Review',
        priority: 'Normal',
        assignedTo: 'Dr. Amit Verma',
        documents: [
            { name: 'Renewal Application', uploaded: true, verified: true },
            { name: 'Previous NOC Copy', uploaded: true, verified: true },
            { name: 'Water Audit Report', uploaded: true, verified: true },
            { name: 'STP Compliance Certificate', uploaded: true, verified: false },
            { name: 'Updated Recharge Plan', uploaded: true, verified: false }
        ],
        reviewComments: [
            {
                by: 'Dr. Amit Verma',
                date: '2024-12-10T09:45:00',
                comment: 'STP compliance certificate needs verification from field inspection team.'
            }
        ],
        approvalHistory: [
            {
                action: 'Submitted',
                by: 'Applicant',
                date: '2024-11-20T14:15:00',
                comments: 'NOC renewal application submitted'
            },
            {
                action: 'Assigned for Review',
                by: 'System',
                date: '2024-11-21T10:00:00',
                comments: 'Assigned to Dr. Amit Verma for technical review'
            },
            {
                action: 'Under Review',
                by: 'Dr. Amit Verma',
                date: '2024-12-10T09:45:00',
                comments: 'Started detailed technical review'
            }
        ]
    },
    {
        id: 'NOC2024003',
        applicationType: 'Fresh NOC',
        category: 'Mining',
        industryType: 'Limestone Mining',
        applicantName: 'Suresh Patel',
        companyName: 'Patel Mining Corporation',
        email: 'suresh@patelmining.com',
        phone: '+91 9988776655',
        projectName: 'Limestone Mining - Dewatering Requirement',
        location: 'Village Kakadiya, Mehsana District, Gujarat',
        district: 'Mehsana',
        state: 'Gujarat',
        withdrawalQuantity: 45, // KLD
        submittedDate: '2024-12-01T11:00:00',
        lastUpdated: '2024-12-20T15:30:00',
        status: 'Approved',
        priority: 'Normal',
        assignedTo: 'Dr. Sneha Reddy',
        nocNumber: 'CGWA/GUJ/2024/001234',
        validityPeriod: '2 years',
        approvalDate: '2024-12-20T15:30:00',
        documents: [
            { name: 'Mining Plan', uploaded: true, verified: true },
            { name: 'Environmental Clearance', uploaded: true, verified: true },
            { name: 'Geo-tagged Mine Lease Map', uploaded: true, verified: true },
            { name: 'Groundwater Impact Assessment', uploaded: true, verified: true },
            { name: 'Dewatering Plan', uploaded: true, verified: true },
            { name: 'Monitoring Network Proposal', uploaded: true, verified: true }
        ],
        reviewComments: [
            {
                by: 'Dr. Sneha Reddy',
                date: '2024-12-18T10:20:00',
                comment: 'All technical documents are in order. Groundwater impact assessment is comprehensive.'
            }
        ],
        approvalHistory: [
            {
                action: 'Submitted',
                by: 'Applicant',
                date: '2024-12-01T11:00:00',
                comments: 'Initial application submission'
            },
            {
                action: 'Assigned for Review',
                by: 'System',
                date: '2024-12-02T09:00:00',
                comments: 'Assigned to Dr. Sneha Reddy for technical review'
            },
            {
                action: 'Documents Verified',
                by: 'Dr. Sneha Reddy',
                date: '2024-12-18T10:20:00',
                comments: 'All documents verified and found satisfactory'
            },
            {
                action: 'Approved',
                by: 'Dr. Sneha Reddy',
                date: '2024-12-20T15:30:00',
                comments: 'NOC approved with validity of 2 years. Conditions: Monthly monitoring reports required.'
            }
        ]
    },
    {
        id: 'NOC2024004',
        applicationType: 'Fresh NOC',
        category: 'Infrastructure',
        industryType: 'Residential Complex',
        applicantName: 'Vikram Singh',
        companyName: 'Green Valley Developers',
        email: 'vikram@greenvalley.com',
        phone: '+91 9765432100',
        projectName: 'Residential Township - Water Supply',
        location: 'NH-8, Sohna Road, Gurgaon, Haryana',
        district: 'Gurgaon',
        state: 'Haryana',
        withdrawalQuantity: 200, // KLD
        submittedDate: '2024-12-18T16:45:00',
        lastUpdated: '2024-12-22T11:20:00',
        status: 'Clarification Required',
        priority: 'High',
        assignedTo: 'Dr. Amit Verma',
        documents: [
            { name: 'Building Plan Approval', uploaded: true, verified: true },
            { name: 'Water Requirement Calculation', uploaded: true, verified: false },
            { name: 'STP Design', uploaded: true, verified: false },
            { name: 'Rainwater Harvesting Plan', uploaded: true, verified: true },
            { name: 'Non-Availability Certificate', uploaded: false, verified: false }
        ],
        reviewComments: [
            {
                by: 'Dr. Amit Verma',
                date: '2024-12-22T11:20:00',
                comment: 'Water requirement calculation needs revision as per CPHEEO norms. Non-availability certificate from GMDA is mandatory for this location.'
            }
        ],
        clarificationRequired: [
            'Revise water requirement calculation as per CPHEEO norms',
            'Submit Non-Availability Certificate from Gurgaon Metropolitan Development Authority',
            'Provide detailed recycling percentage commitment'
        ],
        approvalHistory: [
            {
                action: 'Submitted',
                by: 'Applicant',
                date: '2024-12-18T16:45:00',
                comments: 'Initial application submission'
            },
            {
                action: 'Assigned for Review',
                by: 'System',
                date: '2024-12-19T09:00:00',
                comments: 'Assigned to Dr. Amit Verma for review'
            },
            {
                action: 'Clarification Required',
                by: 'Dr. Amit Verma',
                date: '2024-12-22T11:20:00',
                comments: 'Additional documents and revisions required before approval'
            }
        ]
    },
    {
        id: 'NOC2024005',
        applicationType: 'Fresh NOC',
        category: 'Industry',
        industryType: 'Textile',
        applicantName: 'Meena Gupta',
        companyName: 'Sunrise Textiles Ltd',
        email: 'meena@sunrisetextiles.com',
        phone: '+91 9012345678',
        projectName: 'Textile Processing Unit',
        location: 'Industrial Area Phase-III, Ludhiana, Punjab',
        district: 'Ludhiana',
        state: 'Punjab',
        withdrawalQuantity: 85, // KLD
        submittedDate: '2024-12-05T13:30:00',
        lastUpdated: '2024-12-12T14:15:00',
        status: 'Rejected',
        priority: 'Normal',
        assignedTo: 'Dr. Rajesh Kumar',
        documents: [
            { name: 'Application Form', uploaded: true, verified: true },
            { name: 'Proof of Ownership', uploaded: true, verified: true },
            { name: 'SPCB Consent', uploaded: true, verified: true },
            { name: 'Hydrogeological Report', uploaded: true, verified: false },
            { name: 'Recharge Plan', uploaded: true, verified: false }
        ],
        reviewComments: [
            {
                by: 'Dr. Rajesh Kumar',
                date: '2024-12-12T14:15:00',
                comment: 'Area falls under over-exploited category. Hydrogeological report does not demonstrate adequate recharge measures. Recharge plan is insufficient for the proposed extraction quantity.'
            }
        ],
        rejectionReason: 'Location is in over-exploited groundwater assessment unit. Proposed recharge measures are inadequate (only 50% of extraction). As per CGWA guidelines, recharge should be at least 2x extraction in over-exploited areas.',
        approvalHistory: [
            {
                action: 'Submitted',
                by: 'Applicant',
                date: '2024-12-05T13:30:00',
                comments: 'Initial application submission'
            },
            {
                action: 'Assigned for Review',
                by: 'System',
                date: '2024-12-06T09:00:00',
                comments: 'Assigned to Dr. Rajesh Kumar for technical review'
            },
            {
                action: 'Rejected',
                by: 'Dr. Rajesh Kumar',
                date: '2024-12-12T14:15:00',
                comments: 'Application rejected due to inadequate recharge measures in over-exploited area'
            }
        ]
    }
];

export const mockOfficers = [
    {
        id: 'OFF001',
        name: 'Dr. Amit Verma',
        employeeId: 'CGWA2023001',
        email: 'amit.verma@cgwa.gov.in',
        role: 'Senior Officer',
        specialization: 'Infrastructure Projects',
        password: 'officer123' // Demo only - never store passwords in plain text in production
    },
    {
        id: 'OFF002',
        name: 'Dr. Sneha Reddy',
        employeeId: 'CGWA2023002',
        email: 'sneha.reddy@cgwa.gov.in',
        role: 'Officer',
        specialization: 'Mining Projects',
        password: 'officer123'
    },
    {
        id: 'OFF003',
        name: 'Dr. Rajesh Kumar',
        employeeId: 'CGWA2023003',
        email: 'rajesh.kumar@cgwa.gov.in',
        role: 'Officer',
        specialization: 'Industrial Projects',
        password: 'officer123'
    },
    {
        id: 'OFF004',
        name: 'Ms. Kavita Sharma',
        employeeId: 'CGWA2022001',
        email: 'kavita.sharma@cgwa.gov.in',
        role: 'Admin',
        specialization: 'All Categories',
        password: 'admin123'
    }
];

// Helper function to get applications by status
export const getApplicationsByStatus = (status) => {
    if (status === 'All') return mockApplications;
    return mockApplications.filter(app => app.status === status);
};

// Helper function to get application by ID
export const getApplicationById = (id) => {
    return mockApplications.find(app => app.id === id);
};

// Helper function to get officer stats
export const getOfficerStats = () => {
    return {
        totalApplications: mockApplications.length,
        pending: mockApplications.filter(app => app.status === 'Pending Review').length,
        underReview: mockApplications.filter(app => app.status === 'Under Review').length,
        approved: mockApplications.filter(app => app.status === 'Approved').length,
        rejected: mockApplications.filter(app => app.status === 'Rejected').length,
        clarificationRequired: mockApplications.filter(app => app.status === 'Clarification Required').length,
        avgProcessingTime: '12 days' // Mock data
    };
};
