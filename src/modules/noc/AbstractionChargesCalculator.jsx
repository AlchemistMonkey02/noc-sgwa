// Ground Water Abstraction Charges Calculator
// Calculate abstraction charges for NOC applications

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import { getDistricts, getBlocksForDistrict, getBlockCategory } from './utils/blockClassification';
import { applicationTypes, waterQualityTypes, states } from './utils/formData';
import './styles/noc-portal.css';

const AbstractionChargesCalculator = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        applicationType: '',
        waterQualityType: '',
        areaTypeCategory: '',
        quantityKLD: '',
        quantityKLY: '',
        state: '',
        district: '',
        block: '',
        nocDuration: 5 // Default 5 years
    });
    const [errors, setErrors] = useState({});
    const [availableBlocks, setAvailableBlocks] = useState([]);
    const [calculatedCharges, setCalculatedCharges] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('nocUser');
        if (!userData) {
            navigate('/noc/login');
        }
    }, [navigate]);

    // Load blocks when district changes
    useEffect(() => {
        if (formData.district) {
            const blocks = getBlocksForDistrict(formData.state, formData.district);
            setAvailableBlocks(blocks);
        } else {
            setAvailableBlocks([]);
        }
    }, [formData.district, formData.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear calculated charges when form changes
        if (calculatedCharges) {
            setCalculatedCharges(null);
            setSubmitted(false);
        }

        // Auto-calculate KLY from KLD (assuming 365 days/year)
        if (name === 'quantityKLD' && value) {
            const kld = parseFloat(value) || 0;
            const kly = kld * 365;
            setFormData(prev => ({
                ...prev,
                quantityKLY: kly.toFixed(2)
            }));
        }

        // Auto-calculate KLD from KLY
        if (name === 'quantityKLY' && value) {
            const kly = parseFloat(value) || 0;
            const kld = kly / 365;
            setFormData(prev => ({
                ...prev,
                quantityKLD: kld.toFixed(2)
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.applicationType) {
            newErrors.applicationType = 'Application Type is required';
        }
        if (!formData.waterQualityType) {
            newErrors.waterQualityType = 'Water Quality Type is required';
        }
        if (!formData.areaTypeCategory) {
            newErrors.areaTypeCategory = 'Area Type Category is required';
        }
        if (!formData.quantityKLD || parseFloat(formData.quantityKLD) <= 0) {
            newErrors.quantityKLD = 'Quantity (KLD) is required and must be greater than 0';
        }
        if (!formData.quantityKLY || parseFloat(formData.quantityKLY) <= 0) {
            newErrors.quantityKLY = 'Quantity (KLY) is required and must be greater than 0';
        }
        if (!formData.state) {
            newErrors.state = 'State is required';
        }
        if (!formData.district) {
            newErrors.district = 'District is required';
        }
        if (!formData.block) {
            newErrors.block = 'Block is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateCharges = () => {
        if (!validateForm()) {
            return;
        }

        // Get block category
        const blockCategory = getBlockCategory(formData.district, formData.block);
        const categoryName = blockCategory ? blockCategory.name : formData.areaTypeCategory || 'Safe';

        // Ground Water Abstraction Charge Rates (per KLD per year)
        // Rates vary by block category and application type
        const chargeRates = {
            'Safe': {
                'Industry': 5.0,
                'Mining': 4.0,
                'Infrastructure': 4.0,
                'Other': 4.0
            },
            'Semi-Critical': {
                'Industry': 7.0,
                'Mining': 6.0,
                'Infrastructure': 6.0,
                'Other': 6.0
            },
            'Critical': {
                'Industry': 10.0,
                'Mining': 8.0,
                'Infrastructure': 8.0,
                'Other': 8.0
            },
            'Over-Exploited': {
                'Industry': 15.0,
                'Mining': 12.0,
                'Infrastructure': 12.0,
                'Other': 12.0
            }
        };

        // Determine application category
        let appCategory = 'Other';
        const appType = formData.applicationType.toLowerCase();
        if (appType.includes('mining')) {
            appCategory = 'Mining';
        } else if (appType.includes('industry') || appType.includes('industrial')) {
            appCategory = 'Industry';
        } else if (appType.includes('infrastructure')) {
            appCategory = 'Infrastructure';
        }

        // Get rate based on block category (use areaTypeCategory as fallback)
        const categoryKey = categoryName || formData.areaTypeCategory || 'Safe';
        const rate = chargeRates[categoryKey]?.[appCategory] || chargeRates['Safe'][appCategory];

        const quantityKLD = parseFloat(formData.quantityKLD) || 0;
        const quantityKLY = parseFloat(formData.quantityKLY) || 0;
        const duration = parseInt(formData.nocDuration) || 5;

        // Calculate charges
        const oneYearCharge = rate * quantityKLD * 365; // Rate per KLD per year
        const totalCharge = oneYearCharge * duration;

        // Get NOC validity based on block category
        const validityYears = blockCategory ? blockCategory.validityYears : 5;

        setCalculatedCharges({
            blockCategory: categoryName,
            rate: rate,
            quantityKLD: quantityKLD,
            quantityKLY: quantityKLY,
            oneYearCharge: oneYearCharge,
            totalCharge: totalCharge,
            duration: duration,
            validityYears: validityYears,
            chargeDescription: `Ground Water Abstraction Charges (${categoryName} Block)`
        });

        setSubmitted(true);
    };

    const handleReset = () => {
        setFormData({
            applicationType: '',
            waterQualityType: '',
            areaTypeCategory: '',
            quantityKLD: '',
            quantityKLY: '',
            state: '',
            district: '',
            block: '',
            nocDuration: 5
        });
        setErrors({});
        setCalculatedCharges(null);
        setSubmitted(false);
    };

    // Area Type Categories based on block categories
    const areaTypeCategories = [
        'Safe',
        'Semi-Critical',
        'Critical',
        'Over-Exploited',
        'Salinity Affected'
    ];

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-card">
                    <h1 style={{ 
                        color: 'var(--cgwa-primary)', 
                        marginBottom: '30px',
                        fontSize: '2rem',
                        borderBottom: '3px solid var(--cgwa-primary)',
                        paddingBottom: '15px'
                    }}>
                        Know Your Ground Water Abstraction / Restoration Charges
                    </h1>

                    <form onSubmit={(e) => { e.preventDefault(); calculateCharges(); }}>
                        {/* Application Information */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 className="noc-section-title">Application Information</h3>
                            <div className="noc-form-row">
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Application Type</label>
                                    <select
                                        name="applicationType"
                                        className={`noc-form-control ${errors.applicationType ? 'error' : ''}`}
                                        value={formData.applicationType}
                                        onChange={handleChange}
                                    >
                                        <option value="">--Select--</option>
                                        {applicationTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.applicationType && <span className="noc-form-error">{errors.applicationType}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Location Detail */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 className="noc-section-title">Location Detail</h3>
                            <div className="noc-form-row two-col">
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Water Quality Type</label>
                                    <select
                                        name="waterQualityType"
                                        className={`noc-form-control ${errors.waterQualityType ? 'error' : ''}`}
                                        value={formData.waterQualityType}
                                        onChange={handleChange}
                                    >
                                        <option value="">--Select--</option>
                                        {waterQualityTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.waterQualityType && <span className="noc-form-error">{errors.waterQualityType}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Area Type Category</label>
                                    <select
                                        name="areaTypeCategory"
                                        className={`noc-form-control ${errors.areaTypeCategory ? 'error' : ''}`}
                                        value={formData.areaTypeCategory}
                                        onChange={handleChange}
                                    >
                                        <option value="">--Select--</option>
                                        {areaTypeCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {errors.areaTypeCategory && <span className="noc-form-error">{errors.areaTypeCategory}</span>}
                                </div>
                            </div>

                            <div className="noc-form-row two-col" style={{ marginTop: '20px' }}>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">State</label>
                                    <select
                                        name="state"
                                        className={`noc-form-control ${errors.state ? 'error' : ''}`}
                                        value={formData.state}
                                        onChange={handleChange}
                                    >
                                        <option value="">--Select--</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {errors.state && <span className="noc-form-error">{errors.state}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">District</label>
                                    <select
                                        name="district"
                                        className={`noc-form-control ${errors.district ? 'error' : ''}`}
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled={!formData.state}
                                    >
                                        <option value="">--Select--</option>
                                        {formData.state && getDistricts(formData.state).map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                    {errors.district && <span className="noc-form-error">{errors.district}</span>}
                                </div>
                            </div>

                            <div className="noc-form-row" style={{ marginTop: '20px' }}>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Block</label>
                                    <select
                                        name="block"
                                        className={`noc-form-control ${errors.block ? 'error' : ''}`}
                                        value={formData.block}
                                        onChange={handleChange}
                                        disabled={!formData.district}
                                    >
                                        <option value="">--Select--</option>
                                        {availableBlocks.map(block => (
                                            <option key={block} value={block}>{block}</option>
                                        ))}
                                    </select>
                                    {errors.block && <span className="noc-form-error">{errors.block}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Quantity Detail */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 className="noc-section-title">Quantity Detail</h3>
                            <div className="noc-form-row two-col">
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantityKLD"
                                        className={`noc-form-control ${errors.quantityKLD ? 'error' : ''}`}
                                        value={formData.quantityKLD}
                                        onChange={handleChange}
                                        placeholder="Enter quantity"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.quantityKLD && <span className="noc-form-error">{errors.quantityKLD}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">KLD (Kilo Liter/Day)</label>
                                    <input
                                        type="number"
                                        className="noc-form-control"
                                        value={formData.quantityKLD}
                                        readOnly
                                        style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                                    />
                                    <span className="noc-form-help">Same as Quantity (read-only)</span>
                                </div>
                            </div>

                            <div className="noc-form-row two-col" style={{ marginTop: '20px' }}>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Quantity(cum/year): *</label>
                                    <input
                                        type="number"
                                        name="quantityKLY"
                                        className={`noc-form-control ${errors.quantityKLY ? 'error' : ''}`}
                                        value={formData.quantityKLY}
                                        onChange={handleChange}
                                        placeholder="Auto-calculated from KLD"
                                        min="0"
                                        step="0.01"
                                    />
                                    <span className="noc-form-help">Auto-calculated: KLD × 365</span>
                                    {errors.quantityKLY && <span className="noc-form-error">{errors.quantityKLY}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">KLY(Kilo Liter/Year)</label>
                                    <input
                                        type="number"
                                        className="noc-form-control"
                                        value={formData.quantityKLY}
                                        readOnly
                                        style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                                    />
                                    <span className="noc-form-help">Same as Quantity(cum/year) (read-only)</span>
                                </div>
                            </div>
                        </div>

                        {/* Note Section */}
                        <div className="noc-alert noc-alert-danger" style={{ 
                            marginBottom: '30px',
                            background: '#ffebee',
                            border: '1px solid #f44336'
                        }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#c62828' }}>Important Notes:</h4>
                            <ol style={{ margin: 0, paddingLeft: '20px', color: '#c62828' }}>
                                <li>At least one year charge should be paid before submission of application.</li>
                                <li>Charges are subject to revision w.e.f 1st January of each year as per the categorisation of respective block/ area in the latest GW Resource Estimation.</li>
                                <li>Arrears/ Environmental Compensation, if applicable, will be communicated and NOC will be issued subject to payment of same.</li>
                            </ol>
                        </div>

                        {/* Action Button */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                            <button
                                type="submit"
                                className="noc-btn noc-btn-primary"
                                style={{ padding: '12px 40px', fontSize: '1.1rem' }}
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="noc-btn noc-btn-secondary"
                                style={{ padding: '12px 40px', fontSize: '1.1rem' }}
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    {/* Calculated Charges Result */}
                    {calculatedCharges && submitted && (
                        <div className="noc-card" style={{ 
                            marginTop: '40px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none'
                        }}>
                            <div className="noc-card-header" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                <h3 style={{ margin: 0 }}>Ground Water Abstraction Charges Calculation</h3>
                            </div>
                            <div className="noc-card-body">
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    {/* Charge Calculation Table */}
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                                        <table className="noc-table" style={{ width: '100%', background: 'white', color: '#333' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--cgwa-primary)', color: 'white' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left' }}>Charge Description</th>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>Rate/KLD</th>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>One Year Charge</th>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>Charges for entire duration of NOC</th>
                                                    <th style={{ padding: '12px', textAlign: 'center' }}>Duration of NOC</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: '12px' }}>{calculatedCharges.chargeDescription}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{calculatedCharges.rate.toFixed(2)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{calculatedCharges.oneYearCharge.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>₹{calculatedCharges.totalCharge.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>{calculatedCharges.validityYears} years</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary */}
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Total Abstraction Charges</p>
                                        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
                                            ₹{calculatedCharges.totalCharge.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </p>
                                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            ({calculatedCharges.quantityKLD} KLD × ₹{calculatedCharges.rate}/KLD × {calculatedCharges.validityYears} years)
                                        </p>
                                    </div>

                                    <div className="noc-alert noc-alert-warning" style={{ marginTop: '20px', background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.5)' }}>
                                        <strong>⚠️ Note:</strong> This is an estimated calculation. Final charges will be communicated by the authority. At least one year charge must be paid before application submission. Charges are subject to revision w.e.f 1st January of each year.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default AbstractionChargesCalculator;

