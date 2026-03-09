import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProcessFlowComponent from '../../../components/ProcessFlow';
import './styles/help-pages.css';

const ProcessFlow = () => {
    const { t } = useTranslation();
    // Quick overview steps for the ProcessFlow component
    const quickSteps = [
        { title: t('processFlow.quickSteps.q1.title'), description: t('processFlow.quickSteps.q1.desc'), status: 'completed', icon: '👤' },
        { title: t('processFlow.quickSteps.q2.title'), description: t('processFlow.quickSteps.q2.desc'), status: 'completed', icon: '📄' },
        { title: t('processFlow.quickSteps.q3.title'), description: t('processFlow.quickSteps.q3.desc'), status: 'active', icon: '📝' },
        { title: t('processFlow.quickSteps.q4.title'), description: t('processFlow.quickSteps.q4.desc'), status: 'pending', icon: '✅' },
        { title: t('processFlow.quickSteps.q5.title'), description: t('processFlow.quickSteps.q5.desc'), status: 'pending', icon: '🔍' },
        { title: t('processFlow.quickSteps.q6.title'), description: t('processFlow.quickSteps.q6.desc'), status: 'pending', icon: '💳' },
        { title: t('processFlow.quickSteps.q7.title'), description: t('processFlow.quickSteps.q7.desc'), status: 'pending', icon: '📥' }
    ];

    // Detailed steps for vertical timeline
    const detailedSteps = [
        {
            number: 1,
            title: t('processFlow.detailedSteps.d1.title'),
            description: t('processFlow.detailedSteps.d1.desc'),
            duration: t('processFlow.detailedSteps.d1.duration'),
            icon: '👤'
        },
        {
            number: 2,
            title: t('processFlow.detailedSteps.d2.title'),
            description: t('processFlow.detailedSteps.d2.desc'),
            duration: t('processFlow.detailedSteps.d2.duration'),
            icon: '📄'
        },
        {
            number: 3,
            title: t('processFlow.detailedSteps.d3.title'),
            description: t('processFlow.detailedSteps.d3.desc'),
            duration: t('processFlow.detailedSteps.d3.duration'),
            icon: '📝'
        },
        {
            number: 4,
            title: t('processFlow.detailedSteps.d4.title'),
            description: t('processFlow.detailedSteps.d4.desc'),
            duration: t('processFlow.detailedSteps.d4.duration'),
            icon: '✅'
        },
        {
            number: 5,
            title: t('processFlow.detailedSteps.d5.title'),
            description: t('processFlow.detailedSteps.d5.desc'),
            duration: t('processFlow.detailedSteps.d5.duration'),
            icon: '🔍'
        },
        {
            number: 6,
            title: t('processFlow.detailedSteps.d6.title'),
            description: t('processFlow.detailedSteps.d6.desc'),
            duration: t('processFlow.detailedSteps.d6.duration'),
            icon: '💳'
        },
        {
            number: 7,
            title: t('processFlow.detailedSteps.d7.title'),
            description: t('processFlow.detailedSteps.d7.desc'),
            duration: t('processFlow.detailedSteps.d7.duration'),
            icon: '✓'
        },
        {
            number: 8,
            title: t('processFlow.detailedSteps.d8.title'),
            description: t('processFlow.detailedSteps.d8.desc'),
            duration: t('processFlow.detailedSteps.d8.duration'),
            icon: '📥'
        }
    ];

    return (
        <div className="help-page">
            <div className="help-container-wide">
                <div className="help-breadcrumb">
                    <Link to="/">{t('nav.home')}</Link> / <span>{t('processFlow.breadcrumb')}</span>
                </div>

                <div className="help-header">
                    <h1>{t('processFlow.title')}</h1>
                    <p className="help-subtitle">
                        {t('processFlow.subtitle')}
                    </p>
                </div>

                {/* Quick Overview using ProcessFlow Component */}
                <ProcessFlowComponent
                    title={t('processFlow.quickOverview')}
                    steps={quickSteps}
                />

                {/* Detailed Timeline - Step 2 */}
                <div className="detailed-timeline-section">
                    <div className="section-header">
                        <span className="section-badge">{t('processFlow.sectionBadge')}</span>
                        <h2>{t('processFlow.detailedTitle')}</h2>
                        <p>{t('processFlow.detailedDesc')}</p>
                    </div>

                    <div className="timeline-grid">
                        {detailedSteps.map((step) => (
                            <div key={step.number} className="premium-timeline-card">
                                <div className="card-accent" />
                                <div className="card-header">
                                    <div className="header-left">
                                        <span className="step-badge">{t('processFlow.stageBadge')} {step.number}</span>
                                        <h3>{step.title}</h3>
                                    </div>
                                    <span className="step-icon-large">{step.icon}</span>
                                </div>
                                <div className="card-body">
                                    <p>{step.description}</p>
                                    <div className="duration-pill">
                                        <span className="pill-label">{t('processFlow.estDuration')}</span>
                                        <span className="pill-value">{step.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="help-info-box">
                    <h3>{t('processFlow.notesTitle')}</h3>
                    <ul>
                        <li>{t('processFlow.notes.n1')}</li>
                        <li>{t('processFlow.notes.n2')}</li>
                        <li>{t('processFlow.notes.n3')}</li>
                        <li>{t('processFlow.notes.n4')}</li>
                        <li>{t('processFlow.notes.n5')}</li>
                    </ul>
                </div>

                <div className="help-actions">
                    <Link to="/" className="btn-secondary">{t('processFlow.btnBackHome')}</Link>
                    <Link to="/help/documents" className="btn-primary">{t('processFlow.btnRequiredDocs')}</Link>
                </div>
            </div>
        </div>
    );
};

export default ProcessFlow;
