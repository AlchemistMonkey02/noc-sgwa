import React from 'react';
import jsPDF from 'jspdf';

const ExemptionCertificate = ({ formData, exemptionResult, onDownload, onSubmit }) => {
    const generateCertificateNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `EXP/${year}/${exemptionResult.exemptionCode}/${random}`;
    };

    const certificateNumber = generateCertificateNumber();
    const issueDate = new Date().toLocaleDateString('en-IN');

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(13, 74, 143);
        doc.text('EXEMPTION CERTIFICATE', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('State Groundwater Authority, Rajasthan', 105, 30, { align: 'center' });

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        // Certificate Number and Date
        doc.setFontSize(10);
        doc.text(`Certificate No: ${certificateNumber}`, 20, 50);
        doc.text(`Date of Issue: ${issueDate}`, 20, 57);

        // Main Content
        doc.setFontSize(12);
        doc.text('This is to certify that:', 20, 70);

        // Applicant Details
        doc.setFont(undefined, 'bold');
        doc.text('Applicant Details:', 20, 80);
        doc.setFont(undefined, 'normal');
        doc.text(`Name: ${formData.applicantName || 'N/A'}`, 30, 88);
        doc.text(`Organization: ${formData.organizationName || 'Individual'}`, 30, 95);
        doc.text(`Purpose: ${formData.groundWaterUtilizationFor || 'N/A'}`, 30, 102);

        // Location Details
        doc.setFont(undefined, 'bold');
        doc.text('Location Details:', 20, 115);
        doc.setFont(undefined, 'normal');
        doc.text(`State: ${formData.state || 'Rajasthan'}`, 30, 123);
        doc.text(`District: ${formData.district || 'N/A'}`, 30, 130);
        doc.text(`Block: ${formData.block || 'N/A'}`, 30, 137);

        // Water Requirement
        doc.setFont(undefined, 'bold');
        doc.text('Water Requirement:', 20, 150);
        doc.setFont(undefined, 'normal');
        doc.text(`Daily Requirement: ${formData.dailyWaterRequirement || 0} m³/day`, 30, 158);

        // Exemption Declaration
        doc.setFillColor(220, 252, 231);
        doc.rect(20, 170, 170, 40, 'F');
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text('EXEMPTION STATUS', 105, 180, { align: 'center' });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        const exemptionText = `is EXEMPT from the requirement of obtaining NOC under\nSGWA Act 2025, as per exemption category: ${exemptionResult.exemptionType}`;
        const lines = doc.splitTextToSize(exemptionText, 160);
        doc.text(lines, 25, 190);

        // Validity
        doc.setFontSize(10);
        doc.text(`Exemption Category Code: ${exemptionResult.exemptionCode}`, 20, 220);
        doc.text(`Valid From: ${issueDate}`, 20, 227);
        doc.text('Validity: As per SGWA regulations', 20, 234);

        // Important Note
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Note: This exemption is subject to compliance with all applicable water conservation', 20, 250);
        doc.text('regulations. Groundwater extraction must be used only for the stated purpose.', 20, 256);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(108, 117, 125);
        doc.text('This is a system-generated exemption certificate and does not require a signature.', 105, 275, { align: 'center' });
        doc.text('For queries, contact: support@sgwa.rajasthan.gov.in', 105, 280, { align: 'center' });

        return doc;
    };

    const handleDownload = () => {
        const pdf = generatePDF();
        pdf.save(`SGWA_Exemption_${certificateNumber.replace(/\//g, '_')}.pdf`);
        if (onDownload) onDownload(certificateNumber);
    };

    const handleSubmit = () => {
        if (onSubmit) onSubmit({
            certificateNumber,
            exemptionType: exemptionResult.exemptionType,
            exemptionCode: exemptionResult.exemptionCode,
            issueDate
        });
    };

    return (
        <div className="exemption-certificate-container">
            {/* Success Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)',
                border: '3px solid #28a745',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(40, 167, 69, 0.2)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎉</div>
                <h1 style={{ color: '#28a745', margin: '0 0 10px 0', fontSize: '2rem' }}>
                    CONGRATULATIONS!
                </h1>
                <h2 style={{ color: '#155724', margin: '0 0 15px 0', fontSize: '1.5rem' }}>
                    You are EXEMPT from NOC Application
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#155724', margin: 0 }}>
                    {exemptionResult.message}
                </p>
            </div>

            {/* Certificate Display */}
            <div className="noc-card" style={{ marginBottom: '30px' }}>
                <div className="noc-card-header" style={{ background: '#0d4a8f', color: 'white', fontSize: '1.2rem' }}>
                    📜 Exemption Certificate
                </div>
                <div className="noc-card-body" style={{ padding: '30px' }}>
                    {/* Certificate Header */}
                    <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #dee2e6', paddingBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#0d4a8f' }}>EXEMPTION CERTIFICATE</h3>
                        <p style={{ margin: '5px 0', color: '#6c757d' }}>State Groundwater Authority, Rajasthan</p>
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '0.9rem' }}>
                            <div><strong>Certificate No:</strong> {certificateNumber}</div>
                            <div><strong>Date:</strong> {issueDate}</div>
                        </div>
                    </div>

                    {/* Applicant Details */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#0d4a8f', marginBottom: '10px' }}>Applicant Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div><strong>Name:</strong> {formData.applicantName || 'N/A'}</div>
                            <div><strong>Organization:</strong> {formData.organizationName || 'Individual'}</div>
                            <div><strong>Purpose:</strong> {formData.groundWaterUtilizationFor || 'N/A'}</div>
                            <div><strong>Water Requirement:</strong> {formData.dailyWaterRequirement || 0} m³/day</div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#0d4a8f', marginBottom: '10px' }}>Location Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div><strong>State:</strong> {formData.state || 'Rajasthan'}</div>
                            <div><strong>District:</strong> {formData.district || 'N/A'}</div>
                            <div><strong>Block:</strong> {formData.block || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Exemption Status */}
                    <div style={{
                        background: 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)',
                        border: '2px solid #28a745',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>EXEMPTION STATUS</h4>
                        <p style={{ margin: '10px 0', fontSize: '1.05rem', color: '#155724' }}>
                            This project is <strong>EXEMPT</strong> from the requirement of obtaining NOC under SGWA Act 2025
                        </p>
                        <p style={{ margin: '5px 0', color: '#155724' }}>
                            <strong>Exemption Category:</strong> {exemptionResult.exemptionType}
                        </p>
                        <p style={{ margin: '5px 0', color: '#155724' }}>
                            <strong>Category Code:</strong> {exemptionResult.exemptionCode}
                        </p>
                    </div>

                    {/* Important Notes */}
                    <div className="noc-alert noc-alert-info">
                        <strong>📋 Important Notes:</strong>
                        <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                            <li>This exemption is subject to compliance with all applicable water conservation regulations</li>
                            <li>Groundwater extraction must be used only for the stated purpose</li>
                            <li>Any change in project scope may require fresh evaluation</li>
                            <li>Keep this certificate for your records</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                    onClick={handleDownload}
                    className="noc-btn noc-btn-primary"
                    style={{ padding: '12px 30px', fontSize: '1.1rem' }}
                >
                    📥 Download Certificate (PDF)
                </button>
                <button
                    onClick={handleSubmit}
                    className="noc-btn noc-btn-success"
                    style={{ padding: '12px 30px', fontSize: '1.1rem' }}
                >
                    ✓ Submit to Authority
                </button>
            </div>

            {/* Help Section */}
            <div className="noc-alert noc-alert-warning">
                <strong>ℹ️ Need Help?</strong>
                <p style={{ margin: '10px 0 0 0' }}>
                    If you have any questions about this exemption or need to verify its status,
                    please contact SGWA at support@sgwa.rajasthan.gov.in or call our helpline.
                </p>
            </div>
        </div>
    );
};

export default ExemptionCertificate;
