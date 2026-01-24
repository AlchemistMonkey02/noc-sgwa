import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/apiConfig';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const CompanyDocuments = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [viewerModal, setViewerModal] = useState({ isOpen: false, documentUrl: '', documentName: '' });

    const documentTypes = [
        { type: 'GST_CERTIFICATE', label: 'GST Certificate', icon: '📋' },
        { type: 'PAN_CARD', label: 'PAN Card', icon: '🆔' },
        { type: 'INCORPORATION_CERTIFICATE', label: 'Incorporation Certificate', icon: '📜' },
        { type: 'TRADE_LICENSE', label: 'Trade License', icon: '🏪' },
        { type: 'POLLUTION_CLEARANCE', label: 'Pollution Control Clearance', icon: '🌿' },
        { type: 'MSME_CERTIFICATE', label: 'MSME Certificate', icon: '🏭' },
        { type: 'OTHER', label: 'Other Documents', icon: '📄' }
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
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Dashboard</Link>
                        <span className="separator">›</span>
                        <span className="current">Company Documents</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">Company Documents</h1>
                        <p className="page-subtitle">Securely upload and manage your company documents</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="stats-grid" style={{ marginBottom: '25px' }}>
                        <div className="stat-card blue" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '2rem' }}>📊</div>
                                <div>
                                    <div className="stat-label" style={{ fontSize: '0.8rem' }}>Total Documents</div>
                                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>{totalDocuments}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                        {categoryCount} categories
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card green" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '2rem' }}>💾</div>
                                <div>
                                    <div className="stat-label" style={{ fontSize: '0.8rem' }}>Total Storage</div>
                                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>{formatFileSize(totalSize)}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                        Used space
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card orange" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '2rem' }}>📅</div>
                                <div>
                                    <div className="stat-label" style={{ fontSize: '0.8rem' }}>Last Updated</div>
                                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                                        {documents.length > 0 ? formatDate(documents[documents.length - 1].uploadedAt) : 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                        Recent upload
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="loading-icon">⏳</div>
                            <p>Loading your documents...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
                            {documentTypes.map((docCategory) => {
                                const allCategoryDocs = getDocumentsByType(docCategory.type);
                                // Sort by uploadedAt desc and take only the latest one
                                const categoryDocs = allCategoryDocs
                                    .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
                                    .slice(0, 1);

                                const isUploading = uploadingFiles[docCategory.type];

                                return (
                                    <div key={docCategory.type} className="form-section">
                                        {/* Section Header */}
                                        <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className="icon">{docCategory.icon}</span> {docCategory.label}
                                                <span className="badge badge-primary">
                                                    {categoryDocs.length}
                                                </span>
                                            </h3>
                                        </div>

                                        {/* Document List */}
                                        {categoryDocs.length === 0 ? (
                                            <div className="empty-state" style={{ padding: '30px 20px' }}>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#64748b' }}>No documents uploaded yet</p>
                                                <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#94a3b8' }}>Upload your document below</p>
                                                <label className="btn-primary btn-sm" style={{
                                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                                    opacity: isUploading ? 0.6 : 1,
                                                    width: '110px',
                                                    textAlign: 'center',
                                                    padding: '8px 12px',
                                                    fontSize: '0.85rem',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: '600'
                                                }}>
                                                    <span style={{ fontSize: '1rem' }}>📤</span>
                                                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
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
                                                            padding: '16px',
                                                            borderBottom: index < categoryDocs.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            gap: '15px',
                                                            backgroundColor: '#fff',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                                    >
                                                        {/* File Info */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 300px', minWidth: 0 }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#eff6ff',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1.5rem',
                                                                color: '#2563eb'
                                                            }}>
                                                                📄
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {doc.fileName}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        📊 {formatFileSize(doc.fileSize)}
                                                                    </span>
                                                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                                                    gap: '6px',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    backgroundColor: '#dcfce7',
                                                                    color: '#166534',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600',
                                                                    border: '1px solid #bbf7d0'
                                                                }}>
                                                                    <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#166534' }}></span>
                                                                    Verified
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    backgroundColor: '#fff7ed',
                                                                    color: '#9a3412',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600',
                                                                    border: '1px solid #fed7aa'
                                                                }}>
                                                                    <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
                                                                    Pending Review
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                            <button
                                                                onClick={() => handleViewDocument(doc.documentId || doc._id, doc.fileName)}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '8px 14px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e2e8f0',
                                                                    backgroundColor: '#fff',
                                                                    color: '#475569',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '500',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fff'; }}
                                                            >
                                                                <span>👁️</span> View
                                                            </button>

                                                            <label
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '8px 14px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #bfdbfe',
                                                                    backgroundColor: '#eff6ff',
                                                                    color: '#2563eb',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '500',
                                                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                                                    opacity: isUploading ? 0.7 : 1,
                                                                    margin: 0,
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                                                                onMouseLeave={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                                            >
                                                                <span>🔄</span> Update
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
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #fecaca',
                                                                    backgroundColor: '#fff',
                                                                    color: '#dc2626',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    fontSize: '1rem'
                                                                }}
                                                                title="Delete file"
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
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
            </div>

            {/* Document Viewer Modal */}
            {viewerModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={closeViewerModal}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '1200px',
                        height: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8fafc'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.5rem' }}>📄</span>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{viewerModal.documentName}</h3>
                            </div>
                            <button
                                onClick={closeViewerModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.color = '#1e293b';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#f8fafc' }}>
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

            <NOCFooter />
        </div>
    );
};

export default CompanyDocuments;
