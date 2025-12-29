import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        captcha: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username/Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (!formData.captcha.trim()) {
            newErrors.captcha = 'Captcha is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Simulate login - in real app, this would call an API
            console.log('Login attempt:', formData);

            // Store user session
            localStorage.setItem('nocUser', JSON.stringify({
                username: formData.username,
                loginTime: new Date().toISOString()
            }));

            // Navigate to dashboard
            navigate('/noc/dashboard');
        }
    };

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-auth-page">
                <div className="noc-auth-card">
                    <div className="noc-auth-header">
                        <h2>External User Login</h2>
                        <p>Login to BhuNeer NOC Application Portal</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="noc-form-group">
                            <label className="noc-form-label required">
                                Username / Email ID
                            </label>
                            <input
                                type="text"
                                name="username"
                                className={`noc-form-control ${errors.username ? 'error' : ''}`}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username or email"
                            />
                            {errors.username && (
                                <span className="noc-form-error">{errors.username}</span>
                            )}
                        </div>

                        <div className="noc-form-group">
                            <label className="noc-form-label required">
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`noc-form-control ${errors.password ? 'error' : ''}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="noc-form-error">{errors.password}</span>
                            )}
                        </div>

                        <div className="noc-form-group">
                            <label className="noc-form-label required">
                                Enter Captcha
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{
                                    background: '#f0f0f0',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    letterSpacing: '5px',
                                    userSelect: 'none',
                                    fontFamily: 'monospace'
                                }}>
                                    5A7K9
                                </div>
                                <input
                                    type="text"
                                    name="captcha"
                                    className={`noc-form-control ${errors.captcha ? 'error' : ''}`}
                                    value={formData.captcha}
                                    onChange={handleChange}
                                    placeholder="Enter captcha"
                                    style={{ flex: 1 }}
                                />
                            </div>
                            {errors.captcha && (
                                <span className="noc-form-error">{errors.captcha}</span>
                            )}
                        </div>

                        <button type="submit" className="noc-btn noc-btn-primary noc-btn-block">
                            Login
                        </button>
                    </form>

                    <div className="noc-auth-links">
                        <p>
                            <a href="/noc/forgot-password" className="noc-link">
                                Forgot Password?
                            </a>
                        </p>
                        <p>
                            Don't have an account?{' '}
                            <a href="/noc/register" className="noc-link">
                                New External User (Register)
                            </a>
                        </p>
                        <p>
                            <a href="/noc/department-login" className="noc-link">
                                Department User Login
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCLogin;
