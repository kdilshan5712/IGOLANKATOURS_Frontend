/**
 * 🎯 I GO LANKA TOURS - Traveler Booking History
 * 
 * Provides a comprehensive overview of a traveler's past and upcoming 
 * bookings. Supports status filtering, invoice downloads, and 
 * cancellation workflows (subject to policy rules).
 * 
 * @module MyBookingsPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, DollarSign, Clock, Package, AlertCircle, FileDown } from "lucide-react";
import { authAPI, userAPI, cancelBooking, bookingAPI } from "../services/api";
import NotificationBell from "../components/NotificationBell";
import CancelBookingModal from "../components/CancelBookingModal";
import "./MyBookingsPage.css";

/**
 * MyBookingsPage Component
 * 
 * Orchestrates the retrieval of user-specific booking records, 
 * integrating notification and cancellation logic.
 * 
 * @returns {JSX.Element}
 */
const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [notification, setNotification] = useState({ type: null, message: '' });
  const [downloadingInvoice, setDownloadingInvoice] = useState(null); // stores booking.id being downloaded

  useEffect(() => {
    // Check if user is logged in
    if (!authAPI.isAuthenticated()) {
      navigate("/login", { state: { from: "/my-bookings" } });
      return;
    }

    fetchBookings();
  }, [navigate]);

  // Fetch bookings from backend API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("🔑 [MyBookingsPage] Fetching bookings with token:", !!token);

      if (!token) {
        setError("Not logged in. Please log in to view bookings.");
        setLoading(false);
        return;
      }

      // @API_CALL: Retrieve full booking history for the authenticated traveler
      const data = await userAPI.getBookings(token);
      console.log("📦 [MyBookingsPage] API Response:", data);

      if (data.bookings) {
        console.log("✅ [MyBookingsPage] Bookings found:", data.bookings.length);

        // @DATA_TRANSFORMATION: Map core database fields to normalized frontend display formats
        const transformedBookings = data.bookings.map((booking) => ({
          id: booking.booking_id,
          packageId: booking.package_id,
          packageData: {
            name: booking.package_name,
            image: booking.image,
            duration: booking.duration,
            price: parseFloat(booking.total_price) / booking.travelers
          },
          travelDate: new Date(booking.travel_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          numberOfTravelers: booking.travelers,
          totalAmount: parseFloat(booking.total_price),
          status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
          bookingReference: `BK-${booking.booking_id}-${booking.package_id.slice(0, 8).toUpperCase()}`,
          createdAt: booking.created_at,
          paymentMethod: 'card' // Default for now
        }));

        console.log("✅ [MyBookingsPage] Transformed bookings:", transformedBookings);
        setBookings(transformedBookings);
      } else {
        console.log("ℹ️ [MyBookingsPage] No bookings found");
        setBookings([]);
      }
    } catch (err) {
      // @ERROR_HANDLING: Persistent failure or unauthorized access during fetch
      console.error("💥 [MyBookingsPage] Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status?.toLowerCase() === 'cancelled' || booking.status?.toLowerCase() === 'completed') {
      return false;
    }
    // Check if booking is at least 7 days away
    const travelDate = new Date(booking.travelDate);
    const today = new Date();
    const daysUntilTravel = Math.ceil((travelDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilTravel >= 7;
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleCancelSuccess = (result) => {
    setNotification({
      type: 'success',
      message: `Booking cancelled successfully. Refund: $${result.refund_amount}`
    });
    setTimeout(() => setNotification({ type: null, message: '' }), 5000);
    fetchBookings();
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      setDownloadingInvoice(bookingId);
      const token = localStorage.getItem('token');
      const result = await bookingAPI.downloadInvoice(bookingId, token);

      if (result.success && result.blob) {
        const url = window.URL.createObjectURL(new Blob([result.blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${String(bookingId)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setNotification({ type: 'error', message: result.message || 'Failed to download invoice.' });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
      }
    } catch (err) {
      console.error('Invoice download error:', err);
      setNotification({ type: 'error', message: 'An error occurred while downloading the invoice.' });
      setTimeout(() => setNotification({ type: null, message: '' }), 5000);
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status?.toLowerCase() === statusFilter);

  const getPaymentHistory = () => {
    return bookings
      .filter(b => b.status?.toLowerCase() !== 'cancelled')
      .map(b => ({
        id: b.id,
        date: b.createdAt,
        amount: b.totalAmount,
        packageName: b.packageData?.name,
        paymentMethod: b.paymentMethod,
        reference: b.bookingReference
      }));
  };

  if (loading) {
    return (
      <main className="my-bookings-page">
        <div className="my-bookings-container">
          <div className="my-bookings-loading">
            <p>Loading your bookings...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-bookings-page">
        <div className="my-bookings-container">
          <div className="my-bookings-error">
            <AlertCircle size={48} />
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="my-bookings-page">
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <div>
            <h1 className="my-bookings-title">My Bookings</h1>
            <p className="my-bookings-subtitle">View and manage your tour bookings</p>
          </div>
          {authAPI.isAuthenticated() && (
            <NotificationBell token={localStorage.getItem("token")} />
          )}
        </div>

        {notification.message && (
          <div className={`notification-banner notification-${notification.type}`}>
            <p>{notification.message}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="booking-filters">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({bookings.filter(b => b.status?.toLowerCase() === 'pending').length})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status?.toLowerCase() === 'completed').length})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled ({bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length})
          </button>
        </div>

        {/* Payment History Section */}
        {bookings.length > 0 && (
          <div className="payment-history-section">
            <h2 className="section-title">Payment History</h2>
            <div className="payment-history-grid">
              {getPaymentHistory().map((payment) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <span className="payment-package">{payment.packageName}</span>
                    <span className="payment-amount">${payment.amount}</span>
                  </div>
                  <div className="payment-details">
                    <div className="payment-detail">
                      <span className="label">Date:</span>
                      <span>{new Date(payment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="payment-detail">
                      <span className="label">Method:</span>
                      <span>{payment.paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer'}</span>
                    </div>
                    <div className="payment-detail">
                      <span className="label">Reference:</span>
                      <span>{payment.reference}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Section */}
        <h2 className="section-title">My Bookings</h2>
        {filteredBookings.length === 0 && statusFilter === 'all' ? (
          <div className="my-bookings-empty">
            <Package size={64} />
            <h2>No Bookings Yet</h2>
            <p>You haven't made any bookings yet. Explore our packages and start your Sri Lankan adventure!</p>
            <button
              onClick={() => navigate("/packages")}
              className="my-bookings-browse-btn"
            >
              Browse Packages
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="my-bookings-empty">
            <Package size={64} />
            <h2>No {statusFilter} bookings found</h2>
            <p>Try selecting a different filter to view your bookings.</p>
          </div>
        ) : (
          <div className="my-bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-card-image">
                    <img
                      src={booking.packageData?.image || "/placeholder-tour.jpg"}
                      alt={booking.packageData?.name || "Tour Package"}
                    />
                  </div>
                  <div className={`booking-status ${getStatusClass(booking.status)}`}>
                    {booking.status || "Pending"}
                  </div>
                </div>

                <div className="booking-card-content">
                  <h3 className="booking-card-title">
                    {booking.packageData?.name || "Tour Package"}
                  </h3>

                  <div className="booking-card-details">
                    <div className="booking-detail-item">
                      <Calendar size={16} />
                      <span>Travel Date: {booking.travelDate || "N/A"}</span>
                    </div>

                    <div className="booking-detail-item">
                      <Users size={16} />
                      <span>{booking.numberOfTravelers || 1} Traveler(s)</span>
                    </div>

                    <div className="booking-detail-item">
                      <Clock size={16} />
                      <span>{booking.packageData?.duration || "N/A"}</span>
                    </div>

                    <div className="booking-detail-item">
                      <MapPin size={16} />
                      <span>Sri Lanka</span>
                    </div>

                    <div className="booking-detail-item">
                      <DollarSign size={16} />
                      <span className="booking-price">
                        ${booking.totalAmount || (booking.packageData?.price * (booking.numberOfTravelers || 1))}
                      </span>
                    </div>
                  </div>

                  {booking.bookingReference && (
                    <div className="booking-reference">
                      <strong>Booking Reference:</strong> {booking.bookingReference}
                    </div>
                  )}

                  <div className="booking-card-actions">
                    <button
                      onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                      className="booking-action-btn booking-action-view"
                    >
                      View Details
                    </button>
                    {(booking.status === "Confirmed" || booking.status === "Completed") && (
                      <button
                        onClick={() => handleDownloadInvoice(booking.id)}
                        className="booking-action-btn booking-action-invoice"
                        disabled={downloadingInvoice === booking.id}
                        title="Download Invoice PDF"
                      >
                        <FileDown size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {downloadingInvoice === booking.id ? 'Downloading...' : 'Invoice'}
                      </button>
                    )}
                    {booking.status === "Confirmed" && (
                      <button
                        onClick={() => navigate(`/contact`, {
                          state: {
                            packageId: booking.packageId,
                            packageName: booking.packageData?.name,
                            bookingReference: booking.bookingReference
                          }
                        })}
                        className="booking-action-btn booking-action-contact"
                      >
                        Contact Support
                      </button>
                    )}
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="booking-action-btn booking-action-cancel"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && bookingToCancel && (
          <CancelBookingModal
            booking={{
              booking_id: bookingToCancel.id,
              package_name: bookingToCancel.packageData?.name,
              travel_date: bookingToCancel.travelDate,
              total_price: bookingToCancel.totalAmount
            }}
            onClose={() => {
              setShowCancelModal(false);
              setBookingToCancel(null);
            }}
            onSuccess={handleCancelSuccess}
          />
        )}
      </div>
    </main>
  );
};

export default MyBookingsPage;
