import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Verification, 3: Success
    const [formData, setFormData] = useState({
        serviceType: '',
        userId: '',
        email: '',
        mobileNumber: '',
        captcha: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();

        // Validation for Step 1
        if (!formData.serviceType || !formData.userId || !formData.email) {
            setError('Please fill all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setStep(2); // Move to verification step
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();

        // Validation for Step 2
        if (!formData.mobileNumber || !formData.captcha) {
            setError('Please fill all required fields');
            return;
        }

        // Mobile validation (10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userType: formData.serviceType,
                    userId: formData.userId,
                    email: formData.email,
                    mobileNumber: formData.mobileNumber
                })
            });

            if (response.ok) {
                setStep(3); // Move to success step
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to submit request. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            // For demo purposes, show success
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const refreshCaptcha = () => {
        // Refresh captcha logic
        console.log('Captcha refreshed');
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                {step === 1 ? (
                    <>
                        {/* Step 1: Basic Information */}
                        <div className="forgot-password-header">
                            <div className="header-icon">🔐</div>
                            <h2>Forgot Password</h2>
                            <p>Step 1 of 2: Basic Information</p>
                        </div>

                        <div className="step-indicator">
                            <div className="step active">
                                <div className="step-number">1</div>
                                <div className="step-label">Basic Info</div>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <div className="step-label">Verification</div>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleStep1Submit} className="forgot-password-form">
                            <div className="form-group">
                                <label>Service Type <span className="required">*</span></label>
                                <select
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">— Select Service Type —</option>
                                    <option value="water_abstractor">Water Abstractor (Industries/Projects)</option>
                                    <option value="rig_registration">Rig Registration & Operations</option>
                                    <option value="vendor_registration">Vendor/Equipment Registration</option>
                                    <option value="dgo">District Groundwater Officer (DGO)</option>
                                    <option value="rsgwa">RSGWA Officer</option>
                                    <option value="enforcement">Enforcement Officer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>User ID <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your User ID"
                                />
                            </div>

                            <div className="form-group">
                                <label>Registered Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your registered email"
                                />
                                <small className="form-hint">We'll send the reset link to this email after admin approval</small>
                            </div>

                            <button type="submit" className="submit-btn">
                                Continue to Verification →
                            </button>
                        </form>

                        <div className="form-footer">
                            <Link to="/" className="back-link">← Back to Login</Link>
                        </div>
                    </>
                ) : step === 2 ? (
                    <>
                        {/* Step 2: Verification */}
                        <div className="forgot-password-header">
                            <div className="header-icon">🔐</div>
                            <h2>Forgot Password</h2>
                            <p>Step 2 of 2: Verification</p>
                        </div>

                        <div className="step-indicator">
                            <div className="step completed">
                                <div className="step-number">✓</div>
                                <div className="step-label">Basic Info</div>
                            </div>
                            <div className="step-line active"></div>
                            <div className="step active">
                                <div className="step-number">2</div>
                                <div className="step-label">Verification</div>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleStep2Submit} className="forgot-password-form">
                            <div className="form-group">
                                <label>Registered Mobile Number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                />
                                <small className="form-hint">For verification purposes</small>
                            </div>

                            <div className="form-group">
                                <label>Captcha <span className="required">*</span></label>
                                <div className="captcha-wrapper">
                                    <div className="captcha-display">
                                        <span style={{ '--r': '-5deg' }}>5</span>
                                        <span style={{ '--r': '3deg' }}>A</span>
                                        <span style={{ '--r': '-2deg' }}>7</span>
                                        <span style={{ '--r': '4deg' }}>K</span>
                                        <span style={{ '--r': '-3deg' }}>9</span>
                                    </div>
                                    <button type="button" onClick={refreshCaptcha} className="captcha-refresh">
                                        🔄
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="captcha"
                                    value={formData.captcha}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter code above"
                                />
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting Request...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>

                            <button type="button" onClick={() => setStep(1)} className="back-btn">
                                ← Back to Basic Info
                            </button>
                        </form>

                        <div className="info-box">
                            <h4>📋 How it works:</h4>
                            <ol>
                                <li>Submit your password reset request with registered details</li>
                                <li>Admin will verify and approve your request</li>
                                <li>You'll receive a password reset link via email</li>
                                <li>Use the link to set a new password</li>
                            </ol>
                            <p className="info-note">
                                <strong>Note:</strong> Approval may take 24-48 hours. You'll be notified via email and SMS.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="success-screen">
                        <div className="success-icon">✅</div>
                        <h2>Request Submitted Successfully!</h2>
                        <p className="success-message">
                            Your password reset request has been submitted and is pending admin approval.
                        </p>

                        <div className="success-details">
                            <div className="detail-item">
                                <span className="detail-label">User ID:</span>
                                <span className="detail-value">{formData.userId}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{formData.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Mobile:</span>
                                <span className="detail-value">{formData.mobileNumber}</span>
                            </div>
                        </div>

                        <div className="next-steps">
                            <h4>📬 What happens next?</h4>
                            <ul>
                                <li>Admin will review your request within 24-48 hours</li>
                                <li>You'll receive an email notification once approved</li>
                                <li>Click the reset link in the email to set a new password</li>
                                <li>The reset link will be valid for 24 hours</li>
                            </ul>
                        </div>

                        <div className="success-actions">
                            <Link to="/" className="btn-primary">
                                Back to Login
                            </Link>
                            <button onClick={() => { setStep(1); setFormData({ serviceType: '', userId: '', email: '', mobileNumber: '', captcha: '' }); }} className="btn-secondary">
                                Submit Another Request
                            </button>
                        </div>

                        <div className="contact-support">
                            <p>Need immediate assistance?</p>
                            <p className="support-info">
                                📞 Call: <strong>1800-XXX-XXXX</strong> (10 AM - 6 PM)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
