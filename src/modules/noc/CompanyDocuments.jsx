import React, { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/apiConfig';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import './styles/noc-portal.css';

const CompanyDocuments = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    // const [sidebarOpen, setSidebarOpen] = useState(false); // Removed manual sidebar state
    const [companyId, setCompanyId] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [viewerModal, setViewerModal] = useState({ isOpen: false, documentUrl: '', documentName: '' });

    // Animation Refs
    const statsRef = useRef(null);
    const docsRef = useRef(null);

    useEffect(() => {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('nd-visible');
                }
            });
        }, observerOptions);

        if (statsRef.current) observer.observe(statsRef.current);
        if (docsRef.current) observer.observe(docsRef.current);

        return () => observer.disconnect();
    }, [isLoading]);

    const documentTypes = [
        { type: 'GST_CERTIFICATE', label: 'GST Certificate', icon: '📄' },
        { type: 'PAN', label: 'PAN Card (comapny)', icon: ' 📄' },
        { type: 'INCORPORATION_CERTIFICATE', label: 'Incorporation Certificate', icon: '📄' },
        { type: 'ISO_CERTIFICATE', label: 'ISO Certificate', icon: '📄' }
    ];

    // Fetch company ID and documents on mount
    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const userStr = localStorage.getItem('nocUser');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    console.log('User data from localStorage:', user);
                    if (user.companyId) {
                        console.log('Company ID found:', user.companyId);
                        setCompanyId(user.companyId);
                        await fetchDocuments(user.companyId);
                    } else {
                        console.warn('No company ID found for user');
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching company data:', error);
            }
        };
        fetchCompanyData();
    }, []);

    const fetchDocuments = async (compId) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/companies/${compId}/documents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Fetched documents:', result);
                if (result.success && Array.isArray(result.data)) {
                    setDocuments(result.data);
                } else {
                    setDocuments([]);
                }
            } else {
                console.error('Failed to fetch documents');
                setDocuments([]); // Fallback to empty on error
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if company ID is available
        if (!companyId) {
            alert('❌ Company ID not found. Please refresh the page and try again.');
            return;
        }

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }

        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload PDF, JPG, or PNG.');
            return;
        }

        setUploadingFiles(prev => ({ ...prev, [docType]: true }));

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', docType);

            const token = localStorage.getItem('authToken');
            const uploadUrl = `${API_BASE_URL}/companies/${companyId}/documents/upload`;
            console.log('Uploading to:', uploadUrl);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Document uploaded:', result);

                // Refresh documents list locally since fetch API is removed
                if (result.data) {
                    const newDoc = {
                        ...result.data,
                        // Ensure properties match UI expectations
                        _id: result.data.documentId || result.data._id || result.data.id,
                        fileName: result.data.fileName || file.name,
                        documentType: docType,
                        fileSize: file.size,
                        uploadedAt: new Date().toISOString(),
                        verified: false
                    };
                    setDocuments(prev => [...prev.filter(d => d.documentType !== docType), newDoc]);
                    // Using filter above to strictly replace if only one doc per type is allowed, 
                    // or just [...prev, newDoc] if multiple. 
                    // The UI groups by type, so adding is safer, but usually these are single-doc slots.
                    // Given the loop `documentTypes.map`, simpler to just append or replace based on logic.
                    // Let's assume replacement since specific slots usually mean 1 file.
                    // Actually previous logic didn't show replacement, just list.
                    // Let's check `getDocumentsByType`. It filters by type.
                    // If I append, I might have duplicates if previous weren't cleared.
                    // But fetchDocuments clears it. 
                    // Safe bet: append newDoc.
                }

                // Auto-open removed as per user request
                // Document will appear in the list below

                alert('✅ Document uploaded successfully!');
            } else {
                const errorData = await response.json();
                console.error('Upload error:', errorData);
                alert('❌ ' + (errorData.message || errorData.error?.message || 'Document upload failed'));
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('❌ Network error during upload');
        } finally {
            setUploadingFiles(prev => ({ ...prev, [docType]: false }));
            // Reset file input
            e.target.value = '';
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('✅ Document deleted successfully!');
                if (companyId) {
                    await fetchDocuments(companyId);
                }
            } else {
                alert('❌ Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('❌ Network error during deletion');
        }
    };

    const handleViewDocument = async (documentId, fileName) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/documents/${documentId}/view`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch document');
            }

            const blob = await response.blob();
            const documentUrl = URL.createObjectURL(blob);
            setViewerModal({ isOpen: true, documentUrl, documentName: fileName });
        } catch (error) {
            console.error('Error viewing document:', error);
            alert('❌ Failed to load document. Please try again.');
        }
    };

    const closeViewerModal = () => {
        setViewerModal({ isOpen: false, documentUrl: '', documentName: '' });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDocumentsByType = (type) => {
        if (!Array.isArray(documents)) return [];
        return documents.filter(doc => doc && doc.documentType === type);
    };

    // Calculate statistics
    const totalDocuments = Array.isArray(documents) ? documents.length : 0;
    const totalSize = Array.isArray(documents) ? documents.reduce((acc, doc) => acc + (doc?.fileSize || 0), 0) : 0;
    const categoryCount = documentTypes.filter(type => getDocumentsByType(type.type).length > 0).length;

    return (
        <LayoutWithSidebar defaultCollapsed={true}>
            <div className="page-gradient-header"></div>

            <div className="content-container">
                {/* Breadcrumb */}
                <div className="breadcrumb nd-animate nd-visible">
                    <Link to="/noc/dashboard">Dashboard</Link>
                    <span className="separator">›</span>
                    <span className="current">Company Documents</span>
                </div>

                <div className="page-title-section nd-animate nd-visible">
                    <h1 className="page-main-title">Company Documents</h1>
                    <p className="page-subtitle">Securely upload and manage your company documents</p>
                </div>

                {/* Statistics Row */}
                <div className="nd-stats-row nd-animate" ref={statsRef} style={{ marginBottom: '30px' }}>
                    <div className="nd-stat-card" style={{ '--delay': '0.1s' }}>
                        <div className="nd-stat-icon blue">📊</div>
                        <div className="nd-stat-info">
                            <span className="nd-stat-label">Total Documents</span>
                            <span className="nd-stat-value">{totalDocuments}</span>
                            <span className="nd-stat-meta">{categoryCount} categories</span>
                        </div>
                    </div>

                    <div className="nd-stat-card" style={{ '--delay': '0.2s' }}>
                        <div className="nd-stat-icon green">💾</div>
                        <div className="nd-stat-info">
                            <span className="nd-stat-label">Total Storage</span>
                            <span className="nd-stat-value">{formatFileSize(totalSize)}</span>
                            <span className="nd-stat-meta">Used space</span>
                        </div>
                    </div>

                    <div className="nd-stat-card" style={{ '--delay': '0.3s' }}>
                        <div className="nd-stat-icon orange">📅</div>
                        <div className="nd-stat-info">
                            <span className="nd-stat-label">Last Updated</span>
                            <span className="nd-stat-value" style={{ fontSize: '1.2rem' }}>
                                {documents.length > 0 ? formatDate(documents[documents.length - 1].uploadedAt) : 'N/A'}
                            </span>
                            <span className="nd-stat-meta">Recent upload</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="nd-animate nd-visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="dashboard-card" style={{ height: '240px' }}>
                                <div className="card-header" style={{ marginBottom: '20px' }}>
                                    <SkeletonLoader width="60%" height="1.5rem" />
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <SkeletonLoader width="100%" height="60px" borderRadius="12px" />
                                    <SkeletonLoader width="80%" height="40px" borderRadius="12px" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="nd-animate" ref={docsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                        {documentTypes.map((docCategory, index) => {
                            const allCategoryDocs = getDocumentsByType(docCategory.type);
                            // Sort by uploadedAt desc and take only the latest one
                            const categoryDocs = allCategoryDocs
                                .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
                                .slice(0, 1);

                            const isUploading = uploadingFiles[docCategory.type];

                            return (
                                <div key={docCategory.type} className="dashboard-card" style={{ '--delay': `${0.1 * (index + 1)}s`, display: 'flex', flexDirection: 'column' }}>
                                    {/* Section Header */}
                                    <div className="card-header" style={{ marginBottom: '15px' }}>
                                        <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className="icon" style={{ fontSize: '1.5rem' }}>{docCategory.icon}</span>
                                            <span style={{ fontWeight: '700', letterSpacing: '-0.01em' }}>{docCategory.label}</span>
                                            <span className="badge badge-primary" style={{ marginLeft: 'auto', background: 'rgba(56, 189, 248, 0.2)', color: 'var(--cgwa-primary)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                                {categoryDocs.length}
                                            </span>
                                        </h3>
                                    </div>

                                    {/* Document List */}
                                    {categoryDocs.length === 0 ? (
                                        <div className="empty-state" style={{
                                            padding: '40px 20px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '16px',
                                            border: '2px dashed rgba(255, 255, 255, 0.1)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.6 }}>📭</div>
                                            <p style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>No Document Uploaded</p>
                                            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>Please upload the {docCategory.label}</p>

                                            <label className="btn-primary" style={{
                                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                                opacity: isUploading ? 0.6 : 1,
                                                padding: '12px 24px',
                                                fontSize: '0.9rem',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>{isUploading ? '⏳' : '📤'}</span>
                                                <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
                                                <input
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleFileUpload(e, docCategory.type)}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '15px' }}>
                                            {categoryDocs.map((doc, index) => (
                                                <div
                                                    key={doc.documentId || doc._id}
                                                    className="document-item-row"
                                                    style={{
                                                        padding: '20px',
                                                        borderRadius: '16px',
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '20px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        marginTop: '10px'
                                                    }}
                                                >
                                                    {/* File Info */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: '1 1 300px', minWidth: 0 }}>
                                                        <div style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '12px',
                                                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.75rem',
                                                            color: 'var(--cgwa-primary)',
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                        }}>
                                                            📄
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: '700', color: 'rgba(255, 255, 255, 0.95)', fontSize: '1rem', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {doc.fileName}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    📊 {formatFileSize(doc.fileSize)}
                                                                </span>
                                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></span>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    📅 {formatDate(doc.uploadedAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                                                        {doc.verified ? (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                padding: '8px 16px',
                                                                borderRadius: '24px',
                                                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                                                color: '#34d399',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '700',
                                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}>
                                                                <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                padding: '8px 16px',
                                                                borderRadius: '24px',
                                                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                                                color: '#fbbf24',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '700',
                                                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}>
                                                                <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}></span>
                                                                Pending Review
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                                        <button
                                                            onClick={() => handleViewDocument(doc.documentId || doc._id, doc.fileName)}
                                                            className="nd-action-btn"
                                                            title="View Document"
                                                            style={{
                                                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                                                color: 'var(--cgwa-primary)',
                                                                border: '1px solid rgba(56, 189, 248, 0.2)'
                                                            }}
                                                        >
                                                            👁️
                                                        </button>

                                                        <label
                                                            className="nd-action-btn"
                                                            title="Update Document"
                                                            style={{
                                                                backgroundColor: 'rgba(129, 140, 248, 0.1)',
                                                                color: '#818cf8',
                                                                border: '1px solid rgba(129, 140, 248, 0.2)',
                                                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                                                opacity: isUploading ? 0.7 : 1,
                                                                margin: 0
                                                            }}
                                                        >
                                                            🔄
                                                            <input
                                                                type="file"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => handleFileUpload(e, docCategory.type)}
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                disabled={isUploading}
                                                            />
                                                        </label>

                                                        <button
                                                            onClick={() => handleDeleteDocument(doc.documentId || doc._id)}
                                                            className="nd-action-btn"
                                                            title="Delete Document"
                                                            style={{
                                                                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                                                                color: '#f43f5e',
                                                                border: '1px solid rgba(244, 63, 94, 0.2)'
                                                            }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="form-actions-footer">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/noc/dashboard')}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {viewerModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'nd-fade-in 0.3s ease'
                }} onClick={closeViewerModal}>
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        borderRadius: '24px',
                        width: '95%',
                        maxWidth: '1200px',
                        height: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        animation: 'nd-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px 30px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    color: 'var(--cgwa-primary)'
                                }}>📄</div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>{viewerModal.documentName}</h3>
                            </div>
                            <button
                                onClick={closeViewerModal}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div style={{ flex: 1, backgroundColor: 'white', position: 'relative' }}>
                            <iframe
                                src={viewerModal.documentUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                title="Document Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </LayoutWithSidebar>
    );
};

export default CompanyDocuments;
