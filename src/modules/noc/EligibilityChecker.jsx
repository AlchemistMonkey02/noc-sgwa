import React, { useState, useEffect } from 'react';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';

const EligibilityChecker = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        state: 'Rajasthan',
        stateId: '', // Will be set when states load
        district: '',
        districtId: '',
        block: '',
        blockId: '',
        projectType: '', // New/Existing
        sector: '', // Industry/Mining/Infra
        industryType: '',
        groundWaterRequirement: '',
        dateOfCommencement: '',
        isWetland: 'No',
        isMSME: 'No',
        msmeType: ''
    });

    const [blockCategory, setBlockCategory] = useState(null);
    const [result, setResult] = useState(null);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [industryTypes, setIndustryTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Fetch states
            const statesResponse = await nocApplicationService.getStates();
            if (statesResponse.success) {
                const statesData = statesResponse.data || statesResponse.states || [];
                setStates(statesData);

                // Find Rajasthan and set its ID
                const rajasthan = statesData.find(s =>
                    s.name === 'Rajasthan' || s.stateName === 'Rajasthan'
                );
                if (rajasthan) {
                    const rajasthanId = rajasthan.id || rajasthan.stateId || rajasthan.code;
                    setFormData(prev => ({
                        ...prev,
                        stateId: rajasthanId
                    }));
                    // Fetch districts for Rajasthan
                    fetchDistricts(rajasthanId);
                }
            }

            // Fetch sectors/utilization purposes
            const sectorsResponse = await nocApplicationService.getUtilizationSectors();
            if (sectorsResponse.success) {
                const sectorsData = sectorsResponse.data || sectorsResponse.purposes || [];
                setSectors(sectorsData);
            }

            // Fetch industry types
            const industryResponse = await nocApplicationService.getIndustryTypes();
            if (industryResponse.success) {
                const industryData = industryResponse.data || industryResponse.types || [];
                setIndustryTypes(industryData);
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load form data. Please refresh the page.');
        }
    };

    // Fetch districts when state is selected
    const fetchDistricts = async (stateId) => {
        try {
            const response = await nocApplicationService.getDistricts(stateId);
            if (response.success) {
                const districtsData = response.data || response.districts || [];
                setDistricts(districtsData);
            }
        } catch (err) {
            console.error('Error fetching districts:', err);
        }
    };

    // Fetch blocks when district is selected
    const fetchBlocks = async (districtId) => {
        try {
            const response = await nocApplicationService.getBlocks(districtId);
            if (response.success) {
                const blocksData = response.data || response.blocks || [];
                setBlocks(blocksData);
            }
        } catch (err) {
            console.error('Error fetching blocks:', err);
        }
    };

    // Fetch block category when block is selected
    const fetchBlockCategory = async (districtId, blockId) => {
        try {
            const response = await nocApplicationService.getBlockCategory(districtId, blockId);
            if (response.success) {
                const categoryData = response.data || response.category;
                setBlockCategory(categoryData);
            }
        } catch (err) {
            console.error('Error fetching block category:', err);
            // Set a default if API fails
            setBlockCategory(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle district change
        if (name === 'district') {
            const selectedDistrict = districts.find(d =>
                (d.name || d.districtName) === value
            );
            const districtId = selectedDistrict?.id || selectedDistrict?.districtId || selectedDistrict?.code;

            setFormData(prev => ({
                ...prev,
                [name]: value,
                districtId: districtId,
                block: '', // Reset block when district changes
                blockId: '' // Reset blockId
            }));

            if (districtId) {
                fetchBlocks(districtId);
            } else {
                setBlocks([]); // Clear blocks if no district selected
            }
            setBlockCategory(null); // Clear block category
        }
        // Handle block change
        else if (name === 'block') {
            const selectedBlock = blocks.find(b =>
                (b.name || b.blockName) === value
            );
            const blockId = selectedBlock?.id || selectedBlock?.blockId || selectedBlock?.code;

            setFormData(prev => ({
                ...prev,
                [name]: value,
                blockId: blockId
            }));

            if (formData.districtId && blockId) {
                fetchBlockCategory(formData.districtId, blockId);
            }
        }
        // Handle other changes
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheck = async () => {
        // Validation
        if (!formData.district || !formData.block || !formData.sector || !formData.groundWaterRequirement) {
            alert("Please fill all mandatory fields marked with *");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare eligibility data
            const eligibilityData = {
                state: formData.state,
                stateId: formData.stateId,
                district: formData.district,
                districtId: formData.districtId,
                block: formData.block,
                blockId: formData.blockId,
                sector: formData.sector,
                projectType: formData.projectType,
                groundWaterRequirement: parseFloat(formData.groundWaterRequirement),
                industryType: formData.industryType,
                isMSME: formData.isMSME === 'Yes',
                msmeType: formData.msmeType,
                isWetland: formData.isWetland === 'Yes'
            };

            // Call eligibility check API
            const response = await nocApplicationService.checkEligibility(eligibilityData);

            if (response.success) {
                // API returned success with eligibility result
                setResult(response);
            } else {
                // API returned error
                setError(response.message || 'Failed to check eligibility');
                setResult({
                    success: false,
                    data: {
                        status: 'ERROR',
                        title: 'Error Checking Eligibility',
                        message: response.message || 'An error occurred while checking eligibility. Please try again.',
                        details: [],
                        blockInfo: blockCategory
                    }
                });
            }
        } catch (err) {
            console.error('Error checking eligibility:', err);
            setError(err.message || 'Failed to check eligibility');
            setResult({
                success: false,
                data: {
                    status: 'ERROR',
                    title: 'Error',
                    message: 'Unable to connect to the server. Please check your connection and try again.',
                    details: [],
                    blockInfo: blockCategory
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Extract result data for easier access
    const resultData = result?.data || result;

    return (
        <div className="noc-portal">
            <NOCHeader />
            <div className="dashboard-container">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div className="dashboard-content">
                    <div className="checker-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>

                        {/* Title Section */}
                        <div className="checker-header" style={{
                            background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
                            padding: '2rem',
                            borderRadius: '10px 10px 0 0',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <h1 style={{ margin: 0, fontSize: '2rem', color: '#ffffff' }}>Check Application Eligibility</h1>
                            <p style={{ marginTop: '10px', opacity: 0.9, color: '#e0f2fe' }}>Verify if your project requires NOC or is exempted/prohibited</p>
                        </div>

                        {/* Main Form Card */}
                        <div className="checker-card" style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '0 0 10px 10px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>

                            {/* Section 1: Location */}
                            <h3 className="form-section-header" style={{ color: '#1e3a8a', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                📍 Location Details
                            </h3>

                            <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="form-group">
                                    <label className="bhuneer-label">State <span className="text-red">*</span></label>
                                    <input type="text" className="bhuneer-input" value="Rajasthan" disabled style={{ background: '#f3f4f6' }} />
                                </div>
                                <div className="form-group">
                                    <label className="bhuneer-label">District <span className="text-red">*</span></label>
                                    <select name="district" className="bhuneer-input" value={formData.district} onChange={handleChange}>
                                        <option value="">Select District</option>
                                        {districts.map((d, idx) => {
                                            const name = d.name || d.districtName || d;
                                            const key = d.id || d.districtId || idx;
                                            return <option key={key} value={name}>{name}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="bhuneer-label">Block / Assessment Unit <span className="text-red">*</span></label>
                                    <select name="block" className="bhuneer-input" value={formData.block} onChange={handleChange} disabled={!formData.district}>
                                        <option value="">Select Block</option>
                                        {blocks.map((b, idx) => {
                                            const name = b.name || b.blockName || b;
                                            const key = b.id || b.blockId || idx;
                                            return <option key={key} value={name}>{name}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Block Category Alert */}
                            {blockCategory && (
                                <div style={{
                                    padding: '1rem',
                                    background: `${blockCategory.color}15`,
                                    borderLeft: `4px solid ${blockCategory.color}`,
                                    borderRadius: '4px',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>{blockCategory.name === 'Safe' ? '🟢' : blockCategory.name === 'Semi-Critical' ? '🟡' : blockCategory.name === 'Critical' ? '🟠' : '🔴'}</div>
                                    <div>
                                        <strong style={{ color: blockCategory.color }}>Block Category: {blockCategory.name}</strong>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>{blockCategory.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Section 2: Project Details */}
                            <h3 className="form-section-header" style={{ color: '#1e3a8a', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                🏭 Project Details
                            </h3>

                            <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="form-group">
                                    <label className="bhuneer-label">Sector Type <span className="text-red">*</span></label>
                                    <select name="sector" className="bhuneer-input" value={formData.sector} onChange={handleChange}>
                                        <option value="">Select Sector</option>
                                        {sectors.map((s, idx) => {
                                            const name = s.name || s.purpose || s.label || s;
                                            const key = s.id || s.code || idx;
                                            return <option key={key} value={name}>{name}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="bhuneer-label">Project Type <span className="text-red">*</span></label>
                                    <select name="projectType" className="bhuneer-input" value={formData.projectType} onChange={handleChange}>
                                        <option value="">Select Type</option>
                                        <option value="New Project">New Project</option>
                                        <option value="Existing Project">Existing Project</option>
                                        <option value="Expansion">Expansion</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="bhuneer-label">GW Requirement (m³/day) <span className="text-red">*</span></label>
                                    <input type="number" name="groundWaterRequirement" className="bhuneer-input" value={formData.groundWaterRequirement} onChange={handleChange} placeholder="e.g. 50" />
                                </div>
                            </div>

                            {/* Conditional Fields */}
                            {formData.sector === 'Industry' && (
                                <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div className="form-group">
                                        <label className="bhuneer-label">Industry Type <span className="text-red">*</span></label>
                                        <select
                                            name="industryType"
                                            className="bhuneer-input"
                                            value={formData.industryType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Industry Type</option>
                                            {industryTypes.map((type, idx) => {
                                                const name = type.name || type.label || type.type || type;
                                                const key = type.id || type.code || idx;
                                                return <option key={key} value={name}>{name}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="bhuneer-label">Are you MSME?</label>
                                        <select name="isMSME" className="bhuneer-input" value={formData.isMSME} onChange={handleChange}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    {formData.isMSME === 'Yes' && (
                                        <div className="form-group">
                                            <label className="bhuneer-label">MSME Class</label>
                                            <select name="msmeType" className="bhuneer-input" value={formData.msmeType} onChange={handleChange}>
                                                <option value="">Select Class</option>
                                                <option value="Micro">Micro</option>
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="bhuneer-label">Is the project located in a Notified Wetland Area?</label>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="isWetland" value="No" checked={formData.isWetland === 'No'} onChange={handleChange} /> No
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="isWetland" value="Yes" checked={formData.isWetland === 'Yes'} onChange={handleChange} /> Yes
                                    </label>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div style={{
                                    padding: '1rem',
                                    background: '#fee2e2',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    color: '#991b1b'
                                }}>
                                    <strong>⚠️ Error:</strong> {error}
                                </div>
                            )}

                            {/* Check Button */}
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={handleCheck}
                                    className="bhuneer-submit-btn"
                                    style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #ffffff',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite',
                                                marginRight: '0.5rem'
                                            }}></span>
                                            Checking Eligibility...
                                        </>
                                    ) : (
                                        '🔍 Check Eligibility'
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* Result Modal / Section - Using API Response Structure */}
                        {result && resultData && (
                            <div style={{
                                marginTop: '2rem',
                                background:
                                    resultData.status === 'ELIGIBLE' ? '#eff6ff' :
                                        resultData.status === 'EXEMPT' ? '#ecfdf5' :
                                            resultData.status === 'NOT_ELIGIBLE' ? '#fef3c7' :
                                                resultData.status === 'ERROR' ? '#fef3c7' : '#fef2f2',
                                border: `2px solid ${resultData.status === 'ELIGIBLE' ? '#2563eb' :
                                        resultData.status === 'EXEMPT' ? '#059669' :
                                            resultData.status === 'NOT_ELIGIBLE' ? '#f59e0b' :
                                                resultData.status === 'ERROR' ? '#f59e0b' : '#dc2626'}`,
                                borderRadius: '10px',
                                padding: '2rem',
                                animation: 'fadeIn 0.5s ease-out'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                        {resultData.status === 'ELIGIBLE' ? '🎉' :
                                            resultData.status === 'EXEMPT' ? '✅' :
                                                resultData.status === 'NOT_ELIGIBLE' ? '⚠️' :
                                                    resultData.status === 'ERROR' ? '❌' : '🚫'}
                                    </div>
                                    <h2 style={{
                                        color:
                                            resultData.status === 'ELIGIBLE' ? '#1e40af' :
                                                resultData.status === 'EXEMPT' ? '#059669' :
                                                    resultData.status === 'NOT_ELIGIBLE' ? '#92400e' :
                                                        resultData.status === 'ERROR' ? '#92400e' : '#dc2626',
                                        margin: '0 0 1rem 0',
                                        fontSize: '2rem'
                                    }}>
                                        {resultData.title}
                                    </h2>
                                    <p style={{ fontSize: '1.2rem', color: '#374151', maxWidth: '700px', margin: '0 auto' }}>
                                        {resultData.message}
                                    </p>
                                </div>

                                {/* Show helpful info for NOT_ELIGIBLE */}
                                {resultData.status === 'NOT_ELIGIBLE' && (
                                    <div style={{
                                        background: '#fef9c3',
                                        border: '1px solid #fbbf24',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        <h3 style={{ margin: '0 0 1rem 0', color: '#78350f', fontSize: '1.1rem' }}>
                                            ℹ️ What does this mean?
                                        </h3>
                                        <p style={{ margin: '0 0 0.75rem 0', color: '#713f12', lineHeight: '1.6' }}>
                                            The system couldn't find classification data for the selected block. This could mean:
                                        </p>
                                        <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#713f12', lineHeight: '1.8' }}>
                                            <li>The block is not yet classified in the groundwater database</li>
                                            <li>The block name or ID doesn't match our records</li>
                                            <li>The district-block combination is invalid</li>
                                        </ul>
                                        <p style={{ margin: '1rem 0 0 0', color: '#78350f', fontWeight: 'bold' }}>
                                            💡 Suggestion: Please verify your location selection or contact CGWA for block classification status.
                                        </p>
                                    </div>
                                )}

                                {/* Details Section */}
                                {resultData.details && resultData.details.length > 0 && (
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        marginBottom: '2rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a', fontSize: '1.25rem' }}>
                                            📋 Application Details
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {resultData.details.map((detail, index) => (
                                                <div key={index} style={{
                                                    padding: '0.75rem',
                                                    background: '#f8fafc',
                                                    borderRadius: '6px',
                                                    borderLeft: '3px solid #3b82f6',
                                                    fontSize: '1rem',
                                                    color: '#1e293b'
                                                }}>
                                                    <strong>•</strong> {detail}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Block Info Section */}
                                {resultData.blockInfo && (
                                    <div style={{
                                        background: `${resultData.blockInfo.color}10`,
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        marginBottom: '2rem',
                                        border: `2px solid ${resultData.blockInfo.color}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ fontSize: '2.5rem' }}>
                                            {resultData.blockInfo.category === 'Safe' ? '🟢' :
                                                resultData.blockInfo.category === 'Semi-Critical' ? '🟡' :
                                                    resultData.blockInfo.category === 'Critical' ? '🟠' : '🔴'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{
                                                margin: '0 0 0.5rem 0',
                                                color: resultData.blockInfo.color,
                                                fontSize: '1.25rem'
                                            }}>
                                                Block Category: {resultData.blockInfo.category}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '1rem', color: '#4b5563' }}>
                                                {resultData.blockInfo.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    {resultData.status === 'ELIGIBLE' && (
                                        <button
                                            onClick={() => window.location.href = '/noc/application'}
                                            className="bhuneer-submit-btn"
                                            style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                                        >
                                            🚀 Proceed to Apply for NOC
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setResult(null)}
                                        className="bhuneer-secondary-btn"
                                        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                                    >
                                        🔄 Check Another Location
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <NOCFooter />
        </div>
    );
};

export default EligibilityChecker;
