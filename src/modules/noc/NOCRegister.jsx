import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API_BASE_URL from '../../config/apiConfig';
import PublicHeader from '../../modules/public/components/PublicHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const NOCRegister = ({ isModal = false, onClose = null }) => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectUserType } = useAuth();
    const { t } = useTranslation();
    const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();

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
    const [showPassword, setShowPassword] = useState(false);

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
            if (selectedType === 'Aadhaar Card') docType = 'AADHAAR';
            else if (selectedType === 'PAN Card') docType = 'PAN';
            else if (selectedType === 'Voter ID') docType = 'VOTER_ID';

            formDataUpload.append('documentType', docType);

            // Use public upload endpoint
            const response = await fetch(`${API_BASE_URL}/public/documents/upload`, {
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

    // Claim uploaded document after successful registration
    const claimDocument = async (documentId, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${documentId}/claim`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Document claimed successfully');
                return true;
            } else {
                const errorData = await response.json();
                console.error('Failed to claim document:', errorData.message);
                return false;
            }
        } catch (error) {
            console.error('Error claiming document:', error);
            return false;
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

        // Reset username validation status when typing
        if (name === 'loginCredentials.preferredUsername') {
            setFormData(prev => ({ ...prev, usernameAvailable: undefined }));
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
                toastSuccess(`OTP sent successfully to your ${type}. It will expire in ${expiresIn} seconds.`);
            } else {
                const errorData = await response.json();
                // Show specific error from API
                toastError(errorData.message || `Failed to send OTP to ${type}. Please try again.`);
            }
        } catch (error) {
            console.error(`Error sending OTP to ${type}:`, error);
            toastError(`Network error while sending OTP. Please check your connection and try again.`);
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

                toastSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Invalid OTP';
                setErrors(prev => ({ ...prev, [`applicantInfo.${type}OTP`]: errorMessage }));
                toastError(errorMessage);
            }
        } catch (error) {
            console.error(`Error verifying ${type} OTP:`, error);
            toastError('Network error during OTP verification. Please try again.');
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
                const result = await response.json();
                const isAvailable = result.available || (result.data && result.data.available);

                if (isAvailable) {
                    setFormData(prev => ({ ...prev, usernameAvailable: true }));
                    toastSuccess(result.message || 'Username is available!');
                    // Clear any previous error
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors['loginCredentials.preferredUsername'];
                        return newErrors;
                    });
                } else {
                    setFormData(prev => ({ ...prev, usernameAvailable: false }));
                    setErrors(prev => ({ ...prev, 'loginCredentials.preferredUsername': result.message || 'Username is already taken' }));
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
                toastWarning(`Please fix the following errors:\n${errorMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}`);
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

                    // Claim uploaded document if exists
                    if (formData.applicantInfo.idProofDocumentId) {
                        // Extract token from response
                        const token = result.data?.token || result.token;

                        if (token) {
                            console.log('Claiming uploaded document...');
                            const claimSuccess = await claimDocument(formData.applicantInfo.idProofDocumentId, token);

                            if (claimSuccess) {
                                console.log('Document successfully linked to user account');
                            } else {
                                console.warn('Document claim failed, but registration succeeded');
                            }
                        } else {
                            console.warn('No token received, cannot claim document');
                        }
                    }

                    // Show success message with username
                    const successMessage = `ðŸŽ‰ Registration Successful!\n\nYour account has been created successfully.\n\nUsername: ${formData.loginCredentials.preferredUsername}\n\nPlease login with your credentials.`;
                    toastSuccess(successMessage, 6000); // Longer duration for the big message

                    // Close modal and return to login panel, or navigate to login page
                    if (isModal && onClose) {
                        onClose();
                    } else {
                        navigate('/noc/login');
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Registration failed:', errorData);

                    // Check for nested error message structure: errorData.error.message OR errorData.message
                    let msg = (errorData.error && errorData.error.message) || errorData.message || 'Registration failed. Please check your details.';

                    // If it's a validation error, show the specific details if available
                    if (errorData.error && errorData.error.code === 'VALIDATION_ERROR' && Array.isArray(errorData.error.details)) {
                        msg = errorData.error.details.map(d => d.replace(/"/g, '')).join('. ');
                    }

                    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('duplicate') || (errorData.error && errorData.error.code === 'DUPLICATE_ENTRY')) {
                        toastWarning(`⚠️ Registration Error:\n\n${msg}`);
                    } else if (errorData.error && errorData.error.code === 'VALIDATION_ERROR') {
                        toastError(`⚠️ Validation Error:\n\n${msg}`);
                    } else {
                        toastError(msg);
                    }
                }

            } catch (error) {
                console.error('Network error during registration:', error);
                toastError('Network error. Please check if the server is running and try again.');
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

    const getStepIcon = (step) => {
        if (currentStep > step) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
        return step;
    };

    return (
        <div className="noc-portal">
            {!isModal && <PublicHeader />}

            <div className={`auth-page-container ${isModal ? 'p-0 min-h-0 bg-transparent' : ''}`}>
                <div className={`auth-card auth-card-wide ${isModal ? 'border-0 shadow-none m-0' : ''}`}>
                    {isModal && (
                        <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    )}

                    <div className="auth-header">
                        <div className="auth-icon-wrapper">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        </div>
                        <h2 className="auth-title">{t('register.title')}</h2>
                        <p className="auth-subtitle">{t('register.subtitle')}</p>
                    </div>

                    <div className="reg-stepper">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={`reg-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                                <div className="step-dot">{getStepIcon(step)}</div>
                                <div className="step-text">
                                    {step === 1 ? t('register.stepProfile') : step === 2 ? t('register.stepAddress') : t('register.stepAccess')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="reg-form-body">
                        {/* Step 1: Applicant Information */}
                        {currentStep === 1 && (
                            <div className="card-body p-0">
                                <div className="form-section-header mb-6">
                                    <h3 className="card-title text-primary">{t('register.personalDetails')}</h3>
                                    <p className="card-subtitle">{t('register.personalSubtitle')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.titleLabel')} <span className="text-error">*</span></label>
                                        <select
                                            name="applicantInfo.title"
                                            className="form-select"
                                            value={formData.applicantInfo.title}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            {titleOptions.map((opt, index) => (
                                                <option key={index} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group col-span-1">
                                        <label className="form-label">{t('register.firstName')} <span className="text-error">*</span></label>
                                        <input
                                            type="text"
                                            name="applicantInfo.firstName"
                                            className="form-input"
                                            value={formData.applicantInfo.firstName || formData.applicantInfo.applicantName}
                                            onChange={handleChange}
                                            placeholder={t('register.firstName')}
                                        />
                                        {errors['applicantInfo.firstName'] && <span className="form-error">{errors['applicantInfo.firstName']}</span>}
                                    </div>

                                    <div className="form-group col-span-1">
                                        <label className="form-label">{t('register.lastName')} <span className="text-error">*</span></label>
                                        <input
                                            type="text"
                                            name="applicantInfo.lastName"
                                            className="form-input"
                                            value={formData.applicantInfo.lastName}
                                            onChange={handleChange}
                                            placeholder={t('register.lastName')}
                                        />
                                        {errors['applicantInfo.lastName'] && <span className="form-error">{errors['applicantInfo.lastName']}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.dob')} <span className="text-error">*</span></label>
                                        <input
                                            type="date"
                                            name="applicantInfo.dateOfBirth"
                                            className="form-input"
                                            value={formData.applicantInfo.dateOfBirth}
                                            onChange={handleChange}
                                        />
                                        {errors['applicantInfo.dateOfBirth'] && <span className="form-error">{errors['applicantInfo.dateOfBirth']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.gender')} <span className="text-error">*</span></label>
                                        <select
                                            name="applicantInfo.gender"
                                            className="form-select"
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.mobile')} <span className="text-error">*</span></label>
                                        <div className="input-with-action">
                                            <input
                                                type="text"
                                                name="applicantInfo.mobileNumber"
                                                className={`form-input ${mobileVerified ? 'is-valid' : ''}`}
                                                value={formData.applicantInfo.mobileNumber}
                                                onChange={handleChange}
                                                placeholder="10-digit number"
                                                maxLength="10"
                                                readOnly={mobileVerified}
                                            />
                                            {!mobileVerified && (
                                                <button type="button" onClick={() => sendOTP('mobile')} className="btn btn-secondary btn-sm" disabled={sendingMobileOTP}>
                                                    {sendingMobileOTP ? '...' : t('register.sendOtp')}
                                                </button>
                                            )}
                                        </div>
                                        {errors['applicantInfo.mobileNumber'] && <span className="form-error">{errors['applicantInfo.mobileNumber']}</span>}
                                        {mobileVerified && <div className="verification-badge mt-1">✓ {t('register.mobileVerified')}</div>}

                                        {!mobileVerified && sendingMobileOTP && (
                                            <div className="input-with-action mt-2">
                                                <input
                                                    type="text"
                                                    name="applicantInfo.mobileOTP"
                                                    value={formData.applicantInfo.mobileOTP}
                                                    onChange={handleChange}
                                                    placeholder="Enter OTP"
                                                    className="form-input"
                                                />
                                                <button type="button" onClick={() => verifyOTP('mobile')} className="btn btn-primary btn-sm">Verify</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.email')} <span className="text-error">*</span></label>
                                        <div className="input-with-action">
                                            <input
                                                type="email"
                                                name="applicantInfo.emailId"
                                                className={`form-input ${emailVerified ? 'is-valid' : ''}`}
                                                value={formData.applicantInfo.emailId}
                                                onChange={handleChange}
                                                placeholder="email@example.com"
                                                readOnly={emailVerified}
                                            />
                                            {!emailVerified && (
                                                <button type="button" onClick={() => sendOTP('email')} className="btn btn-secondary btn-sm" disabled={sendingEmailOTP}>
                                                    {sendingEmailOTP ? '...' : t('register.sendOtp')}
                                                </button>
                                            )}
                                        </div>
                                        {errors['applicantInfo.emailId'] && <span className="form-error">{errors['applicantInfo.emailId']}</span>}
                                        {emailVerified && <div className="verification-badge mt-1">✓ {t('register.emailVerified')}</div>}

                                        {!emailVerified && sendingEmailOTP && (
                                            <div className="input-with-action mt-2">
                                                <input
                                                    type="text"
                                                    name="applicantInfo.emailOTP"
                                                    value={formData.applicantInfo.emailOTP}
                                                    onChange={handleChange}
                                                    placeholder="Enter OTP"
                                                    className="form-input"
                                                />
                                                <button type="button" onClick={() => verifyOTP('email')} className="btn btn-primary btn-sm">Verify</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('register.idType')} & {t('register.idNumber')} <span className="text-error">*</span></label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <select name="applicantInfo.idProofType" value={formData.applicantInfo.idProofType} onChange={handleChange} className="form-select">
                                            <option value="Aadhaar">{t('register.idType')}</option>
                                            <option value="PAN">PAN Card</option>
                                            <option value="VoterID">Voter ID</option>
                                        </select>
                                        <input type="text" name="applicantInfo.idProofNumber" value={formData.applicantInfo.idProofNumber} onChange={handleChange} placeholder={t('register.idNumber')} className="form-input" />
                                    </div>
                                    <div className="card p-4 bg-gray-50 border-dashed">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    name="applicantInfo.idProofFile"
                                                    onChange={handleFileUpload}
                                                    className="form-input border-0 bg-transparent p-0"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    disabled={isUploading}
                                                />
                                                <p className="form-hint m-0">PDF, JPG, PNG (Max 5MB)</p>
                                            </div>
                                            {isUploading && <span className="text-primary font-medium">{t('register.uploading')}</span>}
                                            {uploadSuccess && <span className="text-success text-xl">✓</span>}
                                        </div>
                                        {uploadError && <span className="form-error">{uploadError}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Communication Address */}
                        {currentStep === 2 && (
                            <div className="card-body p-0">
                                <div className="form-section-header mb-6">
                                    <h3 className="card-title text-primary">{t('register.addressDetails')}</h3>
                                    <p className="card-subtitle">{t('register.addressSubtitle')}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.address1')} <span className="text-error">*</span></label>
                                        <input
                                            type="text"
                                            name="communicationAddress.addressLine1"
                                            className="form-input"
                                            value={formData.communicationAddress.addressLine1}
                                            onChange={handleChange}
                                            placeholder={t('register.address1')}
                                        />
                                        {errors['communicationAddress.addressLine1'] && <span className="form-error">{errors['communicationAddress.addressLine1']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.address2')}</label>
                                        <input
                                            type="text"
                                            name="communicationAddress.addressLine2"
                                            className="form-input"
                                            value={formData.communicationAddress.addressLine2}
                                            onChange={handleChange}
                                            placeholder={t('register.address2')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.state')} <span className="text-error">*</span></label>
                                        <select
                                            name="communicationAddress.state"
                                            className="form-select"
                                            value={formData.communicationAddress.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">{t('register.state')}</option>
                                            {stateOptions.map((state, index) => {
                                                const label = typeof state === 'string' ? state : (state.stateName || state.name || state.label || state.id);
                                                const value = typeof state === 'string' ? state : (state.stateId || state.id || state.code || state.name);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors['communicationAddress.state'] && <span className="form-error">{errors['communicationAddress.state']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.district')} <span className="text-error">*</span></label>
                                        <select
                                            name="communicationAddress.district"
                                            className="form-select"
                                            value={formData.communicationAddress.district}
                                            onChange={handleChange}
                                            disabled={!formData.communicationAddress.state}
                                        >
                                            <option value="">{t('register.district')}</option>
                                            {districtOptions.map((dist, index) => {
                                                const label = typeof dist === 'string' ? dist : (dist.districtName || dist.name || dist.label || dist.id);
                                                const value = typeof dist === 'string' ? dist : (dist.districtId || dist.id || dist.code || dist.name);
                                                return <option key={index} value={value}>{label}</option>;
                                            })}
                                        </select>
                                        {errors['communicationAddress.district'] && <span className="form-error">{errors['communicationAddress.district']}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.subDistrict')} <span className="text-error">*</span></label>
                                        <select
                                            name="communicationAddress.subDistrict"
                                            className="form-select"
                                            value={formData.communicationAddress.subDistrict}
                                            onChange={handleChange}
                                            disabled={!formData.communicationAddress.district}
                                        >
                                            <option value="">{t('register.subDistrict')}</option>
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
                                        {errors['communicationAddress.subDistrict'] && <span className="form-error">{errors['communicationAddress.subDistrict']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.pincode')} <span className="text-error">*</span></label>
                                        <input
                                            type="text"
                                            name="communicationAddress.pincode"
                                            className="form-input"
                                            value={formData.communicationAddress.pincode}
                                            onChange={handleChange}
                                            placeholder={t('register.pincodePlaceholder')}
                                            maxLength="6"
                                        />
                                        {errors['communicationAddress.pincode'] && <span className="form-error">{errors['communicationAddress.pincode']}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="card-body p-0">
                                <div className="form-section-header mb-6">
                                    <h3 className="card-title text-primary">{t('register.accessDetails')}</h3>
                                    <p className="card-subtitle">{t('register.accessSubtitle')}</p>
                                </div>

                                <div className="form-group mb-6">
                                    <label className="form-label">{t('register.username')} <span className="text-error">*</span></label>
                                    <div className="input-with-action">
                                        <input
                                            type="text"
                                            name="loginCredentials.preferredUsername"
                                            className={`form-input ${formData.usernameAvailable === true ? 'is-valid' : formData.usernameAvailable === false ? 'is-invalid' : ''}`}
                                            value={formData.loginCredentials.preferredUsername}
                                            onChange={handleChange}
                                            placeholder={t('register.username')}
                                        />
                                        <button type="button" onClick={checkUsernameAvailability} className="btn btn-secondary btn-sm">
                                            {t('register.checkAvailability')}
                                        </button>
                                    </div>
                                    {formData.usernameAvailable !== undefined && (
                                        <div className={`mt-1 text-xs font-medium ${formData.usernameAvailable ? 'text-success' : 'text-error'}`}>
                                            {formData.usernameAvailable ? '✓ Available' : '✕ Taken'}
                                        </div>
                                    )}
                                    {errors['loginCredentials.preferredUsername'] && <span className="form-error">{errors['loginCredentials.preferredUsername']}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.password')} <span className="text-error">*</span></label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="loginCredentials.password"
                                            className="form-input"
                                            value={formData.loginCredentials.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                        {errors['loginCredentials.password'] && <span className="form-error">{errors['loginCredentials.password']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.confirmPassword')} <span className="text-error">*</span></label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="loginCredentials.confirmPassword"
                                            className="form-input"
                                            value={formData.loginCredentials.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                        {errors['loginCredentials.confirmPassword'] && <span className="form-error">{errors['loginCredentials.confirmPassword']}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={showPassword}
                                            onChange={(e) => setShowPassword(e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-600">Show Password</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="form-group">
                                        <label className="form-label">{t('register.securityQ')} <span className="text-error">*</span></label>
                                        <select
                                            name="loginCredentials.securityQuestion"
                                            className="form-select"
                                            value={formData.loginCredentials.securityQuestion}
                                            onChange={handleChange}
                                        >
                                            <option value="">{t('register.securityQ')}</option>
                                            {securityQuestions.map((q, i) => (
                                                <option key={i} value={q}>{q}</option>
                                            ))}
                                        </select>
                                        {errors['loginCredentials.securityQuestion'] && <span className="form-error">{errors['loginCredentials.securityQuestion']}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('register.securityA')} <span className="text-error">*</span></label>
                                        <input
                                            type="text"
                                            name="loginCredentials.securityAnswer"
                                            className="form-input"
                                            value={formData.loginCredentials.securityAnswer}
                                            onChange={handleChange}
                                            placeholder={t('register.securityA')}
                                        />
                                        {errors['loginCredentials.securityAnswer'] && <span className="form-error">{errors['loginCredentials.securityAnswer']}</span>}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                                    <label className="form-label">{t('register.captcha')} <span className="text-error">*</span></label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="bg-white px-6 py-3 rounded-lg border-2 border-primary-100 text-2xl tracking-[8px] font-mono font-bold text-primary-900 shadow-sm">
                                            {captchaCode}
                                        </div>
                                        <button type="button" onClick={generateCaptcha} className="btn-icon text-primary-600 hover:bg-primary-50 rounded-full p-2 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                        </button>
                                        <input
                                            type="text"
                                            name="loginCredentials.captchaInput"
                                            className="form-input w-36"
                                            value={formData.loginCredentials.captchaInput || ''}
                                            onChange={handleChange}
                                            placeholder={t('register.captchaPlaceholder')}
                                        />
                                    </div>
                                    {errors['loginCredentials.captchaInput'] && <span className="form-error block mt-1">{errors['loginCredentials.captchaInput']}</span>}
                                </div>

                                <div className="form-group mb-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="declaration"
                                            checked={formData.declaration}
                                            onChange={handleChange}
                                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                            {t('register.declarationText')}
                                        </span>
                                    </label>
                                    {errors.declaration && <p className="form-error mt-2">{errors.declaration}</p>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="reg-actions">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="btn btn-secondary"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                    {t('register.btnPrev')}
                                </button>
                            ) : <div></div>}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="btn btn-primary"
                                >
                                    {t('register.btnNext')}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                >
                                    {t('register.btnSubmit')}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 m-0">
                            Already have an account?{' '}
                            <Link to="/noc/login" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors no-underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {!isModal && <NOCFooter />}
        </div>
    );
};

export default NOCRegister;




