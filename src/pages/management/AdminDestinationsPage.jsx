/**
 * 🎯 I GO LANKA TOURS - Admin Destinations Management
 * 
 * Provides an administrative interface for managing Sri Lankan travel hotspots.
 * Supports CRUD operations, category assignments, and rich description management.
 * 
 * @module AdminDestinationsPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, X, Check, AlertCircle, Image as ImageIcon, MapPin } from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminDestinations.css";

/**
 * AdminDestinationsPage Component
 * 
 * Orchestrates destination inventory management through synchronized API 
 * interactions and interactive modal interfaces.
 * 
 * @returns {JSX.Element}
 */
function AdminDestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "Cultural",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "admin" && role !== "superadmin")) {
      navigate("/login");
      return;
    }

    fetchDestinations();
  }, [navigate]);

  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem("token");
      // @API_CALL: Fetch all geographic destinations for administrative management
      const result = await adminAPI.getAllDestinations(token);

      if (result.success) {
        setDestinations(result.data || []);
      }
    } catch (error) {
      // @ERROR_HANDLING: Persistent failure or unauthorized access during fetch
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (destination = null) => {
    if (destination) {
      setEditingDestination(destination);
      setFormData({
        name: destination.name,
        category: destination.category,
        description: destination.description,
        image_url: destination.image_url || ""
      });
    } else {
      setEditingDestination(null);
      setFormData({
        name: "",
        category: "Cultural",
        description: "",
        image_url: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDestination(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let result;
      if (editingDestination) {
        // @API_CALL: Update metadata for an existing destination
        result = await adminAPI.updateDestination(editingDestination.destination_id, formData, token);
      } else {
        // @API_CALL: Create a new destination entry in the system
        result = await adminAPI.createDestination(formData, token);
      }

      if (result.success) {
        setNotificationMessage(editingDestination ? "Destination updated successfully!" : "Destination created successfully!");
        setNotificationType("success");
        setShowNotification(true);
        await fetchDestinations();
        setTimeout(() => {
          setShowNotification(false);
          handleCloseModal();
        }, 1500);
      } else {
        // @ERROR_HANDLING: Validation or service failure during destination save
        setNotificationMessage(result.message || "Operation failed");
        setNotificationType("error");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      // @ERROR_HANDLING: Unexpected network or system failure
      console.error("Error saving destination:", error);
      setNotificationMessage("Failed to save destination");
      setNotificationType("error");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    setConfirmMessage("Are you sure you want to delete this destination? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        const result = await adminAPI.deleteDestination(id, token);
        if (result.success) {
          setNotificationMessage("Destination deleted successfully!");
          setNotificationType("success");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => {
            setShowNotification(false);
            fetchDestinations();
          }, 1500);
        } else {
          setNotificationMessage(result.message || "Failed to delete destination");
          setNotificationType("error");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (error) {
        console.error("Error deleting destination:", error);
        setNotificationMessage("Failed to delete destination");
        setNotificationType("error");
        setShowNotification(true);
        setShowConfirmModal(false);
        setTimeout(() => setShowNotification(false), 3000);
      }
    });
    setShowConfirmModal(true);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading destinations...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Destinations</h1>
          <p className="page-subtitle">Manage Sri Lanka's top travel locations</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Add New Destination
        </button>
      </div>

      <div className="table-responsive destinations-table-container glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((dest) => (
              <tr key={dest.destination_id}>
                <td className="destination-name-cell">
                  <div className="destination-info">
                    {dest.image_url ? (
                      <img src={dest.image_url} alt={dest.name} className="destination-thumb" />
                    ) : (
                      <div className="destination-thumb-placeholder">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <span style={{ fontWeight: '500' }}>{dest.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${dest.category?.toLowerCase() || 'cultural'}`}>
                    {dest.category}
                  </span>
                </td>
                <td style={{ maxWidth: '400px' }}>
                  <div style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    color: 'var(--admin-text-secondary)',
                    fontSize: '0.875rem'
                  }}>
                    {dest.description}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleOpenModal(dest)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(dest.destination_id)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {destinations.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8">
                  <div style={{ color: 'var(--admin-text-muted)' }}>No destinations found. Add one to get started!</div>
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
              <h2>{editingDestination ? "Edit Destination" : "Add New Destination"}</h2>
              <button onClick={handleCloseModal} className="modal-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="destination-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div className="modal-form-group">
                      <label className="modal-label">Destination Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="modal-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Sigiriya"
                      />
                    </div>

                    <div className="modal-form-group">
                      <label className="modal-label">Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="modal-input">
                        <option value="Cultural">Cultural</option>
                        <option value="Nature">Nature</option>
                        <option value="Beach">Beach</option>
                        <option value="Wildlife">Wildlife</option>
                        <option value="Adventure">Adventure</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Description *</label>
                    <textarea
                      name="description"
                      className="modal-input"
                      style={{ minHeight: '120px', resize: 'vertical' }}
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      required
                      placeholder="Enter a brief overview of the destination..."
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Image URL</label>
                    <input
                      type="url"
                      name="image_url"
                      className="modal-input"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                    <small style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>Provide a valid image URL (Unsplash, Supabase, etc.)</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDestination ? "Update Destination" : "Create Destination"}
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

export default AdminDestinationsPage;
