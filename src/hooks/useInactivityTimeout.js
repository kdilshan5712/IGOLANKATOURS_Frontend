/**
 * 🎯 I GO LANKA TOURS - Inactivity Timeout Service Hook
 * 
 * Security-focused hook that monitors user interaction events and automatically 
 * terminates sessions after a predefined period of inactivity. Ensures local 
 * storage and session state are purged before redirecting to authentication.
 * 
 * @module useInactivityTimeout
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_CONFIG } from '../config/session';

/**
 * useInactivityTimeout Hook
 * 
 * Enforces session security by monitoring user engagement across global window events.
 * 
 * @param {number} timeoutMs - Timeout duration in milliseconds.
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
