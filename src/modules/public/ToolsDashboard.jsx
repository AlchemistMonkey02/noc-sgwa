import React from 'react';
import { useNavigate } from 'react-router-dom';

const ToolsDashboard = () => {
    const navigate = useNavigate();

    const tools = [
        {
            id: 'charges',
            title: 'Abstraction Charges',
            icon: '💰',
            link: 'https://rgwcma.geoplanetsolution.in/charges', // External
            isExternal: true,
            description: 'Calculate groundwater abstraction charges'
        },
        {
            id: 'eligibility',
            title: 'Eligibility Checker',
            icon: '✅',
            link: '/noc/check-eligibility', // Internal
            isExternal: false,
            description: 'Check your eligibility for NOC'
        },
        {
            id: 'checklist',
            title: 'Document Checklist',
            icon: '📋',
            link: '/tools/document-checklist', // Internal
            isExternal: false,
            description: 'View list of required documents'
        }
    ];

    const handleCardClick = (tool) => {
        if (tool.isExternal) {
            window.open(tool.link, '_blank', 'noopener,noreferrer');
        } else {
            navigate(tool.link);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '40px',
                color: '#1e3a8a',
                fontSize: '2.5rem'
            }}>
                🛠️ Tools & Calculators
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '30px',
                padding: '20px'
            }}>
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => handleCardClick(tool)}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
                            {tool.icon}
                        </div>
                        <h3 style={{ color: '#1f2937', margin: 0 }}>{tool.title}</h3>
                        <p style={{ color: '#6b7280', marginTop: '5px' }}>{tool.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToolsDashboard;
