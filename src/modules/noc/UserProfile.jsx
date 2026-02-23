import React, { useState, useEffect, useRef } from 'react';
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
    const sectionRefs = useRef([]);

    const addRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('nd-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => {
            sectionRefs.current.forEach((el) => el && observer.unobserve(el));
        };
    }, [loading]);

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
            state: 'Rajasthan',
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

            {/* Background Decor */}
            <div className="nd-premium-bg">
                <div className="nd-shape nd-shape-1"></div>
                <div className="nd-shape nd-shape-2"></div>
                <div className="nd-shape nd-shape-3"></div>
            </div>

            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

            <PublicHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb nd-animate" ref={addRef}>
                        <Link to="/noc/dashboard">Dashboard</Link>
                        <span className="separator">›</span>
                        <span className="current">User Profile</span>
                    </div>

                    <div className="page-title-section nd-animate" ref={addRef}>
                        <h1 className="page-main-title">User Profile</h1>
                        <p className="page-subtitle">Welcome back! Manage your <span className="nd-user-highlight">Identity</span> and Preferences</p>
                    </div>

                    <div className="application-form">

                        {/* Profile Photo Section */}
                        <div className="dashboard-card nd-animate" ref={addRef}>
                            <div className="card-title-bar">
                                <h3 className="card-main-title">📸 Identity Photo</h3>
                            </div>
                            <div className="card-content-area">
                                <div className="profile-photo-container" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                                    <div className="photo-preview-wrapper dashboard-stat-card" style={{
                                        padding: '10px',
                                        borderRadius: '50%',
                                        minHeight: 'auto',
                                        width: '140px',
                                        height: '140px'
                                    }}>
                                        <div className="photo-preview" style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            background: '#eff6ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '3rem',
                                            color: '#1e3a8a',
                                            overflow: 'hidden',
                                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
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
                                            <span style={{ display: profilePictureUrl ? 'none' : 'flex', fontWeight: 900 }}>
                                                {formData.firstName?.[0]}{formData.lastName?.[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="file-upload-wrapper">
                                            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#1e293b' }}>Official Personal Photo</h4>
                                            <label htmlFor="profile-upload" className="nd-btn-primary-sm" style={{ display: 'inline-block', marginBottom: '0.75rem', textAlign: 'center' }}>
                                                Update Photo
                                            </label>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <p className="help-text" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>High quality JPEG or PNG recommended (Max 2MB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="dashboard-card nd-animate" ref={addRef}>
                            <div className="card-title-bar">
                                <h3 className="card-main-title">👤 Personal Information</h3>
                            </div>
                            <div className="card-content-area">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.firstName}
                                            readOnly
                                            disabled
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.lastName}
                                            readOnly
                                            disabled
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 700 }}
                                        />
                                    </div>
                                </div>
                                <div className="form-grid-2 mt-4">
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Security Question</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={userDetails?.securityQuestion || ''}
                                            readOnly
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 600 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>User Classification</label>
                                        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', fontWeight: 800, textAlign: 'center' }}>
                                            {userDetails?.userType || 'APPLICANT'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Details Section */}
                        {companyDetails && (
                            <div className="dashboard-card nd-animate" ref={addRef}>
                                <div className="card-title-bar">
                                    <h3 className="card-main-title">🏢 Organization Details</h3>
                                </div>
                                <div className="card-content-area">
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Legal Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={companyDetails.companyName || ''}
                                                readOnly
                                                style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 800, color: '#1e3a8a' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Entity Type</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={companyDetails.companyType || ''}
                                                readOnly
                                                style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 600 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-grid-2 mt-6">
                                        <div className="form-group">
                                            <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>GST Identification Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={companyDetails.gstNumber || ''}
                                                readOnly
                                                style={{ background: 'rgba(254, 252, 232, 0.5)', border: '1px solid #fde047', borderRadius: '12px', padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Permanent Account Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={companyDetails.panNumber || ''}
                                                readOnly
                                                style={{ background: 'rgba(254, 252, 232, 0.5)', border: '1px solid #fde047', borderRadius: '12px', padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mt-6">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Registered Headquarters Address</label>
                                        <textarea
                                            className="form-control"
                                            value={companyDetails.fullRegisteredAddress || `${companyDetails.registeredAddress?.addressLine1}, ${companyDetails.registeredAddress?.district}, ${companyDetails.registeredAddress?.state} - ${companyDetails.registeredAddress?.pincode}`}
                                            readOnly
                                            rows="2"
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 500, resize: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact Details Section */}
                        <div className="dashboard-card nd-animate" ref={addRef}>
                            <div className="card-title-bar">
                                <h3 className="card-main-title">📞 Verification & Contact</h3>
                            </div>
                            <div className="card-content-area">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Verified Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.email}
                                                readOnly
                                                style={{ background: 'rgba(240, 253, 244, 0.5)', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', fontWeight: 600 }}
                                            />
                                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {userDetails?.emailVerified && (
                                                    <span style={{ color: '#059669', fontSize: '1.25rem', display: 'flex', alignItems: 'center' }} title="Verified Official Email">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/noc/update-contact')}
                                                    className="nd-table-view-btn"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                >
                                                    Modify
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Verified Mobile Link</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={formData.mobile}
                                                readOnly
                                                style={{ background: 'rgba(240, 253, 244, 0.5)', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', fontWeight: 600 }}
                                            />
                                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {userDetails?.phoneVerified && (
                                                    <span style={{ color: '#059669', fontSize: '1.25rem', display: 'flex', alignItems: 'center' }} title="Verified Official Mobile">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/noc/update-contact')}
                                                    className="nd-table-view-btn"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                >
                                                    Modify
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="dashboard-card nd-animate" ref={addRef}>
                            <div className="card-title-bar">
                                <h3 className="card-main-title">📍 Official Communication Address</h3>
                            </div>
                            <div className="card-content-area">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Building / Street</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address.line1}
                                            readOnly
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 500 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Locality / Area</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address.line2}
                                            readOnly
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 500 }}
                                        />
                                    </div>
                                </div>
                                <div className="form-grid-3 mt-6">
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>District / City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address.district}
                                            readOnly
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>State / Union Territory</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address.state}
                                            readOnly
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="stat-label-text" style={{ marginBottom: '0.75rem', display: 'block' }}>Postal Index Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address.pincode}
                                            readOnly
                                            style={{ background: 'rgba(248, 250, 252, 0.5)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontWeight: 800, letterSpacing: '0.1em' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions-footer nd-animate" ref={addRef}>
                            <button type="button" className="nd-btn-outline-sm" onClick={() => navigate('/noc/dashboard')} style={{ padding: '12px 40px' }}>
                                Back to Portal
                            </button>
                            <button type="button" className="nd-btn-primary-sm" onClick={handleSubmit} style={{ padding: '12px 40px' }}>
                                Synchronize Profile
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserProfile;
