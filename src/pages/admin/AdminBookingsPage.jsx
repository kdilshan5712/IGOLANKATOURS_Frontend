import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import AssignGuideModal from "../../components/admin/AssignGuideModal";
import "./AdminBookings.css";

function AdminBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignGuideBooking, setAssignGuideBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.getAllBookings(token);
      
      if (result.success) {
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const handleAssignGuide = (booking) => {
    setAssignGuideBooking(booking);
  };

  const handleCloseAssignModal = () => {
    setAssignGuideBooking(null);
  };

  const handleGuideAssignment = async (bookingId, guideId) => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.assignGuideToBooking(bookingId, guideId, token);
      
      if (result.success) {
        setToast({ type: "success", message: result.message || "Guide assigned successfully!" });
        await fetchBookings(); // Refresh bookings
        setTimeout(() => setToast(null), 3000);
        return true;
      } else {
        setToast({ type: "error", message: result.message || "Failed to assign guide" });
        setTimeout(() => setToast(null), 3000);
        return false;
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      setToast({ type: "error", message: "An error occurred" });
      setTimeout(() => setToast(null), 3000);
      return false;
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    setConfirmMessage("Are you sure you want to confirm this booking? The customer will receive a confirmation notification.");
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await adminAPI.updateBookingStatus(bookingId, "confirmed", token);
        
        if (result.success) {
          setToast({ type: "success", message: "Booking confirmed successfully! A notification has been sent to the customer." });
          await fetchBookings();
          setShowConfirmModal(false);
          setTimeout(() => setToast(null), 3000);
        } else {
          setToast({ type: "error", message: result.message || "Failed to confirm booking" });
          setShowConfirmModal(false);
          setTimeout(() => setToast(null), 3000);
        }
      } catch (error) {
        console.error("Error confirming booking:", error);
        setToast({ type: "error", message: "An error occurred while confirming the booking" });
        setShowConfirmModal(false);
        setTimeout(() => setToast(null), 3000);
      }
    });
    setShowConfirmModal(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading bookings...</div>
    </div>
  );
  }

  return (
    <div className="admin-page">
          <div className="bookings-filters">
            <button
              className={filter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("all")}
            >
              All ({bookings.length})
            </button>
            <button
              className={filter === "confirmed" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("confirmed")}
            >
              Confirmed ({bookings.filter(b => b.status === "confirmed").length})
            </button>
            <button
              className={filter === "pending" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("pending")}
            >
              Pending ({bookings.filter(b => b.status === "pending").length})
            </button>
            <button
              className={filter === "assigned" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("assigned")}
            >
              Assigned ({bookings.filter(b => b.status === "assigned").length})
            </button>
            <button
              className={filter === "completed" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("completed")}
            >
              Completed ({bookings.filter(b => b.status === "completed").length})
            </button>
            <button
              className={filter === "cancelled" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("cancelled")}
            >
              Cancelled ({bookings.filter(b => b.status === "cancelled").length})
            </button>
          </div>

          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Tourist</th>
                  <th>Package</th>
                  <th>Travel Date</th>
                  <th>Travelers</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Guide</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td className="booking-ref">{booking.booking_reference}</td>
                      <td>
                        <div className="tourist-info">
                          <strong>{booking.tourist_name || "N/A"}</strong>
                          <small>{booking.user_email}</small>
                        </div>
                      </td>
                      <td className="package-name">{booking.package_name}</td>
                      <td>{new Date(booking.travel_date).toLocaleDateString()}</td>
                      <td className="travelers-count">{booking.travelers_count}</td>
                      <td className="amount">${booking.total_price}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.guide_name ? (
                          <div className="guide-info">
                            <strong>{booking.guide_name}</strong>
                            <span className="guide-assigned-badge">Guide Assigned</span>
                          </div>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="btn-view"
                            title="View Details"
                            aria-label="View booking details"
                          >
                            👁️
                          </button>
                          
                          {/* STATE 1: Pending - Show Confirm Booking */}
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmBooking(booking.booking_id)}
                              className="btn-confirm"
                              title="Confirm Booking"
                              aria-label="Confirm this booking"
                            >
                              Confirm Booking
                            </button>
                          )}
                          
                          {/* STATE 2: Confirmed (No Guide) - Show Assign Guide */}
                          {(booking.status === 'confirmed' && 
                            !booking.assigned_guide_id && 
                            !booking.guide_name) && (
                            <button
                              onClick={() => handleAssignGuide(booking)}
                              className="btn-assign-guide"
                              title="Assign Tour Guide"
                              aria-label="Assign tour guide to booking"
                            >
                              Assign Guide
                            </button>
                          )}
                          
                          {/* STATE 3 & 4: Guide Assigned or Completed - No action buttons */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

      {selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button onClick={handleCloseModal} className="modal-close" aria-label="Close modal">✕</button>
            </div>

            <div className="booking-details">
              <div className="detail-section">
                <h3>Booking Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Reference Number:</label>
                    <span className="booking-ref-large">{selectedBooking.booking_reference}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Booking Date:</label>
                    <span>{new Date(selectedBooking.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Tourist Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedBooking.tourist_name || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedBooking.user_email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedBooking.tourist_phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Package Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Package Name:</label>
                    <span>{selectedBooking.package_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Travel Date:</label>
                    <span>{new Date(selectedBooking.travel_date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Number of Travelers:</label>
                    <span>{selectedBooking.travelers_count}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Amount:</label>
                    <span className="amount-large">${selectedBooking.total_price}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.guide_name && (
                <div className="detail-section">
                  <h3>Assigned Guide</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedBooking.guide_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedBooking.guide_email}</span>
                    </div>
                    {selectedBooking.guide_phone && (
                      <div className="detail-item">
                        <label>Phone:</label>
                        <span>{selectedBooking.guide_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.admin_notes && (
                <div className="detail-section">
                  <h3>Admin Notes</h3>
                  <p className="admin-notes">{selectedBooking.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {assignGuideBooking && (
        <AssignGuideModal
          booking={assignGuideBooking}
          onClose={handleCloseAssignModal}
          onAssign={handleGuideAssignment}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay-confirm" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Action</h3>
            <p>{confirmMessage}</p>
            <div className="modal-footer-confirm">
              <button
                className="btn-confirm-yes"
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Yes, Confirm
              </button>
              <button
                className="btn-confirm-no"
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

export default AdminBookingsPage;
