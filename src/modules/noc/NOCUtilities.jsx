import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CommonPlaceholder from './components/CommonPlaceholder';

const NOCUtilities = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tool') || 'district-finder';

    const tabs = [
        { id: 'district-finder', label: 'District Finder' },
        { id: 'assessment-unit', label: 'Assessment Unit Lookup' }
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tool: tabId });
    };

    return (
        <CommonPlaceholder
            title="Utilities"
            subtitle="Helpful tools for application process"
            breadcrumb="Utilities"
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
        >
            <div style={{ padding: '0 2rem' }}>
                {currentTab === 'district-finder' && (
                    <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Know Your District Status</h2>
                        </div>
                        <div className="card-content-area">
                            <form>
                                <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="bhuneer-label">State</label>
                                        <select className="bhuneer-input">
                                            <option>Rajasthan</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="bhuneer-label">District</label>
                                        <select className="bhuneer-input">
                                            <option value="">Select District</option>
                                            <option value="Jaipur">Jaipur</option>
                                            <option value="Jodhpur">Jodhpur</option>
                                            <option value="Udaipur">Udaipur</option>
                                            <option value="Barmer">Barmer</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                    <button className="bhuneer-submit-btn">Check Status</button>
                                </div>
                            </form>

                            {/* Result Demo */}
                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#166534' }}>District Profile: Jaipur</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><strong>No. of Blocks:</strong> 15</div>
                                    <div><strong>Over-Exploited Blocks:</strong> 4</div>
                                    <div><strong>Critical Blocks:</strong> 2</div>
                                    <div><strong>Semi-Critical Blocks:</strong> 3</div>
                                    <div><strong>Safe Blocks:</strong> 6</div>
                                    <div><strong>Notification Status:</strong> Notified for regulation</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'assessment-unit' && (
                    <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Assessment Unit Locator</h2>
                        </div>
                        <div className="card-content-area">
                            <p className="text-gray" style={{ marginBottom: '1.5rem' }}>Locate the exact assessment unit (Block/Taluka) for your project site.</p>
                            <form>
                                <div className="form-group">
                                    <label className="bhuneer-label">Search by Village / Pin Code</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input type="text" className="bhuneer-input" placeholder="Enter Village Name or Pin Code" style={{ flex: 1 }} />
                                        <button className="bhuneer-submit-btn">Search</button>
                                    </div>
                                </div>
                            </form>

                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Search Results</h4>
                                <div className="professional-table-wrapper">
                                    <table className="professional-table">
                                        <thead>
                                            <tr>
                                                <th>Village</th>
                                                <th>Block</th>
                                                <th>District</th>
                                                <th>Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Amer</td>
                                                <td>Amer</td>
                                                <td>Jaipur</td>
                                                <td><span className="status-badge danger">Over-Exploited</span></td>
                                            </tr>
                                            <tr>
                                                <td>Sanganer</td>
                                                <td>Sanganer</td>
                                                <td>Jaipur</td>
                                                <td><span className="status-badge warning">Critical</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CommonPlaceholder>
    );
};

export default NOCUtilities;
