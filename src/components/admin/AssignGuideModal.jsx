import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./AssignGuideModal.css";

function AssignGuideModal({ booking, onClose, onAssign }) {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableGuides();
  }, []);

  const fetchAvailableGuides = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use approved guides endpoint for assignment
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/guides/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setGuides(data.guides || []);
      } else {
        setError("Failed to load approved guides");
      }
    } catch (err) {
      console.error("Error fetching guides:", err);
      setError("Failed to load guides");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedGuide) {
      setError("Please select a guide");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const success = await onAssign(booking.booking_id, selectedGuide, adminNotes);
      if (success) {
        onClose();
      } else {
        setError("Failed to assign guide");
      }
    } catch  {
      setError("An error occurred while assigning guide");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Tour Guide</h2>
          <button onClick={onClose} className="modal-close" disabled={submitting} aria-label="Close modal">✕</button>
        </div>

        <div className="modal-body">
          <div className="booking-summary">
            <h3>Booking Information</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Package:</label>
                <span>{booking.package_name}</span>
              </div>
              <div className="summary-item">
                <label>Tourist:</label>
                <span>{booking.tourist_name || "N/A"}</span>
              </div>
              <div className="summary-item">
                <label>Travel Date:</label>
                <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <label>Travelers:</label>
                <span>{booking.travelers_count || booking.travelers}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-guides">Loading available guides...</div>
          ) : guides.length === 0 ? (
            <div className="no-guides">
              <p>No approved guides available at the moment.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="guide-select">Select Tour Guide *</label>
                <select
                  id="guide-select"
                  value={selectedGuide}
                  onChange={(e) => setSelectedGuide(e.target.value)}
                  className="guide-select"
                  disabled={submitting}
                  required
                >
                  <option value="">-- Choose a guide --</option>
                  {guides.map((guide) => (
                    <option key={guide.guide_id} value={guide.guide_id}>
                      {guide.full_name}
                      {guide.experience_years && ` (${guide.experience_years} years experience)`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGuide && (
                <div className="selected-guide-info">
                  {(() => {
                    const guide = guides.find(g => g.guide_id === parseInt(selectedGuide));
                    return guide ? (
                      <div className="guide-details">
                        <h4>Guide Details:</h4>
                        <p><strong>Name:</strong> {guide.full_name}</p>
                        <p><strong>Email:</strong> {guide.email}</p>
                        {guide.contact_number && <p><strong>Phone:</strong> {guide.contact_number}</p>}
                        {guide.languages && <p><strong>Languages:</strong> {guide.languages}</p>}
                        {guide.experience_years && <p><strong>Experience:</strong> {guide.experience_years} years</p>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="admin-notes">Admin Notes (Optional)</label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="admin-notes-input"
                  placeholder="Add any internal notes about this assignment..."
                  rows="3"
                  disabled={submitting}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-assign"
                  disabled={submitting || !selectedGuide}
                >
                  {submitting ? "Assigning..." : "Assign Guide"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

AssignGuideModal.propTypes = {
  booking: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired
};

export default AssignGuideModal;
