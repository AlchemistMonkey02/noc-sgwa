import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getUserTypeDisplayName, getUserTypeIcon } from '../../utils/authUtils';
import { handleApiError } from '../../utils/error-handler';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login, userType, selectUserType, user, loading: authLoading } = useAuth(); // Destructure properly
    const { t } = useTranslation();
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
            // Pass the selected userType to the login function
            const result = await login(formData.username, formData.password, userType);
            if (result.success) {
                navigate('/noc/dashboard');
            } else {
                setError(result.error);
                setLoading(false);
            }
        } catch (err) {
            const apiError = handleApiError(err, 'Login failed. Please try again.');
            setError(apiError.message);
            setLoading(false);
        }
    };



    return (
        <div className="noc-portal">
            {/* Flash Message Modal */}
            {flashMessage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${flashMessage.toLowerCase().includes('error') || flashMessage.toLowerCase().includes('expired')
                            ? 'bg-error-50 text-error-600' : 'bg-success-50 text-success-600'
                            }`}>
                            {flashMessage.toLowerCase().includes('error') || flashMessage.toLowerCase().includes('expired') ? (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('nocLogin.notification')}</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            {flashMessage === 'logoutSuccess' ? t('nocLogin.logoutSuccess') : flashMessage}
                        </p>
                        <button
                            onClick={() => setFlashMessage('')}
                            className="btn btn-primary w-full"
                        >
                            {t('nocLogin.btnGotIt')}
                        </button>
                    </div>
                </div>
            )}

            <PublicHeader />

            <div className="auth-page-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-icon-wrapper">
                            {userType ? (
                                <div className="text-3xl">{getUserTypeIcon(userType)}</div>
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                            )}
                        </div>
                        <h2 className="auth-title">
                            {userType ? `${getUserTypeDisplayName(userType)} ${t('nocLogin.titleSuffix')}` : t('nocLogin.defaultTitle')}
                        </h2>
                        <p className="auth-subtitle">
                            {t('nocLogin.subtitle')}
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-6 p-3">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="form-group mb-4">
                            <label className="form-label">{t('nocLogin.usernameLabel')} <span className="text-error">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <input
                                    type="text"
                                    className="form-input pl-10"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder={t('nocLogin.usernamePlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="form-label mb-0">{t('nocLogin.passwordLabel')} <span className="text-error">*</span></label>
                                <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700">{t('nocLogin.forgot')}</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input pl-10 pr-10"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Captcha */}
                        <div className="form-group mb-8">
                            <label className="form-label">{t('nocLogin.securityLabel')} <span className="text-error">*</span></label>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-100 text-2xl tracking-[4px] font-mono font-bold text-primary-900 shadow-sm grow text-center">
                                    5 A 7 K 9
                                </div>
                                <input
                                    type="text"
                                    className="form-input w-32"
                                    name="captcha"
                                    placeholder={t('nocLogin.captchaPlaceholder')}
                                    value={formData.captcha}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full btn-lg"
                            disabled={loading || authLoading}
                        >
                            {loading || authLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {t('nocLogin.signingIn')}
                                </span>
                            ) : t('nocLogin.btnSignIn')}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 mb-4">
                            {t('nocLogin.noAccount')}{' '}
                            <Link to="?register=true" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors no-underline">
                                {t('nocLogin.createAccount')}
                            </Link>
                        </p>

                        <div className="flex flex-col gap-2">
                            <Link to="/role-selection" className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors no-underline flex items-center justify-center gap-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                {t('nocLogin.changeService')}
                            </Link>
                            <Link to="/" className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors no-underline flex items-center justify-center gap-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                {t('nocLogin.backToPortal')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCLogin;
