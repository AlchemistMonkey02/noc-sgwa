import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { setOfficerToken, setOfficerRole, setOfficerData, setOfficerRefreshToken } from './shared/utils/officerAuth'; // Now handled by context
import './shared/styles/officer-portal.css';

import API_BASE_URL from '../../config/apiConfig';

const OfficerLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'DGO'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth(); // Use auth context

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting login with:', { username: formData.username, role: formData.role });

            // Call login from AuthContext
            const result = await login(formData.username, formData.password, formData.role);

            if (result.success) {
                console.log('Login successful, modifying local state if needed (handled by context)');

                // Redirect based on validated role
                const dashboardRoutes = {
                    'DGO': '/officer/dgo/dashboard',
                    'SGWA': '/officer/sgwa/dashboard',
                    'ENFORCEMENT': '/officer/enforcement/dashboard',
                    'INSPECTION': '/officer/inspection/dashboard'
                };

                const redirectUrl = dashboardRoutes[formData.role] || '/officer/login'; // Fallback
                navigate(redirectUrl);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                padding: '3rem',
                maxWidth: '500px',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--officer-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Officer Portal Login
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--officer-text-light)',
                        margin: 0
                    }}>
                        State Groundwater Authority, Rajasthan
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--officer-danger)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: 'var(--officer-danger)',
                        fontSize: '0.9375rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="officer-form-group">
                        <label className="officer-label required">Officer Role</label>
                        <select
                            className="officer-select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                        >
                            <option value="DGO">DGO (District Groundwater Officer)</option>
                            <option value="SGWA">SGWA (State Groundwater Authority)</option>
                            <option value="ENFORCEMENT">Enforcement Wing</option>
                            <option value="INSPECTION">Inspection Officer</option>
                        </select>
                    </div>

                    {/* Username */}
                    <div className="officer-form-group">
                        <label className="officer-label required">Username</label>
                        <input
                            type="text"
                            className="officer-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="officer-form-group">
                        <label className="officer-label required">Password</label>
                        <input
                            type="password"
                            className="officer-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="officer-btn officer-btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '1rem'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login to Portal'}
                    </button>
                </form>

                {/* Footer Links */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--officer-border)',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--officer-text-light)'
                }}>
                    <p style={{ margin: 0 }}>
                        <a href="#" style={{ color: 'var(--officer-primary)', textDecoration: 'none' }}>
                            Forgot Password?
                        </a>
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0' }}>
                        For applicants, please{' '}
                        <a
                            href="/noc/login"
                            style={{ color: 'var(--officer-primary)', textDecoration: 'none', fontWeight: '600' }}
                        >
                            click here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
