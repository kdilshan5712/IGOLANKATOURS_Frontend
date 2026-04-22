/**
 * 🎯 I GO LANKA TOURS - Booking Configuration (Step 1)
 * 
 * Orchestrates the initial step of the tour booking funnel. Handles travel 
 * date selection, traveler count input, and dynamic price simulation 
 * based on administrative pricing rules.
 * 
 * @module BookingStartPage
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { packageAPI, authAPI } from "../services/api";
import "./BookingStartPage.css";

/**
 * BookingStartPage Component
 * 
 * Manages the entry state for a booking transaction, ensuring user 
 * authentication and email verification requirements are met.
 * 
 * @returns {JSX.Element}
 */
const BookingStartPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  // Initialize from location state if coming back, or defaults
  const [travelDate, setTravelDate] = useState(location.state?.travelDate || "");
  const [adults, setAdults] = useState(location.state?.adults || 1);
  const [children, setChildren] = useState(location.state?.children || 0);
  const [roomType, setRoomType] = useState(location.state?.roomType || 'double');
  const [specialRequests, setSpecialRequests] = useState(location.state?.specialRequests || '');

  const [calculatedPrice, setCalculatedPrice] = useState(location.state?.pricing_data || null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!authAPI.isAuthenticated()) {
      sessionStorage.setItem('returnUrl', `/booking/${id}`);
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Enforce email verification
    const user = authAPI.getCurrentUser();
    if (user && user.email_verified === false) {
      alert('Please verify your email before making a booking. Check your inbox for the verification link.');
      navigate('/profile');
      return;
    }

    if (!id) {
      navigate("/packages");
      return;
    }

    const fetchPackage = async () => {
      try {
        setLoading(true);
        setError(null);

        // @VALIDATION: Enforce strict UUID format check for package identifiers
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          console.warn(`⚠️ Invalid package ID format: ${id}. This might be a booking or session ID.`);
          
          // If it's numeric, it's likely a booking ID
          if (/^\d+$/.test(id)) {
             setError("This link appears to be for an existing booking. Please visit your dashboard to manage your bookings.");
          } else {
             setError("Invalid package link. Please select a tour from our packages list.");
          }
          setLoading(false);
          return;
        }

        // @API_CALL: Fetch tour package metadata for booking context
        const data = await packageAPI.getById(id);
        setPackageData(data);
      } catch (err) {
        // @ERROR_HANDLING: Persistent failure or invalid package reference
        console.error("Error fetching package:", err);
        setError("We couldn't find the tour package you're looking for. It may have been removed or the link might be broken.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, navigate]);


  // Recalculate price when inputs change
  useEffect(() => {
    if (!packageData || !travelDate) return;

    // Use a debounce or simple check to avoid excessive calls
    const getPrice = async () => {
      setCalculating(true);
      try {
        const res = await packageAPI.calculatePrice(id, travelDate, adults, children);
        if (res.success) {
          setCalculatedPrice(res.pricing);
        }
      } catch (e) {
        console.error("Price calc error", e);
      } finally {
        setCalculating(false);
      }
    };

    const timer = setTimeout(getPrice, 500);
    return () => clearTimeout(timer);
  }, [id, packageData, travelDate, adults, children]); // roomType doesn't affect price currently, but could

  const handleContinue = (e) => {
    e.preventDefault();

    if (!travelDate) {
      alert("Please select a travel date");
      return;
    }

    // Validate date is in future
    const selectedDate = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Please select a future date");
      return;
    }

    // Store booking data in sessionStorage for next steps
    // We use sessionStorage to persist across the multi-step flow
    // location.state is also passed for immediate transition
    const bookingData = {
      package_id: packageData.package_id,
      package_name: packageData.name, // useful for UI
      travel_date: travelDate,
      adults: parseInt(adults),
      children: parseInt(children),
      room_type: roomType,
      special_requests: specialRequests,
      pricing_data: calculatedPrice,
      total_price: calculatedPrice ? calculatedPrice.totalPrice : 0
    };

    sessionStorage.setItem('booking_step1', JSON.stringify(bookingData));

    // Navigate to Step 2: Traveller Info
    navigate(`/booking/${id}/travellers`);
  };

  if (loading) {
    return (
      <div className="booking-start-container">
        <div className="loading-container">Loading package details...</div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="booking-start-container">
        <div className="error-container">
          <h2>{error || "Package not found"}</h2>
          <button onClick={() => navigate("/packages")} className="btn-secondary">
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-start-container">
      <div className="booking-start-content">
        <h1>Booking Details</h1>

        <div className="package-summary">
          <img
            src={packageData.image_url || packageData.image}
            alt={packageData.name}
            className="package-image"
          />
          <div className="package-info">
            <h2>{packageData.name}</h2>
            <p className="package-duration">⏱️ {packageData.duration}</p>
            <p className="package-duration">📍 {packageData.category} | {packageData.budget} budget</p>
          </div>
        </div>

        <form onSubmit={handleContinue} className="booking-form">

          <div className="form-group">
            <label htmlFor="travelDate">Travel Start Date</label>
            <input
              type="date"
              id="travelDate"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="adults">Adults (16+ yrs)</label>
              <input
                type="number"
                id="adults"
                value={adults}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty string for better typing experience
                  if (val === "") {
                    setAdults("");
                    return;
                  }
                  const num = parseInt(val);
                  setAdults(isNaN(num) ? 1 : num);
                }}
                onBlur={() => {
                  // Ensure minimum of 1 on blur
                  if (adults === "" || adults < 1) setAdults(1);
                }}
                min="1"
                max="20"
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="children">Children (Under 16)</label>
              <input
                type="number"
                id="children"
                value={children}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setChildren("");
                    return;
                  }
                  const num = parseInt(val);
                  setChildren(isNaN(num) ? 0 : num);
                }}
                onBlur={() => {
                  if (children === "" || children < 0) setChildren(0);
                }}
                min="0"
                max="10"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <span className="input-hint">50% discount applies</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roomType">Room Preference</label>
            <select
              id="roomType"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="single">Single Room</option>
              <option value="double">Double Room (Standard)</option>
              <option value="family">Family Room</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests (Optional)</label>
            <textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Dietary restrictions, flight details, or any other requests..."
            />
          </div>

          {/* Pricing Summary */}
          {calculatedPrice && (
            <div className="price-summary">
              <div className="price-row">
                <span>Adults ({adults} × ${calculatedPrice.adultPrice / adults}):</span>
                <span>${calculatedPrice.adultPrice}</span>
              </div>
              {children > 0 && (
                <div className="price-row">
                  <span>Children ({children} × ${calculatedPrice.childPrice / children}):</span>
                  <span>${calculatedPrice.childPrice}</span>
                </div>
              )}

              {calculatedPrice.seasonLabel && calculatedPrice.seasonLabel !== 'Standard' && (
                <div className="price-row">
                  <span>Season Adjustment:</span>
                  <span className="season-badge">{calculatedPrice.seasonLabel}</span>
                </div>
              )}

              <div className="price-row total">
                <span>Total Amount:</span>
                <span>
                  {calculating ? "Calculating..." : `$${calculatedPrice.totalPrice.toLocaleString()}`}
                </span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/packages/${id}`)}
              className="btn-secondary"
            >
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={!travelDate || calculating}>
              Continue to Traveller Info →
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BookingStartPage;
