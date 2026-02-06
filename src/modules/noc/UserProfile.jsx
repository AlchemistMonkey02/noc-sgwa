import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicHeader from '../public/components/PublicHeader';
import SkeletonLoader from '../../components/SkeletonLoader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        designation: '',
        organizationName: '',
        email: '',
        mobile: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            district: '',
            pincode: ''
        },
        profilePhoto: null
    });

    const [companyDetails, setCompanyDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await nocApplicationService.getUserProfile();
                if (response.success && response.data) {
                    const data = response.data;
                    setUserDetails(data);

                    // Map API data to form state
                    setFormData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        designation: data.designation || 'N/A', // If API doesn't have designation at root
                        organizationName: data.company?.companyName || '',
                        email: data.email || '',
                        mobile: data.phone || '',
                        address: {
                            line1: data.communicationAddress?.addressLine1 || '',
                            line2: data.communicationAddress?.addressLine2 || '',
                            city: data.communicationAddress?.district || '', // Mapping district to city for now
                            state: data.communicationAddress?.state || '',
                            district: data.communicationAddress?.district || '',
                            pincode: data.communicationAddress?.pincode || ''
                        },
                        profilePhoto: null
                    });

                    if (data.company) {
                        setCompanyDetails(data.company);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Fetch profile picture with authentication
    useEffect(() => {
        let isMounted = true;

        const loadProfilePicture = async () => {
            if (userDetails?.profilePictureId) {
                try {
                    const token = localStorage.getItem('authToken');
                    const imageUrl = nocApplicationService.getDocumentUrl(userDetails.profilePictureId);
                    console.log('Fetching profile picture from:', imageUrl);
                    console.log('Using token:', token ? 'Token present' : 'NO TOKEN');

                    const response = await fetch(imageUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('Response status:', response.status);

                    if (response.ok) {
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        if (isMounted) {
                            setProfilePictureUrl(url);
                            console.log('✓ Profile picture loaded successfully');
                        }
                    } else {
                        console.error('Failed to load profile picture:', response.status, response.statusText);
                    }
                } catch (error) {
                    console.error('Error loading profile picture:', error);
                }
            } else {
                console.log('No profilePictureId found in userDetails');
            }
        };

        loadProfilePicture();

        return () => {
            isMounted = false;
        };
    }, [userDetails?.profilePictureId]);

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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Upload immediately
                const result = await nocApplicationService.uploadProfilePicture(file);
                if (result.success && result.data) {
                    console.log('Profile picture uploaded:', result.data);

                    // Use base64 from response if available (it already has data:image prefix)
                    if (result.data.base64) {
                        setProfilePictureUrl(result.data.base64);
                        console.log('Set profile picture from base64 (already has prefix)');
                    }

                    // Update userDetails with the new profilePictureId directly from response
                    const profilePictureId = result.data.profilePicture;
                    setUserDetails(prev => ({
                        ...prev,
                        profilePictureId: profilePictureId
                    }));

                    alert('Profile picture updated successfully!');
                }
            } catch (error) {
                console.error('Failed to upload profile picture:', error);
                alert('Failed to upload profile picture. Please try again.');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('User Profile Updated:', formData);
        alert('User Profile saved successfully!');
    };

    if (loading) {
        return (
            <div className="noc-portal">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                <PublicHeader />

                <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                    <div className="page-gradient-header"></div>
                    <div className="content-container">
                        {/* Breadcrumb Skeleton */}
                        <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
                            <SkeletonLoader width="150px" height="1rem" />
                        </div>

                        {/* Title Skeleton */}
                        <div className="page-title-section">
                            <SkeletonLoader variant="title" width="200px" />
                            <SkeletonLoader variant="text" width="300px" />
                        </div>

                        <div className="application-form">
                            {/* Profile Photo Skeleton */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <span className="icon">📸</span> <SkeletonLoader width="150px" height="1.5rem" style={{ display: 'inline-block' }} />
                                </h3>
                                <div className="profile-photo-container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <SkeletonLoader width="100px" height="100px" style={{ borderRadius: '50%' }} />
                                    <SkeletonLoader width="120px" height="2.5rem" />
                                </div>
                            </div>

                            {/* Personal Info Skeleton */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <span className="icon">👤</span> <SkeletonLoader width="200px" height="1.5rem" style={{ display: 'inline-block' }} />
                                </h3>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                </div>
                                <div className="form-grid-2 mt-4">
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Skeleton */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <span className="icon">📞</span> <SkeletonLoader width="200px" height="1.5rem" style={{ display: 'inline-block' }} />
                                </h3>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                </div>
                            </div>

                            {/* Address Skeleton */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <span className="icon">📍</span> <SkeletonLoader width="250px" height="1.5rem" style={{ display: 'inline-block' }} />
                                </h3>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                    <div className="form-group">
                                        <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                        <SkeletonLoader width="100%" height="2.5rem" />
                                    </div>
                                </div>
                                <div className="form-grid-3 mt-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="form-group">
                                            <SkeletonLoader width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                            <SkeletonLoader width="100%" height="2.5rem" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions-footer">
                                <SkeletonLoader width="100px" height="2.5rem" />
                                <SkeletonLoader width="150px" height="2.5rem" />
                            </div>
                        </div>
                    </div>
                </div>
                <NOCFooter />
            </div>
        );
    }

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

            <PublicHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Dashboard</Link>
                        <span className="separator">›</span>
                        <span className="current">User Profile</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">User Profile</h1>
                        <p className="page-subtitle">Manage your personal information and preferences</p>
                    </div>

                    <form onSubmit={handleSubmit} className="application-form">

                        {/* Profile Photo Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">📸</span> Profile Photo
                            </h3>
                            <div className="profile-photo-container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div className="photo-preview" style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: '#eff6ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    color: '#1e3a8a',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    {profilePictureUrl ? (
                                        <img
                                            src={profilePictureUrl}
                                            alt="Profile"
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                console.error('Image failed to load:', profilePictureUrl);
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <span style={{ display: profilePictureUrl ? 'none' : 'flex' }}>
                                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                                    </span>
                                </div>
                                <div>
                                    <div className="file-upload-wrapper">
                                        <label htmlFor="profile-upload" className="btn-secondary" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                                            Change Photo
                                        </label>
                                        <input
                                            id="profile-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <span className="help-text">Recommended: Square image, max 2MB.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">👤</span> Personal Information
                            </h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.firstName}
                                        readOnly
                                        disabled
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.lastName}
                                        readOnly
                                        disabled
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                            </div>
                            <div className="form-grid-2 mt-4">
                                <div className="form-group">
                                    <label>Security Question</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={userDetails?.securityQuestion || ''}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>User Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={userDetails?.userType || ''}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company Details Section - NEW */}
                        {companyDetails && (
                            <div className="form-section">
                                <h3 className="section-title">
                                    <span className="icon">🏢</span> Company Details
                                </h3>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyDetails.companyName || ''}
                                            readOnly
                                            style={{ backgroundColor: '#f9fafb' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Company Type</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyDetails.companyType || ''}
                                            readOnly
                                            style={{ backgroundColor: '#f9fafb' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-grid-2 mt-4">
                                    <div className="form-group">
                                        <label>GST Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyDetails.gstNumber || ''}
                                            readOnly
                                            style={{ backgroundColor: '#f9fafb' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>PAN Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyDetails.panNumber || ''}
                                            readOnly
                                            style={{ backgroundColor: '#f9fafb' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group mt-4">
                                    <label>Registered Address</label>
                                    <textarea
                                        className="form-control"
                                        value={companyDetails.fullRegisteredAddress || `${companyDetails.registeredAddress?.addressLine1}, ${companyDetails.registeredAddress?.district}, ${companyDetails.registeredAddress?.state} - ${companyDetails.registeredAddress?.pincode}`}
                                        readOnly
                                        rows="2"
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Contact Details Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">📞</span> Contact Details
                            </h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            readOnly
                                            style={{ backgroundColor: '#f9fafb' }}
                                        />
                                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {userDetails?.emailVerified && (
                                                <span style={{ color: '#059669', fontSize: '1.2rem' }} title="Verified">✓</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => navigate('/noc/update-contact')}
                                                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={formData.mobile}
                                            readOnly
                                            style={{ backgroundColor: '#f9fafb' }}
                                        />
                                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {userDetails?.phoneVerified && (
                                                <span style={{ color: '#059669', fontSize: '1.2rem' }} title="Verified">✓</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => navigate('/noc/update-contact')}
                                                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <span className="icon">📍</span> Personal/Communication Address
                            </h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Address Line 1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.address.line1}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.address.line2}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                            </div>
                            <div className="form-grid-3 mt-4">
                                <div className="form-group">
                                    <label>District</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.address.district}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.address.state}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pin Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.address.pincode}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions-footer">
                            <button type="button" className="btn-secondary" onClick={() => navigate('/noc/dashboard')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Save User Profile
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default UserProfile;
