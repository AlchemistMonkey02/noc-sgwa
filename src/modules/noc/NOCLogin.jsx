import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: 'CGWA2023001',
        password: '',
        captcha: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple validation
        if (!formData.username || !formData.password || !formData.captcha) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            // Simulate login success
            localStorage.setItem('nocUser', JSON.stringify({
                username: formData.username,
                loginTime: new Date().toISOString()
            }));
            navigate('/noc/dashboard');
            setLoading(false);
        }, 800);
    };

    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
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
                        <h2 style={{ color: '#0f4c81', margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: '700' }}>
                            External User Login
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                            Login to RGSWA NOC Application Portal
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
                        <div style={{ marginTop: '5px' }}>
                            <span style={{ marginRight: '5px' }}>🏛️</span>
                            <Link to="/noc/officer/login" style={{ color: '#0f4c81', textDecoration: 'none', fontWeight: '700' }}>Officer Portal Login →</Link>
                        </div>
                        <div>
                            <a href="#" style={{ color: '#0f4c81', textDecoration: 'none' }}>Department Login</a>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCLogin;
