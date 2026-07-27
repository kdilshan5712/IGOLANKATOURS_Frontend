/**
 * 🎯 I GO LANKA TOURS - Guide Bookings Page
 * 
 * Operational view for guides to manage their active and upcoming assignments.
 * Includes interactive tourist chat, assignment lifecycle management (Mark Completed),
 * and detailed traveler information display.
 * 
 * @module GuideBookingsPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, User, MessageCircle, Phone, CheckCircle } from "lucide-react";
import { getGuideBookings, markTourCompleted } from "../../services/api";
import TourChatWindow from "../../components/TourChatWindow";
import "./GuideBookings.css";

/**
 * GuideBookingsPage Component
 * 
 * Orchestrates the management of assigned tours and real-time tourist communication.
 * 
 * @returns {JSX.Element}
 */
const GuideBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [activeChatBookingId, setActiveChatBookingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const response = await getGuideBookings();

      console.log("Guide bookings response:", response);

      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        setError(response.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    if (!window.confirm("Are you sure you want to mark this tour as completed?")) return;

    setSubmittingId(bookingId);
    try {
      const response = await markTourCompleted(bookingId);
      if (response.success) {
        fetchBookings();
      } else {
        setError(response.message || "Failed to mark tour as completed");
      }
    } catch (err) {
      console.error("Complete tour error:", err);
      setError("Failed to mark tour as completed");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "#10b981",
      pending: "#f59e0b",
      completed: "#3b82f6",
      cancelled: "#ef4444"
    };
    return colors[status] || "#6b7280";
  };

  const isTourComplete = (travelDateStr, durationStr) => {
    const travelDate = new Date(travelDateStr);
    let durationDays = 1;
    if (durationStr) {
      const durationMatch = String(durationStr).match(/\d+/);
      if (durationMatch) {
        durationDays = parseInt(durationMatch[0], 10);
      }
    }
    const endDate = new Date(travelDate);
    endDate.setDate(endDate.getDate() + durationDays - 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return today >= endDate;
  };

  if (loading) {
    return (
      <div className="guide-bookings-page">
        <div className="loading">Loading your assigned tours...</div>
      </div>
    );
  }

  return (
    <div className="guide-bookings-page">
      <div className="page-header">
        <h1>My Assigned Tours</h1>
        <p className="subtitle">Manage your tour guide assignments</p>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <MapPin size={64} color="#cbd5e1" />
          <h3>No Tours Assigned Yet</h3>
          <p>You don't have any assigned tours at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <div className="booking-card-header">
                <div className="package-info">
                  <h3>{booking.package_name}</h3>
                  <p className="booking-reference">Ref: #{booking.booking_id}</p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <Calendar size={18} />
                  <div>
                    <span className="detail-label">Travel Date</span>
                    <span className="detail-value">
                      {new Date(booking.travel_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="detail-row">
                  <User size={18} />
                  <div>
                    <span className="detail-label">Travelers</span>
                    <span className="detail-value">{booking.travelers} people</span>
                  </div>
                </div>

                {booking.destination && (
                  <div className="detail-row">
                    <MapPin size={18} />
                    <div>
                      <span className="detail-label">Destination</span>
                      <span className="detail-value">{booking.destination}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="tourist-info">
                <h4>Tourist Information</h4>
                <div className="tourist-details">
                  <div className="detail-row">
                    <User size={16} />
                    <span>{booking.tourist_name || 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => setActiveChatBookingId(booking.booking_id)}
                    className="chat-btn"
                  >
                    <MessageCircle size={16} />
                    Chat with Tourist
                  </button>
                </div>
              </div>

              {booking.admin_notes && (
                <div className="admin-notes">
                  <strong>Admin Notes:</strong>
                  <p>{booking.admin_notes}</p>
                </div>
              )}

              {booking.special_requests && (
                <div className="special-requests">
                  <strong>Special Requests:</strong>
                  <p>{booking.special_requests}</p>
                </div>
              )}

              <div className="assignment-info">
                <small className="assigned-date">
                  Assigned on {new Date(booking.guide_assigned_at).toLocaleDateString()}
                </small>
                {booking.status === 'confirmed' && (
                  <div className="completion-controls">
                    <button
                      onClick={() => handleMarkCompleted(booking.booking_id)}
                      disabled={submittingId === booking.booking_id || !isTourComplete(booking.travel_date, booking.duration)}
                      title={!isTourComplete(booking.travel_date, booking.duration) ? "Tour is not completed yet" : ""}
                      className="complete-tour-btn"
                    >
                      <CheckCircle size={16} />
                      {submittingId === booking.booking_id ? 'Updating...' : 'Mark as Completed'}
                    </button>
                    {!isTourComplete(booking.travel_date, booking.duration) && (
                      <small className="completion-warning">
                        Tour not completed yet
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChatBookingId && (
        <TourChatWindow
          bookingId={activeChatBookingId}
          onClose={() => setActiveChatBookingId(null)}
        />
      )}
    </div>
  );
};

export default GuideBookingsPage;
