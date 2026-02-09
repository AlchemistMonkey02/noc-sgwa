import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NOCRegister from '../noc/NOCRegister';
import PublicHeader from './components/PublicHeader';
import { EXTERNAL_URLS } from '../../config/constants';
// Native Web Crypto API Implementation for Token Signing/Verification
// This removes dependency on 'jsonwebtoken' and Node polyfills like Buffer/Crypto
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const str2ab = (str) => textEncoder.encode(str);
const ab2str = (ab) => textDecoder.decode(ab);

const getCryptoKey = async (secret) => {
    return window.crypto.subtle.importKey(
        "raw",
        str2ab(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
};

const signToken = async (payload, secret) => {
    const key = await getCryptoKey(secret);
    const data = JSON.stringify(payload);
    const signature = await window.crypto.subtle.sign(
        "HMAC",
        key,
        str2ab(data)
    );
    // Convert signature to Base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    // Return payload + signature
    return btoa(data) + '.' + signatureBase64;
};

const verifyToken = async (token, secret) => {
    try {
        const [payloadB64, signatureB64] = token.split('.');
        if (!payloadB64 || !signatureB64) return false;

        const key = await getCryptoKey(secret);
        const dataStr = atob(payloadB64);
        const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));

        const isValid = await window.crypto.subtle.verify(
            "HMAC",
            key,
            signature,
            str2ab(dataStr)
        );

        if (isValid) {
            return JSON.parse(dataStr);
        }
        return false;
    } catch (e) {
        console.error("Token verification failed:", e);
        return false;
    }
};

// Native Browser Implementation of Captcha Generation
const generate_captcha = async (bgBase64, randomKey, secret, options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const length = options.length || 6;
            const width = 150;
            const height = 50;

            // 1. Create Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // 2. Draw Background
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < 50; i++) {
                ctx.fillStyle = `rgba(200,200,200, ${Math.random()})`;
                ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
            }

            // 3. Generate Random Text
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let text = "";
            for (let i = 0; i < length; i++) {
                text += chars[Math.floor(Math.random() * chars.length)];
            }

            // 4. Draw Text
            ctx.font = "bold 24px sans-serif";
            ctx.textBaseline = "middle";
            const spacing = width / (length + 2);

            for (let i = 0; i < length; i++) {
                const x = spacing * (i + 1);
                const y = height / 2;
                const char = text[i];

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((Math.random() - 0.5) * 0.4);
                ctx.fillStyle = "#333";
                ctx.fillText(char, 0, 0);
                ctx.restore();
            }

            // 5. Add Noise
            for (let i = 0; i < 7; i++) {
                ctx.strokeStyle = `rgba(100,100,100, ${Math.random()})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(Math.random() * width, Math.random() * height);
                ctx.lineTo(Math.random() * width, Math.random() * height);
                ctx.stroke();
            }

            // 6. Generate Token with Native Crypto
            const payload = {
                k: randomKey,
                t: text,
                exp: Date.now() + 5 * 60 * 1000 // 5 mins
            };

            const token = await signToken(payload, secret);

            // 7. Return Data URL
            const dataUrl = canvas.toDataURL('image/png');
            resolve([token, dataUrl]);
        } catch (e) {
            reject(e);
        }
    });
};

const verify_captcha = async (token, input, secret) => {
    try {
        const decoded = await verifyToken(token, secret);
        if (!decoded) return false;

        // Check expiry
        if (decoded.exp && Date.now() > decoded.exp) return false;

        return decoded.t === input.toUpperCase();
    } catch (e) {
        return false;
    }
};

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
    const [captchaJwt, setCaptchaJwt] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');

    const HASH_SECRET = 'sgwa_secret_key_2026'; // In production, this should be backend-side
    const RANDOM_KEY = 'sgwa_random_key_987';
    // 150x50 grey placeholder
    const BG_IMAGE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAyCAYAAACaxd2OAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVHhe7cExAQAAAMKg9U9tCj8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJw0FeAABxO93uAAAAABJRU5ErkJggg==";

    const refreshCaptcha = async () => {
        try {
            // Use native canvas implementation
            const [token, dataUrl] = await generate_captcha(BG_IMAGE_BASE64, RANDOM_KEY, HASH_SECRET, { length: 5 });
            setCaptchaJwt(token);
            setCaptchaImage(dataUrl);
        } catch (e) {
            console.error("Captcha error:", e);
        }
    };

    useEffect(() => {
        refreshCaptcha();
    }, []);

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

        // Verify Captcha
        const isCaptchaValid = await verify_captcha(captchaJwt, formData.captcha, HASH_SECRET);
        if (!isCaptchaValid) {
            setError('Invalid Captcha Code');
            refreshCaptcha(); // Refresh on failure
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
            {/* PublicHeader is handled by Layout.jsx */}

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
                                        <div className="captcha-strip" style={{ display: 'block', padding: 0, overflow: 'hidden', border: '1px solid #ccc' }}>
                                            {captchaImage ? (
                                                <img
                                                    src={captchaImage}
                                                    alt="Captcha"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onClick={refreshCaptcha}
                                                    title="Click to Refresh"
                                                />
                                            ) : (
                                                <div style={{ padding: '10px', textAlign: 'center' }}>Loading...</div>
                                            )}
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
