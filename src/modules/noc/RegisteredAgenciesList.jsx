import React, { useState, useMemo } from 'react';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

// Mock data for registered agencies
const MOCK_AGENCIES = [
    {
        id: 'RDA-RAJ-2024-001',
        name: 'Sharma Drilling & Borewell Agency',
        ownerName: 'Rajesh Sharma',
        district: 'Jaipur',
        contactNumber: '+91 98290 12345',
        registrationDate: '2024-01-15',
        validityDate: '2027-01-14',
        rigTypes: ['Truck Mounted', 'DTH Hydraulic'],
        rigsCount: 5,
        status: 'Active',
        email: 'sharma.drilling@example.com'
    },
    {
        id: 'RDA-RAJ-2024-002',
        name: 'Verma Earthworks & Drilling',
        ownerName: 'Anil Verma',
        district: 'Jodhpur',
        contactNumber: '+91 98291 23456',
        registrationDate: '2024-02-20',
        validityDate: '2027-02-19',
        rigTypes: ['DTH Hydraulic', 'Portable'],
        rigsCount: 3,
        status: 'Active',
        email: 'verma.earthworks@example.com'
    },
    {
        id: 'RDA-RAJ-2023-015',
        name: 'Rajputana Boring Services',
        ownerName: 'Vikram Singh',
        district: 'Udaipur',
        contactNumber: '+91 98292 34567',
        registrationDate: '2023-06-10',
        validityDate: '2026-06-09',
        rigTypes: ['Truck Mounted'],
        rigsCount: 8,
        status: 'Active',
        email: 'rajputana.boring@example.com'
    },
    {
        id: 'RDA-RAJ-2024-003',
        name: 'Desert Drill Tech',
        ownerName: 'Mohammed Khan',
        district: 'Bikaner',
        contactNumber: '+91 98293 45678',
        registrationDate: '2024-03-05',
        validityDate: '2027-03-04',
        rigTypes: ['Truck Mounted', 'DTH Hydraulic', 'Portable'],
        rigsCount: 12,
        status: 'Active',
        email: 'desert.drilltech@example.com'
    },
    {
        id: 'RDA-RAJ-2023-008',
        name: 'Mewar Water Solutions',
        ownerName: 'Suresh Patel',
        district: 'Kota',
        contactNumber: '+91 98294 56789',
        registrationDate: '2023-04-12',
        validityDate: '2026-04-11',
        rigTypes: ['DTH Hydraulic'],
        rigsCount: 4,
        status: 'Active',
        email: 'mewar.water@example.com'
    },
    {
        id: 'RDA-RAJ-2022-025',
        name: 'Old Rajasthan Borewells',
        ownerName: 'Ram Gopal',
        district: 'Jaipur',
        contactNumber: '+91 98295 67890',
        registrationDate: '2022-08-20',
        validityDate: '2025-08-19',
        rigTypes: ['Portable'],
        rigsCount: 2,
        status: 'Expiring Soon',
        email: 'old.rajasthan@example.com'
    },
    {
        id: 'RDA-RAJ-2021-010',
        name: 'Legacy Drilling Co.',
        ownerName: 'Ashok Kumar',
        district: 'Ajmer',
        contactNumber: '+91 98296 78901',
        registrationDate: '2021-11-15',
        validityDate: '2024-11-14',
        rigTypes: ['Truck Mounted'],
        rigsCount: 1,
        status: 'Expired',
        email: 'legacy.drilling@example.com'
    },
    {
        id: 'RDA-RAJ-2024-004',
        name: 'Aravalli Groundwater Services',
        ownerName: 'Dinesh Jain',
        district: 'Sirohi',
        contactNumber: '+91 98297 89012',
        registrationDate: '2024-04-22',
        validityDate: '2027-04-21',
        rigTypes: ['DTH Hydraulic', 'Truck Mounted'],
        rigsCount: 6,
        status: 'Active',
        email: 'aravalli.gw@example.com'
    }
];

const DISTRICTS = ['All Districts', 'Jaipur', 'Jodhpur', 'Udaipur', 'Bikaner', 'Kota', 'Ajmer', 'Sirohi'];
const RIG_TYPES = ['All Types', 'Truck Mounted', 'DTH Hydraulic', 'Portable'];
const STATUSES = ['All Status', 'Active', 'Expiring Soon', 'Expired'];

const RegisteredAgenciesList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('All Districts');
    const [filterRigType, setFilterRigType] = useState('All Types');
    const [filterStatus, setFilterStatus] = useState('All Status');

    const filteredAgencies = useMemo(() => {
        return MOCK_AGENCIES.filter(agency => {
            const matchesSearch =
                agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agency.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agency.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDistrict = filterDistrict === 'All Districts' || agency.district === filterDistrict;
            const matchesRigType = filterRigType === 'All Types' || agency.rigTypes.includes(filterRigType);
            const matchesStatus = filterStatus === 'All Status' || agency.status === filterStatus;

            return matchesSearch && matchesDistrict && matchesRigType && matchesStatus;
        });
    }, [searchTerm, filterDistrict, filterRigType, filterStatus]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':
                return { background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
            case 'Expiring Soon':
                return { background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
            case 'Expired':
                return { background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
            default:
                return { background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' };
        }
    };

    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
            <NOCHeader />

            <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ color: '#0f4c81', fontSize: '2rem', fontWeight: '700', margin: '0 0 10px 0' }}>
                        List of Registered Drilling Agencies
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        Browse all drilling agencies registered with Rajasthan Ground Water Department
                    </p>
                </div>

                {/* Search and Filters */}
                <div style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    marginBottom: '25px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {/* Search */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Name, ID, Owner..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* District Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                District
                            </label>
                            <select
                                value={filterDistrict}
                                onChange={(e) => setFilterDistrict(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {DISTRICTS.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rig Type Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Rig Type
                            </label>
                            <select
                                value={filterRigType}
                                onChange={(e) => setFilterRigType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {RIG_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                        Showing {filteredAgencies.length} of {MOCK_AGENCIES.length} agencies
                    </div>
                </div>

                {/* Agencies Table */}
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registration ID</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agency Name</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Owner</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>District</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rig Types</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rigs Count</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valid Until</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAgencies.map((agency, index) => (
                                    <tr key={agency.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', fontWeight: '600', color: '#0f4c81' }}>{agency.id}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{agency.name}</td>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>{agency.ownerName}</td>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>{agency.district}</td>
                                        <td style={{ padding: '15px', fontSize: '0.8rem', color: '#64748b' }}>
                                            {agency.rigTypes.join(', ')}
                                        </td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '700', color: '#334155', textAlign: 'center' }}>{agency.rigsCount}</td>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>
                                            {new Date(agency.validityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={getStatusStyle(agency.status)}>
                                                {agency.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredAgencies.length === 0 && (
                            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔍</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '5px' }}>No agencies found</div>
                                <div style={{ fontSize: '0.9rem' }}>Try adjusting your search or filters</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Note */}
                <div style={{
                    marginTop: '25px',
                    padding: '15px 20px',
                    background: '#eff6ff',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6',
                    fontSize: '0.85rem',
                    color: '#1e40af'
                }}>
                    <strong>Note:</strong> This list is updated regularly. For verification or inquiries, please contact the Rajasthan Ground Water Department.
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default RegisteredAgenciesList;
