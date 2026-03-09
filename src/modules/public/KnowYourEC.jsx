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
        <div className="gov-portal" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PublicHeader />

            <div className="portal-main" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '40px 20px',
                flex: 1,
                maxWidth: '100%',
                margin: 0
            }}>
                <div className="ec-calculator-container" style={{
                    maxWidth: '900px',
                    width: '100%',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    padding: '40px',
                    border: '1px solid #eef2f6'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#eff6ff',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '30px',
                            marginBottom: '15px'
                        }}>
                            💰
                        </div>
                        <h2 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: '700', marginBottom: '10px' }}>
                            Know Your EC Liability
                        </h2>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                            Select your project parameters and violation period to estimate the Environment Compensation charges.
                        </p>
                    </div>

                    <form onSubmit={handleCalculate} className="ec-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

                        {/* Group 1: Project Details */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Application Type <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                name="applicationType"
                                value={formData.applicationType}
                                onChange={handleChange}
                                className="gov-select"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                                <option value="">Select Application Type</option>
                                {renderOptions(applicationTypes)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Water Quality <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                name="waterQualityType"
                                value={formData.waterQualityType}
                                onChange={handleChange}
                                className="gov-select"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                                <option value="">Select Water Quality</option>
                                {renderOptions(waterQualityTypes)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Area Category <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                name="areaCategory"
                                value={formData.areaCategory}
                                onChange={handleChange}
                                className="gov-select"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            >
                                <option value="">Select Area Category</option>
                                {renderOptions(areaCategories)}
                            </select>
                        </div>

                        {/* Group 2: Violation Period */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Violation Date From <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={formData.dateFrom}
                                onChange={handleChange}
                                className="gov-input"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Violation Date To <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="dateTo"
                                value={formData.dateTo}
                                onChange={handleChange}
                                className="gov-input"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                        </div>

                        {/* Group 3: Extraction Details */}
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Daily Extraction (m³/day) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="number"
                                name="dailyExtraction"
                                value={formData.dailyExtraction}
                                onChange={handleChange}
                                className="gov-input"
                                placeholder="e.g. 100"
                                min="0"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                Annual Extraction (m³/year) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="number"
                                name="annualExtraction"
                                value={formData.annualExtraction}
                                onChange={handleChange}
                                className="gov-input"
                                placeholder="e.g. 36500"
                                min="0"
                                style={{ width: '100%', padding: '12px', background: '#f8fafc', borderColor: '#cbd5e1' }}
                            />
                        </div>

                        <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                            <button
                                type="submit"
                                className="login-btn-gov"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '1.1rem',
                                    background: '#2563eb',
                                    borderRadius: '8px',
                                    marginTop: '10px',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                }}
                            >
                                {loading ? 'Calculating Charges...' : 'Calculate Compensation'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="error-msg" style={{
                            marginTop: '25px',
                            padding: '15px',
                            background: '#fef2f2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {result && result.calculation && (
                        <div className="result-card" style={{
                            marginTop: '35px',
                            padding: '0',
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.1rem' }}>Estimation Results</h3>
                            </div>

                            <div style={{ padding: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Total Liability Amount</span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#dc2626' }}>
                                        {result.calculation.formattedAmount}
                                    </span>
                                </div>

                                <div style={{ background: '#fcfcfc', borderRadius: '8px', padding: '15px', border: '1px dashed #e2e8f0' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fee Breakdown</p>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', color: '#334155' }}>
                                            <span>Applicable EC Rate</span>
                                            <span style={{ fontWeight: '500' }}>₹ {result.calculation.ecRate}/m³</span>
                                        </li>
                                        <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', color: '#334155' }}>
                                            <span>Applied Category</span>
                                            <span style={{ fontWeight: '500' }}>{result.calculation.appliedCategory}</span>
                                        </li>
                                        {result.input && result.input.dateRange && (
                                            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#334155' }}>
                                                <span>Total Violation Days</span>
                                                <span style={{ fontWeight: '500' }}>{result.input.dateRange.totalDays} Days</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {result.notes && result.notes.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Important Notes</p>
                                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            {result.notes.map((note, index) => (
                                                <li key={index} style={{ marginBottom: '5px' }}>{note}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '12px 25px', background: '#fffbeb', borderTop: '1px solid #fef3c7', color: '#92400e', fontSize: '0.85rem' }}>
                                * This calculation is an estimate based on provided inputs. Final charges will be assessed by the Authorized Officer upon verification.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="portal-footer" style={{ marginTop: 'auto' }}>
                <p>
                    © 2026 Ground Water Department, Rajasthan
                </p>
            </footer>
        </div>
    );
};

export default KnowYourEC;
