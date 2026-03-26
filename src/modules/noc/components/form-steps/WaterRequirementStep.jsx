import React from 'react';

/**
 * Step 3: Water Requirement Details Component
 * Extracted from NOCApplication.jsx
 */
const WaterRequirementStep = ({
    formData,
    handleChange,
    errors
}) => {
    return (
        <div>
            <h3 className="form-section-header">Water Requirement Details (m³/day)</h3>

            <div className="bhuneer-info-box">
                <p>Please provide the daily water requirement details for the project.</p>
            </div>

            <h4 style={{ color: 'var(--primary-color)', margin: '15px 0' }}>Drinking & Domestic Population</h4>
            <div className="noc-form-row three-col">
                <div className="noc-form-group">
                    <label className="form-label">Number of Workers</label>
                    <input
                        type="number"
                        name="numberOfWorkers"
                        className="form-input"
                        value={formData.numberOfWorkers}
                        onChange={handleChange}
                        placeholder="Number of workers"
                        min="0"
                    />
                    <span className="noc-form-help">Calculated @ 45 Liters/day</span>
                </div>
                <div className="noc-form-group">
                    <label className="form-label">Number of Residents</label>
                    <input
                        type="number"
                        name="numberOfResidents"
                        className="form-input"
                        value={formData.numberOfResidents}
                        onChange={handleChange}
                        placeholder="Number of residents"
                        min="0"
                    />
                </div>
                <div className="noc-form-group">
                    <label className="form-label">Liters Per Person/Day</label>
                    <input
                        type="number"
                        name="dailyRequirementPerPerson"
                        className="form-input"
                        value={formData.dailyRequirementPerPerson}
                        onChange={handleChange}
                        placeholder="Default 135"
                        min="0"
                    />
                    <span className="noc-form-help">Standard: 135 Liters</span>
                </div>
            </div>

            <h4 style={{ color: 'var(--primary-color)', margin: '15px 0' }}>Total Water Requirement</h4>
            <div className="noc-form-row three-col">
                <div className="noc-form-group">
                    <label className="form-label required">Fresh Water Requirement</label>
                    <input
                        type="number"
                        name="waterReqFreshRequirement"
                        className="form-input"
                        value={formData.waterReqFreshRequirement}
                        onChange={handleChange}
                        placeholder="Fresh Water"
                        min="0"
                    />
                </div>
                <div className="noc-form-group">
                    <label className="form-label">Recycled Water Used</label>
                    <input
                        type="number"
                        name="waterReqRecycled"
                        className="form-input"
                        value={formData.waterReqRecycled}
                        onChange={handleChange}
                        placeholder="Recycled Water"
                        min="0"
                    />
                </div>
                <div className="noc-form-group">
                    <label className="form-label">Total Requirement</label>
                    <input
                        type="number"
                        name="waterReqTotal"
                        className="form-input"
                        value={formData.waterReqTotal}
                        onChange={handleChange}
                        placeholder="Total Requirement"
                        min="0"
                    />
                    <span className="noc-form-help">Auto-calculated (Fresh + Recycled)</span>
                    {errors.waterReqTotal && <span className="text-error">{errors.waterReqTotal}</span>}
                </div>
            </div>

            <h4 style={{ color: 'var(--primary-color)', margin: '20px 0 15px 0' }}>Requirement Breakdown (Usage)</h4>
            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label">Domestic Use</label>
                    <input
                        type="number"
                        name="waterReqDomestic"
                        className="form-input"
                        value={formData.waterReqDomestic}
                        onChange={handleChange}
                        placeholder="Domestic"
                        min="0"
                    />
                </div>
                <div className="noc-form-group">
                    <label className="form-label">Industrial Use</label>
                    <input
                        type="number"
                        name="waterReqIndustrial"
                        className="form-input"
                        value={formData.waterReqIndustrial}
                        onChange={handleChange}
                        placeholder="Industrial"
                        min="0"
                    />
                </div>
            </div>
            <div className="noc-form-row two-col">
                <div className="noc-form-group">
                    <label className="form-label">Green Belt / Horticulture</label>
                    <input
                        type="number"
                        name="waterReqGreenBelt"
                        className="form-input"
                        value={formData.waterReqGreenBelt}
                        onChange={handleChange}
                        placeholder="Green Belt"
                        min="0"
                    />
                </div>
                <div className="noc-form-group">
                    <label className="form-label">Other Uses</label>
                    <input
                        type="number"
                        name="waterReqOther"
                        className="form-input"
                        value={formData.waterReqOther}
                        onChange={handleChange}
                        placeholder="Others"
                        min="0"
                    />
                </div>
            </div>
        </div>
    );
};

export default WaterRequirementStep;
