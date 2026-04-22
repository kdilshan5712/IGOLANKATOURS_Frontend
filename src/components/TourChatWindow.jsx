/**
 * 🎯 I GO LANKA TOURS - Real-time Tour Chat Interface
 * 
 * Component facilitating multi-party communication between travelers, guides, 
 * and administrators. Implements adaptive polling, document visibility-aware 
 * updates, and administrative access controls (Lock/Unlock chat).
 * 
 * @module TourChatWindow
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader, MessageCircle, Lock, Unlock } from 'lucide-react';
import { chatAPI } from '../services/api';
import './TourChatWindow.css';

const POLL_INTERVAL_ACTIVE = 2000;   // 2s when tab is visible
const POLL_INTERVAL_HIDDEN = 8000;   // 8s when tab is hidden

/**
 * TourChatWindow Component
 * 
 * Orchestrates live messaging and administrative monitoring for tour bookings.
 * 
 * @param {Object} props
 * @param {string} props.bookingId - Unique identifier for the shared chat session.
 * @param {boolean} [props.initialAuthStatus=false] - Starting lock state of the chat.
 * @param {Function} props.onClose - UI callback to terminate visibility.
 * @param {Function} [props.onAuthChange] - Callback triggered on lock state toggle.
 * @returns {JSX.Element}
 */
