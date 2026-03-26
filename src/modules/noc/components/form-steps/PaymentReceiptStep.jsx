import React from 'react';

/**
 * Payment Receipt Step Component
 * Displays application summary and handles payment receipt upload
 */
const PaymentReceiptStep = ({
    formData,
    errors,
    handleFileUpload,
    getDisplayLabel,
    appTypeOptions,
    validateFileSize,
    toastWarning
}) => {
    return (
        <div>
            <h3 className="form-section-header">Upload Payment Receipt</h3>

            <div className="noc-alert noc-alert-warning" style={{ marginBottom: '20px' }}>
                <strong>Important:</strong> Please upload the payment receipt from the previous step before proceeding to final submission.
            </div>

            {/* Summary Cards */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">Application Summary</div>
                <div className="noc-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        <div>
                            <strong>Application Type:</strong> {getDisplayLabel(formData.applicationType, appTypeOptions)}
                        </div>
                        <div>
                            <strong>Project Name:</strong> {formData.projectName}
                        </div>
                        <div>
                            <strong>State:</strong> {formData.state}
                        </div>
                        <div>
                            <strong>Daily Water Requirement:</strong> {formData.dailyWaterRequirement || (parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0))} m³/day
                        </div>
                        <div>
                            <strong>Applicant Name:</strong> {formData.applicantName}
                        </div>
                        <div>
                            <strong>Organization:</strong> {formData.organizationName}
                        </div>
                        {formData.paymentTransactionId && (
                            <>
                                <div>
                                    <strong>Payment Status:</strong> <span style={{ color: 'var(--cgwa-success)', fontWeight: 'bold' }}>✓ PAID</span>
                                </div>
                                <div>
                                    <strong>Transaction ID:</strong> {formData.paymentTransactionId}
                                </div>
                                <div>
                                    <strong>Receipt Number:</strong> {formData.paymentReceiptNumber}
                                </div>
                                <div>
                                    <strong>Amount Paid:</strong> ₹{formData.totalAmount?.toLocaleString('en-IN')}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Receipt Upload */}
            <div className="noc-card" style={{ marginBottom: '20px', border: '2px solid var(--cgwa-warning)' }}>
                <div className="noc-card-header" style={{ background: 'var(--cgwa-warning)', color: 'white' }}>
                    Upload Payment Receipt * (MANDATORY)
                </div>
                <div className="noc-card-body">
                    <div className="noc-alert noc-alert-info" style={{ marginBottom: '20px' }}>
                        <strong>📤 Upload Required:</strong> Please upload the payment receipt you downloaded in the previous step. You cannot submit your application without uploading the payment proof.
                    </div>

                    <div className="noc-form-group">
                        <label className="form-label required">Payment Receipt (PDF/JPG/PNG)</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    if (validateFileSize(file)) {
                                        handleFileUpload('paymentReceipt', file);
                                    } else {
                                        toastWarning('File size must be less than 5MB');
                                    }
                                }
                            }}
                            className="form-input"
                            style={{ padding: '10px' }}
                        />
                        <span className="noc-form-help">Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                        {errors.paymentReceipt && <span className="text-error" style={{ color: 'var(--cgwa-danger)', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{errors.paymentReceipt}</span>}

                        {formData.uploadedDocuments.paymentReceipt && (
                            <div style={{
                                marginTop: '15px',
                                padding: '15px',
                                background: 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)',
                                borderRadius: '8px',
                                border: '2px solid var(--cgwa-success)',
                                color: '#155724'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>✓</span>
                                    <div>
                                        <strong>Receipt Uploaded Successfully!</strong>
                                        <p style={{ margin: '5px 0 0 0' }}>File: {formData.uploadedDocuments.paymentReceipt.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Declaration */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">Declaration</div>
                <div className="noc-card-body">
                    <div className="noc-checkbox-item">
                        <input
                            type="checkbox"
                            id="declaration"
                            required
                        />
                        <label htmlFor="declaration" style={{ marginLeft: '10px' }}>
                            I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of the application and legal action.
                        </label>
                    </div>
                </div>
            </div>

            {/* Submit Status Alert */}
            {!formData.uploadedDocuments.paymentReceipt && (
                <div className="noc-alert noc-alert-danger">
                    <strong>🚫 Cannot Submit Application</strong>
                    <p style={{ margin: '10px 0 0 0' }}>Please upload the payment receipt to enable the submit button.</p>
                </div>
            )}
        </div>
    );
};

export default PaymentReceiptStep;
