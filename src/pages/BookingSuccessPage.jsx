/**
 * 🎯 I GO LANKA TOURS - Booking Success Page
 *
 * Landing page after PayHere hosted checkout redirect.
 * Reads PayHere query params (order_id, status_code) from the return_url,
 * then verifies the payment via PayHere REST API (App ID + App Secret)
 * to definitively confirm the booking before showing success.
 *
 * @module BookingSuccessPage
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Check, Loader, AlertCircle, XCircle } from "lucide-react";
import { bookingAPI, authAPI } from "../services/api";
import { verifyPayHerePayment } from "../services/paymentService";
import "./BookingSuccessPage.css";

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Payment verification states
  const [verifyStatus, setVerifyStatus] = useState('verifying'); // 'verifying' | 'success' | 'pending' | 'failed'
  const [bookingInfo, setBookingInfo] = useState(null);

  useEffect(() => {
    const runVerification = async () => {
      // --- Read PayHere return_url query params ---
      const payhereOrderId  = searchParams.get('order_id');
      const payhereStatus   = searchParams.get('status_code');
      const payhereMessage  = searchParams.get('status_message');

      // --- Recover stored booking info (saved before redirect) ---
      let storedInfo = location.state?.booking || null;
      if (!storedInfo) {
        const stored = sessionStorage.getItem('completedBooking');
        if (stored) {
          try { storedInfo = JSON.parse(stored); } catch (_) {}
          sessionStorage.removeItem('completedBooking');
        }
      }
      setBookingInfo(storedInfo);

      // If PayHere returned a non-success status_code, fail immediately
      if (payhereStatus && payhereStatus !== '2') {
        console.warn('[Success] PayHere returned non-success status:', payhereStatus, payhereMessage);
        setVerifyStatus('failed');
        return;
      }

      // If we have an order_id from PayHere, verify via REST API
      if (payhereOrderId) {
        const token = authAPI.getToken();
        if (!token) {
          // No auth token - webhook will handle it; show as pending
          setVerifyStatus('pending');
          return;
        }

        try {
          console.log('[Success] Verifying payment for order_id:', payhereOrderId);
          const result = await verifyPayHerePayment(payhereOrderId, token);
          console.log('[Success] Verification result:', result);

          if (result.verified) {
            setVerifyStatus('success');
          } else if (result.status_code === -1 || result.status_code === -2) {
            setVerifyStatus('failed');
          } else {
            // Not yet confirmed - webhook will come shortly
            setVerifyStatus('pending');
          }
        } catch (err) {
          console.error('[Success] Verification error:', err);
          // Fall back to pending - webhook will confirm
          setVerifyStatus('pending');
        }
      } else if (location.state?.booking) {
        // Came here directly via navigate() (e.g. after onCompleted in old flow)
        setVerifyStatus('success');
      } else if (storedInfo) {
        // Has stored info but no query params - assume pending
        setVerifyStatus('pending');
      } else {
        // No booking info at all - redirect home
        setTimeout(() => navigate('/'), 3000);
        setVerifyStatus('failed');
      }
    };

    runVerification();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);
      const token = authAPI.getToken();
      if (!token) {
        setDownloadError("You must be logged in to download the invoice.");
        return;
      }
      const result = await bookingAPI.downloadInvoice(bookingInfo.booking_id, token);
      if (result.success && result.blob) {
        const url = window.URL.createObjectURL(new Blob([result.blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${bookingInfo.booking_reference || String(bookingInfo.booking_id)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setDownloadError(result.message || "Failed to download invoice");
      }
    } catch (err) {
      setDownloadError("An error occurred while downloading the invoice.");
    } finally {
      setDownloading(false);
    }
  };

  // ─── VERIFYING STATE ──────────────────────────────────────────────────────
  if (verifyStatus === 'verifying') {
    return (
      <div className="booking-success-container">
        <div className="booking-success-content" style={{ textAlign: 'center' }}>
          <Loader size={56} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#3182ce' }} />
          <h1 style={{ marginTop: '1.5rem', color: '#2d3748' }}>Confirming Your Payment...</h1>
          <p style={{ color: '#718096' }}>
            Please wait while we verify your payment with PayHere. Do not close this page.
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── FAILED / CANCELLED STATE ─────────────────────────────────────────────
  if (verifyStatus === 'failed') {
    return (
      <div className="booking-success-container">
        <div className="booking-success-content" style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <XCircle size={48} color="#e53e3e" />
          </div>
          <h1 style={{ color: '#e53e3e' }}>Payment Not Completed</h1>
          <p style={{ color: '#718096', maxWidth: 400, margin: '0 auto 2rem' }}>
            Your payment was cancelled or failed. No charge has been made. Please try again.
          </p>
          <div className="action-buttons">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Try Again
            </button>
            <button onClick={() => navigate('/')} className="btn-home">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PENDING STATE ────────────────────────────────────────────────────────
  if (verifyStatus === 'pending') {
    return (
      <div className="booking-success-container">
        <div className="booking-success-content" style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={48} color="#d69e2e" />
          </div>
          <h1 style={{ color: '#b7791f' }}>Payment Processing...</h1>
          <p style={{ color: '#718096', maxWidth: 440, margin: '0 auto 1rem' }}>
            Your payment is being processed by PayHere. This may take a few minutes.
            Your booking will be confirmed automatically once payment is verified.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
            You will receive a confirmation email once payment is complete.
          </p>
          <div className="action-buttons" style={{ marginTop: '2rem' }}>
            <button onClick={() => navigate('/my-bookings')} className="btn-dashboard">
              Check My Bookings
            </button>
            <button onClick={() => navigate('/')} className="btn-home">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUCCESS STATE ────────────────────────────────────────────────────────
  return (
    <div className="booking-success-container">
      <div className="booking-success-content">
        <div className="success-icon-wrapper">
          <Check size={56} strokeWidth={3} />
        </div>

        <h1>Booking Confirmed! 🎉</h1>
        <p className="success-message">
          Your journey awaits! We've secured your spot and sent a confirmation email to{' '}
          <strong>{bookingInfo?.tourist_email || 'your inbox'}</strong>.
        </p>

        {bookingInfo && (
          <div className="booking-details-card">
            <h2>Booking Summary</h2>

            <div className="detail-row">
              <span className="detail-label">Booking Reference</span>
              <span className="detail-value reference">
                {bookingInfo.booking_reference || `#${String(bookingInfo.booking_id).substring(0, 8).toUpperCase()}`}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Package</span>
              <span className="detail-value">
                {bookingInfo.package_name || bookingInfo.package?.name || "Tour Package"}
              </span>
            </div>

            {bookingInfo.travel_date && (
              <div className="detail-row">
                <span className="detail-label">Travel Date</span>
                <span className="detail-value">
                  {new Date(bookingInfo.travel_date).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Travelers</span>
              <span className="detail-value">
                {bookingInfo.travelers || ((bookingInfo.adults || 0) + (bookingInfo.children || 0))} People
              </span>
            </div>

            <div className="detail-row total">
              <span className="detail-label">Total Paid</span>
              <span className="detail-value">${bookingInfo.total_price}</span>
            </div>
          </div>
        )}

        <div className="action-buttons">
          {downloadError && (
            <div className="error-message" style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', width: '100%' }}>
              <AlertCircle size={16} /> {downloadError}
            </div>
          )}
          {bookingInfo?.booking_id && (
            <button onClick={handleDownloadInvoice} disabled={downloading} className="btn-secondary">
              {downloading ? <Loader className="spinner" size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> : null}
              {downloading ? "Downloading..." : "Download Invoice"}
            </button>
          )}
          <button onClick={() => navigate('/my-bookings')} className="btn-dashboard">
            Go to My Bookings
          </button>
          <button onClick={() => navigate('/')} className="btn-home">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
