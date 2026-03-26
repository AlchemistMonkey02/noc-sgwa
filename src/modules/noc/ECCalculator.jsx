// Environmental Compensation (EC) Calculator
// Calculate EC for illegal groundwater abstraction without valid NOC

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import { getDistricts, getBlocksForDistrict, getBlockCategory } from './utils/blockClassification';
import { applicationTypes, waterQualityTypes, states } from './utils/formData';
import './styles/noc-portal.css';

const ECCalculator = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        applicationType: '',
        waterQualityType: '',
        areaTypeCategory: '',
        abstractionFromDate: '',
        abstractionToDate: '',
        dailyQuantum: '',
        annualQuantum: '',
        state: '',
        district: '',
        block: ''
    });
    const [errors, setErrors] = useState({});
    const [availableBlocks, setAvailableBlocks] = useState([]);
    const [calculatedEC, setCalculatedEC] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const { user } = useAuth();
 
    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            navigate('/noc/login');
        }
    }, [user, navigate]);

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

        // Clear calculated EC when form changes
        if (calculatedEC) {
            setCalculatedEC(null);
            setSubmitted(false);
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
        if (!formData.abstractionFromDate) {
            newErrors.abstractionFromDate = 'Abstraction FROM date is required';
        }
        if (!formData.abstractionToDate) {
            newErrors.abstractionToDate = 'Abstraction TO date is required';
        }
        if (!formData.dailyQuantum || parseFloat(formData.dailyQuantum) <= 0) {
            newErrors.dailyQuantum = 'Daily Quantum is required and must be greater than 0';
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

        // Validate dates
        if (formData.abstractionFromDate && formData.abstractionToDate) {
            const fromDate = new Date(formData.abstractionFromDate);
            const toDate = new Date(formData.abstractionToDate);
            if (toDate < fromDate) {
                newErrors.abstractionToDate = 'TO date must be after FROM date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateEC = () => {
        if (!validateForm()) {
            return;
        }

        // Get block category
        const blockCategory = getBlockCategory(formData.district, formData.block);
        const categoryName = blockCategory ? blockCategory.name : 'Safe';

        // EC Rates per cubic meter (these should match the actual rates from regulations)
        // For Saline Water, always use Safe category rates
        const ecCategory = formData.waterQualityType === 'Saline' ? 'Safe' : categoryName;

        const ecRates = {
            'Safe': {
                'Industry': 15.0,
                'Mining': 12.0,
                'Other': 10.0
            },
            'Semi-Critical': {
                'Industry': 22.0,
                'Mining': 18.0,
                'Other': 15.0
            },
            'Critical': {
                'Industry': 30.0,
                'Mining': 25.0,
                'Other': 20.0
            },
            'Over-Exploited': {
                'Industry': 45.0,
                'Mining': 35.0,
                'Other': 30.0
            }
        };

        // Determine project type (simplified - should be based on application type)
        let projectType = 'Other';
        if (formData.applicationType && formData.applicationType.toLowerCase().includes('mining')) {
            projectType = 'Mining';
        } else if (formData.applicationType && (formData.applicationType.toLowerCase().includes('industry') || formData.applicationType.toLowerCase().includes('industrial'))) {
            projectType = 'Industry';
        }

        const rate = ecRates[ecCategory]?.[projectType] || ecRates['Safe'][projectType];

        // Calculate annual quantum if not provided
        let annualQty = parseFloat(formData.annualQuantum);
        if (!annualQty || annualQty === 0) {
            const dailyQty = parseFloat(formData.dailyQuantum) || 0;
            // Calculate days between dates
            const fromDate = new Date(formData.abstractionFromDate);
            const toDate = new Date(formData.abstractionToDate);
            const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
            annualQty = dailyQty * daysDiff;
        }

        // EC = Rate × Annual Quantum × 15 (as per regulations: 15 times the GW charge)
        const baseEC = rate * annualQty;
        const ecAmount = baseEC * 15;

        // Calculate by year if period spans multiple years
        const fromDate = new Date(formData.abstractionFromDate);
        const toDate = new Date(formData.abstractionToDate);
        const years = [];

        let currentYear = fromDate.getFullYear();
        const endYear = toDate.getFullYear();

        while (currentYear <= endYear) {
            const yearStart = currentYear === fromDate.getFullYear() 
                ? fromDate 
                : new Date(currentYear, 0, 1);
            const yearEnd = currentYear === endYear 
                ? toDate 
                : new Date(currentYear, 11, 31);
            
            const yearDays = Math.ceil((yearEnd - yearStart) / (1000 * 60 * 60 * 24)) + 1;
            const yearQty = (parseFloat(formData.dailyQuantum) || 0) * yearDays;
            const yearEC = (rate * yearQty) * 15;

            years.push({
                year: currentYear,
                days: yearDays,
                quantity: yearQty,
                ec: yearEC
            });

            currentYear++;
        }

        setCalculatedEC({
            blockCategory: categoryName,
            ecCategory: ecCategory,
            rate: rate,
            annualQuantum: annualQty,
            baseEC: baseEC,
            ecAmount: ecAmount,
            years: years,
            note: formData.waterQualityType === 'Saline' 
                ? 'For Saline Water, EC Rates for Safe category have been applied, irrespective of actual category of Block.'
                : null
        });

        setSubmitted(true);
    };

    const handleReset = () => {
        setFormData({
            applicationType: '',
            waterQualityType: '',
            areaTypeCategory: '',
            abstractionFromDate: '',
            abstractionToDate: '',
            dailyQuantum: '',
            annualQuantum: '',
            state: '',
            district: '',
            block: ''
        });
        setErrors({});
        setCalculatedEC(null);
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
            {/* <NOCHeader />            */}
            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-card">
                    <h1 style={{ 
                        color: 'var(--cgwa-primary)', 
                        marginBottom: '30px',
                        fontSize: '2rem',
                        borderBottom: '3px solid var(--cgwa-primary)',
                        paddingBottom: '15px'
                    }}>
                        Know Your Environmental Compensation (EC)
                    </h1>

                    <form onSubmit={(e) => { e.preventDefault(); calculateEC(); }}>
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
                                    <label className="noc-form-label required">Ground Water ABSTRACTION Without Valid NOC Date (FROM)</label>
                                    <input
                                        type="date"
                                        name="abstractionFromDate"
                                        className={`noc-form-control ${errors.abstractionFromDate ? 'error' : ''}`}
                                        value={formData.abstractionFromDate}
                                        onChange={handleChange}
                                    />
                                    {errors.abstractionFromDate && <span className="noc-form-error">{errors.abstractionFromDate}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Ground Water ABSTRACTION Without Valid NOC Date (TO)</label>
                                    <input
                                        type="date"
                                        name="abstractionToDate"
                                        className={`noc-form-control ${errors.abstractionToDate ? 'error' : ''}`}
                                        value={formData.abstractionToDate}
                                        onChange={handleChange}
                                    />
                                    {errors.abstractionToDate && <span className="noc-form-error">{errors.abstractionToDate}</span>}
                                </div>
                            </div>

                            <div className="noc-form-row two-col" style={{ marginTop: '20px' }}>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">DAILY QUANTUM OF EXTRACTION (m³/day)(KLD)</label>
                                    <input
                                        type="number"
                                        name="dailyQuantum"
                                        className={`noc-form-control ${errors.dailyQuantum ? 'error' : ''}`}
                                        value={formData.dailyQuantum}
                                        onChange={handleChange}
                                        placeholder="Enter daily quantum"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.dailyQuantum && <span className="noc-form-error">{errors.dailyQuantum}</span>}
                                </div>

                                <div className="noc-form-group">
                                    <label className="noc-form-label">ANNUAL QUANTUM OF EXTRACTION (m³/Year)(KLY)</label>
                                    <input
                                        type="number"
                                        name="annualQuantum"
                                        className="noc-form-control"
                                        value={formData.annualQuantum}
                                        onChange={handleChange}
                                        placeholder="Auto-calculated if left empty"
                                        min="0"
                                        step="0.01"
                                    />
                                    <span className="noc-form-help">Will be calculated from daily quantum and date range if not provided</span>
                                </div>
                            </div>
                        </div>

                        {/* Note Section */}
                        <div className="noc-alert noc-alert-info" style={{ 
                            marginBottom: '30px',
                            background: '#e3f2fd',
                            border: '1px solid #2196f3'
                        }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>Important Notes:</h4>
                            <ol style={{ margin: 0, paddingLeft: '20px', color: '#d32f2f' }}>
                                <li>These Environmental Compensation charges varies with the changes in the selected category of block w.e.f 1st January of each year.</li>
                                <li>Final calculation of Environmental Compensation will be based on prevailing category of block w.e.f 1st January of each year for the period of illegal groundwater extraction.</li>
                                <li>Final calculated Environmental Compensation will be communicated and NOC will be issued subject to payment of same.</li>
                                <li>KLD- Kilo Liter Per Day.</li>
                                <li>KLY- Kilo Liter Per Year.</li>
                                <li>For Saline Water, EC Rates for Safe category shall be applied, irrespective of actual category of Block/Sub District.</li>
                            </ol>
                        </div>

                        {/* Action Buttons */}
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

                    {/* Calculated EC Result */}
                    {calculatedEC && submitted && (
                        <div className="noc-card" style={{ 
                            marginTop: '40px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none'
                        }}>
                            <div className="noc-card-header" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                <h3 style={{ margin: 0 }}>Environmental Compensation Calculation Result</h3>
                            </div>
                            <div className="noc-card-body">
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <div>
                                        <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                                            <strong>Block Category:</strong> {calculatedEC.blockCategory}
                                            {calculatedEC.note && (
                                                <span style={{ display: 'block', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '5px' }}>
                                                    {calculatedEC.note}
                                                </span>
                                            )}
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                                            <strong>EC Category Applied:</strong> {calculatedEC.ecCategory}
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                                            <strong>EC Rate:</strong> ₹{calculatedEC.rate.toFixed(2)} per m³
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                                            <strong>Annual Quantum:</strong> {calculatedEC.annualQuantum.toFixed(2)} m³
                                        </p>
                                    </div>

                                    {calculatedEC.years.length > 1 && (
                                        <div>
                                            <h4 style={{ marginBottom: '10px' }}>Year-wise Breakdown:</h4>
                                            {calculatedEC.years.map((year, idx) => (
                                                <div key={idx} style={{ 
                                                    background: 'rgba(255,255,255,0.1)', 
                                                    padding: '10px', 
                                                    borderRadius: '5px',
                                                    marginBottom: '10px'
                                                }}>
                                                    <strong>{year.year}:</strong> {year.days} days × {formData.dailyQuantum} m³/day = {year.quantity.toFixed(2)} m³
                                                    <br />
                                                    EC: ₹{year.ec.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        marginTop: '20px'
                                    }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Total Environmental Compensation</p>
                                        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
                                            ₹{calculatedEC.ecAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </p>
                                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            (Rate × Annual Quantum × 15)
                                        </p>
                                    </div>

                                    <div className="noc-alert noc-alert-warning" style={{ marginTop: '20px', background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.5)' }}>
                                        <strong>⚠️ Note:</strong> This is an estimated calculation. Final Environmental Compensation will be communicated by the authority after verification and will be based on the prevailing block category as of 1st January of each year during the illegal extraction period.
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

export default ECCalculator;

