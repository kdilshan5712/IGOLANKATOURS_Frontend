import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, X, Check, AlertCircle, HelpCircle, MessageSquare } from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminFAQ.css";

function AdminFAQPage() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [formData, setFormData] = useState({
    category: "Booking & Payments",
    question: "",
    answer: "",
    is_active: true
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchFaqs();
  }, [navigate]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const result = await adminAPI.getFaqs(token);

      if (result.success) {
        setFaqs(result.faqs || []);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active
      });
    } else {
      setEditingFaq(null);
      setFormData({
        category: "Booking & Payments",
        question: "",
        answer: "",
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let result;
      if (editingFaq) {
        result = await adminAPI.updateFaq(editingFaq.id, formData, token);
      } else {
        result = await adminAPI.createFaq(formData, token);
      }

      if (result.success) {
        setNotificationMessage(editingFaq ? "FAQ updated successfully!" : "FAQ created successfully!");
        setNotificationType("success");
        setShowNotification(true);
        await fetchFaqs();
        setTimeout(() => {
          setShowNotification(false);
          handleCloseModal();
        }, 1500);
      } else {
        setNotificationMessage(result.message || "Operation failed");
        setNotificationType("error");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      setNotificationMessage("Failed to save FAQ");
      setNotificationType("error");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    setConfirmMessage("Are you sure you want to delete this FAQ? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        const result = await adminAPI.deleteFaq(id, token);
        if (result.success) {
          setNotificationMessage("FAQ deleted successfully!");
          setNotificationType("success");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => {
            setShowNotification(false);
            fetchFaqs();
          }, 1500);
        } else {
          setNotificationMessage(result.message || "Failed to delete FAQ");
          setNotificationType("error");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        setNotificationMessage("Failed to delete FAQ");
        setNotificationType("error");
        setShowNotification(true);
        setShowConfirmModal(false);
        setTimeout(() => setShowNotification(false), 3000);
      }
    });
    setShowConfirmModal(true);
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Frequently Asked Questions</h1>
          <p className="page-subtitle">Manage the support content and common queries</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Add New FAQ
        </button>
      </div>

      <div className="table-responsive faq-table-container glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td className="faq-question-cell">
                  <div className="faq-info">
                    <div className="faq-icon-circle">
                      <HelpCircle size={18} />
                    </div>
                    <div className="faq-text-content">
                      <span className="faq-question-title">{faq.question}</span>
                      <p className="faq-answer-preview">{faq.answer}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge category-${faq.category?.toLowerCase().replace(/[\s&]+/g, '-')}`}>
                    {faq.category}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${faq.is_active ? 'status-approved' : 'status-rejected'}`}>
                    {faq.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleOpenModal(faq)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="text-center py-8">
                  <div style={{ color: 'var(--admin-text-muted)' }}>No FAQs found. Add one to get started!</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</h2>
              <button onClick={handleCloseModal} className="modal-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="faq-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div className="modal-form-group">
                      <label className="modal-label">Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="modal-input" required>
                        <option value="Booking & Payments">Booking & Payments</option>
                        <option value="Tours & Travel">Tours & Travel</option>
                        <option value="Practical Information">Practical Information</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="modal-form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem' }}>
                      <label className="modal-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0 }}>
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        Visible on Public Page
                      </label>
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Question *</label>
                    <input
                      type="text"
                      name="question"
                      className="modal-input"
                      value={formData.question}
                      onChange={handleChange}
                      required
                      placeholder="Enter the question..."
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Answer *</label>
                    <textarea
                      name="answer"
                      className="modal-input"
                      style={{ minHeight: '150px', resize: 'vertical' }}
                      value={formData.answer}
                      onChange={handleChange}
                      rows="6"
                      required
                      placeholder="Enter the detailed answer..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFaq ? "Update FAQ" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotification && (
        <div className="modal-overlay" onClick={() => setShowNotification(false)}>
          <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <div className="notification-icon" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              {notificationType === "success" && <Check size={56} color="#10b981" style={{ background: '#f0fdf4', padding: '12px', borderRadius: '50%' }} />}
              {notificationType === "error" && <AlertCircle size={56} color="#ef4444" style={{ background: '#fef2f2', padding: '12px', borderRadius: '50%' }} />}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
              {notificationType === "success" ? "Success!" : "Notice"}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>{notificationMessage}</p>
            <button
              className="btn btn-secondary"
              style={{ minWidth: '120px' }}
              onClick={() => setShowNotification(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <AlertCircle size={20} /> Confirm Delete
              </h2>
              <button onClick={() => setShowConfirmModal(false)} className="modal-close-btn"><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Trash2 size={32} color="#dc2626" />
              </div>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>Are you sure?</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9375rem' }}>{confirmMessage}</p>
            </div>

            <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                No, Keep it
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFAQPage;
