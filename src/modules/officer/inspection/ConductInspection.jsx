import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../services/officerService';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';
// import './ConductInspection.css'; // Removed to fix Vite build error as file doesn't exist

const ConductInspection = () => {
    const { inspectionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [applicationData, setApplicationData] = useState(null);
    const [officerData, setOfficerData] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        locationMatch: '',
        landUseMatch: '',
        borewellExists: '',
        waterSource: '',
        meterInstalled: '',
        meterReading: '',
        piezometerInstalled: '',
        dwraDetails: '',
        recommendation: 'RECOMMENDED',
        remarks: ''
    });

    const [photos, setPhotos] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        const storedOfficer = localStorage.getItem('officerData');
        if (storedOfficer) {
            setOfficerData(JSON.parse(storedOfficer));
        }
        fetchDetails();
        captureLocation();
    }, [inspectionId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await officerService.getInspectionDetails(inspectionId);
            if (response.success) {
                setApplicationData(response.data);
            }
        } catch (error) {
            console.error('Error fetching inspection details:', error);
            // Fallback for dev if needed, but the requirement is to remove mock data.
            // However, to make it robust, let's keep a graceful error state.
            setApplicationData(null);
        } finally {
            setLoading(false);
        }
    };

    const captureLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.error('Error capturing location:', error);
                }
            );
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const uploadedPhotos = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                const response = await officerService.uploadDocument(formData);
                if (response.success) {
                    uploadedPhotos.push(response.data.id || response.data._id);
                }
            }
            setPhotos(prev => [...prev, ...uploadedPhotos]);
        } catch (error) {
            console.error('Photo upload failed:', error);
            alert('Failed to upload some photos');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.recommendation) {
            alert('Please provide a recommendation');
            return;
        }

        try {
            setSubmitting(true);
            const reportData = {
                ...formData,
                coordinates: currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'N/A',
                photos,
                inspectionId
            };

            const response = await officerService.submitInspectionReport(inspectionId, reportData);

            if (response.success) {
                alert('Inspection Report Submitted Successfully!');
                navigate('/officer/inspection/dashboard');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert(`Submission failed: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading inspection data...</p>
            </div>
        );
    }

    if (!applicationData) {
        return (
            <div className="error-container" style={{ textAlign: 'center', padding: '5rem' }}>
                <h2>Inspection record not found</h2>
                <p>The inspection assigned to ID {inspectionId} could not be retrieved.</p>
                <button
                    className="officer-btn officer-btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => navigate('/officer/inspection/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName={officerData?.name || "Officer"}
                officerRole="INSPECTION"
                officerDesignation={officerData?.designation || "Inspection Officer"}
                district={officerData?.district || ""}
            />

            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="inspection-header">
                            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                            <h1 className="officer-page-title">Conduct Site Inspection</h1>
                            <div className="app-id-badge">{applicationData.applicationNumber || applicationData.appId}</div>
                        </div>

                        <div className="inspection-grid">
                            {/* Left: Application Info */}
                            <div className="inspection-info-panel">
                                <div className="officer-card info-card">
                                    <h3>Applicant Information</h3>
                                    <div className="info-row">
                                        <label className="officer-label">Applicant Name:</label>
                                        <div style={{ fontWeight: '600' }}>{applicationData.applicantDetails?.name || applicationData.applicantName}</div>
                                    </div>
                                    <div className="info-row">
                                        <label className="officer-label">Project Type:</label>
                                        <div style={{ fontWeight: '600' }}>{applicationData.projectDetails?.projectType || applicationData.projectType}</div>
                                    </div>
                                    <div className="info-row">
                                        <label className="officer-label">Site Address:</label>
                                        <div style={{ fontWeight: '600' }}>{applicationData.locationDetails?.village || applicationData.address}</div>
                                    </div>
                                </div>

                                <div className="officer-card info-card location-card">
                                    <h3>Geotagging Status</h3>
                                    <div className={`location-status ${currentLocation ? 'captured' : 'pending'}`}>
                                        {currentLocation ? (
                                            <>
                                                <span className="icon">📍</span>
                                                <div>
                                                    <p>Coordinates Captured</p>
                                                    <small>{currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</small>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="icon">⌛</span>
                                                <p>Capturing Geolocation...</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Inspection Form */}
                            <form className="inspection-form officer-card" style={{ padding: '2rem' }} onSubmit={handleSubmit}>
                                <div className="form-section">
                                    <h3>1. Physical Verification</h3>
                                    <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="officer-form-group">
                                            <label className="officer-label required">Does the site location match application?</label>
                                            <select
                                                className="officer-select"
                                                name="locationMatch"
                                                value={formData.locationMatch}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                <option value="Yes">Yes, matches perfectly</option>
                                                <option value="No">No, significant discrepancy</option>
                                            </select>
                                        </div>
                                        <div className="officer-form-group">
                                            <label className="officer-label required">Current Land Use match?</label>
                                            <select
                                                className="officer-select"
                                                name="landUseMatch"
                                                value={formData.landUseMatch}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No (Describe below)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section" style={{ marginTop: '2rem' }}>
                                    <h3>2. Water Extraction Infrastructure</h3>
                                    <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="officer-form-group">
                                            <label className="officer-label">Is there an existing borewell?</label>
                                            <select className="officer-select" name="borewellExists" value={formData.borewellExists} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No (Proposed only)</option>
                                            </select>
                                        </div>
                                        <div className="officer-form-group">
                                            <label className="officer-label">Water Meter Installed?</label>
                                            <select className="officer-select" name="meterInstalled" value={formData.meterInstalled} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                <option value="Yes">Yes, Functional</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    {formData.meterInstalled === 'Yes' && (
                                        <div className="officer-form-group" style={{ marginTop: '1rem' }}>
                                            <label className="officer-label">Current Meter Reading (m³)</label>
                                            <input
                                                className="officer-input"
                                                type="number"
                                                name="meterReading"
                                                value={formData.meterReading}
                                                onChange={handleInputChange}
                                                placeholder="Enter value"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-section" style={{ marginTop: '2rem' }}>
                                    <h3>3. Site Photos (Mandatory)</h3>
                                    <div className="photo-upload-container">
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="photo-upload" className="officer-btn officer-btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                                            <span>📷</span> Upload Photos
                                        </label>
                                        <div className="photo-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                            {photos.map((photoId, idx) => (
                                                <div key={idx} className="photo-preview" style={{ borderRadius: '8px', overflow: 'hidden', height: '100px', background: '#f1f5f9' }}>
                                                    <img src={officerService.getDocumentUrl(photoId)} alt="Site" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section" style={{ marginTop: '2rem' }}>
                                    <h3>4. Conclusion & Remarks</h3>
                                    <div className="officer-form-group">
                                        <label className="officer-label required" style={{ fontSize: '1.1rem' }}>Final Recommendation</label>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                className={`officer-btn ${formData.recommendation === 'RECOMMENDED' ? 'officer-btn-primary' : 'officer-btn-secondary'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, recommendation: 'RECOMMENDED' }))}
                                                style={{ flex: 1, minWidth: '150px' }}
                                            >
                                                ✅ Recommend for NOC
                                            </button>
                                            <button
                                                type="button"
                                                className={`officer-btn ${formData.recommendation === 'CONDITIONAL' ? 'officer-btn-warning' : 'officer-btn-secondary'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, recommendation: 'CONDITIONAL' }))}
                                                style={{ flex: 1, minWidth: '150px', color: formData.recommendation === 'CONDITIONAL' ? 'white' : 'inherit' }}
                                            >
                                                ⚠️ Conditional Recommendation
                                            </button>
                                            <button
                                                type="button"
                                                className={`officer-btn ${formData.recommendation === 'REJECTED' ? 'officer-btn-danger' : 'officer-btn-secondary'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, recommendation: 'REJECTED' }))}
                                                style={{ flex: 1, minWidth: '150px', color: formData.recommendation === 'REJECTED' ? 'white' : 'inherit' }}
                                            >
                                                ❌ Not Recommended
                                            </button>
                                        </div>
                                    </div>
                                    <div className="officer-form-group" style={{ marginTop: '1.5rem' }}>
                                        <label className="officer-label required">Detailed Remarks</label>
                                        <textarea
                                            className="officer-textarea"
                                            name="remarks"
                                            rows="4"
                                            value={formData.remarks}
                                            onChange={handleInputChange}
                                            placeholder="Provide detailed site observations..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" className="officer-btn officer-btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                                    <button
                                        type="submit"
                                        className="officer-btn officer-btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Inspection Report'}
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

export default ConductInspection;
