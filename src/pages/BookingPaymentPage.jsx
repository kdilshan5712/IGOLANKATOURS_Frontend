/**
 * 🎯 I GO LANKA TOURS - Booking Payment Page
 * 
 * Final stage of the booking flow. Handles session recovery, coupon validation,
 * booking creation, and secure payment processing (deposit or full payment).
 * Support for both standard wizard flow and direct booking links.
 * 
 * @module BookingPaymentPage
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Lock, AlertCircle, Loader, CheckCircle, CreditCard, Calendar, User, Users } from "lucide-react";
import { packageAPI, authAPI, bookingAPI, couponAPI } from "../services/api";

import paymentService from "../services/paymentService";
import "./BookingPaymentPage.css";

/**
 * DummyCheckoutForm Component
 * 
 * Mock credit card input form for demonstration purposes.
 * 
 * @param {Object} props
 * @param {number} props.amount - Total amount to pay
 * @param {Function} props.onPay - Success callback
 * @param {boolean} props.processing - Loading state
 * @returns {JSX.Element}
 */
const DummyCheckoutForm = ({ amount, onPay, processing }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardHolder) {
      alert("Please fill in all dummy card details (any values work)");
      return;
    }
    onPay();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label>Card Number</label>
        <div className="card-input-wrapper">
          <input
            type="text"
            name="cardNumber"
            placeholder="0000 0000 0000 0000"
            maxLength="19"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
          />
          <CreditCard className="icon-right" size={18} style={{ position: 'absolute', right: '10px', top: '10px', color: '#999' }} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="text"
            name="expiryDate"
            placeholder="MM/YY"
            maxLength="5"
            value={cardDetails.expiryDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            name="cvv"
            placeholder="123"
            maxLength="4"
            value={cardDetails.cvv}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Cardholder Name</label>
        <input
          type="text"
          name="cardHolder"
          placeholder="Name on Card"
          value={cardDetails.cardHolder}
          onChange={handleInputChange}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={processing}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {processing ? (
          <>Processing...</>
        ) : (
          <>Pay ${amount} Now</>
        )}
      </button>
    </form>
  );
};

/**
 * 💳 BookingPaymentPage Component
 * 
 * Final stage of the booking flow. Handles:
 * 1. Session recovery and direct booking context (for custom tours).
 * 2. Coupon/Promo code validation.
 * 3. Booking creation (if not already created).
 * 4. Payment processing (Deposit of 30% or Full payment based on travel date).
 */
const BookingPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [packageData, setPackageData] = useState(null);
  const [step1Data, setStep1Data] = useState(null);
  const [travellers, setTravellers] = useState([]);
  const [existingBooking, setExistingBooking] = useState(null);
  const [isDirectBooking, setIsDirectBooking] = useState(false);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(null);


  useEffect(() => {
    // @VALIDATION: 1. Auth Check - Redirect if session expired
    if (!authAPI.isAuthenticated()) {
      sessionStorage.setItem('returnUrl', `/booking/${id}`);
      navigate('/login');
      return;
    }

    // 2. Direct Booking Check (from Custom Tours dashboard)
    if (location.state?.isDirect && location.state?.booking) {
      console.log("🛠️ Processing Direct Booking for Approved Custom Tour");
      setExistingBooking(location.state.booking);
      setIsDirectBooking(true);
      
      // Load simple data for the summary
      const directBooking = location.state.booking;
      setStep1Data({
        package_id: directBooking.package_id,
        travel_date: new Date(directBooking.travel_date).toLocaleDateString(),
        total_price: directBooking.total_price,
        adults: directBooking.travelers || 1,
        children: 0,
        room_type: "Custom",
        special_requests: "Custom Approved Itinerary"
      });
      // We don't have traveller details but we don't need them to pay
      setTravellers([]); 
      
      setLoading(false);
      return;
    }

    // 3. Wizard Flow Check
    const s1 = sessionStorage.getItem('booking_step1');
    const s2 = sessionStorage.getItem('booking_travellers');

    if (!s1) {
      navigate(`/booking/${id}`); 
      return;
    }
    if (!s2) {
      navigate(`/booking/${id}/travellers`); 
      return;
    }

    setStep1Data(JSON.parse(s1));
    setTravellers(JSON.parse(s2));

    // 4. Load Package/Booking for recovery
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // If s1 is missing, we might be coming from a direct link (notification)
        if (!s1) {
          console.log(`🔍 No session data found. Attempting to recover context for ID: ${id}...`);
          
          // If ID is numeric, it's a booking ID
          if (/^\d+$/.test(id)) {
            try {
              const res = await bookingAPI.getById(id, authAPI.getToken());
              if (res.success && res.booking) {
                const b = res.booking;
                setIsDirectBooking(true);
                setExistingBooking(b);
                setStep1Data({
                  package_id: b.package_id,
                  travel_date: b.travel_date,
                  total_price: b.total_price,
                  adults: b.travelers || 1,
                  children: 0,
                  room_type: "Standard",
                  special_requests: b.admin_notes || ""
                });
                setLoading(false);
                return;
              }
            } catch (err) {
              console.warn("Failed to recover booking:", err);
            }
          }
          
          // If we can't recover a booking and have no session, we must go back
          navigate(`/booking/${id}`);
          return;
        }

        // Standard flow: Load package data
        const data = await packageAPI.getById(id);
        setPackageData(data);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to load booking context. Please try starting the booking again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

  }, [id, navigate, location.state]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setIsValidatingPromo(true);
    setPromoError(null);
    
    try {
      // @API_CALL: Validate promo code against current booking amount
      const amount = step1Data.total_price;
      const res = await couponAPI.validate(promoCode, amount);
      
      if (res.success) {
        setPromoDiscount(res.coupon.applied_discount);
        setAppliedPromo(res.coupon);
        setPromoError(null);
      } else {
        // @ERROR_HANDLING: Display coupon rejection reason
        setPromoError(res.message || "Invalid coupon code");
        setPromoDiscount(0);
        setAppliedPromo(null);
      }
    } catch (err) {
      // @ERROR_HANDLING: Network error during validation
      setPromoError("Failed to validate coupon");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    setFieldErrors({});

    try {
      const token = authAPI.getToken();
      let bookingId;
      let finalPrice;

      // WORKFLOW BRANCHING: Direct vs Wizard Flow
      if (isDirectBooking && existingBooking) {
        // --- CASE 1: Direct Payment for Existing Booking ---
        bookingId = existingBooking.booking_id;
        finalPrice = existingBooking.total_price;
      } else {
        // --- CASE 2: Create New Booking (Wizard Flow) ---
        const payload = {
          package_id: step1Data.package_id,
          // ... (payload assembly)
          travel_date: step1Data.travel_date,
          adults: step1Data.adults,
          children: step1Data.children,
          room_type: step1Data.room_type,
          special_requests: step1Data.special_requests,
          travellers: travellers.map(t => ({
            full_name: t.fullName || t.full_name || '',
            passport_number: t.passportNumber || t.passport_number || '',
            nationality: t.nationality || '',
            date_of_birth: t.dateOfBirth || t.date_of_birth || '',
            type: t.type || 'adult',
          })),
          promo_code: appliedPromo ? appliedPromo.code : null,
        };

        // @API_CALL: Create the booking before payment
        const bookingRes = await bookingAPI.create(payload, token);
        if (!bookingRes.booking) {
          // @ERROR_HANDLING: Parse server-side validation errors (e.g., passport missing)
          if (bookingRes.errors) {
            setFieldErrors(bookingRes.errors);
            throw new Error("Please correct the traveler information errors below.");
          }
          throw new Error(bookingRes.message || "Failed to create booking");
        }

        bookingId = bookingRes.booking.booking_id;
        finalPrice = bookingRes.booking.total_price;
      }

      // @VALIDATION: Payment logic - Deposit vs Full Payment
      const travelDateStr = isDirectBooking ? existingBooking.travel_date : step1Data.travel_date;
      const travelDate = new Date(travelDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilTravel = Math.ceil((travelDate - today) / (1000 * 60 * 60 * 24));
      
      // For custom bookings (Direct), we usually require full payment as finalized by admin
      const paymentAmount = isDirectBooking ? finalPrice : (daysUntilTravel <= 30 ? finalPrice : (finalPrice * 0.3).toFixed(2));
      
      // @API_CALL: Execute payment transaction
      const paymentRes = await paymentService.processDummyPayment(bookingId, paymentAmount, token);

      if (paymentRes.success) {
        // Success! Cleanup session storage
        sessionStorage.removeItem('booking_step1');
        sessionStorage.removeItem('booking_travellers');

        navigate(`/booking/${id}/success`, {
          state: {
            booking: {
              ...(isDirectBooking ? existingBooking : null),
              booking_id: bookingId,
              total_price: finalPrice,
              package_name: isDirectBooking ? (existingBooking.package_name || "Custom Tour") : packageData.name
            }
          }
        });
      } else {
        // @ERROR_HANDLING: Payment gateway error
        throw new Error("Payment failed: " + paymentRes.message);
      }

    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message || "An error occurred during booking.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="booking-payment-container"><div className="loading">Loading...</div></div>;
  if (error) return (
    <div className="booking-payment-container">
      <div className="error-message">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate(`/booking/${id}/travellers`)} className="btn-secondary">go back</button>
      </div>
    </div>
  );

  return (
    <div className="booking-payment-container">
      <div className="booking-payment-content">
        <h1>Review & Pay</h1>

        {/* Steps - Only show for standard bookings */}
        {!isDirectBooking && (
          <div className="steps-indicator" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="step"><div className="step-number" style={{ background: '#e2e8f0', width: 30, height: 30, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>1</div></div>
            <div className="step"><div className="step-number" style={{ background: '#e2e8f0', width: 30, height: 30, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>2</div></div>
            <div className="step active" style={{ color: '#3182ce' }}><div className="step-number" style={{ background: '#3182ce', color: 'white', width: 30, height: 30, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>3</div> Payment</div>
          </div>
        )}

        {(() => {
          if (!step1Data) return <div className="loading-small">Loading Summary...</div>;
          
          const travelDate = step1Data.travel_date ? new Date(step1Data.travel_date) : new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const daysUntilTravel = Math.ceil((travelDate - today) / (1000 * 60 * 60 * 24));
          const isCloseIn = daysUntilTravel <= 30;
          const totalPrice = parseFloat(step1Data.total_price) || 0;
          const depositAmount = isCloseIn ? totalPrice : (totalPrice * 0.3);
          const balanceAmount = isCloseIn ? 0 : (totalPrice * 0.7);

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

              {/* Left Col: Summary */}
              <div>
                <div className="booking-summary">
                  <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Booking Summary</h2>

                  <div className="summary-item">
                    <span>Package:</span>
                    <strong>{isDirectBooking ? (existingBooking?.package_name || "Custom Approved Tour") : (packageData?.name || "Tour Package")}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Date:</span>
                    <strong>{step1Data.travel_date || "TBD"}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Guests:</span>
                    <strong>{step1Data.adults || 0} Adults, {step1Data.children || 0} Children</strong>
                  </div>
                  <div className="summary-item">
                    <span>Room:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{isDirectBooking ? "Tailored" : (step1Data.room_type || "Standard")}</strong>
                  </div>

                  {travellers.length > 0 && (
                    <>
                      <h3 style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#4a5568' }}>Travellers</h3>
                      <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#666' }}>
                        {travellers.map((t, i) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>
                            {i + 1}. {t.fullName} ({t.type})
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="summary-item total" style={{ borderTop: 'double #ddd', marginTop: '1rem', paddingTop: '1rem' }}>
                    <span>Total Package Price:</span>
                    <span>${totalPrice}</span>
                  </div>

                  {appliedPromo && (
                    <div className="summary-item discount" style={{ color: '#2f855a', fontSize: '1rem', marginTop: '0.5rem' }}>
                      <span>Discount ({appliedPromo.code}):</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {isCloseIn ? (
                    <div className="summary-item full-payment" style={{ color: '#c53030', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem' }}>
                      <span>Full Payment Required:</span>
                      <span>${(totalPrice - promoDiscount).toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="summary-item deposit" style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem' }}>
                        <span>Deposit Due Today (30%):</span>
                        <span>${((totalPrice - promoDiscount) * 0.3).toFixed(2)}</span>
                      </div>

                      <div className="summary-item balance" style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                        <span>Remaining Balance (70%):</span>
                        <span>${((totalPrice - promoDiscount) * 0.7).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  
                  <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {isCloseIn 
                      ? "* Tours starting within 30 days require full payment at the time of booking."
                      : "* Balance must be paid at least 30 days before departure."}
                  </p>

                  {!isDirectBooking && (
                    <div className="promo-section" style={{ marginTop: '2rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', color: '#2d3748', marginBottom: '1rem' }}>Promo Code</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          disabled={isValidatingPromo || appliedPromo}
                          style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e0', borderRadius: '4px' }}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={isValidatingPromo || !promoCode || appliedPromo}
                          className="btn-apply"
                          style={{ padding: '0 1rem', background: '#4a5568', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {isValidatingPromo ? '...' : (appliedPromo ? 'Applied' : 'Apply')}
                        </button>
                      </div>
                      {promoError && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '0.5rem' }}>{promoError}</p>}
                      {appliedPromo && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', background: '#f0fff4', padding: '0.5rem', borderRadius: '4px' }}>
                          <span style={{ color: '#2f855a', fontSize: '0.8rem' }}>Code <strong>{appliedPromo.code}</strong> applied!</span>
                          <button 
                            onClick={() => { setAppliedPromo(null); setPromoDiscount(0); setPromoCode(""); }}
                            style={{ background: 'none', border: 'none', color: '#c53030', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>


              {/* Right Col: Payment */}
              <div>
                <div className="payment-form">
                  <div className="payment-header">
                    <Lock size={20} color="#2e7d32" />
                    <h2>Secure Payment</h2>
                  </div>

                  <div className="security-badge">
                    <CheckCircle size={16} />
                    <span>SSL Encrypted Transaction</span>
                  </div>

                  <DummyCheckoutForm
                    amount={depositAmount.toFixed(2)}
                    onPay={handlePay}
                    processing={processing}
                  />

                  <button
                    onClick={() => isDirectBooking ? navigate('/custom-tours') : navigate(`/booking/${id}/travellers`)}
                    className="btn-secondary"
                    style={{ marginTop: '1rem', width: '100%', background: 'transparent', color: '#666', border: '1px solid #ddd' }}
                    disabled={processing}
                  >
                    {isDirectBooking ? "Back to Custom Tours" : "Back to Travellers"}
                  </button>
                </div>
              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default BookingPaymentPage;
