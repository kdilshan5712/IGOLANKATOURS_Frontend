import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../services/api";
import "./UserBookings.css";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 [UserBookings] Token exists:", !!token);
      console.log("🔑 [UserBookings] Token length:", token ? token.length : 0);
      
      if (!token) {
        setError("Not logged in. Please log in to view bookings.");
        setLoading(false);
        return;
      }
      
      console.log("📡 [UserBookings] Calling userAPI.getBookings...");
      const data = await userAPI.getBookings(token);
      console.log("📦 [UserBookings] Full API Response:", JSON.stringify(data, null, 2));
      console.log("📦 [UserBookings] Response has 'bookings' property:", 'bookings' in data);
      console.log("📦 [UserBookings] Response bookings type:", typeof data.bookings);

      if (data.bookings) {
        console.log("✅ [UserBookings] Bookings array found:", data.bookings.length, "items");
        console.log("✅ [UserBookings] First booking:", data.bookings[0]);
        setBookings(data.bookings);
      } else {
        console.error("❌ [UserBookings] No bookings property in response:", data);
        setError(data.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("💥 [UserBookings] Error fetching bookings:", err);
      console.error("💥 [UserBookings] Error details:", err.message, err.stack);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);

    try {
      const token = localStorage.getItem("token");
      const data = await userAPI.cancelBooking(token, bookingId);

      if (data.message && !data.message.includes("Failed")) {
        alert("Booking cancelled successfully");
        fetchBookings(); // Refresh list
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch  {
      setError("Failed to connect to server");
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (travelDate, status) => {
    if (status === "cancelled") return false;
    const travel = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return travel > today;
  };

  const getStatusBadge = (status) => {
    const classes = {
      confirmed: "status-confirmed",
      pending: "status-pending",
      cancelled: "status-cancelled",
      completed: "status-completed"
    };
    return classes[status] || "status-default";
  };

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading-spinner">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>View and manage all your tour bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No bookings yet</h3>
          <p>Start exploring our amazing tours!</p>
          <Link to="/packages" className="explore-btn">
            Explore Tours
          </Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="booking-card">
              <div className="booking-image">
                <img
                  src={booking.image || "/placeholder-tour.jpg"}
                  alt={booking.package_name}
                />
                <span className={`status-badge ${getStatusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <h3 className="booking-title">{booking.package_name}</h3>

                <div className="booking-info">
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span className="info-text">
                      {new Date(booking.travel_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">👥</span>
                    <span className="info-text">{booking.travelers} travelers</span>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">⏱️</span>
                    <span className="info-text">{booking.duration}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">💰</span>
                    <span className="info-text price-highlight">
                      ${booking.total_price}
                    </span>
                  </div>
                </div>

                <div className="booking-footer">
                  <span className="booking-date">
                    Booked on{" "}
                    {new Date(booking.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>

                  <div className="booking-actions">
                    <Link
                      to={`/dashboard/bookings/${booking.booking_id}`}
                      className="btn-view"
                    >
                      View Details
                    </Link>

                    {canCancel(booking.travel_date, booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        disabled={cancellingId === booking.booking_id}
                        className="btn-cancel"
                      >
                        {cancellingId === booking.booking_id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
