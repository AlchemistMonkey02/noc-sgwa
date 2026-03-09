import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import NOCCertificate from './components/NOCCertificate';
import { useToast } from '../../context/ToastContext';
import { nocApplicationService } from './services/nocApplicationService';
import './styles/noc-portal.css';
import './styles/noc-certificate.css';

const NOCCertificatePage = () => {
    const { nocNumber } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { error: toastError } = useToast();

    const [nocData, setNocData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificateData = async () => {
            if (!nocNumber) return;

            try {
                setLoading(true);
                // In this context, nocNumber might be the tracking ID or ObjectId
                const response = await nocApplicationService.getCertificateDetails(nocNumber);
                if (response.success && response.data) {
                    setNocData(response.data);
                } else {
                    toastError(response.message || 'Failed to fetch certificate data');
                }
            } catch (error) {
                console.error('Error fetching certificate:', error);

                if (error.response?.data?.code === 'CERTIFICATE_NOT_FOUND') {
                    toastError('Certificate has not been issued yet.');
                } else {
                    toastError('Error loading certificate data. ' + (error.message || ''));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCertificateData();
    }, [nocNumber, toastError]);

    // Auto-trigger print if requested
    useEffect(() => {
        if (!loading && nocData && location.state?.autoPrint) {
            // Small delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, nocData, location.state]);

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
