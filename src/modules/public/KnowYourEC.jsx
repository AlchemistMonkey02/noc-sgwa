import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import publicService from './services/publicService';
import './styles/public-pages.css';

const KnowYourEC = () => {
    const navigate = useNavigate();

    // Initial State
    const [formData, setFormData] = useState({
        applicationType: '',
        waterQualityType: '',
        areaCategory: '',
        dateFrom: '',
        dateTo: '',
        dailyExtraction: '',
        annualExtraction: ''
    });

    // Dynamic Options State
    const [areaCategories, setAreaCategories] = useState([]);
    const [applicationTypes, setApplicationTypes] = useState([]);
    const [waterQualityTypes, setWaterQualityTypes] = useState([]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch Master Data
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [appTypeRes, waterQualityRes, areaCatRes] = await Promise.all([
                    publicService.getApplicationTypes(),
                    publicService.getWaterQualityTypes(),
                    publicService.getAreaCategories()
                ]);

                setApplicationTypes(Array.isArray(appTypeRes.data) ? appTypeRes.data : (Array.isArray(appTypeRes) ? appTypeRes : []));
                setWaterQualityTypes(Array.isArray(waterQualityRes.data) ? waterQualityRes.data : (Array.isArray(waterQualityRes) ? waterQualityRes : []));
                setAreaCategories(Array.isArray(areaCatRes.data) ? areaCatRes.data : (Array.isArray(areaCatRes) ? areaCatRes : []));
            } catch (err) {
                console.error('Failed to fetch master data:', err);
            }
        };

        fetchMasterData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'dailyExtraction') {
                const daily = parseFloat(value) || 0;
                newData.annualExtraction = (daily * 365).toFixed(2);
            }
            return newData;
        });
        setError('');
        setResult(null);
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        if (!formData.applicationType || !formData.waterQualityType || !formData.areaCategory || !formData.dateFrom || !formData.dateTo || !formData.dailyExtraction || !formData.annualExtraction) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await publicService.calculateEC(formData);
            if (data.success) {
                setResult(data.data);
            } else {
                throw new Error(data.message || 'Calculation failed');
            }
        } catch (err) {
            console.error('EC Calculation error:', err);
            // Fallback simulation
            const days = (new Date(formData.dateTo) - new Date(formData.dateFrom)) / (1000 * 60 * 60 * 24) + 1;
            const amount = parseFloat(formData.dailyExtraction || 0) * (days > 0 ? days : 1) * 100;

            setResult({
                input: { ...formData, dateRange: { totalDays: days >= 0 ? days : 0 } },
                calculation: {
                    appliedCategory: formData.areaCategory,
                    isSalineOverride: false,
                    ecRate: 100,
                    totalAmount: amount,
                    formattedAmount: `₹${amount.toLocaleString('en-IN')}`
                },
                notes: [
                    "This is a simulated result (API unavailable).",
                    "Final charges will be assessed by the Authorized Officer."
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const renderOptions = (items) => {
        return items.map((item, idx) => {
            const value = item.code || item.value || item.id || item;
            const label = item.label || item.name || item.description || item;
            return <option key={value || idx} value={value}>{label}</option>;
        });
    };

    return (
        <div className="public-info-page">
            <div className="public-content-container">
                <div className="public-tool-container">
                    <div className="public-tool-header">
                        <div className="public-tool-icon">💰</div>
                        <h1 className="public-tool-title">Know Your EC Liability</h1>
                        <p className="public-tool-subtitle">
                            Estimate your Environment Compensation charges by selecting your project parameters and violation period.
                        </p>
                    </div>

                    <form onSubmit={handleCalculate} className="public-form-grid">
                        {/* Application Type */}
                        <div className="officer-form-group">
                            <label className="officer-label required">Application Type</label>
                            <select
                                name="applicationType"
                                value={formData.applicationType}
                                onChange={handleChange}
                                className="officer-select"
                                required
                            >
                                <option value="">Select Application Type</option>
                                {renderOptions(applicationTypes)}
                            </select>
                        </div>

                        {/* Water Quality */}
                        <div className="officer-form-group">
                            <label className="officer-label required">Water Quality</label>
                            <select
                                name="waterQualityType"
                                value={formData.waterQualityType}
                                onChange={handleChange}
                                className="officer-select"
                                required
                            >
                                <option value="">Select Water Quality</option>
                                {renderOptions(waterQualityTypes)}
                            </select>
                        </div>

                        {/* Area Category */}
                        <div className="officer-form-group">
                            <label className="officer-label required">Area Category</label>
                            <select
                                name="areaCategory"
                                value={formData.areaCategory}
                                onChange={handleChange}
                                className="officer-select"
                                required
                            >
                                <option value="">Select Area Category</option>
                                {renderOptions(areaCategories)}
                            </select>
                        </div>

                        <div className="officer-form-group">
                            {/* Spacer */}
                        </div>

                        {/* Dates */}
                        <div className="officer-form-group">
                            <label className="officer-label required">Violation Date From</label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={formData.dateFrom}
                                onChange={handleChange}
                                className="officer-input"
                                required
                            />
                        </div>

                        <div className="officer-form-group">
                            <label className="officer-label required">Violation Date To</label>
                            <input
                                type="date"
                                name="dateTo"
                                value={formData.dateTo}
                                onChange={handleChange}
                                className="officer-input"
                                required
                            />
                        </div>

                        {/* Extraction */}
                        <div className="officer-form-group">
                            <label className="officer-label required">Daily Extraction (m³/day)</label>
                            <input
                                type="number"
                                name="dailyExtraction"
                                value={formData.dailyExtraction}
                                onChange={handleChange}
                                className="officer-input"
                                placeholder="e.g. 100"
                                required
                            />
                        </div>

                        <div className="officer-form-group">
                            <label className="officer-label required">Annual Extraction (m³/year)</label>
                            <input
                                type="number"
                                name="annualExtraction"
                                value={formData.annualExtraction}
                                onChange={handleChange}
                                className="officer-input"
                                placeholder="e.g. 36500"
                                required
                            />
                        </div>

                        {/* Submit */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                className="officer-btn officer-btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.25rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Calculating...' : 'Calculate Compensation'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="officer-login-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {result && result.calculation && (
                        <div className="public-feature-card" style={{ marginTop: '3rem', borderLeft: '8px solid var(--color-primary-600)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                <p style={{ color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Liability</p>
                                <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: 'var(--officer-danger)', fontWeight: '900', margin: '0' }}>
                                    {result.calculation.formattedAmount}
                                </h2>
                            </div>

                            <div className="public-stats-grid" style={{ marginBottom: '2rem' }}>
                                <div className="public-stat-item" style={{ padding: '1.5rem' }}>
                                    <p className="public-stat-label" style={{ fontSize: '0.75rem' }}>EC Rate</p>
                                    <p className="public-stat-number" style={{ fontSize: '1.25rem' }}>₹{result.calculation.ecRate}/m³</p>
                                </div>
                                <div className="public-stat-item" style={{ padding: '1.5rem' }}>
                                    <p className="public-stat-label" style={{ fontSize: '0.75rem' }}>Days</p>
                                    <p className="public-stat-number" style={{ fontSize: '1.25rem' }}>{result.input?.dateRange?.totalDays || 0}</p>
                                </div>
                                <div className="public-stat-item" style={{ padding: '1.5rem' }}>
                                    <p className="public-stat-label" style={{ fontSize: '0.75rem' }}>Category</p>
                                    <p className="public-stat-number" style={{ fontSize: '1.25rem' }}>{result.calculation.appliedCategory}</p>
                                </div>
                            </div>

                            {result.notes && (
                                <div style={{ background: 'var(--color-primary-50)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-primary-100)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary-900)' }}>Important Notes:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-primary-800)' }}>
                                        {result.notes.map((note, i) => <li key={i}>{note}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowYourEC;
