import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Check, UserPlus, X, Calendar, User, DollarSign, MapPin, Mail, Phone, Ban, MessageCircle } from "lucide-react";
import { adminAPI } from "../../services/api";
import AssignGuideModal from "../../components/AssignGuideModal";
import TourChatWindow from "../../components/TourChatWindow";
import "./AdminBookings.css";

function AdminBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [assignGuideBooking, setAssignGuideBooking] = useState(null);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

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

  const handleConfirmBooking = async (bookingId) => {
    setConfirmMessage("Are you sure you want to confirm this booking? The customer will receive a confirmation notification.");
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await adminAPI.updateBookingStatus(bookingId, "confirmed", token);

        if (result.success) {
          setToast({ type: "success", message: "Booking confirmed successfully! Notification sent." });
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

  const handleCancelBooking = async (bookingId) => {
    setConfirmMessage("Are you sure you want to CANCEL this booking? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await adminAPI.updateBookingStatus(bookingId, "cancelled", token);

        if (result.success) {
          setToast({ type: "success", message: "Booking cancelled successfully!" });
          await fetchBookings();
          setShowConfirmModal(false);
          setTimeout(() => setToast(null), 3000);
        } else {
          setToast({ type: "error", message: result.message || "Failed to cancel booking" });
          setShowConfirmModal(false);
          setTimeout(() => setToast(null), 3000);
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        setToast({ type: "error", message: "An error occurred while cancelling the booking" });
        setShowConfirmModal(false);
        setTimeout(() => setToast(null), 3000);
      }
    });
    setShowConfirmModal(true);
  };

  const handleAssignGuide = (booking) => {
    setAssignGuideBooking(booking);
  };

  const handleCloseAssignModal = () => {
    setAssignGuideBooking(null);
  };

  const handleGuideAssignment = async (bookingId, guideId, adminNotes) => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.assignGuideToBooking(bookingId, guideId, adminNotes, token);

      if (result.success) {
        setToast({ type: "success", message: "Guide assigned successfully!" });
        await fetchBookings();
        setTimeout(() => setToast(null), 3000);
      } else {
        throw new Error(result.message || "Failed to assign guide");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      throw error;
    }
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
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Manage reservations and assignments</p>
        </div>
      </div>

      <div className="bookings-filters">
        {["all", "confirmed", "pending", "assigned", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            className={filter === status ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="count-badge">
              {status === 'all'
                ? bookings.length
                : bookings.filter(b => b.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="table-responsive bookings-table-container glass-panel">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Tourist</th>
              <th>Package</th>
              <th>Travel Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Guide</th>
              <th>Booked On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td className="booking-ref">{booking.booking_reference || booking.booking_id}</td>
                  <td>
                    <div className="tourist-info">
                      <strong>{booking.tourist_name || "N/A"}</strong>
                      <small>{booking.user_email}</small>
                    </div>
                  </td>
                  <td className="package-name">{booking.package_name}</td>
                  <td>{new Date(booking.travel_date).toLocaleDateString()}</td>
                  <td className="amount">${booking.total_price}</td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.guide_name ? (
                      <div className="guide-info">
                        <strong>{booking.guide_name}</strong>
                        <div className="guide-badges">
                          <span className="guide-assigned-badge">Assigned</span>
                          {booking.is_chat_authorized ? (
                            <span className="chat-badge authorized" title="Chat Authorized">✅ Chat</span>
                          ) : (
                            <span className="chat-badge locked" title="Chat Locked">🔒 Chat</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">--</span>
                    )}
                  </td>
                  <td>{booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="btn-icon btn-view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmBooking(booking.booking_id)}
                            className="btn-icon btn-confirm"
                            title="Confirm Booking"
                          >
                            <Check size={16} />
                          </button>

                          <button
                            onClick={() => handleCancelBooking(booking.booking_id)}
                            className="btn-icon btn-cancel"
                            title="Cancel Booking"
                          >
                            <Ban size={16} />
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && booking.assigned_guide_id && (
                        <button
                          onClick={() => setActiveChatBooking(booking)}
                          className="btn-icon btn-chat"
                          title="Monitor Chat"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {
        assignGuideBooking && (
          <AssignGuideModal
            booking={assignGuideBooking}
            onClose={handleCloseAssignModal}
            onAssign={handleGuideAssignment}
          />
        )
      }

      {
        selectedBooking && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Booking #{selectedBooking.booking_reference || selectedBooking.booking_id}</h2>
                <button onClick={handleCloseModal} className="modal-close"><X size={24} /></button>
              </div>

              <div className="booking-details-grid">
                <div className="detail-section">
                  <h3><User size={18} /> Tourist Info</h3>
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{selectedBooking.tourist_name || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{selectedBooking.user_email}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone:</label>
                    <span>{selectedBooking.tourist_phone || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><Calendar size={18} /> Trip Details</h3>
                  <div className="info-row">
                    <label>Package:</label>
                    <span>{selectedBooking.package_name}</span>
                  </div>
                  <div className="info-row">
                    <label>Date:</label>
                    <span>{new Date(selectedBooking.travel_date).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <label>Travelers:</label>
                    <span>{selectedBooking.travelers_count} People</span>
                  </div>
                  <div className="info-row">
                    <label>Amount:</label>
                    <span className="price-highlight">${selectedBooking.total_price}</span>
                  </div>
                  <div className="info-row">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedBooking.status.toLowerCase()}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                {selectedBooking.guide_name && (
                  <div className="detail-section">
                    <h3><UserPlus size={18} /> Guide Info</h3>
                    <div className="info-row">
                      <label>Guide:</label>
                      <span>{selectedBooking.guide_name}</span>
                    </div>
                    <div className="info-row">
                      <label>Contact:</label>
                      <span>{selectedBooking.guide_email}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        )
      }

      {
        toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )
      }

      {/* Confirmation Modal */}
      {
        showConfirmModal && (
          <div className="modal-overlay-confirm" onClick={() => setShowConfirmModal(false)}>
            <div className="modal-content-confirm glass-panel" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Action</h3>
              <p>{confirmMessage}</p>
              <div className="modal-footer-confirm">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (confirmAction) confirmAction();
                  }}
                >
                  Yes, Confirm
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
        )
      }

      {/* Admin Chat Modal */}
      {activeChatBooking && (
        <TourChatWindow
          bookingId={activeChatBooking.booking_id}
          initialAuthStatus={activeChatBooking.is_chat_authorized}
          onClose={() => setActiveChatBooking(null)}
          onAuthChange={fetchBookings}
        />
      )}

    </div >
  );
}

export default AdminBookingsPage;
