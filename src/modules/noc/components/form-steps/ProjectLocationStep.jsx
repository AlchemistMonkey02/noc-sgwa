import React from 'react';

/**
 * Step 2: Project & Location Details Component
 * Extracted from NOCApplication.jsx
 */
const ProjectLocationStep = ({
    formData,
    handleChange,
    errors,
    stateOptions,
    districtOptions,
    availableBlocks,
    blockCategoryDetails,
    assessmentUnitOptions,
    geologyTypes,
    waterQualityOptions
}) => {
    return (
        <div>
            <h3 className="form-section-header">Project & Location Details</h3>

            <div className="noc-form-group">
                <label className="form-label required">Project Name</label>
                <input
                    type="text"
                    name="projectName"
                    className={`form-input ${errors.projectName ? 'error' : ''}`}
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="Enter project name"
                />
                {errors.projectName && <span className="text-error">{errors.projectName}</span>}
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">State</label>
                    <select
                        name="state"
                        className={`form-input ${errors.state ? 'error' : ''}`}
                        value={formData.state}
                        onChange={handleChange}
                        disabled={true}
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    >
                        <option value="">Select State</option>
                        {stateOptions.map((state, index) => {
                            const val = typeof state === 'object' ? (state.stateId || state.id || state.name) : state;
                            const label = typeof state === 'object' ? (state.stateName || state.name) : state;
                            return <option key={index} value={val}>{label}</option>;
                        })}
                    </select>
                    {errors.state && <span className="text-error">{errors.state}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label required">District</label>
                    <select
                        name="district"
                        className={`form-input ${errors.district ? 'error' : ''}`}
                        value={formData.district || ''}
                        onChange={handleChange}
                    >
                        <option value="">Select District</option>
                        {districtOptions.map((dist, index) => {
                            const val = typeof dist === 'object' ? (dist.districtName || dist.name) : dist;
                            return <option key={index} value={val}>{val}</option>;
                        })}
                    </select>
                    {errors.district && <span className="text-error">{errors.district}</span>}
                </div>
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Block</label>
                    <select
                        name="block"
                        className={`form-input ${errors.block ? 'error' : ''}`}
                        value={formData.block || ''}
                        onChange={handleChange}
                        disabled={!formData.district}
                    >
                        <option value="">Select Block</option>
                        {availableBlocks.map((block, index) => {
                            const val = typeof block === 'object' ? (block.blockName || block.name) : block;
                            return <option key={index} value={val}>{val}</option>;
                        })}
                    </select>
                    {errors.block && <span className="text-error">{errors.block}</span>}
                    {!formData.district && (
                        <span className="noc-form-help">Please select a district first</span>
                    )}
                </div>
            </div>

            {blockCategoryDetails && (
                <div className="noc-alert" style={{
                    marginTop: '15px',
                    background: blockCategoryDetails.category === 'SAFE' ? '#d4edda' :
                        blockCategoryDetails.category === 'SEMI_CRITICAL' ? '#fff3cd' :
                            blockCategoryDetails.category === 'CRITICAL' ? '#f8d7da' :
                                blockCategoryDetails.category === 'OVER_EXPLOITED' ? '#f5c6cb' : '#e2e3e5',
                    color: blockCategoryDetails.category === 'SAFE' ? '#155724' :
                        blockCategoryDetails.category === 'SEMI_CRITICAL' ? '#856404' :
                            blockCategoryDetails.category === 'CRITICAL' ? '#721c24' :
                                blockCategoryDetails.category === 'OVER_EXPLOITED' ? '#721c24' : '#383d41',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    padding: '10px'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        Category: {blockCategoryDetails.category?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                        {blockCategoryDetails.description}
                    </div>
                </div>
            )}

            {/* Block Eligibility Warning */}
            {formData.blockEligibilityWarning && (
                <div className="noc-alert noc-alert-danger" style={{ marginBottom: '20px' }}>
                    <strong>⚠ Restriction Notice:</strong>
                    <p style={{ margin: '5px 0 0 0' }}>{formData.blockEligibilityWarning}</p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        This application will be subject to additional scrutiny by the authority.
                    </p>
                </div>
            )}

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Assessment Unit</label>
                    <select
                        name="assessmentUnit"
                        className={`form-input ${errors.assessmentUnit ? 'error' : ''}`}
                        value={formData.assessmentUnit}
                        onChange={handleChange}
                    >
                        <option value="">Select Assessment Unit</option>
                        {assessmentUnitOptions.length > 0 ? (
                            assessmentUnitOptions.map((unit, index) => {
                                const val = typeof unit === 'object' ? (unit.name || unit.assessmentUnitName) : unit;
                                return (
                                    <option key={index} value={val}>
                                        {val}
                                    </option>
                                );
                            })
                        ) : (
                            <option value="" disabled>No units found for this district</option>
                        )}
                    </select>
                    {errors.assessmentUnit && <span className="text-error">{errors.assessmentUnit}</span>}

                    {/* Display Selected Assessment Unit Category */}
                    {(() => {
                        const selectedUnit = assessmentUnitOptions.find(u =>
                            (typeof u === 'object' ? (u.name === formData.assessmentUnit || u.assessmentUnitName === formData.assessmentUnit) : u === formData.assessmentUnit)
                        );

                        if (selectedUnit && selectedUnit.category) {
                            const cat = selectedUnit.category.toUpperCase();
                            const styles = {
                                'SAFE': { bg: '#d4edda', color: '#155724' },
                                'SEMI_CRITICAL': { bg: '#fff3cd', color: '#856404' },
                                'CRITICAL': { bg: '#f8d7da', color: '#721c24' },
                                'OVER_EXPLOITED': { bg: '#f5c6cb', color: '#721c24' }
                            };
                            const style = styles[cat] || { bg: '#e2e3e5', color: '#383d41' };

                            return (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '10px 15px',
                                    backgroundColor: style.bg,
                                    color: style.color,
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    Category: {cat.replace('_', ' ')}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                <div className="noc-form-group">
                    <label className="form-label">Village / Town</label>
                    <input
                        type="text"
                        name="village"
                        className={`form-input ${errors.village ? 'error' : ''}`}
                        value={formData.village || ''}
                        onChange={handleChange}
                        placeholder="Enter Village or Town name"
                    />
                    {errors.village && <span className="text-error">{errors.village}</span>}
                </div>
            </div>

            <div className="noc-form-group">
                <label className="form-label required">Project Address</label>
                <textarea
                    name="projectAddress"
                    className={`form-input ${errors.projectAddress ? 'error' : ''}`}
                    value={formData.projectAddress}
                    onChange={handleChange}
                    placeholder="Enter complete project address"
                    rows="3"
                />
                {errors.projectAddress && <span className="text-error">{errors.projectAddress}</span>}
            </div>

            <div className="noc-form-row three-col">
                <div className="noc-form-group">
                    <label className="form-label required">PIN Code</label>
                    <input
                        type="text"
                        name="pincode"
                        className={`form-input ${errors.pincode ? 'error' : ''}`}
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        maxLength="6"
                    />
                    {errors.pincode && <span className="text-error">{errors.pincode}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label">Latitude</label>
                    <input
                        type="text"
                        name="latitude"
                        className={`form-input ${errors.latitude ? 'error' : ''}`}
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="e.g., 28.7041"
                    />
                    {errors.latitude && <span className="text-error">{errors.latitude}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label">Longitude</label>
                    <input
                        type="text"
                        name="longitude"
                        className={`form-input ${errors.longitude ? 'error' : ''}`}
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="e.g., 77.1025"
                    />
                    {errors.longitude && <span className="text-error">{errors.longitude}</span>}
                </div>
            </div>

            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label required">Aquifer Type</label>
                    <select
                        name="geology"
                        className={`form-input ${errors.geology ? 'error' : ''}`}
                        value={formData.geology}
                        onChange={handleChange}
                    >
                        <option value="">Select Geology</option>
                        {geologyTypes.map(type => {
                            const label = typeof type === 'object' ? (type.label || type.name || type.code) : type;
                            const value = typeof type === 'object' ? (type.code || type.name || type.label) : type;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.geology && <span className="text-error">{errors.geology}</span>}
                </div>

                <div className="noc-form-group">
                    <label className="form-label required">Water Quality</label>
                    <select
                        name="waterQualityType"
                        className={`form-input ${errors.waterQualityType ? 'error' : ''}`}
                        value={formData.waterQualityType}
                        onChange={handleChange}
                    >
                        <option value="">Select Water Quality</option>
                        {waterQualityOptions.map(option => {
                            const label = typeof option === 'object' ? (option.label || option.name || option.code) : option;
                            const value = typeof option === 'object' ? (option.code || option.name || option.label) : option;
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    {errors.waterQualityType && <span className="text-error">{errors.waterQualityType}</span>}
                </div>
            </div>

            {formData.geology === 'Other' && (
                <div className="noc-form-group" style={{ marginTop: '10px' }}>
                    <input
                        type="text"
                        name="otherGeology"
                        className={`form-input ${errors.otherGeology ? 'error' : ''}`}
                        value={formData.otherGeology}
                        onChange={handleChange}
                        placeholder="Please specify geology type"
                    />
                    {errors.otherGeology && <span className="text-error">{errors.otherGeology}</span>}
                </div>
            )}

            {/* Land Use Details Section */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Land Use Details (sq.m)</h4>
                <div className="noc-form-row three-col">
                    <div className="noc-form-group">
                        <label className="form-label">Total Land Area</label>
                        <input
                            type="number"
                            name="landUseTotalArea"
                            className="form-input"
                            value={formData.landUseTotalArea}
                            onChange={handleChange}
                            placeholder="Total Area"
                            min="0"
                        />
                        {errors.landUseTotalArea && <span className="text-error">{errors.landUseTotalArea}</span>}
                    </div>
                    <div className="noc-form-group">
                        <label className="form-label">Rooftop Area</label>
                        <input
                            type="number"
                            name="landUseRooftopArea"
                            className="form-input"
                            value={formData.landUseRooftopArea}
                            onChange={handleChange}
                            placeholder="Rooftop Area"
                            min="0"
                        />
                    </div>
                    <div className="noc-form-group">
                        <label className="form-label">Paved Area</label>
                        <input
                            type="number"
                            name="landUsePavedArea"
                            className="form-input"
                            value={formData.landUsePavedArea}
                            onChange={handleChange}
                            placeholder="Paved Area"
                            min="0"
                        />
                    </div>
                </div>
                <div className="noc-form-row two-col">
                    <div className="noc-form-group">
                        <label className="form-label">Green Belt Area</label>
                        <input
                            type="number"
                            name="landUseGreenBeltArea"
                            className="form-input"
                            value={formData.landUseGreenBeltArea}
                            onChange={handleChange}
                            placeholder="Green Belt Area"
                            min="0"
                        />
                    </div>
                    <div className="noc-form-group">
                        <label className="form-label">Open Area</label>
                        <input
                            type="number"
                            name="landUseOpenArea"
                            className="form-input"
                            value={formData.landUseOpenArea}
                            onChange={handleChange}
                            placeholder="Open Area"
                            min="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectLocationStep;
