import React, { useState } from 'react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/apiClient';

import LayoutWithSidebar from './components/LayoutWithSidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const CompanyProfile = () => {
    const navigate = useNavigate();
    // const [sidebarOpen, setSidebarOpen] = useState(false); // Removed manual sidebar state
    const [sameAsCommunication, setSameAsCommunication] = useState(false);
    const [companyTypeOptions, setCompanyTypeOptions] = useState([]);
    const [industryTypeOptions, setIndustryTypeOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState(null);

    // Location State
    const [stateOptions, setStateOptions] = useState([]);
    const [commDistrictOptions, setCommDistrictOptions] = useState([]);
    const [regDistrictOptions, setRegDistrictOptions] = useState([]);

    const [formData, setFormData] = useState({
        companyName: '',
        companyType: '',
        industryType: '',
        incorporationId: '',
        incorporationDate: '',
        gstNumber: '',
        panNumber: '',

        // Communication Address
        commAddress: {
            line1: '',
            line2: '',
            state: '',
            district: '',
            subDistrict: '',
            pincode: ''
        },

        // Registered Address
        regAddress: {
            line1: '',
            line2: '',
            state: '',
            district: '',
            subDistrict: '',
            pincode: ''
        },

        // Communication Details
        contact: {
            mobile: '',
            email: '',
            landline: '',
            fax: ''
        },

        // Authorized Person
        authPerson: {
            name: '',
            designation: '',
            mobile: '',
            email: '',
            aadhaar: ''
        }
    });

    const handleInputChange = (section, field, value) => {
        setFormData(prev => {
            if (section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    // Fetch Master Data & Existing Profile on Mount
    React.useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch Company Types
                try {
                    const data = await apiClient.get('/companies/types');
                    if (data.success && Array.isArray(data.data)) {
                        setCompanyTypeOptions(data.data);
                    } else if (Array.isArray(data)) {
                        setCompanyTypeOptions(data);
                    }
                } catch (e) { console.error("Error fetching company types", e); }

                // 1.5 Fetch Industry Types
                try {
                    const indRes = await nocApplicationService.getIndustryTypes();
                    if (indRes.success && Array.isArray(indRes.data)) {
                        setIndustryTypeOptions(indRes.data);
                    }
                } catch (e) { console.error("Error fetching industry types", e); }

                // 2. Fetch States
                try {
                    const data = await apiClient.get('/master/states');
                    // Handle different potential response structures
                    const statesList = Array.isArray(data) ? data : (data.data || []);
                    setStateOptions(statesList);
                } catch (e) { console.error("Error fetching states", e); }

                // 3. Fetch Company Profile using correct endpoint
                await fetchAndPopulateProfile();

            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    const fetchAndPopulateProfile = async () => {
        try {
            const profileRes = await nocApplicationService.getCompanyProfile();
            if (profileRes.success && profileRes.data) {
                const company = profileRes.data;
                console.log("Loaded company profile:", company);
                setCompanyId(company._id);

                // Populate Form
                setFormData(prev => ({
                    ...prev,
                    companyName: company.companyName || '',
                    companyType: company.companyType || '',
                    industryType: company.industryType || '',
                    incorporationId: company.incorporationId || '',
                    incorporationDate: company.dateOfIncorporation ? company.dateOfIncorporation.split('T')[0] :
                        (company.incorporationDate ? company.incorporationDate.split('T')[0] : ''),
                    gstNumber: company.gstNumber || '',
                    panNumber: company.panNumber || '',

                    // Map Registered Address
                    regAddress: {
                        line1: company.registeredAddress?.addressLine1 || '',
                        line2: company.registeredAddress?.addressLine2 || '',
                        state: company.registeredAddress?.state || '',
                        district: company.registeredAddress?.district || '',
                        subDistrict: '', // Not in response, leave empty
                        pincode: company.registeredAddress?.pincode || ''
                    },

                    // Map Communication Address
                    commAddress: {
                        line1: company.communicationAddress?.addressLine1 || '',
                        line2: company.communicationAddress?.addressLine2 || '',
                        state: company.communicationAddress?.state || '',
                        district: company.communicationAddress?.district || '',
                        subDistrict: '',
                        pincode: company.communicationAddress?.pincode || ''
                    },

                    // Map Contact (Top level fields in JSON: email, phone)
                    contact: {
                        mobile: company.phone || '',
                        email: company.email || '',
                        landline: company.landline || '', // If available
                        fax: ''
                    },

                    // Map Authorized Person
                    authPerson: {
                        name: company.authorizedPerson?.name || '',
                        designation: company.authorizedPerson?.designation || '',
                        mobile: company.authorizedPerson?.phone || '',
                        email: company.authorizedPerson?.email || '',
                        aadhaar: '' // Not in response
                    }
                }));

                // Sync to localStorage for other modules
                const userStr = localStorage.getItem('nocUser');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user.companyId !== company._id) {
                            user.companyId = company._id;
                            localStorage.setItem('nocUser', JSON.stringify(user));
                            console.log("Synced companyId to localStorage");
                        }
                    } catch (e) {
                        console.error("Failed to sync companyId to localStorage", e);
                    }
                }

            }
        } catch (err) {
            console.log("No existing company profile found:", err);
        }
    };

    // Fetch Communication Districts when State Changes
    React.useEffect(() => {
        const fetchDistricts = async () => {
            if (!formData.commAddress.state) {
                setCommDistrictOptions([]);
                return;
            }
            try {
                // Determine if state is passed as ID or Name/Code. API likely supports Name/Code based on previous responses.
                // If API expects ID but we have "RJ", this might fail if not handled by backend.
                // Assuming backend handles "RJ" or frontend state mapping is robust.
            try {
                const data = await apiClient.get(`/master/districts?state=${formData.commAddress.state}`);
                const list = Array.isArray(data) ? data : (data.data || []);
                setCommDistrictOptions(list);
            } catch (error) {
                console.error('Error fetching communication districts:', error);
            }
            } catch (error) {
                console.error('Error fetching communication districts:', error);
            }
        };
        fetchDistricts();
    }, [formData.commAddress.state]);

    // Fetch Registered Districts when State Changes
    React.useEffect(() => {
        const fetchDistricts = async () => {
            if (!formData.regAddress.state) {
                setRegDistrictOptions([]);
                return;
            }
            try {
            try {
                const data = await apiClient.get(`/master/districts?state=${formData.regAddress.state}`);
                const list = Array.isArray(data) ? data : (data.data || []);
                setRegDistrictOptions(list);
            } catch (error) {
                console.error('Error fetching registered districts:', error);
            }
            } catch (error) {
                console.error('Error fetching registered districts:', error);
            }
        };
        fetchDistricts();
    }, [formData.regAddress.state]);

    const handleSameAddressChange = (e) => {
        const checked = e.target.checked;
        setSameAsCommunication(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                regAddress: { ...prev.commAddress }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                regAddress: {
                    line1: '',
                    line2: '',
                    state: '',
                    district: '',
                    subDistrict: '',
                    pincode: ''
                }
            }));
        }
    };

    // Use Auth & Toast Context
    const { refreshSession, logout } = useAuth();
    const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

    // ... existing state ...

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const companyData = {
                companyName: formData.companyName,
                companyType: formData.companyType,
                industryType: formData.industryType || formData.companyType, // Use industryType if available, fallback to companyType
                // Wait, user curl said "industryType": "MANUFACTURING".
                // Actually, let's just stick to what the form captures but in the correct structure.
                incorporationId: formData.incorporationId,
                dateOfIncorporation: formData.incorporationDate,
                gstNumber: formData.gstNumber,
                panNumber: formData.panNumber,
                email: formData.contact.email,
                phone: formData.contact.mobile,
                registeredAddress: {
                    addressLine1: formData.regAddress.line1,
                    // addressLine2 is missing in user example but good to send if backend handles it
                    addressLine2: formData.regAddress.line2,
                    state: formData.regAddress.state,
                    district: formData.regAddress.district,
                    pincode: formData.regAddress.pincode,
                    city: formData.regAddress.district // Fallback for city if not separate
                },
                // Communication address missing in user example, but likely needed by backend if distinct.
                // If backend ONLY accepts what's in curl, we might drop it, but usually backend is superset.
                // I will include it if standard, but user specifically asked to integrate "IT" (the curl).
                // Let's stick to the structure in curl mainly but include what our form has:
                communicationAddress: {
                    addressLine1: formData.commAddress.line1,
                    addressLine2: formData.commAddress.line2,
                    state: formData.commAddress.state,
                    district: formData.commAddress.district,
                    pincode: formData.commAddress.pincode
                },
                authorizedPerson: {
                    name: formData.authPerson.name,
                    designation: formData.authPerson.designation,
                    email: formData.authPerson.email,
                    phone: formData.authPerson.mobile
                }
            };

            // Send JSON directly
            let result;
            if (companyId) {
                result = await nocApplicationService.updateCompany(companyId, companyData);
            } else {
                result = await nocApplicationService.registerCompany(companyData);
            }

            console.log('Company registered:', result);

            if (result.success) {
                toastSuccess('Company Profile saved successfully!');
                // Reload profile to show saved details (and documents if they exist)
                await fetchAndPopulateProfile();
            } else {
                let errorMsg = result.message || 'Unknown error';
                
                // Handle specific validation errors from Joi
                if (result.error && result.error.code === 'VALIDATION_ERROR' && Array.isArray(result.error.details)) {
                    // Check for dateOfIncorporation specific error
                    const dateError = result.error.details.find(d => d.includes('dateOfIncorporation'));
                    if (dateError) {
                        errorMsg = 'Invalid incorporation date. Date must be before from now.';
                    } else {
                        // Join all details and remove technical quotes
                        errorMsg = result.error.details.map(d => d.replace(/"/g, '')).join('. ');
                    }
                }
                
                toastError(`Registration failed: ${errorMsg}`);
            }

        } catch (error) {
            console.error('Registration failed:', error);
            
            let errorMsg = error.message;
            
            // Check if error is an object with validation details
            if (error.error && error.error.code === 'VALIDATION_ERROR' && Array.isArray(error.error.details)) {
                const dateError = error.error.details.find(d => d.includes('dateOfIncorporation'));
                if (dateError) {
                    errorMsg = 'Invalid incorporation date. Date must be before from now.';
                } else {
                    errorMsg = error.error.details.map(d => d.replace(/"/g, '')).join('. ');
                }
            }

            // Check if error is due to auth failure that couldn't be refreshed
            if (errorMsg && (errorMsg.includes('Session expired') || errorMsg.includes('401'))) {
                toastError('Session expired. Please login again.');
                logout();
                navigate('/noc/login');
            } else {
                toastError(`Registration failed: ${errorMsg}`);
            }
        }
    };

    return (
        <LayoutWithSidebar defaultCollapsed={true}>

            <div className="content-container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/noc/dashboard">Dashboard</Link>
                    <span className="separator">›</span>
                    <span className="current">Company Profile</span>
                </div>

                <div className="page-title-section">
                    <h1 className="page-main-title">Company Profile</h1>
                    <p className="page-subtitle">Manage your company registration details</p>
                </div>

                {loading ? (
                    <div className="application-form">
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">🏢</span> <SkeletonLoader width="200px" height="1.5rem" style={{ display: 'inline-block' }} />
                            </h3>
                            <div className="form-grid-3">
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">📍</span> <SkeletonLoader width="200px" height="1.5rem" style={{ display: 'inline-block' }} />
                            </h3>
                            <div className="form-grid-2">
                                {Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="application-form">

                        {/* Company Details Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">🏢</span> Company Information
                            </h3>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Company Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange(null, 'companyName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company Type <span className="required">*</span></label>
                                    <select
                                        className="form-input"
                                        value={formData.companyType}
                                        onChange={(e) => handleInputChange(null, 'companyType', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {companyTypeOptions.length > 0 ? (
                                            companyTypeOptions.map((type, index) => (
                                                <option key={index} value={type}>
                                                    {type.replace(/_/g, ' ')}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Government">Government Dept.</option>
                                                <option value="PSU">Public Sector Undertaking</option>
                                                <option value="Private">Private Limited</option>
                                                <option value="Public">Public Limited</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Proprietorship">Proprietorship</option>
                                                <option value="Trust">Trust/Society</option>
                                                <option value="Individual">Individual</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Industry Type <span className="required">*</span></label>
                                    <select
                                        className="form-input"
                                        value={formData.industryType}
                                        onChange={(e) => handleInputChange(null, 'industryType', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Industry Type</option>
                                        {industryTypeOptions.length > 0 ? (
                                            industryTypeOptions.map((type, index) => (
                                                <option key={index} value={type.industryName || type}>
                                                    {type.industryName || type}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Agriculture">Agriculture</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Mining">Mining</option>
                                                <option value="Construction">Construction</option>
                                                <option value="Hospitality">Hospitality</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Education">Education</option>
                                                <option value="Commercial">Commercial</option>
                                                <option value="Domestic">Domestic</option>
                                                <option value="Other">Other</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date of Incorporation</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.incorporationDate}
                                        onChange={(e) => handleInputChange(null, 'incorporationDate', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Incorporation ID <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.incorporationId}
                                        onChange={(e) => handleInputChange(null, 'incorporationId', e.target.value)}
                                        required
                                        placeholder="e.g. U12345RJ2023PTC123456"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>GST Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.gstNumber}
                                        onChange={(e) => handleInputChange(null, 'gstNumber', e.target.value)}
                                        placeholder="e.g. 22AAAAA0000A1Z5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>PAN Number <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.panNumber}
                                        onChange={(e) => handleInputChange(null, 'panNumber', e.target.value)}
                                        required
                                        placeholder=" ABCDE1234F"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Communication Address Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">📍</span> Communication Address
                            </h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Address Line 1 <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.commAddress.line1}
                                        onChange={(e) => handleInputChange('commAddress', 'line1', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.commAddress.line2}
                                        onChange={(e) => handleInputChange('commAddress', 'line2', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>State <span className="required">*</span></label>
                                    <select
                                        className="form-input"
                                        value={formData.commAddress.state}
                                        onChange={(e) => {
                                            handleInputChange('commAddress', 'state', e.target.value);
                                            handleInputChange('commAddress', 'district', ''); // Reset district
                                        }}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {stateOptions.map((state, index) => (
                                            <option key={index} value={state.name || state.stateName || state.stateId || state.id}>
                                                {state.stateName || state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>District <span className="required">*</span></label>
                                    <select
                                        className="form-input"
                                        value={formData.commAddress.district}
                                        onChange={(e) => handleInputChange('commAddress', 'district', e.target.value)}
                                        required
                                        disabled={!formData.commAddress.state}
                                    >
                                        <option value="">Select District</option>
                                        {commDistrictOptions.map((district, index) => (
                                            <option key={index} value={district.name || district.districtName || district.districtId || district.id}>
                                                {district.districtName || district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pin Code <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.commAddress.pincode}
                                        onChange={(e) => handleInputChange('commAddress', 'pincode', e.target.value)}
                                        required
                                        maxLength="6"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Registered Address Section */}
                        <div className="form-section">
                            <div className="section-header-row">
                                <h3 className="section-title" style={{ marginBottom: 0 }}>
                                    <span className="icon">🏢</span> Registered Office Address
                                </h3>
                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="sameAddress"
                                        checked={sameAsCommunication}
                                        onChange={handleSameAddressChange}
                                    />
                                    <label htmlFor="sameAddress">Same as Communication Address</label>
                                </div>
                            </div>

                            {!sameAsCommunication && (
                                <>
                                    <div className="form-grid-2 mt-4">
                                        <div className="form-group">
                                            <label>Address Line 1 <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.regAddress.line1}
                                                onChange={(e) => handleInputChange('regAddress', 'line1', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Address Line 2</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.regAddress.line2}
                                                onChange={(e) => handleInputChange('regAddress', 'line2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-grid-3">
                                        <div className="form-group">
                                            <label>State <span className="required">*</span></label>
                                            <select
                                                className="form-input"
                                                value={formData.regAddress.state}
                                                onChange={(e) => {
                                                    handleInputChange('regAddress', 'state', e.target.value);
                                                    handleInputChange('regAddress', 'district', ''); // Reset district
                                                }}
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {stateOptions.map((state, index) => (
                                                    <option key={index} value={state.name || state.stateName || state.stateId || state.id}>
                                                        {state.stateName || state.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>District <span className="required">*</span></label>
                                            <select
                                                className="form-input"
                                                value={formData.regAddress.district}
                                                onChange={(e) => handleInputChange('regAddress', 'district', e.target.value)}
                                                required
                                                disabled={!formData.regAddress.state}
                                            >
                                                <option value="">Select District</option>
                                                {regDistrictOptions.map((district, index) => (
                                                    <option key={index} value={district.name || district.districtName || district.districtId || district.id}>
                                                        {district.districtName || district.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Pin Code <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.regAddress.pincode}
                                                onChange={(e) => handleInputChange('regAddress', 'pincode', e.target.value)}
                                                required
                                                maxLength="6"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Contact Details Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">📞</span> Contact Details
                            </h3>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Mobile Number <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.contact.mobile}
                                        onChange={(e) => handleInputChange('contact', 'mobile', e.target.value)}
                                        required
                                        maxLength="10"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.contact.email}
                                        onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Landline No.</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.contact.landline}
                                        onChange={(e) => handleInputChange('contact', 'landline', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Authorized Person Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">👤</span> Authorized Person Details
                            </h3>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.authPerson.name}
                                        onChange={(e) => handleInputChange('authPerson', 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Designation <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.authPerson.designation}
                                        onChange={(e) => handleInputChange('authPerson', 'designation', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.authPerson.mobile}
                                        onChange={(e) => handleInputChange('authPerson', 'mobile', e.target.value)}
                                        required
                                        maxLength="10"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email ID <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.authPerson.email}
                                        onChange={(e) => handleInputChange('authPerson', 'email', e.target.value)}
                                        required
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="form-actions-footer">
                            <button type="button" className="btn-secondary" onClick={() => navigate('/noc/dashboard')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Save Company Profile
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </LayoutWithSidebar>
    );
};

export default CompanyProfile;
