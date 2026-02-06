import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';
import PublicHeader from '../public/components/PublicHeader';

// DUMMY DATA - Comprehensive sample queries showing all details
const DUMMY_QUERIES = [
    {
        queryId: 'QRY-2026-001',
        applicationId: 'NOC-2026-DL-001234',
        applicationNumber: 'NOC/DL/2026/001234',
        subject: 'Clarification Required on Water Extraction Volume',
        message: 'The proposed water extraction volume of 500 cubic meters per day appears inconsistent with the area of cultivation mentioned in your application. Please provide detailed calculations showing how this volume was derived, including crop water requirements, irrigation efficiency, and any other relevant factors. Also submit hydrogeological report justifying the proposed extraction rate.',
        status: 'OPEN',
        raisedBy: 'Dr. Rajesh Kumar (Senior Hydrogeologist)',
        createdAt: '2026-01-08T10:30:00Z',
        category: 'Technical',
        priority: 'High',
        userResponse: null
    },
    {
        queryId: 'QRY-2026-002',
        applicationId: 'NOC-2026-DL-001234',
        applicationNumber: 'NOC/DL/2026/001234',
        subject: 'Missing Environmental Clearance Certificate',
        message: 'Your application mentions that an Environmental Impact Assessment was conducted, but the Environmental Clearance Certificate from the State Pollution Control Board is not attached. This is a mandatory requirement for industrial water extraction exceeding 100 cubic meters per day. Please upload the valid EC certificate along with all annexures.',
        status: 'OPEN',
        raisedBy: 'Ms. Priya Sharma (Environmental Officer)',
        createdAt: '2026-01-09T14:15:00Z',
        category: 'Documentation',
        priority: 'Critical',
        userResponse: null
    },
    {
        queryId: 'QRY-2026-003',
        applicationId: 'NOC-2026-DL-001235',
        applicationNumber: 'NOC/DL/2026/001235',
        subject: 'Land Ownership Documentation Verification',
        message: 'The land ownership documents submitted show the property registered in the name of "ABC Industries Pvt. Ltd." However, the applicant name in the NOC application is "ABC Manufacturing Co." Please clarify this discrepancy and submit relevant documents proving the relationship between these entities (such as incorporation certificate, partnership deed, or authorization letter).',
        status: 'RESPONDED',
        raisedBy: 'Mr. Anil Verma (Documentation Officer)',
        createdAt: '2026-01-05T09:00:00Z',
        category: 'Legal',
        priority: 'Medium',
        userResponse: {
            response: 'ABC Industries Pvt. Ltd. is the parent company of ABC Manufacturing Co. We are submitting the following documents: 1) Certificate of Incorporation showing ABC Manufacturing Co. as a wholly-owned subsidiary, 2) Board Resolution authorizing the groundwater extraction, and 3) Notarized declaration from the Managing Director. Please find all documents attached.',
            documentUrl: 'https://example.com/documents/land-ownership-clarification.pdf',
            documentName: 'land-ownership-clarification.pdf',
            submittedAt: '2026-01-07T11:30:00Z'
        }
    },
    {
        queryId: 'QRY-2026-004',
        applicationId: 'NOC-2026-DL-001236',
        applicationNumber: 'NOC/DL/2026/001236',
        subject: 'Pump Specifications and Water Meter Installation',
        message: 'Please provide complete specifications of the proposed submersible pump including make, model, horsepower, and discharge capacity. Additionally, confirm the installation of a water flow meter as per CGWA guidelines and submit an undertaking that the meter will be maintained and calibrated annually.',
        status: 'RESOLVED',
        raisedBy: 'Er. Sunil Patel (Technical Officer)',
        createdAt: '2026-01-02T13:45:00Z',
        category: 'Technical',
        priority: 'Medium',
        resolvedAt: '2026-01-06T16:20:00Z',
        userResponse: {
            response: 'We are installing a Kirloskar KS8 submersible pump (5 HP, discharge capacity 550 LPM). We confirm that a digital water flow meter (Make: Neptune, Model: T10) will be installed at the wellhead. We hereby submit an undertaking for annual calibration. Complete pump specifications and meter installation plan are attached.',
            documentUrl: 'https://example.com/documents/pump-and-meter-details.pdf',
            documentName: 'pump-specifications-and-meter-undertaking.pdf',
            submittedAt: '2026-01-04T10:00:00Z'
        },
        officerRemarks: 'Documents verified. Pump specifications and water meter installation plan are satisfactory. Query resolved.'
    },
    {
        queryId: 'QRY-2026-005',
        applicationId: 'NOC-2026-DL-001237',
        applicationNumber: 'NOC/DL/2026/001237',
        subject: 'Water Conservation and Rainwater Harvesting Plans',
        message: 'As per the latest CGWA guidelines, all industrial and commercial establishments must implement rainwater harvesting structures. Your application does not mention any such provisions. Please submit: 1) Detailed rainwater harvesting plan with technical drawings, 2) Estimation of water to be recharged annually, and 3) Timeline for implementation.',
        status: 'RESPONDED',
        raisedBy: 'Ms. Neeta Singh (Conservation Officer)',
        createdAt: '2026-01-10T08:30:00Z',
        category: 'Environmental',
        priority: 'High',
        userResponse: {
            response: 'We have designed a comprehensive rainwater harvesting system including rooftop collection, recharge wells, and percolation pits. The estimated recharge capacity is 15,000 cubic meters annually. Implementation will be completed in 3 months. Complete architectural and engineering drawings are attached for your review.',
            documentUrl: 'https://example.com/documents/rainwater-harvesting-plan.pdf',
            documentName: 'rainwater-harvesting-comprehensive-plan.pdf',
            submittedAt: '2026-01-11T12:00:00Z'
        }
    },
    {
        queryId: 'QRY-2025-098',
        applicationId: 'NOC-2025-DL-009876',
        applicationNumber: 'NOC/DL/2025/009876',
        subject: 'Aquifer Data and Geological Survey Report',
        message: 'The hydrogeological report submitted lacks detailed information about the aquifer characteristics in your area. Please provide: 1) Lithology log showing different geological formations, 2) Water table depth and seasonal variations, 3) Aquifer thickness and transmissivity values, and 4) Chemical analysis of groundwater showing TDS, pH, and other parameters.',
        status: 'RESOLVED',
        raisedBy: 'Dr. Meena Krishnan (Hydrogeologist)',
        createdAt: '2025-12-28T11:00:00Z',
        category: 'Technical',
        priority: 'High',
        resolvedAt: '2026-01-09T14:30:00Z',
        userResponse: {
            response: 'We engaged a CGWA-approved hydrogeologist who conducted detailed geological surveys. The comprehensive report includes borehole lithology up to 150m depth, water table monitoring data for the past 3 years, pump test analysis with transmissivity calculations, and water quality test results from NABL-accredited laboratory. All reports are attached.',
            documentUrl: 'https://example.com/documents/detailed-hydrogeological-survey.pdf',
            documentName: 'comprehensive-aquifer-study-report.pdf',
            submittedAt: '2026-01-03T15:45:00Z'
        },
        officerRemarks: 'Comprehensive hydrogeological data provided. Aquifer parameters are within acceptable limits for the proposed extraction. Query resolved and application forwarded for final approval.'
    },
    {
        queryId: 'QRY-2026-006',
        applicationId: 'NOC-2026-DL-001238',
        applicationNumber: 'NOC/DL/2026/001238',
        subject: 'Borewell Construction Details and Compliance',
        message: 'The borewell construction details are incomplete. Please provide: 1) Exact coordinates (GPS) of the borewell location, 2) Details of the licensed driller who constructed the well, 3) Borewell completion report with casing and screen details, 4) Photograph of the wellhead showing the well number and depth marker.',
        status: 'OPEN',
        raisedBy: 'Mr. Vikram Reddy (Field Inspector)',
        createdAt: '2026-01-11T09:15:00Z',
        category: 'Compliance',
        priority: 'Medium',
        userResponse: null
    }
];

