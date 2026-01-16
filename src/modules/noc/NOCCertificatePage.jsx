import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import NOCCertificate from './components/NOCCertificate';
import './styles/noc-portal.css';
import './styles/noc-certificate.css';

const NOCCertificatePage = () => {
    const { nocNumber } = useParams();
    const navigate = useNavigate();

    // Mock data - replace with API call
    const nocData = {
        nocNumber: nocNumber || 'RJ/CGWA/NOC/2026/001234',
        issueDate: '22-Jan-2026',
        validFrom: '22-Jan-2026',
        validUpto: '21-Jan-2029',
        applicantName: 'ABC Industries Pvt Ltd',
        projectName: 'Textile Manufacturing Unit',
        location: 'Plot No. 123, RIICO Industrial Area, Sanganer, Jaipur - 302029',
        district: 'Jaipur',
        block: 'Sanganer',
        tehsil: 'Sanganer',
        maxDailyExtraction: '150.25 m³/day',
        maxAnnualExtraction: '54,841.25 m³/year',
        purpose: 'Industrial Water Supply',
        conditions: [
            'Install digital flow meter with telemetry within 30 days of NOC issuance',
            'Install piezometer at GPS coordinates 26.8206°N, 75.8472°E within 60 days',
            'Submit quarterly groundwater monitoring reports by 15th of following month',
            'Implement rainwater harvesting structures as per approved plan within 90 days',
            'No groundwater withdrawal during monsoon season (July-September)',
            'Pay groundwater cess quarterly as per SGWA notification'
        ],
        approvedBy: 'Suresh Patel, Chief Engineer',
        officerDesignation: 'Chief Engineer',
        issuePlace: 'Jaipur'
    };

    return (
        <div className="noc-portal">
            <NOCHeader />

            <div className="main-content">
                <div className="page-gradient-header"></div>

                <div className="content-container">
                    {/* Back Button */}
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            onClick={() => navigate('/noc/dashboard')}
                            className="bhuneer-secondary-btn"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Certificate */}
                    <NOCCertificate nocData={nocData} />
                </div>
            </div>

            <NOCFooter />
        </div>
    );
};

export default NOCCertificatePage;
