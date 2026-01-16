import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCRegister = ({ isModal = false, onClose = null }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectUserType } = useAuth();

    // Auto-select service type from URL parameter
    useEffect(() => {
        const serviceParam = searchParams.get('service');
        if (serviceParam) {
            selectUserType(serviceParam);
        }
    }, [searchParams, selectUserType]);

    const [currentStep, setCurrentStep] = useState(1);
    const [captchaCode, setCaptchaCode] = useState('');
    const [otpSent, setOTPSent] = useState({ mobile: false, email: false });
    const [formData, setFormData] = useState({
        applicantInfo: {
            title: 'Mr',
            firstName: '',
            lastName: '',
            applicantName: '',
            dateOfBirth: '',
            gender: 'MALE',
            uid: '',
            idProofType: 'PAN',
            idProofNumber: '',
            mobileNumber: '',
            mobileOTP: '',
            emailId: '',
            emailOTP: '',
            idProofFile: null
        },
        communicationAddress: {
            addressLine1: '',
            addressLine2: '',
            state: '',
            district: '',
            subDistrict: '',
            pincode: ''
        },
        loginCredentials: {
            preferredUsername: '',
            password: '',
            confirmPassword: '',
            securityQuestion: '',
            securityAnswer: ''
        },
        declaration: false,
        userType: 'APPLICANT'
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [mobileVerified, setMobileVerified] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [sendingMobileOTP, setSendingMobileOTP] = useState(false);
    const [sendingEmailOTP, setSendingEmailOTP] = useState(false);
    const [verifyingMobileOTP, setVerifyingMobileOTP] = useState(false);
    const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);

    // Generate captcha on mount
    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(code);
    };
    const handleChange = (eOrSection, field = null, manualValue = null) => {
        // Handle manual call: handleChange(section, field, value)
        if (typeof eOrSection === 'string' && field !== null) {
            const section = eOrSection;
            const value = manualValue;

            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));

            const errorKey = `${section}.${field}`;
            if (errors[errorKey]) {
                setErrors(prev => ({ ...prev, [errorKey]: '' }));
            }
            return;
        }

        // Handle event call: handleChange(e)
        const e = eOrSection;
        const { name, value, type, checked, files } = e.target;
        const val = type === 'checkbox' ? checked : (type === 'file' ? files[0] : value);

        if (name.includes('.')) {
            const [section, key] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: val
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: val
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const sendOTP = async (type) => {
        const value = type === 'mobile' ? formData.applicantInfo.mobileNumber : formData.applicantInfo.emailId;

        if (type === 'mobile' && !/^[0-9]{10}$/.test(value)) {
            setErrors(prev => ({ ...prev, 'applicantInfo.mobileNumber': 'Enter valid 10-digit mobile number' }));
            return;
        }

        if (type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
            setErrors(prev => ({ ...prev, 'applicantInfo.emailId': 'Enter valid email address' }));
            return;
        }

        try {
            // Call the OTP API
            const endpoint = type === 'mobile'
                ? 'http://localhost:3000/api/auth/send-otp/mobile'
                : 'http://localhost:3000/api/auth/send-otp/email';

            const payload = type === 'mobile'
                ? { phone: value }
                : { email: value };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`OTP sent to ${type}:`, result);

                // Set the appropriate state to show OTP input field
                if (type === 'mobile') {
                    setSendingMobileOTP(true);
                } else {
                    setSendingEmailOTP(true);
                }

                setOTPSent(prev => ({ ...prev, [type]: true }));

                const expiresIn = result.data?.expiresIn || 300;
                alert(`OTP sent successfully to your ${type}. It will expire in ${expiresIn} seconds.`);
            } else {
                const errorData = await response.json();
                alert(`Failed to send OTP: ${errorData.message || 'Please try again'}`);
            }
        } catch (error) {
            console.error(`Error sending OTP to ${type}:`, error);
            alert(`Network error while sending OTP. Please check your connection and try again.`);
        }
    };

    const verifyOTP = async (type) => {
        const otp = type === 'mobile' ? formData.applicantInfo.mobileOTP : formData.applicantInfo.emailOTP;
        const identifier = type === 'mobile' ? formData.applicantInfo.mobileNumber : formData.applicantInfo.emailId;

        if (!otp) {
            setErrors(prev => ({ ...prev, [`applicantInfo.${type}OTP`]: 'Please enter OTP' }));
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: identifier,
                    otp: otp,
                    type: type.toUpperCase()
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`${type} OTP verified:`, result);

                if (type === 'mobile') setMobileVerified(true);
                if (type === 'email') setEmailVerified(true);

                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
            } else {
                const errorData = await response.json();
                setErrors(prev => ({ ...prev, [`applicantInfo.${type}OTP`]: errorData.message || 'Invalid OTP' }));
                alert(`OTP verification failed: ${errorData.message || 'Invalid OTP'}`);
            }
        } catch (error) {
            console.error(`Error verifying ${type} OTP:`, error);
            alert('Network error during OTP verification. Please try again.');
        }
    };

    const checkUsernameAvailability = async () => {
        if (!formData.loginCredentials.preferredUsername || formData.loginCredentials.preferredUsername.length < 4) {
            setErrors(prev => ({ ...prev, 'loginCredentials.preferredUsername': 'Username must be at least 4 characters' }));
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/auth/check-username/${formData.loginCredentials.preferredUsername}`);

            if (response.ok) {
                const data = await response.json();

                if (data.available) {
                    setFormData(prev => ({ ...prev, usernameAvailable: true }));
                    alert(data.message || 'Username is available!');
                } else {
                    setFormData(prev => ({ ...prev, usernameAvailable: false }));
                    setErrors(prev => ({ ...prev, 'loginCredentials.preferredUsername': data.message || 'Username is already taken' }));
                }
            } else {
                const errorData = await response.json();
                setErrors(prev => ({ ...prev, 'loginCredentials.preferredUsername': errorData.message || 'Error checking username' }));
            }
        } catch (error) {
            console.error('Error checking username availability:', error);
            setErrors(prev => ({ ...prev, 'loginCredentials.preferredUsername': 'Network error. Please try again.' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        const { applicantInfo } = formData;

        if (!applicantInfo.title) newErrors['applicantInfo.title'] = 'Title is required';
        if (!applicantInfo.firstName) newErrors['applicantInfo.firstName'] = 'First Name is required';
        if (!applicantInfo.lastName) newErrors['applicantInfo.lastName'] = 'Last Name is required';
        if (!applicantInfo.dateOfBirth) newErrors['applicantInfo.dateOfBirth'] = 'Date of birth is required';
        if (!applicantInfo.gender) newErrors['applicantInfo.gender'] = 'Gender is required';
        if (!applicantInfo.idProofType) newErrors['applicantInfo.idProofType'] = 'ID proof type is required';
        if (!applicantInfo.idProofNumber) {
            newErrors['applicantInfo.idProofNumber'] = 'ID proof number is required';
        } else if (applicantInfo.idProofType === 'PAN Card' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(applicantInfo.idProofNumber)) {
            newErrors['applicantInfo.idProofNumber'] = 'Invalid PAN format';
        }
        // if (!applicantInfo.idProofFile) newErrors['applicantInfo.idProofFile'] = 'ID proof document is required'; // Optional for now
        if (!applicantInfo.mobileNumber) {
            newErrors['applicantInfo.mobileNumber'] = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(applicantInfo.mobileNumber)) {
            newErrors['applicantInfo.mobileNumber'] = 'Mobile number must be 10 digits';
        }
        if (!mobileVerified) newErrors['applicantInfo.mobileNumber'] = 'Please verify mobile number with OTP';
        if (!applicantInfo.emailId) {
            newErrors['applicantInfo.emailId'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(applicantInfo.emailId)) {
            newErrors['applicantInfo.emailId'] = 'Email is invalid';
        }
        if (!emailVerified) newErrors['applicantInfo.emailId'] = 'Please verify email with OTP';

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
            default:
                isValid = true;
        }

        if (isValid) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            // Show all validation errors to the user
            const errorMessages = Object.values(errors).filter(msg => msg);
            if (errorMessages.length > 0) {
                alert(`Please fix the following errors:\n\n${errorMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}`);
            }
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const validateStep2 = () => {
        const newErrors = {};
        const { communicationAddress } = formData;

        if (!communicationAddress.addressLine1) newErrors['communicationAddress.addressLine1'] = 'Address Line 1 is required';
        if (!communicationAddress.state) newErrors['communicationAddress.state'] = 'State is required';
        if (!communicationAddress.district) newErrors['communicationAddress.district'] = 'District is required';
        if (!communicationAddress.subDistrict) newErrors['communicationAddress.subDistrict'] = 'Sub-District is required';
        if (!communicationAddress.pincode) {
            newErrors['communicationAddress.pincode'] = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(communicationAddress.pincode)) {
            newErrors['communicationAddress.pincode'] = 'Invalid Pincode';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        const { loginCredentials } = formData;

        if (!loginCredentials.preferredUsername) newErrors['loginCredentials.preferredUsername'] = 'Username is required';
        if (!formData.usernameAvailable) newErrors['loginCredentials.preferredUsername'] = 'Please check username availability';

        if (!loginCredentials.password) {
            newErrors['loginCredentials.password'] = 'Password is required';
        } else if (loginCredentials.password.length < 8) {
            newErrors['loginCredentials.password'] = 'Password must be at least 8 characters';
        }

        if (loginCredentials.password !== loginCredentials.confirmPassword) {
            newErrors['loginCredentials.confirmPassword'] = 'Passwords do not match';
        }

        if (!loginCredentials.securityQuestion) newErrors['loginCredentials.securityQuestion'] = 'Security question is required';
        if (!loginCredentials.securityAnswer) newErrors['loginCredentials.securityAnswer'] = 'Security answer is required';

        if (loginCredentials.captchaInput !== captchaCode) {
            newErrors['loginCredentials.captchaInput'] = 'Invalid Captcha';
        }

        if (!formData.declaration) newErrors.declaration = 'You must agree to the declaration';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateStep3()) {
            try {
                // Construct registration payload matching new API structure
                const registrationData = {
                    applicantInfo: {
                        title: formData.applicantInfo.title,
                        firstName: formData.applicantInfo.firstName,
                        lastName: formData.applicantInfo.lastName,
                        dob: formData.applicantInfo.dateOfBirth,
                        gender: formData.applicantInfo.gender,
                        idProofType: formData.applicantInfo.idProofType,
                        idProofNumber: formData.applicantInfo.idProofNumber,
                        uidNumber: formData.applicantInfo.idProofNumber, // Using same as idProofNumber
                        mobileNumber: formData.applicantInfo.mobileNumber,
                        emailId: formData.applicantInfo.emailId
                    },
                    communicationAddress: {
                        addressLine1: formData.communicationAddress.addressLine1,
                        addressLine2: formData.communicationAddress.addressLine2 || '',
                        state: formData.communicationAddress.state,
                        district: formData.communicationAddress.district,
                        pincode: formData.communicationAddress.pincode
                    },
                    loginCredentials: {
                        username: formData.loginCredentials.preferredUsername,
                        password: formData.loginCredentials.password,
                        securityQuestion: formData.loginCredentials.securityQuestion,
                        securityAnswer: formData.loginCredentials.securityAnswer
                    },
                    declaration: formData.declaration
                };

                // Call registration API with JSON
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Registration success:', result);

                    // Show success message with username
                    const successMessage = `🎉 Registration Successful!\n\nYour account has been created successfully.\n\nUsername: ${formData.loginCredentials.preferredUsername}\n\nPlease login with your credentials.`;
                    alert(successMessage);

                    // Close modal and return to login panel, or navigate to login page
                    if (isModal && onClose) {
                        onClose();
                    } else {
                        navigate('/noc/login');
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Registration failed:', errorData);
                    alert(`Registration failed: ${errorData.message || 'Please check your details and try again'}`);
                }

            } catch (error) {
                console.error('Network error during registration:', error);
                alert('Network error. Please check if the server is running and try again.');
            }
        }
    };

    // Master Data State
    const [titleOptions, setTitleOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [blockOptions, setBlockOptions] = useState([]);
    const [genderOptions, setGenderOptions] = useState([]);

    // Fetch Master Data
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                // Fetch Titles
                const titleRes = await fetch('http://localhost:3000/api/master/titles');
                if (titleRes.ok) {
                    const data = await titleRes.json();
                    if (Array.isArray(data)) {
                        setTitleOptions(data);
                    } else if (data && Array.isArray(data.data)) {
                        setTitleOptions(data.data);
                    } else {
                        console.warn('Titles API returned non-array:', data);
                        setTitleOptions(['Mr', 'Ms', 'Dr', 'M/s']);
                    }
                }

                // Fetch Genders
                const genderRes = await fetch('http://localhost:3000/api/master/genders');
                if (genderRes.ok) {
                    const data = await genderRes.json();
                    if (Array.isArray(data)) {
                        setGenderOptions(data);
                    } else if (data && Array.isArray(data.data)) {
                        setGenderOptions(data.data);
                    } else {
                        console.warn('Genders API returned non-array:', data);
                        setGenderOptions(['Male', 'Female', 'Other']);
                    }
                }
            } catch (error) {
                console.error("Error fetching master data:", error);
                // Fallback defaults
                setTitleOptions(['Mr', 'Ms', 'Dr', 'M/s']);
                setGenderOptions(['Male', 'Female', 'Other']);
            }
        };

        fetchMasterData();
    }, []);

    // Fetch States on mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/master/states');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setStateOptions(data);
                    } else if (data && Array.isArray(data.data)) {
                        setStateOptions(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };
        fetchStates();
    }, []);

    // Fetch Districts when state changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!formData.communicationAddress.state) {
                setDistrictOptions([]);
                setBlockOptions([]);
                return;
            }

            // Reset district and block when state changes
            setFormData(prev => ({
                ...prev,
                communicationAddress: {
                    ...prev.communicationAddress,
                    district: '',
                    subDistrict: ''
                }
            }));
            setBlockOptions([]);

            try {
                const response = await fetch(`http://localhost:3000/api/master/districts?stateId=${formData.communicationAddress.state}`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setDistrictOptions(data);
                    } else if (data && Array.isArray(data.data)) {
                        setDistrictOptions(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        };
        fetchDistricts();
    }, [formData.communicationAddress.state]);

    // Fetch Blocks when district changes
    useEffect(() => {
        const fetchBlocks = async () => {
            if (!formData.communicationAddress.district) {
                setBlockOptions([]);
                return;
            }

            // Reset subDistrict when district changes
            setFormData(prev => ({
                ...prev,
                communicationAddress: {
                    ...prev.communicationAddress,
                    subDistrict: ''
                }
            }));

            try {
                const response = await fetch(`http://localhost:3000/api/master/blocks?districtId=${formData.communicationAddress.district}`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setBlockOptions(data);
                    } else if (data && Array.isArray(data.data)) {
                        setBlockOptions(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching blocks:', error);
            }
        };
        fetchBlocks();
    }, [formData.communicationAddress.district]);
    const idProofTypes = ['PAN Card', 'Aadhaar Card', 'Passport', 'Driving License', 'Voter ID'];
    const states = ['Rajasthan', 'Delhi', 'Maharashtra', 'Gujarat', 'Punjab'];
    const districts = {
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
        'Delhi': ['Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
        'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda']
    };
    const subDistricts = {
        'Jaipur': ['Jaipur City', 'Amber', 'Sanganer', 'Bassi', 'Chaksu'],
        'Jodhpur': ['Jodhpur City', 'Bilara', 'Phalodi', 'Osian', 'Luni']
        // Add more as needed
    };
    const securityQuestions = [
        'What is your Birth City?',
        'What is your Pet Name?',
        'What was your first Car?',
        "What is your Mother's Maiden Name?",
        'What was the name of your first school?'
    ];

    return (
        <div className="noc-portal">
            {!isModal && <NOCHeader />}

            <div className="noc-auth-page" style={{ background: isModal ? 'white' : '#f8fafc', minHeight: isModal ? 'auto' : 'calc(100vh - 120px)' }}>
                <div className="noc-auth-card" style={{ maxWidth: '900px', margin: '30px auto' }}>
                    <div className="noc-auth-header" style={{ background: '#1e3a8a', color: 'white', padding: '32px 24px', borderRadius: '5px 5px 0 0', textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'white' }}>User Registration</h2>
                        <div style={{ width: '60px', height: '3px', background: 'rgba(255, 255, 255, 0.8)', margin: '0 auto 16px' }}></div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: 500, color: 'white' }}>Ground Water Department</p>
                        <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255, 255, 255, 0.95)' }}>Government of Rajasthan</p>
                        <p style={{ margin: '20px 0 0 0', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                            Please fill in the details below to create your new user account for the NOC portal
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="noc-progress-steps" style={{ padding: '30px 24px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            {[1, 2, 3].map((step) => (
                                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: currentStep >= step ? '#1e3a8a' : '#e5e7eb',
                                        color: currentStep >= step ? 'white' : '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.25rem',
                                        marginBottom: '10px',
                                        boxShadow: currentStep === step ? '0 2px 4px rgba(30, 58, 138, 0.3)' : 'none',
                                        border: currentStep >= step ? 'none' : '2px solid #dfe use'
                                    }}>
                                        {step}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: currentStep >= step ? '#1e3a8a' : '#64748b', textAlign: 'center' }}>
                                        {step === 1 ? 'Applicant Info' : step === 2 ? 'Address' : 'Credentials'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '30px 24px' }}>
                        {/* Step 1: Applicant Information */}
                        {/* Step 1: Applicant Information */}
                        {currentStep === 1 && (
                            <div>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '5px', marginBottom: '24px', borderLeft: '3px solid #1e3a8a', border: '1px solid #e5e7eb' }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#1e3a8a', fontSize: '1.125rem', fontWeight: 600 }}>👤 Applicant Information</h3>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                        Please provide your personal details for registration
                                    </p>
                                </div>

                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label>Title <span className="required">*</span></label>
                                        <select
                                            name="applicantInfo.title"
                                            className="form-control"
                                            value={formData.applicantInfo.title}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            {titleOptions.map((opt, index) => (
                                                <option key={index} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>First Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="applicantInfo.firstName"
                                            className="form-control"
                                            value={formData.applicantInfo.firstName || formData.applicantInfo.applicantName}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                        />
                                        {errors['applicantInfo.firstName'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['applicantInfo.firstName']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Last Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="applicantInfo.lastName"
                                            className="form-control"
                                            value={formData.applicantInfo.lastName}
                                            onChange={handleChange}
                                            placeholder="Last Name"
                                        />
                                        {errors['applicantInfo.lastName'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['applicantInfo.lastName']}</span>}
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Date of Birth <span className="required">*</span></label>
                                        <input
                                            type="date"
                                            name="applicantInfo.dateOfBirth"
                                            className="form-control"
                                            value={formData.applicantInfo.dateOfBirth}
                                            onChange={handleChange}
                                        />
                                        {errors['applicantInfo.dateOfBirth'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['applicantInfo.dateOfBirth']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Gender <span className="required">*</span></label>
                                        <select
                                            name="applicantInfo.gender"
                                            className="form-control"
                                            value={formData.applicantInfo.gender}
                                            onChange={handleChange}
                                        >
                                            {genderOptions.map((opt, index) => {
                                                const label = typeof opt === 'string' ? opt : (opt.name || opt.gender || JSON.stringify(opt));
                                                const value = typeof opt === 'string' ? opt : (opt.id || opt.code || opt.name || opt.gender);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Mobile Number <span className="required">*</span></label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                name="applicantInfo.mobileNumber"
                                                className="form-control"
                                                value={formData.applicantInfo.mobileNumber}
                                                onChange={handleChange}
                                                placeholder="10-digit Mobile Number"
                                                maxLength="10"
                                                readOnly={mobileVerified}
                                            />
                                            {!mobileVerified && (
                                                <button type="button" onClick={() => sendOTP('mobile')} className="btn-primary" style={{ padding: '0 15px', whiteSpace: 'nowrap' }}>
                                                    {sendingMobileOTP ? 'Sending...' : 'Send OTP'}
                                                </button>
                                            )}
                                            {mobileVerified && <span style={{ color: 'green', display: 'flex', alignItems: 'center' }}>✓ Verified</span>}
                                        </div>
                                        {errors['applicantInfo.mobileNumber'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', display: 'block', marginTop: '5px' }}>{errors['applicantInfo.mobileNumber']}</span>}
                                        {!mobileVerified && sendingMobileOTP && (
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                <input type="text" name="applicantInfo.mobileOTP" value={formData.applicantInfo.mobileOTP} onChange={handleChange} placeholder="Enter OTP" className="form-control" />
                                                <button type="button" onClick={() => verifyOTP('mobile')} className="btn-primary">Verify</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Email ID <span className="required">*</span></label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="email"
                                                name="applicantInfo.emailId"
                                                className="form-control"
                                                value={formData.applicantInfo.emailId}
                                                onChange={handleChange}
                                                placeholder="Email Address"
                                                readOnly={emailVerified}
                                            />
                                            {!emailVerified && (
                                                <button type="button" onClick={() => sendOTP('email')} className="btn-primary" style={{ padding: '0 15px', whiteSpace: 'nowrap' }}>
                                                    {sendingEmailOTP ? 'Sending...' : 'Send OTP'}
                                                </button>
                                            )}
                                            {emailVerified && <span style={{ color: 'green', display: 'flex', alignItems: 'center' }}>✓ Verified</span>}
                                        </div>
                                        {errors['applicantInfo.emailId'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', display: 'block', marginTop: '5px' }}>{errors['applicantInfo.emailId']}</span>}
                                        {!emailVerified && sendingEmailOTP && (
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                <input type="text" name="applicantInfo.emailOTP" value={formData.applicantInfo.emailOTP} onChange={handleChange} placeholder="Enter OTP" className="form-control" />
                                                <button type="button" onClick={() => verifyOTP('email')} className="btn-primary">Verify</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>ID Proof (Aadhaar/PAN/Voter ID) <span className="required">*</span></label>
                                    <div className="form-grid-2">
                                        <select name="applicantInfo.idProofType" value={formData.applicantInfo.idProofType} onChange={handleChange} className="form-control">
                                            <option value="Aadhaar">Aadhaar Card</option>
                                            <option value="PAN">PAN Card</option>
                                            <option value="VoterID">Voter ID</option>
                                        </select>
                                        <input type="text" name="applicantInfo.idProofNumber" value={formData.applicantInfo.idProofNumber} onChange={handleChange} placeholder="ID Number" className="form-control" />
                                    </div>
                                    <input type="file" name="applicantInfo.idProofFile" onChange={handleChange} className="form-control" style={{ marginTop: '10px' }} />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Communication Address */}
                        {currentStep === 2 && (
                            <div className="form-step-content">
                                <h3 className="step-title">Communication Address</h3>
                                <div className="form-group">
                                    <label>Address Line 1 <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="communicationAddress.addressLine1"
                                        className={`form-control ${errors['communicationAddress.addressLine1'] ? 'is-invalid' : ''}`}
                                        value={formData.communicationAddress.addressLine1}
                                        onChange={handleChange}
                                        placeholder="House No., Building Name"
                                    />
                                    {errors['communicationAddress.addressLine1'] && <span className="error-message">{errors['communicationAddress.addressLine1']}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        name="communicationAddress.addressLine2"
                                        className="form-control"
                                        value={formData.communicationAddress.addressLine2}
                                        onChange={handleChange}
                                        placeholder="Street, Area"
                                    />
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>State <span className="required">*</span></label>
                                        <select
                                            name="communicationAddress.state"
                                            className={`form-control ${errors['communicationAddress.state'] ? 'is-invalid' : ''}`}
                                            value={formData.communicationAddress.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select State</option>
                                            {stateOptions.map((state, index) => {
                                                const value = typeof state === 'string' ? state : (state.stateId || state.id || state.code || state.name);
                                                const label = typeof state === 'string' ? state : (state.stateName || state.name || state.label || state.id);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors['communicationAddress.state'] && <span className="error-message">{errors['communicationAddress.state']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>District <span className="required">*</span></label>
                                        <select
                                            name="communicationAddress.district"
                                            className={`form-control ${errors['communicationAddress.district'] ? 'is-invalid' : ''}`}
                                            value={formData.communicationAddress.district}
                                            onChange={handleChange}
                                            disabled={!formData.communicationAddress.state}
                                        >
                                            <option value="">Select District</option>
                                            {districtOptions.map((district, index) => {
                                                const value = typeof district === 'string' ? district : (district.districtId || district.id || district.code || district.name);
                                                const label = typeof district === 'string' ? district : (district.districtName || district.name || district.label || district.id);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors['communicationAddress.district'] && <span className="error-message">{errors['communicationAddress.district']}</span>}
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Sub-District/Tehsil <span className="required">*</span></label>
                                        <select
                                            name="communicationAddress.subDistrict"
                                            className={`form-control ${errors['communicationAddress.subDistrict'] ? 'is-invalid' : ''}`}
                                            value={formData.communicationAddress.subDistrict}
                                            onChange={handleChange}
                                            disabled={!formData.communicationAddress.district}
                                        >
                                            <option value="">Select Sub-District/Block</option>
                                            {blockOptions.map((block, index) => {
                                                const value = typeof block === 'string' ? block : (block.blockId || block.id || block.code || block.name);
                                                const label = typeof block === 'string' ? block : (block.blockName || block.name || block.label || block.id);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                    </div>

                                    <div className="noc-form-group" style={{ maxWidth: '300px' }}>
                                        <label className="noc-form-label required">Pincode</label>
                                        <input
                                            type="text"
                                            name="communicationAddress.pincode"
                                            className={`noc-form-control ${errors['communicationAddress.pincode'] ? 'error' : ''}`}
                                            value={formData.communicationAddress.pincode}
                                            onChange={handleChange}
                                            placeholder="6-digit PIN code"
                                            maxLength="6"
                                        />
                                        {errors['communicationAddress.pincode'] && <span className="noc-form-error">{errors['communicationAddress.pincode']}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Login Credentials */}
                        {currentStep === 3 && (
                            <div>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '5px', marginBottom: '24px', borderLeft: '3px solid #1e3a8a', border: '1px solid #e5e7eb' }}>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#1e3a8a', fontSize: '1.125rem', fontWeight: 600 }}>🔐 Login Credentials</h3>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                        Create your username and password for portal access
                                    </p>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Preferred User Name</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            name="loginCredentials.preferredUsername"
                                            className={`noc-form-control ${errors['loginCredentials.preferredUsername'] ? 'error' : ''}`}
                                            value={formData.loginCredentials.preferredUsername}
                                            onChange={handleChange}
                                            placeholder="Choose a username (min 4 characters)"
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={checkUsernameAvailability || (() => { })}
                                            style={{
                                                padding: '10px 20px',
                                                background: formData.usernameAvailable === true ? '#059669' : '#1e3a8a',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 600
                                            }}
                                        >
                                            {formData.usernameAvailable === true ? '✓ Available' : 'Check Availability'}
                                        </button>
                                    </div>
                                    {errors['loginCredentials.preferredUsername'] && <span className="noc-form-error">{errors['loginCredentials.preferredUsername']}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Password</label>
                                        <input
                                            type="password"
                                            name="loginCredentials.password"
                                            className={`noc-form-control ${errors['loginCredentials.password'] ? 'error' : ''}`}
                                            value={formData.loginCredentials.password}
                                            onChange={handleChange}
                                            placeholder="Create a strong password"
                                        />
                                        {errors['loginCredentials.password'] && <span className="noc-form-error">{errors['loginCredentials.password']}</span>}
                                        <span className="noc-form-help">Min 8 chars with uppercase, lowercase, number & special char</span>
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="loginCredentials.confirmPassword"
                                            className={`noc-form-control ${errors['loginCredentials.confirmPassword'] ? 'error' : ''}`}
                                            value={formData.loginCredentials.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Re-enter your password"
                                        />
                                        {errors['loginCredentials.confirmPassword'] && <span className="noc-form-error">{errors['loginCredentials.confirmPassword']}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Security Question</label>
                                    <select
                                        name="loginCredentials.securityQuestion"
                                        className={`noc-form-control ${errors['loginCredentials.securityQuestion'] ? 'error' : ''}`}
                                        value={formData.loginCredentials.securityQuestion}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a security question</option>
                                        <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                        <option value="What is your favorite pet?">What is your favorite pet?</option>
                                        <option value="What city were you born in?">What city were you born in?</option>
                                    </select>
                                    {errors['loginCredentials.securityQuestion'] && <span className="noc-form-error">{errors['loginCredentials.securityQuestion']}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Security Answer</label>
                                    <input
                                        type="text"
                                        name="loginCredentials.securityAnswer"
                                        className={`noc-form-control ${errors['loginCredentials.securityAnswer'] ? 'error' : ''}`}
                                        value={formData.loginCredentials.securityAnswer}
                                        onChange={handleChange}
                                        placeholder="Enter your answer"
                                    />
                                    {errors['loginCredentials.securityAnswer'] && <span className="noc-form-error">{errors['loginCredentials.securityAnswer']}</span>}
                                </div>

                                <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '6px', marginTop: '24px' }}>
                                    <label className="noc-form-label required" style={{ marginBottom: '12px', display: 'block' }}>Security Check</label>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ background: '#f3f4f6', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '8px', fontFamily: 'monospace', userSelect: 'none', border: '2px solid #d1d5db' }}>
                                            {captchaCode}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={generateCaptcha}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#f59e0b',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            REFRESH
                                        </button>
                                        <input
                                            type="text"
                                            name="loginCredentials.captchaInput"
                                            className={`noc-form-control ${errors['loginCredentials.captchaInput'] ? 'error' : ''}`}
                                            value={formData.loginCredentials.captchaInput}
                                            onChange={handleChange}
                                            placeholder="Enter captcha"
                                            style={{ flex: 1, maxWidth: '200px', textTransform: 'uppercase' }}
                                        />
                                    </div>
                                    {errors['loginCredentials.captchaInput'] && <span className="noc-form-error">{errors['loginCredentials.captchaInput']}</span>}
                                </div>

                                <div style={{ marginTop: '24px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <input
                                            type="checkbox"
                                            name="declaration"
                                            id="declaration"
                                            checked={formData.declaration}
                                            onChange={handleChange}
                                            style={{ marginTop: '4px' }}
                                        />
                                        <label htmlFor="declaration" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                            I declare that all the information provided above is true and correct to the best of my knowledge.
                                            I understand that adherence to ground water abstraction guidelines and regulations is mandatory.
                                        </label>
                                    </div>
                                    {errors.declaration && <span className="noc-form-error">{errors.declaration}</span>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    style={{
                                        padding: '12px 30px',
                                        background: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem'
                                    }}
                                >
                                    ← Previous
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    style={{
                                        padding: '12px 30px',
                                        background: '#1e3a8a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        marginLeft: 'auto'
                                    }}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 40px',
                                        background: '#059669',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        marginLeft: 'auto'
                                    }}
                                >
                                    SUBMIT REGISTRATION
                                </button>
                            )}

                            {currentStep === 1 && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    style={{
                                        padding: '12px 30px',
                                        background: 'white',
                                        color: '#dc2626',
                                        border: '1px solid #dc2626',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        marginLeft: 'auto'
                                    }}
                                >
                                    CANCEL
                                </button>
                            )}
                        </div>
                    </form>

                    <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #e2e8f0', marginTop: '20px' }}>
                        <p style={{ margin: 0, color: '#64748b' }}>
                            Already have an account?{' '}
                            <Link to="/noc/login" style={{ color: '#1e3a8a', textDecoration: 'none', fontWeight: '600' }}>
                                Login here
                            </Link>
                        </p>
                    </div>
                </div >
            </div >

            {!isModal && <NOCFooter />}
        </div >
    );
};

export default NOCRegister;
