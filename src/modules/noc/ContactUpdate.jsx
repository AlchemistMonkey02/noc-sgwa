import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const ContactUpdate = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [currentData, setCurrentData] = useState({
        email: '',
        mobile: ''
    });

    // Mobile Update State
    const [mobileState, setMobileState] = useState({
        step: 'INPUT', // INPUT, OTP, SUCCESS
        newValue: '',
        otp: '',
        loading: false,
        error: null,
        successMsg: null
    });

    // Email Update State
    const [emailState, setEmailState] = useState({
        step: 'INPUT', // INPUT, OTP, SUCCESS
        newValue: '',
        otp: '',
        loading: false,
        error: null,
        successMsg: null
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await nocApplicationService.getUserProfile();
            if (response.success && response.data) {
                setCurrentData({
                    email: response.data.email || 'N/A',
                    mobile: response.data.phone || 'N/A'
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (type) => {
        const isMobile = type === 'PHONE';
        const state = isMobile ? mobileState : emailState;
        const setState = isMobile ? setMobileState : setEmailState;
        const value = state.newValue;

        if (!value) {
            setState(prev => ({ ...prev, error: 'Please enter a valid value' }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await nocApplicationService.requestContactOtp({ type, value });
            if (response.success) {
                setState(prev => ({ ...prev, step: 'OTP', loading: false, successMsg: `OTP sent to ${value}` }));
            } else {
                setState(prev => ({ ...prev, loading: false, error: response.message || 'Failed to send OTP' }));
            }
        } catch (err) {
            setState(prev => ({ ...prev, loading: false, error: err.message || 'Error sending OTP' }));
        }
    };

    const handleVerifyOtp = async (type) => {
        const isMobile = type === 'PHONE';
        const state = isMobile ? mobileState : emailState;
        const setState = isMobile ? setMobileState : setEmailState;

        if (!state.otp || state.otp.length < 4) {
            setState(prev => ({ ...prev, error: 'Please enter a valid OTP' }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await nocApplicationService.verifyContactUpdate({
                type,
                value: state.newValue,
                otp: state.otp
            });

            if (response.success) {
                setState(prev => ({ ...prev, step: 'SUCCESS', loading: false, successMsg: response.message }));
                // Update current display data
                setCurrentData(prev => ({
                    ...prev,
                    [isMobile ? 'mobile' : 'email']: state.newValue
                }));

                // Reset form after delay
                setTimeout(() => {
                    setState({ step: 'INPUT', newValue: '', otp: '', loading: false, error: null, successMsg: null });
                }, 3000);

            } else {
                setState(prev => ({ ...prev, loading: false, error: response.message || 'Verification failed' }));
            }
        } catch (err) {
            setState(prev => ({ ...prev, loading: false, error: err.message || 'Error verifying OTP' }));
        }
    };

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
                        <Link to="/noc/user-profile">User Profile</Link>
                        <span className="separator">›</span>
                        <span className="current">Update Contact Details</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">Security & Contact Settings</h1>
                        <p className="page-subtitle">Update your registered contact details securely via OTP verification</p>
                    </div>

                    <div className="settings-card">
                        <div className="card-body">
                            {/* Update Mobile Number Section */}
                            <div className="security-section" style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #e2e8f0' }}>
                                <h4 style={{ color: '#1e3a8a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                                    📱 Update Mobile Number
                                </h4>
                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div className="form-group">
                                        <label>Current Mobile Number</label>
                                        <input type="text" value={currentData.mobile} disabled className="form-control" style={{ background: '#e2e8f0', cursor: 'not-allowed', width: '100%', maxWidth: '400px' }} />
                                    </div>

                                    {mobileState.step === 'SUCCESS' ? (
                                        <div className="noc-alert noc-alert-success" style={{ marginTop: '20px' }}>
                                            ✅ {mobileState.successMsg || 'Mobile number updated successfully!'}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="form-group" style={{ marginTop: '20px' }}>
                                                <label>New Mobile Number</label>
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                    <input
                                                        type="tel"
                                                        placeholder="Enter new mobile number"
                                                        className="form-control"
                                                        style={{ maxWidth: '400px' }}
                                                        value={mobileState.newValue}
                                                        onChange={(e) => setMobileState(p => ({ ...p, newValue: e.target.value }))}
                                                        disabled={mobileState.step === 'OTP' || mobileState.loading}
                                                    />
                                                    {mobileState.step === 'INPUT' && (
                                                        <button
                                                            className="noc-btn noc-btn-secondary"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleSendOtp('PHONE')}
                                                            disabled={mobileState.loading}
                                                        >
                                                            {mobileState.loading ? 'Sending...' : 'Send OTP'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {mobileState.step === 'OTP' && (
                                                <div className="form-group" style={{ marginTop: '20px' }}>
                                                    <label>Enter OTP</label>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter 6-digit OTP"
                                                            className="form-control"
                                                            maxLength="6"
                                                            style={{ maxWidth: '200px' }}
                                                            value={mobileState.otp}
                                                            onChange={(e) => setMobileState(p => ({ ...p, otp: e.target.value }))}
                                                        />
                                                        <button
                                                            className="noc-btn noc-btn-primary"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleVerifyOtp('PHONE')}
                                                            disabled={mobileState.loading}
                                                        >
                                                            {mobileState.loading ? 'Verifying...' : 'Verify & Update'}
                                                        </button>
                                                        <button
                                                            className="noc-btn noc-btn-text"
                                                            onClick={() => setMobileState(p => ({ ...p, step: 'INPUT', otp: '' }))}
                                                        >
                                                            Change Number
                                                        </button>
                                                    </div>
                                                    <p className="help-text" style={{ marginTop: '8px', color: '#28a745' }}>{mobileState.successMsg}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {mobileState.error && <p style={{ color: 'red', marginTop: '10px' }}>❌ {mobileState.error}</p>}
                                </div>
                            </div>

                            {/* Update Email Section */}
                            <div className="security-section">
                                <h4 style={{ color: '#1e3a8a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                                    ✉️ Update Email Address
                                </h4>
                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div className="form-group">
                                        <label>Current Email Address</label>
                                        <input type="email" value={currentData.email} disabled className="form-control" style={{ background: '#e2e8f0', cursor: 'not-allowed', width: '100%', maxWidth: '400px' }} />
                                    </div>

                                    {emailState.step === 'SUCCESS' ? (
                                        <div className="noc-alert noc-alert-success" style={{ marginTop: '20px' }}>
                                            ✅ {emailState.successMsg || 'Email address updated successfully!'}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="form-group" style={{ marginTop: '20px' }}>
                                                <label>New Email Address</label>
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter new email address"
                                                        className="form-control"
                                                        style={{ maxWidth: '400px' }}
                                                        value={emailState.newValue}
                                                        onChange={(e) => setEmailState(p => ({ ...p, newValue: e.target.value }))}
                                                        disabled={emailState.step === 'OTP' || emailState.loading}
                                                    />
                                                    {emailState.step === 'INPUT' && (
                                                        <button
                                                            className="noc-btn noc-btn-secondary"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleSendOtp('EMAIL')}
                                                            disabled={emailState.loading}
                                                        >
                                                            {emailState.loading ? 'Sending...' : 'Send OTP'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {emailState.step === 'OTP' && (
                                                <div className="form-group" style={{ marginTop: '20px' }}>
                                                    <label>Enter OTP</label>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter 6-digit OTP"
                                                            className="form-control"
                                                            maxLength="6"
                                                            style={{ maxWidth: '200px' }}
                                                            value={emailState.otp}
                                                            onChange={(e) => setEmailState(p => ({ ...p, otp: e.target.value }))}
                                                        />
                                                        <button
                                                            className="noc-btn noc-btn-primary"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleVerifyOtp('EMAIL')}
                                                            disabled={emailState.loading}
                                                        >
                                                            {emailState.loading ? 'Verifying...' : 'Verify & Update'}
                                                        </button>
                                                        <button
                                                            className="noc-btn noc-btn-text"
                                                            onClick={() => setEmailState(p => ({ ...p, step: 'INPUT', otp: '' }))}
                                                        >
                                                            Change Email
                                                        </button>
                                                    </div>
                                                    <p className="help-text" style={{ marginTop: '8px', color: '#28a745' }}>{emailState.successMsg}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {emailState.error && <p style={{ color: 'red', marginTop: '10px' }}>❌ {emailState.error}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NOCFooter />
        </div>
    );
};

export default ContactUpdate;
