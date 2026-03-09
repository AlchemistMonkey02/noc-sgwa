import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/help-pages.css';

const Timelines = () => {
    const { t } = useTranslation();
    const timelines = [
        {
            type: t('timelines.t1.type'),
            stages: [
                { name: t('timelines.t1.s1.name'), duration: t('timelines.t1.s1.duration') },
                { name: t('timelines.t1.s2.name'), duration: t('timelines.t1.s2.duration') },
                { name: t('timelines.t1.s3.name'), duration: t('timelines.t1.s3.duration') },
                { name: t('timelines.t1.s4.name'), duration: t('timelines.t1.s4.duration') }
            ],
            total: t('timelines.t1.total')
        },
        {
            type: t('timelines.t2.type'),
            stages: [
                { name: t('timelines.t2.s1.name'), duration: t('timelines.t2.s1.duration') },
                { name: t('timelines.t2.s2.name'), duration: t('timelines.t2.s2.duration') },
                { name: t('timelines.t2.s3.name'), duration: t('timelines.t2.s3.duration') }
            ],
            total: t('timelines.t2.total')
        },
        {
            type: t('timelines.t3.type'),
            stages: [
                { name: t('timelines.t3.s1.name'), duration: t('timelines.t3.s1.duration') },
                { name: t('timelines.t3.s2.name'), duration: t('timelines.t3.s2.duration') },
                { name: t('timelines.t3.s3.name'), duration: t('timelines.t3.s3.duration') }
            ],
            total: t('timelines.t3.total')
        }
    ];

    return (
        <div className="help-page">
            <div className="help-container-wide">
                <div className="help-breadcrumb">
                    <Link to="/">{t('nav.home')}</Link> / <span>{t('timelines.breadcrumb')}</span>
                </div>

                <div className="help-header">
                    <h1>{t('timelines.title')}</h1>
                    <p className="help-subtitle">
                        {t('timelines.subtitle')}
                    </p>
                </div>

                <div className="timelines-grid">
                    {timelines.map((timeline, idx) => (
                        <div key={idx} className="timeline-card premium-timeline-card">
                            <h3 className="timeline-type">{timeline.type}</h3>
                            <div className="timeline-stages">
                                {timeline.stages.map((stage, stageIdx) => (
                                    <div key={stageIdx} className="timeline-stage">
                                        <div className="stage-indicator"></div>
                                        <div className="stage-content">
                                            <span className="stage-name">{stage.name}</span>
                                            <span className="stage-duration">{stage.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="timeline-total">
                                <strong>{t('timelines.totalDuration')}</strong> <span>{timeline.total}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="timelines-info-sections">
                    <div className="info-card factors-card">
                        <h3>{t('timelines.factorsTitle')}</h3>
                        <div className="factors-list">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="factor-item">
                                    <span className="factor-label">{t(`timelines.flabels.l${i}`)}</span>
                                    <p>{t(`timelines.factors.f${i}`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="info-card tips-card">
                        <h3>{t('timelines.tipsTitle')}</h3>
                        <div className="tips-list">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="tip-item">
                                    <span className="tip-icon">💡</span>
                                    <p>{t(`timelines.tips.t${i}`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="help-actions">
                    <Link to="/help/process-flow" className="action-btn secondary">
                        {t('timelines.btnProcessFlow')}
                    </Link>
                    <Link to="/help/documents" className="action-btn primary">
                        {t('timelines.btnRequiredDocs')}
                    </Link>
                </div>
            </div >
        </div >
    );
};

export default Timelines;
