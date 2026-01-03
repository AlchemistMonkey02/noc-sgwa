import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const MOCK_RENEWALS = [
    {
        id: 'RDA-RAJ-2024-001',
        name: 'Sharma Drilling Agency',
        registrationDate: '2024-01-15',
        expiryDate: '2027-01-14',
        daysRemaining: 750,
        status: 'Active',
        complianceStatus: 'Compliant'
    },
    {
        id: 'RDA-RAJ-2023-015',
        name: 'Rajputana Boring Services',
        registrationDate: '2023-06-10',
        expiryDate: '2026-06-09',
        daysRemaining: 520,
        status: 'Active',
        complianceStatus: 'Compliant'
    },
    {
        id: 'RDA-RAJ-2022-025',
        name: 'Old Rajasthan Borewells',
        registrationDate: '2022-08-20',
        expiryDate: '2025-08-19',
        daysRemaining: 230,
        status: 'Expiring Soon',
        complianceStatus: 'Action Required'
    },
    {
        id: 'RDA-RAJ-2021-010',
        name: 'Legacy Drilling Co.',
        registrationDate: '2021-11-15',
        expiryDate: '2024-11-14',
        daysRemaining: -45,
        status: 'Expired',
        complianceStatus: 'Non-Compliant'
    }
];

const COMPLIANCE_REQUIREMENTS = [
    { item: 'Annual Safety Inspection Report', frequency: 'Yearly', next: '2025-03-15' },
    { item: 'Equipment Maintenance Log', frequency: 'Quarterly', next: '2025-02-01' },
    { item: 'Operator Training Certificates', frequency: 'Annual', next: '2025-04-20' },
    { item: 'Insurance Policy Renewal', frequency: 'Yearly', next: '2025-05-10' },
    { item: 'Environmental Compliance Report', frequency: 'Half-yearly', next: '2025-06-30' }
];

