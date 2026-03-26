import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from './components/PublicHeader';
import publicService from './services/publicService';

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
                input: { ...formData, dateRange: { totalDays: days } },
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

    // Helper to render options safely
    const renderOptions = (items) => {
        return items.map((item, idx) => {
            const value = item.code || item.value || item.id || item;
            const label = item.label || item.name || item.description || item;
            return <option key={value || idx} value={value}>{label}</option>;
        });
    };

    return (
        <div className="gov-portal" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <PublicHeader />

            <div className="portal-single-main" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '40px 20px',
                flex: 1,
                width: '100%',
                margin: '120px 0 0',
                boxSizing: 'border-box'
            }}>
                <div className="ec-calculator-container" style={{
                    maxWidth: '1000px',
                    width: '100%',
                    background: '#fff',
                    borderRadius: '24px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                    padding: '60px',
                    border: '1px solid #e2e8f0',
                    transition: 'transform 0.3s ease',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: '22px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            marginBottom: '20px',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1)'
                        }}>
                            💰
                        </div>
                        <h2 style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-0.02em' }}>
                            Know Your EC Liability
                        </h2>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7', fontSize: '1.1rem' }}>
                            Estimate your Environment Compensation charges by selecting your project parameters and violation period.
                        </p>
                    </div>

                    <form onSubmit={handleCalculate} className="ec-form" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '32px',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>

                        {/* Group 1: Project Details */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Application Type <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                name="applicationType"
                                value={formData.applicationType}
                                onChange={handleChange}
                                className="gov-select"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    color: '#334155',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <option value="">Select Application Type</option>
                                {renderOptions(applicationTypes)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Water Quality <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                name="waterQualityType"
                                value={formData.waterQualityType}
                                onChange={handleChange}
                                className="gov-select"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    color: '#334155'
                                }}
                            >
                                <option value="">Select Water Quality</option>
                                {renderOptions(waterQualityTypes)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Area Category <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                name="areaCategory"
                                value={formData.areaCategory}
                                onChange={handleChange}
                                className="gov-select"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    color: '#334155'
                                }}
                            >
                                <option value="">Select Area Category</option>
                                {renderOptions(areaCategories)}
                            </select>
                        </div>

                        {/* Empty cell for grid alignment if needed or just let it wrap */}
                        <div style={{ display: 'none' }}></div>

                        <div style={{ 
                            gridColumn: '1 / -1', 
                            height: '1px', 
                            background: '#f1f5f9', 
                            margin: '10px 0' 
                        }}></div>

                        {/* Group 2: Violation Period */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Violation Date From <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={formData.dateFrom}
                                onChange={handleChange}
                                className="gov-input"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Violation Date To <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="dateTo"
                                value={formData.dateTo}
                                onChange={handleChange}
                                className="gov-input"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Group 3: Extraction Details */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Daily Extraction (m³/day) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                name="dailyExtraction"
                                value={formData.dailyExtraction}
                                onChange={handleChange}
                                className="gov-input"
                                placeholder="e.g. 100"
                                min="0"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                Annual Extraction (m³/year) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                name="annualExtraction"
                                value={formData.annualExtraction}
                                onChange={handleChange}
                                className="gov-input"
                                placeholder="e.g. 36500"
                                min="0"
                                style={{ 
                                    width: '100%', 
                                    padding: '14px 18px', 
                                    background: '#f8fafc', 
                                    borderColor: '#e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="login-btn-gov"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loading ? 'Calculating Charges...' : 'Calculate Compensation'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="error-msg" style={{
                            marginTop: '30px',
                            padding: '18px',
                            background: '#fff1f2',
                            color: '#e11d48',
                            borderRadius: '12px',
                            border: '1px solid #fda4af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: '600'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {result && result.calculation && (
                        <div className="result-card" style={{
                            marginTop: '50px',
                            background: '#ffffff',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: '0 25px 40px -15px rgba(0, 0, 0, 0.08)'
                        }}>
                            <div style={{ 
                                padding: '24px 32px', 
                                background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)', 
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Estimation Summary</h3>
                                <span style={{ 
                                    background: '#dcfce7', 
                                    color: '#166534', 
                                    padding: '4px 12px', 
                                    borderRadius: 'full', 
                                    fontSize: '0.8rem', 
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>Calculated</span>
                            </div>

                            <div style={{ padding: '40px' }}>
                                <div style={{ 
                                    textAlign: 'center',
                                    marginBottom: '40px'
                                }}>
                                    <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Total Compensation Amount</span>
                                    <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#dc2626', letterSpacing: '-0.02em', display: 'block' }}>
                                        {result.calculation.formattedAmount}
                                    </span>
                                </div>

                                <div style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '20px',
                                    background: '#f8fafc', 
                                    borderRadius: '16px', 
                                    padding: '24px', 
                                    border: '1px solid #e2e8f0' 
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EC Rate</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>₹ {result.calculation.ecRate}/m³</p>
                                    </div>
                                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area Category</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{result.calculation.appliedCategory}</p>
                                    </div>
                                    {result.input && result.input.dateRange && (
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Violation Period</p>
                                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{result.input.dateRange.totalDays} Days</p>
                                        </div>
                                    )}
                                </div>

                                {result.notes && result.notes.length > 0 && (
                                    <div style={{ 
                                        marginTop: '35px',
                                        padding: '20px',
                                        background: '#fffbeb',
                                        borderRadius: '12px',
                                        border: '1px solid #fef3c7'
                                    }}>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#92400e', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Important Notes</p>
                                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#b45309', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                            {result.notes.map((note, index) => (
                                                <li key={index} style={{ marginBottom: '6px' }}>{note}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div style={{ 
                                padding: '16px 32px', 
                                background: '#f1f5f9', 
                                borderTop: '1px solid #e2e8f0', 
                                color: '#64748b', 
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}>
                                * Note: This estimation is for informational purposes. Final liability will be determined by the SGWA Authority.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="portal-footer" style={{ 
                marginTop: 'auto', 
                padding: '40px', 
                textAlign: 'center', 
                background: '#0f172a', 
                color: '#94a3b8',
                borderTop: '1px solid #1e293b'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    © 2026 Ground Water Department, Government of Rajasthan
                </p>
            </footer>
        </div>
    );
};

export default KnowYourEC;
