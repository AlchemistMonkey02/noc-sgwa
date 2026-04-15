import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
// import { setOfficerToken, setOfficerRole, setOfficerData, setOfficerRefreshToken } from './shared/utils/officerAuth'; // Now handled by context
import './shared/styles/officer-portal.css';
import { handleApiError } from '../../utils/error-handler';

import API_BASE_URL from '../../config/apiConfig';

const OfficerLogin = () => {
    const { t } = useTranslation();
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
            const apiError = handleApiError(err, 'Login failed. Please check your connection and try again.');
            setError(apiError.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="officer-login-page">
            <div className="officer-login-card">
                {/* Header */}
                <div className="officer-login-header">
                    <h1 className="officer-login-title">
                        {t('officer.login.title')}
                    </h1>
                    <p className="officer-login-subtitle">
                        {t('officer.login.subtitle')}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="officer-login-error">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="officer-form-group">
                        <label className="officer-label required">{t('officer.login.roleLabel')}</label>
                        <select
                            className="officer-select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                        >
                            <option value="DGO">{t('officer.login.roles.DGO')}</option>
                            <option value="SGWA">{t('officer.login.roles.SGWA')}</option>
                            <option value="ENFORCEMENT">{t('officer.login.roles.ENFORCEMENT')}</option>
                            <option value="INSPECTION">{t('officer.login.roles.INSPECTION')}</option>
                        </select>
                    </div>

                    {/* Username */}
                    <div className="officer-form-group">
                        <label className="officer-label required">{t('officer.login.usernameLabel')}</label>
                        <input
                            type="text"
                            className="officer-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder={t('officer.login.usernamePlaceholder')}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="officer-form-group">
                        <label className="officer-label required">{t('officer.login.passwordLabel')}</label>
                        <input
                            type="password"
                            className="officer-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={t('officer.login.passwordPlaceholder')}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="officer-btn officer-btn-primary officer-login-submit"
                        disabled={loading}
                    >
                        {loading ? t('officer.login.loggingIn') : t('officer.login.btnLogin')}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="officer-login-footer">
                    <p>
                        <Link to="?forgot-password=true">
                            {t('officer.login.forgotPassword')}
                        </Link>
                    </p>
                    <p>
                        {t('officer.login.applicantLink').split('please')[0]}
                        <a href="/noc/login">
                            {t('officer.login.applicantLink').includes('click here') ? 'click here' : 'यहाँ क्लिक करें'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
