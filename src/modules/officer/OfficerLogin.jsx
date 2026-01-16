import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setOfficerToken, setOfficerRole, setOfficerData } from './shared/utils/officerAuth';
import './shared/styles/officer-portal.css';

const OfficerLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'DGO'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Mock API call - replace with actual backend API
            // const response = await fetch('http://api.sgwa.rajasthan.gov.in/api/v1/officer/login', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData)
            // });

            // Mock authentication logic
            if (formData.email && formData.password) {
                // Mock token and user data
                const mockToken = 'mock-jwt-token-' + Date.now();
                const mockOfficerData = {
                    name: getMockOfficerName(formData.role),
                    email: formData.email,
                    role: formData.role,
                    designation: getMockDesignation(formData.role),
                    district: formData.role === 'DGO' ? 'Jaipur' : ''
                };

                // Set authentication data
                setOfficerToken(mockToken);
                setOfficerRole(formData.role);
                setOfficerData(mockOfficerData);

                // Redirect based on role
                const dashboardRoutes = {
                    'DGO': '/officer/dgo/dashboard',
                    'SGWA': '/officer/sgwa/dashboard',
                    'ENFORCEMENT': '/officer/enforcement/dashboard',
                    'INSPECTION': '/officer/inspection/dashboard'
                };

                navigate(dashboardRoutes[formData.role]);
            } else {
                setError('Please enter valid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMockOfficerName = (role) => {
        const names = {
            'DGO': 'Ramesh Kumar',
            'SGWA': 'Dr. Priya Sharma',
            'ENFORCEMENT': 'Suresh Patel',
            'INSPECTION': 'Vikram Singh'
        };
        return names[role] || 'Officer';
    };

    const getMockDesignation = (role) => {
        const designations = {
            'DGO': 'District Groundwater Officer',
            'SGWA': 'Technical Officer',
            'ENFORCEMENT': 'Chief Engineer',
            'INSPECTION': 'Field Inspector'
        };
        return designations[role] || 'Officer';
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

                    {/* Email */}
                    <div className="officer-form-group">
                        <label className="officer-label required">Email Address</label>
                        <input
                            type="email"
                            className="officer-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="officer@sgwa.raj.in"
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
