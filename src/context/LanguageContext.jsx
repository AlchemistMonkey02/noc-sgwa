import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

// Translation dictionary
const translations = {
    en: {
        department_name: 'GROUND WATER DEPARTMENT',
        govt_rajasthan: 'Government of Rajasthan',
        technical_helpline: 'Technical Helpline Number',
        helpline_hours: '10.00 AM - 6.00 PM (On all working days)',
        search_placeholder: 'Search here',
        about_department: 'ABOUT DEPARTMENT',
        services: 'SERVICES',
        guidelines: 'GUIDELINES',
        downloads: 'DOWNLOADS',
        contact_us: 'CONTACT US'
    },
    hi: {
        department_name: 'भूजल विभाग',
        govt_rajasthan: 'राजस्थान सरकार',
        technical_helpline: 'तकनीकी हेल्पलाइन नंबर',
        helpline_hours: '10.00 AM - 6.00 PM (सभी कार्य दिवसों पर)',
        search_placeholder: 'यहाँ खोजें',
        about_department: 'विभाग के बारे में',
        services: 'सेवाएं',
        guidelines: 'दिशानिर्देश',
        downloads: 'डाउनलोड',
        contact_us: 'संपर्क करें'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
