import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const SelfCompliance = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [applicationId, setApplicationId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Compliance session state
    const [session, setSession] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [stepData, setStepData] = useState({});
    const [uploadedDocs, setUploadedDocs] = useState([]);

    // Validation state
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);

    // Step definitions matching backend
    const stepDefinitions = [
        {
            number: 1,
            title: 'Digital Flow Meters',
            description: 'Verify installation and calibration of digital flow meters',
            fields: [
                { name: 'digitalFlowMetersInstalled', label: 'Are digital flow meters installed?', type: 'radio', required: true },
                { name: 'numberOfMeters', label: 'Number of Meters', type: 'number', required: true },
                { name: 'meterManufacturer', label: 'Meter Manufacturer', type: 'text' },
                { name: 'meterModel', label: 'Meter Model', type: 'text' },
                { name: 'meterCalibrationDone', label: 'Calibration done?', type: 'radio', required: true },
                { name: 'lastCalibrationDate', label: 'Last Calibration Date', type: 'date', required: true },
                { name: 'telemetryEnabled', label: 'Telemetry enabled?', type: 'radio' },
                { name: 'remarks', label: 'Remarks', type: 'textarea' }
            ],
            documentType: 'FLOW_METER_CALIBRATION'
        },
        {
            number: 2,
            title: 'Water Extraction Data',
            description: 'Provide quarterly extraction records',
            fields: [
                { name: 'reportingYear', label: 'Reporting Year', type: 'text', required: true, placeholder: 'e.g., 2025-2026' },
                { name: 'q1Extraction', label: 'Q1 Extraction (m³)', type: 'number', required: true },
                { name: 'q2Extraction', label: 'Q2 Extraction (m³)', type: 'number', required: true },
                { name: 'q3Extraction', label: 'Q3 Extraction (m³)', type: 'number', required: true },
                { name: 'q4Extraction', label: 'Q4 Extraction (m³)', type: 'number', required: true },
                { name: 'approvedLimit', label: 'Approved Annual Limit (m³)', type: 'number', required: true },
                { name: 'remarks', label: 'Remarks', type: 'textarea' }
            ],
            documentType: 'EXTRACTION_REPORT'
        },
        {
            number: 3,
            title: 'Rainwater Harvesting',
            description: 'Confirm rainwater harvesting structure status',
            fields: [
                { name: 'rwhStructureExists', label: 'Rainwater harvesting structure exists?', type: 'radio', required: true },
                { name: 'structureType', label: 'Structure Type', type: 'select', options: ['Rooftop', 'Surface', 'Recharge Pit', 'Other'] },
                { name: 'capacity', label: 'Storage Capacity (liters)', type: 'number' },
                { name: 'functional', label: 'Is it functional?', type: 'radio', required: true },
                { name: 'lastMaintenance', label: 'Last Maintenance Date', type: 'date' },
                { name: 'remarks', label: 'Remarks', type: 'textarea' }
            ],
            documentType: 'RAINWATER_HARVESTING'
        },
        {
            number: 4,
            title: 'Environmental Compliance',
            description: 'Verify environmental safety measures',
            fields: [
                { name: 'wastewaterTreatment', label: 'Wastewater treatment in place?', type: 'radio' },
                { name: 'pollution ControlMeasures', label: 'Pollution control measures?', type: 'radio' },
                { name: 'environmentalClearance', label: 'Environmental clearance valid?', type: 'radio' },
                { name: 'remarks', label: 'Remarks', type: 'textarea' }
            ],
            documentType: 'ENVIRONMENTAL_CLEARANCE'
        },
        {
            number: 5,
            title: 'Final Review & Documents',
            description: 'Upload supporting documents and submit',
            fields: [
                { name: 'contactEmail', label: 'Contact Email', type: 'email', required: true },
                { name: 'finalRemarks', label: 'Final Remarks', type: 'textarea' }
            ],
            documentType: 'ANNUAL_REPORT'
        }
    ];

    // Start compliance session
    const handleStartSession = async (e) => {
        e.preventDefault();
        if (!applicationId.trim()) {
            setError('Please enter Application/NOC Number');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await nocApplicationService.startComplianceSession(applicationId);

            if (response.success) {
                setSession(response.data);
                setCurrentStep(1);
            } else {
                setError(response.error?.message || 'Failed to start compliance session');
            }
        } catch (err) {
            setError('Error connecting to server. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle step data change
    const handleStepDataChange = (fieldName, value) => {
        setStepData(prev => ({
            ...prev,
            [currentStep]: {
                ...prev[currentStep],
                [fieldName]: value
            }
        }));
    };

    // Submit current step
    const handleSubmitStep = async () => {
        const currentStepDef = stepDefinitions[currentStep - 1];
        const responses = stepData[currentStep] || {};

        // Basic validation
        const missingFields = currentStepDef.fields
            .filter(field => field.required && !responses[field.name])
            .map(field => field.label);

        if (missingFields.length > 0) {
            setError(`Please fill required fields: ${missingFields.join(', ')}`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Calculate total for step 2
            if (currentStep === 2 && responses.q1Extraction) {
                responses.totalAnnualExtraction =
                    parseInt(responses.q1Extraction || 0) +
                    parseInt(responses.q2Extraction || 0) +
                    parseInt(responses.q3Extraction || 0) +
                    parseInt(responses.q4Extraction || 0);
                responses.unit = 'm³';
                responses.withinLimit = responses.totalAnnualExtraction <= parseInt(responses.approvedLimit);
            }

            const response = await nocApplicationService.submitComplianceStep(session.complianceId, {
                step: currentStep,
                responses
            });

            if (response.success) {
                // Move to next step
                if (currentStep < stepDefinitions.length) {
                    setCurrentStep(currentStep + 1);
                }
            } else {
                setError(response.error?.message || 'Failed to submit step');
            }
        } catch (err) {
            setError('Error submitting step. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Upload document
    const handleDocumentUpload = async (file, documentType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        formData.append('step', currentStep.toString());
        formData.append('description', `${stepDefinitions[currentStep - 1].title} - Supporting document`);

        setLoading(true);
        setError(null);

        try {
            const response = await nocApplicationService.uploadComplianceDocument(session.complianceId, formData);

            if (response.success) {
                setUploadedDocs(prev => [...prev, response.data]);
                alert(`Document uploaded successfully: ${response.data.fileName}`);
            } else {
                setError(response.error?.message || 'Failed to upload document');
            }
        } catch (err) {
            setError('Error uploading document. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Submit for AI validation
    const handleFinalSubmit = async () => {
        const step5Data = stepData[5] || {};

        if (!step5Data.contactEmail) {
            setError('Please provide contact email before submitting');
            return;
        }

        setLoading(true);
        setError(null);
        setValidating(true);

        try {
            const response = await nocApplicationService.submitForAIValidation(session.complianceId, {
                finalRemarks: step5Data.finalRemarks,
                contactEmail: step5Data.contactEmail
            });

            if (response.success) {
                // Start polling for status
                startStatusPolling();
            } else {
                setError(response.error?.message || 'Failed to submit for validation');
                setValidating(false);
            }
        } catch (err) {
            setError('Error submitting for validation. Please try again.');
            setValidating(false);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Poll for validation status
    const startStatusPolling = () => {
        const interval = setInterval(async () => {
            try {
                const response = await nocApplicationService.getComplianceStatus(session.complianceId);

                if (response.success && response.data.status === 'COMPLETED') {
                    clearInterval(interval);
                    setValidating(false);
                    setValidationResult(response.data);
                }
            } catch (err) {
                console.error('Error polling status:', err);
            }
        }, 10000); // Poll every 10 seconds

        setPollingInterval(interval);
    };

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    // Render step form
    const renderStepForm = () => {
        const currentStepDef = stepDefinitions[currentStep - 1];
        const responses = stepData[currentStep] || {};

        return (
            <div className="dashboard-card">
                <div className="checker-header" style={{
                    background: 'linear-gradient(to right, #059669, #10b981)',
                    padding: '1.5rem',
                    borderRadius: '10px 10px 0 0',
                    color: 'white'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                        Step {currentStep}: {currentStepDef.title}
                    </h2>
                    <p style={{ margin: '5px 0 0', opacity: 0.9 }}>{currentStepDef.description}</p>
                </div>

                <div className="card-content-area">
                    <div className="progress-tracker" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Progress</span>
                            <span>{Math.round((currentStep / stepDefinitions.length) * 100)}%</span>
                        </div>
                        <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(currentStep / stepDefinitions.length) * 100}%`,
                                background: 'linear-gradient(to right, #10b981, #059669)',
                                height: '100%',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmitStep(); }}>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {currentStepDef.fields.map(field => (
                                <div key={field.name} className="form-group">
                                    <label className="bhuneer-label">
                                        {field.label} {field.required && <span className="text-red">*</span>}
                                    </label>

                                    {field.type === 'radio' && (
                                        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="radio"
                                                    name={field.name}
                                                    value="true"
                                                    checked={responses[field.name] === true || responses[field.name] === 'true'}
                                                    onChange={(e) => handleStepDataChange(field.name, true)}
                                                />
                                                Yes
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="radio"
                                                    name={field.name}
                                                    value="false"
                                                    checked={responses[field.name] === false || responses[field.name] === 'false'}
                                                    onChange={(e) => handleStepDataChange(field.name, false)}
                                                />
                                                No
                                            </label>
                                        </div>
                                    )}

                                    {field.type === 'select' && (
                                        <select
                                            className="bhuneer-input"
                                            value={responses[field.name] || ''}
                                            onChange={(e) => handleStepDataChange(field.name, e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            {field.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === 'textarea' && (
                                        <textarea
                                            className="bhuneer-input"
                                            rows="3"
                                            value={responses[field.name] || ''}
                                            onChange={(e) => handleStepDataChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                        />
                                    )}

                                    {['text', 'number', 'date', 'email'].includes(field.type) && (
                                        <input
                                            type={field.type}
                                            className="bhuneer-input"
                                            value={responses[field.name] || ''}
                                            onChange={(e) => handleStepDataChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Document Upload Section */}
                            <div className="form-group">
                                <label className="bhuneer-label">Upload Supporting Document (PDF/Image)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            handleDocumentUpload(e.target.files[0], currentStepDef.documentType);
                                        }
                                    }}
                                    style={{ padding: '0.5rem' }}
                                />
                                <small className="text-gray">Max 10MB. Formats: PDF, JPG, PNG</small>
                            </div>
                        </div>

                        {error && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '5px' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    className="bhuneer-secondary-btn"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                >
                                    Previous
                                </button>
                            )}

                            {currentStep < stepDefinitions.length ? (
                                <button
                                    type="submit"
                                    className="bhuneer-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save & Continue'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="bhuneer-submit-btn"
                                    onClick={handleFinalSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit for AI Validation'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Render validation status
    const renderValidationStatus = () => (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
            <h2 style={{ color: '#059669' }}>AI Validation in Progress</h2>
            <p>Our AI is analyzing your compliance data and documents...</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
                Compliance ID: <strong>{session?.complianceId}</strong>
            </p>
            <div className="spinner" style={{ margin: '2rem auto', width: '50px', height: '50px', border: '5px solid #e5e7eb', borderTop: '5px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>This may take 10-15 minutes. You can close this page and check back later.</p>
        </div>
    );

    // Render validation result
    const renderValidationResult = () => (
        <div className="dashboard-card">
            <div className={`checker-header ${validationResult.result === 'APPROVED' ? 'bg-success' : 'bg-warning'}`} style={{
                background: validationResult.result === 'APPROVED'
                    ? 'linear-gradient(to right, #059669, #10b981)'
                    : 'linear-gradient(to right, #d97706, #f59e0b)',
                padding: '1.5rem',
                borderRadius: '10px 10px 0 0',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem' }}>
                    {validationResult.result === 'APPROVED' ? '✅' : '⚠️'}
                </div>
                <h2 style={{ margin: '1rem 0 0', fontSize: '1.8rem' }}>
                    {validationResult.result === 'APPROVED' ? 'Compliance Approved!' : 'Review Required'}
                </h2>
            </div>

            <div className="card-content-area">
                <div style={{ marginBottom: '2rem' }}>
                    <h3>Overall Score: {validationResult.overallScore}/100</h3>
                    <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '20px', overflow: 'hidden', marginTop: '0.5rem' }}>
                        <div style={{
                            width: `${validationResult.overallScore}%`,
                            background: validationResult.overallScore >= 75 ? '#10b981' : '#f59e0b',
                            height: '100%'
                        }} />
                    </div>
                </div>

                {validationResult.scoreBreakdown && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h4>Score Breakdown:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {Object.entries(validationResult.scoreBreakdown).map(([key, value]) => (
                                <div key={key} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                                        {value}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {validationResult.aiFindings && (
                    <>
                        {validationResult.aiFindings.strengths && validationResult.aiFindings.strengths.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#059669' }}>✓ Strengths:</h4>
                                <ul>
                                    {validationResult.aiFindings.strengths.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {validationResult.aiFindings.areasOfImprovement && validationResult.aiFindings.areasOfImprovement.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#d97706' }}>⚡ Areas of Improvement:</h4>
                                <ul>
                                    {validationResult.aiFindings.areasOfImprovement.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {validationResult.aiFindings.criticalIssues && validationResult.aiFindings.criticalIssues.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#dc2626' }}>⚠️ Critical Issues:</h4>
                                <ul>
                                    {validationResult.aiFindings.criticalIssues.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {validationResult.certificateUrl && (
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <a
                            href={validationResult.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bhuneer-submit-btn"
                            style={{ display: 'inline-block' }}
                        >
                            📄 Download Compliance Certificate
                        </a>
                    </div>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        className="bhuneer-secondary-btn"
                        onClick={() => {
                            setSession(null);
                            setCurrentStep(0);
                            setStepData({});
                            setValidationResult(null);
                            setApplicationId('');
                        }}
                    >
                        Start New Compliance
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Dashboard</Link>
                        <span className="separator">›</span>
                        <span className="current">AI Compliance</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">🤖 AI-Powered Self Compliance</h1>
                        <p className="page-subtitle">Complete your compliance verification with AI assistance</p>
                    </div>

                    {/* Initial Search */}
                    {!session && !validationResult && (
                        <div className="dashboard-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                            <div className="checker-header" style={{
                                background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
                                padding: '1.5rem',
                                borderRadius: '10px 10px 0 0',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Start Compliance Verification</h2>
                                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Enter your Application/NOC number to begin</p>
                            </div>

                            <div className="card-content-area" style={{ padding: '3rem 2rem' }}>
                                <form onSubmit={handleStartSession}>
                                    <div className="form-group">
                                        <label className="bhuneer-label">Application/NOC Number <span className="text-red">*</span></label>
                                        <input
                                            type="text"
                                            className="bhuneer-input"
                                            placeholder="e.g., 21-4/3482/GJ/IND/2021 or CGWA/NOC/..."
                                            value={applicationId}
                                            onChange={(e) => setApplicationId(e.target.value)}
                                        />
                                    </div>

                                    {error && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '5px' }}>
                                            {error}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                        <button
                                            type="submit"
                                            className="bhuneer-submit-btn"
                                            disabled={loading}
                                        >
                                            {loading ? 'Starting...' : 'Start AI Compliance'}
                                        </button>
                                    </div>
                                </form>

                                <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 1rem', color: '#1e40af' }}>🌟 AI-Powered Features:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e293b' }}>
                                        <li>Automated document verification</li>
                                        <li>Intelligent data validation</li>
                                        <li>Real-time compliance scoring</li>
                                        <li>Instant certificate generation</li>
                                        <li>Smart recommendations for improvement</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step Form */}
                    {session && !validating && !validationResult && currentStep > 0 && renderStepForm()}

                    {/* Validation Status */}
                    {validating && renderValidationStatus()}

                    {/* Validation Result */}
                    {validationResult && renderValidationResult()}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <NOCFooter />
        </div>
    );
};

export default SelfCompliance;
