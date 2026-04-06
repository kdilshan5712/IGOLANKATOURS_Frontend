import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_CONFIG } from '../config/session';

/**
 * Hook to handle user inactivity timeout
 * Automatically logs out user after specified period of inactivity
 * 
 * @param {number} timeoutMs - Timeout duration in milliseconds (default: 30 minutes)
 */
export const useInactivityTimeout = (timeoutMs = SESSION_CONFIG.INACTIVITY_TIMEOUT) => {
    const navigate = useNavigate();

    useEffect(() => {
        let timeout;

        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Clear all session data
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to login with message
                navigate('/login', {
                    state: { error: 'Session expired due to inactivity. Please log in again.' },
                    replace: true
                });
            }, timeoutMs);
        };

        // Events that indicate user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimeout);
        });

        // Start the timeout
        resetTimeout();

        // Cleanup
        return () => {
            clearTimeout(timeout);
            events.forEach(event => {
                window.removeEventListener(event, resetTimeout);
            });
        };
    }, [timeoutMs, navigate]);
};
