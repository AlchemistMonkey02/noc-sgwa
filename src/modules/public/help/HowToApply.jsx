import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/help-pages.css';

const HowToApply = () => {
    const { t } = useTranslation();
    const applicationSteps = [
        {
            step: 1,
            title: t('howToApply.steps.s1.title'),
            icon: '👤',
            description: t('howToApply.steps.s1.desc'),
            details: [
                t('howToApply.steps.s1.d1'),
                t('howToApply.steps.s1.d2'),
                t('howToApply.steps.s1.d3'),
                t('howToApply.steps.s1.d4'),
                t('howToApply.steps.s1.d5'),
                t('howToApply.steps.s1.d6')
            ],
            tips: [t('howToApply.steps.s1.t1'), t('howToApply.steps.s1.t2')]
        },
        {
            step: 2,
            title: t('howToApply.steps.s2.title'),
            icon: '📁',
            description: t('howToApply.steps.s2.desc'),
            details: [
                t('howToApply.steps.s2.d1'),
                t('howToApply.steps.s2.d2'),
                t('howToApply.steps.s2.d3'),
                t('howToApply.steps.s2.d4'),
                t('howToApply.steps.s2.d5'),
                t('howToApply.steps.s2.d6')
            ],
            tips: [t('howToApply.steps.s2.t1'), t('howToApply.steps.s2.t2')]
        },
        {
            step: 3,
            title: t('howToApply.steps.s3.title'),
            icon: '📝',
            description: t('howToApply.steps.s3.desc'),
            details: [
                t('howToApply.steps.s3.d1'),
                t('howToApply.steps.s3.d2'),
                t('howToApply.steps.s3.d3'),
                t('howToApply.steps.s3.d4'),
                t('howToApply.steps.s3.d5'),
                t('howToApply.steps.s3.d6')
            ],
            tips: [t('howToApply.steps.s3.t1'), t('howToApply.steps.s3.t2')]
        },
        {
            step: 4,
            title: t('howToApply.steps.s4.title'),
            icon: '✍️',
            description: t('howToApply.steps.s4.desc'),
            details: [
                t('howToApply.steps.s4.d1'),
                t('howToApply.steps.s4.d2'),
                t('howToApply.steps.s4.d3'),
                t('howToApply.steps.s4.d4'),
                t('howToApply.steps.s4.d5'),
                t('howToApply.steps.s4.d6')
            ],
            tips: [t('howToApply.steps.s4.t1'), t('howToApply.steps.s4.t2')]
        },
        {
            step: 5,
            title: t('howToApply.steps.s5.title'),
            icon: '📤',
            description: t('howToApply.steps.s5.desc'),
            details: [
                t('howToApply.steps.s5.d1'),
                t('howToApply.steps.s5.d2'),
                t('howToApply.steps.s5.d3'),
                t('howToApply.steps.s5.d4'),
                t('howToApply.steps.s5.d5'),
                t('howToApply.steps.s5.d6')
            ],
            tips: [t('howToApply.steps.s5.t1'), t('howToApply.steps.s5.t2')]
        },
        {
            step: 6,
            title: t('howToApply.steps.s6.title'),
            icon: '✅',
            description: t('howToApply.steps.s6.desc'),
            details: [
                t('howToApply.steps.s6.d1'),
                t('howToApply.steps.s6.d2'),
                t('howToApply.steps.s6.d3'),
                t('howToApply.steps.s6.d4'),
                t('howToApply.steps.s6.d5'),
                t('howToApply.steps.s6.d6')
            ],
            tips: [t('howToApply.steps.s6.t1'), t('howToApply.steps.s6.t2')]
        },
        {
            step: 7,
            title: t('howToApply.steps.s7.title'),
            icon: '📊',
            description: t('howToApply.steps.s7.desc'),
            details: [
                t('howToApply.steps.s7.d1'),
                t('howToApply.steps.s7.d2'),
                t('howToApply.steps.s7.d3'),
                t('howToApply.steps.s7.d4'),
                t('howToApply.steps.s7.d5'),
                t('howToApply.steps.s7.d6')
            ],
            tips: [t('howToApply.steps.s7.t1'), t('howToApply.steps.s7.t2')]
        },
        {
            step: 8,
            title: t('howToApply.steps.s8.title'),
            icon: '💳',
            description: t('howToApply.steps.s8.desc'),
            details: [
                t('howToApply.steps.s8.d1'),
                t('howToApply.steps.s8.d2'),
                t('howToApply.steps.s8.d3'),
                t('howToApply.steps.s8.d4'),
                t('howToApply.steps.s8.d5'),
                t('howToApply.steps.s8.d6')
            ],
            tips: [t('howToApply.steps.s8.t1'), t('howToApply.steps.s8.t2')]
        },
        {
            step: 9,
            title: t('howToApply.steps.s9.title'),
            icon: '🔍',
            description: t('howToApply.steps.s9.desc'),
            details: [
                t('howToApply.steps.s9.d1'),
                t('howToApply.steps.s9.d2'),
                t('howToApply.steps.s9.d3'),
                t('howToApply.steps.s9.d4'),
                t('howToApply.steps.s9.d5'),
                t('howToApply.steps.s9.d6')
            ],
            tips: [t('howToApply.steps.s9.t1'), t('howToApply.steps.s9.t2')]
        },
        {
            step: 10,
            title: t('howToApply.steps.s10.title'),
            icon: '🎉',
            description: t('howToApply.steps.s10.desc'),
            details: [
                t('howToApply.steps.s10.d1'),
                t('howToApply.steps.s10.d2'),
                t('howToApply.steps.s10.d3'),
                t('howToApply.steps.s10.d4'),
                t('howToApply.steps.s10.d5'),
                t('howToApply.steps.s10.d6')
            ],
            tips: [t('howToApply.steps.s10.t1'), t('howToApply.steps.s10.t2')]
        }
    ];

    return (
        <div className="help-page">
            <div className="help-container-wide">
                <div className="help-breadcrumb">
                    <Link to="/">{t('nav.home')}</Link> / <span>{t('howToApply.breadcrumb')}</span>
                </div>

                <div className="help-header">
                    <h1>{t('howToApply.title')}</h1>
                    <p className="help-subtitle">
                        {t('howToApply.subtitle')}
                    </p>
                </div>

                <div className="guide-steps">
                    {applicationSteps.map((item, idx) => (
                        <div key={idx} className="guide-step">
                            <div className="guide-step-header">
                                <div className="guide-step-number">
                                    <span className="guide-icon">{item.icon}</span>
                                    <span className="step-num">{t('howToApply.stepText')} {item.step}</span>
                                </div>
                                <div className="guide-step-title">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                            <div className="guide-step-content">
                                <div className="guide-details">
                                    <h4>{t('howToApply.whatToDo')}</h4>
                                    <ul>
                                        {item.details.map((detail, detailIdx) => (
                                            <li key={detailIdx}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="guide-tips">
                                    <h4>{t('howToApply.proTips')}</h4>
                                    <ul>
                                        {item.tips.map((tip, tipIdx) => (
                                            <li key={tipIdx}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="help-info-box">
                    <h3>{t('howToApply.quickReminders')}</h3>
                    <ul>
                        <li>{t('howToApply.reminders.r1')}</li>
                        <li>{t('howToApply.reminders.r2')}</li>
                        <li>{t('howToApply.reminders.r3')}</li>
                        <li>{t('howToApply.reminders.r4')}</li>
                        <li>{t('howToApply.reminders.r5')}</li>
                    </ul>
                </div>

                <div className="help-actions">
                    <Link to="/help/contact" className="btn-secondary">{t('howToApply.btnContact')}</Link>
                    <Link to="/" className="btn-primary">{t('howToApply.btnStart')}</Link>
                </div>
            </div>
        </div>
    );
};

export default HowToApply;
