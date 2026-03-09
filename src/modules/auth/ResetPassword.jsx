import apiClient from '../../services/apiClient';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const [validating, setValidating] = useState(true);

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        if (!token) {
            setTokenValid(false);
            setValidating(false);
            return;
        }

        try {
            await apiClient.get(`/auth/validate-reset-token?token=${token}`);
            setTokenValid(true);
        } catch (error) {
            console.error('Token validation error:', error);
            setTokenValid(false);
        } finally {
            setValidating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return 'Password must be at least 8 characters long';
        if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
        if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
        if (!hasNumber) return 'Password must contain at least one number';
        if (!hasSpecialChar) return 'Password must contain at least one special character';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.newPassword || !formData.confirmPassword) {
            setError('Please fill all required fields');
            return;
        }

        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiClient.post('/auth/reset-password', {
                token: token,
                newPassword: formData.newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            setError(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <div className="validating">
                        <div className="spinner-large"></div>
                        <p>Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <div className="invalid-token">
                        <div className="error-icon-large">❌</div>
                        <h2>Invalid or Expired Link</h2>
                        <p>This password reset link is invalid or has expired.</p>
                        <div className="invalid-reasons">
                            <p>Possible reasons:</p>
                            <ul>
                                <li>The link has expired (valid for 24 hours only)</li>
                                <li>The link has already been used</li>
                                <li>The link is invalid or corrupted</li>
                            </ul>
                        </div>
                        <button onClick={() => navigate('/forgot-password')} className="btn-primary">
                            Request New Reset Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <div className="success-screen">
                        <div className="success-icon-large">✅</div>
                        <h2>Password Reset Successful!</h2>
                        <p>Your password has been successfully reset.</p>
                        <p className="redirect-message">Redirecting to login page in 3 seconds...</p>
                        <button onClick={() => navigate('/')} className="btn-primary">
                            Go to Login Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <div className="reset-password-container">
                <div className="reset-password-header">
                    <div className="header-icon">🔑</div>
                    <h2>Reset Your Password</h2>
                    <p>Enter your new password below</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label>New Password <span className="required">*</span></label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                            >
                                {showPassword.new ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password <span className="required">*</span></label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                            >
                                {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="password-requirements">
                        <h4>Password Requirements:</h4>
                        <ul>
                            <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                                At least 8 characters long
                            </li>
                            <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                One uppercase letter (A-Z)
                            </li>
                            <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                                One lowercase letter (a-z)
                            </li>
                            <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                                One number (0-9)
                            </li>
                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : ''}>
                                One special character (!@#$%^&*)
                            </li>
                        </ul>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <div className="form-footer">
                    <button onClick={() => navigate('/')} className="back-link">
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
