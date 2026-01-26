import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Mail, Phone, Trash2, Save } from "lucide-react";
import { contactAPI } from "../../services/api";
import "./AdminContacts.css";

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
  const [statusCounts, setStatusCounts] = useState({});
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
      const result = await contactAPI.getAllAdmin(token, {
        status: statusFilter,
        limit: 50,
        offset: 0
      });

      if (result.success) {
        setMessages(result.messages || []); // Backend returns 'messages' not 'contacts'
        setStatusCounts(result.statusCounts || {});
        setMessage(null);
      } else {
        setMessage(result.message || "Failed to fetch messages");
        setMessageType("error");
      }
    } catch (error) {
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
    
    // Mark as read if it's new
    if (msg.status === "new") {
      try {
        const result = await contactAPI.markRead(token, msg.contact_id);
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
      const result = await contactAPI.update(token, selectedMessage.contact_id, {
        admin_notes: notesEdit,
        status: selectedMessage.status
      });

      if (result.success) {
        setMessage("Notes saved successfully");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
        
        // Update selected message
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
    if (!window.confirm("Permanently delete this message? This action cannot be undone.")) return;

    try {
      const result = await contactAPI.delete(token, contactId);
      if (result.success) {
        setMessage("Message deleted successfully");
        setMessageType("success");
        setTimeout(() => setMessage(null), 3000);
        setSelectedMessage(null);
        await fetchMessages();
      } else {
        setMessage(result.message || "Failed to delete message");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setMessage("Failed to delete message");
      setMessageType("error");
    }
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setNotesEdit("");
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
          {message && (
            <div className={`admin-message admin-message-${messageType}`}>
              {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p>{message}</p>
            </div>
          )}

          <div className="contacts-filters">
            <button
              className={statusFilter === "new" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("new")}
            >
              New ({statusCounts.new || 0})
            </button>
            <button
              className={statusFilter === "read" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("read")}
            >
              Read ({statusCounts.read || 0})
            </button>
            <button
              className={statusFilter === "responded" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("responded")}
            >
              Responded ({statusCounts.responded || 0})
            </button>
            <button
              className={statusFilter === "archived" ? "filter-btn active" : "filter-btn"}
              onClick={() => setStatusFilter("archived")}
            >
              Archived ({statusCounts.archived || 0})
            </button>
          </div>

          <div className="messages-list">
            {messages.length === 0 ? (
              <p className="no-data">No {statusFilter} messages found</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.contact_id}
                  className={`message-card ${msg.status === "new" ? "unread" : ""}`}
                  onClick={() => handleViewMessage(msg)}
                >
                  <div className="message-header">
                    <div className="sender-info">
                      <strong>{msg.name}</strong>
                      <span className={`status-badge status-${msg.status}`}>
                        {msg.status}
                      </span>
                    </div>
                    <small>{msg.created_at ? new Date(msg.created_at).toLocaleString() : "Recently"}</small>
                  </div>

                  <div className="message-subject">
                    {msg.subject || "No Subject"}
                  </div>

                  <div className="message-preview">
                    {msg.message.substring(0, 120)}...
                  </div>

                  <div className="message-meta">
                    <span><Mail size={14} /> {msg.email}</span>
                    {msg.phone && <span><Phone size={14} /> {msg.phone}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

      {selectedMessage && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Contact Message</h2>
                <span className={`status-badge status-${selectedMessage.status}`}>
                  {selectedMessage.status}
                </span>
              </div>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            <div className="message-details">
              <div className="detail-section">
                <h3>Sender Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedMessage.email}</span>
                  </div>
                  {selectedMessage.phone && (
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedMessage.phone}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Received:</label>
                    <span>
                      {selectedMessage.created_at
                        ? new Date(selectedMessage.created_at).toLocaleString()
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Subject</h3>
                <p className="message-subject-full">
                  {selectedMessage.subject || "No Subject"}
                </p>
              </div>

              <div className="detail-section">
                <h3>Message</h3>
                <div className="message-content">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="detail-section">
                <h3>Admin Notes</h3>
                <textarea
                  className="notes-textarea"
                  value={notesEdit}
                  onChange={(e) => setNotesEdit(e.target.value)}
                  placeholder="Add internal notes about this message..."
                  rows="4"
                />
                <button
                  className="btn-save-notes"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  <Save size={16} />
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>

              <div className="modal-actions">
                {selectedMessage.status !== "responded" && (
                  <button
                    className="btn-marked-responded"
                    onClick={() => handleMarkResponded(selectedMessage.contact_id)}
                  >
                    Mark as Responded
                  </button>
                )}
                <button
                  className="btn-delete-message"
                  onClick={() => handleDelete(selectedMessage.contact_id)}
                >
                  <Trash2 size={16} />
                  Delete Message
                </button>
                <button className="btn-close-modal" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactsPage;
