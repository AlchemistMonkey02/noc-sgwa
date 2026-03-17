import React from 'react';

/**
 * ScheduleInspectionModal - Shared component for DGO to schedule site inspections.
 */
const ScheduleInspectionModal = ({ 
    isOpen, 
    onClose, 
    onSchedule, 
    inspectionOfficers = [] 
}) => {
    console.log('ScheduleInspectionModal: Received officers:', inspectionOfficers);
    
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSchedule(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0 }}>📅 Schedule Inspection</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Inspection Date</label>
                        <input 
                            type="date" 
                            name="inspectionDate" 
                            className="detail-item" 
                            style={{ width: '100%', padding: '1rem' }} 
                            required 
                            min={new Date().toISOString().split('T')[0]} 
                        />
                    </div>
                    <div className="officer-form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Select Inspection Officer</label>
                        <select name="officerId" className="detail-item" style={{ width: '100%', padding: '1rem' }} required>
                            <option value="">Select an officer...</option>
                            {inspectionOfficers.map(off => (
                                <option key={off._id} value={off._id}>{off.firstName} {off.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-back" style={{ color: '#64748b', borderColor: '#e2e8f0' }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-success">Schedule Inspection</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleInspectionModal;
