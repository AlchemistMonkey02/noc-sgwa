import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const ApprovalForm = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        approvalType: 'CONDITIONAL_APPROVAL',
        nocNumber: 'RJ/CGWA/NOC/2026/001234',
        validityYears: 3,
        validFrom: '2026-01-22',
        validUpto: '2029-01-21',
        maxDailyExtraction: 150.25,
        maxAnnualExtraction: 54841.25,
        conditions: [
            'Install digital flow meter with telemetry within 30 days of NOC issuance',
            'Install piezometer at GPS coordinates within 60 days',
            'Submit quarterly groundwater monitoring reports',
            'Implement rainwater harvesting structures within 90 days',
            'No groundwater withdrawal during monsoon season (July-September)'
        ],
        cessAmount: 3235633.75,
        approvalRemarks: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // API call to approve application
        alert('NOC Approved Successfully!');
        navigate('/officer/enforcement/dashboard');
    };

    const addCondition = () => {
        setFormData({
            ...formData,
            conditions: [...formData.conditions, '']
        });
    };

    const updateCondition = (index, value) => {
        const newConditions = [...formData.conditions];
        newConditions[index] = value;
        setFormData({ ...formData, conditions: newConditions });
    };

    const removeCondition = (index) => {
        setFormData({
            ...formData,
            conditions: formData.conditions.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Suresh Patel"
                officerRole="ENFORCEMENT"
                officerDesignation="Chief Engineer"
                district=""
            />

            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">✅ Approve NOC Application</h1>
                            <p className="officer-page-subtitle">
                                Application No: {formData.nocNumber}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* NOC Details */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                                    NOC Details
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">NOC Number</label>
                                        <input
                                            type="text"
                                            className="officer-input"
                                            value={formData.nocNumber}
                                            onChange={(e) => setFormData({ ...formData, nocNumber: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="officer-form-group">
                                        <label className="officer-label required">Validity Years</label>
                                        <select
                                            className="officer-select"
                                            value={formData.validityYears}
                                            onChange={(e) => setFormData({ ...formData, validityYears: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value="1">1 Year</option>
                                            <option value="3">3 Years</option>
                                            <option value="5">5 Years</option>
                                        </select>
                                    </div>

                                    <div className="officer-form-group">
                                        <label className="officer-label required">Valid From</label>
                                        <input
                                            type="date"
                                            className="officer-input"
                                            value={formData.validFrom}
                                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="officer-form-group">
                                        <label className="officer-label required">Valid Upto</label>
                                        <input
                                            type="date"
                                            className="officer-input"
                                            value={formData.validUpto}
                                            onChange={(e) => setFormData({ ...formData, validUpto: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="officer-form-group">
                                        <label className="officer-label required">Max Daily Extraction (m³/day)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="officer-input"
                                            value={formData.maxDailyExtraction}
                                            onChange={(e) => setFormData({ ...formData, maxDailyExtraction: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="officer-form-group">
                                        <label className="officer-label required">Annual Cess Amount (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="officer-input"
                                            value={formData.cessAmount}
                                            onChange={(e) => setFormData({ ...formData, cessAmount: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Conditions */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div className="officer-flex-between officer-mb-2">
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                                        NOC Conditions
                                    </h3>
                                    <button
                                        type="button"
                                        className="officer-btn officer-btn-primary"
                                        onClick={addCondition}
                                    >
                                        + Add Condition
                                    </button>
                                </div>

                                {formData.conditions.map((condition, index) => (
                                    <div key={index} className="officer-flex officer-gap-2 officer-mb-2">
                                        <input
                                            type="text"
                                            className="officer-input"
                                            value={condition}
                                            onChange={(e) => updateCondition(index, e.target.value)}
                                            placeholder={`Condition ${index + 1}`}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            className="officer-btn officer-btn-danger"
                                            onClick={() => removeCondition(index)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Approval Remarks */}
                            <div className="officer-form-group">
                                <label className="officer-label required">Approval Remarks</label>
                                <textarea
                                    className="officer-textarea"
                                    value={formData.approvalRemarks}
                                    onChange={(e) => setFormData({ ...formData, approvalRemarks: e.target.value })}
                                    placeholder="Enter approval remarks and any special instructions..."
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="officer-flex officer-gap-2 officer-mt-4">
                                <button
                                    type="button"
                                    className="officer-btn officer-btn-secondary"
                                    onClick={() => navigate(-1)}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className="officer-btn officer-btn-success"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    ✅ Approve & Issue NOC
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ApprovalForm;
