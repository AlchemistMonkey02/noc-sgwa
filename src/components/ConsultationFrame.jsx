import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EXTERNAL_URLS } from '../config/constants';
import LayoutWithSidebar from '../modules/noc/components/LayoutWithSidebar';
import OfficerHeader from '../modules/officer/shared/components/OfficerHeader';
import OfficerSidebar from '../modules/officer/shared/components/OfficerSidebar';

const ConsultationFrame = () => {
    const { id } = useParams();
    const { user, userType, isOfficer } = useAuth();

    // Determine the name to pass to the video app
    const displayName = user?.name || user?.username || user?.fullName || 'User';

    // Construct the URL with auto-join parameters
    const roomID = id || 'Consultation-' + Math.floor(Math.random() * 10000);
    const consultationUrl = `${EXTERNAL_URLS.CONSULTATION_APP_URL}?room=${roomID}&username=${encodeURIComponent(displayName)}`;

    const renderContent = () => (
        <div style={{ width: '100%', height: 'calc(100vh - 100px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <iframe
                src={consultationUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
                title="SGWA Consultation Room"
            />
        </div>
    );

    if (isOfficer()) {
        return (
            <div className="officer-portal">
                <OfficerHeader
                    officerName={user?.name || user?.username || 'Officer'}
                    officerRole={userType}
                    officerDesignation={user?.designation || 'Specialist'}
                    district={user?.district || 'Jaipur'}
                />
                <div className="officer-layout">
                    <OfficerSidebar role={userType} />
                    <main className="officer-content">
                        <div className="officer-container">
                            <div className="officer-page-header">
                                <h1 className="officer-page-title">📞 Secure Consultation Room</h1>
                                <p className="officer-page-subtitle">
                                    Integrated video and voice channel for application evaluation
                                </p>
                            </div>
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <LayoutWithSidebar defaultCollapsed={true} showSidebar={true}>
            <div className="content-container">
                <div className="page-title-section">
                    <h1 className="page-main-title">📞 Evaluation Consultation</h1>
                    <p className="page-subtitle">
                        Direct communication channel with your evaluation officer
                    </p>
                </div>
                {renderContent()}
            </div>
        </LayoutWithSidebar>
    );
};

export default ConsultationFrame;
