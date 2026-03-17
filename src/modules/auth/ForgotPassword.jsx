import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

import apiClient from '../../services/apiClient';

const ForgotPassword = ({ isModal = false, onClose }) => {
    const [step, setStep] = useState(1);
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
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.serviceType || !formData.userId || !formData.email) {
            setError('Please fill all required fields');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        if (!formData.mobileNumber || !formData.captcha) {
            setError('Please fill all required fields');
            return;
        }
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiClient.post('/auth/forgot-password', {
                userType: formData.serviceType,
                userId: formData.userId,
                email: formData.email,
                mobileNumber: formData.mobileNumber
            });
            setStep(3);
        } catch (error) {
            console.error('Forgot password error:', error);
            // Fallback for demo if needed, but error handling is now standardized
            setError(error.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const refreshCaptcha = () => {
        // Refresh captcha logic
        console.log('Captcha refreshed');
    };

    return (
        <div className={isModal ? "forgot-password-modal-content" : "forgot-password-page"}>
            <div className={isModal ? "forgot-password-modal-container" : "forgot-password-container"}>
                {step === 1 ? (
                    <>
                        <div className="forgot-password-header">
                            <div className="header-icon-wrapper">🔐</div>
                            <h2>Forgot Password</h2>
                            <p>Enter your details to request a password reset</p>
                        </div>

                        <div className="step-indicator">
                            <div className="step-item active">
                                <div className="step-circle">1</div>
                                <div className="step-name">Basic Info</div>
                            </div>
                            <div className="step-connector"></div>
                            <div className="step-item">
                                <div className="step-circle">2</div>
                                <div className="step-name">Verify</div>
                            </div>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleStep1Submit} className="forgot-password-form">
                            <div className="form-group">
                                <label>Service Type</label>
                                <select
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select Service Type</option>
                                    <option value="water_abstractor">Water Abstractor (Industries)</option>
                                    <option value="rig_registration">Rig Registration</option>
                                    <option value="vendor_registration">Vendor Registration</option>
                                    <option value="dgo">DGO Officer</option>
                                    <option value="sgwa">SGWA Officer</option>
                                    <option value="enforcement">Enforcement Officer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>User ID</label>
                                <input
                                    type="text"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g. USER12345"
                                />
                            </div>

                            <div className="form-group">
                                <label>Registered Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="your@email.com"
                                />
                                <p className="form-hint">Verification link will be sent to this email</p>
                            </div>

                            <button type="submit" className="submit-button">
                                Next Step <span style={{ marginLeft: '4px' }}>→</span>
                            </button>
                        </form>

                        <div className="form-footer">
                            {isModal ? (
                                <button type="button" onClick={onClose} className="back-to-login" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    ← Back to Login
                                </button>
                            ) : (
                                <Link to="/" className="back-to-login">← Back to Login</Link>
                            )}
                        </div>
                    </>
                ) : step === 2 ? (
                    <>
                        <div className="forgot-password-header">
                            <div className="header-icon-wrapper">🛡️</div>
                            <h2>Final Verification</h2>
                            <p>Verify your contact and captcha</p>
                        </div>

                        <div className="step-indicator">
                            <div className="step-item completed">
                                <div className="step-circle">✓</div>
                                <div className="step-name">Basic Info</div>
                            </div>
                            <div className="step-connector filled"></div>
                            <div className="step-item active">
                                <div className="step-circle">2</div>
                                <div className="step-name">Verify</div>
                            </div>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleStep2Submit} className="forgot-password-form">
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="10-digit registered number"
                                    maxLength="10"
                                />
                            </div>

                            <div className="form-group">
                                <label>Security Captcha</label>
                                <div className="captcha-container">
                                    <div className="captcha-row">
                                        <div className="captcha-box">
                                            <span>5</span><span>A</span><span>7</span><span>K</span><span>9</span>
                                        </div>
                                        <button type="button" onClick={refreshCaptcha} className="refresh-button">
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
                            </div>

                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? <div className="spinner"></div> : "Submit Request"}
                            </button>

                            <button type="button" onClick={() => setStep(1)} className="secondary-button" style={{ marginTop: '0' }}>
                                Back
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-card">
                        <div className="success-icon-wrapper">✓</div>
                        <h2>Submitted!</h2>
                        <p className="forgot-password-header p">Your reset request is pending admin approval.</p>

                        <div className="summary-box">
                            <div className="summary-item">
                                <span className="summary-label">User ID</span>
                                <span className="summary-value">{formData.userId}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Email</span>
                                <span className="summary-value">{formData.email}</span>
                            </div>
                        </div>

                        <div className="info-banner">
                            <span className="info-banner-icon">ℹ️</span>
                            <p className="info-banner-text">
                                Approval usually takes 24-48 hours. You'll be notified via your registered email.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {isModal ? (
                                <button onClick={onClose} className="submit-button" style={{ flex: 1 }}>
                                    Done
                                </button>
                            ) : (
                                <Link to="/" className="submit-button" style={{ flex: 1, textDecoration: 'none' }}>
                                    Go to Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
