import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './shared/styles/officer-portal.css';
import './OfficerLogin.css';

const ROLES = [
    {
        value: 'DGO',
        label: 'DGO',
        full: 'District Groundwater Officer',
        icon: '🏛️',
        color: '#1e3a8a',
        bg: '#eff6ff'
    },
    {
        value: 'SGWA',
        label: 'SGWA',
        full: 'State Groundwater Authority',
        icon: '🌊',
        color: '#065f46',
        bg: '#ecfdf5'
    },
    {
        value: 'ENFORCEMENT',
        label: 'Enforcement',
        full: 'Enforcement Wing Officer',
        icon: '⚖️',
        color: '#92400e',
        bg: '#fffbeb'
    },
    {
        value: 'INSPECTION',
        label: 'Inspection',
        full: 'Inspection Officer',
        icon: '🔍',
        color: '#581c87',
        bg: '#faf5ff'
    }
];

const OfficerLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ username: '', password: '', role: 'DGO' });
    const [showPassword, setShowPassword] = useState(false);
    const [showCreds, setShowCreds] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    // Pre-fill role if redirected from public portal
    useEffect(() => {
        if (location.state?.prefilledRole) {
            setFormData(prev => ({ ...prev, role: location.state.prefilledRole }));
        }
    }, [location.state]);

    const selectedRole = ROLES.find(r => r.value === formData.role) || ROLES[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(formData.username, formData.password, formData.role);
            if (result.success) {
                const routes = {
                    DGO: '/officer/dgo/dashboard',
                    SGWA: '/officer/sgwa/dashboard',
                    ENFORCEMENT: '/officer/enforcement/dashboard',
                    INSPECTION: '/officer/inspection/dashboard'
                };
                navigate(routes[formData.role] || '/officer/login');
            } else {
                setError(result.error || 'Invalid credentials. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ol-page">
            {/* Left decorative panel */}
            <div className="ol-left">
                <div className="ol-left-emblem">
                    <img
                        src="/logos/india-emblem.png"
                        alt="Emblem of India"
                        className="ol-emblem-img"
                        onError={e => e.target.style.display = 'none'}
                    />
                </div>
                <h2 className="ol-left-title">Officer Portal</h2>
                <p className="ol-left-sub">State Groundwater Authority</p>
                <p className="ol-left-dept">Government of Rajasthan</p>

                <div className="ol-left-roles">
                    {ROLES.map(r => (
                        <div
                            key={r.value}
                            className={`ol-role-pill ${formData.role === r.value ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                        >
                            <span>{r.icon}</span>
                            <span>{r.label}</span>
                        </div>
                    ))}
                </div>

                <Link to="/" className="ol-back-link">← Public Portal</Link>
            </div>

            {/* Right form panel */}
            <div className="ol-right">
                <div className="ol-card">
                    {/* Selected role indicator */}
                    <div className="ol-role-indicator" style={{ background: selectedRole.bg, color: selectedRole.color }}>
                        <span className="ol-role-icon">{selectedRole.icon}</span>
                        <div>
                            <div className="ol-role-name">{selectedRole.full}</div>
                            <div className="ol-role-sub">Officer Login</div>
                        </div>
                    </div>

                    <h1 className="ol-card-title">Welcome Back</h1>
                    <p className="ol-card-sub">Sign in to your officer dashboard</p>

                    {error && (
                        <div className="ol-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="ol-form">
                        {/* Role selector (also on mobile) */}
                        <div className="ol-form-group ol-role-select-group">
                            <label className="ol-label">Officer Role</label>
                            <select
                                className="ol-select"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.icon} {r.full}</option>
                                ))}
                            </select>
                        </div>

                        <div className="ol-form-group">
                            <label className="ol-label">Username</label>
                            <input
                                type="text"
                                className="ol-input"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Enter your username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="ol-form-group">
                            <label className="ol-label">Password</label>
                            <div className="ol-pwd-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="ol-input"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="ol-eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="ol-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="ol-spinner">⏳ Logging in...</span>
                            ) : (
                                <>Login to Portal →</>
                            )}
                        </button>
                    </form>

                    {/* Test Credentials Panel */}
                    <div className="ol-creds-section">
                        <button
                            type="button"
                            className="ol-creds-toggle"
                            onClick={() => setShowCreds(!showCreds)}
                        >
                            {showCreds ? '🔒 Hide' : '🔑 Show'} Test Credentials
                        </button>
                        {showCreds && (
                            <div className="ol-creds-panel">
                                <div className="ol-creds-note">Password for all: <strong>Test@1234</strong></div>
                                <table className="ol-creds-table">
                                    <thead>
                                        <tr><th>Role</th><th>Username</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>DGO</td><td>test_dgo</td></tr>
                                        <tr><td>SGWA</td><td>test_sgwa</td></tr>
                                        <tr><td>Enforcement</td><td>test_enforcement</td></tr>
                                        <tr><td>Inspection</td><td>test_inspection</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="ol-footer-links">
                        <a href="#" className="ol-forgot">Forgot Password?</a>
                        <span>·</span>
                        <Link to="/" className="ol-pub-link">Public Portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
