// Backend API configuration
export const API_BASE_URL = 'https://univent-backend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/api/accounts/login/`,
    ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login/`,
    REGISTER: `${API_BASE_URL}/api/accounts/signup/`,
    LOGOUT: `${API_BASE_URL}/api/accounts/logout/`,
    
    // User endpoints
    UPDATE_PROFILE: `${API_BASE_URL}/api/accounts/update-profile/`,
    USER_DASHBOARD: `${API_BASE_URL}/api/user/dashboard/`,
    
    // Event endpoints
    CREATE_EVENT: `${API_BASE_URL}/api/events/create/`,
    GET_EVENTS: `${API_BASE_URL}/api/events/`,
    GET_EVENT_DETAILS: (slug) => `${API_BASE_URL}/api/events/${slug}/`,
    UPDATE_EVENT: (eventId) => `${API_BASE_URL}/api/events/${eventId}/update/`,
    DELETE_EVENT: (eventId) => `${API_BASE_URL}/api/events/${eventId}/delete/`,
    
    // Registration endpoints
    REGISTER_FOR_EVENT: (eventId) => `${API_BASE_URL}/api/events/${eventId}/register/`,
    GET_REGISTRATION_DETAILS: (registrationId) => `${API_BASE_URL}/api/registrations/${registrationId}/`,
    DOWNLOAD_TICKET: (registrationId) => `${API_BASE_URL}/api/registrations/${registrationId}/download-ticket/`,
    
    // Organizer endpoints
    ORGANIZER_DASHBOARD: `${API_BASE_URL}/api/organizer/dashboard/`,
    ORGANIZER_EVENTS: `${API_BASE_URL}/api/organizer/events/`,
    EVENT_REGISTRATIONS: (eventId) => `${API_BASE_URL}/api/events/${eventId}/registrations/`,
    EVENT_PARTICIPANTS: (eventId) => `${API_BASE_URL}/api/events/${eventId}/participants/`,
    
    // Check-in endpoints
    CHECK_IN: `${API_BASE_URL}/api/check-in/`,
    QR_CHECK_IN: `${API_BASE_URL}/api/qr-check-in/`,
    TOGGLE_CHECK_IN: (registrationId) => `${API_BASE_URL}/api/registrations/${registrationId}/toggle-check-in/`,
};
