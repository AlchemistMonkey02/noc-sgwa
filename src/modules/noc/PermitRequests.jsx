import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

// Mock permit applications data
const MOCK_PERMITS = [
    {
        id: 'PERM-2024-001',
        type: 'Rig Operation Permit',
        applicantName: 'Sharma Drilling Agency',
        district: 'Jaipur',
        submissionDate: '2024-12-15',
        status: 'Approved',
        validUntil: '2025-12-14'
    },
    {
        id: 'PERM-2024-002',
        type: 'Drilling Permit',
        applicantName: 'Verma Earthworks',
        district: 'Jodhpur',
        submissionDate: '2024-12-20',
        status: 'Under Review',
        validUntil: null
    },
    {
        id: 'PERM-2024-003',
        type: 'Rig Operation Permit',
        applicantName: 'Desert Drill Tech',
        district: 'Bikaner',
        submissionDate: '2024-12-10',
        status: 'Approved',
        validUntil: '2025-12-09'
    },
    {
        id: 'PERM-2024-004',
        type: 'Renewal Permit',
        applicantName: 'Rajputana Boring Services',
        district: 'Udaipur',
        submissionDate: '2024-12-25',
        status: 'Pending Documents',
        validUntil: null
    },
    {
        id: 'PERM-2024-005',
        type: 'Drilling Permit',
        applicantName: 'Mewar Water Solutions',
        district: 'Kota',
        submissionDate: '2024-12-18',
        status: 'Rejected',
        validUntil: null
    }
];

const PERMIT_TYPES = [
    {
        title: 'Rig Operation Permit',
        description: 'Required for operating drilling rigs in designated areas',
        validity: '1 Year',
        fee: '₹10,000',
        icon: '🚜'
    },
    {
        title: 'Drilling Permit',
        description: 'Required for conducting drilling operations for specific projects',
        validity: '3-12 Months',
        fee: '₹5,000',
        icon: '⛏️'
    },
    {
        title: 'Renewal Permit',
        description: 'For renewing existing permits before expiration',
        validity: '1 Year',
        fee: '₹5,000',
        icon: '🔄'
    },
    {
        title: 'Amendment Permit',
        description: 'For modifying existing permit details or scope',
        validity: 'As per original',
        fee: '₹5,000',
        icon: '✏️'
    }
];

const PermitRequests = () => {
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [showAllPermits, setShowAllPermits] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        const found = MOCK_PERMITS.find(p => p.id.toLowerCase() === searchId.toLowerCase());
        setSearchResult(found || 'not_found');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved':
                return { background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            case 'Under Review':
                return { background: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            case 'Pending Documents':
                return { background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            case 'Rejected':
                return { background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
            default:
                return { background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' };
        }
    };

    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
            <NOCHeader />

            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: '#0f4c81', fontSize: '2.2rem', fontWeight: '700', margin: '0 0 15px 0' }}>
                        Permit Requests
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                        Track your permit application status or learn about permit types
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
                        🔍 Track Your Permit Status
                    </h2>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Enter Permit ID (e.g., PERM-2024-001)"
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
                        <div style={{ marginTop: '25px', padding: '20px', background: searchResult === 'not_found' ? '#fef2f2' : '#f0f9ff', borderRadius: '8px', border: `2px solid ${searchResult === 'not_found' ? '#fecaca' : '#bae6fd'}` }}>
                            {searchResult === 'not_found' ? (
                                <div>
                                    <div style={{ color: '#991b1b', fontWeight: '700', fontSize: '1rem', marginBottom: '8px' }}>❌ Permit Not Found</div>
                                    <div style={{ color: '#7f1d1d', fontSize: '0.9rem' }}>No permit found with ID: {searchId}. Please check the ID and try again.</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <div style={{ color: '#0f4c81', fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>{searchResult.id}</div>
                                            <div style={{ color: '#475569', fontSize: '0.9rem' }}>{searchResult.type}</div>
                                        </div>
                                        <div style={getStatusStyle(searchResult.status)}>{searchResult.status}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '0.85rem' }}>
                                        <div>
                                            <div style={{ color: '#64748b', marginBottom: '4px' }}>Applicant</div>
                                            <div style={{ color: '#1e293b', fontWeight: '600' }}>{searchResult.applicantName}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', marginBottom: '4px' }}>District</div>
                                            <div style={{ color: '#1e293b', fontWeight: '600' }}>{searchResult.district}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', marginBottom: '4px' }}>Submission Date</div>
                                            <div style={{ color: '#1e293b', fontWeight: '600' }}>{new Date(searchResult.submissionDate).toLocaleDateString('en-IN')}</div>
                                        </div>
                                        {searchResult.validUntil && (
                                            <div>
                                                <div style={{ color: '#64748b', marginBottom: '4px' }}>Valid Until</div>
                                                <div style={{ color: '#1e293b', fontWeight: '600' }}>{new Date(searchResult.validUntil).toLocaleDateString('en-IN')}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Permit Types */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Types of Permits
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {PERMIT_TYPES.map((permit, index) => (
                            <div key={index} style={{
                                background: 'white',
                                padding: '25px',
                                borderRadius: '10px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{permit.icon}</div>
                                <h3 style={{ color: '#0f4c81', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 10px 0' }}>
                                    {permit.title}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6', margin: '0 0 15px 0' }}>
                                    {permit.description}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                                    <div>
                                        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Validity</div>
                                        <div style={{ color: '#1e293b', fontWeight: '700' }}>{permit.validity}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Fee</div>
                                        <div style={{ color: '#0f4c81', fontWeight: '700' }}>{permit.fee}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Permits (Toggle) */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
                            Recent Permit Applications
                        </h2>
                        <button
                            onClick={() => setShowAllPermits(!showAllPermits)}
                            style={{
                                padding: '10px 20px',
                                background: showAllPermits ? '#e2e8f0' : '#1e3a8a',
                                color: showAllPermits ? '#334155' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            {showAllPermits ? 'Hide' : 'Show'} All
                        </button>
                    </div>

                    {showAllPermits && (
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
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>PERMIT ID</th>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>TYPE</th>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>DISTRICT</th>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>SUBMISSION</th>
                                        <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_PERMITS.map((permit, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px', fontSize: '0.85rem', fontWeight: '600', color: '#0f4c81' }}>{permit.id}</td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>{permit.type}</td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>{permit.district}</td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>{new Date(permit.submissionDate).toLocaleDateString('en-IN')}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={getStatusStyle(permit.status)}>{permit.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                        Need to Apply for a Permit?
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
                        Login to your account to submit a new permit application
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
                        Login to Apply
                    </Link>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default PermitRequests;
