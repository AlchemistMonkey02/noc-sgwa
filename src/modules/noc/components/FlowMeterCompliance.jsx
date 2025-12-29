// Digital Flow Meter Compliance Component
// Mandatory for ALL NOC holders for daily abstraction tracking

import React, { useState } from 'react';

const FlowMeterCompliance = ({ formData, onUpdate }) => {
    const [flowMeterDetails, setFlowMeterDetails] = useState({
        meterType: '',
        manufacturer: '',
        modelNumber: '',
        serialNumber: '',
        bisStandard: '',
        telemetryEnabled: 'Yes',
        telemetryProvider: '',
        installationProposedDate: '',
        calibrationDate: '',
        calibrationCertificate: null
    });

    const handleChange = (field, value) => {
        const updated = { ...flowMeterDetails, [field]: value };
        setFlowMeterDetails(updated);

        if (onUpdate) {
            onUpdate({ flowMeterDetails: updated });
        }
    };

    const handleFileUpload = (field, file) => {
        const updated = { ...flowMeterDetails, [field]: file };
        setFlowMeterDetails(updated);

        if (onUpdate) {
            onUpdate({ flowMeterDetails: updated });
        }
    };

    return (
        <div className="noc-flowmeter-section">
            {/* Mandatory Notice */}
            <div className="noc-alert noc-alert-danger" style={{ marginBottom: '20px' }}>
                <strong>🔴 MANDATORY REQUIREMENT:</strong>
                <p style={{ margin: '10px 0 0 0' }}>
                    Digital Water Flow Meter with telemetry is <strong>MANDATORY</strong> for all NOC holders as per SGWA Regulations.
                    Installation must be completed within <strong>30 days</strong> of NOC issuance.
                </p>
            </div>

            {/* Flow Meter Specifications Card */}
            <div className="noc-card" style={{ marginBottom: '20px', background: '#ffebee', border: '2px solid #f44336' }}>
                <div className="noc-card-header" style={{ background: '#f44336', color: 'white' }}>
                    Flow Meter Specifications (Mandatory)
                </div>
                <div className="noc-card-body">
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li><strong>Standard:</strong> BIS/IS certified</li>
                        <li><strong>Type:</strong> Digital flow meter</li>
                        <li><strong>Feature:</strong> Tamper-proof</li>
                        <li><strong>Telemetry:</strong> Mandatory (real-time data transmission)</li>
                        <li><strong>Data:</strong> Daily abstraction data</li>
                        <li><strong>Logbook:</strong> Auto-generated digital logbook</li>
                        <li><strong>Installation:</strong> Within 30 days of NOC issue</li>
                    </ul>
                </div>
            </div>

            {/* Flow Meter Details Form */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">Digital Flow Meter Details</div>
                <div className="noc-card-body">
                    <div className="noc-form-row">
                        <div className="noc-form-group">
                            <label className="noc-form-label required">Meter Type</label>
                            <select
                                className="noc-form-control"
                                value={flowMeterDetails.meterType}
                                onChange={(e) => handleChange('meterType', e.target.value)}
                            >
                                <option value="">Select Meter Type</option>
                                <option value="Electromagnetic">Electromagnetic Flow Meter</option>
                                <option value="Ultrasonic">Ultrasonic Flow Meter</option>
                                <option value="Turbine">Turbine Flow Meter</option>
                                <option value="Positive Displacement">Positive Displacement Meter</option>
                                <option value="Other">Other (BIS/IS Certified)</option>
                            </select>
                        </div>

                        <div className="noc-form-group">
                            <label className="noc-form-label required">Manufacturer Name</label>
                            <input
                                type="text"
                                className="noc-form-control"
                                value={flowMeterDetails.manufacturer}
                                onChange={(e) => handleChange('manufacturer', e.target.value)}
                                placeholder="Flow meter manufacturer"
                            />
                        </div>
                    </div>

                    <div className="noc-form-row">
                        <div className="noc-form-group">
                            <label className="noc-form-label required">Model Number</label>
                            <input
                                type="text"
                                className="noc-form-control"
                                value={flowMeterDetails.modelNumber}
                                onChange={(e) => handleChange('modelNumber', e.target.value)}
                                placeholder="Model number"
                            />
                        </div>

                        <div className="noc-form-group">
                            <label className="noc-form-label">Serial Number</label>
                            <input
                                type="text"
                                className="noc-form-control"
                                value={flowMeterDetails.serialNumber}
                                onChange={(e) => handleChange('serialNumber', e.target.value)}
                                placeholder="Serial number (if known)"
                            />
                            <span className="noc-form-help">Can be updated after installation</span>
                        </div>
                    </div>

                    <div className="noc-form-row">
                        <div className="noc-form-group">
                            <label className="noc-form-label required">BIS/IS Standard Certification Number</label>
                            <input
                                type="text"
                                className="noc-form-control"
                                value={flowMeterDetails.bisStandard}
                                onChange={(e) => handleChange('bisStandard', e.target.value)}
                                placeholder="e.g., IS 2373, IS 6421"
                            />
                            <span className="noc-form-help">Meter must comply with BIS/IS standards</span>
                        </div>

                        <div className="noc-form-group">
                            <label className="noc-form-label">Calibration Date</label>
                            <input
                                type="date"
                                className="noc-form-control"
                                value={flowMeterDetails.calibrationDate}
                                onChange={(e) => handleChange('calibrationDate', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Telemetry System Details */}
            <div className="noc-card" style={{ marginBottom: '20px' }}>
                <div className="noc-card-header">Telemetry System (Mandatory)</div>
                <div className="noc-card-body">
                    <div className="noc-alert noc-alert-info" style={{ marginBottom: '15px' }}>
                        <strong>ℹ️ Telemetry Requirement:</strong> Flow meter must have telemetry capability for real-time data transmission to SGWA monitoring system
                    </div>

                    <div className="noc-form-row">
                        <div className="noc-form-group">
                            <label className="noc-form-label required">Telemetry Enabled</label>
                            <div className="noc-radio-group">
                                <div className="noc-radio-item">
                                    <input
                                        type="radio"
                                        id="telemetry-yes"
                                        name="telemetryEnabled"
                                        value="Yes"
                                        checked={flowMeterDetails.telemetryEnabled === 'Yes'}
                                        onChange={(e) => handleChange('telemetryEnabled', e.target.value)}
                                    />
                                    <label htmlFor="telemetry-yes">Yes (Mandatory)</label>
                                </div>
                                <div className="noc-radio-item">
                                    <input
                                        type="radio"
                                        id="telemetry-no"
                                        name="telemetryEnabled"
                                        value="No"
                                        checked={flowMeterDetails.telemetryEnabled === 'No'}
                                        onChange={(e) => handleChange('telemetryEnabled', e.target.value)}
                                        disabled
                                    />
                                    <label htmlFor="telemetry-no" style={{ opacity: 0.5 }}>
                                        No (Not allowed)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="noc-form-group">
                            <label className="noc-form-label required">Telemetry Service Provider</label>
                            <input
                                type="text"
                                className="noc-form-control"
                                value={flowMeterDetails.telemetryProvider}
                                onChange={(e) => handleChange('telemetryProvider', e.target.value)}
                                placeholder="Name of telemetry service provider"
                            />
                        </div>
                    </div>

                    <div className="noc-form-group">
                        <label className="noc-form-label required">Proposed Installation Date</label>
                        <input
                            type="date"
                            className="noc-form-control"
                            value={flowMeterDetails.installationProposedDate}
                            onChange={(e) => handleChange('installationProposedDate', e.target.value)}
                        />
                        <span className="noc-form-help">Must be within 30 days of NOC issuance</span>
                    </div>
                </div>
            </div>

            {/* Compliance Commitments */}
            <div className="noc-card" style={{ background: '#e8f5e9', border: '1px solid #4caf50' }}>
                <div className="noc-card-header" style={{ background: '#4caf50', color: 'white' }}>
                    Flow Meter Compliance Commitments
                </div>
                <div className="noc-card-body">
                    <div className="noc-checkbox-item">
                        <input type="checkbox" id="commit-install-30" required />
                        <label htmlFor="commit-install-30">
                            I commit to install the digital flow meter <strong>within 30 days</strong> of NOC issuance
                        </label>
                    </div>
                    <div className="noc-checkbox-item">
                        <input type="checkbox" id="commit-telemetry" required />
                        <label htmlFor="commit-telemetry">
                            I commit to maintain <strong>telemetry connectivity</strong> for real-time data transmission
                        </label>
                    </div>
                    <div className="noc-checkbox-item">
                        <input type="checkbox" id="commit-daily-data" required />
                        <label htmlFor="commit-daily-data">
                            I commit to ensure <strong>daily abstraction data</strong> is transmitted to SGWA
                        </label>
                    </div>
                    <div className="noc-checkbox-item">
                        <input type="checkbox" id="commit-tamper" required />
                        <label htmlFor="commit-tamper">
                            I understand that <strong>tampering with the flow meter</strong> will result in penalties and NOC revocation
                        </label>
                    </div>
                    <div className="noc-checkbox-item">
                        <input type="checkbox" id="commit-logbook" required />
                        <label htmlFor="commit-logbook">
                            I will maintain a <strong>digital logbook</strong> of daily water abstraction
                        </label>
                    </div>
                </div>
            </div>

            {/* Penalty Warning */}
            <div className="noc-alert noc-alert-warning" style={{ marginTop: '20px' }}>
                <strong>⚠️ Penalty for Non-Compliance:</strong>
                <p style={{ margin: '10px 0 0 0' }}>
                    Failure to install flow meter or data non-submission will result in <strong>₹2,00,000 penalty</strong> as per Annexure-5
                </p>
            </div>
        </div>
    );
};

export default FlowMeterCompliance;
