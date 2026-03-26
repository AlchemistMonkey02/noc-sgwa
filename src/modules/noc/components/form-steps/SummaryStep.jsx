import React from 'react';

/**
 * Summary Step Component
 * Displays a comprehensive review of all application details before final submission
 */
const SummaryStep = ({
    formData,
    existingStructures,
    getDisplayLabel,
    formatDisplayValue,
    appTypeOptions,
    appSubTypeOptions,
    projectTypeOptions,
    waterQualityOptions,
    utilizationPurposeOptions,
    msmeTypeOptions,
    stateOptions,
    organizationTypeOptions,
    blockCategory,
    exemptionStatus
}) => {
    return (
        <div>
            <h3 className="form-section-header">Application Summary</h3>
            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px' }}>
                Review all your details before final submission
            </p>

            {/* 1. Basic Details */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">1. Application Type & Basic Details</div>
                <div className="noc-card-body">
                    <div className="noc-form-row two-col">
                        <div>
                            <strong>Application Type:</strong> {getDisplayLabel(formData.applicationType, appTypeOptions)}
                        </div>
                        <div>
                            <strong>Application Sub Type:</strong> {getDisplayLabel(formData.applicationSubType, appSubTypeOptions)}
                        </div>
                        <div>
                            <strong>Project Type:</strong> {getDisplayLabel(formData.projectType, projectTypeOptions)}
                        </div>
                        <div>
                            <strong>Water Quality Type:</strong> {getDisplayLabel(formData.waterQualityType, waterQualityOptions)}
                        </div>
                        <div>
                            <strong>Utilization Purpose:</strong> {getDisplayLabel(formData.groundWaterUtilizationFor, utilizationPurposeOptions)}
                        </div>
                        {formData.industryType && (
                            <div>
                                <strong>Industry Type:</strong> {formatDisplayValue(formData.industryType)}
                            </div>
                        )}
                        <div>
                            <strong>MSME Status:</strong> {formatDisplayValue(formData.isMSME)}
                            {formData.isMSME === 'Yes' && formData.msmeType && ` (${getDisplayLabel(formData.msmeType, msmeTypeOptions)})`}
                        </div>
                        <div>
                            <strong>Aquifer Type:</strong> {formatDisplayValue(formData.geology)}
                        </div>
                        {formData.dateOfCommencement && (
                            <div>
                                <strong>Date of Commencement:</strong> {formatDisplayValue(formData.dateOfCommencement)}
                            </div>
                        )}
                        {formData.existingNOCStatus === 'Yes' && formData.oldNOCNo && (
                            <div>
                                <strong>Old NOC Number:</strong> {formatDisplayValue(formData.oldNOCNo)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Project & Location Details */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">2. Project & Location Details</div>
                <div className="noc-card-body">
                    <div className="noc-form-row two-col">
                        <div>
                            <strong>Project Name:</strong> {formatDisplayValue(formData.projectName)}
                        </div>
                        <div>
                            <strong>State:</strong> {getDisplayLabel(formData.state, stateOptions)}
                        </div>
                        <div>
                            <strong>District:</strong> {formatDisplayValue(formData.district)}
                        </div>
                        <div>
                            <strong>Block:</strong> {formatDisplayValue(formData.block)}
                        </div>
                        {formData.tehsil && (
                            <div>
                                <strong>Tehsil:</strong> {formatDisplayValue(formData.tehsil)}
                            </div>
                        )}
                        {formData.projectAddress && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <strong>Project Address:</strong> {formatDisplayValue(formData.projectAddress)}
                            </div>
                        )}
                        {(formData.latitude || formData.longitude) && (
                            <div>
                                <strong>Coordinates:</strong> {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not provided'}
                            </div>
                        )}
                        {blockCategory && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <strong>Block Category:</strong>{' '}
                                <span style={{ color: blockCategory.color, fontWeight: 'bold' }}>
                                    {blockCategory.name} (Validity: {blockCategory.validityYears} years)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Water Requirement Details */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">3. Water Requirement Details</div>
                <div className="noc-card-body">
                    <div className="noc-form-row two-col">
                        <div>
                            <strong>Daily Requirement:</strong> {formatDisplayValue((parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0)) || formData.dailyWaterRequirement)} {((parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0)) || formData.dailyWaterRequirement) ? 'm³/day' : ''}
                        </div>
                        <div>
                            <strong>Annual Requirement:</strong> {formatDisplayValue(((parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0)) * 365) || formData.annualWaterRequirement)} {(((parseFloat(formData.waterReqFreshRequirement || 0) + parseFloat(formData.waterReqRecycled || 0)) * 365) || formData.annualWaterRequirement) ? 'm³/year' : ''}
                        </div>
                        {formData.numberOfWorkers && (
                            <div>
                                <strong>Number of Workers:</strong> {formatDisplayValue(formData.numberOfWorkers)}
                            </div>
                        )}
                        {formData.numberOfResidents && (
                            <div>
                                <strong>Number of Residents:</strong> {formatDisplayValue(formData.numberOfResidents)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Groundwater Structures */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">4. Groundwater Structures</div>
                <div className="noc-card-body">
                    <div className="noc-form-row two-col">
                        <div>
                            <strong>Proposed Borewells:</strong> {formData.proposedBorewells || 0}
                        </div>
                        <div>
                            <strong>Proposed Tubewells:</strong> {formData.proposedTubewells || 0}
                        </div>
                        <div>
                            <strong>Existing Structures:</strong> {existingStructures.length}
                        </div>
                    </div>
                    {existingStructures.length > 0 && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                            <strong>Existing Structure Details:</strong>
                            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                {existingStructures.map((struct, idx) => (
                                    <li key={idx}>
                                        {struct.type || 'Structure'} - Depth: {struct.depth || 'N/A'}m
                                        {struct.hasMeter === 'Yes' && ' (Meter Installed)'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Flow Meter Details (Conditional) */}
            {formData.flowMeterDetails && (
                <div className="noc-card" style={{ marginBottom: '20px' }}>
                    <div className="noc-card-header">5. Flow Meter Details</div>
                    <div className="noc-card-body">
                        <div className="noc-form-row two-col">
                            <div>
                                <strong>Manufacturer:</strong> {formData.flowMeterDetails.manufacturer}
                            </div>
                            <div>
                                <strong>Model Number:</strong> {formData.flowMeterDetails.modelNumber}
                            </div>
                            <div>
                                <strong>Serial Number:</strong> {formData.flowMeterDetails.serialNumber}
                            </div>
                            <div>
                                <strong>Meter Type:</strong> {formData.flowMeterDetails.meterType}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Applicant Details */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">{(formData.flowMeterDetails ? 6 : 5)}. Applicant Details</div>
                <div className="noc-card-body">
                    <div className="noc-form-row two-col">
                        <div>
                            <strong>Applicant Name:</strong> {formatDisplayValue(formData.applicantName)}
                        </div>
                        <div>
                            <strong>Organization:</strong> {formatDisplayValue(formData.organizationName)}
                        </div>
                        <div>
                            <strong>Organization Type:</strong> {getDisplayLabel(formData.organizationType, organizationTypeOptions)}
                        </div>
                        <div>
                            <strong>Email:</strong> {formatDisplayValue(formData.applicantEmail)}
                        </div>
                        <div>
                            <strong>Mobile:</strong> {formatDisplayValue(formData.applicantMobile)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. Documents Summary */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">{(formData.flowMeterDetails ? 7 : 6)}. Document Uploads</div>
                <div className="noc-card-body">
                    <p>
                        <strong>Total Documents Uploaded:</strong>{' '}
                        {Object.keys(formData.uploadedDocuments).length} documents
                    </p>
                    {Object.keys(formData.uploadedDocuments).length > 0 && (
                        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                            {Object.entries(formData.uploadedDocuments).map(([docId, file]) => (
                                <li key={docId}>
                                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* 8. Payment Summary */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">{(formData.flowMeterDetails ? 8 : 7)}. Payment Details</div>
                <div className="noc-card-body">
                    <div className="noc-form-row two-col">
                        <div>
                            <strong>Total Amount:</strong>{' '}
                            <span style={{ fontSize: '1.2rem', color: 'var(--cgwa-success)', fontWeight: 'bold' }}>
                                ₹{formData.totalAmount?.toLocaleString('en-IN') || '0'}
                            </span>
                        </div>
                        <div>
                            <strong>Payment Status:</strong>{' '}
                            <span style={{ color: formData.paymentStatus === 'paid' ? 'var(--cgwa-success)' : 'var(--cgwa-warning)', fontWeight: 'bold' }}>
                                {formData.paymentStatus === 'paid' ? '✓ PAID' : '⚠ PENDING'}
                            </span>
                        </div>
                        {formData.paymentTransactionId && (
                            <>
                                <div>
                                    <strong>Transaction ID:</strong> {formatDisplayValue(formData.paymentTransactionId)}
                                </div>
                                <div>
                                    <strong>Receipt Number:</strong> {formatDisplayValue(formData.paymentReceiptNumber)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Final Declaration */}
            <div className="noc-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid var(--cgwa-primary)' }}>
                <div className="noc-card-header" style={{ background: 'var(--cgwa-primary)', color: 'white' }}>
                    📝 Final Declaration
                </div>
                <div className="noc-card-body">
                    <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                        I hereby declare that all the information provided in this application is true and correct
                        to the best of my knowledge and belief. I understand that if any information is found to be
                        false or misleading, my application may be rejected and/or the issued NOC may be cancelled.
                    </p>
                    <div className="noc-checkbox-item">
                        <input
                            type="checkbox"
                            id="finalDeclaration"
                            required
                        />
                        <label htmlFor="finalDeclaration" style={{ fontWeight: 'bold', marginLeft: '10px' }}>
                            I agree to the above declaration and confirm that all information provided is accurate.
                        </label>
                    </div>
                </div>
            </div>

            <div className="noc-alert noc-alert-info">
                <strong>💡 Ready to Submit:</strong> Please review all the above information carefully.
                Once submitted, you will not be able to make changes to your application.
            </div>
        </div>
    );
};

export default SummaryStep;
