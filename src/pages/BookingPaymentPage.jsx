import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Lock } from "lucide-react";
import { packageAPI, bookingAPI, authAPI } from "../services/api";
import "./BookingPaymentPage.css";

const BookingPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!authAPI.isAuthenticated()) {
      // Store return URL and redirect to login
      sessionStorage.setItem('returnUrl', `/booking/${id}/payment`);
      navigate('/login');
      return;
    }

    // Check if email is verified
    const user = authAPI.getCurrentUser();
    if (user && user.email_verified === false) {
      alert('Please verify your email before making a booking. Check your inbox for the verification link.');
      navigate('/profile');
      return;
    }

    // Validate ID
    if (!id) {
      navigate('/packages');
      return;
    }

    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem('bookingData');
    if (!storedData) {
      navigate(`/booking/${id}`);
      return;
    }

    const parsedData = JSON.parse(storedData);
    setBookingData(parsedData);

    // Fetch package details
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const data = await packageAPI.getById(id);
        setPackageData(data);
      } catch (err) {
        console.error("Error fetching package:", err);
        setError("Failed to load package details");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, navigate]);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  // Format expiry date as MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  // Format CVV
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(value);
  };

  // Validate payment form
  const validatePaymentForm = () => {
    if (paymentMethod === "card") {
      const cardDigits = cardNumber.replace(/\s/g, "");
      if (cardDigits.length < 15 || cardDigits.length > 16) {
        setError("Please enter a valid card number");
        return false;
      }
      if (!cardName.trim()) {
        setError("Please enter the cardholder name");
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError("Please enter a valid expiry date (MM/YY)");
        return false;
      }
      const [month] = expiryDate.split("/");
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        setError("Please enter a valid expiry month");
        return false;
      }
      if (cvv.length < 3 || cvv.length > 4) {
        setError("Please enter a valid CVV");
        return false;
      }
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!bookingData || !packageData) {
      setError("Booking data is missing");
      return;
    }

    if (!validatePaymentForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Simulate secure payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Create booking in backend
      const token = authAPI.getToken();
      const response = await bookingAPI.create({
        package_id: bookingData.package_id,
        travel_date: bookingData.travel_date,
        travelers: bookingData.travelers
      }, token);

      if (response.booking) {
        // Store booking info for success page
        sessionStorage.setItem('completedBooking', JSON.stringify({
          booking_id: response.booking.booking_id,
          package_name: packageData.name,
          travel_date: bookingData.travel_date,
          travelers: bookingData.travelers,
          total_price: bookingData.total_price
        }));

        // Clear booking data
        sessionStorage.removeItem('bookingData');

        // Navigate to success page
        navigate(`/booking/${id}/success`);
      } else {
        throw new Error(response.message || "Payment declined. Please try again.");
      }
    } catch (err) {
      const errorMessage = err.message || "Payment processing failed. Please verify your card details and try again.";
      
      // Check if error is due to email not verified
      if (err.response?.data?.error === 'EMAIL_NOT_VERIFIED' || errorMessage.includes('verify your email')) {
        alert('Please verify your email before making a booking. Check your inbox for the verification link.');
        navigate('/profile');
        return;
      }
      
      setError(errorMessage);
      console.error(err);
  if (loading) {
    return (
      <div className="booking-payment-container">
        <div className="loading">Loading payment details...</div>
      </div>
    );
  }

  if (error && !packageData) {
    return (
      <div className="booking-payment-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/packages")} className="back-button">
          Back to Packages
        </button>
      </div>
    );
  }

      setSubmitting(false);
    }
  };

  // Render logic
  if (!bookingData || !packageData) {
    return (
      <div className="booking-payment-container">
        <div className="error-message">Booking data not found</div>
        <button onClick={() => navigate(`/booking/${id}`)} className="back-button">
          Start Booking Again
        </button>
      </div>
    );
  }

  return (
    <div className="booking-payment-container">
      <div className="booking-payment-content">
        <h1>Payment Details</h1>

        <div className="booking-summary">
          <h2>Booking Summary</h2>
          <div className="summary-item">
            <span>Package:</span>
            <strong>{packageData.name}</strong>
          </div>
          <div className="summary-item">
            <span>Travel Date:</span>
            <strong>{new Date(bookingData.travel_date).toLocaleDateString()}</strong>
          </div>
          <div className="summary-item">
            <span>Travelers:</span>
            <strong>{bookingData.travelers}</strong>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <strong>${bookingData.total_price}</strong>
          </div>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <div className="payment-header">
            <Lock size={20} />
            <h2>Secure Payment</h2>
          </div>

          <div className="security-badge">
            <Lock size={14} />
            <span>256-bit SSL Encrypted</span>
          </div>

          {error && (
            <div className="error-alert">{error}</div>
          )}

          {/* Payment Method Selection */}
          <div className="payment-methods">
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <CreditCard size={20} />
                <span>Credit / Debit Card</span>
              </div>
            </label>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === "card" && (
            <div className="card-payment-section">
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <div className="card-input-wrapper">
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    autoComplete="cc-number"
                  />
                  <div className="card-logos">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='20' viewBox='0 0 32 20'%3E%3Crect width='32' height='20' rx='2' fill='%231434CB'/%3E%3Ccircle cx='12' cy='10' r='5' fill='%23EB001B'/%3E%3Ccircle cx='20' cy='10' r='5' fill='%23FF5F00'/%3E%3C/svg%3E" alt="Mastercard" />
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='20' viewBox='0 0 32 20'%3E%3Crect width='32' height='20' rx='2' fill='%230066B2'/%3E%3Cpath d='M13 5h6v10h-6z' fill='%23FFF'/%3E%3C/svg%3E" alt="Visa" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name</label>
                <input
                  type="text"
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  required
                  autoComplete="cc-name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                    autoComplete="cc-exp"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    maxLength="4"
                    required
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                  />
                  <span>Save card details for future bookings</span>
                </label>
              </div>
            </div>
          )}

          <div className="payment-terms">
            <p>
              By completing this payment, you agree to our{" "}
              <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms & Conditions</a> and{" "}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </p>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/booking/${id}`)} 
              className="btn-secondary"
              disabled={submitting}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Pay ${bookingData.total_price}
                </>
              )}
            </button>
          </div>

          <div className="payment-footer">
            <Lock size={14} />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPaymentPage;
