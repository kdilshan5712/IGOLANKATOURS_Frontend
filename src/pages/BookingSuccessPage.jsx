import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import "./BookingSuccessPage.css";

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const [bookingInfo] = useState(() => {
    // Initialize state from sessionStorage
    const storedInfo = sessionStorage.getItem('completedBooking');
    if (!storedInfo) return null;
    
    try {
      const parsedInfo = JSON.parse(storedInfo);
      // Clear the completed booking data immediately after reading
      sessionStorage.removeItem('completedBooking');
      return parsedInfo;
    } catch (error) {
      console.error('Error parsing booking info:', error);
      return null;
    }
  });

  useEffect(() => {
    // Redirect if no booking info
    if (!bookingInfo) {
      navigate('/packages');
    }
  }, [bookingInfo, navigate]);

  if (!bookingInfo) {
    return (
      <div className="booking-success-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="booking-success-container">
      <div className="booking-success-content">
        <div className="success-icon">
          <Check size={64} />
        </div>

        <h1>Booking Confirmed!</h1>
        <p className="success-message">
          Your tour has been successfully booked. We're excited to have you travel with us!
        </p>

        <div className="booking-details">
          <h2>Booking Details</h2>
          
          <div className="detail-row">
            <span className="detail-label">Booking ID:</span>
            <span className="detail-value">#{bookingInfo.booking_id}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Package:</span>
            <span className="detail-value">{bookingInfo.package_name}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Travel Date:</span>
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
            <span className="detail-label">Number of Travelers:</span>
            <span className="detail-value">{bookingInfo.travelers}</span>
          </div>

          <div className="detail-row total">
            <span className="detail-label">Total Amount Paid:</span>
            <span className="detail-value">${bookingInfo.total_price}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>A confirmation email has been sent to your registered email address</li>
            <li>You can view all your bookings in the "My Bookings" section</li>
            <li>Our team will contact you 48 hours before your trip with final details</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate('/my-bookings')} 
            className="btn-primary"
          >
            View My Bookings
          </button>
          <button 
            onClick={() => navigate('/packages')} 
            className="btn-secondary"
          >
            Browse More Packages
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
