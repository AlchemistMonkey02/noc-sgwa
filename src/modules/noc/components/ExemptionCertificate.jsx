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
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            {/* Success Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                marginBottom: '40px',
                boxShadow: '0 10px 25px rgba(22, 163, 74, 0.1)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🎉</div>
                <h1 style={{ color: '#16a34a', margin: '0 0 12px 0', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    CONGRATULATIONS!
                </h1>
                <h2 style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: '600' }}>
                    You are EXEMPT from NOC Application
                </h2>
                <p style={{ fontSize: '1.15rem', color: '#166534', margin: 0, opacity: '0.9' }}>
                    {exemptionResult.message}
                </p>
            </div>

            {/* Certificate Display */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                marginBottom: '40px',
                overflow: 'hidden'
            }}>
                <div style={{ background: '#0f172a', color: 'white', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📜</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Exemption Certificate Preview</h3>
                </div>

                <div style={{ padding: '40px' }}>
                    {/* Certificate Header */}
                    <div style={{ textAlign: 'center', marginBottom: '35px', paddingBottom: '25px', borderBottom: '2px solid #f1f5f9' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.8rem', fontWeight: '700', letterSpacing: '1px' }}>EXEMPTION CERTIFICATE</h3>
                        <p style={{ margin: '0', color: '#64748b', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State Groundwater Authority, Rajasthan</p>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '0.95rem', color: '#475569' }}>
                            <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><strong>Certificate No:</strong> <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{certificateNumber}</span></div>
                            <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><strong>Date:</strong> <span style={{ color: '#0f172a' }}>{issueDate}</span></div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
                        {/* Applicant Details */}
                        <div>
                            <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Applicant Details</h4>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '100%' }}>
                                <div style={{ marginBottom: '12px' }}><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Name</p><p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#0f172a', fontSize: '1.05rem' }}>{formData.applicantName || 'N/A'}</p></div>
                                <div style={{ marginBottom: '12px' }}><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Organization</p><p style={{ margin: '2px 0 0 0', fontWeight: '500', color: '#334155' }}>{formData.organizationName || 'Individual'}</p></div>
                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Purpose</p><p style={{ margin: '2px 0 0 0', fontWeight: '500', color: '#334155' }}>{formData.groundWaterUtilizationFor || 'N/A'}</p></div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div>
                            <h4 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Location & Technicals</h4>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '100%' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>State</p><p style={{ margin: '2px 0 0 0', fontWeight: '500', color: '#334155' }}>{formData.state || 'Rajasthan'}</p></div>
                                    <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>District</p><p style={{ margin: '2px 0 0 0', fontWeight: '500', color: '#334155' }}>{formData.district || 'N/A'}</p></div>
                                </div>
                                <div style={{ marginBottom: '15px' }}><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Block/Tehsil</p><p style={{ margin: '2px 0 0 0', fontWeight: '500', color: '#334155' }}>{formData.block || 'N/A'}</p></div>
                                <div style={{ position: 'relative' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>Water Requirement</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                                        <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#059669', fontSize: '1.4rem' }}>{formData.dailyWaterRequirement || 0}</p>
                                        <span style={{ fontSize: '0.9rem', color: '#059669' }}>KLD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exemption Status Highlight */}
                    <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderLeft: '5px solid #22c55e',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '30px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ background: '#22c55e', color: 'white', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>EXEMPT STATUS VERIFIED</span>
                        </div>
                        <p style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#166534', fontWeight: '500' }}>
                            This project is formally <strong>EXEMPT</strong> from obtaining an NOC under the SGWA Act 2025.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <p style={{ margin: 0, color: '#15803d', fontSize: '0.95rem' }}>
                                <strong>Category:</strong> {exemptionResult.exemptionType}
                            </p>
                            <p style={{ margin: 0, color: '#15803d', fontSize: '0.95rem' }}>
                                <strong style={{ opacity: 0.8 }}>Code:</strong> <span style={{ fontFamily: 'monospace' }}>{exemptionResult.exemptionCode}</span>
                            </p>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '20px', border: '1px solid #fde68a' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#b45309', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📋</span> Important Conditions
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>This exemption is subject to compliance with all applicable water conservation regulations.</li>
                            <li>Groundwater extraction must be used exclusively for the stated agricultural purpose.</li>
                            <li>Any future expansion exceeding 50 KLD will require a fresh evaluation and standard NOC.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
                <button
                    onClick={handleDownload}
                    style={{
                        padding: '16px 32px',
                        fontSize: '1.1rem',
                        background: 'white',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                    📥 Download PDF
                </button>
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '16px 32px',
                        fontSize: '1.1rem',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    ✓ Complete Submission
                </button>
            </div>

            {/* Help Section */}
            <div className="noc-alert noc-alert-warning" style={{ marginTop: '20px' }}>
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
