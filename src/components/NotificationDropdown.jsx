/**
 * 🎯 I GO LANKA TOURS - Notification Dropdown Component
 * 
 * Interactive list displaying recent system notifications. Supports read 
 * status updates, bulk mark-as-read, and contextual navigation based on 
 * notification payload (e.g., jumping to a booking details page).
 * 
 * @module NotificationDropdown
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Trash2, Bell, Calendar, CheckCircle, AlertCircle, Info, Package } from 'lucide-react';
import { notificationAPI } from '../services/api';
import './NotificationDropdown.css';

/**
 * NotificationDropdown Component
 * 
 * Renders an actionable list of system alerts with contextual categorization.
 * 
 * @param {Object} props
 * @param {Function} props.onClose - UI callback to hide the dropdown.
 * @param {Function} props.onUpdate - Callback to refresh parent state (e.g., bell count).
 * @returns {JSX.Element}
 */
function NotificationDropdown({ onClose, onUpdate }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationAPI.getAll(10);
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read) {
            await notificationAPI.markAsRead(notification.notification_id);
            onUpdate();
        }

        // Navigate to link if exists
        if (notification.link) {
            navigate(notification.link);
        }

        onClose();
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            fetchNotifications();
            onUpdate();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationAPI.delete(id);
            fetchNotifications();
            onUpdate();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking':
            case 'new_booking':
                return <Calendar size={20} />;
            case 'success':
            case 'approved':
            case 'confirmed':
                return <CheckCircle size={20} />;
            case 'warning':
            case 'pending':
                return <AlertCircle size={20} />;
            case 'info':
            case 'update':
                return <Info size={20} />;
            case 'package':
                return <Package size={20} />;
            default:
                return <Bell size={20} />;
        }
    };

    const getNotificationType = (notification) => {
        const message = notification.message?.toLowerCase() || '';
        const title = notification.title?.toLowerCase() || '';

        if (message.includes('booking') || message.includes('tour') || title.includes('booking')) {
            return 'booking';
        }
        if (message.includes('approved') || message.includes('confirmed') || title.includes('approved')) {
            return 'success';
        }
        if (message.includes('pending') || message.includes('review') || title.includes('pending')) {
            return 'warning';
        }
        if (message.includes('cancelled') || message.includes('rejected') || title.includes('cancelled')) {
            return 'error';
        }
        return 'info';
    };

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Notifications</h3>
                <div className="notification-actions">
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            title="Mark all as read"
                            className="notification-action-btn"
                        >
                            <Check size={16} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="notification-action-btn"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="notification-list">
                {loading ? (
                    <div className="notification-loading">
                        <Bell size={24} className="notification-loading-icon" />
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                        <Bell size={48} className="notification-empty-icon" />
                        <p>No notifications yet</p>
                        <span>We'll notify you when something happens</span>
                    </div>
                ) : (
                    notifications.map(notif => {
                        const type = getNotificationType(notif);
                        return (
                            <div
                                key={notif.notification_id}
                                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className={`notification-icon-wrapper ${type}`}>
                                    {getNotificationIcon(type)}
                                </div>
                                <div className="notification-content">
                                    <h4>{notif.title}</h4>
                                    <p>{notif.message}</p>
                                    <span className="notification-time">
                                        {formatTime(notif.created_at)}
                                    </span>
                                </div>
                                <button
                                    className="notification-delete"
                                    onClick={(e) => handleDelete(e, notif.notification_id)}
                                    title="Delete notification"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {notifications.length > 0 && (
                <div className="notification-footer">
                    <button onClick={() => { navigate('/notifications'); onClose(); }}>
                        View All Notifications
                    </button>
                </div>
            )}
        </div>
    );
}

export default NotificationDropdown;
