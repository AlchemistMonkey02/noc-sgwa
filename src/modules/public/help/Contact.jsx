import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/help-pages.css';

const Contact = () => {
    const { t } = useTranslation();
    const offices = [
        {
            name: t('contact.offices.o1.name'),
            address: t('contact.offices.o1.address'),
            phone: '+91-141-2227631',
            email: 'cgwa-raj@gov.in',
            hours: t('contact.offices.o1.hours')
        },
        {
            name: t('contact.offices.o2.name'),
            address: t('contact.offices.o2.address'),
            phone: '+91-291-2431234',
            email: 'ro-jodhpur@sgwa.gov.in',
            hours: t('contact.offices.o2.hours')
        },
        {
            name: t('contact.offices.o3.name'),
            address: t('contact.offices.o3.address'),
            phone: '+91-294-2428123',
            email: 'ro-udaipur@sgwa.gov.in',
            hours: t('contact.offices.o3.hours')
        }
    ];

    const helplines = [
        { type: t('contact.helplines.h1.type'), number: '1800-180-6666', hours: t('contact.helplines.h1.hours') },
        { type: t('contact.helplines.h2.type'), number: '1800-180-7777', hours: t('contact.helplines.h2.hours') },
        { type: t('contact.helplines.h3.type'), number: '+91-141-2227631', hours: t('contact.helplines.h3.hours') }
    ];

    return (
        <div className="help-page">
            <div className="help-container">
                <div className="help-breadcrumb">
                    <Link to="/">{t('nav.home')}</Link> / <span>{t('contact.breadcrumb')}</span>
                </div>

                <div className="help-header">
                    <h1>{t('contact.title')}</h1>
                    <p className="help-subtitle">
                        {t('contact.subtitle')}
                    </p>
                </div>

                <div className="contact-section">
                    <h3 className="section-title-help">{t('contact.officeTitle')}</h3>
                    <div className="offices-grid">
                        {offices.map((office, idx) => (
                            <div key={idx} className="office-card">
                                <h4>{office.name}</h4>
                                <div className="office-details">
                                    <div className="detail-item">
                                        <strong>{t('contact.addrLabel')}</strong>
                                        <p>{office.address.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>{line}<br /></React.Fragment>
                                        ))}</p>
                                    </div>
                                    <div className="detail-item">
                                        <strong>{t('contact.phoneLabel')}</strong>
                                        <p>{office.phone}</p>
                                    </div>
                                    <div className="detail-item">
                                        <strong>{t('contact.emailLabel')}</strong>
                                        <p><a href={`mailto:${office.email}`}>{office.email}</a></p>
                                    </div>
                                    <div className="detail-item">
                                        <strong>{t('contact.hoursLabel')}</strong>
                                        <p>{office.hours}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="contact-section">
                    <h3 className="section-title-help">{t('contact.helplineTitle')}</h3>
                    <div className="helplines-grid">
                        {helplines.map((helpline, idx) => (
                            <div key={idx} className="helpline-card">
                                <h4>{helpline.type}</h4>
                                <p className="helpline-number">{helpline.number}</p>
                                <p className="helpline-hours">{helpline.hours}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="contact-section">
                    <h3 className="section-title-help">{t('contact.emailTitle')}</h3>
                    <div className="email-support">
                        <div className="email-item">
                            <strong>{t('contact.emails.e1')}</strong>
                            <a href="mailto:info@sgwa.gov.in">info@sgwa.gov.in</a>
                        </div>
                        <div className="email-item">
                            <strong>{t('contact.emails.e2')}</strong>
                            <a href="mailto:support@sgwa.gov.in">support@sgwa.gov.in</a>
                        </div>
                        <div className="email-item">
                            <strong>{t('contact.emails.e3')}</strong>
                            <a href="mailto:grievance@sgwa.gov.in">grievance@sgwa.gov.in</a>
                        </div>
                    </div>
                </div>

                <div className="help-info-box">
                    <h3>{t('contact.responseTitle')}</h3>
                    <ul>
                        <li><strong>{t('contact.helplines.h1.type')}:</strong> {t('contact.responseTime.r1')}</li>
                        <li><strong>{t('contact.emailTitle')}:</strong> {t('contact.responseTime.r2')}</li>
                        <li><strong>{t('contact.helplines.h2.type')}:</strong> {t('contact.responseTime.r3')}</li>
                        <li><strong>{t('contact.helplines.h3.type')}:</strong> {t('contact.responseTime.r4')}</li>
                    </ul>
                </div>

                <div className="help-actions">
                    <Link to="/help/faqs" className="btn-secondary">{t('contact.btnFaqs')}</Link>
                    <Link to="/help/how-to-apply" className="btn-primary">{t('contact.btnApply')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Contact;
