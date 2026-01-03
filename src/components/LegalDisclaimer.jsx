import React from 'react';
import { TRANSITION_CONFIG } from '../config/transitionRules';

const LegalDisclaimer = () => {
    return (
        <div className="legal-disclaimer-banner" style={{
            backgroundColor: '#FFF7ED',
            color: '#78350F',
            padding: '12px 20px',
            fontSize: '0.875rem',
            textAlign: 'center',
            borderTop: '2px solid #F97316',
            borderBottom: '2px solid #F97316',
            marginTop: 'auto'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚖️</span>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                    <strong style={{ color: '#9A3412' }}>STATUTORY NOTICE:</strong>{' '}
                    The {TRANSITION_CONFIG.LEGAL_AUTHORITY.ACT_NAME} has been enacted on {TRANSITION_CONFIG.LEGAL_AUTHORITY.ACT_DATE}.{' '}
                    Rules under the Act are under formulation. Till such time, all applications and data are collected for <strong>regulatory, monitoring, and transitional purposes</strong> subject to further directions issued by the Government.
                </div>
            </div>
        </div>
    );
};

export default LegalDisclaimer;