const NOCQueries = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved'
    const [loading, setLoading] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);

    // Reply state
    const [replyText, setReplyText] = useState({});
    const [uploadingFile, setUploadingFile] = useState({});
    const [submittingReply, setSubmittingReply] = useState({});

    // Filter queries based on selected filter
    const getFilteredQueries = () => {
        if (filter === 'pending') {
            return DUMMY_QUERIES.filter(q => q.status === 'OPEN');
        } else if (filter === 'resolved') {
            return DUMMY_QUERIES.filter(q => q.status === 'RESOLVED');
        }
        return DUMMY_QUERIES;
    };

    const queries = getFilteredQueries();
    const pendingCount = DUMMY_QUERIES.filter(q => q.status === 'OPEN').length;

    const handleReplyChange = (queryId, text) => {
        setReplyText(prev => ({ ...prev, [queryId]: text }));
    };

    const handleFileUpload = (queryId, file) => {
        setUploadingFile(prev => ({ ...prev, [queryId]: file }));
    };

    const handleSubmitReply = (queryId) => {
        const text = replyText[queryId];
        const file = uploadingFile[queryId];

        if (!text || text.trim() === '') {
            alert('Please enter a response');
            return;
        }

        setSubmittingReply(prev => ({ ...prev, [queryId]: true }));

        // Simulate API call
        setTimeout(() => {
            alert(`Reply submitted successfully!\n\nResponse: ${text}\n${file ? `Document: ${file.name}` : 'No document attached'}`);
            setReplyText(prev => ({ ...prev, [queryId]: '' }));
            setUploadingFile(prev => ({ ...prev, [queryId]: null }));
            setSubmittingReply(prev => ({ ...prev, [queryId]: false }));
        }, 1500);
    };

    const handleViewDetails = (queryId) => {
        const query = DUMMY_QUERIES.find(q => q.queryId === queryId);
        setSelectedQuery(query);
        alert(`Query Details:\n\nID: ${query.queryId}\nSubject: ${query.subject}\nStatus: ${query.status}\nCategory: ${query.category}\nPriority: ${query.priority}\n\n${query.officerRemarks ? `Officer Remarks: ${query.officerRemarks}` : ''}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN':
                return <span className="status-badge danger">Pending Reply</span>;
            case 'RESPONDED':
                return <span className="status-badge warning">Under Review</span>;
            case 'RESOLVED':
                return <span className="status-badge success">Resolved</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            'Critical': '#dc2626',
            'High': '#ea580c',
            'Medium': '#ca8a04',
            'Low': '#65a30d'
        };
        return (
            <span style={{
                background: colors[priority] || '#6b7280',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}>
                {priority}
            </span>
        );
    };

    const renderQueryItem = (query) => {
        const isPending = query.status === 'OPEN';
        const currentReply = replyText[query.queryId] || '';
        const currentFile = uploadingFile[query.queryId];
        const isSubmitting = submittingReply[query.queryId];

        return (
            <div
                key={query.queryId}
                style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    background: isPending ? '#ffffff' : '#f8fafc'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>{query.subject}</h3>
                            {getPriorityBadge(query.priority)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                <strong>Query ID:</strong> <span className="text-blue">{query.queryId}</span>
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                <strong>Application:</strong> <span className="text-blue">{query.applicationNumber}</span>
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                <strong>Category:</strong> {query.category}
                            </span>
                            {query.raisedBy && (
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    <strong>Raised By:</strong> {query.raisedBy}
                                </span>
                            )}
                        </div>
                    </div>
                    {getStatusBadge(query.status)}
                </div>

                <div
                    style={{
                        background: isPending ? '#fef2f2' : '#f0f9ff',
                        padding: '1rem',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${isPending ? '#ef4444' : '#3b82f6'}`,
                        marginBottom: '1rem'
                    }}
                >
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold', color: isPending ? '#991b1b' : '#1e40af' }}>
                        Officer's Query:
                    </p>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: isPending ? '#7f1d1d' : '#1e3a8a', lineHeight: '1.6' }}>
                        {query.message}
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span>
                            <strong>Raised On:</strong> {new Date(query.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>

                {/* Show existing response if already replied */}
                {query.userResponse && (
                    <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#065f46' }}>
                            Your Response:
                        </p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#047857', lineHeight: '1.6' }}>
                            {query.userResponse.response}
                        </p>
                        {query.userResponse.documentUrl && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#dcfce7', borderRadius: '6px' }}>
                                <a
                                    href={query.userResponse.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue"
                                    style={{ fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>📎</span>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Attached Document</div>
                                        <div style={{ fontSize: '0.85rem', color: '#16a34a' }}>{query.userResponse.documentName}</div>
                                    </div>
                                </a>
                            </div>
                        )}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#064e3b' }}>
                            <strong>Submitted On:</strong> {new Date(query.userResponse.submittedAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                )}

                {/* Show officer remarks for resolved queries */}
                {query.status === 'RESOLVED' && query.officerRemarks && (
                    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e40af' }}>
                            Officer's Remarks:
                        </p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.6' }}>
                            {query.officerRemarks}
                        </p>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#1e40af' }}>
                            <strong>Resolved On:</strong> {new Date(query.resolvedAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                )}

                {/* Reply form for pending queries */}
                {isPending && (
                    <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde047' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#854d0e' }}>
                            ⚠️ Action Required - Submit Your Response
                        </h4>
                        <textarea
                            className="bhuneer-input"
                            rows="5"
                            placeholder="Provide a detailed response addressing all points raised by the officer. Be specific and include relevant technical details, calculations, or explanations as needed..."
                            value={currentReply}
                            onChange={(e) => handleReplyChange(query.queryId, e.target.value)}
                            style={{ width: '100%', marginBottom: '1rem' }}
                        />

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="bhuneer-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Upload Supporting Documents (Optional)
                            </label>
                            <div className="file-upload-input-group">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            handleFileUpload(query.queryId, e.target.files[0]);
                                        }
                                    }}
                                    style={{ padding: '0.75rem', width: '100%' }}
                                />
                            </div>
                            {currentFile && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#dbeafe', borderRadius: '4px' }}>
                                    <small className="text-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>✅</span>
                                        <strong>Selected:</strong> {currentFile.name} ({(currentFile.size / 1024).toFixed(2)} KB)
                                    </small>
                                </div>
                            )}
                            <small className="text-gray" style={{ display: 'block', marginTop: '0.5rem' }}>
                                Supported formats: PDF, JPG, PNG, DOC, DOCX. Maximum size: 5MB
                            </small>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                                className="bhuneer-secondary-btn"
                                onClick={() => {
                                    setReplyText(prev => ({ ...prev, [query.queryId]: '' }));
                                    setUploadingFile(prev => ({ ...prev, [query.queryId]: null }));
                                }}
                                style={{ padding: '0.75rem 1.5rem' }}
                            >
                                Clear Form
                            </button>
                            <button
                                className="bhuneer-submit-btn"
                                onClick={() => handleSubmitReply(query.queryId)}
                                disabled={isSubmitting || !currentReply.trim()}
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                {isSubmitting ? '⏳ Submitting...' : '📤 Submit Reply'}
                            </button>
                        </div>
                    </div>
                )}

                {/* View details button for non-pending queries */}
                {!isPending && (
                    <button
                        className="text-blue"
                        style={{
                            background: '#eff6ff',
                            border: '1px solid #93c5fd',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => handleViewDetails(query.queryId)}
                    >
                        📋 View Full Details
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <PublicHeader/>
            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Dashboard</Link>
                        <span className="separator">›</span>
                        <span className="current">Queries</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">📝 Evaluation Queries</h1>
                        <p className="page-subtitle">
                            View and respond to queries raised by CGWA officers during application evaluation
                        </p>
                    </div>

                    {/* Statistics Bar */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '0 2rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '2px solid #fca5a5'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }}>
                                {DUMMY_QUERIES.filter(q => q.status === 'OPEN').length}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#7f1d1d', fontWeight: 'bold' }}>
                                Pending Replies
                            </div>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '2px solid #fcd34d'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                                {DUMMY_QUERIES.filter(q => q.status === 'RESPONDED').length}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#78350f', fontWeight: 'bold' }}>
                                Under Review
                            </div>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '2px solid #6ee7b7'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>
                                {DUMMY_QUERIES.filter(q => q.status === 'RESOLVED').length}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#064e3b', fontWeight: 'bold' }}>
                                Resolved
                            </div>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '2px solid #93c5fd'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                                {DUMMY_QUERIES.length}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 'bold' }}>
                                Total Queries
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0 2rem' }}>
                        <button
                            className={filter === 'all' ? 'bhuneer-submit-btn' : 'bhuneer-secondary-btn'}
                            onClick={() => setFilter('all')}
                            style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}
                        >
                            📊 All Queries ({DUMMY_QUERIES.length})
                        </button>
                        <button
                            className={filter === 'pending' ? 'bhuneer-submit-btn' : 'bhuneer-secondary-btn'}
                            onClick={() => setFilter('pending')}
                            style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}
                        >
                            ⚠️ Pending ({DUMMY_QUERIES.filter(q => q.status === 'OPEN').length})
                        </button>
                        <button
                            className={filter === 'resolved' ? 'bhuneer-submit-btn' : 'bhuneer-secondary-btn'}
                            onClick={() => setFilter('resolved')}
                            style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold' }}
                        >
                            ✅ Resolved ({DUMMY_QUERIES.filter(q => q.status === 'RESOLVED').length})
                        </button>
                    </div>

                    <div style={{ padding: '0 2rem' }}>
                        <div className="dashboard-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div className="card-title-bar" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
                                <h2 className="card-main-title" style={{ color: 'white' }}>
                                    {filter === 'pending' ? '⚠️ Pending Queries - Action Required' :
                                        filter === 'resolved' ? '✅ Resolved Queries' :
                                            '📋 All Queries'}
                                </h2>
                                {pendingCount > 0 && filter !== 'resolved' && (
                                    <span style={{
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        marginLeft: '1rem'
                                    }}>
                                        🔔 {pendingCount} Urgent Action{pendingCount > 1 ? 's' : ''} Required
                                    </span>
                                )}
                            </div>

                            <div className="card-content-area" style={{ padding: '0' }}>
                                {loading ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        <div className="spinner" style={{
                                            margin: '0 auto 1rem',
                                            width: '50px',
                                            height: '50px',
                                            border: '5px solid #e5e7eb',
                                            borderTop: '5px solid #3b82f6',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        <p style={{ fontSize: '1.1rem' }}>Loading queries...</p>
                                    </div>
                                ) : queries.length === 0 ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📭</div>
                                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#1e293b' }}>
                                            No Queries Found
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {filter === 'pending'
                                                ? '🎉 Great! You have no pending queries at the moment.'
                                                : filter === 'resolved'
                                                    ? 'No resolved queries to display.'
                                                    : 'No queries have been raised for your applications yet.'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{
                                            padding: '1rem 1.5rem',
                                            background: '#f8fafc',
                                            borderBottom: '2px solid #e2e8f0',
                                            fontSize: '0.9rem',
                                            color: '#64748b',
                                            fontWeight: 'bold'
                                        }}>
                                            Showing {queries.length} {queries.length === 1 ? 'query' : 'queries'}
                                        </div>
                                        {queries.map(query => renderQueryItem(query))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div style={{ padding: '2rem', marginTop: '2rem' }}>
                        <div style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '2px solid #93c5fd'
                        }}>
                            <h3 style={{ margin: '0 0 1rem', color: '#1e40af', fontSize: '1.25rem' }}>
                                💡 Important Guidelines for Responding to Queries
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e3a8a', lineHeight: '1.8' }}>
                                <li><strong>Be Comprehensive:</strong> Address all points raised by the officer in detail</li>
                                <li><strong>Provide Evidence:</strong> Attach relevant documents, reports, or certificates to support your response</li>
                                <li><strong>Be Timely:</strong> Respond to pending queries within 7 days to avoid delays in application processing</li>
                                <li><strong>Use Technical Details:</strong> Include calculations, specifications, and technical data where applicable</li>
                                <li><strong>Professional Communication:</strong> Maintain formal and respectful language in all responses</li>
                                <li><strong>Document Quality:</strong> Ensure uploaded documents are clear, legible, and properly formatted (PDF preferred)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <NOCFooter />
        </div>
    );
};

export default NOCQueries;
