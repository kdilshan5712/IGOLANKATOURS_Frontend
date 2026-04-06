import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI, bookingAPI } from "../services/api";
import TourChatWindow from "../components/TourChatWindow";
import { MessageCircle, Download, Loader, AlertCircle } from "lucide-react";
import "./UserBookingDetails.css";

const UserBookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

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
    } catch {
      setError("Failed to connect to server");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);

      const token = localStorage.getItem('token');

      const result = await bookingAPI.downloadInvoice(bookingId, token);

      if (result.success && result.blob) {
        const url = window.URL.createObjectURL(new Blob([result.blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${booking.booking_reference || bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setDownloadError(result.message || "Failed to download invoice");
      }
    } catch (err) {
      console.error("Download Error:", err);
      setDownloadError("An error occurred while downloading the invoice.");
    } finally {
      setDownloading(false);
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

          {/* Guide Information Section */}
          {booking.guide_name && (
            <div className="guide-info-section">
              <h3>Your Tour Guide</h3>
              <div className="guide-info-card">
                <div className="guide-avatar-large">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="guide-details">
                  <h4 className="guide-name">{booking.guide_name}</h4>
                  <div className="guide-contacts">
                    {booking.guide_phone && (
                      <div className="guide-contact-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{booking.guide_phone}</span>
                      </div>
                    )}
                    {booking.guide_email && (
                      <div className="guide-contact-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{booking.guide_email}</span>
                      </div>
                    )}
                  </div>
                  {booking.guide_assigned_at && (
                    <div className="guide-assigned-date">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Assigned on {new Date(booking.guide_assigned_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(true)}
                className="chat-btn mt-4"
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  marginTop: '1rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#dbeafe';
                  e.currentTarget.style.borderColor = '#93c5fd';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
              >
                <MessageCircle size={16} />
                Chat with Guide
              </button>
            </div>
          )}
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

            {/* Invoice Download */}
            {booking.status !== 'cancelled' && booking.status !== 'pending' && (
              <div style={{ marginTop: '1.5rem' }}>
                {downloadError && (
                  <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={14} /> {downloadError}
                  </div>
                )}
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--blue-500)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    opacity: downloading ? 0.7 : 1,
                    fontWeight: 500
                  }}
                >
                  {downloading ? <Loader size={18} className="spinner" /> : <Download size={18} />}
                  {downloading ? "Generating..." : "Download Invoice"}
                </button>
              </div>
            )}
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

      {isChatOpen && booking && (
        <TourChatWindow
          bookingId={booking.booking_id}
          onClose={() => setIsChatOpen(false)}
          currentUserRole="tourist"
        />
      )}
    </div>
  );
};

export default UserBookingDetails;
