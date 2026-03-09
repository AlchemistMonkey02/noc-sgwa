import React from 'react';
import { Link } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const RigRegistrationPermit = () => {
    const documentRequirements = [
        'Valid Identity Proof (Aadhaar/PAN/Voter ID)',
        'Business Registration Certificate (for firms/companies)',
        'Technical Specifications of Drilling Rig(s)',
        'Manufacturer\'s Certificate for Rig Equipment',
        'Proof of Rig Ownership or Lease Agreement',
        'Insurance Certificate for Rig(s)',
        'Operator\'s Qualification Certificates',
        'Pollution Control Certificate (if applicable)',
        'GST Registration Certificate',
        'Address Proof of Business Location'
    ];

    const registrationSteps = [
        {
            step: 1,
            title: 'Account Creation',
            description: 'Register on the RGSWA portal and verify your email/mobile number',
            icon: '👤'
        },
        {
            step: 2,
            title: 'Document Preparation',
            description: 'Prepare all required documents in PDF format (max 2MB each)',
            icon: '📄'
        },
        {
            step: 3,
            title: 'Online Application',
            description: 'Fill the rig registration form with complete details',
            icon: '✍️'
        },
        {
            step: 4,
            title: 'Fee Payment',
            description: 'Pay registration fee of ₹10,000 + GST via online payment gateway',
            icon: '💳'
        },
        {
            step: 5,
            title: 'Document Upload',
            description: 'Upload all required documents and submit the application',
            icon: '📤'
        },
        {
            step: 6,
            title: 'Verification',
            description: 'Department will verify documents and conduct inspection if required',
            icon: '🔍'
        },
        {
            step: 7,
            title: 'Approval & Certificate',
            description: 'Upon approval, download your registration certificate',
            icon: '✅'
        }
    ];

    const rigTypes = [
        { name: 'Truck Mounted Rig', capacity: 'Up to 450m depth', fee: '₹10,000' },
        { name: 'DTH Hydraulic Rig', capacity: 'Up to 350m depth', fee: '₹10,000' },
        { name: 'Portable Rig', capacity: 'Up to 150m depth', fee: '₹10,000' },
        { name: 'Crawler Mounted Rig', capacity: 'Up to 500m depth', fee: '₹10,000' }
    ];

    return (
        <div className="noc-portal" style={{ background: 'white', minHeight: '100vh' }}>
            <NOCHeader />

            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: '#0f4c81', fontSize: '2.2rem', fontWeight: '700', margin: '0 0 15px 0' }}>
                        Rig Registration & Drilling Permit
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Complete guide to register your drilling rig and obtain drilling permits in Rajasthan
                    </p>
                </div>

                {/* Overview Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
                    padding: '30px',
                    borderRadius: '12px',
                    marginBottom: '40px',
                    color: 'white'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0' }}>📋 Registration Overview</h2>
                    <p style={{ margin: '0 0 15px 0', lineHeight: '1.7', opacity: 0.95 }}>
                        All drilling rigs operating in Rajasthan must be registered with the Rajasthan Ground Water Department.
                        Registration ensures compliance with groundwater regulations and maintains a registry of authorized drilling agencies.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏱️</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Processing Time</div>
                            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>15-30 Days</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>💰</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Registration Fee</div>
                            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>₹10,000 + 18% GST</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📅</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Validity Period</div>
                            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>3 Years (Renewable)</div>
                        </div>
                    </div>
                </div>

                {/* Registration Steps */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Registration Process
                    </h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {registrationSteps.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '20px',
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px solid #e2e8f0',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    minWidth: '60px',
                                    textAlign: 'center'
                                }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#eff6ff',
                                        color: '#1e40af',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        marginBottom: '8px'
                                    }}>
                                        Step {item.step}
                                    </div>
                                    <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px 0' }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rig Types & Fees */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Rig Types & Registration Fees
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
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>RIG TYPE</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>DRILLING CAPACITY</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>REGISTRATION FEE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rigTypes.map((rig, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{rig.name}</td>
                                        <td style={{ padding: '15px', fontSize: '0.85rem', color: '#475569' }}>{rig.capacity}</td>
                                        <td style={{ padding: '15px', fontSize: '0.95rem', fontWeight: '700', color: '#0f4c81' }}>{rig.fee} + GST</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Document Requirements */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#0f4c81', fontSize: '1.8rem', fontWeight: '700', marginBottom: '25px' }}>
                        Document Requirements
                    </h2>
                    <div style={{
                        background: 'white',
                        padding: '25px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {documentRequirements.map((doc, index) => (
                                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ color: '#22c55e', fontSize: '1.2rem', marginTop: '2px' }}>✓</div>
                                    <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>{doc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: '#fef3c7',
                            borderRadius: '6px',
                            borderLeft: '4px solid #f59e0b',
                            fontSize: '0.85rem',
                            color: '#92400e'
                        }}>
                            <strong>Note:</strong> All documents must be self-attested and uploaded in PDF format (max 2MB per file).
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    padding: '40px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px solid #bfdbfe'
                }}>
                    <h3 style={{ color: '#0f4c81', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0' }}>
                        Ready to Register Your Rig?
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 25px 0' }}>
                        Login to your account or create a new account to start the registration process
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/noc/login" style={{
                            display: 'inline-block',
                            padding: '12px 30px',
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
                        <Link to="?register=true" style={{
                            display: 'inline-block',
                            padding: '12px 30px',
                            background: 'white',
                            color: '#1e3a8a',
                            border: '2px solid #1e3a8a',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '700',
                            fontSize: '0.95rem'
                        }}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default RigRegistrationPermit;
