import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockOfficers } from './utils/mockApplicationData';
import './styles/officer-portal.css';

const OfficerLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        captcha: ''
    });
    const [activeTab, setActiveTab] = useState('Password'); // Password, OTP, SSO
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            const officer = mockOfficers.find(
                off => (off.employeeId === formData.username || off.email === formData.username) &&
                    off.password === formData.password
            );

            if (officer) {
                localStorage.setItem('nocOfficer', JSON.stringify({
                    id: officer.id,
                    name: officer.name,
                    role: officer.role,
                    specialization: officer.specialization,
                    loginTime: new Date().toISOString()
                }));
                navigate('/noc/officer/dashboard');
            } else {
                setError('Invalid credentials');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.9)), url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/India_Rajasthan_locator_map.svg/1200px-India_Rajasthan_locator_map.svg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Segoe UI", system-ui, sans-serif'
        }}>

            <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '550px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                margin: '20px'
            }}>
                {/* Modal Header */}
                <div style={{ padding: '25px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                    <button style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8' }}>✕</button>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '55px' }} />
                        <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>GWD PORTAL</h1>
                                <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>v2.0</span>
                            </div>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', letterSpacing: '1px' }}>GOVERNMENT OF RAJASTHAN</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ background: '#f8fafc', padding: '20px 25px', display: 'flex', gap: '15px', borderBottom: '1px solid #e2e8f0' }}>
                    {['Password', 'OTP', 'SSO'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: activeTab === tab ? '1px solid #e2e8f0' : 'none',
                                background: activeTab === tab ? 'white' : 'transparent',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: activeTab === tab ? '#0e7490' : '#64748b',
                                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'Password' && (
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )}
                            {tab === 'OTP' && (
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            )}
                            {tab === 'SSO' && (
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            )}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div style={{ padding: '30px 40px' }}>

                    {error && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* User ID */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                User Identification
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 0 00-7 7h14a7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter SSO ID / Username"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 45px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        background: '#fff',
                                        fontSize: '0.95rem',
                                        color: '#334155',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Access Key
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 45px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        background: '#fff',
                                        fontSize: '0.95rem',
                                        color: '#334155',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Captcha */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Security Check
                                </label>
                                <button type="button" style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    REFRESH
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{
                                    flex: 1.5,
                                    background: '#f1f5f9',
                                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                    backgroundSize: '10px 10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    fontWeight: '700',
                                    letterSpacing: '8px',
                                    color: '#334155',
                                    fontFamily: 'monospace',
                                    textDecoration: 'line-through'
                                }}>
                                    RE8PU1
                                </div>
                                <input
                                    type="text"
                                    name="captcha"
                                    placeholder="TYPE CODE"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        textAlign: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Links */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '0.85rem' }}>
                            <a href="#" style={{ color: '#0f4c81', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</a>
                            <Link to="/noc/register" style={{ color: '#059669', textDecoration: 'none', fontWeight: '700' }}>New Registration</Link>
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: '#0c4a6e', // Deep blue
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                'ACCESSING...'
                            ) : (
                                <>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    ACCESS PORTAL
                                </>
                            )}
                        </button>

                    </form>
                </div>

                {/* Footer */}
                <div style={{ padding: '0 40px 20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                    <div>© 2024 Water Dept.</div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            256-bit SSL
                        </span>
                        <span>Privacy</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OfficerLogin;
