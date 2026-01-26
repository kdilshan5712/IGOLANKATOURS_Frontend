import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Users, Mail, Phone, Download, Send, CreditCard } from "lucide-react";
import { useBooking } from "../contexts/BookingContext";
import "./ConfirmationPage.css";

const ConfirmationPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { bookingData, resetBooking } = useBooking();

  // Redirect if no booking data or invalid packageId
  useEffect(() => {
    if (!packageId || packageId === 'undefined' || packageId === 'null') {
      console.error('[Confirmation] Invalid package ID:', packageId);
      navigate('/packages');
      return;
    }
    
    if (!bookingData.bookingReference || bookingData.paymentStatus !== "completed") {
      navigate(`/booking/${packageId}`);
    }
  }, [bookingData, packageId, navigate]);

  // Save booking to localStorage
  useEffect(() => {
    if (bookingData.bookingReference && bookingData.packageData) {
      const booking = {
        id: bookingData.bookingReference,
        bookingReference: bookingData.bookingReference,
        packageId: packageId || bookingData.packageId,
        packageData: bookingData.packageData,
        travelDate: bookingData.travelDate,
        numberOfTravelers: bookingData.numberOfTravelers,
        travellerInfo: bookingData.travellerInfo,
        paymentMethod: bookingData.paymentInfo?.method || 'card',
        totalAmount: bookingData.totalAmount,
        status: bookingData.status,
        paymentStatus: bookingData.paymentStatus,
        createdAt: new Date().toISOString(),
      };

      // Get existing bookings
      const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
      
      // Add new booking if it doesn't already exist
      const bookingExists = existingBookings.some(b => b.bookingReference === bookingData.bookingReference);
      if (!bookingExists) {
        existingBookings.push(booking);
        localStorage.setItem("userBookings", JSON.stringify(existingBookings));
      }
    }
  }, [bookingData, packageId]);

  const handleDownloadItinerary = () => {
    if (!bookingData.packageData) return;

    const itineraryContent = `
I GO LANKA TOURS - Booking Confirmation & Itinerary
===================================================

BOOKING REFERENCE: ${bookingData.bookingReference}
Booking Status: CONFIRMED

TOUR DETAILS:
Package: ${bookingData.packageData.name}
Duration: ${bookingData.packageData.duration}
Travel Date: ${bookingData.travelDate}
Number of Travelers: ${bookingData.numberOfTravelers}

TRAVELLER INFORMATION:
Name: ${bookingData.travellerInfo?.fullName || 'N/A'}
Email: ${bookingData.travellerInfo?.email || 'N/A'}
Phone: ${bookingData.travellerInfo?.phone || 'N/A'}

PAYMENT SUMMARY:
Payment Method: ${bookingData.paymentInfo?.method === 'card' ? 'Credit Card' : 'Bank Transfer'}
Card Last 4 Digits: ${bookingData.paymentInfo?.cardLast4 || 'N/A'}
Total Amount: $${bookingData.totalAmount}
Payment Status: CONFIRMED

TOUR HIGHLIGHTS:
${bookingData.packageData.highlights?.map((h, i) => `${i + 1}. ${h}`).join('\n') || 'N/A'}

WHAT'S INCLUDED:
${bookingData.packageData.included?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'N/A'}

IMPORTANT NOTES:
- Please keep this booking reference for your records
- Our team will contact you within 24 hours
- You will receive a detailed itinerary 7 days before departure
- Bring a valid ID and travel documents

CONTACT INFORMATION:
Email: info@igolankatours.com
Phone: +94 77 123 4567
Website: www.igolankatours.com

Thank you for choosing I GO LANKA TOURS!
We look forward to showing you the beauty of Sri Lanka.
    `;

    const blob = new Blob([itineraryContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IGOLANKATOURS_Booking_${bookingData.bookingReference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-success">
          <div className="confirmation-icon">
            <CheckCircle size={64} />
          </div>
          <h1 className="confirmation-title">Booking Confirmed!</h1>
          <p className="confirmation-subtitle">
            Thank you for choosing I GO LANKA TOURS. Your booking has been
            successfully confirmed.
          </p>
        </div>

        <div className="confirmation-reference">
          <p className="confirmation-reference-label">Booking Reference</p>
          <p className="confirmation-reference-number">{bookingData.bookingReference}</p>
          <p className="confirmation-reference-note">
            Please save this reference number for your records
          </p>
        </div>

        <div className="confirmation-details-grid">
          <div className="confirmation-card">
            <h2 className="confirmation-card-title">Tour Details</h2>
            {bookingData.packageData && (
              <>
                <div className="confirmation-detail-row">
                  <span className="confirmation-detail-label">Package</span>
                  <span className="confirmation-detail-value">
                    {bookingData.packageData.name}
                  </span>
                </div>
                <div className="confirmation-detail-row">
                  <span className="confirmation-detail-label">Duration</span>
                  <span className="confirmation-detail-value">
                    {bookingData.packageData.duration}
                  </span>
                </div>
                <div className="confirmation-detail-row">
                  <Calendar size={16} />
                  <span className="confirmation-detail-label">Travel Date</span>
                  <span className="confirmation-detail-value">{bookingData.travelDate}</span>
                </div>
                <div className="confirmation-detail-row">
                  <Users size={16} />
                  <span className="confirmation-detail-label">Travelers</span>
                  <span className="confirmation-detail-value">
                    {bookingData.numberOfTravelers}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="confirmation-card">
            <h2 className="confirmation-card-title">Contact Information</h2>
            {bookingData.travellerInfo && (
              <>
                <div className="confirmation-detail-row">
                  <span className="confirmation-detail-label">Name</span>
                  <span className="confirmation-detail-value">
                    {bookingData.travellerInfo.fullName}
                  </span>
                </div>
                <div className="confirmation-detail-row">
                  <Mail size={16} />
                  <span className="confirmation-detail-label">Email</span>
                  <span className="confirmation-detail-value">
                    {bookingData.travellerInfo.email}
                  </span>
                </div>
                <div className="confirmation-detail-row">
                  <Phone size={16} />
                  <span className="confirmation-detail-label">Phone</span>
                  <span className="confirmation-detail-value">
                    {bookingData.travellerInfo.phone}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="confirmation-card">
            <h2 className="confirmation-card-title">Payment Summary</h2>
            {bookingData.packageData && (
              <>
                <div className="confirmation-detail-row">
                  <span className="confirmation-detail-label">Payment Method</span>
                  <span className="confirmation-detail-value">
                    {bookingData.paymentInfo?.method === "card" ? "Credit Card" : "Bank Transfer"}
                  </span>
                </div>
                <div className="confirmation-detail-row">
                  <span className="confirmation-detail-label">Amount Paid</span>
                  <span className="confirmation-detail-value confirmation-amount">
                    ${bookingData.totalAmount}
                  </span>
                </div>
                <div className="confirmation-detail-row">
                  <span className="confirmation-detail-label">Status</span>
                  <span className="confirmation-status-badge">Confirmed</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="confirmation-info-box">
          <h3 className="confirmation-info-title">What's Next?</h3>
          <ul className="confirmation-info-list">
            <li>
              A confirmation email has been sent to {bookingData.travellerInfo?.email}
            </li>
            <li>Our team will contact you within 24 hours to finalize details</li>
            <li>You will receive a detailed itinerary 7 days before departure</li>
            <li>For any questions, please contact us with your booking reference</li>
          </ul>
        </div>

        {/* Notification Status Indicators */}
        <div className="notification-indicators">
          <h3 className="notification-title">Notifications Sent</h3>
          <div className="notification-grid">
            <div className="notification-item notification-sent">
              <div className="notification-icon">
                <Mail size={24} />
              </div>
              <div className="notification-content">
                <h4>Booking Confirmation Email</h4>
                <p>Sent to {bookingData.travellerInfo?.email}</p>
                <span className="notification-status">✓ Delivered</span>
              </div>
            </div>
            
            <div className="notification-item notification-sent">
              <div className="notification-icon">
                <CreditCard size={24} />
              </div>
              <div className="notification-content">
                <h4>Payment Receipt</h4>
                <p>Transaction confirmation sent</p>
                <span className="notification-status">✓ Delivered</span>
              </div>
            </div>
            
            <div className="notification-item notification-pending">
              <div className="notification-icon">
                <Send size={24} />
              </div>
              <div className="notification-content">
                <h4>SMS Notification</h4>
                <p>Booking details to {bookingData.travellerInfo?.phone}</p>
                <span className="notification-status">⏳ Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button 
            onClick={handleDownloadItinerary}
            className="confirmation-btn confirmation-btn-primary"
          >
            <Download size={20} />
            <span>Download Itinerary</span>
          </button>
          <Link to="/packages" className="confirmation-btn confirmation-btn-secondary">
            Browse More Tours
          </Link>
          <Link to="/" className="confirmation-btn confirmation-btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ConfirmationPage;
