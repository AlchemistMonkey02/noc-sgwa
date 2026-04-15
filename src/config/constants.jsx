import { CONSULTATION_APP_URL, PUBLIC_SITE_URL, RIG_REGISTRATION_URL, MAIN_PORTAL_URL } from './apiConfig';

// Global Configuration for External URLs
export const EXTERNAL_URLS = {
    // CGWA NOC Portal URLs
    LOGIN_URL: '/noc/login',
    REGISTER_URL: '/noc/register',
    MAIN_PORTAL: MAIN_PORTAL_URL,

    // External Services
    CHARGES_CALCULATOR: `${PUBLIC_SITE_URL}/charges`,
    RIG_REGISTRATION: RIG_REGISTRATION_URL,

    // Assets
    LOGO_URL: `${PUBLIC_SITE_URL}/assets/img/logo.png`,
    EMBLEM_URL: `${PUBLIC_SITE_URL}/assets/img/emb-logo.png`,

    // Navigation
    ABOUT_URL: `${PUBLIC_SITE_URL}/about`,
    SERVICES_URL: `${PUBLIC_SITE_URL}/services`,
    GUIDELINES_URL: `${PUBLIC_SITE_URL}/guidelines`,
    DOWNLOADS_URL: `${PUBLIC_SITE_URL}/downloads`,
    CONTACT_URL: `${PUBLIC_SITE_URL}/contact`,

    // Consultation Services
    CONSULTATION_APP_URL: CONSULTATION_APP_URL,
};

// You can also export individual URLs if preferred
export const LOGIN_URL = EXTERNAL_URLS.LOGIN_URL;
export const REGISTER_URL = EXTERNAL_URLS.REGISTER_URL;
