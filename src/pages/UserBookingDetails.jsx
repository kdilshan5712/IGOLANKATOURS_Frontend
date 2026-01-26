import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import "./UserBookingDetails.css";

const UserBookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await userAPI.getBookings(token);

      if (data.bookings) {
        const found = data.bookings.find(
          (b) => b.booking_id === parseInt(bookingId)
        );
        if (found) {
          setBooking(found);
        } else {
          setError("Booking not found");
        }
      } else {
        setError(data.message || "Failed to load booking");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(true);

    try {
      const token = localStorage.getItem("token");
      const data = await userAPI.cancelBooking(token, bookingId);

      if (data.message && !data.message.includes("Failed")) {
        alert("Booking cancelled successfully");
        navigate("/dashboard/bookings");
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch  {
      setError("Failed to connect to server");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = () => {
    if (!booking || booking.status === "cancelled") return false;
    const travel = new Date(booking.travel_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return travel > today;
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "#15803d",
      pending: "#92400e",
      cancelled: "#991b1b",
      completed: "#1e40af"
    };
    return colors[status] || "#64748b";
  };

  if (loading) {
    return (
      <div className="booking-details-container">
        <div className="loading-spinner">Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-container">
        <div className="error-message">{error || "Booking not found"}</div>
        <button onClick={() => navigate("/dashboard/bookings")} className="back-btn">
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="booking-details-container">
      <div className="details-header">
        <button onClick={() => navigate("/dashboard/bookings")} className="back-btn">
          ← Back to Bookings
        </button>
        <h1>Booking Details</h1>
      </div>

      <div className="details-grid">
        <div className="details-main">
          <div className="package-showcase">
            <img
              src={booking.image || "/placeholder-tour.jpg"}
              alt={booking.package_name}
              className="showcase-image"
            />
            <div className="showcase-overlay">
              <span
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(booking.status) }}
              >
                {booking.status}
              </span>
            </div>
          </div>

          <div className="package-info">
            <h2>{booking.package_name}</h2>
            <p className="package-category">Category: {booking.category}</p>
            <p className="package-duration">Duration: {booking.duration}</p>
          </div>

          <div className="booking-info-section">
            <h3>Booking Information</h3>

            <div className="info-grid">
              <div className="info-card">
                <span className="info-label">Booking ID</span>
                <span className="info-value">#{booking.booking_id}</span>
              </div>

              <div className="info-card">
                <span className="info-label">Travel Date</span>
                <span className="info-value">
                  {new Date(booking.travel_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
              </div>

              <div className="info-card">
                <span className="info-label">Number of Travelers</span>
                <span className="info-value">{booking.travelers} people</span>
              </div>

              <div className="info-card">
                <span className="info-label">Booking Date</span>
                <span className="info-value">
                  {new Date(booking.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="details-sidebar">
          <div className="price-card">
            <h3>Price Summary</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Total Amount</span>
                <span className="price-amount">${booking.total_price}</span>
              </div>
            </div>
          </div>

          {canCancel() && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="cancel-booking-btn"
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}

          {booking.status === "cancelled" && (
            <div className="cancelled-notice">
              <p>This booking has been cancelled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBookingDetails;
