import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const InspectionReport = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [application, setApplication] = useState(null);

    const [formData, setFormData] = useState({
        visitDate: new Date().toISOString().split('T')[0],
        officerName: '',
        designation: '',

        // Rainwater Harvesting
        rwhImplemented: 'NO',
        rwhStructureType: '',
        rwhDimensions: '',
        rwhPhoto: null,

        // Flow Meter
        meterInstalled: 'NO',
        meterMake: '',
        meterSerialNo: '',
        meterReading: '',
        meterPhoto: null,

        // Plantation
        plantationStatus: 'NOT_STARTED',
        plantsCount: '',
        plantationArea: '',
        plantationPhoto: null,

        // Abstraction Structures
        borewellsCount: '',
        coordinates: '',

        // General
        observations: '',
        recommendation: 'SATISFACTORY'
    });

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getApplicationDetails(applicationId);
            if (response.success && response.data) {
                // Handle nested structure if necessary (response.data or response.data.application)
                const appData = response.data.application || response.data;
                setApplication(appData);

                // Pre-fill officer details if available in local storage
                const officerData = JSON.parse(localStorage.getItem('officer_user') || '{}');
                setFormData(prev => ({
                    ...prev,
                    officerName: officerData.name || officerData.username || '',
                    designation: officerData.designation || 'District Groundwater Officer'
                }));
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            alert('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] // In real app, might need to upload and get URL
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Transform form data for API
            // Note: File uploads would typically need FormData or separate upload calls.
            // For now sending as JSON object with placeholder for files.

            const reportPayload = {
                ...formData,
                rwhPhoto: formData.rwhPhoto ? 'photo_uploaded.jpg' : null,
                meterPhoto: formData.meterPhoto ? 'photo_uploaded.jpg' : null,
                plantationPhoto: formData.plantationPhoto ? 'photo_uploaded.jpg' : null
            };

            const response = await officerService.submitInspectionReport(applicationId, reportPayload);

            if (response.success) {
                alert('Inspection Report submitted successfully!');
                navigate(`/officer/dgo/applications/${applicationId}`);
            } else {
                alert('Failed to submit report: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('An error occurred while submitting the report.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container">Loading...</div>;

    return (
        <div className="officer-portal">
            <OfficerHeader officerRole="DGO" />
            <div className="officer-layout">
                <OfficerSidebar role="DGO" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
                            <h1 className="officer-page-title">Site Inspection Report</h1>
                            <p className="officer-page-subtitle">
                                Application No: {application?.applicationNumber || applicationId}
                            </p>
                        </div>

                        <div className="officer-card">
                            <form onSubmit={handleSubmit}>
                                {/* Section 1: General Info */}
                                <div className="form-section">
                                    <h3>1. Inspection Details</h3>
                                    <div className="officer-grid-row">
                                        <div className="officer-form-group">
                                            <label className="officer-label required">Date of Visit</label>
                                            <input
                                                type="date"
                                                name="visitDate"
                                                className="officer-input"
                                                value={formData.visitDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="officer-form-group">
                                            <label className="officer-label required">Officer Name</label>
                                            <input
                                                type="text"
                                                name="officerName"
                                                className="officer-input"
                                                value={formData.officerName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="officer-divider" />

                                {/* Section 2: Rainwater Harvesting */}
                                <div className="form-section">
                                    <h3>2. Rainwater Harvesting (RWH)</h3>
                                    <div className="officer-grid-row">
                                        <div className="officer-form-group">
                                            <label className="officer-label required">RWH Implemented?</label>
                                            <select
                                                name="rwhImplemented"
                                                className="officer-select"
                                                value={formData.rwhImplemented}
                                                onChange={handleInputChange}
                                            >
                                                <option value="YES">Yes</option>
                                                <option value="NO">No</option>
                                                <option value="PARTIAL">Partial</option>
                                            </select>
                                        </div>
                                        <div className="officer-form-group">
                                            <label className="officer-label">Structure Type</label>
                                            <input
                                                type="text"
                                                name="rwhStructureType"
                                                className="officer-input"
                                                placeholder="e.g. Recharge Pit, Trench"
                                                value={formData.rwhStructureType}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="officer-form-group">
                                        <label className="officer-label">Dimensions / Capacity</label>
                                        <input
                                            type="text"
                                            name="rwhDimensions"
                                            className="officer-input"
                                            placeholder="e.g. 2m x 3m x 2m"
                                            value={formData.rwhDimensions}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <hr className="officer-divider" />

                                {/* Section 3: Flow Meter */}
                                <div className="form-section">
                                    <h3>3. Digital Flow Meter</h3>
                                    <div className="officer-grid-row">
                                        <div className="officer-form-group">
                                            <label className="officer-label required">Meter Installed?</label>
                                            <select
                                                name="meterInstalled"
                                                className="officer-select"
                                                value={formData.meterInstalled}
                                                onChange={handleInputChange}
                                            >
                                                <option value="YES">Yes</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                        {formData.meterInstalled === 'YES' && (
                                            <>
                                                <div className="officer-form-group">
                                                    <label className="officer-label required">Make & Serial No.</label>
                                                    <input
                                                        type="text"
                                                        name="meterMake"
                                                        className="officer-input"
                                                        value={formData.meterMake}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="officer-form-group">
                                                    <label className="officer-label required">Current Reading</label>
                                                    <input
                                                        type="text"
                                                        name="meterReading"
                                                        className="officer-input"
                                                        value={formData.meterReading}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <hr className="officer-divider" />

                                {/* Section 4: Plantation */}
                                <div className="form-section">
                                    <h3>4. Green Belt / Plantation</h3>
                                    <div className="officer-grid-row">
                                        <div className="officer-form-group">
                                            <label className="officer-label">Status</label>
                                            <select
                                                name="plantationStatus"
                                                className="officer-select"
                                                value={formData.plantationStatus}
                                                onChange={handleInputChange}
                                            >
                                                <option value="COMPLETED">Completed</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="NOT_STARTED">Not Started</option>
                                            </select>
                                        </div>
                                        <div className="officer-form-group">
                                            <label className="officer-label">No. of Plants</label>
                                            <input
                                                type="number"
                                                name="plantsCount"
                                                className="officer-input"
                                                value={formData.plantsCount}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="officer-divider" />

                                {/* Section 5: Conclusion */}
                                <div className="form-section">
                                    <h3>5. Conclusion</h3>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Observations / Remarks</label>
                                        <textarea
                                            name="observations"
                                            className="officer-textarea"
                                            rows="4"
                                            value={formData.observations}
                                            onChange={handleInputChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="officer-form-group">
                                        <label className="officer-label required">Final Recommendation</label>
                                        <select
                                            name="recommendation"
                                            className="officer-select"
                                            value={formData.recommendation}
                                            onChange={handleInputChange}
                                        >
                                            <option value="SATISFACTORY">Satisfactory - Recommend NOC</option>
                                            <option value="NEEDS_IMPROVEMENT">Needs Improvement - Raise Query</option>
                                            <option value="UNSATISFACTORY">Unsatisfactory - Reject</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="officer-form-actions">
                                    <button
                                        type="button"
                                        className="officer-btn officer-btn-secondary"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="officer-btn officer-btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InspectionReport;
