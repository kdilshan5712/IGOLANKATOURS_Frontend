import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, ArrowRight } from "lucide-react";
import { useBooking } from "../contexts/BookingContext";
import "./TravellerInfoPage.css";

const TravellerInfoPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();

  const [formData, setFormData] = useState({
    fullName: bookingData.travellerInfo?.fullName || "",
    email: bookingData.travellerInfo?.email || "",
    phone: bookingData.travellerInfo?.phone || "",
    specialRequests: bookingData.travellerInfo?.specialRequests || "",
  });

  const [errors, setErrors] = useState({});

  // Redirect if no package data or invalid packageId
  useEffect(() => {
    if (!packageId || packageId === 'undefined' || packageId === 'null') {
      console.error('[TravellerInfo] Invalid package ID:', packageId);
      navigate('/packages');
      return;
    }
    
    if (!bookingData.packageId || !bookingData.packageData) {
      navigate(`/booking/${packageId}`);
    }
  }, [bookingData, packageId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    // Update booking context
    updateBookingData({
      travellerInfo: formData
    });

    navigate(`/booking/${packageId}/payment`);
  };

  return (
    <main className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="booking-title">Traveller Information</h1>
          <div className="booking-steps">
            <div className="booking-step">1. Details</div>
            <div className="booking-step active">2. Travellers</div>
            <div className="booking-step">3. Payment</div>
            <div className="booking-step">4. Confirmation</div>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-form-section">
            <div className="booking-form-card">
              <h2 className="booking-form-title">Contact Information</h2>

              <div className="booking-form-group">
                <label className="booking-label">
                  <User size={18} />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`booking-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.fullName && <span className="booking-error-text">{errors.fullName}</span>}
              </div>

              <div className="booking-form-group">
                <label className="booking-label">
                  <Mail size={18} />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`booking-input ${errors.email ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                  required
                />
                {errors.email && <span className="booking-error-text">{errors.email}</span>}
              </div>

              <div className="booking-form-group">
                <label className="booking-label">
                  <Phone size={18} />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`booking-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+1 234 567 8900"
                  required
                />
                {errors.phone && <span className="booking-error-text">{errors.phone}</span>}
              </div>

              <div className="booking-form-group">
                <label className="booking-label">
                  <span>Special Requests (Optional)</span>
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="booking-textarea"
                  placeholder="Any dietary requirements, accessibility needs, or special requests..."
                  rows="4"
                />
              </div>

              <button onClick={handleContinue} className="booking-continue-btn">
                <span>Continue to Payment</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="booking-summary-section">
            <div className="booking-summary-card">
              <h3 className="booking-summary-title">Booking Summary</h3>
              {bookingData.packageData && (
                <>
                  <h4 className="booking-summary-package-name">
                    {bookingData.packageData.name}
                  </h4>
                  <p className="booking-summary-duration">{bookingData.packageData.duration}</p>
                  <div className="booking-summary-divider"></div>
                  <div className="booking-summary-row">
                    <span>Travel Date</span>
                    <span className="booking-summary-amount">{bookingData.travelDate}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span>Travelers</span>
                    <span className="booking-summary-amount">{bookingData.numberOfTravelers}</span>
                  </div>
                  <div className="booking-summary-divider"></div>
                  <div className="booking-summary-row booking-summary-total">
                    <span>Total</span>
                    <span className="booking-summary-amount">
                      ${bookingData.totalAmount}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TravellerInfoPage;
