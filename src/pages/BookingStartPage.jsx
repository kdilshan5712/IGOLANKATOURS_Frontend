import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { packageAPI, authAPI } from "../services/api";
import "./BookingStartPage.css";

const BookingStartPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(1);

  useEffect(() => {
    // Check if user is logged in
    if (!authAPI.isAuthenticated()) {
      sessionStorage.setItem('returnUrl', `/booking/${id}`);
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

    if (!id) {
      navigate("/packages");
      return;
    }

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

  const handleContinue = (e) => {
    e.preventDefault();

    if (!travelDate || !travelers) {
      alert("Please fill in all fields");
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

    // Store booking data in sessionStorage for refresh safety
    sessionStorage.setItem('bookingData', JSON.stringify({
      package_id: packageData.package_id,
      travel_date: travelDate,
      travelers: travelers,
      total_price: packageData.price * travelers
    }));

    navigate(`/booking/${id}/payment`);
  };

  if (loading) {
    return (
      <div className="booking-start-container">
        <div className="loading">Loading package details...</div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="booking-start-container">
        <div className="error-message">{error || "Package not found"}</div>
        <button onClick={() => navigate("/packages")} className="back-button">
          Back to Packages
        </button>
      </div>
    );
  }

  const totalPrice = packageData.price * travelers;
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-start-container">
      <div className="booking-start-content">
        <h1>Book Your Tour</h1>

        <div className="package-summary">
          <img 
            src={packageData.image_url || packageData.image} 
            alt={packageData.name}
            className="package-image"
          />
          <div className="package-info">
            <h2>{packageData.name}</h2>
            <p className="package-duration">{packageData.duration}</p>
            <p className="package-price">${packageData.price} per person</p>
          </div>
        </div>

        <form onSubmit={handleContinue} className="booking-form">
          <div className="form-group">
            <label htmlFor="travelDate">Travel Date</label>
            <input
              type="date"
              id="travelDate"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="travelers">Number of Travelers</label>
            <input
              type="number"
              id="travelers"
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
              required
            />
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Price per person:</span>
              <span>${packageData.price}</span>
            </div>
            <div className="price-row">
              <span>Number of travelers:</span>
              <span>{travelers}</span>
            </div>
            <div className="price-row total">
              <span>Total Price:</span>
              <span>${totalPrice}</span>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/packages/${id}`)} 
              className="btn-secondary"
            >
              Back
            </button>
            <button type="submit" className="btn-primary">
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingStartPage;
