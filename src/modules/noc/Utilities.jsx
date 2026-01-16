import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import Sidebar from './components/Sidebar';
import './styles/noc-portal.css';

const Utilities = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTool, setActiveTool] = useState('block-category');

    const tools = [
        { id: 'block-category', icon: '🗺️', name: 'Block Category Checker', desc: 'Check groundwater category of your block' },
        { id: 'district-finder', icon: '📍', name: 'District Finder', desc: 'Find district information' },
        { id: 'assessment-unit', icon: '🏢', name: 'Assessment Unit Lookup', desc: 'Lookup assessment unit details' },
        { id: 'water-calculator', icon: '💧', name: 'Water Budget Calculator', desc: 'Calculate water requirements' }
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
                            {activeTool === 'block-category' && (
                                <form className="utility-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>State *</label>
                                            <select required>
                                                <option value="">Select State</option>
                                                <option value="rajasthan">Rajasthan</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>District *</label>
                                            <select required>
                                                <option value="">Select District</option>
                                                <option value="jaipur">Jaipur</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Block *</label>
                                        <select required>
                                            <option value="">Select Block</option>
                                            <option value="sanganer">Sanganer</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-primary">Check Category</button>

                                    <div className="result-box" style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Category Result</h3>
                                        <p style={{ margin: 0, color: '#64748b' }}>Select a block to view its groundwater category</p>
                                    </div>
                                </form>
                            )}

                            {activeTool !== 'block-category' && (
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
