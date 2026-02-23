import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserTypeDisplayName, getUserTypeIcon } from '../../utils/authUtils';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login, userType, selectUserType, user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '', captcha: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [flashMessage, setFlashMessage] = useState('');

    useEffect(() => {
        if (location.state?.flashMessage) {
            setFlashMessage(location.state.flashMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        if (!authLoading && user) navigate('/noc/dashboard');
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const serviceParam = searchParams.get('service');
        if (serviceParam && !userType) selectUserType(serviceParam);
    }, [searchParams, userType, selectUserType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.captcha) {
            setError('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            const result = await login(formData.username, formData.password, userType);
            if (result.success) {
                navigate('/noc/dashboard');
            } else {
                setError(result.error);
                setLoading(false);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'white', minHeight: '100vh' }}>
            {/* Flash Message Modal */}
            {flashMessage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="auth-card" style={{ maxWidth: '400px', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{
                            fontSize: '2.5rem', marginBottom: '1rem',
                            background: flashMessage.toLowerCase().includes('error') ? '#fee2e2' : '#dcfce7',
                            width: '72px', height: '72px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem'
                        }}>
                            {flashMessage.toLowerCase().includes('error') || flashMessage.toLowerCase().includes('expired') ? '⚠️' : '✅'}
                        </div>
                        <h3 style={{ margin: '0 0 0.625rem', color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 }}>Notification</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>{flashMessage}</p>
                        <button className="auth-btn" onClick={() => setFlashMessage('')}>Okay, Got it</button>
                    </div>
                </div>
            )}

            <NOCHeader />

            {/* Login Area */}
            <div className="auth-page-wrapper" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 60%, #dbeafe 100%)', minHeight: 'calc(100vh - 140px)' }}>
                <div className="auth-card">
                    {/* Logo / Icon */}
                    <div className="auth-logo-area">
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                            {userType ? getUserTypeIcon(userType) : '💧'}
                        </div>
                        <h2>{userType ? `${getUserTypeDisplayName(userType)} Login` : 'Ground Water Department Login'}</h2>
                        <p>Login to Ground Water Department Portal</p>
                        <div style={{ width: '50px', height: '3px', background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', margin: '0.75rem auto 0', borderRadius: '999px' }} />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            background: '#fee2e2', color: '#b91c1c',
                            padding: '0.75rem 1rem', borderRadius: '8px',
                            marginBottom: '1.25rem', fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            border: '1px solid #fca5a5'
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="auth-form-group">
                            <label className="auth-label">
                                Username / Email ID <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="auth-input"
                                placeholder="Enter your username or email"
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="auth-form-group">
                            <label className="auth-label">
                                Password <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="auth-input"
                                    placeholder="Enter your password"
                                    style={{ paddingRight: '2.75rem' }}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '0.75rem', top: '50%',
                                        transform: 'translateY(-50%)', border: 'none',
                                        background: 'transparent', cursor: 'pointer',
                                        fontSize: '1rem', color: '#94a3b8', padding: 0
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Captcha */}
                        <div className="auth-form-group">
                            <label className="auth-label">
                                Enter Captcha <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                                <div style={{
                                    background: '#f1f5f9', padding: '0.625rem 1.25rem',
                                    borderRadius: '8px', fontWeight: '700', fontSize: '1.1rem',
                                    letterSpacing: '6px', fontFamily: 'monospace',
                                    userSelect: 'none', border: '1.5px solid #d1d5db',
                                    display: 'flex', alignItems: 'center', flexShrink: 0,
                                    color: '#1e3a8a'
                                }}>
                                    5 A 7 K 9
                                </div>
                                <input
                                    type="text"
                                    name="captcha"
                                    placeholder="Enter captcha"
                                    value={formData.captcha}
                                    onChange={handleChange}
                                    className="auth-input"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                            style={{ marginTop: '0.75rem' }}
                        >
                            {loading ? '⏳ Logging in...' : '🔒 Login'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        <Link to="/forgot-password" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                        <div style={{ color: '#64748b' }}>
                            Don't have an account?{' '}
                            <Link to="/noc/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                                Register New Account
                            </Link>
                        </div>
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <Link to="/role-selection" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.8125rem' }}>← Change Service Type</Link>
                            <span style={{ color: '#d1d5db' }}>|</span>
                            <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.8125rem' }}>← Public Portal</Link>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCLogin;
