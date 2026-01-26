import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import NOCCertificate from './components/NOCCertificate';
import './styles/noc-portal.css';
import './styles/noc-certificate.css';

const NOCCertificatePage = () => {
    const { nocNumber } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-trigger print if requested
    useEffect(() => {
        if (location.state?.autoPrint) {
            // Small delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [location.state]);

    // Mock data - replace with API call
    const nocData = {
        companyName: 'ABC Industries Pvt Ltd',
        projectAddress: 'Plot No. 123, RIICO Industrial Area, Sanganer, Jaipur - 302029',
        pinCode: '302029',
        state: 'Rajasthan',
        district: 'Jaipur',
        town: 'Jaipur',
        block: 'Sanganer',
        communicationAddress: 'Registered Office: 45, Civil Lines, Jaipur',

        nocNumber: nocNumber || 'RJ/CGWA/NOC/2026/001234',
        issueDate: '22-Jan-2026',
        applicationNumber: 'RJ/2025/APP/00456',
        nocType: 'New',
        projectStatus: 'Existing',
        validFrom: '22-Jan-2026',
        validUpto: '21-Jan-2029',
        category: 'Semi-Critical',

        approvedWaterQuantity: '150.25',
        approvedWaterQuantityAnnual: '54,841.25',

        // Structures Data (Mock)
        total_ex: 2, total_prop: 0, grand_total: 2,
        dw_ex: 0, dcb_ex: 0, bw_ex: 2, tw_ex: 0, mpu_ex: 2,
        dw_prop: 0, dcb_prop: 0, bw_prop: 0, tw_prop: 0, mpu_prop: 0,
        total_dw: 0, total_dcb: 0, total_bw: 2, total_tw: 0, total_mpu: 2
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
