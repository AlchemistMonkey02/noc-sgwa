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
    const { login, userType, selectUserType, user, loading: authLoading } = useAuth(); // Destructure properly
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        captcha: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Form loading state
    const [flashMessage, setFlashMessage] = useState('');

    // Check for flash message from redirection (e.g. logout)
    useEffect(() => {
        if (location.state?.flashMessage) {
            setFlashMessage(location.state.flashMessage);
            // Optional: Clear state so it doesn't persist on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/noc/dashboard');
        }
    }, [user, authLoading, navigate]);

    // Auto-select service type from URL parameter
    useEffect(() => {
        const serviceParam = searchParams.get('service');
        if (serviceParam && !userType) {
            selectUserType(serviceParam);
        }
    }, [searchParams, userType, selectUserType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!formData.username || !formData.password || !formData.captcha) {
            setError('Please fill all required fields');
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const success = await login(formData.username, formData.password);
            if (success) {
                navigate('/noc/dashboard');
            } else {
                setError('Invalid credentials');
                setLoading(false);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            setLoading(false);
        }
    };



    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
            {/* Flash Message Modal */}
            {flashMessage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e2e8f0',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '15px',
                            background: '#dcfce7',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto',
                            color: '#166534'
                        }}>
                            {flashMessage.toLowerCase().includes('error') || flashMessage.toLowerCase().includes('expired') ? '⚠️' : '✅'}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.25rem' }}>Notification</h3>
                        <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.5' }}>
                            {flashMessage}
                        </p>
                        <button
                            onClick={() => setFlashMessage('')}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#0f172a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1e293b'}
                            onMouseOut={(e) => e.target.style.background = '#0f172a'}
                        >
                            Okay, Got it
                        </button>
                    </div>
                </div>
            )}

            <NOCHeader />

            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px', background: '#fff' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
                    padding: '40px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {userType ? getUserTypeIcon(userType) : '💧'}
                        </div>
                        <h2 style={{ color: '#0f4c81', margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: '700' }}>
                            {userType ? `${getUserTypeDisplayName(userType)} Login` : 'Ground Water Department Login'}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                            Login to Ground Water Department Portal
                        </p>
                        <div style={{ width: '60px', height: '3px', background: '#f1f5f9', margin: '15px auto' }}></div>
                    </div>

                    {error && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Username */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Username / Email ID <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    background: '#eff6ff',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    color: '#0f172a',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Password <span style={{ color: 'red' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        background: '#eff6ff',
                                        fontSize: '0.95rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Captcha */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Enter Captcha <span style={{ color: 'red' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{
                                    background: '#f1f5f9',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    letterSpacing: '5px',
                                    fontFamily: 'monospace',
                                    userSelect: 'none'
                                }}>
                                    5 A 7 K 9
                                </div>
                                <input
                                    type="text"
                                    name="captcha"
                                    placeholder="Enter captcha"
                                    value={formData.captcha}
                                    onChange={handleChange}
                                    style={{
                                        flex: 1,
                                        padding: '10px 15px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        background: 'white'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100px',
                                padding: '10px 20px',
                                background: '#1e3a8a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? '...' : 'Login'}
                        </button>

                    </form>

                    <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <a href="#" style={{ color: '#0f4c81', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</a>
                        <div style={{ color: '#64748b' }}>
                            Don't have an account? <Link to="/noc/register" style={{ color: '#0f4c81', textDecoration: 'none', fontWeight: '600' }}>Register New Account</Link>
                        </div>
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                            <Link to="/role-selection" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>← Change Service Type</Link>
                        </div>
                        <div>
                            <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>← Back to Public Portal</Link>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCLogin;
