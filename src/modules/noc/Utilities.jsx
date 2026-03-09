import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import nocApplicationService from './services/nocApplicationService';
import './styles/noc-portal.css';

const Utilities = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTool, setActiveTool] = useState('district-finder');
    const { error: toastError } = useToast();

    // Assessment Unit Tool State
    const [districtForAssessment, setDistrictForAssessment] = useState('');
    const [assessmentUnits, setAssessmentUnits] = useState([]);
    const [assessmentLoading, setAssessmentLoading] = useState(false);
    const [assessmentError, setAssessmentError] = useState(null);

    // District Finder Tool State
    const [districtOptions, setDistrictOptions] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [districtProfile, setDistrictProfile] = useState(null);
    const [finderLoading, setFinderLoading] = useState(false);

    // Fetch Districts on Mount (Correctly resolving keys)
    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch States to find Rajasthan's ID
                const stateRes = await nocApplicationService.getStates();
                let stateId = 'Rajasthan'; // Default fallback

                if (stateRes.success && stateRes.data) {
                    const rajasthan = stateRes.data.find(s => {
                        const name = typeof s === 'object' ? (s.stateName || s.name || '') : s;
                        return name && name.toLowerCase() === 'rajasthan';
                    });

                    if (rajasthan) {
                        stateId = typeof rajasthan === 'object' ? (rajasthan.stateId || rajasthan.id || rajasthan.name) : rajasthan;
                    }
                }

                // 2. Fetch Districts using the resolved ID
                const distRes = await nocApplicationService.getDistricts(stateId);
                if (distRes.success && distRes.data) {
                    setDistrictOptions(distRes.data);
                } else {
                    setDistrictOptions([]);
                }
            } catch (err) {
                console.error("Failed to fetch master data", err);
                setDistrictOptions([]);
            }
        };
        initData();
    }, []);

    const handleCheckDistrictStatus = async (e) => {
        e.preventDefault();
        if (!selectedDistrict) return;

        setFinderLoading(true);
        setDistrictProfile(null);

        try {
            // Using Assessment Units API to derive district profile
            const response = await nocApplicationService.getAssessmentUnits(selectedDistrict);
            if (response.success && response.data) {
                const units = response.data;
                const stats = {
                    totalBlocks: units.length,
                    overExploited: units.filter(u => u.category === 'OVER_EXPLOITED').length,
                    critical: units.filter(u => u.category === 'CRITICAL').length,
                    semiCritical: units.filter(u => u.category === 'SEMI_CRITICAL').length,
                    safe: units.filter(u => u.category === 'SAFE').length,
                    districtName: selectedDistrict
                };
                setDistrictProfile(stats);
            } else {
                setDistrictProfile(null);
                toastError('No data found for this district.');
            }
        } catch (err) {
            console.error("Failed to fetch district profile", err);
            toastError('Error fetching details.');
        } finally {
            setFinderLoading(false);
        }
    };

    const handleCheckAssessmentUnits = async (e) => {
        e.preventDefault();
        setAssessmentLoading(true);
        setAssessmentError(null);
        setAssessmentUnits([]);

        try {
            const response = await nocApplicationService.getAssessmentUnits(districtForAssessment);
            if (response.success && response.data) {
                setAssessmentUnits(response.data);
            } else {
                setAssessmentUnits([]);
                setAssessmentError('No assessment units found.');
            }
        } catch (err) {
            console.error(err);
            setAssessmentError('Failed to fetch assessment units. Please try again.');
        } finally {
            setAssessmentLoading(false);
        }
    };

    const tools = [
        { id: 'district-finder', icon: '📍', name: 'District Finder', desc: 'Find district information' },
        { id: 'assessment-unit', icon: '🏢', name: 'Assessment Unit Lookup', desc: 'Lookup assessment unit details' }
    ];

    return (
        <div className="noc-portal">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <NOCHeader />

            <div className="main-content" style={{ marginLeft: window.innerWidth >= 1024 ? '280px' : '0' }}>
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    <div className="breadcrumb">
                        <Link to="/noc/dashboard">Home</Link>
                        <span className="separator">›</span>
                        <span className="current">Utility Tools</span>
                    </div>

                    <div className="page-title-section">
                        <h1 className="page-main-title">🛠️ Utility Tools</h1>
                        <p className="page-subtitle">Helpful tools and calculators</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Select a Tool</h2>
                        </div>
                        <div className="card-content-area">
                            <div className="utility-tools-grid">
                                {tools.map(tool => (
                                    <button
                                        key={tool.id}
                                        className={`utility-tool-card ${activeTool === tool.id ? 'active' : ''}`}
                                        onClick={() => setActiveTool(tool.id)}
                                        style={{ cursor: 'pointer', border: activeTool === tool.id ? '2px solid #3b82f6' : '2px solid #e2e8f0' }}
                                    >
                                        <div className="utility-icon">{tool.icon}</div>
                                        <div className="utility-name">{tool.name}</div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>{tool.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-title-bar">
                            <h2 className="card-main-title">{tools.find(t => t.id === activeTool)?.icon} {tools.find(t => t.id === activeTool)?.name}</h2>
                        </div>
                        <div className="card-content-area">


                            {activeTool === 'assessment-unit' && (
                                <div className="utility-tool-container">
                                    <form className="utility-form" onSubmit={handleCheckAssessmentUnits}>
                                        <div className="form-group">
                                            <label>District ID/Name *</label>
                                            <input
                                                type="text"
                                                className="bhuneer-input"
                                                value={districtForAssessment}
                                                onChange={(e) => setDistrictForAssessment(e.target.value)}
                                                placeholder="Enter District (e.g., JAIPUR)"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary" disabled={assessmentLoading}>
                                            {assessmentLoading ? 'Fetching...' : 'Lookup Assessment Units'}
                                        </button>
                                    </form>

                                    {assessmentError && (
                                        <div className="noc-alert noc-alert-danger" style={{ marginTop: '20px' }}>
                                            {assessmentError}
                                        </div>
                                    )}

                                    {assessmentUnits.length > 0 && (
                                        <div className="table-responsive" style={{ marginTop: '20px' }}>
                                            <table className="noc-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Category</th>
                                                        <th>Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assessmentUnits.map((unit) => (
                                                        <tr key={unit.id}>
                                                            <td>{unit.id}</td>
                                                            <td>{unit.name}</td>
                                                            <td>
                                                                <span className={`status-badge ${unit.category === 'SAFE' ? 'success' : unit.category === 'CRITICAL' ? 'warning' : 'danger'}`}>
                                                                    {unit.category}
                                                                </span>
                                                            </td>
                                                            <td>{unit.type}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}



                            {activeTool === 'district-finder' && (
                                <div className="utility-tool-container">
                                    <div className="utility-form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                        <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '25px' }}>Know Your District Status</h3>

                                        <form onSubmit={handleCheckDistrictStatus}>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>State</label>
                                                    <select className="bhuneer-input" disabled style={{ background: '#f1f5f9' }}>
                                                        <option>Rajasthan</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>District</label>
                                                    <select
                                                        className="bhuneer-input"
                                                        value={selectedDistrict}
                                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select District</option>
                                                        {districtOptions.map((dist, idx) => {
                                                            const val = typeof dist === 'object' ? (dist.districtName || dist.name) : dist;
                                                            return <option key={idx} value={val}>{val}</option>;
                                                        })}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                                <button type="submit" className="btn-primary" disabled={finderLoading}>
                                                    {finderLoading ? 'Checking...' : 'Check Status'}
                                                </button>
                                            </div>
                                        </form>

                                        {districtProfile && (
                                            <div style={{
                                                marginTop: '30px',
                                                background: '#f0fdf4',
                                                border: '1px solid #bbf7d0',
                                                borderRadius: '12px',
                                                padding: '25px'
                                            }}>
                                                <h3 style={{
                                                    textAlign: 'center',
                                                    color: '#166534',
                                                    marginBottom: '20px',
                                                    fontSize: '1.25rem',
                                                    fontWeight: '700'
                                                }}>
                                                    District Profile: {districtProfile.districtName}
                                                </h3>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '15px 30px',
                                                    fontSize: '1rem'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>No. of Blocks:</strong>
                                                        <span>{districtProfile.totalBlocks}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>Over-Exploited Blocks:</strong>
                                                        <span>{districtProfile.overExploited}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>Critical Blocks:</strong>
                                                        <span>{districtProfile.critical}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>Semi-Critical Blocks:</strong>
                                                        <span>{districtProfile.semiCritical}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>Safe Blocks:</strong>
                                                        <span>{districtProfile.safe}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <strong>Notification Status:</strong>
                                                        <span>Notified for regulation</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTool !== 'assessment-unit' && activeTool !== 'district-finder' && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚧</div>
                                    <h3>Tool Under Development</h3>
                                    <p>This tool will be available soon</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default Utilities;
