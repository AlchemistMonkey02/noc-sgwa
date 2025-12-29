import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCRegister = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Details
        fullName: '',
        email: '',
        mobile: '',
        aadhaar: '',
        pan: '',

        // Organization Details
        organizationType: '',
        organizationName: '',
        designation: '',

        // Address Details
        address: '',
        state: '',
        district: '',
        pincode: '',

        // Login Credentials
        username: '',
        password: '',
        confirmPassword: '',

        // Terms
        acceptTerms: false
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
        if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};

        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 4) {
            newErrors.username = 'Username must be at least 4 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
            case 3:
                isValid = validateStep3();
                break;
            default:
                isValid = true;
        }

        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateStep4()) {
            console.log('Registration data:', formData);

            // Simulate registration success
            alert('Registration successful! Please login with your credentials.');
            navigate('/noc/login');
        }
    };

    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const organizationTypes = [
        'Individual',
        'Private Limited Company',
        'Public Limited Company',
        'Partnership Firm',
        'Proprietorship',
        'Government Organization',
        'Educational Institution',
        'Hospital/Healthcare',
        'Hotel/Resort',
        'Industry/Manufacturing',
        'Real Estate/Builder',
        'Agriculture',
        'Other'
    ];

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-auth-page">
                <div className="noc-auth-card" style={{ maxWidth: '700px' }}>
                    <div className="noc-auth-header">
                        <h2>New User Registration</h2>
                        <p>Register for BhuNeer NOC Application Portal</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="noc-progress-steps" style={{ padding: '20px 0' }}>
                        <div className={`noc-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                            <div className="noc-step-number">1</div>
                            <div className="noc-step-label">Personal</div>
                        </div>
                        <div className={`noc-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                            <div className="noc-step-number">2</div>
                            <div className="noc-step-label">Organization</div>
                        </div>
                        <div className={`noc-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                            <div className="noc-step-number">3</div>
                            <div className="noc-step-label">Address</div>
                        </div>
                        <div className={`noc-step ${currentStep >= 4 ? 'active' : ''}`}>
                            <div className="noc-step-number">4</div>
                            <div className="noc-step-label">Credentials</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Details */}
                        {currentStep === 1 && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: 'var(--cgwa-primary)' }}>Personal Details</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className={`noc-form-control ${errors.fullName ? 'error' : ''}`}
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && <span className="noc-form-error">{errors.fullName}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Email ID</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={`noc-form-control ${errors.email ? 'error' : ''}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.email && <span className="noc-form-error">{errors.email}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Mobile Number</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            className={`noc-form-control ${errors.mobile ? 'error' : ''}`}
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            maxLength="10"
                                        />
                                        {errors.mobile && <span className="noc-form-error">{errors.mobile}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            name="aadhaar"
                                            className="noc-form-control"
                                            value={formData.aadhaar}
                                            onChange={handleChange}
                                            placeholder="12-digit Aadhaar number"
                                            maxLength="12"
                                        />
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">PAN Number</label>
                                        <input
                                            type="text"
                                            name="pan"
                                            className="noc-form-control"
                                            value={formData.pan}
                                            onChange={handleChange}
                                            placeholder="PAN number"
                                            maxLength="10"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Organization Details */}
                        {currentStep === 2 && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: 'var(--cgwa-primary)' }}>Organization Details</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Organization Type</label>
                                    <select
                                        name="organizationType"
                                        className={`noc-form-control ${errors.organizationType ? 'error' : ''}`}
                                        value={formData.organizationType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Organization Type</option>
                                        {organizationTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.organizationType && <span className="noc-form-error">{errors.organizationType}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Organization Name</label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        className={`noc-form-control ${errors.organizationName ? 'error' : ''}`}
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        placeholder="Enter organization name"
                                    />
                                    {errors.organizationName && <span className="noc-form-error">{errors.organizationName}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        className="noc-form-control"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Your designation"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Address Details */}
                        {currentStep === 3 && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: 'var(--cgwa-primary)' }}>Address Details</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Address</label>
                                    <textarea
                                        name="address"
                                        className={`noc-form-control ${errors.address ? 'error' : ''}`}
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter complete address"
                                        rows="3"
                                    />
                                    {errors.address && <span className="noc-form-error">{errors.address}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">State</label>
                                        <select
                                            name="state"
                                            className={`noc-form-control ${errors.state ? 'error' : ''}`}
                                            value={formData.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {errors.state && <span className="noc-form-error">{errors.state}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">District</label>
                                        <input
                                            type="text"
                                            name="district"
                                            className={`noc-form-control ${errors.district ? 'error' : ''}`}
                                            value={formData.district}
                                            onChange={handleChange}
                                            placeholder="Enter district"
                                        />
                                        {errors.district && <span className="noc-form-error">{errors.district}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className={`noc-form-control ${errors.pincode ? 'error' : ''}`}
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="6-digit pincode"
                                        maxLength="6"
                                        style={{ maxWidth: '200px' }}
                                    />
                                    {errors.pincode && <span className="noc-form-error">{errors.pincode}</span>}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Login Credentials */}
                        {currentStep === 4 && (
                            <div>
                                <h3 style={{ marginBottom: '20px', color: 'var(--cgwa-primary)' }}>Create Login Credentials</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className={`noc-form-control ${errors.username ? 'error' : ''}`}
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Choose a username (min 4 characters)"
                                    />
                                    {errors.username && <span className="noc-form-error">{errors.username}</span>}
                                    <span className="noc-form-help">This will be used to login to the portal</span>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className={`noc-form-control ${errors.password ? 'error' : ''}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password (min 8 characters)"
                                    />
                                    {errors.password && <span className="noc-form-error">{errors.password}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className={`noc-form-control ${errors.confirmPassword ? 'error' : ''}`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                    />
                                    {errors.confirmPassword && <span className="noc-form-error">{errors.confirmPassword}</span>}
                                </div>

                                <div className="noc-checkbox-item" style={{ marginTop: '20px' }}>
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        id="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="acceptTerms">
                                        I accept the <a href="#" className="noc-link">Terms and Conditions</a> and <a href="#" className="noc-link">Privacy Policy</a>
                                    </label>
                                </div>
                                {errors.acceptTerms && <span className="noc-form-error">{errors.acceptTerms}</span>}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="noc-form-navigation" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid var(--cgwa-border-light)' }}>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="noc-btn noc-btn-secondary"
                                >
                                    Previous
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="noc-btn noc-btn-primary"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="noc-btn noc-btn-success"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Register
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="noc-auth-links">
                        <p>
                            Already have an account?{' '}
                            <a href="/noc/login" className="noc-link">
                                Login here
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCRegister;
