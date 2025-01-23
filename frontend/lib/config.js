// Backend API configuration
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment 
    ? 'http://localhost:5656'
    : 'https://univent-backend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/api/accounts/login/`,
    ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login/`,
    REGISTER: `${API_BASE_URL}/api/accounts/signup/`,
    LOGOUT: `${API_BASE_URL}/api/accounts/logout/`,
    
    // User endpoints
    UPDATE_PROFILE: `${API_BASE_URL}/api/accounts/attendee/profile/`,
    UPDATE_EMAIL: `${API_BASE_URL}/api/accounts/attendee/profile/email/`,
    UPDATE_ORGANIZER_PROFILE: `${API_BASE_URL}/api/accounts/organizer/profile/`,
    USER_DASHBOARD: `${API_BASE_URL}/api/events/user/dashboard/`,
    
    // Event endpoints
    CREATE_EVENT: `${API_BASE_URL}/api/events/create/`,
    GET_EVENTS: `${API_BASE_URL}/api/events/`,
    GET_EVENT_DETAILS: (eventId) => `${API_BASE_URL}/api/events/get/${eventId}/`,
    GET_PUBLIC_EVENT: (slug) => `${API_BASE_URL}/api/events/public/${slug}/`,
    UPDATE_EVENT: (eventId) => `${API_BASE_URL}/api/events/update/${eventId}/`,
    DELETE_EVENT: (eventId) => `${API_BASE_URL}/api/events/delete/${eventId}/`,
    UPLOAD_IMAGE: `${API_BASE_URL}/api/events/upload/`,
    
    // Registration endpoints
    REGISTER_FOR_EVENT: (eventId) => `${API_BASE_URL}/api/events/register/${eventId}/`,
    GET_REGISTRATION_DETAILS: (registrationId) => `${API_BASE_URL}/api/events/registration/${registrationId}/`,
    CONFIRM_REGISTRATION: (registrationId) => `${API_BASE_URL}/api/events/registration/${registrationId}/confirm/`,
    USER_REGISTERED_EVENTS: `${API_BASE_URL}/api/events/my-registrations/`,
    
    // Organizer endpoints
    ORGANIZER_DASHBOARD: `${API_BASE_URL}/api/events/organizer/dashboard/`,
    ORGANIZER_EVENTS: `${API_BASE_URL}/api/events/organizer/events/`,
    EVENT_PARTICIPANTS: (eventId) => `${API_BASE_URL}/api/events/participants/${eventId}/`,
    
    // Check-in endpoints
    TOGGLE_CHECK_IN: (registrationId) => `${API_BASE_URL}/api/events/check-in/toggle/${registrationId}/`,
    
    // Admin endpoints
    ADMIN_LIST_ATTENDEES: `${API_BASE_URL}/api/admin/attendees/`,
    ADMIN_LIST_ORGANIZERS: `${API_BASE_URL}/api/admin/organizers/`,
    ADMIN_DELETE_ATTENDEE: (attendeeId) => `${API_BASE_URL}/api/admin/attendees/${attendeeId}/`,
    ADMIN_DELETE_ORGANIZER: (organizerId) => `${API_BASE_URL}/api/admin/organizers/${organizerId}/`,

    // Notification endpoints
    USER_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/`,
    NOTIFICATION_UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count/`,
    MARK_NOTIFICATION_READ: (notificationId) => `${API_BASE_URL}/api/notifications/read/${notificationId}/`,
    EVENT_NOTIFICATIONS: (eventId) => `${API_BASE_URL}/api/notifications/event/${eventId}/list/`,
    SEND_EVENT_NOTIFICATION: (eventId) => `${API_BASE_URL}/api/notifications/event/${eventId}/`,
};
