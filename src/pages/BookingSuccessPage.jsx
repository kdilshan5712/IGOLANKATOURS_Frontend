/**
 * 🎯 I GO LANKA TOURS - Booking Success Page
 * 
 * Celebration and confirmation page shown after a successful transaction.
 * Handles booking summary display, session cleanup, and invoice generation.
 * 
 * @module BookingSuccessPage
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Loader, AlertCircle } from "lucide-react";
import { bookingAPI } from "../services/api";
import "./BookingSuccessPage.css";

/**
 * BookingSuccessPage Component
 * 
 * Provides visual confirmation and post-booking actions like invoice downloads.
 * 
 * @returns {JSX.Element}
 */
const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const [bookingInfo] = useState(() => {
    // 1. Try location state (passed from payment page)
    if (location.state?.booking) {
      return location.state.booking;
    }

    // 2. Try sessionStorage (fallback or page refresh)
    const storedInfo = sessionStorage.getItem('completedBooking');
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        sessionStorage.removeItem('completedBooking'); // Clear after use
        return parsed;
      } catch (e) {
        console.error("Parse error", e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (!bookingInfo) {
      // Redirect to home if no booking info found after a delay
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingInfo, navigate]);

  if (!bookingInfo) {
    return (
      <div className="booking-success-container">
        <div className="loading">Redirecting...</div>
      </div>
    );
  }

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setDownloadError("You must be logged in to download the invoice.");
        return;
      }

      const result = await bookingAPI.downloadInvoice(bookingInfo.booking_id, token);

      if (result.success && result.blob) {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([result.blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${bookingInfo.booking_reference || String(bookingInfo.booking_id)}.pdf`);

        // Append to body, click, and cleanup
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

  return (
    <div className="booking-success-container">
      <div className="booking-success-content">
        <div className="success-icon-wrapper">
          <Check size={56} strokeWidth={3} />
        </div>

        <h1>Booking Confirmed!</h1>
        <p className="success-message">
          Your journey awaits! We've secured your spot and sent a confirmation email to <strong>{bookingInfo.tourist_email || 'your inbox'}</strong>.
        </p>

        <div className="booking-details-card">
          <h2>Booking Summary</h2>

          <div className="detail-row">
            <span className="detail-label">Booking Reference</span>
            <span className="detail-value reference">
              {bookingInfo.booking_reference || `#${bookingInfo.booking_id}`}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Package</span>
            <span className="detail-value">{bookingInfo.package_name || bookingInfo.package?.name || "Tour Package"}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Travel Date</span>
            <span className="detail-value">
              {new Date(bookingInfo.travel_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Travelers</span>
            <span className="detail-value">
              {bookingInfo.travelers || (bookingInfo.adults + bookingInfo.children)} People
            </span>
          </div>

          <div className="detail-row total">
            <span className="detail-label">Total Paid</span>
            <span className="detail-value">${bookingInfo.total_price}</span>
          </div>
        </div>

        <div className="action-buttons">
          {downloadError && (
            <div className="error-message" style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', width: '100%' }}>
              <AlertCircle size={16} /> {downloadError}
            </div>
          )}
          <button onClick={handleDownloadInvoice} disabled={downloading} className="btn-secondary">
            {downloading ? <Loader className="spinner" size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> : null}
            {downloading ? "Downloading..." : "Download Invoice"}
          </button>
          <button
            onClick={() => navigate('/my-bookings')}
            className="btn-dashboard"
          >
            Go to My Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
