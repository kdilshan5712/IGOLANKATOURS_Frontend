/**
 * 🎯 I GO LANKA TOURS - Notification Management Hook
 * 
 * Generic hook for managing system alerts and messages for any user role. 
 * Implements automated periodic synchronization, unread status tracking, 
 * and local state updates for instantaneous UI feedback.
 * 
 * @module useNotifications
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:5000/api" 
    : "/api");

/**
 * useNotifications Hook
 * 
 * Centralizes notification arrival and status transitions.
 * 
 * @param {string} token - JWT authentication token.
 * @param {number} refreshInterval - Auto-refresh interval in milliseconds (default: 30000).
 * @returns {Object} Notifications state and refresh/read control functions.
 */
export const useNotifications = (token, refreshInterval = 30000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch notifications, status:', response.status);
        // Don't throw, just set empty state
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.warn('Error fetching notifications (non-critical):', error.message);
      // Silently fail and set empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.notification_id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh notifications
  useEffect(() => {
    if (!token || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [token, refreshInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead
  };
};
