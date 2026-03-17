import { CONSULTATION_APP_URL as CONSULTATION_URL } from './apiConfig';

// Global Configuration for External URLs
export const EXTERNAL_URLS = {
    // CGWA NOC Portal URLs
    LOGIN_URL: '/noc/login',
    REGISTER_URL: '/noc/register',

    // External Services
    CHARGES_CALCULATOR: 'https://rgwcma.geoplanetsolution.in/charges',
    RIG_REGISTRATION: 'https://rgwcma-rig.geoplanetsolution.in/',

    // Assets
    LOGO_URL: 'https://rgwcma.geoplanetsolution.in/assets/img/logo.png',
    EMBLEM_URL: 'https://rgwcma.geoplanetsolution.in/assets/img/emb-logo.png',

    // Navigation
    ABOUT_URL: 'https://rgwcma.geoplanetsolution.in/about',
    SERVICES_URL: 'https://rgwcma.geoplanetsolution.in/services',
    GUIDELINES_URL: 'https://rgwcma.geoplanetsolution.in/guidelines',
    DOWNLOADS_URL: 'https://rgwcma.geoplanetsolution.in/downloads',
    CONTACT_URL: 'https://rgwcma.geoplanetsolution.in/contact',

    // Consultation Services
    CONSULTATION_APP_URL: CONSULTATION_URL,
};

// You can also export individual URLs if preferred
export const LOGIN_URL = EXTERNAL_URLS.LOGIN_URL;
export const REGISTER_URL = EXTERNAL_URLS.REGISTER_URL;
