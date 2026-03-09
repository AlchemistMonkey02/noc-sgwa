import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/help-pages.css';

const Documents = () => {
    const [selectedType, setSelectedType] = useState('groundwater');
    const { t } = useTranslation();

    const documentsByType = {
        groundwater: [
            { name: t('documents.groundwater.d1.name'), format: 'PDF', required: true, desc: t('documents.groundwater.d1.desc') },
            { name: t('documents.groundwater.d2.name'), format: 'PDF/JPG', required: true, desc: t('documents.groundwater.d2.desc') },
            { name: t('documents.groundwater.d3.name'), format: 'PDF/JPG', required: true, desc: t('documents.groundwater.d3.desc') },
            { name: t('documents.groundwater.d4.name'), format: 'PDF', required: true, desc: t('documents.groundwater.d4.desc') },
            { name: t('documents.groundwater.d5.name'), format: 'PDF', required: true, desc: t('documents.groundwater.d5.desc') },
            { name: t('documents.groundwater.d6.name'), format: 'PDF', required: true, desc: t('documents.groundwater.d6.desc') },
            { name: t('documents.groundwater.d7.name'), format: 'PDF', required: false, desc: t('documents.groundwater.d7.desc') },
            { name: t('documents.groundwater.d8.name'), format: 'PDF', required: false, desc: t('documents.groundwater.d8.desc') }
        ],
        rig: [
            { name: t('documents.rig.d1.name'), format: 'PDF', required: true, desc: t('documents.rig.d1.desc') },
            { name: t('documents.rig.d2.name'), format: 'PDF', required: true, desc: t('documents.rig.d2.desc') },
            { name: t('documents.rig.d3.name'), format: 'PDF/JPG', required: true, desc: t('documents.rig.d3.desc') },
            { name: t('documents.rig.d4.name'), format: 'PDF', required: true, desc: t('documents.rig.d4.desc') },
            { name: t('documents.rig.d5.name'), format: 'PDF', required: true, desc: t('documents.rig.d5.desc') },
            { name: t('documents.rig.d6.name'), format: 'PDF', required: true, desc: t('documents.rig.d6.desc') }
        ],
        vendor: [
            { name: t('documents.vendor.d1.name'), format: 'PDF', required: true, desc: t('documents.vendor.d1.desc') },
            { name: t('documents.vendor.d2.name'), format: 'PDF', required: true, desc: t('documents.vendor.d2.desc') },
            { name: t('documents.vendor.d3.name'), format: 'PDF', required: true, desc: t('documents.vendor.d3.desc') },
            { name: t('documents.vendor.d4.name'), format: 'PDF/JPG', required: true, desc: t('documents.vendor.d4.desc') },
            { name: t('documents.vendor.d5.name'), format: 'PDF', required: true, desc: t('documents.vendor.d5.desc') },
            { name: t('documents.vendor.d6.name'), format: 'PDF', required: false, desc: t('documents.vendor.d6.desc') }
        ]
    };

    const types = [
        { id: 'groundwater', name: t('documents.types.groundwater'), icon: '💧' },
        { id: 'rig', name: t('documents.types.rig'), icon: '⚙️' },
        { id: 'vendor', name: t('documents.types.vendor'), icon: '🏢' }
    ];

    return (
        <div className="help-page">
            <div className="help-container">
                <div className="help-breadcrumb">
                    <Link to="/">{t('nav.home')}</Link> / <span>{t('documents.breadcrumb')}</span>
                </div>

                <div className="help-header">
                    <h1>{t('documents.title')}</h1>
                    <p className="help-subtitle">
                        {t('documents.subtitle')}
                    </p>
                </div>

                <div className="doc-type-selector">
                    {types.map(type => (
                        <button
                            key={type.id}
                            className={`doc-type-btn ${selectedType === type.id ? 'active' : ''}`}
                            onClick={() => setSelectedType(type.id)}
                        >
                            <span className="doc-type-icon">{type.icon}</span>
                            {type.name}
                        </button>
                    ))}
                </div>

                <div className="documents-list">
                    {documentsByType[selectedType].map((doc, idx) => (
                        <div key={idx} className="document-item">
                            <div className="doc-header">
                                <h4>
                                    {doc.name}
                                    {doc.required && <span className="required-badge">{t('documents.requiredBadge')}</span>}
                                </h4>
                                <span className="doc-format">{doc.format}</span>
                            </div>
                            <p className="doc-desc">{doc.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="help-info-box">
                    <h3>{t('documents.guidelinesTitle')}</h3>
                    <ul>
                        <li><strong>{t('documents.glabels.l1')}</strong> {t('documents.guidelines.g1')}</li>
                        <li><strong>{t('documents.glabels.l2')}</strong> {t('documents.guidelines.g2')}</li>
                        <li><strong>{t('documents.glabels.l3')}</strong> {t('documents.guidelines.g3')}</li>
                        <li><strong>{t('documents.glabels.l4')}</strong> {t('documents.guidelines.g4')}</li>
                        <li><strong>{t('documents.glabels.l5')}</strong> {t('documents.guidelines.g5')}</li>
                        <li><strong>{t('documents.glabels.l6')}</strong> {t('documents.guidelines.g6')}</li>
                    </ul>
                </div>

                <div className="help-actions">
                    <Link to="/help/timelines" className="btn-secondary">{t('documents.btnTimelines')}</Link>
                    <Link to="/help/faqs" className="btn-primary">{t('documents.btnFaqs')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Documents;
