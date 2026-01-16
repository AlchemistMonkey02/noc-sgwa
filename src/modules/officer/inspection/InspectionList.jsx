import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerHeader from '../shared/components/OfficerHeader';
import OfficerSidebar from '../shared/components/OfficerSidebar';
import '../shared/styles/officer-portal.css';

import officerService from '../services/officerService';

const InspectionList = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED
    const [searchTerm, setSearchTerm] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await officerService.getMyInspections();
            if (response.success && response.data.inspections) {
                // Map API data to UI model
                const mappedInspections = response.data.inspections.map(item => ({
                    id: item.inspectionId,
                    appId: item.applicationNumber || 'N/A',
                    name: item.holderName || item.applicantName || 'Unknown Applicant',
                    location: item.location || 'Unknown Location',
                    date: item.scheduledDate ? item.scheduledDate.split('T')[0] : 'N/A',
                    status: item.status || 'PENDING',
                    priority: item.priority || 'MEDIUM'
                }));
                setAssignments(mappedInspections);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            // Fallback for development
            setAssignments([
                {
                    id: 'insp-001',
                    appId: 'NOC-2026-1234',
                    name: 'Rajesh Kumar Sharma',
                    location: 'Sanganer, Jaipur',
                    date: '2026-01-16',
                    status: 'PENDING',
                    priority: 'HIGH'
                },
                {
                    id: 'insp-002',
                    appId: 'NOC-2026-1452',
                    name: 'Hotel Blue Diamond',
                    location: 'Ajmer Road, Jaipur',
                    date: '2026-01-16',
                    status: 'PENDING',
                    priority: 'MEDIUM'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(item => {
        const matchesFilter = filter === 'ALL' ||
            (filter === 'PENDING' && (item.status === 'PENDING' || item.status === 'SCHEDULED')) ||
            (filter === 'COMPLETED' && item.status === 'COMPLETED');

        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.appId || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="officer-portal">
            <OfficerHeader
                officerName="Vikram Singh"
                officerRole="INSPECTION"
                officerDesignation="Field Inspector"
                district="Jaipur"
            />

            <div className="officer-layout">
                <OfficerSidebar role="INSPECTION" />

                <main className="officer-content">
                    <div className="officer-container">
                        <div className="officer-page-header">
                            <div>
                                <h1 className="officer-page-title">My Inspection Assignments</h1>
                                <p className="officer-page-subtitle">List of all allocated site inspections</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="officer-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <input
                                        type="text"
                                        placeholder="Search by name, location or ID..."
                                        className="officer-input"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['ALL', 'PENDING', 'COMPLETED'].map(f => (
                                        <button
                                            key={f}
                                            className={`officer-btn ${filter === f ? 'officer-btn-primary' : 'officer-btn-secondary'}`}
                                            onClick={() => setFilter(f)}
                                        >
                                            {f === 'ALL' ? 'All Assignments' : f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredAssignments.map((item) => (
                                <div key={item.id} className="officer-card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <span style={{
                                                    background: item.priority === 'HIGH' ? '#fee2e2' : '#e0f2fe',
                                                    color: item.priority === 'HIGH' ? '#b91c1c' : '#0369a1',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {item.priority} PRIORITY
                                                </span>
                                                <span style={{ color: 'var(--officer-text-light)', fontSize: '0.875rem' }}>
                                                    Assigned Date: {item.date}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                                                {item.name}
                                            </h3>
                                            <p style={{ margin: 0, color: 'var(--officer-text-light)' }}>
                                                {item.appId} • 📍 {item.location}
                                            </p>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '999px',
                                                background: item.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                                                color: item.status === 'COMPLETED' ? '#166534' : '#92400e',
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                marginBottom: '1rem',
                                                display: 'inline-block'
                                            }}>
                                                {item.status}
                                            </div>
                                            <div>
                                                {item.status !== 'COMPLETED' ? (
                                                    <button
                                                        className="officer-btn officer-btn-primary"
                                                        onClick={() => navigate(`/officer/inspection/conduct/${item.id}`)}
                                                    >
                                                        Conduct Inspection
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="officer-btn officer-btn-secondary"
                                                        onClick={() => navigate(`/officer/inspection/report/${item.id}`)}
                                                    >
                                                        View Report
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InspectionList;
