import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
                    const typesRes = await fetch('http://localhost:3000/api/companies/types');
                    if (typesRes.ok) {
                        const data = await typesRes.json();
                        if (data.success && Array.isArray(data.data)) {
                            setCompanyTypeOptions(data.data);
                        }
                    }
                } catch (e) { console.error("Error fetching company types", e); }

                // 2. Fetch States
                try {
                    const statesRes = await fetch('http://localhost:3000/api/master/states');
                    if (statesRes.ok) {
                        const data = await statesRes.json();
                        // Handle different potential response structures
                        const statesList = Array.isArray(data) ? data : (data.data || []);
                        setStateOptions(statesList);
                    }
                } catch (e) { console.error("Error fetching states", e); }

                // 3. Fetch Existing Company Profile
                try {
                    const profileRes = await nocApplicationService.getCompanyProfile();
                    if (profileRes.success && profileRes.data) {
                        const company = profileRes.data;
                        console.log("Loaded existing company:", company);

                        // Populate Form
                        setFormData(prev => ({
                            ...prev,
                            companyName: company.companyName || '',
                            companyType: company.companyType || '',
                            incorporationDate: company.incorporationDate ? company.incorporationDate.split('T')[0] : '', // Format date if exists
                            gstNumber: company.gstNumber || '',
                            panNumber: company.panNumber || '',
                            commAddress: {
                                line1: company.registeredAddress?.addressLine1 || '',
                                line2: '', // Map if available
                                state: company.registeredAddress?.state || '',
                                district: company.registeredAddress?.district || '',
                                subDistrict: '',
                                pincode: company.registeredAddress?.pincode || ''
                            },
                            regAddress: { // Assuming same as registered for now or mapped correctly
                                line1: company.registeredAddress?.addressLine1 || '',
                                line2: '',
                                state: company.registeredAddress?.state || '',
                                district: company.registeredAddress?.district || '',
                                subDistrict: '',
                                pincode: company.registeredAddress?.pincode || ''
                            },
                            contact: {
                                mobile: company.phone || '',
                                email: company.email || '',
                                landline: '',
                                fax: ''
                            },
                            authPerson: {
                                name: company.authorizedPerson?.name || '',
                                designation: company.authorizedPerson?.designation || '',
                                mobile: '', // Map if available
                                email: '', // Map if available
                                aadhaar: ''
                            }
                        }));

                        // Ensure User Context has companyId (Auto-fix context)
                        const userStr = localStorage.getItem('nocUser');
                        if (userStr) {
                            const user = JSON.parse(userStr);
                            if (!user.companyId && company.id) {
                                user.companyId = company.id;
                                localStorage.setItem('nocUser', JSON.stringify(user));
                            }
                        }
                    }
                } catch (err) {
                    console.log("No existing company profile found (fresh start):", err);
                }

            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };

        initData();
    }, []);

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
                const response = await fetch(`http://localhost:3000/api/master/districts?state=${formData.commAddress.state}`);
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
                const response = await fetch(`http://localhost:3000/api/master/districts?state=${formData.regAddress.state}`);
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
                industryType: formData.companyType,
                gstNumber: formData.gstNumber,
                panNumber: formData.panNumber,
                email: formData.contact.email,
                phone: formData.contact.mobile,
                registeredAddress: {
                    addressLine1: formData.regAddress.line1,
                    state: formData.regAddress.state,
                    district: formData.regAddress.district,
                    pincode: formData.regAddress.pincode
                },
                communicationAddress: {
                    addressLine1: formData.commAddress.line1,
                    state: formData.commAddress.state,
                    district: formData.commAddress.district,
                    pincode: formData.commAddress.pincode
                },
                authorizedPerson: {
                    name: formData.authPerson.name,
                    designation: formData.authPerson.designation
                }
            };

            const submitData = new FormData();
            submitData.append('data', JSON.stringify(companyData));

            // Use the service which now handles auth and refresh automatically
            const result = await nocApplicationService.registerCompany(submitData);

            console.log('Company registered:', result);

            // Update Local Storage with Company ID
            if (result.success && result.data && result.data.id) {
                const userStr = localStorage.getItem('nocUser');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.companyId = result.data.id;
                    localStorage.setItem('nocUser', JSON.stringify(user));
                    console.log("Updated nocUser with companyId:", user.companyId);
                }
            }

            alert('Company Profile saved successfully!');
            // Stay on page to show details, or redirect? User asked to "SHOW THESE DETAILS"
            // We populated the form with what we sent, so it "shows" the details.
            // Optionally disable inputs or show a success banner.

        } catch (error) {
            console.error('Registration failed:', error);
            // Check if error is due to auth failure that couldn't be refreshed
            if (error.message.includes('Session expired') || error.message.includes('401')) {
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
                                        placeholder="e.g. ABCDE1234F"
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
