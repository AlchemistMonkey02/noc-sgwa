import React from 'react';
import '../styles/noc-portal.css';

const NOCCertificate = ({ nocData }) => {
    const {
        nocNumber = 'RJ/CGWA/NOC/2026/001234',
        issueDate = '22-Jan-2026',
        validFrom = '22-Jan-2026',
        validUpto = '21-Jan-2029',
        applicantName = 'ABC Industries Pvt Ltd',
        projectName = 'Textile Manufacturing Unit',
        location = 'Plot No. 123, RIICO Industrial Area, Sanganer, Jaipur - 302029',
        district = 'Jaipur',
        block = 'Sanganer',
        tehsil = 'Sanganer',
        maxDailyExtraction = '150.25 m³/day',
        maxAnnualExtraction = '54,841.25 m³/year',
        purpose = 'Industrial Water Supply',
        conditions = [
            'Install digital flow meter with telemetry within 30 days of NOC issuance',
            'Install piezometer at GPS coordinates 26.8206°N, 75.8472°E within 60 days',
            'Submit quarterly groundwater monitoring reports by 15th of following month',
            'Implement rainwater harvesting structures as per approved plan within 90 days',
            'No groundwater withdrawal during monsoon season (July-September)',
            'Pay groundwater cess quarterly as per SGWA notification'
        ],
        approvedBy = 'Chief Engineer, SGWA',
        officerDesignation = 'Chief Engineer',
        issuePlace = 'Jaipur'
    } = nocData || {};

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // In a real implementation, this would call an API to generate PDF
        alert('NOC certificate will be downloaded as PDF');
    };

    return (
        <div className="noc-certificate-container">
            {/* Action Buttons - Hidden in print */}
            <div className="noc-actions no-print">
                <button className="bhuneer-submit-btn" onClick={handlePrint}>
                    🖨️ Print Certificate
                </button>
                <button className="bhuneer-submit-btn" onClick={handleDownload} style={{ marginLeft: '1rem' }}>
                    📥 Download PDF
                </button>
            </div>

            {/* Certificate Content */}
            <div className="noc-certificate-content">
                {/* Government Header */}
                <div className="noc-header">
                    <div className="noc-emblem">🏛️</div>
                    <h1 className="noc-govt-title">GOVERNMENT OF RAJASTHAN</h1>
                    <h2 className="noc-dept-title">State Groundwater Authority</h2>
                    <h3 className="noc-wing-title">Ground Water Department</h3>
                    <p className="noc-address">Jhalana Institutional Area, Jaipur - 302004</p>
                </div>

                <div className="noc-divider"></div>

                {/* NOC Title */}
                <div className="noc-title-section">
                    <h2 className="noc-main-title">NO OBJECTION CERTIFICATE</h2>
                    <p className="noc-subtitle">(For Groundwater Extraction)</p>
                </div>

                {/* NOC Number and Date */}
                <div className="noc-ref-section">
                    <div className="noc-ref-row">
                        <span className="noc-ref-label">NOC No:</span>
                        <span className="noc-ref-value"><strong>{nocNumber}</strong></span>
                    </div>
                    <div className="noc-ref-row">
                        <span className="noc-ref-label">Issue Date:</span>
                        <span className="noc-ref-value">{issueDate}</span>
                    </div>
                    <div className="noc-ref-row">
                        <span className="noc-ref-label">Valid From:</span>
                        <span className="noc-ref-value">{validFrom}</span>
                    </div>
                    <div className="noc-ref-row">
                        <span className="noc-ref-label">Valid Upto:</span>
                        <span className="noc-ref-value">{validUpto}</span>
                    </div>
                </div>

                <div className="noc-divider"></div>

                {/* Main Content */}
                <div className="noc-body">
                    <p className="noc-intro-text">
                        This is to certify that <strong>{applicantName}</strong> is hereby granted No Objection
                        Certificate for extraction of groundwater subject to the following particulars and conditions:
                    </p>

                    {/* Project Details */}
                    <div className="noc-section">
                        <h3 className="noc-section-title">PROJECT DETAILS</h3>
                        <table className="noc-details-table">
                            <tbody>
                                <tr>
                                    <td className="noc-table-label">Applicant Name:</td>
                                    <td className="noc-table-value">{applicantName}</td>
                                </tr>
                                <tr>
                                    <td className="noc-table-label">Project Name:</td>
                                    <td className="noc-table-value">{projectName}</td>
                                </tr>
                                <tr>
                                    <td className="noc-table-label">Location:</td>
                                    <td className="noc-table-value">{location}</td>
                                </tr>
                                <tr>
                                    <td className="noc-table-label">District:</td>
                                    <td className="noc-table-value">{district}</td>
                                </tr>
                                <tr>
                                    <td className="noc-table-label">Block/Tehsil:</td>
                                    <td className="noc-table-value">{block} / {tehsil}</td>
                                </tr>
                                <tr>
                                    <td className="noc-table-label">Purpose:</td>
                                    <td className="noc-table-value">{purpose}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Extraction Limits */}
                    <div className="noc-section">
                        <h3 className="noc-section-title">EXTRACTION LIMITS</h3>
                        <table className="noc-details-table">
                            <tbody>
                                <tr>
                                    <td className="noc-table-label">Maximum Daily Extraction:</td>
                                    <td className="noc-table-value"><strong>{maxDailyExtraction}</strong></td>
                                </tr>
                                <tr>
                                    <td className="noc-table-label">Maximum Annual Extraction:</td>
                                    <td className="noc-table-value"><strong>{maxAnnualExtraction}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Conditions */}
                    <div className="noc-section">
                        <h3 className="noc-section-title">CONDITIONS</h3>
                        <ol className="noc-conditions-list">
                            {conditions.map((condition, index) => (
                                <li key={index} className="noc-condition-item">{condition}</li>
                            ))}
                            <li className="noc-condition-item">
                                This NOC is valid only for the specified location and project. Any change in project
                                scope or location will require a fresh NOC.
                            </li>
                            <li className="noc-condition-item">
                                Violation of any of the above conditions will lead to cancellation of this NOC and
                                legal action as per applicable laws.
                            </li>
                        </ol>
                    </div>

                    {/* Disclaimer */}
                    <div className="noc-section">
                        <p className="noc-disclaimer">
                            <strong>Note:</strong> This NOC is issued based on the information provided by the applicant.
                            The State Groundwater Authority reserves the right to cancel or modify this NOC if any
                            information is found to be false or if conditions are violated.
                        </p>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="noc-signature-section">
                    <div className="noc-signature-block">
                        <p className="noc-signature-name"><strong>{approvedBy}</strong></p>
                        <p className="noc-signature-designation">{officerDesignation}</p>
                        <p className="noc-signature-dept">State Groundwater Authority, Rajasthan</p>
                        <p className="noc-signature-place">Place: {issuePlace}</p>
                        <p className="noc-signature-date">Date: {issueDate}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="noc-footer">
                    <p className="noc-footer-text">
                        This is a computer-generated certificate and does not require a physical signature.
                    </p>
                    <p className="noc-footer-text">
                        For verification, please visit: <strong>https://sgwa.raj.in/verify/{nocNumber}</strong>
                    </p>
                </div>

                {/* QR Code Placeholder */}
                <div className="noc-qr-section">
                    <div className="noc-qr-placeholder">QR Code</div>
                    <p className="noc-qr-text">Scan to verify</p>
                </div>
            </div>
        </div>
    );
};

export default NOCCertificate;
