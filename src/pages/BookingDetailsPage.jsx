import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { packageAPI } from "../services/api";
import { useBooking } from "../contexts/BookingContext";
import "./BookingDetailsPage.css";

const BookingDetailsPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();

  const [travelDate, setTravelDate] = useState(bookingData.travelDate || "");
  const [numberOfTravelers, setNumberOfTravelers] = useState(bookingData.numberOfTravelers || 1);
  const [packageData, setPackageData] = useState(bookingData.packageData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      // Validate packageId first
      if (!packageId || packageId === 'undefined' || packageId === 'null') {
        setError('No package selected');
        setLoading(false);
        // Redirect after short delay
        setTimeout(() => navigate('/packages'), 2000);
        return;
      }
      
      try {
        setLoading(true);
        const data = await packageAPI.getById(packageId);
        
        // Ensure we have valid package data
        if (!data || !data.id) {
          throw new Error('Invalid package data received');
        }
        
        setPackageData(data);
        setError(null);
      } catch (err) {
        console.error('[BookingDetails] Error fetching package:', err);
        
        if (err.message.includes('not found')) {
          setError('Package not found. It may have been removed.');
        } else if (err.message.includes('Invalid package ID')) {
          setError('Invalid package. Please select a package from the packages page.');
        } else {
          setError(err.message || 'Failed to load package details');
        }
        
        // Redirect to packages page after 3 seconds
        setTimeout(() => navigate('/packages'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, navigate]);

  const totalPrice = packageData ? packageData.price * numberOfTravelers : 0;

  const handleContinue = () => {
    if (!travelDate) {
      alert("Please select a travel date");
      return;
    }

    if (!packageData || !packageData.id) {
      alert("Package data is not available. Please try again.");
      return;
    }

    // Update booking context with consistent IDs
    updateBookingData({
      packageId: packageData.id,
      packageData: {
        ...packageData,
        id: packageData.id,
        package_id: packageData.package_id || packageData.id
      },
      travelDate,
      numberOfTravelers,
      totalAmount: totalPrice
    });

    navigate(`/booking/${packageData.id}/travellers`);
  };

  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-container">
          <div className="booking-loading">
            <p>Loading package details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !packageData) {
    return (
      <main className="booking-page">
        <div className="booking-container">
          <div className="booking-error">
            <h2>Unable to Load Package</h2>
            <p>{error || 'Package not found'}</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              Redirecting to packages page...
            </p>
            <button onClick={() => navigate('/packages')} style={{ marginTop: '16px' }}>
              Go to Packages Now
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="booking-title">Book Your Tour</h1>
          <div className="booking-steps">
            <div className="booking-step active">1. Details</div>
            <div className="booking-step">2. Travellers</div>
            <div className="booking-step">3. Payment</div>
            <div className="booking-step">4. Confirmation</div>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-form-section">
            <div className="booking-form-card">
              <h2 className="booking-form-title">Travel Details</h2>

              <div className="booking-form-group">
                <label className="booking-label">
                  <Calendar size={18} />
                  <span>Travel Date</span>
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="booking-input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="booking-form-group">
                <label className="booking-label">
                  <Users size={18} />
                  <span>Number of Travelers</span>
                </label>
                <input
                  type="number"
                  value={numberOfTravelers}
                  onChange={(e) =>
                    setNumberOfTravelers(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="booking-input"
                  min="1"
                  max="20"
                />
              </div>

              <button onClick={handleContinue} className="booking-continue-btn">
                <span>Continue to Traveller Information</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="booking-summary-section">
            <div className="booking-summary-card">
              <h3 className="booking-summary-title">Package Summary</h3>
              <div className="booking-summary-image">
                <img src={packageData.image} alt={packageData.name} />
              </div>
              <h4 className="booking-summary-package-name">
                {packageData.name}
              </h4>
              <p className="booking-summary-duration">{packageData.duration}</p>

              <div className="booking-summary-divider"></div>

              <div className="booking-summary-row">
                <span>Price per person</span>
                <span className="booking-summary-amount">
                  ${packageData.price}
                </span>
              </div>

              <div className="booking-summary-row">
                <span>Number of travelers</span>
                <span className="booking-summary-amount">{numberOfTravelers}</span>
              </div>

              <div className="booking-summary-divider"></div>

              <div className="booking-summary-row booking-summary-total">
                <span>Total Amount</span>
                <span className="booking-summary-amount">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingDetailsPage;
