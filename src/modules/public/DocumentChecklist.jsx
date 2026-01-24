import React from 'react';

const DocumentChecklist = () => {
    const documents = [
        {
            category: "Identity & Ownership",
            items: [
                "Proof of ownership of land (Jamabandi/Sale Deed/Lease Deed)",
                "Authorization letter from the company/firm (if applicable)",
                "Aadhaar Card / PAN Card of the applicant"
            ]
        },
        {
            category: "Project Details",
            items: [
                "Site Plan / Map showing location of the project",
                "Project Report / Feasibility Report",
                "Non-Agriculture (NA) Conversion Order (Use for Industrial/Infrastructure)"
            ]
        },
        {
            category: "Technical",
            items: [
                "Affidavit for non-availability of water supply from local agency",
                "Water Quality Report from NABL accredited lab (for drinking use)",
                "Rainwater Harvesting Plan approval"
            ]
        }
    ];

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e3a8a' }}>📋 Document Checklist</h2>

            <div style={{ display: 'grid', gap: '20px' }}>
                {documents.map((section, index) => (
                    <div key={index} style={{
                        background: 'white',
                        padding: '25px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{
                            color: '#1e3a8a',
                            borderBottom: '2px solid #e5e7eb',
                            paddingBottom: '10px',
                            marginBottom: '15px'
                        }}>
                            {section.category}
                        </h3>
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#4b5563' }}>
                            {section.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentChecklist;
