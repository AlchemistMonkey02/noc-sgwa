import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import '../styles/public-landing.css';
import '../styles/public-guidelines.css';

const PublicGuidelines = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('act');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [location]);

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const tabs = [
        { id: 'act', label: 'Groundwater Act' },
        { id: 'fee', label: 'Fee Structure' },
        { id: 'eligibility', label: 'Eligibility Criteria' },
        { id: 'penalty', label: 'Penalty Provisions' },
        { id: 'environment', label: 'Environmental Compliance' },
        { id: 'bulk-water', label: 'Bulk Water Supply' },
        { id: 'saline-water', label: 'Saline Ground Water' },
        { id: 'water-audit', label: 'Annual Water Audits' },
        { id: 'hydro-report', label: 'Hydrogeological Report' },
        { id: 'pollution', label: 'Pollution Prevention' },
        { id: 'nbc-2016', label: 'NBC 2016 Standards' },
    ];

    return (
        <div className="gov-portal guidelines-page">
            <PublicHeader />

            <div className="guidelines-container">
                {/* Sidebar */}
                <div className="guidelines-sidebar">
                    <div className="guidelines-sidebar-header">
                        <h3 className="guidelines-sidebar-title">Guidelines & Notifications</h3>
                    </div>
                    <div className="guidelines-menu">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`guidelines-tab ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                ➤ {tab.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="guidelines-content">
                    {activeTab === 'act' && (
                        <div>
                            <h2>Rajasthan Groundwater Regulation – Legal Basis & Eligibility</h2>

                            <h3>⚖️ Legal Framework</h3>
                            <p>
                                Groundwater abstraction in the State of Rajasthan is governed under: <br />
                                <strong>Rajasthan Groundwater (Management and Regulation) Act, 2025</strong><br />
                                <em>(As notified by the Government of Rajasthan through Gazette Notification dated 10-02-2025)</em>
                            </p>
                            <div className="guidelines-alert info">
                                <span className="alert-icon">ℹ️</span>
                                <div className="alert-content">
                                    <p>
                                        This portal has been developed to facilitate online processing of applications in accordance with the above Act and applicable Rules, Orders, and Standard Operating Procedures (SOPs).<br />
                                        <strong>Fees collected under this portal constitute Non-Tax Government Revenue.</strong>
                                    </p>
                                </div>
                            </div>

                            <h3>Applicability of the Act</h3>
                            <p>The provisions of the Rajasthan Groundwater (Management and Regulation) Act, 2025 shall apply to:</p>
                            <ul className="guidelines-list">
                                <li>All groundwater abstraction structures within the State of Rajasthan.</li>
                                <li>Individuals, industries, infrastructure projects, commercial establishments, and institutions.</li>
                                <li>Existing as well as proposed groundwater abstraction activities.</li>
                            </ul>

                            <h3>✅ Eligibility Criteria for Grant of Groundwater NOC</h3>
                            <p>An applicant shall be eligible to apply for a Groundwater Abstraction NOC subject to fulfillment of the following conditions:</p>

                            <div className="info-grid">
                                <div className="info-card">
                                    <h4>1. Applicant Status</h4>
                                    <p>Must be a legally identifiable entity (Individual / Firm / Company / Government Body) authorized to carry out the activity.</p>
                                </div>
                                <div className="info-card">
                                    <h4>2. Land Ownership</h4>
                                    <p>Must possess valid land ownership documents or registered lease deed. Land use must be consistent with proposed use.</p>
                                </div>
                                <div className="info-card">
                                    <h4>3. Purpose</h4>
                                    <p>Abstraction only for recognized purposes: Industrial, Infrastructure, Commercial, Mining, or Drinking/Domestic.</p>
                                </div>
                                <div className="info-card">
                                    <h4>4. Resource Assessment</h4>
                                    <p>Eligibility depends on area classification (Safe, Semi-Critical, Critical, Over-Exploited) as per notified assessment.</p>
                                </div>
                            </div>

                            <ul className="guidelines-list" style={{ marginTop: '1rem' }}>
                                <li><strong>5. Water Requirement:</strong> Submission of total water requirement (KLD) and proposed abstraction quantity.</li>
                                <li><strong>6. Water Audit:</strong> Mandatory annual audit for abstraction &gt; 100 KLD.</li>
                                <li><strong>7. Rainwater Harvesting:</strong> Installation of RWH structures is mandatory.</li>
                                <li><strong>8. Wastewater Management:</strong> Treatment and reuse of wastewater; compliance with zero-discharge norms where applicable.</li>
                                <li><strong>9. Statutory Clearances:</strong> Possession of EC / CTE / CTO from Pollution Control Board where applicable.</li>
                                <li><strong>10. Monitoring:</strong> Installation of digital flow meters and telemetry systems.</li>
                            </ul>

                            <h3>🚫 Grounds for Rejection</h3>
                            <div className="guidelines-alert danger">
                                <span className="alert-icon">❌</span>
                                <div className="alert-content">
                                    <p>An application or issued NOC may be rejected, suspended, or cancelled if:</p>
                                    <ul className="guidelines-list" style={{ marginBottom: 0 }}>
                                        <li>False or misleading information is furnished.</li>
                                        <li>Unauthorized abstraction structures are found.</li>
                                        <li>Conditions of NOC are violated.</li>
                                        <li>Groundwater abstraction is prohibited in the area.</li>
                                    </ul>
                                </div>
                            </div>

                            <h3>🏛️ Authority Structure</h3>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th>Authority</th>
                                            <th>Role under the Act</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Sub-Divisional Officer (SDO)</td>
                                            <td>Competent Authority for NOC issuance</td>
                                        </tr>
                                        <tr>
                                            <td>District Collector</td>
                                            <td>Appellate and enforcement authority</td>
                                        </tr>
                                        <tr>
                                            <td>Groundwater Department (District)</td>
                                            <td>Technical evaluation and monitoring</td>
                                        </tr>
                                        <tr>
                                            <td>Groundwater Department (State HQ)</td>
                                            <td>State-level monitoring and analytics</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3>Exemptions (Where Applicable)</h3>
                            <div className="guidelines-alert success">
                                <span className="alert-icon">✓</span>
                                <div className="alert-content">
                                    <p>Certain categories may be exempted from NOC requirements (subject to verification):</p>
                                    <ul className="guidelines-list" style={{ marginBottom: 0 }}>
                                        <li>Agricultural and drinking water use (as notified).</li>
                                        <li>Hand pumps / small abstraction structures within prescribed limits.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fee' && (
                        <div>
                            <h2>Fee Structure (Effective Jan 2026)</h2>
                            <div className="guidelines-alert warning">
                                <span className="alert-icon">⚠️</span>
                                <div className="alert-content">
                                    <h4>Important: Penalty Provisions</h4>
                                    <p>
                                        Non-compliance with NOC conditions can attract severe penalties.
                                        <span
                                            onClick={() => setActiveTab('penalty')}
                                            style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                                        >
                                            View Penalty Details
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Application Fee</th>
                                            <th>Processing Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Industrial (Small)</td>
                                            <td>₹ 10,000</td>
                                            <td>₹ 5,000</td>
                                        </tr>
                                        <tr>
                                            <td>Industrial (Large)</td>
                                            <td>₹ 10,000</td>
                                            <td>₹ 25,000</td>
                                        </tr>
                                        <tr>
                                            <td>Infrastructure</td>
                                            <td>₹ 10,000</td>
                                            <td>₹ 10,000</td>
                                        </tr>
                                        <tr>
                                            <td>Mining</td>
                                            <td>₹ 10,000</td>
                                            <td>₹ 50,000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'eligibility' && (
                        <div>
                            <h2>Eligibility Criteria for NOC</h2>
                            <p>
                                Entities must meet the following criteria to be eligible for Groundwater Abstraction NOC:
                            </p>
                            <div className="info-grid">
                                <div className="info-card">
                                    <h4>1. Land Ownership</h4>
                                    <p>Applicant must have valid land ownership documents or lease agreement for the proposed site.</p>
                                </div>
                                <div className="info-card">
                                    <h4>2. Water Audit</h4>
                                    <p>For abstraction &gt; 100 KLD, a mandatory annual water audit by a certified auditor is required.</p>
                                </div>
                                <div className="info-card">
                                    <h4>3. Rainwater Harvesting</h4>
                                    <p>Implementation of rainwater harvesting structures is mandatory as per state guidelines.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'penalty' && (
                        <div>
                            <h2 style={{ color: '#dc2626' }}>⚠️ CGWA Penalty Provisions (2025–26)</h2>

                            <p>
                                The Central Ground Water Authority (CGWA) has made it mandatory for all industrial, commercial, mining, and infrastructure units to strictly comply with the conditions mentioned in their No Objection Certificate (NOC).
                                <br /><br />
                                <strong>Any non-compliance or violation of the approved terms will attract heavy penalties, legal action, and prosecution under the Environment (Protection) Act, 1986.</strong>
                            </p>

                            <h3>💰 Penalty Provisions</h3>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th>Violation Type</th>
                                            <th>Penalty Amount / Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Non-submission of Compliance Report</td>
                                            <td>₹ 50,000</td>
                                        </tr>
                                        <tr>
                                            <td>Non-installation of Digital Flow Meter with Telemetry</td>
                                            <td>₹ 2,00,000</td>
                                        </tr>
                                        <tr>
                                            <td>Unauthorized Abstraction / Expansion</td>
                                            <td>100% of Water Abstraction Charges & Environmental Compensation</td>
                                        </tr>
                                        <tr>
                                            <td>Injection of untreated/treated water into aquifer</td>
                                            <td>₹ 1,00,000 + Sealing of Structure</td>
                                        </tr>
                                        <tr>
                                            <td>Tampering with Telemetry System</td>
                                            <td>Sealing of Borewell + Legal Action</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <ul className="guidelines-list" style={{ color: '#ef4444' }}>
                                <li>Each violation will be treated separately, and cumulative penalties may apply.</li>
                                <li>The penalties are exclusive of any Environmental Compensation (EC) for illegal extraction.</li>
                                <li>In case of severe environmental damage, criminal prosecution may be initiated.</li>
                            </ul>

                            <div className="guidelines-alert warning">
                                <span className="alert-icon">🚨</span>
                                <div className="alert-content">
                                    <h4>Warning & Compliance Reminder</h4>
                                    <p>Failure to comply with NOC conditions will lead to:</p>
                                    <ul className="guidelines-list" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                        <li><strong>Immediate sealing</strong> of borewells or abstraction structures.</li>
                                        <li><strong>Disconnection of electricity</strong> supply.</li>
                                        <li><strong>Environmental compensation</strong> (Minimum ₹1,00,000).</li>
                                        <li><strong>Legal prosecution</strong> by District Magistrate or Authorized Officers.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="guidelines-alert success">
                                <span className="alert-icon">✅</span>
                                <div className="alert-content">
                                    <h4>Best Practices to Avoid Penalties</h4>
                                    <ul className="guidelines-list" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                        <li>Install and maintain <strong>Digital Water Flow Meters with Telemetry</strong>.</li>
                                        <li>Functioning <strong>Piezometers</strong> for monitoring water levels.</li>
                                        <li>Construct <strong>Recharge / Rainwater Harvesting Structures</strong> as per approved plan.</li>
                                        <li>Submit <strong>Annual Compliance Reports</strong> and photographic evidence online effectively.</li>
                                        <li>Renew your NOC before expiry.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'environment' && (
                        <div>
                            <h2>Environmental Compliance & Compensation</h2>

                            <div className="guidelines-alert danger">
                                <span className="alert-icon">⚖️</span>
                                <div className="alert-content">
                                    <p>
                                        Any commercial, industrial, mining, or infrastructure unit extracting groundwater without obtaining a valid No Objection Certificate (NOC) from the CGWA or respective State/UT Authority will be treated as <strong>illegal</strong> and subject to severe penalties, prosecution, and environmental compensation.
                                        <br /><br />
                                        Such activities directly violate the provisions of the <strong>Environment (Protection) Act, 1986</strong>, and will attract monetary penalties, sealing of borewells, disconnection of electricity supply, and criminal action.
                                    </p>
                                </div>
                            </div>

                            <h3>💧 Calculation of Environmental Compensation (ECGW)</h3>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderLeft: '5px solid #1e3a8a', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'monospace' }}>
                                    <strong>ECGW = Q × ECRGW × N × DF</strong>
                                </p>
                                <ul className="guidelines-list" style={{ marginBottom: 0 }}>
                                    <li><strong>ECGW:</strong> Environmental Compensation for Ground Water (₹)</li>
                                    <li><strong>Q:</strong> Groundwater Consumption (m³/day)</li>
                                    <li><strong>ECRGW:</strong> Environmental Compensation Rate (₹/m³)</li>
                                    <li><strong>N:</strong> No. of Days of illegal extraction</li>
                                    <li><strong>DF:</strong> Deterrence Factor</li>
                                </ul>
                                <p style={{ marginTop: '1rem', color: '#dc2626', fontWeight: 'bold' }}>
                                    ⚠️ Note: Minimum ECGW shall not be less than ₹1,00,000/- irrespective of consumption or location.
                                </p>
                            </div>

                            <h3>💦 Environmental Compensation Rates (ECRGW) in ₹/m³</h3>

                            <h4>1. Packaged Drinking Water Units</h4>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th rowSpan="2">Area Category</th>
                                            <th colSpan="4" style={{ textAlign: 'center' }}>Groundwater Withdrawal (m³/day)</th>
                                        </tr>
                                        <tr>
                                            <th>&lt;200</th>
                                            <th>200–&lt;1000</th>
                                            <th>1000–&lt;5000</th>
                                            <th>5000 & above</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Safe</td><td>₹12</td><td>₹18</td><td>₹24</td><td>₹30</td></tr>
                                        <tr><td>Semi-Critical</td><td>₹24</td><td>₹36</td><td>₹48</td><td>₹60</td></tr>
                                        <tr><td>Critical</td><td>₹36</td><td>₹48</td><td>₹66</td><td>₹90</td></tr>
                                        <tr><td>Over-Exploited</td><td>₹48</td><td>₹72</td><td>₹96</td><td>₹120</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h4>2. Mining & Infrastructure Dewatering Projects</h4>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th rowSpan="2">Area Category</th>
                                            <th colSpan="4" style={{ textAlign: 'center' }}>Groundwater Withdrawal (m³/day)</th>
                                        </tr>
                                        <tr>
                                            <th>&lt;200</th>
                                            <th>200–&lt;1000</th>
                                            <th>1000–&lt;5000</th>
                                            <th>5000 & above</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Safe</td><td>₹15</td><td>₹21</td><td>₹30</td><td>₹40</td></tr>
                                        <tr><td>Semi-Critical</td><td>₹30</td><td>₹45</td><td>₹60</td><td>₹75</td></tr>
                                        <tr><td>Critical</td><td>₹45</td><td>₹60</td><td>₹85</td><td>₹115</td></tr>
                                        <tr><td>Over-Exploited</td><td>₹60</td><td>₹90</td><td>₹120</td><td>₹150</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h4>3. Industrial Units</h4>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th rowSpan="2">Area Category</th>
                                            <th colSpan="4" style={{ textAlign: 'center' }}>Groundwater Withdrawal (m³/day)</th>
                                        </tr>
                                        <tr>
                                            <th>&lt;200</th>
                                            <th>200–&lt;1000</th>
                                            <th>1000–&lt;5000</th>
                                            <th>5000 & above</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Safe</td><td>₹20</td><td>₹30</td><td>₹40</td><td>₹50</td></tr>
                                        <tr><td>Semi-Critical</td><td>₹40</td><td>₹60</td><td>₹80</td><td>₹100</td></tr>
                                        <tr><td>Critical</td><td>₹60</td><td>₹80</td><td>₹110</td><td>₹150</td></tr>
                                        <tr><td>Over-Exploited</td><td>₹80</td><td>₹120</td><td>₹160</td><td>₹200</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3>⛔ Deterrent Factors (Illegal Extraction Period)</h3>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th>Groundwater Withdrawal (KLD)</th>
                                            <th>&lt;2 Years</th>
                                            <th>2–5 Years</th>
                                            <th>&gt;5 Years</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>&lt;1000</td><td>1.00</td><td>1.00</td><td>1.25</td></tr>
                                        <tr><td>1000–5000</td><td>1.00</td><td>1.00</td><td>1.50</td></tr>
                                        <tr><td>&gt;5000</td><td>1.00</td><td>1.25</td><td>2.00</td></tr>
                                    </tbody>
                                </table>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>* KLD = Kilolitres per day (1 KLD = 1 m³/day)</p>
                            </div>

                            <h3>🚨 Delegation of Powers (Section 13.0)</h3>
                            <p>CGWA has delegated powers to District Magistrates, Collectors, and Sub-Divisional Magistrates (Authorised Officers) to enforce the law against illegal groundwater extraction.</p>
                            <ul className="guidelines-list">
                                <li>Seal all unauthorized borewells/tubewells.</li>
                                <li>Disconnect electricity to illegal pumping units.</li>
                                <li>Launch prosecution against violators under Sections 15–21 of the Environment (Protection) Act, 1986.</li>
                            </ul>

                            <h3>📊 Groundwater Level Monitoring (Section 14.0)</h3>
                            <p>Projects extracting significant groundwater must install Piezometers equipped with Digital Water Level Recorders (DWLR) and telemetry systems for continuous monitoring.</p>

                            <h4>Mandatory Piezometers Required:</h4>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table" style={{ maxWidth: '600px' }}>
                                    <thead>
                                        <tr>
                                            <th>Groundwater Withdrawal (m³/day)</th>
                                            <th>No. of Piezometers Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>0–1000</td><td>1</td></tr>
                                        <tr><td>&gt;100 (Hard Rock Aquifer, Non-Industrial)</td><td>1</td></tr>
                                        <tr><td>&gt;500 (Alluvium Aquifer, Non-Industrial)</td><td>1</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bulk-water' && (
                        <div>
                            <h2>Guidelines for Bulk Water Supply</h2>
                            <h3>Overview</h3>
                            <p>
                                Mandatory for all private bulk water suppliers (tankers) to obtain NOC. Failure to comply attracts environmental penalties.
                            </p>

                            <h3>Essential Documentation</h3>
                            <ul className="guidelines-list">
                                <li>Proof of Land Ownership (Min 200 sq m).</li>
                                <li>Tanker Ownership/Lease Proof.</li>
                                <li>Groundwater Quality Report (BIS Standards).</li>
                            </ul>

                            <h3>Operating Conditions</h3>
                            <div className="guidelines-alert info">
                                <span className="alert-icon">💧</span>
                                <div className="alert-content">
                                    <ul className="guidelines-list" style={{ marginBottom: 0 }}>
                                        <li>Label tankers with "Potable Water".</li>
                                        <li>Install tamper-proof digital flow meters with telemetry.</li>
                                        <li>Annual calibration of meters.</li>
                                        <li>Water use strictly for drinking/domestic purposes.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'saline-water' && (
                        <div>
                            <h2>Saline Ground Water Guidelines</h2>
                            <div className="guidelines-alert info">
                                <span className="alert-icon">🌊</span>
                                <div className="alert-content">
                                    <h4>Exemption Benefit</h4>
                                    <p>
                                        Users utilizing saline groundwater (EC &gt; 5000 µS/cm) are exempted from abstraction charges but must obtain NOC.
                                    </p>
                                </div>
                            </div>
                            <h3>Key Conditions</h3>
                            <ul className="guidelines-list">
                                <li>Detailed proposal for saline water use (e.g., desalination, cooling).</li>
                                <li>Proper brine/effluent disposal plan to prevent soil/water contamination.</li>
                                <li>Regular monitoring of groundwater quality.</li>
                                <li>Rainwater harvesting is encouraged but not mandatory for purely saline abstraction in some cases.</li>
                            </ul>
                        </div>
                    )}

                    {activeTab === 'water-audit' && (
                        <div>
                            <h2>Annual Water Audits</h2>
                            <p>
                                Mandatory for industries abstracting &gt; 100 KLD. The audit balances water input, usage, and discharge.
                            </p>
                            <div className="info-grid">
                                <div className="info-card">
                                    <h4>Phase 1: Preliminary Survey</h4>
                                    <p>Initial assessment of water sources, distribution, and major consumption areas.</p>
                                </div>
                                <div className="info-card">
                                    <h4>Phase 2: Detailed Audit</h4>
                                    <p>Precise measurement of flows, leak detection, and efficiency analysis by certified auditors.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hydro-report' && (
                        <div>
                            <h2>Hydrogeological Assessment Report</h2>
                            <p>
                                A comprehensive report required for NOC technical evaluation. Must be prepared by an accredited hydrogeologist/agency.
                            </p>
                            <h3>10 Mandatory Components</h3>
                            <ol className="guidelines-list" style={{ paddingLeft: '2rem' }}>
                                <li>Project Overview & Location Details</li>
                                <li>Groundwater Conditions (Aquifer parameters)</li>
                                <li>Details of Proposed Borewells (Depth, design)</li>
                                <li>Geophysical Studies & Resource Computation</li>
                                <li>Mine Plan & Dewatering Details (if applicable)</li>
                                <li>Utilization of Pumped Water</li>
                                <li>Impact Assessment & Mitigation Plan</li>
                                <li>Wastewater Disposal Plan</li>
                                <li>Conservation Measures (RWH / Recycling)</li>
                                <li>Additional Site-specific Information</li>
                            </ol>
                        </div>
                    )}

                    {activeTab === 'pollution' && (
                        <div>
                            <h2>Pollution Prevention Guidelines</h2>
                            <p>
                                Critical measures for polluting industries (e.g., Tanneries, Chemicals, Dyeing) to protect aquifers.
                            </p>
                            <div className="guidelines-alert warning">
                                <span className="alert-icon">☢️</span>
                                <div className="alert-content">
                                    <h4>Mandatory Preventive Measures</h4>
                                    <ul className="guidelines-list" style={{ marginBottom: 0 }}>
                                        <li>Prohibition of treated/untreated water injection into aquifers.</li>
                                        <li>Construction of observation wells (Piezometers) for monitoring quality.</li>
                                        <li>Proper Wellhead Protection to prevent surface runoff entry.</li>
                                        <li>Use of non-corrosive casing materials in aggressive environments.</li>
                                        <li>Secure storage of hazardous chemicals/effluents.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'nbc-2016' && (
                        <div>
                            <h2>NBC 2016 Water Requirements</h2>
                            <p>
                                Standardized norms for estimating water demand as per National Building Code 2016.
                            </p>
                            <div className="guidelines-table-wrapper">
                                <table className="guidelines-table">
                                    <thead>
                                        <tr>
                                            <th>Building Type</th>
                                            <th>Consumption (LPCD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Residential (Population &lt; 20,000)</td>
                                            <td>135</td>
                                        </tr>
                                        <tr>
                                            <td>Residential (Population &gt; 20,000)</td>
                                            <td>150</td>
                                        </tr>
                                        <tr>
                                            <td>Factories (with Bathing)</td>
                                            <td>45</td>
                                        </tr>
                                        <tr>
                                            <td>Offices</td>
                                            <td>45</td>
                                        </tr>
                                        <tr>
                                            <td>Hospitals (min. beds)</td>
                                            <td>340</td>
                                        </tr>
                                        <tr>
                                            <td>Hotels (5 Star)</td>
                                            <td>320</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicGuidelines;
