import React from 'react';

const StatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'Pending Review':
                return 'pending';
            case 'Under Review':
                return 'under-review';
            case 'Approved':
                return 'approved';
            case 'Rejected':
                return 'rejected';
            case 'Clarification Required':
                return 'clarification';
            default:
                return 'pending';
        }
    };

    return (
        <span className={`status-badge ${getStatusClass()}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
