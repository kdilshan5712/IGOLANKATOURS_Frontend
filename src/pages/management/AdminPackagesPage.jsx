/**
 * 🎯 I GO LANKA TOURS - Admin Packages Management
 * 
 * Administrative suite for managing the tour inventory. Supports full CRUD 
 * operations, status toggling, and interactive feedback for inventory updates.
 * 
 * @module AdminPackagesPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Check, AlertCircle } from "lucide-react";
import { adminAPI } from "../../services/api";
import "./AdminPackages.css";

/**
 * AdminPackagesPage Component
 * 
 * Orchestrates the tour package inventory lifecycle and administrative visibility.
 * 
 * @returns {JSX.Element}
 */
function AdminPackagesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Cultural",
    budget: "mid",
    hotel: "3-star",
    rating: "4.5",
    image: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "admin" && role !== "superadmin")) {
      navigate("/login");
      return;
    }

    fetchPackages();
  }, [navigate]);

  const fetchPackages = async () => {
    try {
      // @API_CALL: Fetch all packages for the admin table
      const token = localStorage.getItem("token");
      const result = await adminAPI.getAllPackages(token);

      if (result.success) {
        setPackages(result.packages || []);
      }
    } catch (error) {
      // @ERROR_HANDLING: Log fetch failures
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        category: pkg.category,
        budget: pkg.budget,
        hotel: pkg.hotel || "3-star",
        rating: pkg.rating || "4.5",
        image: pkg.image || ""
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "Cultural",
        budget: "mid",
        hotel: "3-star",
        rating: "4.5",
        image: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
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

    // @VALIDATION: Basic presence check for mandatory fields
    if (!formData.name || !formData.description || !formData.price) {
      setNotificationMessage("Please fill in all required fields.");
      setNotificationType("error");
      setShowNotification(true);
      return;
    }

    try {
      let result;
      // @API_CALL: Determine whether to Create (POST) or Update (PUT)
      if (editingPackage) {
        result = await adminAPI.updatePackage(editingPackage.package_id, formData, token);
      } else {
        result = await adminAPI.createPackage(formData, token);
      }

      if (result.success) {
        // @ERROR_HANDLING: Success feedback and state refresh
        setNotificationMessage(editingPackage ? "Package updated successfully!" : "Package created successfully!");
        setNotificationType("success");
        setShowNotification(true);
        await fetchPackages();
        setTimeout(() => {
          setShowNotification(false);
          handleCloseModal();
        }, 1500);
      } else {
        // @ERROR_HANDLING: API-level error messaging
        setNotificationMessage(result.message || "Operation failed");
        setNotificationType("error");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      // @ERROR_HANDLING: Caught network or runtime errors
      console.error("Error saving package:", error);
      setNotificationMessage("Failed to save package");
      setNotificationType("error");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDelete = async (packageId) => {
    const token = localStorage.getItem("token");
    // @VALIDATION: Confirmation pattern for destructive actions
    setConfirmMessage("Are you sure you want to delete this package? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        // @API_CALL: Send delete request to backend
        const result = await adminAPI.deletePackage(packageId, token);
        if (result.success) {
          // @ERROR_HANDLING: Success feedback and cleanup
          setNotificationMessage("Package deleted successfully!");
          setNotificationType("success");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => {
            setShowNotification(false);
            fetchPackages();
          }, 1500);
        } else {
          // @ERROR_HANDLING: Failed deletion feedback
          setNotificationMessage(result.message || "Failed to delete package");
          setNotificationType("error");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (error) {
        // @ERROR_HANDLING: Unexpected deletion error
        console.error("Error deleting package:", error);
        setNotificationMessage("Failed to delete package");
        setNotificationType("error");
        setShowNotification(true);
        setShowConfirmModal(false);
        setTimeout(() => setShowNotification(false), 3000);
      }
    });
    setShowConfirmModal(true);
  };

  const handleToggleStatus = async (packageId, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const result = await adminAPI.updatePackage(
        packageId,
        { is_active: !currentStatus },
        token
      );
      if (result.success) {
        await fetchPackages();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Packages</h1>
          <p className="page-subtitle">Manage tour packages and inventory</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Add New Package
        </button>
      </div>

      <div className="table-responsive packages-table-container glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Budget</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.package_id}>
                <td className="package-name-cell">
                  <div className="package-info">
                    {pkg.image ? (
                      <img src={pkg.image} alt={pkg.name} className="package-thumb" loading="lazy" />
                    ) : (
                      <div className="package-thumb-placeholder">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <span>{pkg.name}</span>
                  </div>
                </td>
                <td>{pkg.category}</td>
                <td>
                  <span className={`status-badge status-${pkg.budget || 'mid'}`}>
                    {pkg.budget}
                  </span>
                </td>
                <td>{pkg.duration}</td>
                <td className="price-cell">${pkg.price}</td>
                <td>⭐ {pkg.rating}</td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={pkg.is_active}
                      onChange={() => handleToggleStatus(pkg.package_id, pkg.is_active)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleOpenModal(pkg)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.package_id)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPackage ? "Edit Package" : "Add New Package"}</h2>
              <button onClick={handleCloseModal} className="modal-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="package-form">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Package Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="modal-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Duration *</label>
                      <input
                        type="text"
                        name="duration"
                        className="modal-input"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 7 Days"
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Description *</label>
                    <textarea
                      name="description"
                      className="modal-input"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Price (USD) *</label>
                      <input
                        type="number"
                        name="price"
                        className="modal-input"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="modal-input">
                        <option value="Cultural">Cultural</option>
                        <option value="Beach">Beach</option>
                        <option value="Wildlife">Wildlife</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>

                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Budget Level *</label>
                      <select name="budget" value={formData.budget} onChange={handleChange} className="modal-input">
                        <option value="budget">Budget</option>
                        <option value="mid">Mid-Range</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Hotel Level</label>
                      <input
                        type="text"
                        name="hotel"
                        className="modal-input"
                        value={formData.hotel}
                        onChange={handleChange}
                        placeholder="e.g., 4-star"
                      />
                    </div>

                    <div className="modal-form-group" style={{ marginBottom: 0 }}>
                      <label className="modal-label">Rating</label>
                      <input
                        type="number"
                        name="rating"
                        className="modal-input"
                        value={formData.rating}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      className="modal-input"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                    <small style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>Enter Unsplash or Supabase Storage URL</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPackage ? "Update Package" : "Create Package"}
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

export default AdminPackagesPage;
