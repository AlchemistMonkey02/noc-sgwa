// Piezometer Requirements Component
// Auto-calculates and displays piezometer requirements based on extraction and geology

import React, { useState, useEffect } from 'react';
import { calculatePiezometerRequirement, getGeologyType } from '../utils/blockClassification';

const PiezometerRequirements = ({ formData, onUpdate }) => {
    const [piezometerReq, setPiezometerReq] = useState({
        required: false,
        reason: '',
        specifications: null
    });

    const [piezometerDetails, setPiezometerDetails] = useState({
        distanceFromWell: '',
        depth: '',
        monitoringFrequency: 'Monthly',
        qualityTestingFrequency: 'Annual',
        nablLabName: '',
        installationDate: '',
        piezometerLocation: '',
        coordinates: { latitude: '', longitude: '' }
    });

    useEffect(() => {
        // Auto-calculate piezometer requirement
        if (formData.dailyWaterRequirement && formData.district) {
            const geologyType = getGeologyType(formData.district);
            const requirement = calculatePiezometerRequirement(
                parseFloat(formData.dailyWaterRequirement),
                geologyType
            );
            setPiezometerReq(requirement);

            // Update parent with requirement status
            if (onUpdate) {
                onUpdate({
                    piezometerRequired: requirement.required,
                    geologyType: geologyType
                });
            }
        }
    }, [formData.dailyWaterRequirement, formData.district]);

    const handleChange = (field, value) => {
        const updated = { ...piezometerDetails, [field]: value };
        setPiezometerDetails(updated);

        if (onUpdate) {
            onUpdate({ piezometerDetails: updated });
        }
    };

    const handleCoordinateChange = (coord, value) => {
        const updated = {
            ...piezometerDetails,
            coordinates: {
                ...piezometerDetails.coordinates,
                [coord]: value
            }
        };
        setPiezometerDetails(updated);

        if (onUpdate) {
            onUpdate({ piezometerDetails: updated });
        }
    };

    return (
        <div className="noc-piezometer-section">
            {/* Requirement Status */}
            <div className={`noc-alert ${piezometerReq.required ? 'noc-alert-warning' : 'noc-alert-info'}`}
                style={{ marginBottom: '20px' }}>
                <strong>{piezometerReq.required ? '⚠️ Piezometer Required' : 'ℹ️ Piezometer Status'}:</strong>
                <p style={{ margin: '10px 0 0 0' }}>{piezometerReq.reason}</p>
            </div>

            {piezometerReq.required && (
                <>
                    {/* Specifications Card */}
                    <div className="noc-card" style={{ marginBottom: '20px', background: '#fff8e1', border: '2px solid #ffc107' }}>
                        <div className="noc-card-header" style={{ background: '#ffc107', color: '#000' }}>
                            Piezometer Specifications (As per Annexure-2)
                        </div>
                        <div className="noc-card-body">
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li><strong>Minimum Distance:</strong> {piezometerReq.specifications.minimumDistance}</li>
                                <li><strong>Depth:</strong> {piezometerReq.specifications.depth}</li>
                                <li><strong>Water Level Monitoring:</strong> {piezometerReq.specifications.monitoring}</li>
                                <li><strong>Water Quality Testing:</strong> {piezometerReq.specifications.waterQuality}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Piezometer Details Form */}
                    <div className="noc-card" style={{ marginBottom: '20px' }}>
                        <div className="noc-card-header">Piezometer Installation Details</div>
                        <div className="noc-card-body">
                            <div className="noc-form-row">
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Distance from Pumping Well (meters)</label>
                                    <input
                                        type="number"
                                        className="noc-form-control"
                                        value={piezometerDetails.distanceFromWell}
                                        onChange={(e) => handleChange('distanceFromWell', e.target.value)}
                                        placeholder="e.g., 50"
                                        min="50"
                                    />
                                    <span className="noc-form-help">Must be ≥50 meters from pumping well</span>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Piezometer Depth (meters)</label>
                                    <input
                                        type="number"
                                        className="noc-form-control"
                                        value={piezometerDetails.depth}
                                        onChange={(e) => handleChange('depth', e.target.value)}
                                        placeholder="Equal to pumping well depth"
                                    />
                                    <span className="noc-form-help">Should equal pumping well depth</span>
                                </div>
                            </div>

                            <div className="noc-form-row">
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Piezometer Location</label>
                                    <input
                                        type="text"
                                        className="noc-form-control"
                                        value={piezometerDetails.piezometerLocation}
                                        onChange={(e) => handleChange('piezometerLocation', e.target.value)}
                                        placeholder="Describe location relative to pumping well"
                                    />
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">Proposed Installation Date</label>
                                    <input
                                        type="date"
                                        className="noc-form-control"
                                        value={piezometerDetails.installationDate}
                                        onChange={(e) => handleChange('installationDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="noc-form-row">
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">GPS Coordinates - Latitude</label>
                                    <input
                                        type="text"
                                        className="noc-form-control"
                                        value={piezometerDetails.coordinates.latitude}
                                        onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                                        placeholder="e.g., 26.1445"
                                    />
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">GPS Coordinates - Longitude</label>
                                    <input
                                        type="text"
                                        className="noc-form-control"
                                        value={piezometerDetails.coordinates.longitude}
                                        onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                                        placeholder="e.g., 91.7362"
                                    />
                                </div>
                            </div>

                            <div className="noc-form-group">
                                <label className="noc-form-label required">NABL Accredited Lab for Water Quality Testing</label>
                                <input
                                    type="text"
                                    className="noc-form-control"
                                    value={piezometerDetails.nablLabName}
                                    onChange={(e) => handleChange('nablLabName', e.target.value)}
                                    placeholder="Name of NABL accredited laboratory"
                                />
                                <span className="noc-form-help">Annual water quality testing must be done by NABL accredited labs</span>
                            </div>
                        </div>
                    </div>

                    {/* Monitoring Commitments */}
                    <div className="noc-card" style={{ background: '#e3f2fd', border: '1px solid #2196f3' }}>
                        <div className="noc-card-header" style={{ background: '#2196f3', color: 'white' }}>
                            Monitoring Commitments
                        </div>
                        <div className="noc-card-body">
                            <div className="noc-checkbox-item">
                                <input type="checkbox" id="commit-monthly" required />
                                <label htmlFor="commit-monthly">
                                    I commit to record and submit <strong>monthly water level data</strong> from the piezometer
                                </label>
                            </div>
                            <div className="noc-checkbox-item">
                                <input type="checkbox" id="commit-annual" required />
                                <label htmlFor="commit-annual">
                                    I commit to conduct <strong>annual water quality testing</strong> through NABL accredited laboratory
                                </label>
                            </div>
                            <div className="noc-checkbox-item">
                                <input type="checkbox" id="commit-display" required />
                                <label htmlFor="commit-display">
                                    I will install a <strong>display board</strong> showing piezometer details at the site
                                </label>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PiezometerRequirements;
