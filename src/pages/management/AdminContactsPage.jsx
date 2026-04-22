/**
 * 🎯 I GO LANKA TOURS - Admin Contacts Management
 * 
 * Provides an interface for administrators to manage user inquiries. 
 * Allows for reading, responding via email, adding internal notes, 
 * and tracking message statuses (new, read, responded, archived).
 * 
 * @module AdminContactsPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Mail, Phone, Trash2, Save, MessageSquare, X, User, Send, Loader } from "lucide-react";
import { contactAPI, adminAPI } from "../../services/api";
import "./AdminContacts.css";

/**
 * AdminContactsPage Component
 * 
 * Orchestrates the lifecycle of contact messages, including state management 
 * for replies, notes, and status updates.
 * 
 * @returns {JSX.Element}
 */
function AdminContactsPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("new");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [notesEdit, setNotesEdit] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(false);

  const [statusCounts, setStatusCounts] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchMessages();
  }, [navigate, token, role, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // @API_CALL: Fetch contact messages based on current status filter
      const result = await contactAPI.getAllAdmin(token, {
        status: statusFilter,
        limit: 50,
        offset: 0
      });

      if (result.success) {
        setMessages(result.messages || []);
        setStatusCounts(result.statusCounts || {});
        setMessage(null);
      } else {
        // @ERROR_HANDLING: API failure response
        setMessage(result.message || "Failed to fetch messages");
        setMessageType("error");
      }
    } catch (error) {
      // @ERROR_HANDLING: Connection or major failure
      console.error("Error fetching messages:", error);
      setMessage("Failed to fetch messages");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (msg) => {
    setSelectedMessage(msg);
    setNotesEdit(msg.admin_notes || "");
    setReplyText("");
    setReplyError(null);
    setReplySuccess(false);

    if (msg.status === "new") {
      try {
        const result = await contactAPI.markRead(token, msg.message_id);
        if (result.success) {
          await fetchMessages();
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;

    try {
      setSavingNotes(true);
      const result = await contactAPI.update(token, selectedMessage.message_id, {
        admin_notes: notesEdit,
        status: selectedMessage.status
      });

      if (result.success) {
        setMessage("Notes saved successfully");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);

        setSelectedMessage({
          ...selectedMessage,
          admin_notes: notesEdit
        });

        await fetchMessages();
      } else {
        setMessage(result.message || "Failed to save notes");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      setMessage("Failed to save notes");
      setMessageType("error");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      setReplying(true);
      setReplyError(null);
      setReplySuccess(false);

      // @API_CALL: Send direct email reply to the traveler
      const result = await adminAPI.replyContactMessage(selectedMessage.message_id, replyText, token);

      if (result.success) {
        setReplySuccess(true);
        setReplyText("");
        // @VALIDATION: Update local state to reflect the responded status immediately
        setSelectedMessage({
          ...selectedMessage,
          status: "responded"
        });
        fetchMessages();
      } else {
        // @ERROR_HANDLING: Email sending failed
        setReplyError(result.message || "Failed to send reply");
      }
    } catch (error) {
      // @ERROR_HANDLING: Unexpected system failure during email dispatch
      console.error("Error sending reply:", error);
      setReplyError("An unexpected error occurred");
    } finally {
      setReplying(false);
    }
  };

  const handleMarkResponded = async (contactId) => {
    try {
      const result = await contactAPI.update(token, contactId, {
        status: "responded"
      });

      if (result.success) {
        setMessage("Message marked as responded");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
        await fetchMessages();
        setSelectedMessage(null);
      } else {
        setMessage(result.message || "Failed to update message");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      setMessage("Failed to update message");
      setMessageType("error");
    }
  };

  const handleDelete = async (contactId) => {
    setConfirmMessage("Permanently delete this message? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        const result = await contactAPI.delete(token, contactId);
        if (result.success) {
          setMessage("Message deleted successfully");
          setMessageType("success");
          setShowConfirmModal(false);
          setTimeout(() => setMessage(null), 3000);
          setSelectedMessage(null);
          await fetchMessages();
        } else {
          setMessage(result.message || "Failed to delete message");
          setMessageType("error");
          setShowConfirmModal(false);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        setMessage("Failed to delete message");
        setMessageType("error");
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setNotesEdit("");
    setReplyText("");
    setReplyError(null);
    setReplySuccess(false);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">Inquiries from the contact form</p>
        </div>
      </div>

      {message && (
        <div className={`admin-message admin-message-${messageType}`}>
          {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{message}</p>
        </div>
      )}

      <div className="contacts-filters">
        {["new", "read", "responded", "archived"].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? "filter-btn active" : "filter-btn"}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="count-badge">
              {statusCounts[status] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="messages-grid">
        {messages.length === 0 ? (
          <div className="no-data glass-panel">No {statusFilter} messages found</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`message-card glass-panel ${msg.status === "new" ? "unread" : ""}`}
              onClick={() => handleViewMessage(msg)}
            >
              <div className="message-header">
                <div className="sender-info">
                  <User size={16} className="text-muted" />
                  <strong>{msg.name}</strong>
                </div>
                <small className="text-secondary">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : "Recently"}</small>
              </div>

              <div className="message-subject">
                {msg.subject || "No Subject"}
              </div>

              <div className="message-preview text-secondary">
                {msg.message.substring(0, 100)}...
              </div>

              <div className="message-footer">
                <span className={`status-badge status-${msg.status}`}>
                  {msg.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMessage && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-panel modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Message</h2>
              <button onClick={handleCloseModal} className="modal-close"><X size={24} /></button>
            </div>

            <div className="message-details-grid">
              <div className="detail-section full-width">
                <h3><User size={18} /> Sender Info</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{selectedMessage.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{selectedMessage.phone || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Date</label>
                    <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section full-width">
                <h3><MessageSquare size={18} /> Message Content</h3>
                <div className="subject-box glass-panel-inner">
                  <strong>Subject:</strong> {selectedMessage.subject || "No Subject"}
                </div>
                <div className="message-box glass-panel-inner">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="detail-section full-width reply-section">
                <h3><Mail size={18} /> Direct Email Reply</h3>
                <div className="reply-box-container">
                  <textarea
                    placeholder="Draft your response here to send directly to the user's email..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="reply-textarea"
                    rows={4}
                    disabled={replying}
                  />
                  {replyError && <div className="reply-alert error-alert">{replyError}</div>}
                  {replySuccess && <div className="reply-alert success-alert">Your reply was sent successfully!</div>}

                  <div className="reply-actions">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || replying}
                      className="btn btn-primary"
                    >
                      {replying ? <Loader size={16} className="spinner" /> : <Send size={16} />}
                      {replying ? "Sending Email..." : "Send Email Reply"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="detail-section full-width">
                <h3><Save size={18} /> Admin Notes</h3>
                <textarea
                  className="glass-input"
                  value={notesEdit}
                  onChange={(e) => setNotesEdit(e.target.value)}
                  placeholder="Internal notes..."
                  rows="3"
                />
                <div className="mt-2 text-right">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedMessage.status !== "responded" && (
                <button
                  className="btn btn-success"
                  onClick={() => handleMarkResponded(selectedMessage.message_id)}
                >
                  <CheckCircle size={16} /> Mark Responded
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(selectedMessage.message_id)}
              >
                <Trash2 size={16} /> Delete
              </button>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay-confirm" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content-confirm glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>{confirmMessage}</p>
            <div className="modal-footer-confirm">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactsPage;
