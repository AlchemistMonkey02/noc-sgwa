import React from 'react';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

const OfficerReports = () => {
    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Ramesh Kumar"
                officerRole="DGO"
                officerDesignation="District Groundwater Officer"
                district="Jaipur"
            />
            <div className="officer-layout">
                <OfficerSidebar role="DGO" />
                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <h1 className="officer-page-title">📄 Reports</h1>
                            <p className="officer-page-subtitle">
                                Generate and view system reports
                            </p>
                        </div>

                        <div className="officer-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                            <h2>Reports Module Coming Soon</h2>
                            <p style={{ color: '#666' }}>
                                This module will allow you to generate MIS reports, inspection summaries, and application status reports.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OfficerReports;
