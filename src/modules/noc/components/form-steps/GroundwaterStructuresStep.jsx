import React from 'react';

/**
 * Step 4: Groundwater Abstraction Structures Component
 * Extracted from NOCApplication.jsx
 */
const GroundwaterStructuresStep = ({
    formData,
    handleChange,
    errors,
    existingStructures,
    addExistingStructure,
    removeExistingStructure,
    updateExistingStructure,
    structureTypes
}) => {
    return (
        <div>
            <h3 className="form-section-header">Groundwater Abstraction Structures</h3>

            <div className="bhuneer-info-box">
                <p>Please provide details of all existing and proposed groundwater abstraction structures.</p>
            </div>

            {/* Existing Structures */}
            <div className="noc-card" style={{ marginBottom: '30px' }}>
                <div className="noc-card-header">
                    Existing Structures
                    <button
                        type="button"
                        onClick={addExistingStructure}
                        className="noc-btn noc-btn-primary"
                        style={{ float: 'right', padding: '5px 15px', fontSize: '0.85rem' }}
                    >
                        + Add Structure
                    </button>
                </div>
                <div className="noc-card-body">
                    {existingStructures.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--cgwa-text-secondary)', padding: '20px' }}>
                            No existing structures added. Click "Add Structure" to add details.
                        </p>
                    ) : (
                        existingStructures.map((structure, index) => (
                            <div key={structure.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--cgwa-border-light)', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Structure #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeExistingStructure(structure.id)}
                                        className="noc-btn noc-btn-danger"
                                        style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="form-label required">Type of Structure</label>
                                        <select
                                            className="form-input"
                                            value={structure.type}
                                            onChange={(e) => updateExistingStructure(structure.id, 'type', e.target.value)}
                                        >
                                            <option value="">Select Type</option>
                                            {structureTypes.map(type => {
                                                const label = typeof type === 'object' ? (type.label || type.name || type.code) : type;
                                                const value = typeof type === 'object' ? (type.code || type.name || type.label) : type;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="form-label">Year of Construction</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={structure.yearOfConstruction}
                                            onChange={(e) => updateExistingStructure(structure.id, 'yearOfConstruction', e.target.value)}
                                            placeholder="YYYY"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="form-label">Depth (meters)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={structure.depth}
                                            onChange={(e) => updateExistingStructure(structure.id, 'depth', e.target.value)}
                                            placeholder="Depth"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                {/* Pump Details */}
                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="form-label">Pump Type</label>
                                        <select
                                            className="form-input"
                                            value={structure.pumpType || ''}
                                            onChange={(e) => updateExistingStructure(structure.id, 'pumpType', e.target.value)}
                                        >
                                            <option value="">Select Pump Type</option>
                                            <option value="Submersible">Submersible</option>
                                            <option value="Centrifugal">Centrifugal</option>
                                            <option value="Jet">Jet Pump</option>
                                            <option value="Turbine">Turbine Pump</option>
                                        </select>
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="form-label">Pump Capacity (HP)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={structure.pumpCapacity}
                                            onChange={(e) => updateExistingStructure(structure.id, 'pumpCapacity', e.target.value)}
                                            placeholder="HP"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="form-label">Operating Hours</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={structure.operatingHours}
                                            onChange={(e) => updateExistingStructure(structure.id, 'operatingHours', e.target.value)}
                                            placeholder="Hours/Day"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                        />
                                    </div>
                                </div>

                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="form-label">Discharge Rate (m³/hr)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={structure.discharge}
                                            onChange={(e) => updateExistingStructure(structure.id, 'discharge', e.target.value)}
                                            placeholder="Auto-calculated"
                                            readOnly
                                            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                        />
                                        <span className="noc-form-help">Calculated based on pump details (Eff: 60%)</span>
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="form-label">Water Meter Fitted?</label>
                                    <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '20px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name={`hasMeter_${structure.id}`}
                                                value="Yes"
                                                checked={structure.hasMeter === 'Yes'}
                                                onChange={(e) => updateExistingStructure(structure.id, 'hasMeter', e.target.value)}
                                            />
                                            Yes
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name={`hasMeter_${structure.id}`}
                                                value="No"
                                                checked={structure.hasMeter === 'No'}
                                                onChange={(e) => updateExistingStructure(structure.id, 'hasMeter', e.target.value)}
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Proposed Structures */}
            <div className="noc-card">
                <div className="noc-card-header">Proposed Structures</div>
                <div className="noc-card-body">
                    {errors.proposedStructures && (
                        <div className="noc-alert noc-alert-danger" style={{ marginBottom: '20px' }}>
                            {errors.proposedStructures}
                        </div>
                    )}

                    <div className="noc-form-row three-col">
                        <div className="noc-form-group">
                            <label className="form-label">Number of Borewells</label>
                            <input
                                type="number"
                                name="proposedBorewells"
                               className="form-input"
                                value={formData.proposedBorewells}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="noc-form-group">
                            <label className="form-label">Number of Tubewells</label>
                            <input
                                type="number"
                                name="proposedTubewells"
                                className="form-input"
                                value={formData.proposedTubewells}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        <div className="noc-form-group">
                            <label className="form-label">Number of Pumps</label>
                            <input
                                type="number"
                                name="proposedPumps"
                                className="form-input"
                                value={formData.proposedPumps}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroundwaterStructuresStep;
