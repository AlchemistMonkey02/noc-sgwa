// Penalties Information - Know Your Penalties
// Static listing of penalties for non-compliance and correction/modification charges

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import './styles/noc-portal.css';

const penaltyItems = [
    { sr: 1, description: 'Non installation/faulty Digital water Flow meter with telemetry system.', rate: 200000 },
    { sr: 2, description: 'Non disclosure/ construction of additional groundwater abstraction structures (Functional / Non-Functional Structures.)', rate: 200000 },
    { sr: 3, description: 'Non disclosure/ construction of additional groundwater abstraction structures(b) Defunct/Abandoned)', rate: 100000 },
    { sr: 4, description: 'Reporting of fresh water zones as Brackish / Saline zones in application.', rate: 200000 },
    { sr: 5, description: 'Non Installation of Piezometer.', rate: 200000 },
    { sr: 6, description: 'Non installation/faulty DWLR/Telemetry system', rate: 100000 },
    { sr: 7, description: 'Non Construction/inadequate capacity of Recharge / Water conservation structures.', rate: 500000 },
    { sr: 8, description: 'Non maintenance of Recharge structures.', rate: 200000 },
    { sr: 9, description: 'Injection of treated/untreated water into the aquifer system. Note: In addition to penalty, the proponent shall bear the cost of aquifer remediation as per the provisions of Environment (Protection) Act, 1986.', rate: 1000000 },
    { sr: 10, description: 'Non Submission of Water level/Water quality Data.', rate: 50000 },
    { sr: 11, description: 'Non-maintenance of log book of daily withdrawal/non submission of Groundwater abstraction data.', rate: 50000 },
    { sr: 12, description: 'Non submission of photograph of recharge structure(s).', rate: 50000 },
    { sr: 13, description: 'Non Submission of Self Compliance report.', rate: 100000 },
    { sr: 14, description: 'Construction of groundwater abstraction structures by un authorized/unregistered Drilling Rigs (per structures).', rate: 100000 },
    { sr: 15, description: 'Non registration of water supply tankers.', rate: 500000 },
    { sr: 16, description: 'Non registration of drilling rigs.', rate: 200000 },
    { sr: 17, description: 'Late submission', rate: 100000 },
    { sr: 18, description: 'Revival charges', rate: 10000 },
    { sr: 19, description: 'Submission of false information / undertaking', rate: 100000 }
];

const modificationCharges = [
    { sr: 1, description: 'Change in recharge quantum', rate: 10000 },
    { sr: 2, description: 'Change/Associate User ID.', rate: 5000 },
    { sr: 3, description: 'Change in firm Name', rate: 5000 },
    { sr: 4, description: 'Extension of NOC', rate: 5000 },
    { sr: 5, description: 'Issuance of duplicate NOC', rate: 5000 },
    { sr: 6, description: 'Issuance of corrigendum to NOC', rate: 5000 },
    { sr: 7, description: 'Any other items/corrections etc', rate: 500 }
];

const PenaltiesInfo = () => {
    const navigate = useNavigate();

    const { user } = useAuth();
 
    useEffect(() => {
        if (!user) {
            navigate('/noc/login');
        }
    }, [user, navigate]);

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-card">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h1 style={{
                            color: 'var(--cgwa-primary)',
                            margin: 0,
                            fontSize: '2rem',
                            borderBottom: '3px solid var(--cgwa-primary)',
                            paddingBottom: '10px',
                            flex: 1
                        }}>
                            Know Your Penalties
                        </h1>
                        <Link to="/noc/dashboard" className="noc-btn noc-btn-outline" style={{ marginLeft: '15px' }}>
                            ← Back to Dashboard
                        </Link>
                    </div>

                    {/* Penalties Table */}
                    <div className="noc-card" style={{ padding: 0, overflowX: 'auto' }}>
                        <div className="noc-card-header">Penalties for Non-Compliance of NOC Conditions</div>
                        <table className="noc-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Sr No</th>
                                    <th>Penalty Description</th>
                                    <th style={{ width: '160px', textAlign: 'right' }}>Rate (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penaltyItems.map(item => (
                                    <tr key={item.sr}>
                                        <td>{item.sr}</td>
                                        <td>{item.description}</td>
                                        <td style={{ textAlign: 'right' }}>{item.rate.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Modification Charges */}
                    <div className="noc-card" style={{ padding: 0, marginTop: '30px', overflowX: 'auto' }}>
                        <div className="noc-card-header">Proposed Charges for Correction/Modification in Existing Issued NOC</div>
                        <table className="noc-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Sr No</th>
                                    <th>Correction/Modification Charge Description</th>
                                    <th style={{ width: '160px', textAlign: 'right' }}>Rate (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modificationCharges.map(item => (
                                    <tr key={item.sr}>
                                        <td>{item.sr}</td>
                                        <td>{item.description}</td>
                                        <td style={{ textAlign: 'right' }}>{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="noc-alert noc-alert-info" style={{ marginTop: '20px' }}>
                        <strong>Note:</strong> These are indicative penalties/charges. Final penalties/charges will be as per authority orders and applicable regulations.
                    </div>
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default PenaltiesInfo;

