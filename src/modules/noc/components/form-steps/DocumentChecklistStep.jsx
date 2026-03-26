import React from 'react';

/**
 * Document Checklist Step Component
 * Displays required documents based on application details
 */
const DocumentChecklistStep = ({ requiredDocs, documentsLoading }) => {
    return (
        <div>
            <h3 className="form-section-header">Documents Required for Your Application</h3>

            <div className="bhuneer-info-box" style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>Document Checklist</h4>
                <p>Please ensure you have the following documents ready before proceeding to the upload step. All documents should be in PDF, JPG, or PNG format (max 5MB per file).</p>
            </div>

            {/* Required Documents List */}
            <div style={{ marginBottom: '30px' }}>
                <h4 style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    Mandatory Documents (Required for ALL Applications)
                </h4>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {documentsLoading ? (
                        <div className="noc-alert noc-alert-info">
                            Loading document requirements...
                        </div>
                    ) : requiredDocs.length === 0 ? (
                        <div className="noc-alert noc-alert-info">
                            No documents required based on current selection. Please verify input details.
                        </div>
                    ) : (
                        requiredDocs.map((doc, index) => (
                            <div key={doc.id} style={{
                                padding: '20px',
                                background: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '15px'
                            }}>
                                <div style={{
                                    minWidth: '30px',
                                    height: '30px',
                                    background: 'var(--cgwa-primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h5 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>
                                        {doc.name} {doc.required && <span style={{ color: 'var(--cgwa-danger)' }}>*</span>}
                                    </h5>
                                    <p style={{ margin: '0 0 5px 0', color: '#6c757d', fontSize: '0.9rem' }}>
                                        {doc.description}
                                    </p>
                                    {doc.condition && (
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: '#856404',
                                            backgroundColor: '#fff3cd',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}>
                                            Applicable if: {doc.condition}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )))}
                </div>
            </div>

            <div className="bhuneer-info-box" style={{ marginTop: '30px', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderLeftColor: '#2196f3' }}>
                <h4>Important Notes:</h4>
                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    <li>All documents must be clear and legible</li>
                    <li>Notarized affidavits must be on ₹100 stamp paper</li>
                    <li>Water quality reports must be from NABL-accredited labs</li>
                    <li>Scan documents at 200 DPI minimum for best quality</li>
                    <li>File names should be descriptive (e.g., "Land_Ownership_Certificate.pdf")</li>
                </ul>
            </div>
        </div>
    );
};

export default DocumentChecklistStep;
