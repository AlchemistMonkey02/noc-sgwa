import React from 'react';

/**
 * Document Upload Step Component
 * Handles file uploads and shows AI verification feedback
 */
const DocumentUploadStep = ({
    formData,
    errors,
    handleFileUpload,
    verificationFeedback,
    requiredDocs
}) => {
    return (
        <div>
            <h3 className="form-section-header">Upload Documents</h3>

            <div className="noc-alert noc-alert-info" style={{ marginBottom: '20px' }}>
                <strong>Note:</strong> Please upload all required documents in PDF, JPEG, or PNG format. Maximum file size: 5MB per document.
            </div>

            {requiredDocs.map(doc => (
                <div key={doc.id} className="noc-card" style={{ marginBottom: '20px' }}>
                    <div className="noc-card-header">
                        {doc.name} {doc.required && <span style={{ color: 'var(--cgwa-danger)' }}>*</span>}
                    </div>
                    <div className="noc-card-body">
                        <p style={{ marginBottom: '15px', color: 'var(--cgwa-text-secondary)' }}>
                            {doc.description}
                        </p>

                        <div className="noc-file-upload">
                            <input
                                type="file"
                                id={`file_${doc.id}`}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        handleFileUpload(doc.id, e.target.files[0]);
                                    }
                                }}
                            />
                            <label htmlFor={`file_${doc.id}`} style={{ cursor: 'pointer' }}>
                                <div className="noc-file-upload-icon">📁</div>
                                <div className="noc-file-upload-text">
                                    {formData.uploadedDocuments[doc.id] ? (
                                        <span style={{ color: 'var(--cgwa-success)', fontWeight: '600' }}>
                                            ✅ {formData.uploadedDocuments[doc.id].name}
                                        </span>
                                    ) : (
                                        <span>Click to upload or drag and drop</span>
                                    )}
                                </div>
                            </label>
                        </div>

                        {errors[doc.id] && <span className="text-error" style={{ color: 'var(--cgwa-danger)', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{errors[doc.id]}</span>}

                        {/* AI Verification Feedback */}
                        {verificationFeedback[doc.id] && (
                            <div className={`noc-alert ${verificationFeedback[doc.id].status === 'approved' ? 'noc-alert-success' : verificationFeedback[doc.id].status === 'verifying' ? 'noc-alert-info' : 'noc-alert-danger'}`} style={{ marginTop: '10px', padding: '10px', borderLeft: verificationFeedback[doc.id].status === 'verifying' ? '4px solid #3b82f6' : undefined }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {verificationFeedback[doc.id].status === 'approved' ? '✅' : verificationFeedback[doc.id].status === 'verifying' ? '⌛' : '❌'}
                                    </span>
                                    <div>
                                        <strong>
                                            {verificationFeedback[doc.id].status === 'approved' ? 'AI Verification Passed' :
                                                verificationFeedback[doc.id].status === 'verifying' ? 'Verifying Document...' :
                                                    'AI Verification Rejected'}
                                        </strong>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                            {verificationFeedback[doc.id].message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentUploadStep;
