import React from 'react';
import '../styles/officer-portal.css';

const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const configs = {
            'PENDING_VERIFICATION': { class: 'pending', label: 'Pending Verification', icon: '⏳' },
            'UNDER_REVIEW': { class: 'under-review', label: 'Under Review', icon: '🔍' },
            'QUERY_RAISED': { class: 'query-raised', label: 'Query Raised', icon: '❓' },
            'DOCUMENTS_VERIFIED': { class: 'approved', label: 'Documents Verified', icon: '✓' },
            'INSPECTION_PENDING': { class: 'pending', label: 'Inspection Pending', icon: '📋' },
            'INSPECTION_COMPLETED': { class: 'approved', label: 'Inspection Completed', icon: '✓' },
            'PENDING_SGWA_REVIEW': { class: 'under-review', label: 'Pending SGWA Review', icon: '🔬' },
            'TECHNICAL_REVIEW': { class: 'under-review', label: 'Technical Review', icon: '🔬' },
            'PENDING_FINAL_APPROVAL': { class: 'pending', label: 'Pending Final Approval', icon: '⏳' },
            'APPROVED': { class: 'approved', label: 'Approved', icon: '✅' },
            'REJECTED': { class: 'rejected', label: 'Rejected', icon: '❌' },
            'SUBMITTED': { class: 'pending', label: 'Submitted', icon: '📤' },
            'DRAFT': { class: 'pending', label: 'Draft', icon: '📝' }
        };

        return configs[status] || { class: 'pending', label: status, icon: '•' };
    };

    const config = getStatusConfig(status);

    return (
        <span className={`officer-badge ${config.class}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
};

export default StatusBadge;
