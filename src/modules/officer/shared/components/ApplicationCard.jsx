import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import ConsultationCallButton from '../../../../components/ConsultationCallButton';
import '../styles/officer-portal.css';

const ApplicationCard = ({ application, onClick, showActions = false, actions = [], showCallButton = false, officerType = 'DGO', onCallApplicant }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(application);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
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
                    <h3 className="officer-app-title notranslate">{application.projectName}</h3>
                    <p className="officer-app-number">
                        {t('officer.dashboard.fields.appNo')}: <span className="notranslate">{application.applicationNumber}</span>
                    </p>
                </div>
                <StatusBadge status={application.status} />
            </div>

            <div className="officer-app-body">
                <div className="officer-app-field">
                    <span className="officer-app-field-label">{t('officer.dashboard.fields.applicant')}</span>
                    <span className="officer-app-field-value notranslate">{application.applicantName}</span>
                </div>
                <div className="officer-app-field">
                    <span className="officer-app-field-label">{t('officer.dashboard.fields.location')}</span>
                    <span className="officer-app-field-value notranslate">
                        {application.block}, {application.district}
                    </span>
                </div>
                <div className="officer-app-field">
                    <span className="officer-app-field-label">{t('officer.dashboard.fields.waterRequirement')}</span>
                    <span className="officer-app-field-value notranslate">{application.waterRequirement}</span>
                </div>
                <div className="officer-app-field">
                    <span className="officer-app-field-label">{t('officer.dashboard.fields.projectType')}</span>
                    <span className="officer-app-field-value notranslate">{application.projectType}</span>
                </div>
            </div>

            <div className="officer-app-footer">
                <div style={{ fontSize: '0.875rem', color: 'var(--officer-text-light)' }}>
                    <span>{t('officer.dashboard.fields.submitted')}: <span className="notranslate">{formatDate(application.submittedDate)}</span></span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span><span className="notranslate">{getDaysInQueue(application.submittedDate)}</span> {t('officer.dashboard.fields.daysSuffix')} {t('officer.dashboard.fields.inQueue')}</span>
                </div>

                {/* Call Applicant button */}
                {showCallButton && (
                    <div style={{ marginTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                        <ConsultationCallButton
                            applicationNumber={application.applicationNumber}
                            officerType={officerType}
                            label="📞 Call Applicant"
                            variant="mini"
                        />
                    </div>
                )}

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
