import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/help-pages.css';

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const { t } = useTranslation();

    const faqCategories = [
        {
            category: t('faqs.categories.application'),
            icon: '📝',
            faqs: [
                { q: t('faqs.q1'), a: t('faqs.a1') },
                { q: t('faqs.q2'), a: t('faqs.a2') },
                { q: t('faqs.q3'), a: t('faqs.a3') },
                { q: t('faqs.q4'), a: t('faqs.a4') }
            ]
        },
        {
            category: t('faqs.categories.documents'),
            icon: '📄',
            faqs: [
                { q: t('faqs.q5'), a: t('faqs.a5') },
                { q: t('faqs.q6'), a: t('faqs.a6') },
                { q: t('faqs.q7'), a: t('faqs.a7') },
                { q: t('faqs.q8'), a: t('faqs.a8') }
            ]
        },
        {
            category: t('faqs.categories.payment'),
            icon: '💳',
            faqs: [
                { q: t('faqs.q9'), a: t('faqs.a9') },
                { q: t('faqs.q10'), a: t('faqs.a10') },
                { q: t('faqs.q11'), a: t('faqs.a11') },
                { q: t('faqs.q12'), a: t('faqs.a12') }
            ]
        },
        {
            category: t('faqs.categories.status'),
            icon: '📊',
            faqs: [
                { q: t('faqs.q13'), a: t('faqs.a13') },
                { q: t('faqs.q14'), a: t('faqs.a14') },
                { q: t('faqs.q15'), a: t('faqs.a15') },
                { q: t('faqs.q16'), a: t('faqs.a16') }
            ]
        }
    ];

    const toggleFAQ = (categoryIdx, faqIdx) => {
        const index = `${categoryIdx}-${faqIdx}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="help-page">
            <div className="help-container">
                <div className="help-breadcrumb">
                    <Link to="/">{t('nav.home')}</Link> / <span>{t('faqs.breadcrumb')}</span>
                </div>

                <div className="help-header">
                    <h1>{t('faqs.title')}</h1>
                    <p className="help-subtitle">
                        {t('faqs.subtitle')}
                    </p>
                </div>

                <div className="faq-container">
                    {faqCategories.map((category, catIdx) => (
                        <div key={catIdx} className="faq-category">
                            <h3 className="faq-category-title">
                                <span className="faq-icon">{category.icon}</span>
                                {category.category}
                            </h3>
                            <div className="faq-list">
                                {category.faqs.map((faq, faqIdx) => {
                                    const index = `${catIdx}-${faqIdx}`;
                                    const isOpen = openIndex === index;
                                    return (
                                        <div key={faqIdx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                            <button
                                                className="faq-question"
                                                onClick={() => toggleFAQ(catIdx, faqIdx)}
                                            >
                                                <span>{faq.q}</span>
                                                <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
                                            </button>
                                            {isOpen && (
                                                <div className="faq-answer">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="help-info-box">
                    <h3>{t('faqs.stillHaveQuestions')}</h3>
                    <p>
                        {t('faqs.contactSupport')}
                    </p>
                </div>

                <div className="help-actions">
                    <Link to="/help/documents" className="btn-secondary">{t('faqs.btnDocs')}</Link>
                    <Link to="/help/contact" className="btn-primary">{t('faqs.btnContact')}</Link>
                </div>
            </div>
        </div>
    );
};

export default FAQs;