const TourChatWindow = ({ bookingId, initialAuthStatus = false, onClose, onAuthChange }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(initialAuthStatus);
    const [isTogglingAuth, setIsTogglingAuth] = useState(false);
    const [newMessagesCount, setNewMessagesCount] = useState(0);

    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);
    const lastMessageCountRef = useRef(0);
    const isFirstLoad = useRef(true);

    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }, []);

    const fetchMessages = useCallback(async (silent = false) => {
        try {
            const token = localStorage.getItem('token');
            const response = await chatAPI.getMessages(bookingId, token);

            if (response.success) {
                setMessages(prev => {
                    const newCount = response.messages.length;
                    // Only notify about new messages after first load
                    if (!isFirstLoad.current && newCount > lastMessageCountRef.current) {
                        const added = newCount - lastMessageCountRef.current;
                        setNewMessagesCount(c => c + added);
                    }
                    lastMessageCountRef.current = newCount;
                    return response.messages;
                });
                if (response.is_chat_authorized !== undefined) {
                    setIsAuthorized(response.is_chat_authorized);
                }
                if (isFirstLoad.current) {
                    isFirstLoad.current = false;
                }
            } else {
                if (!silent) setError(response.message || 'Failed to load messages');
            }
        } catch (err) {
            if (!silent) setError('Failed to connect to chat server');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [bookingId]);

    // Adaptive polling based on document visibility
    const startPolling = useCallback(() => {
        clearInterval(intervalRef.current);
        const interval = document.visibilityState === 'visible'
            ? POLL_INTERVAL_ACTIVE
            : POLL_INTERVAL_HIDDEN;
        intervalRef.current = setInterval(() => fetchMessages(true), interval);
    }, [fetchMessages]);

    useEffect(() => {
        setCurrentUserRole(localStorage.getItem('userRole') || '');
        fetchMessages(false);
        startPolling();

        const handleVisibilityChange = () => startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [bookingId, fetchMessages, startPolling]);

    // Auto-scroll when messages change and clear new message count when user scrolls to bottom
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
            setNewMessagesCount(0);
        }
    }, [messages, scrollToBottom]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const text = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const token = localStorage.getItem('token');
            const response = await chatAPI.sendMessage(bookingId, text, token);

            if (response.success) {
                // Immediately add new message and restart polling
                setMessages(prev => [...prev, response.data]);
                lastMessageCountRef.current += 1;
                startPolling(); // reset timer
            } else {
                setNewMessage(text); // restore on failure
                setError(response.message || 'Failed to send message');
                setTimeout(() => setError(null), 4000);
            }
        } catch (err) {
            setNewMessage(text);
            setError('Failed to send message. Please try again.');
            setTimeout(() => setError(null), 4000);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleToggleAuth = async () => {
        setIsTogglingAuth(true);
        try {
            const token = localStorage.getItem('token');
            const newStatus = !isAuthorized;
            const response = await chatAPI.authorizeChat(bookingId, newStatus, token);
            if (response.success) {
                setIsAuthorized(newStatus);
                await fetchMessages(true);
                if (onAuthChange) onAuthChange();
            } else {
                setError(response.message || 'Failed to update chat authorization');
                setTimeout(() => setError(null), 4000);
            }
        } catch (err) {
            setError('An error occurred while updating chat access.');
            setTimeout(() => setError(null), 4000);
        } finally {
            setIsTogglingAuth(false);
        }
    };

    const formatTime = (dateString) =>
        new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isInputDisabled = sending || loading || (!isAuthorized && currentUserRole !== 'admin');

    return (
        <div className="chat-overlay">
            <div className="chat-window">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <div className="chat-header-icon">
                            <MessageCircle size={18} />
                        </div>
                        <div>
                            <h3 className="chat-title">Tour Chat</h3>
                            <span className="chat-subtitle">
                                {currentUserRole === 'admin'
                                    ? 'Monitoring · Booking #' + bookingId
                                    : currentUserRole === 'tourist'
                                        ? 'Chatting with your Guide'
                                        : 'Chatting with Tourist'}
                            </span>
                        </div>
                    </div>
                    <div className="chat-header-right">
                        {/* Live indicator */}
                        <span className="chat-live-badge">
                            <span className="chat-live-dot"></span>Live
                        </span>
                        <button className="chat-close-btn" onClick={onClose} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Admin Auth Banner */}
                {currentUserRole === 'admin' && (
                    <div className={`chat-auth-banner ${isAuthorized ? 'authorized' : 'locked'}`}>
                        <div className="chat-auth-info">
                            {isAuthorized
                                ? <><Unlock size={14} /> Chat is open — tourist & guide can communicate</>
                                : <><Lock size={14} /> Chat is locked — tourist & guide cannot communicate</>}
                        </div>
                        <button
                            className={`chat-auth-btn ${isAuthorized ? 'revoke' : 'grant'}`}
                            onClick={handleToggleAuth}
                            disabled={isTogglingAuth}
                        >
                            {isTogglingAuth
                                ? <Loader size={12} className="chat-spin" />
                                : isAuthorized ? 'Lock Chat' : 'Unlock Chat'}
                        </button>
                    </div>
                )}

                {/* Safety notice for tourist/guide */}
                {currentUserRole !== 'admin' && isAuthorized && (
                    <div className="chat-safety-notice">
                        🛡️ This chat is monitored by admin for your safety
                    </div>
                )}

                {/* Messages */}
                <div className="chat-messages">
                    {loading ? (
                        <div className="chat-center-state">
                            <Loader size={28} className="chat-spin" />
                            <p>Loading messages...</p>
                        </div>
                    ) : error ? (
                        <div className="chat-center-state error">
                            <p>{error}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="chat-center-state">
                            <MessageCircle size={36} opacity={0.3} />
                            <p>No messages yet — say hello! 👋</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const senderId = localStorage.getItem('userId');
                            const isMine = msg.sender_role === currentUserRole;
                            const isSystem = msg.sender_role === 'admin' && msg.message.startsWith('🛡️ System:');
                            const isAdminMsg = msg.sender_role === 'admin' && !isSystem;

                            if (isSystem) {
                                return (
                                    <div key={msg.id} className="chat-system-msg">
                                        {msg.message}
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.id} className={`chat-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                                    {!isMine && (
                                        <span className={`chat-sender-name ${isAdminMsg ? 'admin-name' : ''}`}>
                                            {msg.sender_name}
                                            {isAdminMsg && <span className="chat-admin-tag">Admin</span>}
                                        </span>
                                    )}
                                    <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'} ${isAdminMsg && !isMine ? 'admin-bubble' : ''}`}>
                                        <p>{msg.message}</p>
                                        <span className="chat-time">{formatTime(msg.created_at)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* New messages notification */}
                {newMessagesCount > 0 && (
                    <button className="chat-new-msg-btn" onClick={() => { scrollToBottom(); setNewMessagesCount(0); }}>
                        ↓ {newMessagesCount} new message{newMessagesCount > 1 ? 's' : ''}
                    </button>
                )}

                {/* Locked notice for tourist/guide */}
                {!isAuthorized && currentUserRole !== 'admin' && (
                    <div className="chat-locked-notice">
                        <Lock size={14} />
                        <span>Chat is locked by admin. Please wait for authorization.</span>
                    </div>
                )}

                {/* Input */}
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        className={`chat-input ${isInputDisabled ? 'disabled' : ''}`}
                        placeholder={isInputDisabled && currentUserRole !== 'admin' ? 'Chat locked...' : 'Type a message and press Enter...'}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isInputDisabled}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!newMessage.trim() || isInputDisabled}
                        aria-label="Send"
                    >
                        {sending ? <Loader size={18} className="chat-spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TourChatWindow;
