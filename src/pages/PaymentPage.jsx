import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useBooking } from "../contexts/BookingContext";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { bookingData, processPayment } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState("");

  // Redirect if no traveller data or invalid packageId
  useEffect(() => {
    if (!packageId || packageId === 'undefined' || packageId === 'null') {
      console.error('[Payment] Invalid package ID:', packageId);
      navigate('/packages');
      return;
    }
    
    if (!bookingData.travellerInfo || !bookingData.packageData) {
      navigate(`/booking/${packageId}`);
    }
  }, [bookingData, packageId, navigate]);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 3);
    }

    setCardData({ ...cardData, [name]: formattedValue });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (paymentError) {
      setPaymentError("");
    }
  };

  const validatePayment = () => {
    const newErrors = {};

    if (paymentMethod === "card") {
      const cardNumberClean = cardData.cardNumber.replace(/\s/g, "");
      if (!cardNumberClean) {
        newErrors.cardNumber = "Card number is required";
      } else if (cardNumberClean.length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (!cardData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }

      if (!cardData.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      } else {
        const [month, year] = cardData.expiryDate.split("/");
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
          newErrors.expiryDate = "Invalid expiry date";
        } else if (
          parseInt(year) < currentYear ||
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)
        ) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      if (!cardData.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (cardData.cvv.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment()) {
      return;
    }

    setProcessing(true);
    setPaymentError("");

    try {
      // Simulate payment processing (dummy logic)
      const result = await processPayment({
        method: paymentMethod,
        cardLast4: paymentMethod === "card" ? cardData.cardNumber.slice(-4) : null,
      });

      if (result.success) {
        // Navigate to confirmation page
        navigate(`/booking/${packageId}/confirmation`);
      } else {
        setPaymentError(
          result.message || "Payment failed. Please try again with a different card."
        );
      }
    } catch (error) {
      setPaymentError("An error occurred during payment processing. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="booking-title">Secure Payment</h1>
          <div className="booking-steps">
            <div className="booking-step">1. Details</div>
            <div className="booking-step">2. Travellers</div>
            <div className="booking-step active">3. Payment</div>
            <div className="booking-step">4. Confirmation</div>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-form-section">
            <div className="booking-form-card">
              <div className="payment-secure-badge">
                <Lock size={16} />
                <span>Secure payment powered by Stripe</span>
              </div>

              <h2 className="booking-form-title">Payment Information</h2>

              {paymentError && (
                <div className="payment-error-banner">
                  <AlertCircle size={20} />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="payment-form">
                <div className="booking-form-group">
                  <label className="booking-label">
                    <CreditCard size={18} />
                    <span>Card Number</span>
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    className={`booking-input payment-input ${
                      errors.cardNumber ? "error" : ""
                    }`}
                    placeholder="1234 5678 9012 3456"
                    disabled={processing}
                  />
                  {errors.cardNumber && (
                    <span className="booking-error-text">{errors.cardNumber}</span>
                  )}
                </div>

                <div className="booking-form-group">
                  <label className="booking-label">
                    <span>Cardholder Name</span>
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardData.cardName}
                    onChange={handleCardChange}
                    className={`booking-input ${errors.cardName ? "error" : ""}`}
                    placeholder="JOHN DOE"
                    disabled={processing}
                  />
                  {errors.cardName && (
                    <span className="booking-error-text">{errors.cardName}</span>
                  )}
                </div>

                <div className="payment-form-row">
                  <div className="booking-form-group">
                    <label className="booking-label">
                      <span>Expiry Date</span>
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardData.expiryDate}
                      onChange={handleCardChange}
                      className={`booking-input ${errors.expiryDate ? "error" : ""}`}
                      placeholder="MM/YY"
                      disabled={processing}
                    />
                    {errors.expiryDate && (
                      <span className="booking-error-text">{errors.expiryDate}</span>
                    )}
                  </div>

                  <div className="booking-form-group">
                    <label className="booking-label">
                      <span>CVV</span>
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      className={`booking-input ${errors.cvv ? "error" : ""}`}
                      placeholder="123"
                      disabled={processing}
                    />
                    {errors.cvv && (
                      <span className="booking-error-text">{errors.cvv}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="payment-notice">
                <Lock size={16} />
                <p>Your payment information is secure and encrypted</p>
              </div>

              <button
                onClick={handlePayment}
                className="booking-continue-btn payment-btn"
                disabled={processing}
              >
                {processing ? (
                  <div className="payment-processing">
                    <div className="payment-spinner"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Pay ${bookingData.totalAmount}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="booking-summary-section">
            <div className="booking-summary-card">
              <h3 className="booking-summary-title">Order Summary</h3>
              {bookingData.packageData && (
                <>
                  <h4 className="booking-summary-package-name">
                    {bookingData.packageData.name}
                  </h4>
                  <p className="booking-summary-duration">
                    {bookingData.packageData.duration}
                  </p>

                  <div className="booking-summary-divider"></div>

                  <div className="booking-summary-row">
                    <span>Travel Date</span>
                    <span className="booking-summary-amount">
                      {bookingData.travelDate}
                    </span>
                  </div>

                  <div className="booking-summary-row">
                    <span>Number of Travelers</span>
                    <span className="booking-summary-amount">
                      {bookingData.numberOfTravelers}
                    </span>
                  </div>

                  <div className="booking-summary-row">
                    <span>Price per person</span>
                    <span className="booking-summary-amount">
                      ${bookingData.packageData.price}
                    </span>
                  </div>

                  <div className="booking-summary-divider"></div>

                  <div className="booking-summary-row booking-summary-total">
                    <span>Total Amount</span>
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

export default PaymentPage;
