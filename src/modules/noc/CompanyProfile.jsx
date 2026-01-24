import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/apiConfig';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const CompanyProfile = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sameAsCommunication, setSameAsCommunication] = useState(false);
    const [companyTypeOptions, setCompanyTypeOptions] = useState([]);

    // Location State
    const [stateOptions, setStateOptions] = useState([]);
    const [commDistrictOptions, setCommDistrictOptions] = useState([]);
    const [regDistrictOptions, setRegDistrictOptions] = useState([]);

    const [formData, setFormData] = useState({
        companyName: '',
        companyType: '',
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
                    const typesRes = await fetch(`${API_BASE_URL}/companies/types`);
                    if (typesRes.ok) {
                        const data = await typesRes.json();
                        if (data.success && Array.isArray(data.data)) {
                            setCompanyTypeOptions(data.data);
                        }
                    }
                } catch (e) { console.error("Error fetching company types", e); }

                // 2. Fetch States
                try {
                    const statesRes = await fetch(`${API_BASE_URL}/master/states`);
                    if (statesRes.ok) {
                        const data = await statesRes.json();
                        // Handle different potential response structures
                        const statesList = Array.isArray(data) ? data : (data.data || []);
                        setStateOptions(statesList);
                    }
                } catch (e) { console.error("Error fetching states", e); }

                // 3. Fetch Company Profile using correct endpoint
                await fetchAndPopulateProfile();

            } catch (error) {
                console.error('Error initializing data:', error);
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

                // Populate Form
                setFormData(prev => ({
                    ...prev,
                    companyName: company.companyName || '',
                    companyType: company.companyType || '',
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

                // Set sameAsCommunication if addresses match (simple check)
                if (company.registeredAddress?.addressLine1 === company.communicationAddress?.addressLine1 &&
                    company.registeredAddress?.pincode === company.communicationAddress?.pincode) {
                    setSameAsCommunication(true);
                }

                // Update User Context if needed
                const userStr = localStorage.getItem('nocUser');
                if (userStr) {
                    const localUser = JSON.parse(userStr);
                    if (!localUser.companyId && company._id) {
                        localUser.companyId = company._id;
                        localStorage.setItem('nocUser', JSON.stringify(localUser));
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
                const response = await fetch(`${API_BASE_URL}/master/districts?state=${formData.commAddress.state}`);
                if (response.ok) {
                    const data = await response.json();
                    const list = Array.isArray(data) ? data : (data.data || []);
                    setCommDistrictOptions(list);
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
                const response = await fetch(`${API_BASE_URL}/master/districts?state=${formData.regAddress.state}`);
                if (response.ok) {
                    const data = await response.json();
                    const list = Array.isArray(data) ? data : (data.data || []);
                    setRegDistrictOptions(list);
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

    // Use Auth Context
    const { refreshSession, logout } = useAuth();

    // ... existing state ...

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const companyData = {
                companyName: formData.companyName,
                companyType: formData.companyType,
                industryType: formData.companyType, // Specific requirement from user curl example using companyType as industryType? Or just mapping. Keeping as per prompt if needed, or mapping "MANUFACTURING" if that was just example. 
                // Wait, user curl said "industryType": "MANUFACTURING".
                // Actually, let's just stick to what the form captures but in the correct structure.
                incorporationId: formData.incorporationId,
                incorporationDate: formData.incorporationDate,
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
            const result = await nocApplicationService.registerCompany(companyData);

            console.log('Company registered:', result);

            if (result.success) {
                alert('Company Profile saved successfully!');
                // Reload profile to show saved details (and documents if they exist)
                await fetchAndPopulateProfile();
            } else {
                alert(`Failed to save company profile: ${result.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Registration failed:', error);
            // Check if error is due to auth failure that couldn't be refreshed
            if (error.message && (error.message.includes('Session expired') || error.message.includes('401'))) {
                alert('Session expired. Please login again.');
                logout();
                navigate('/noc/login');
            } else {
                alert(`Failed to save company profile: ${error.message}`);
            }
        }
    };

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

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
                                        className="form-control"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange(null, 'companyName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company Type <span className="required">*</span></label>
                                    <select
                                        className="form-control"
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
                                    <label>Date of Incorporation</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.incorporationDate}
                                        onChange={(e) => handleInputChange(null, 'incorporationDate', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Incorporation ID <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
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
                                        className="form-control"
                                        value={formData.gstNumber}
                                        onChange={(e) => handleInputChange(null, 'gstNumber', e.target.value)}
                                        placeholder="e.g. 22AAAAA0000A1Z5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>PAN Number <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
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
                                        className="form-control"
                                        value={formData.commAddress.line1}
                                        onChange={(e) => handleInputChange('commAddress', 'line1', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.commAddress.line2}
                                        onChange={(e) => handleInputChange('commAddress', 'line2', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>State <span className="required">*</span></label>
                                    <select
                                        className="form-control"
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
                                        className="form-control"
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
                                        className="form-control"
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
                                                className="form-control"
                                                value={formData.regAddress.line1}
                                                onChange={(e) => handleInputChange('regAddress', 'line1', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Address Line 2</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.regAddress.line2}
                                                onChange={(e) => handleInputChange('regAddress', 'line2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-grid-3">
                                        <div className="form-group">
                                            <label>State <span className="required">*</span></label>
                                            <select
                                                className="form-control"
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
                                                className="form-control"
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
                                                className="form-control"
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
                                        className="form-control"
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
                                        className="form-control"
                                        value={formData.contact.email}
                                        onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Landline No.</label>
                                    <input
                                        type="tel"
                                        className="form-control"
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
                                        className="form-control"
                                        value={formData.authPerson.name}
                                        onChange={(e) => handleInputChange('authPerson', 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Designation <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.authPerson.designation}
                                        onChange={(e) => handleInputChange('authPerson', 'designation', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        className="form-control"
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
                                        className="form-control"
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
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default CompanyProfile;
