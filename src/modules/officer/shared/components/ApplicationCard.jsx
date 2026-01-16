import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import '../styles/officer-portal.css';

const ApplicationCard = ({ application, onClick, showActions = false, actions = [] }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(application);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysInQueue = (submittedDate) => {
        const submitted = new Date(submittedDate);
        const now = new Date();
        const diffTime = Math.abs(now - submitted);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="officer-app-card" onClick={handleClick}>
            <div className="officer-app-header">
                <div>
                    <h3 className="officer-app-title">{application.projectName}</h3>
                    <p className="officer-app-number">
                        Application No: {application.applicationNumber}
                    </p>
                </div>
                <StatusBadge status={application.status} />
            </div>

            <div className="officer-app-body">
                <div className="officer-app-field">
                    <span className="officer-app-field-label">Applicant</span>
                    <span className="officer-app-field-value">{application.applicantName}</span>
                </div>
                <div className="officer-app-field">
                    <span className="officer-app-field-label">Location</span>
                    <span className="officer-app-field-value">
                        {application.block}, {application.district}
                    </span>
                </div>
                <div className="officer-app-field">
                    <span className="officer-app-field-label">Water Requirement</span>
                    <span className="officer-app-field-value">{application.waterRequirement}</span>
                </div>
                <div className="officer-app-field">
                    <span className="officer-app-field-label">Project Type</span>
                    <span className="officer-app-field-value">{application.projectType}</span>
                </div>
            </div>

            <div className="officer-app-footer">
                <div style={{ fontSize: '0.875rem', color: 'var(--officer-text-light)' }}>
                    <span>Submitted: {formatDate(application.submittedDate)}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{getDaysInQueue(application.submittedDate)} days in queue</span>
                </div>

                {showActions && actions.length > 0 && (
                    <div className="officer-flex officer-gap-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                className={`officer-btn ${action.className || 'officer-btn-primary'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(application);
                                }}
                            >
                                {action.icon && <span>{action.icon}</span>}
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationCard;
