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

// Removed DummyCheckoutForm to use PayHere secure overlay

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
  const [payhereReady] = useState(true); // Always ready - using hosted checkout (no JS SDK)

  useEffect(() => {
    // PayHere hosted checkout does not require JS SDK - no script loading needed
  }, []);
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
        const payload = {
          package_id: step1Data.package_id,
          travel_date: step1Data.travel_date,
          adults: step1Data.adults,
          children: step1Data.children,
          room_type: step1Data.room_type,
          special_requests: step1Data.special_requests,
          travellers: travellers.map(t => ({
            full_name: t.fullName || t.full_name || '',
            passport_number: t.passportNumber || t.passport_number || '',
            passport_expiry: t.passportExpiry || t.passport_expiry || '',
            nationality: t.nationality || '',
            date_of_birth: t.dateOfBirth || t.date_of_birth || '',
            type: t.type || 'adult',
            dietary_restrictions: t.dietaryRestrictions || t.dietary_restrictions || '',
            medical_conditions: t.medicalConditions || t.medical_conditions || '',
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
      
      const paymentAmount = (isDirectBooking && existingBooking && existingBooking.deposit_amount !== undefined && existingBooking.deposit_amount !== null)
        ? existingBooking.deposit_amount
        : (daysUntilTravel <= 30 ? finalPrice : (finalPrice * 0.3).toFixed(2));
      
      // @API_CALL: Fetch Secure Hash from Backend
      const hashRes = await paymentService.generatePayHereHash(bookingId, paymentAmount, token);
      
      if (!hashRes.success) {
          throw new Error("Failed to secure payment channel: " + hashRes.message);
      }

      // Dynamically resolve backend base URL.
      // CRITICAL: Must point to the backend, NOT the frontend origin.
      // VITE_API_URL is set at build time to the backend container app URL.
      const BACKEND_URL = import.meta.env.VITE_API_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:5000/api' 
          : 'https://api-backend.wonderfulsmoke-82355efd.centralindia.azurecontainerapps.io/api');

      // Safe name extraction
      const primaryTraveller = travellers.length > 0 ? travellers[0] : null;
      const fullName = primaryTraveller?.fullName || authAPI.getCurrentUser()?.name || 'Guest';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Guest';
      const lastName = nameParts.slice(1).join(' ') || '-';

      // Save booking info to sessionStorage BEFORE redirecting
      // PayHere will redirect back to return_url after payment
      const bookingInfoForSuccess = {
        booking_id: bookingId,
        total_price: finalPrice,
        package_name: isDirectBooking ? (existingBooking?.package_name || 'Custom Tour') : packageData?.name,
        travel_date: isDirectBooking ? existingBooking?.travel_date : step1Data?.travel_date,
        travelers: travellers.length || 1,
        ...(isDirectBooking ? existingBooking : {})
      };
      sessionStorage.setItem('completedBooking', JSON.stringify(bookingInfoForSuccess));
      // Clear wizard data before redirect
      sessionStorage.removeItem('booking_step1');
      sessionStorage.removeItem('booking_travellers');

      // --- PAYHERE HOSTED CHECKOUT (Form POST Redirect) ---
      // Use dynamic checkout URL returned by backend (or fallback automatically to sandbox in local dev)
      const PAYHERE_CHECKOUT_URL = hashRes.checkoutUrl || 
        (import.meta.env.DEV ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout');

      const fields = {
        merchant_id:  hashRes.merchantId,
        return_url:   `${window.location.origin}/booking/${id}/success`,
        cancel_url:   `${window.location.origin}/booking/${id}/payment`,
        notify_url:   `${BACKEND_URL}/payments/payhere/webhook`,
        order_id:     hashRes.safeOrderId,
        items:        isDirectBooking ? (existingBooking?.package_name || 'Custom Tour') : (packageData?.name || 'Tour Package'),
        currency:     hashRes.currency,       // LKR (from backend env config)
        amount:       hashRes.chargeAmount,   // LKR amount = USD × rate (must match hash)
        first_name:   firstName,
        last_name:    lastName,
        email:        authAPI.getCurrentUser()?.email || 'guest@example.com',
        phone:        '0000000000',
        address:      'Sri Lanka',
        city:         'Colombo',
        country:      'Sri Lanka',
        hash:         hashRes.hash,
      };

      // Build and submit a hidden form - this is the standard PayHere hosted integration
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = PAYHERE_CHECKOUT_URL;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit(); // Browser navigates to PayHere's payment page

    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message || "An error occurred during booking.");
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

        {isDirectBooking && existingBooking && (
          <div className="existing-booking-badge" style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500, border: '1px solid #bee3f8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>ℹ️</span>
            <span>Completing payment for existing booking <strong>#{existingBooking.booking_id}</strong></span>
          </div>
        )}

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
          const totalPrice = parseFloat(step1Data.total_price) || 0;
          
          let depositAmount, balanceAmount, isCloseIn;
          if (isDirectBooking && existingBooking && existingBooking.deposit_amount !== undefined && existingBooking.deposit_amount !== null) {
            depositAmount = parseFloat(existingBooking.deposit_amount);
            balanceAmount = totalPrice - depositAmount;
            isCloseIn = depositAmount >= totalPrice;
          } else {
            isCloseIn = daysUntilTravel <= 30;
            depositAmount = isCloseIn ? totalPrice : (totalPrice * 0.3);
            balanceAmount = isCloseIn ? 0 : (totalPrice * 0.7);
          }

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

                  <button
                    onClick={handlePay}
                    disabled={processing || !payhereReady}
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem', background: payhereReady ? '#0055ff' : '#aaa', cursor: payhereReady ? 'pointer' : 'not-allowed' }}
                  >
                    {processing
                      ? "Opening Payment Gateway..."
                      : !payhereReady
                      ? "Loading Payment Gateway..."
                      : `Pay $${depositAmount.toFixed(2)} Securely`}
                  </button>
                  <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '1rem' }}>
                    Powered by <strong>PayHere</strong>. We do not store your credit card details.
                  </p>

                  <button
                    onClick={() => isDirectBooking ? navigate(-1) : navigate(`/booking/${id}/travellers`)}
                    className="btn-secondary"
                    style={{ marginTop: '1rem', width: '100%', background: 'transparent', color: '#666', border: '1px solid #ddd' }}
                    disabled={processing}
                  >
                    {isDirectBooking ? "Go Back" : "Back to Travellers"}
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
