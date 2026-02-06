import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/apiConfig';
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

    // File Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset status
        setUploadError('');
        setUploadSuccess(false);
        setIsUploading(true);

        // Validation (Max 5MB, PDF/Image)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File size exceeds 5MB limit');
            setIsUploading(false);
            return;
        }

        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Invalid file type. Please upload PDF, JPG, or PNG.');
            setIsUploading(false);
            return;
        }

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            // Map document type
            let docType = 'OTHER';
            const selectedType = formData.applicantInfo.idProofType;
            if (selectedType === 'Aadhaar') docType = 'AADHAR';
            else if (selectedType === 'PAN') docType = 'PAN';
            else if (selectedType === 'VoterID') docType = 'VOTER_ID';

            formDataUpload.append('documentType', docType);

            const response = await fetch(`${API_BASE_URL}/documents/upload/single`, {
                method: 'POST',
                // Note: Do NOT set Content-Type header for FormData, browser does it automatically with boundary
                body: formDataUpload
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Document upload success:', result);

                if (result.success && result.data && result.data.documentId) {
                    setUploadSuccess(true);
                    // Update main form data with document ID
                    setFormData(prev => ({
                        ...prev,
                        applicantInfo: {
                            ...prev.applicantInfo,
                            idProofDocumentId: result.data.documentId,
                            idProofFile: file // Keep file ref if needed for UI, but rely on ID for submit
                        }
                    }));
                } else {
                    setUploadError('Upload failed: Invalid server response');
                }
            } else {
                const errorData = await response.json();
                setUploadError(errorData.message || 'Document upload failed');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            setUploadError('Network error during upload');
        } finally {
            setIsUploading(false);
        }
    };

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
                ? API_BASE_URL + '/auth/send-otp/mobile'
                : API_BASE_URL + '/auth/send-otp/email';

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
                // Show specific error from API
                alert(errorData.message || `Failed to send OTP to ${type}. Please try again.`);
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
            const response = await fetch(API_BASE_URL + '/auth/verify-otp', {
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
                const errorMessage = errorData.message || 'Invalid OTP';
                setErrors(prev => ({ ...prev, [`applicantInfo.${type}OTP`]: errorMessage }));
                alert(errorMessage);
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
            const response = await fetch(`${API_BASE_URL}/auth/check-username/${formData.loginCredentials.preferredUsername}`);

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
                        emailId: formData.applicantInfo.emailId,
                        idProofDocumentId: formData.applicantInfo.idProofDocumentId // Include uploaded document ID
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
                const response = await fetch(API_BASE_URL + '/auth/register', {
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
                    const successMessage = `≡ƒÄë Registration Successful!\n\nYour account has been created successfully.\n\nUsername: ${formData.loginCredentials.preferredUsername}\n\nPlease login with your credentials.`;
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

                    // Check for specific "already registered" messages to highlight them
                    const msg = errorData.message || 'Registration failed. Please checking your details.';

                    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('duplicate')) {
                        alert(`ΓÜá∩╕Å Registration Error:\n\n${msg}`);
                    } else {
                        alert(msg);
                    }
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
                const titleRes = await fetch(API_BASE_URL + '/master/titles');
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
                const genderRes = await fetch(API_BASE_URL + '/master/genders');
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
                const response = await fetch(API_BASE_URL + '/master/states');
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
                const response = await fetch(`${API_BASE_URL}/master/districts?stateId=${formData.communicationAddress.state}`);
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
                const response = await fetch(`${API_BASE_URL}/master/blocks?districtId=${formData.communicationAddress.district}`);
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

            <div className={`noc-auth-page ${isModal ? 'modal-view' : ''}`} style={{ background: isModal ? 'transparent' : '#f8fafc', minHeight: isModal ? 'auto' : 'calc(100vh - 120px)' }}>
                <div className={`noc-auth-card ${isModal ? 'no-shadow' : ''}`} style={{ maxWidth: '900px', margin: isModal ? '0' : '30px auto', background: isModal ? 'transparent' : 'white' }}>

                    {/* New Premium Header */}
                    <div className="reg-modal-header">
                        {isModal && <button onClick={onClose} className="modal-close-icon">Γ£ò</button>}
                        <h2 className="reg-modal-title">User Registration</h2>
                        <div className="reg-dept-name">Ground Water Department</div>
                        <div className="reg-govt-name">Government of Rajasthan</div>
                        <p className="reg-instruction">
                            Please fill in the details below to create your new user account for the NOC portal
                        </p>
                    </div>

                    {/* Premium Stepper */}
                    <div className="reg-stepper">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={`reg-step ${currentStep >= step ? 'active' : ''}`}>
                                <div className="reg-step-circle">
                                    {step}
                                </div>
                                <div className="reg-step-label">
                                    {step === 1 ? 'Applicant Info' : step === 2 ? 'Address' : 'Credentials'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="reg-form-body">
                        {/* Step 1: Applicant Information */}
                        {currentStep === 1 && (
                            <div>
                                <div className="reg-section-header">
                                    <span className="reg-section-icon">≡ƒæñ</span>
                                    <div>
                                        <h3 className="reg-section-title">Applicant Information</h3>
                                        <span className="reg-section-desc">Please provide your personal details for registration</span>
                                    </div>
                                </div>

                                <div className="reg-row">
                                    <div>
                                        <label className="reg-label">Title <span className="required">*</span></label>
                                        <select
                                            name="applicantInfo.title"
                                            className="reg-input"
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
                                        <label className="reg-label">First Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="applicantInfo.firstName"
                                            className="reg-input"
                                            value={formData.applicantInfo.firstName || formData.applicantInfo.applicantName}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                        />
                                        {errors['applicantInfo.firstName'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['applicantInfo.firstName']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">Last Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="applicantInfo.lastName"
                                            className="reg-input"
                                            value={formData.applicantInfo.lastName}
                                            onChange={handleChange}
                                            placeholder="Last Name"
                                        />
                                        {errors['applicantInfo.lastName'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['applicantInfo.lastName']}</span>}
                                    </div>
                                </div>

                                <div className="reg-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-group">
                                        <label className="reg-label">Date of Birth <span className="required">*</span></label>
                                        <input
                                            type="date"
                                            name="applicantInfo.dateOfBirth"
                                            className="reg-input"
                                            value={formData.applicantInfo.dateOfBirth}
                                            onChange={handleChange}
                                        />
                                        {errors['applicantInfo.dateOfBirth'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['applicantInfo.dateOfBirth']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">Gender <span className="required">*</span></label>
                                        <select
                                            name="applicantInfo.gender"
                                            className="reg-input"
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

                                <div className="reg-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-group">
                                        <label className="reg-label">Mobile Number <span className="required">*</span></label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                name="applicantInfo.mobileNumber"
                                                className="reg-input"
                                                style={{ flex: 1 }}
                                                value={formData.applicantInfo.mobileNumber}
                                                onChange={handleChange}
                                                placeholder="10-digit Mobile Number"
                                                maxLength="10"
                                                readOnly={mobileVerified}
                                            />
                                            {!mobileVerified && (
                                                <button type="button" onClick={() => sendOTP('mobile')} className="btn-primary" style={{ padding: '0 15px', whiteSpace: 'nowrap', height: '45px', flexShrink: 0 }}>
                                                    {sendingMobileOTP ? 'Sending...' : 'Send OTP'}
                                                </button>
                                            )}
                                            {mobileVerified && <span style={{ color: 'green', display: 'flex', alignItems: 'center' }}>Γ£ô Verified</span>}
                                        </div>
                                        {errors['applicantInfo.mobileNumber'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', display: 'block', marginTop: '5px' }}>{errors['applicantInfo.mobileNumber']}</span>}
                                        {!mobileVerified && sendingMobileOTP && (
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    name="applicantInfo.mobileOTP"
                                                    value={formData.applicantInfo.mobileOTP}
                                                    onChange={handleChange}
                                                    placeholder="Enter OTP"
                                                    className="reg-input"
                                                    style={{ flex: 1 }}
                                                />
                                                <button type="button" onClick={() => verifyOTP('mobile')} className="btn-primary" style={{ padding: '0 15px', whiteSpace: 'nowrap', height: '45px', flexShrink: 0 }}>Verify</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">Email ID <span className="required">*</span></label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="email"
                                                name="applicantInfo.emailId"
                                                className="reg-input"
                                                style={{ flex: 1 }}
                                                value={formData.applicantInfo.emailId}
                                                onChange={handleChange}
                                                placeholder="Email Address"
                                                readOnly={emailVerified}
                                            />
                                            {!emailVerified && (
                                                <button type="button" onClick={() => sendOTP('email')} className="btn-primary" style={{ padding: '0 15px', whiteSpace: 'nowrap', height: '45px', flexShrink: 0 }}>
                                                    {sendingEmailOTP ? 'Sending...' : 'Send OTP'}
                                                </button>
                                            )}
                                            {emailVerified && <span style={{ color: 'green', display: 'flex', alignItems: 'center' }}>Γ£ô Verified</span>}
                                        </div>
                                        {errors['applicantInfo.emailId'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', display: 'block', marginTop: '5px' }}>{errors['applicantInfo.emailId']}</span>}
                                        {!emailVerified && sendingEmailOTP && (
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    name="applicantInfo.emailOTP"
                                                    value={formData.applicantInfo.emailOTP}
                                                    onChange={handleChange}
                                                    placeholder="Enter OTP"
                                                    className="reg-input"
                                                    style={{ flex: 1 }}
                                                />
                                                <button type="button" onClick={() => verifyOTP('email')} className="btn-primary" style={{ padding: '0 15px', whiteSpace: 'nowrap', height: '45px', flexShrink: 0 }}>Verify</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="reg-label">ID Proof (Aadhaar/PAN/Voter ID) <span className="required">*</span></label>
                                    <div className="reg-row" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '10px' }}>
                                        <select name="applicantInfo.idProofType" value={formData.applicantInfo.idProofType} onChange={handleChange} className="reg-input">
                                            <option value="Aadhaar">Aadhaar Card</option>
                                            <option value="PAN">PAN Card</option>
                                            <option value="VoterID">Voter ID</option>
                                        </select>
                                        <input type="text" name="applicantInfo.idProofNumber" value={formData.applicantInfo.idProofNumber} onChange={handleChange} placeholder="ID Number" className="reg-input" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="file"
                                                name="applicantInfo.idProofFile"
                                                onChange={handleFileUpload}
                                                className="reg-input"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={isUploading}
                                            />
                                            {isUploading && <span style={{ color: '#3b82f6', fontSize: '0.9rem' }}>Uploading...</span>}
                                            {uploadSuccess && <span style={{ color: 'green', fontSize: '1.2rem' }}>Γ£ô</span>}
                                        </div>
                                        {uploadError && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{uploadError}</span>}
                                        {formData.applicantInfo.idProofDocumentId && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Document ID: {formData.applicantInfo.idProofDocumentId}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Communication Address */}
                        {currentStep === 2 && (
                            <div>
                                <div className="reg-section-header">
                                    <span className="reg-section-icon">≡ƒôì</span>
                                    <div>
                                        <h3 className="reg-section-title">Communication Address</h3>
                                        <span className="reg-section-desc">Please provide your current address details</span>
                                    </div>
                                </div>

                                <div className="reg-row">
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <label className="reg-label">Address Line 1 <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="communicationAddress.addressLine1"
                                            className="reg-input"
                                            value={formData.communicationAddress.addressLine1}
                                            onChange={handleChange}
                                            placeholder="House No, Building, Street"
                                        />
                                        {errors['communicationAddress.addressLine1'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['communicationAddress.addressLine1']}</span>}
                                    </div>
                                </div>

                                <div className="reg-row">
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <label className="reg-label">Address Line 2</label>
                                        <input
                                            type="text"
                                            name="communicationAddress.addressLine2"
                                            className="reg-input"
                                            value={formData.communicationAddress.addressLine2}
                                            onChange={handleChange}
                                            placeholder="Area, Locality (Optional)"
                                        />
                                    </div>
                                </div>

                                <div className="reg-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                    <div className="form-group">
                                        <label className="reg-label">State <span className="required">*</span></label>
                                        <select
                                            name="communicationAddress.state"
                                            className="reg-input"
                                            value={formData.communicationAddress.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select State</option>
                                            {stateOptions.map((state, index) => {
                                                const label = typeof state === 'string' ? state : (state.stateName || state.name || state.label || state.id);
                                                const value = typeof state === 'string' ? state : (state.stateId || state.id || state.code || state.name);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors['communicationAddress.state'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['communicationAddress.state']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">District <span className="required">*</span></label>
                                        <select
                                            name="communicationAddress.district"
                                            className="reg-input"
                                            value={formData.communicationAddress.district}
                                            onChange={handleChange}
                                            disabled={!formData.communicationAddress.state}
                                        >
                                            <option value="">Select District</option>
                                            {districtOptions.map((dist, index) => {
                                                const label = typeof dist === 'string' ? dist : (dist.districtName || dist.name || dist.label || dist.id);
                                                const value = typeof dist === 'string' ? dist : (dist.districtId || dist.id || dist.code || dist.name);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors['communicationAddress.district'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['communicationAddress.district']}</span>}
                                    </div>
                                </div>

                                <div className="reg-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                    <div className="form-group">
                                        <label className="reg-label">Sub-District/Block <span className="required">*</span></label>
                                        <select
                                            name="communicationAddress.subDistrict"
                                            className="reg-input"
                                            value={formData.communicationAddress.subDistrict}
                                            onChange={handleChange}
                                            disabled={!formData.communicationAddress.district}
                                        >
                                            <option value="">Select Block</option>
                                            {blockOptions.length > 0 ? (
                                                blockOptions.map((block, index) => {
                                                    const label = typeof block === 'string' ? block : (block.blockName || block.name || block.label || block.id);
                                                    const value = typeof block === 'string' ? block : (block.blockId || block.id || block.code || block.name);
                                                    return <option key={index} value={value}>{label}</option>;
                                                })
                                            ) : (
                                                subDistricts[formData.communicationAddress.district]?.map((sub, index) => (
                                                    <option key={index} value={sub}>{sub}</option>
                                                ))
                                            )}
                                        </select>
                                        {errors['communicationAddress.subDistrict'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['communicationAddress.subDistrict']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">Pincode <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="communicationAddress.pincode"
                                            className="reg-input"
                                            value={formData.communicationAddress.pincode}
                                            onChange={handleChange}
                                            placeholder="6-digit Pincode"
                                            maxLength="6"
                                        />
                                        {errors['communicationAddress.pincode'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['communicationAddress.pincode']}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div>
                                <div className="reg-section-header">
                                    <span className="reg-section-icon">≡ƒöÉ</span>
                                    <div>
                                        <h3 className="reg-section-title">Login Credentials</h3>
                                        <span className="reg-section-desc">Create your username and password for portal access</span>
                                    </div>
                                </div>

                                <div className="reg-row" style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="form-group">
                                        <label className="reg-label">Preferred Username <span className="required">*</span></label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                name="loginCredentials.preferredUsername"
                                                className="reg-input"
                                                value={formData.loginCredentials.preferredUsername}
                                                onChange={handleChange}
                                                placeholder="Enter desired username"
                                            />
                                            <button type="button" onClick={checkUsernameAvailability} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                                                Check Availability
                                            </button>
                                        </div>
                                        {formData.usernameAvailable !== undefined && (
                                            <span style={{ fontSize: '0.875rem', color: formData.usernameAvailable ? 'green' : 'red', marginTop: '5px', display: 'block' }}>
                                                {formData.usernameAvailable ? 'Γ£ô Username available' : 'Γ£ò Username taken'}
                                            </span>
                                        )}
                                        {errors['loginCredentials.preferredUsername'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['loginCredentials.preferredUsername']}</span>}
                                    </div>
                                </div>

                                <div className="reg-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-group">
                                        <label className="reg-label">Password <span className="required">*</span></label>
                                        <input
                                            type="password"
                                            name="loginCredentials.password"
                                            className="reg-input"
                                            value={formData.loginCredentials.password}
                                            onChange={handleChange}
                                            placeholder="Create Password"
                                        />
                                        {errors['loginCredentials.password'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['loginCredentials.password']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">Confirm Password <span className="required">*</span></label>
                                        <input
                                            type="password"
                                            name="loginCredentials.confirmPassword"
                                            className="reg-input"
                                            value={formData.loginCredentials.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Retype Password"
                                        />
                                        {errors['loginCredentials.confirmPassword'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['loginCredentials.confirmPassword']}</span>}
                                    </div>
                                </div>

                                <div className="reg-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-group">
                                        <label className="reg-label">Security Question <span className="required">*</span></label>
                                        <select
                                            name="loginCredentials.securityQuestion"
                                            className="reg-input"
                                            value={formData.loginCredentials.securityQuestion}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Question</option>
                                            {securityQuestions.map((q, i) => (
                                                <option key={i} value={q}>{q}</option>
                                            ))}
                                        </select>
                                        {errors['loginCredentials.securityQuestion'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['loginCredentials.securityQuestion']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="reg-label">Security Answer <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="loginCredentials.securityAnswer"
                                            className="reg-input"
                                            value={formData.loginCredentials.securityAnswer}
                                            onChange={handleChange}
                                            placeholder="Your Answer"
                                        />
                                        {errors['loginCredentials.securityAnswer'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['loginCredentials.securityAnswer']}</span>}
                                    </div>
                                </div>

                                <div className="reg-row" style={{ alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="reg-label">Captcha <span className="required">*</span></label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ background: '#e2e8f0', padding: '10px 20px', borderRadius: '6px', fontSize: '1.25rem', letterSpacing: '5px', fontWeight: 'bold', fontFamily: 'monospace', color: '#1e3a8a' }}>
                                                {captchaCode}
                                            </div>
                                            <button type="button" onClick={generateCaptcha} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                Γå╗ Refresh
                                            </button>
                                            <input
                                                type="text"
                                                name="loginCredentials.captchaInput"
                                                className="reg-input"
                                                value={formData.loginCredentials.captchaInput || ''}
                                                onChange={handleChange}
                                                placeholder="Enter Code"
                                                style={{ width: '150px' }}
                                            />
                                        </div>
                                        {errors['loginCredentials.captchaInput'] && <span className="error-message" style={{ color: 'red', fontSize: '0.875rem' }}>{errors['loginCredentials.captchaInput']}</span>}
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            name="declaration"
                                            checked={formData.declaration}
                                            onChange={handleChange}
                                            style={{ marginTop: '4px' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                                            I hereby declare that the information provided above is true and correct to the best of my knowledge and belief. I understand that any false information may lead to rejection of my application.
                                        </span>
                                    </label>
                                    {errors.declaration && <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '5px' }}>{errors.declaration}</p>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="reg-actions">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="btn-secondary"
                                >
                                    ΓåÉ Previous
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="btn-next"
                                >
                                    Next ΓåÆ
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn-success"
                                >
                                    Submit Registration
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
