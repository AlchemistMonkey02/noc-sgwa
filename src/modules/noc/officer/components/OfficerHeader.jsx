import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const OfficerHeader = ({ officer }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('nocOfficer');
        navigate('/noc/officer/login');
    };

    return (
        <div className="officer-header-container">
            {/* Top Bar */}
            <div className="officer-top-bar">
                <div className="officer-container officer-top-content">
                    <div>
                        GOVERNMENT OF INDIA | MINISTRY OF JAL SHAKTI
                    </div>
                    <div>
                        OFFICER PORTAL | 📞 Support: 1800-XXX-XXXX
                    </div>
                </div>
            </div>

            {/* Branding Section */}
            <div className="officer-container">
                <div className="officer-branding">
                    <div className="officer-logo-group">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '65px' }} />
                        <div className="officer-brand-text">
                            <h1>Central Ground Water Authority</h1>
                            <p>Department of Water Resources, River Development & Ganga Rejuvenation</p>
                        </div>
                    </div>

                    <div className="officer-user-info" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--officer-primary)' }}>{officer?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{officer?.role}</div>
                        <button
                            onClick={handleLogout}
                            style={{
                                marginTop: '5px',
                                background: 'transparent',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Rainbow Navigation */}
            <nav className="officer-rainbow-nav">
                <div className="officer-container" style={{ display: 'flex', width: '100%' }}>
                    <Link to="/noc/officer/dashboard" className="officer-nav-item">
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/noc/officer/dashboard" className="officer-nav-item">
                        <span>📋</span> Applications
                    </Link>
                    <Link to="/noc/officer/dashboard" className="officer-nav-item">
                        <span>👥</span> Applicants
                    </Link>
                    <Link to="/noc/officer/dashboard" className="officer-nav-item">
                        <span>📈</span> Reports
                    </Link>
                    <Link to="/noc/officer/dashboard" className="officer-nav-item">
                        <span>⚙️</span> Administration
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default OfficerHeader;
