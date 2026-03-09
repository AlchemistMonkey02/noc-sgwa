import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import officerService from '../services/officerService';
import '../shared/styles/officer-portal.css';

const ApprovalForm = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [application, setApplication] = useState(null);
    const [officerData, setOfficerData] = useState(null);

    const [formData, setFormData] = useState({
        approvalType: 'CONDITIONAL_APPROVAL',
        nocNumber: '',
        validityYears: 3,
        validFrom: new Date().toISOString().split('T')[0],
        validUpto: '',
        maxDailyExtraction: 0,
        maxAnnualExtraction: 0,
        conditions: [
            'Install tamper proof digital water flow meter with telemetry on all the abstraction structure(s) within 30 days.',
            'Installation of Piezometers with Digital Water Level Recorders (DWLR) and Telemetry is mandatory.',
            'Submit quarterly groundwater monitoring reports.',
            'No groundwater withdrawal during monsoon season.'
        ],
        cessAmount: 0,
        approvalRemarks: ''
    });

    // Auto-calculate Valid Upto based on Valid From and Validity Years
    React.useEffect(() => {
        if (formData.validFrom && formData.validityYears) {
            const fromDate = new Date(formData.validFrom);
            const uptoDate = new Date(fromDate);
            uptoDate.setFullYear(fromDate.getFullYear() + parseInt(formData.validityYears));

            // Format back to YYYY-MM-DD
            setFormData(prev => ({
                ...prev,
                validUpto: uptoDate.toISOString().split('T')[0]
            }));
        }
    }, [formData.validFrom, formData.validityYears]);

    React.useEffect(() => {
        const storedOfficer = localStorage.getItem('officerData');
        if (storedOfficer) {
            setOfficerData(JSON.parse(storedOfficer));
        }
        fetchDetails();
    }, [applicationId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getEnforcementApplicationDetails(applicationId);
            if (response.success) {
                const app = response.data;
                setApplication(app);

                // Pre-fill from application
                const dailyReq = app.waterRequirement?.dailyRequirement ||
                    app.projectDetails?.waterRequirement?.totalRequirement || 0;

                // Determine cess amount based on daily requirement or standard rate
                // Assuming 100/m3 for industrial as a placeholder if not in data
                const cessRate = 50;
                const annualCess = (dailyReq * 365 * cessRate).toFixed(2);

                setFormData(prev => ({
                    ...prev,
                    nocNumber: `NOC/${new Date().getFullYear()}/${app.applicationNumber?.split('-').pop() || '001'}`,
                    maxDailyExtraction: dailyReq,
                    maxAnnualExtraction: (dailyReq * 365).toFixed(2),
                    cessAmount: app.cessAmount || annualCess,
                    approvalRemarks: `Recommended for approval based on SGWA review. ${app.sgwaRecommendation?.remarks || ''}`
                }));
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            alert('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const response = await officerService.enforcementApproveApplication(applicationId, formData);
            if (response.success) {
                alert('NOC Issued Successfully!');
                navigate('/officer/enforcement/dashboard');
            } else {
                alert(response.message || 'Failed to issue NOC');
            }
        } catch (error) {
            console.error('Error issuing NOC:', error);
            alert(error.response?.data?.message || 'Error occurred while issuing NOC');
        } finally {
            setSubmitting(false);
        }
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading application details...</p>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerData?.name || "Officer"}
                officerRole="ENFORCEMENT"
                officerDesignation={officerData?.designation || "Chief Engineer"}
                district={officerData?.district || ""}
            />

            <div className="officer-layout">
                <OfficerSidebar role="ENFORCEMENT" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">✅ Approve NOC Application</h1>
                            <p className="officer-page-subtitle">
                                Application No: {application?.applicationNumber}
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
                                    disabled={submitting}
                                >
                                    {submitting ? '⏳ Issuing NOC...' : '✅ Approve & Issue NOC'}
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
