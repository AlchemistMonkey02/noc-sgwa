import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/noc-portal.css';
import {
    APPLICATION_TYPE_OPTIONS,
    APPLICATION_TYPES,
    WATER_QUALITY_TYPES,
    AREA_TYPE_CATEGORIES,
    calculateCharges
} from './utils/waterChargeRates';


const WaterBudgetCalculator = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        applicationType: '',
        applicationCategory: '',
        waterQuality: '',
        areaType: '',
        dailyRequirement: '',
        operatingMode: 'days', // 'days' or 'hours'
        operatingDays: '',
        operatingHours: ''
    });

    const [yearlyRequirement, setYearlyRequirement] = useState(0);
    const [charges, setCharges] = useState(null);

    // Get available categories based on selected application type
    const availableCategories = formData.applicationType
        ? APPLICATION_TYPES[formData.applicationType]
        : [];

    // Auto-calculate yearly requirement whenever relevant fields change
    useEffect(() => {
        const daily = parseFloat(formData.dailyRequirement) || 0;
        const days = parseFloat(formData.operatingDays) || 0;
        const hours = parseFloat(formData.operatingHours) || 0;

        let yearly = 0;

        if (formData.operatingMode === 'days') {
            // Yearly = Daily × Days per Year
            yearly = daily * days;
        } else if (formData.operatingMode === 'hours') {
            // Adjusted Daily = Daily × (Hours / 24)
            // Yearly = Adjusted Daily × Days per Year
            const adjustedDaily = daily * (hours / 24);
            yearly = adjustedDaily * days;
        }

        setYearlyRequirement(yearly);
    }, [
        formData.dailyRequirement,
        formData.operatingDays,
        formData.operatingHours,
        formData.operatingMode
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset category when type changes
            ...(name === 'applicationType' && { applicationCategory: '' })
        }));
    };

    const handleCalculate = (e) => {
        e.preventDefault();

        // Validate all required fields
        if (!formData.applicationType || !formData.applicationCategory ||
            !formData.waterQuality || !formData.areaType ||
            !formData.dailyRequirement || !formData.operatingDays) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.operatingMode === 'hours' && !formData.operatingHours) {
            alert('Please enter operating hours per day');
            return;
        }

        // Calculate charges
        const chargeResults = calculateCharges({
            applicationType: formData.applicationType,
            applicationCategory: formData.applicationCategory,
            waterQuality: formData.waterQuality,
            areaType: formData.areaType,
            yearlyRequirement: yearlyRequirement
        });

        setCharges(chargeResults);
    };

    const handleReset = () => {
        setFormData({
            applicationType: '',
            applicationCategory: '',
            waterQuality: '',
            areaType: '',
            dailyRequirement: '',
            operatingMode: 'days',
            operatingDays: '',
            operatingHours: ''
        });
        setYearlyRequirement(0);
        setCharges(null);
    };

    return (
        <div className="noc-login-page" style={{ background: '#F9FAFB', minHeight: '100vh' }}>
            {/* Enhanced Header */}
            <header className="noc-login-header" style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #0c4a6e 100%)',
                boxShadow: '0 4px 20px rgba(30, 58, 138, 0.15)',
                borderBottom: '4px solid #F97316',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '400px',
                    height: '100%',
                    background: 'radial-gradient(circle at top right, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}></div>

                <div className="header-content" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="logo-section" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        padding: '1.5rem 3rem'
                    }}>
                        {/* Water Droplet Icon with Glow */}
                        <div className="emblem" style={{
                            fontSize: '3.5rem',
                            filter: 'drop-shadow(0 4px 12px rgba(56, 189, 248, 0.4))',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}>💧</div>

                        <div className="header-text">
                            <h1 className="dept-name" style={{
                                fontSize: '1.75rem',
                                fontWeight: '800',
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                margin: 0,
                                marginBottom: '0.5rem',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                            }}>
                                Rajasthan Ground Water(Conservation & Management) Authority
                            </h1>
                            <p className="dept-subtitle" style={{
                                fontSize: '1.05rem',
                                fontWeight: '600',
                                color: 'rgba(255, 255, 255, 0.9)',
                                margin: 0,
                                letterSpacing: '0.3px'
                            }}>
                                
                            </p>
                        </div>
                    </div>
                </div>
            </header>


            <div className="noc-login-container" style={{ width: '100%', marginTop: '0', padding: '2rem 3rem', maxWidth: '100%' }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/noc/dashboard')}
                    className="back-btn"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        border: '2px solid #E2E8F0',
                        borderRadius: '0.5rem',
                        color: '#1E3A8A',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#F8FAFC';
                        e.target.style.borderColor = '#1E3A8A';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                >
                    <span>←</span> Back to Dashboard
                </button>

                <div className="noc-card" style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    border: '1px solid #E2E8F0',
                    maxWidth: '100%'

                }}>
                    {/* Card Header */}
                    <div className="card-header" style={{
                        background: '#F8FAFC',
                        borderRadius: '0.75rem 0.75rem 0 0',
                        padding: '2rem',
                        borderBottom: '3px solid #F97316'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '0.5rem',
                                background: '#1E3A8A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem'
                            }}>
                                💧
                            </div>
                            <div>
                                <h2 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    color: '#0c4a6e',
                                    marginBottom: '0.25rem',
                                    margin: 0
                                }}>
                                    Water Budget Calculator
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
                                    Calculate your water requirements and associated charges based on SGWA rates
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleCalculate} style={{ padding: '2.5rem' }}>
                        {/* Section 1: Application Information */}
                        <fieldset style={{
                            border: '2px solid #E2E8F0',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            background: 'white'
                        }}>
                            <legend style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#1E3A8A',
                                padding: '0 0.75rem',
                                background: 'white'
                            }}>
                                📋 Application Information
                            </legend>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#475569',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Application Type <span className="required" style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <select
                                        name="applicationType"
                                        value={formData.applicationType}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            background: '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.95rem',
                                            color: '#1E293B',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                            e.target.style.borderColor = '#1E3A8A';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                            e.target.style.background = 'white';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = '#F8FAFC';
                                        }}
                                    >
                                        <option value="">--Select--</option>
                                        {APPLICATION_TYPE_OPTIONS.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#475569',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Application Type Category <span className="required" style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <select
                                        name="applicationCategory"
                                        value={formData.applicationCategory}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.applicationType}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            background: formData.applicationType ? '#F8FAFC' : '#F1F5F9',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.95rem',
                                            color: '#1E293B',
                                            transition: 'all 0.2s',
                                            cursor: formData.applicationType ? 'pointer' : 'not-allowed'
                                        }}
                                        onFocus={(e) => {
                                            if (formData.applicationType) {
                                                e.target.style.outline = 'none';
                                                e.target.style.borderColor = '#1E3A8A';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                                e.target.style.background = 'white';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = formData.applicationType ? '#F8FAFC' : '#F1F5F9';
                                        }}
                                    >
                                        <option value="">--Select--</option>
                                        {availableCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 2: Location Details */}
                        <fieldset style={{
                            border: '2px solid #E2E8F0',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            background: 'white'
                        }}>
                            <legend style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#1E3A8A',
                                padding: '0 0.75rem',
                                background: 'white'
                            }}>
                                📍 Location Details
                            </legend>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#475569',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Water Quality Type <span className="required" style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <select
                                        name="waterQuality"
                                        value={formData.waterQuality}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            background: '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.95rem',
                                            color: '#1E293B',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                            e.target.style.borderColor = '#1E3A8A';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                            e.target.style.background = 'white';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = '#F8FAFC';
                                        }}
                                    >
                                        <option value="">--Select--</option>
                                        {WATER_QUALITY_TYPES.map((quality, index) => (
                                            <option key={index} value={index.toString()}>
                                                {quality.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#475569',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Area Type Category <span className="required" style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <select
                                        name="areaType"
                                        value={formData.areaType}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            background: '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.95rem',
                                            color: '#1E293B',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                            e.target.style.borderColor = '#1E3A8A';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                            e.target.style.background = 'white';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = '#F8FAFC';
                                        }}
                                    >
                                        <option value="">--Select--</option>
                                        {AREA_TYPE_CATEGORIES.map((area, index) => (
                                            <option key={index} value={index.toString()}>
                                                {area.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 3: Water Requirement Details */}
                        <fieldset style={{
                            border: '2px solid #E2E8F0',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            background: 'white'
                        }}>
                            <legend style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#1E3A8A',
                                padding: '0 0.75rem',
                                background: 'white'
                            }}>
                                💦 Water Requirement Details
                            </legend>

                            <div style={{ marginTop: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#475569',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Daily Water Requirement (KLD) <span className="required" style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="dailyRequirement"
                                        value={formData.dailyRequirement}
                                        onChange={handleInputChange}
                                        placeholder="Enter daily requirement in KLD"
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            background: '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.95rem',
                                            color: '#1E293B',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                            e.target.style.borderColor = '#1E3A8A';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                            e.target.style.background = 'white';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = '#F8FAFC';
                                        }}
                                    />
                                    <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                        KLD = Kilo Liters per Day (1 KLD = 1000 liters/day)
                                    </small>
                                </div>

                                {/* Operating Mode Selection */}
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#475569',
                                        marginBottom: '0.75rem'
                                    }}>
                                        Operating Mode <span className="required" style={{ color: '#EF4444' }}>*</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="operatingMode"
                                                value="days"
                                                checked={formData.operatingMode === 'days'}
                                                onChange={handleInputChange}
                                                style={{ cursor: 'pointer', accentColor: '#1E3A8A' }}
                                            />
                                            <span style={{ color: '#475569', fontWeight: '500' }}>Days per Year</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="operatingMode"
                                                value="hours"
                                                checked={formData.operatingMode === 'hours'}
                                                onChange={handleInputChange}
                                                style={{ cursor: 'pointer', accentColor: '#1E3A8A' }}
                                            />
                                            <span style={{ color: '#475569', fontWeight: '500' }}>Hours per Day</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Conditional Inputs based on Operating Mode */}
                                {formData.operatingMode === 'days' && (
                                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: '#475569',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Operating Days per Year <span className="required" style={{ color: '#EF4444' }}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="operatingDays"
                                            value={formData.operatingDays}
                                            onChange={handleInputChange}
                                            placeholder="Enter operating days per year"
                                            required
                                            min="1"
                                            max="365"
                                            style={{
                                                width: '100%',
                                                padding: '0.625rem',
                                                background: '#F8FAFC',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.95rem',
                                                color: '#1E293B',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.outline = 'none';
                                                e.target.style.borderColor = '#1E3A8A';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                                e.target.style.background = 'white';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#E2E8F0';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.background = '#F8FAFC';
                                            }}
                                        />
                                        <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                            Maximum 365 days
                                        </small>
                                    </div>
                                )}

                                {formData.operatingMode === 'hours' && (
                                    <>
                                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#475569',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Operating Hours per Day <span className="required" style={{ color: '#EF4444' }}>*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="operatingHours"
                                                value={formData.operatingHours}
                                                onChange={handleInputChange}
                                                placeholder="Enter operating hours per day"
                                                required
                                                min="1"
                                                max="24"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.625rem',
                                                    background: '#F8FAFC',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.95rem',
                                                    color: '#1E293B',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.outline = 'none';
                                                    e.target.style.borderColor = '#1E3A8A';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                                    e.target.style.background = 'white';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#E2E8F0';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.style.background = '#F8FAFC';
                                                }}
                                            />
                                            <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                                Maximum 24 hours
                                            </small>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#475569',
                                                marginBottom: '0.5rem'
                                            }}>
                                                Operating Days per Year <span className="required" style={{ color: '#EF4444' }}>*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="operatingDays"
                                                value={formData.operatingDays}
                                                onChange={handleInputChange}
                                                placeholder="Enter operating days per year"
                                                required
                                                min="1"
                                                max="365"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.625rem',
                                                    background: '#F8FAFC',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.95rem',
                                                    color: '#1E293B',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.outline = 'none';
                                                    e.target.style.borderColor = '#1E3A8A';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                                                    e.target.style.background = 'white';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#E2E8F0';
                                                    e.target.style.boxShadow = 'none';
                                                    e.target.style.background = '#F8FAFC';
                                                }}
                                            />
                                            <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                                Maximum 365 days
                                            </small>
                                        </div>
                                    </>
                                )}

                                {/* Auto-calculated Yearly Requirement */}
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                                    borderRadius: '0.75rem',
                                    border: '2px solid #1E3A8A',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                                Total Yearly Requirement
                                            </div>
                                            <div style={{
                                                color: '#0c4a6e',
                                                fontWeight: '800',
                                                fontSize: '2.25rem',
                                                letterSpacing: '-0.5px',
                                                lineHeight: 1
                                            }}>
                                                {yearlyRequirement.toFixed(2)} <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#64748b' }}>KLY</span>
                                            </div>
                                            <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                                KLY = Kilo Liters per Year (cum/year)
                                            </small>
                                        </div>
                                        <div style={{
                                            fontSize: '3.5rem',
                                            opacity: 0.15,
                                            color: '#1E3A8A'
                                        }}>
                                            💧
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button
                                type="button"
                                onClick={handleReset}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'white',
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    color: '#64748b',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#F8FAFC';
                                    e.target.style.borderColor = '#CBD5E1';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'white';
                                    e.target.style.borderColor = '#E2E8F0';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: 'linear-gradient(to right, #1E3A8A, #0C4A6E)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                                    e.target.style.background = 'linear-gradient(to right, #0C4A6E, #075985)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                    e.target.style.background = 'linear-gradient(to right, #1E3A8A, #0C4A6E)';
                                }}
                            >
                                Calculate Charges
                            </button>
                        </div>
                    </form>

                    {/* Results Section */}
                    {charges && (
                        <div style={{
                            padding: '2.5rem',
                            paddingTop: '0',
                            borderTop: '2px solid #F1F5F9'
                        }}>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#0c4a6e',
                                marginBottom: '1.5rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '2px solid #F97316'
                            }}>
                                Calculation Results
                            </h3>

                            {/* Summary Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                <div style={{
                                    background: '#EFF6FF',
                                    padding: '1.25rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #DBEAFE',
                                    borderTop: '3px solid #1E3A8A'
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        Application
                                    </div>
                                    <div style={{ color: '#0c4a6e', fontWeight: '700', fontSize: '1.1rem' }}>
                                        {charges.applicationType}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {charges.applicationCategory}
                                    </div>
                                </div>

                                <div style={{
                                    background: '#FEF3C7',
                                    padding: '1.25rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #FDE68A',
                                    borderTop: '3px solid #F97316'
                                }}>
                                    <div style={{ color: '#78350F', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        Yearly Requirement
                                    </div>
                                    <div style={{ color: '#78350F', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                                        {charges.yearlyRequirement.toFixed(2)} KLY
                                    </div>
                                </div>

                                <div style={{
                                    background: '#F0FDF4',
                                    padding: '1.25rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #BBF7D0',
                                    borderTop: '3px solid #10B981'
                                }}>
                                    <div style={{ color: '#065F46', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        NOC Validity
                                    </div>
                                    <div style={{ color: '#065F46', fontWeight: '800', fontSize: '1.5rem' }}>
                                        {charges.nocDuration} Years
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Breakdown Table */}
                            <div style={{
                                background: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '0.5rem',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    background: '#F8FAFC',
                                    padding: '1rem 1.5rem',
                                    borderBottom: '2px solid #E2E8F0'
                                }}>
                                    <h4 style={{ margin: 0, color: '#1E3A8A', fontWeight: '700', fontSize: '1.1rem' }}>
                                        Charge Breakdown
                                    </h4>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            <th style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'left',
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#475569',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '1px solid #E2E8F0'
                                            }}>
                                                Parameter
                                            </th>
                                            <th style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'right',
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                color: '#475569',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderBottom: '1px solid #E2E8F0'
                                            }}>
                                                Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontSize: '0.95rem'
                                            }}>
                                                Base Charge (per KLD)
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'right',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontWeight: '600',
                                                fontSize: '0.95rem'
                                            }}>
                                                ₹ {charges.baseRate.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontSize: '0.95rem'
                                            }}>
                                                Area Type Multiplier ({AREA_TYPE_CATEGORIES[parseInt(formData.areaType)]?.label || formData.areaType})
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'right',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontWeight: '600',
                                                fontSize: '0.95rem'
                                            }}>
                                                {charges.areaMultiplier.toFixed(2)}x
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontSize: '0.95rem'
                                            }}>
                                                Water Quality Multiplier ({WATER_QUALITY_TYPES[parseInt(formData.waterQuality)]?.label || formData.waterQuality})
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'right',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontWeight: '600',
                                                fontSize: '0.95rem'
                                            }}>
                                                {charges.waterQualityMultiplier.toFixed(2)}x
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontSize: '0.95rem'
                                            }}>
                                                Effective Rate (per KLD)
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'right',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E3A8A',
                                                fontWeight: '700',
                                                fontSize: '1rem'
                                            }}>
                                                ₹ {charges.effectiveRatePerKLD.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E293B',
                                                fontSize: '0.95rem'
                                            }}>
                                                Annual Water Abstraction Charge
                                            </td>
                                            <td style={{
                                                padding: '1rem 1.5rem',
                                                textAlign: 'right',
                                                borderBottom: '1px solid #F1F5F9',
                                                color: '#1E3A8A',
                                                fontWeight: '700',
                                                fontSize: '1.05rem'
                                            }}>
                                                ₹ {charges.oneYearCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        <tr style={{ background: '#F0F9FF' }}>
                                            <td style={{
                                                padding: '1.25rem 1.5rem',
                                                color: '#0c4a6e',
                                                fontSize: '1.05rem',
                                                fontWeight: '700'
                                            }}>
                                                Total Charges ({charges.nocValidity} years)
                                            </td>
                                            <td style={{
                                                padding: '1.25rem 1.5rem',
                                                textAlign: 'right',
                                                color: '#0c4a6e',
                                                fontWeight: '800',
                                                fontSize: '1.5rem'
                                            }}>
                                                ₹ {charges.totalCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statutory Notice */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: '#FFF7ED',
                    border: '2px solid #FDBA74',
                    borderRadius: '0.5rem'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '1.5rem', color: '#F97316' }}>⚠️</div>
                        <div>
                            <h4 style={{
                                margin: '0 0 0.5rem 0',
                                color: '#9A3412',
                                fontSize: '1rem',
                                fontWeight: '700'
                            }}>
                                Important Note
                            </h4>
                            <p style={{
                                margin: 0,
                                color: '#78350F',
                                fontSize: '0.9rem',
                                lineHeight: '1.6'
                            }}>
                                These calculations are provided for reference purposes only. Actual charges may vary based on official SGWA rates and policies.
                                Please consult the official SGWA documentation or contact the department for authoritative information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterBudgetCalculator;
