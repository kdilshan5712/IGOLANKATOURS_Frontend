// Session Configuration
export const SESSION_CONFIG = {
    // JWT token expiration time
    TOKEN_EXPIRY: '2h',

    // Session timeout in milliseconds (2 hours)
    SESSION_TIMEOUT: 2 * 60 * 60 * 1000,

    // Inactivity timeout in milliseconds (30 minutes)
    INACTIVITY_TIMEOUT: 30 * 60 * 1000,

    // Clear session on browser close
    CLEAR_ON_CLOSE: true,

    // Remember me duration (if implemented later)
    REMEMBER_ME_DURATION: '7d'
};
