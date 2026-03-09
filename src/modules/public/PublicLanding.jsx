import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            setError(t('nocLogin.fillAll'));
            return;
        }

        // Verify Captcha
        const isCaptchaValid = await verify_captcha(captchaJwt, formData.captcha, HASH_SECRET);
        if (!isCaptchaValid) {
            setError(t('nocLogin.invalidCaptcha'));
            refreshCaptcha(); // Refresh on failure
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Map frontend service type to backend userType
            let backendUserType = 'APPLICANT';
            if (['dgo', 'sgwa', 'enforcement'].includes(formData.userType)) {
                backendUserType = formData.userType.toUpperCase();
            }

            const result = await login(formData.username, formData.password, backendUserType);

            if (result.success) {
                selectUserType(formData.userType);
                // Redirect to dashboard after successful login
                navigate('/noc/dashboard');
            } else {
                setError(result.error || t('nocLogin.invalidCredentials'));
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(t('nocLogin.networkError'));
        } finally {
            setLoading(false);
        }
    };

    const onlineServices = [
        {
            title: t('services_cards.noc.title'),
            icon: '📄',
            link: '/public/services/noc',
            description: t('services_cards.noc.desc'),
            group: 'apply'
        },
        {
            title: t('services_cards.rig.title'),
            icon: '🏗️',
            link: '/public/services/rig',
            description: t('services_cards.rig.desc'),
            group: 'apply'
        },
        {
            title: t('services_cards.vendor.title'),
            icon: '⚙️',
            link: '/public/services/vendor',
            description: t('services_cards.vendor.desc'),
            group: 'apply'
        },
        {
            title: t('services_cards.track.title'),
            icon: '📋',
            link: '/noc/track-status',
            description: t('services_cards.track.desc'),
            group: 'track'
        },
        {
            title: t('services_cards.ec.title'),
            icon: '💰',
            link: '/public/know-your-ec',
            description: t('services_cards.ec.desc'),
            group: 'track'
        },
        {
            title: t('services_cards.cost.title'),
            icon: '🧮',
            link: EXTERNAL_URLS.CHARGES_CALCULATOR,
            external: true,
            description: t('services_cards.cost.desc'),
            group: 'track'
        }
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
        { text: t('landing.alert1'), icon: '⚠️' },
        { text: t('landing.alert2'), icon: '⚠️' },
        { text: t('landing.alert3'), icon: '⚠️' },
        { text: t('landing.alert4'), icon: '⚠️' }
    ];

    return (
        <div className="gov-portal">
            {/* Clean Enterprise Hero Section */}
            <section className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-title">{t('hero.title1')}<br />{t('hero.title2')}</h1>
                    <p className="hero-subtitle">
                        {t('hero.subtitle')}
                    </p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-value">15k+</span>
                            <span className="stat-label">{t('hero.stats.issued')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">450+</span>
                            <span className="stat-label">{t('hero.stats.rigs')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">100%</span>
                            <span className="stat-label">{t('hero.stats.digital')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flash Message Modal */}
            {flashMessage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: '#ffffff',
                        padding: '32px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            marginBottom: '16px',
                            background: flashMessage.toLowerCase().includes('error') ? '#fef2f2' : '#f0fdf4',
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto',
                            color: flashMessage.toLowerCase().includes('error') ? '#dc2626' : '#16a34a',
                        }}>
                            {flashMessage.toLowerCase().includes('error') || flashMessage.toLowerCase().includes('expired') ? '⚠️' : '✓'}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '600' }}>{t('nocLogin.notification')}</h3>
                        <p style={{ color: '#475569', marginBottom: '24px', lineHeight: '1.5', fontSize: '0.95rem' }}>
                            {flashMessage === 'logoutSuccess' ? t('nocLogin.logoutSuccess') : flashMessage}
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
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1e293b'}
                            onMouseOut={(e) => e.target.style.background = '#0f172a'}
                        >
                            {t('nocLogin.btnGotIt')}
                        </button>
                    </div>
                </div>
            )}


            {/* Main Content Area */}
            <div className="portal-main">
                {/* Left Sidebar */}
                <aside className="left-sidebar">
                    {/* Quick Help & Info Section */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-title"><span>📚</span> {t('landing.docsTitle')}</h3>
                        <ul className="sidebar-menu">
                            <li><Link to="/help/process-flow">{t('landing.doc1')}</Link></li>
                            <li><Link to="/help/timelines">{t('landing.doc2')}</Link></li>
                            <li><Link to="/help/documents">{t('landing.doc3')}</Link></li>
                            <li><Link to="/help/faqs">{t('landing.doc4')}</Link></li>
                            <li><Link to="/help/contact">{t('landing.doc5')}</Link></li>
                            <li><Link to="/help/how-to-apply">{t('landing.doc6')}</Link></li>
                        </ul>
                    </div>

                    {/* Important Notices - Sticky */}
                    <div className="sidebar-section sticky-notices">
                        <h3 className="sidebar-title" style={{ color: '#b45309', borderBottomColor: '#fef3c7' }}>
                            <span>🔔</span> {t('landing.alertsTitle')}
                        </h3>
                        <div className="notice-list">
                            {notifications.map((notif, idx) => (
                                <div key={idx} className="notice-item">
                                    <span>{notif.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acts & Policies Section */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-title"><span>⚖️</span> {t('landing.regTitle')}</h3>
                        <ul className="sidebar-menu">
                            <li><Link to="/public/guidelines?tab=act">{t('landing.reg1')}</Link></li>
                            <li><Link to="/public/guidelines?tab=eligibility">{t('landing.reg2')}</Link></li>
                            <li><Link to="/public/guidelines?tab=fee">{t('landing.reg3')}</Link></li>
                            <li><Link to="/public/guidelines?tab=penalty">{t('landing.reg4')}</Link></li>
                            <li><Link to="/public/guidelines?tab=environment">{t('landing.reg5')}</Link></li>
                        </ul>
                    </div>
                </aside>

                {/* Center Content */}
                <main className="center-content">
                    {/* Apply Services Group */}
                    <section className="services-section">
                        <h2 className="section-title">{t('services_cards.section1')}</h2>
                        <div className="services-grid">
                            {onlineServices.filter(s => s.group === 'apply').map((service, idx) => (
                                <div
                                    key={idx}
                                    className="service-card-gov"
                                    onClick={() => handleServiceCardClick(service)}
                                >
                                    <div className="service-icon-gov">
                                        {/* Simple SVG substitutions for emojis for a cleaner look */}
                                        {service.title.includes('NOC') && (
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        )}
                                        {service.title.includes('Rig') && (
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                        )}
                                        {service.title.includes('Vendor') && (
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{service.title}</h3>
                                        <p className="service-description">{service.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Track & Know Services Group */}
                    <section className="services-section">
                        <h2 className="section-title">{t('services_cards.section2')}</h2>
                        <div className="services-grid">
                            {onlineServices.filter(s => s.group === 'track').map((service, idx) => (
                                <div
                                    key={idx}
                                    className="service-card-gov"
                                    onClick={() => handleServiceCardClick(service)}
                                >
                                    <div className="service-icon-gov">
                                        {service.title.includes('Track') && (
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                        )}
                                        {service.title.includes('EC') && (
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        )}
                                        {service.title.includes('Cost') && (
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{service.title}</h3>
                                        <p className="service-description">{service.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Right Sidebar - Login */}
                <aside className="right-sidebar">
                    <div className="login-panel">
                        <>
                            <h3 className="login-title">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--color-primary-600)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                {t('login.title')}
                            </h3>

                            {error && (
                                <div className="error-msg" style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="login-form-gov">
                                <div className="form-field">
                                    <label>{t('login.roleLabel')}</label>
                                    <select
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className="gov-select"
                                    >
                                        <option value="">{t('login.rolePlaceholder')}</option>
                                        <option value="water_abstractor">{t('login.roleOption')}</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>{t('login.idLabel')}</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="gov-input"
                                        placeholder={t('login.idPlaceholder')}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>{t('login.credLabel')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="gov-input"
                                            placeholder={t('login.credPlaceholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#94a3b8'
                                            }}
                                        >
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                {showPassword ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>{t('login.securityLabel')}</label>
                                    <div className="captcha-container">
                                        <div className="captcha-strip">
                                            {captchaImage ? (
                                                <img
                                                    src={captchaImage}
                                                    alt="Captcha"
                                                    style={{ height: '100%', objectFit: 'contain' }}
                                                    onClick={refreshCaptcha}
                                                    title="Refresh Captcha"
                                                />
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>{t('login.captchaLoading')}</span>
                                            )}
                                        </div>
                                        <div className="captcha-input-area">
                                            <input
                                                type="text"
                                                name="captcha"
                                                value={formData.captcha}
                                                onChange={handleChange}
                                                className="gov-input"
                                                placeholder={t('login.captchaPlaceholder')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="login-btn-gov" disabled={loading}>
                                    {loading ? t('login.btnAuth') : t('login.btnSignIn')}
                                </button>

                                <Link to="/officer/login" style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    border: '1px solid var(--color-primary-200)',
                                    borderRadius: '8px',
                                    color: 'var(--color-primary-700)',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    background: 'var(--color-primary-50)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {t('login.btnOfficer')}
                                </Link>


                                <div className="login-divider">
                                    <span>{t('login.divider')}</span>
                                </div>

                                <div className="create-account-section">
                                    <p className="helper-text">{t('login.helper')}</p>
                                    <Link to="?register=true" className="create-account-btn">
                                        {t('hero.registerEntity')}
                                    </Link>
                                </div>
                            </form>

                            <div className="login-links">
                                <Link to="/forgot-password">{t('login.forgot')}</Link>
                            </div>
                        </>
                    </div>
                </aside>
            </div>


            {/* Footer */}
            <footer className="portal-footer">
                <p>
                    <strong>{t('landing.footer1')}</strong><br />
                    {t('landing.footer2')}<br />
                    <span style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '10px', display: 'block' }}>
                        {t('landing.footer3')}
                    </span>
                </p>
            </footer>
        </div>
    );
};

export default PublicLanding;
