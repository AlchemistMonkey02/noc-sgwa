import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NOCRegister from '../noc/NOCRegister';
import PublicHeader from './components/PublicHeader';
import { EXTERNAL_URLS } from '../../config/constants';
import './styles/public-landing.css';

const PublicLanding = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, selectUserType, user } = useAuth();
    // ... existing state ...
    const [formData, setFormData] = useState({
        userType: '',
        username: '',
        password: '',
        captcha: ''
    });
    // ... rest of state ...
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [flashMessage, setFlashMessage] = useState('');

    // Check for flash message from redirection (e.g. logout)
    useEffect(() => {
        if (location.state?.flashMessage) {
            setFlashMessage(location.state.flashMessage);
            // Optional: Clear state so it doesn't persist on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    // ... handleSubmit ...
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.userType || !formData.username || !formData.password || !formData.captcha) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Map frontend service type to backend userType
            let backendUserType = 'APPLICANT';
            if (['dgo', 'rsgwa', 'enforcement'].includes(formData.userType)) {
                backendUserType = formData.userType.toUpperCase();
            }

            const result = await login(formData.username, formData.password, backendUserType);

            if (result.success) {
                selectUserType(formData.userType);
                // Redirect to dashboard after successful login
                navigate('/noc/dashboard');
            } else {
                setError(result.error || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const onlineServices = [
        { title: 'Groundwater NOC', icon: '📄', link: '/public/services/noc' },
        { title: 'Rig Registration', icon: '🏗️', link: '/public/services/rig' },
        { title: 'Vendor Registration', icon: '⚙️', link: '/public/services/vendor' },
        { title: 'Know Your EC', icon: '💰', link: '/public/know-your-ec' },
        { title: 'Know Your Abstraction Cost', icon: '🧮', link: EXTERNAL_URLS.CHARGES_CALCULATOR, external: true },
        { title: 'Application Status', icon: '📋', link: '/noc/track-status' }
    ];

    const handleServiceCardClick = (service) => {
        
        if (service.link) {
            if (service.external) {
                // Open external links in a new tab
                window.open(service.link, '_blank', 'noopener,noreferrer');
            } else {
                // Navigate to internal routes
                navigate(service.link);
                window.scrollTo(0, 0);
            }
        }
    };


    const notifications = [
        { text: 'New Groundwater NOC Guidelines – 2026', icon: '⚠️' },
        { text: 'Revised Fee Structure Effective Jan 2026', icon: '⚠️' },
        { text: 'Online Rig Registration Mandatory', icon: '⚠️' },
        { text: 'Water Meter Compliance Notice', icon: '⚠️' }
    ];

    return (
        <div className="gov-portal">
            <PublicHeader />

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


            {/* Main Content Area */}
            <div className="portal-main">
                {/* Left Sidebar */}
                <aside className="left-sidebar">
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Online Services</h3>
                        <ul className="sidebar-menu">
                            <li><Link to="/public/services/noc">➤ Groundwater NOC</Link></li>
                            <li><Link to="/public/services/rig">➤ Rig Registration</Link></li>
                            <li><Link to="/public/services/vendor">➤ Vendor Registration</Link></li>
                            {/* NOC Renewal likely needs login/dashboard access */}
                            <li><Link to="/noc/login">➤ NOC Renewal (Login Required)</Link></li>
                            <li><Link to="/noc/track-status">➤ Track Application</Link></li>
                        </ul>
                    </div>
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Guidelines</h3>
                        <ul className="sidebar-menu">
                            <li><Link to="/public/guidelines?tab=act">➤ Groundwater Act</Link></li>
                            <li><Link to="/public/guidelines?tab=fee">➤ Fee Structure</Link></li>
                            <li><Link to="/public/guidelines?tab=eligibility">➤ Eligibility Criteria</Link></li>
                        </ul>
                    </div>
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Notifications</h3>
                        <ul className="sidebar-menu">
                            <li><Link to="/public/guidelines?tab=act">➤ Groundwater Act</Link></li>
                            <li><Link to="/public/guidelines?tab=fee">➤ Fee Structure</Link></li>
                        </ul>
                    </div>
                </aside>

                {/* Center Content */}
                <main className="center-content">
                    <section className="services-section">
                        <h2 className="section-title">Online Services</h2>
                        <div className="services-grid">
                            {onlineServices.map((service, idx) => (
                                <div
                                    key={idx}
                                    className="service-card-gov"
                                    onClick={() => handleServiceCardClick(service)}
                                >
                                    <div className="service-icon-gov">{service.icon}</div>
                                    <h3>{service.title}</h3>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="notifications-bar">
                        <h3 className="notif-bar-title">Online Services</h3>
                        <div className="notif-items">
                            {notifications.map((notif, idx) => (
                                <div key={idx} className="notif-item">
                                    <span className="notif-icon">{notif.icon}</span>
                                    <span>{notif.text}</span>
                                </div>
                            ))}
                        </div>
                        <a href="#all-notif" className="view-all-link">View All Notifications</a>
                    </section>
                </main>

                {/* Right Sidebar - Login */}
                <aside className="right-sidebar">
                    <div className="login-panel">
                        <>
                            <h3 className="login-title">Registered User Login</h3>

                            {error && (
                                <div className="error-msg">{error}</div>
                            )}

                            <form onSubmit={handleSubmit} className="login-form-gov">
                                <div className="form-field">
                                    <label>Service Type</label>
                                    <select
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className="gov-select"
                                    >
                                        <option value="">— Select Service Type —</option>
                                        <option value="water_abstractor">Noc Applicant (Individual)</option>
                                        {/* <option value="rig_registration">Rig Registration & Operations</option>
                                        <option value="vendor_registration">Vendor/Equipment Registration</option>
                                        <option value="dgo">District Groundwater Officer (DGO)</option>
                                        <option value="rsgwa">RSGWA Officer</option>
                                        <option value="enforcement">Enforcement Officer</option> */}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>User ID</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="gov-input"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="gov-input"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Captcha</label>
                                    <div className="captcha-container">
                                        <div className="captcha-strip">
                                            {/* Vertical stacking with spans */}
                                            <span style={{ '--r': '-5deg' }}>5</span>
                                            <span style={{ '--r': '3deg' }}>A</span>
                                            <span style={{ '--r': '-2deg' }}>7</span>
                                            <span style={{ '--r': '4deg' }}>K</span>
                                            <span style={{ '--r': '-3deg' }}>9</span>
                                        </div>
                                        <div className="captcha-input-area">
                                            <input
                                                type="text"
                                                name="captcha"
                                                value={formData.captcha}
                                                onChange={handleChange}
                                                className="gov-input"
                                                placeholder="Enter code"
                                                style={{ height: '45px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="login-btn-gov" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div className="login-links">
                                <Link to="/forgot-password">Forgot Password?</Link>
                                <div className="create-account-link">
                                    Create <Link to="/noc/register">New Account</Link>
                                </div>
                            </div>
                        </>
                    </div>
                </aside>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="registration-modal-overlay" onClick={() => setShowRegisterModal(false)}>
                    <div className="registration-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close-button"
                            onClick={() => setShowRegisterModal(false)}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                        <NOCRegister isModal={true} onClose={() => setShowRegisterModal(false)} />
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="portal-footer">
                <p>
                    © 2026 Ground Water Department, Rajasthan | This is an official website of the Government of Rajasthan,
                    designed and developed by National Informatics Centre (NIC)
                </p>
            </footer>
        </div>
    );
};

export default PublicLanding;
