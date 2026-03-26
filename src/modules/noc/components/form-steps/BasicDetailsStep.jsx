import React from 'react';
import { getExemptionDisplayConfig } from '../../utils/exemptionRules';
import { isPollutingIndustry, isPackagedWaterIndustry } from '../../utils/industryClassification';

const BasicDetailsStep = ({
    formData,
    handleChange,
    errors,
    appTypeOptions,
    appSubTypeOptions,
    projectTypeOptions,
    waterQualityOptions,
    utilizationPurposeOptions,
    organizationTypeOptions,
    msmeTypeOptions,
    handlePendingFileChange,
    pendingUploads,
    exemptionStatus,
    industryOptions,
    miningOptions,
    getDisplayLabel
}) => {
    return (
        <div>
            <h3 className="form-section-header">Application Type Details</h3>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Application Type</label>
                    <select
                        name="applicationType"
                        className={`form-input ${errors.applicationType ? 'error' : ''}`}
                        value={formData.applicationType}
                        onChange={handleChange}
                    >
                        <option value="">Select Application Type</option>
                        {appTypeOptions.map(type => {
                            const label = typeof type === 'object' ? (type.label || type.name) : type;
                            const value = typeof type === 'object' ? (type.appTypeId || type.applicationTypeId || type.id || type.appTypeCode || type.typeCode || type.code || type._id || type.name) : type;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.applicationType && <span className="text-error">{errors.applicationType}</span>}
                    {getDisplayLabel(formData.applicationType, appTypeOptions) === 'NOC Renewal' && (
                        <div className="noc-alert noc-alert-warning" style={{ marginTop: '10px' }}>
                            🔔 <strong>Renewal Notice:</strong> Applications must be submitted at least 90 days before expiry. Late applications may attract Environmental Compensation Charges.
                        </div>
                    )}
                </div>

                <div className="noc-form-group">
                    <label className="form-label required">Application Sub Type</label>
                    <select
                        name="applicationSubType"
                        className={`form-input ${errors.applicationSubType ? 'error' : ''}`}
                        value={formData.applicationSubType}
                        onChange={handleChange}
                    >
                        <option value="">Select Application Sub Type</option>
                        {appSubTypeOptions.map(type => {
                            const label = typeof type === 'object' ? (type.label || type.name) : type;
                            const value = typeof type === 'object' ? (type.id || type.appSubTypeCode || type.subTypeCode || type.typeCode || type.code || type._id || type.name) : type;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.applicationSubType && <span className="text-error">{errors.applicationSubType}</span>}
                </div>
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Project Type</label>
                    <select
                        name="projectType"
                        className={`form-input ${errors.projectType ? 'error' : ''}`}
                        value={formData.projectType}
                        onChange={handleChange}
                    >
                        <option value="">Select Project Type</option>
                        {projectTypeOptions.map(type => {
                            const label = typeof type === 'object' ? (type.label || type.name) : type;
                            const value = typeof type === 'object' ? (type.categoryCode || type.projectTypeCode || type.typeCode || type.id || type.code || type._id || type.name) : type;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.projectType && <span className="text-error">{errors.projectType}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label required">Water Quality Type</label>
                    <select
                        name="waterQualityType"
                        className={`form-input ${errors.waterQualityType ? 'error' : ''}`}
                        value={formData.waterQualityType}
                        onChange={handleChange}
                    >
                        <option value="">Select Water Quality Type</option>
                        {waterQualityOptions.map(type => {
                            const label = typeof type === 'object' ? (type.label || type.name) : type;
                            const value = typeof type === 'object' ? (type.code || type.name) : type;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.waterQualityType && <span className="text-error">{errors.waterQualityType}</span>}
                </div>
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Ground Water Utilization For</label>
                    <select
                        name="groundWaterUtilizationFor"
                        className={`form-input ${errors.groundWaterUtilizationFor ? 'error' : ''}`}
                        value={formData.groundWaterUtilizationFor}
                        onChange={handleChange}
                    >
                        <option value="">Select Utilization Purpose</option>
                        {utilizationPurposeOptions.map(type => {
                            const label = typeof type === 'object' ? (type.label || type.name) : type;
                            const value = typeof type === 'object' ? (type.code || type.name) : type;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.groundWaterUtilizationFor && <span className="text-error">{errors.groundWaterUtilizationFor}</span>}
                </div>

                {formData.existingNOCStatus === 'Yes' && (
                    <div className="noc-form-group">
                        <label className="form-label required">Date of Commencement</label>
                        <input
                            type="date"
                            name="dateOfCommencement"
                            className={`form-input ${errors.dateOfCommencement ? 'error' : ''}`}
                            value={formData.dateOfCommencement}
                            onChange={handleChange}
                        />
                        {errors.dateOfCommencement && <span className="text-error">{errors.dateOfCommencement}</span>}
                    </div>
                )}
            </div>

            {formData.groundWaterUtilizationFor === 'Industry' && (
                <div className="noc-form-group">
                    <label className="form-label required">Industry Type</label>
                    <select
                        name="industryType"
                        className={`form-input ${errors.industryType ? 'error' : ''}`}
                        value={formData.industryType || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Industry Type</option>
                        {(() => {
                            const options = industryOptions || [];
                            const categories = [...new Set(options.map(ind => ind.category || 'Other'))];
                            return categories.map(category => (
                                <optgroup key={category} label={category}>
                                    {options
                                        .filter(item => (item.category || 'Other') === category)
                                        .map(item => (
                                            <option key={item.industryTypeId || item.id || item.code || item.value} value={item.industryName || item.name || item.value}>
                                                {item.industryName || item.name || item.label} {item.isPolluting ? '(Polluting)' : ''}
                                            </option>
                                        ))}
                                </optgroup>
                            ));
                        })()}
                    </select>
                    {errors.industryType && <span className="text-error">{errors.industryType}</span>}
                    {formData.industryType && isPollutingIndustry(formData.industryType) && (
                        <div className="noc-alert noc-alert-warning" style={{ marginTop: '10px' }}>
                            ⚠️ <strong>Polluting Industry:</strong> Additional compliance requirements apply including well-head protection and water quality monitoring.
                        </div>
                    )}
                    {formData.industryType && isPackagedWaterIndustry(formData.industryType) && (
                        <div className="noc-alert noc-alert-info" style={{ marginTop: '10px' }}>
                            ℹ️ <strong>Packaged Water:</strong> BIS license and regular product quality testing required.
                        </div>
                    )}
                </div>
            )}

            {formData.groundWaterUtilizationFor === 'Mining' && (
                <div className="noc-form-group">
                    <label className="form-label required">Mining Type</label>
                    <select
                        name="miningType"
                        className={`form-input ${errors.miningType ? 'error' : ''}`}
                        value={formData.miningType || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select Mining Type</option>
                        {(miningOptions || []).map(mining => (
                            <option key={mining.id || mining.code || mining.value} value={mining.name || mining.value}>
                                {mining.label || mining.name} ({mining.category})
                            </option>
                        ))}
                    </select>
                    {errors.miningType && <span className="text-error">{errors.miningType}</span>}
                    <div className="noc-alert noc-alert-info" style={{ marginTop: '10px' }}>
                        ℹ️ <strong>Mining Projects:</strong> Piezometer installation in core and buffer zones is mandatory. Dewatering treatment plan required.
                    </div>
                </div>
            )}

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Existing NOC Status</label>
                    <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                        <div className="noc-radio-item">
                            <input
                                type="radio"
                                name="existingNOCStatus"
                                id="nocYes"
                                value="Yes"
                                checked={formData.existingNOCStatus === 'Yes'}
                                onChange={handleChange}
                            />
                            <label htmlFor="nocYes">Yes</label>
                        </div>
                        <div className="noc-radio-item">
                            <input
                                type="radio"
                                name="existingNOCStatus"
                                id="nocNo"
                                value="No"
                                checked={formData.existingNOCStatus === 'No'}
                                onChange={handleChange}
                            />
                            <label htmlFor="nocNo">No</label>
                        </div>
                    </div>
                </div>

                {formData.existingNOCStatus === 'Yes' && (
                    <div className="noc-form-group">
                        <label className="form-label required">Old NOC Number</label>
                        <input
                            type="text"
                            name="oldNOCNo"
                            className={`form-input ${errors.oldNOCNo ? 'error' : ''}`}
                            value={formData.oldNOCNo}
                            onChange={handleChange}
                            placeholder="Enter old NOC number"
                        />
                        {errors.oldNOCNo && <span className="text-error">{errors.oldNOCNo}</span>}

                        <div style={{ marginTop: '10px' }}>
                            <label className="form-label required">Upload Previous NOC Copy</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handlePendingFileChange(e, 'previous_noc')}
                                className="form-input"
                            />
                            {pendingUploads.previous_noc && <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#28a745' }}>Selected: {pendingUploads.previous_noc.name}</div>}
                        </div>
                    </div>
                )}
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Whether Industry is MSME</label>
                    <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                        <div className="noc-radio-item">
                            <input
                                type="radio"
                                name="isMSME"
                                id="msmeYes"
                                value="Yes"
                                checked={formData.isMSME === 'Yes'}
                                onChange={handleChange}
                            />
                            <label htmlFor="msmeYes">Yes</label>
                        </div>
                        <div className="noc-radio-item">
                            <input
                                type="radio"
                                name="isMSME"
                                id="msmeNo"
                                value="No"
                                checked={formData.isMSME === 'No'}
                                onChange={handleChange}
                            />
                            <label htmlFor="msmeNo">No</label>
                        </div>
                    </div>
                </div>

                {formData.isMSME === 'Yes' && (
                    <div className="noc-form-group">
                        <label className="form-label required">MSME Type</label>
                        <select
                            name="msmeType"
                            className={`form-input ${errors.msmeType ? 'error' : ''}`}
                            value={formData.msmeType}
                            onChange={handleChange}
                        >
                            <option value="">Select MSME Type</option>
                            {msmeTypeOptions.map(type => {
                                const label = typeof type === 'object' ? (type.label || type.name) : type;
                                const value = typeof type === 'object' ? (type.code || type.name) : type;
                                return <option key={value} value={value}>{label}</option>;
                            })}
                        </select>
                        {errors.msmeType && <span className="text-error">{errors.msmeType}</span>}
                    </div>
                )}
            </div>

            {formData.isMSME === 'Yes' && (
                <div className="noc-form-group">
                    <label className="form-label required">MSME Registration Number</label>
                    <input
                        type="text"
                        name="msmeRegistrationNumber"
                        className={`form-input ${errors.msmeRegistrationNumber ? 'error' : ''}`}
                        value={formData.msmeRegistrationNumber}
                        onChange={handleChange}
                        placeholder="Enter MSME/Udyam registration number"
                    />
                    {errors.msmeRegistrationNumber && <span className="text-error">{errors.msmeRegistrationNumber}</span>}
                    <span className="noc-form-help">Enter your valid MSME/Udyam registration number</span>
                    <div style={{ marginTop: '15px' }}>
                        <label className="form-label required">Upload MSME Certificate</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handlePendingFileChange(e, 'msme_certificate')}
                            className="form-input"
                        />
                        {pendingUploads.msme_certificate && <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#28a745' }}>Selected: {pendingUploads.msme_certificate.name}</div>}
                    </div>
                </div>
            )}

            {exemptionStatus?.isExempt && (() => {
                const displayConfig = getExemptionDisplayConfig(exemptionStatus);
                return (
                    <div className="noc-exemption-banner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '2rem' }}>{displayConfig.icon}</span>
                            <h3 style={{ margin: 0, color: '#155724' }}>{displayConfig.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}>
                            {exemptionStatus.message || displayConfig.message}
                        </p>
                        {displayConfig.details && displayConfig.details.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '6px', marginTop: '15px' }}>
                                <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>📝 Details:</p>
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {displayConfig.details.map((detail, idx) => (
                                        <li key={idx}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })()}

            <h3 className="form-section-header" style={{ marginTop: '30px', borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>Applicant Details</h3>

            <div className="noc-form-group">
                <label className="form-label required">Applicant Name</label>
                <input
                    type="text"
                    name="applicantName"
                    className={`form-input ${errors.applicantName ? 'error' : ''}`}
                    value={formData.applicantName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                />
                {errors.applicantName && <span className="text-error">{errors.applicantName}</span>}
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Email ID</label>
                    <input
                        type="email"
                        name="applicantEmail"
                        className={`form-input ${errors.applicantEmail ? 'error' : ''}`}
                        value={formData.applicantEmail}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                    />
                    {errors.applicantEmail && <span className="text-error">{errors.applicantEmail}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label required">Mobile Number</label>
                    <input
                        type="tel"
                        name="applicantMobile"
                        className={`form-input ${errors.applicantMobile ? 'error' : ''}`}
                        value={formData.applicantMobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                    />
                    {errors.applicantMobile && <span className="text-error">{errors.applicantMobile}</span>}
                </div>
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label">Aadhaar Number</label>
                    <input
                        type="text"
                        name="applicantAadhaar"
                        className={`form-input ${errors.applicantAadhaar ? 'error' : ''}`}
                        value={formData.applicantAadhaar}
                        onChange={handleChange}
                        placeholder="12-digit Aadhaar number"
                        maxLength="12"
                    />
                    {errors.applicantAadhaar && <span className="text-error">{errors.applicantAadhaar}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label">PAN Number</label>
                    <input
                        type="text"
                        name="applicantPAN"
                        className={`form-input ${errors.applicantPAN ? 'error' : ''}`}
                        value={formData.applicantPAN}
                        onChange={handleChange}
                        placeholder="PAN number"
                        maxLength="10"
                        style={{ textTransform: 'uppercase' }}
                    />
                    {errors.applicantPAN && <span className="text-error">{errors.applicantPAN}</span>}
                </div>
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Organization Name</label>
                    <input
                        type="text"
                        name="organizationName"
                        className={`form-input ${errors.organizationName ? 'error' : ''}`}
                        value={formData.organizationName}
                        onChange={handleChange}
                        placeholder="Enter organization name"
                    />
                    {errors.organizationName && <span className="text-error">{errors.organizationName}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label required">Organization Type</label>
                    <select
                        name="organizationType"
                        className={`form-input ${errors.organizationType ? 'error' : ''}`}
                        value={formData.organizationType}
                        onChange={handleChange}
                    >
                        <option value="">Select Organization Type</option>
                        {organizationTypeOptions.length > 0 ? (
                            organizationTypeOptions.map(type => {
                                const label = typeof type === 'object' ? type.label : type;
                                const value = typeof type === 'object' ? type.code : type;
                                return <option key={value} value={value}>{label}</option>;
                            })
                        ) : (
                            <>
                                <option value="Individual">Individual</option>
                                <option value="Private Limited">Private Limited Company</option>
                                <option value="Public Limited">Public Limited Company</option>
                                <option value="Partnership">Partnership Firm</option>
                                <option value="Proprietorship">Proprietorship</option>
                                <option value="Government">Government Organization</option>
                                <option value="Other">Other</option>
                            </>
                        )}
                    </select>
                    {errors.organizationType && <span className="text-error">{errors.organizationType}</span>}
                </div>
            </div>

            <div className="noc-form-group">
                <label className="form-label">Designation</label>
                <input
                    type="text"
                    name="designation"
                    className="form-input"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Your designation"
                />
            </div>
        </div>
    );
};

export default BasicDetailsStep;