const RenewalTracking = () => {
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const found = MOCK_RENEWALS.find(r => r.id.toLowerCase() === searchId.toLowerCase());
        setSearchResult(found || 'not_found');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':
                return { background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            case 'Expiring Soon':
                return { background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            case 'Expired':
                return { background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            default:
                return { background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
        }
    };

    const getComplianceStyle = (status) => {
        switch (status) {
            case 'Compliant':
                return { background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
            case 'Action Required':
                return { background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
            case 'Non-Compliant':
                return { background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
            default:
                return { background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
        }
    };

    const getDaysColor = (days) => {
        if (days < 0) return '#991b1b';
        if (days < 90) return '#92400e';
        if (days < 180) return '#ca8a04';
        return '#166534';
    };

    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
            <NOCHeader />

            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: '#0f4c81', fontSize: '2.2rem', fontWeight: '700', margin: '0 0 15px 0' }}>
                        Renewal and Compliance Tracking
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Track your registration renewal status and compliance requirements
                    </p>
                </div>

                {/* Search Section */}
                <div style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    marginBottom: '40px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.3rem', fontWeight: '700', margin: '0 0 20px 0' }}>
                        🔍 Check Your Renewal Status
                    </h2>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Enter Registration ID (e.g., RDA-RAJ-2024-001)"
                            value={searchId}
                            onChange={(e) => {
                                setSearchId(e.target.value);
                                setSearchResult(null);
                            }}
                            style={{
                                flex: '1',
                                minWidth: '300px',
                                padding: '14px 18px',
                                borderRadius: '8px',
                                border: '2px solid #e2e8f0',
                                fontSize: '0.95rem',
                                fontWeight: '500'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '14px 35px',
                                background: '#1e3a8a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                            }}
                        >
                            Search
                        </button>
                    </form>

                    {searchResult && (
                        <div style={{ marginTop: '25px', padding: '25px', background: searchResult === 'not_found' ? '#fef2f2' : '#f0f9ff', borderRadius: '8px', border: `2px solid ${searchResult === 'not_found' ? '#fecaca' : '#bae6fd'}` }}>
                            {searchResult === 'not_found' ? (
                                <div>
                                    <div style={{ color: '#991b1b', fontWeight: '700', fontSize: '1rem', marginBottom: '8px' }}>❌ Registration Not Found</div>
                                    <div style={{ color: '#7f1d1d', fontSize: '0.9rem' }}>No registration found with ID: {searchId}. Please check the ID and try again.</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <div style={{ color: '#0f4c81', fontSize: '1.3rem', fontWeight: '700', marginBottom: '5px' }}>{searchResult.name}</div>
                                            <div style={{ color: '#475569', fontSize: '0.9rem' }}>{searchResult.id}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <span style={getStatusStyle(searchResult.status)}>{searchResult.status}</span>
                                            <span style={getComplianceStyle(searchResult.complianceStatus)}>{searchResult.complianceStatus}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                        <div style={{ background: 'white', padding: '18px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '6px' }}>Registration Date</div>
                                            <div style={{ color: '#1e293b', fontWeight: '700', fontSize: '1rem' }}>
                                                {new Date(searchResult.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ background: 'white', padding: '18px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '6px' }}>Expiry Date</div>
                                            <div style={{ color: '#1e293b', fontWeight: '700', fontSize: '1rem' }}>
                                                {new Date(searchResult.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ background: 'white', padding: '18px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '6px' }}>Days Remaining</div>
                                            <div style={{ color: getDaysColor(searchResult.daysRemaining), fontWeight: '700', fontSize: '1.3rem' }}>
                                                {searchResult.daysRemaining < 0 ? 'Expired' : `${searchResult.daysRemaining} days`}
                                            </div>
                                        </div>
                                    </div>

                                    {searchResult.daysRemaining > 0 && searchResult.daysRemaining < 180 && (
                                        <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
                                            <strong style={{ color: '#92400e' }}>⚠️ Renewal Reminder:</strong>
                                            <span style={{ color: '#78350f', fontSize: '0.9rem', marginLeft: '8px' }}>
                                                Your registration is expiring soon. Please initiate the renewal process.
                                            </span>
                                        </div>
                                    )}

                                    {searchResult.daysRemaining < 0 && (
                                        <div style={{ padding: '15px', background: '#fee2e2', borderRadius: '6px', borderLeft: '4px solid #dc2626' }}>
                                            <strong style={{ color: '#991b1b' }}>❌ Registration Expired:</strong>
                                            <span style={{ color: '#7f1d1d', fontSize: '0.9rem', marginLeft: '8px' }}>
                                                Your registration has expired. Renew immediately to continue operations.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Renewal Process */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Renewal Process & Timeline
                    </h2>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem' }}>📅</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: '#0f4c81', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>When to Renew</h3>
                                    <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
                                        Applications for renewal should be submitted at least <strong>90 days before</strong> the expiry date.
                                        Late renewals may attract penalty fees.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem' }}>💰</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: '#0f4c81', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>Renewal Fees</h3>
                                    <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
                                        Standard renewal fee: <strong>₹5,000 + GST</strong><br />
                                        Late renewal penalty: <strong>₹2,000 additional</strong> (if renewed after expiry)
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem' }}>📄</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: '#0f4c81', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>Required Documents</h3>
                                    <ul style={{ color: '#64748b', margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: '1.8', fontSize: '0.9rem' }}>
                                        <li>Copy of original registration certificate</li>
                                        <li>Updated insurance certificates for all rigs</li>
                                        <li>Latest safety inspection reports</li>
                                        <li>Compliance certificates (if any pending)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Requirements */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Ongoing Compliance Requirements
                    </h2>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>COMPLIANCE ITEM</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>FREQUENCY</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>NEXT DUE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPLIANCE_REQUIREMENTS.map((req, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{req.item}</td>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                {req.frequency}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                                            {new Date(req.next).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA */}
                <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    padding: '35px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px solid #bfdbfe'
                }}>
                    <h3 style={{ color: '#0f4c81', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                        Ready to Renew Your Registration?
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
                        Login to your account to submit a renewal application
                    </p>
                    <Link to="/noc/login" style={{
                        display: 'inline-block',
                        padding: '12px 35px',
                        background: '#1e3a8a',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                    }}>
                        Login to Renew
                    </Link>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default RenewalTracking;
