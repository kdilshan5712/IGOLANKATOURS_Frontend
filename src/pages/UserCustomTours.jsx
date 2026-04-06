import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Calendar, Users, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader } from "lucide-react";
import { userAPI, bookingAPI } from "../services/api";
import "./UserCustomTours.css";

const UserCustomTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomTours();
  }, []);

  const fetchCustomTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not logged in. Please log in to view custom tours.");
        setLoading(false);
        return;
      }
      
      const data = await userAPI.getCustomTours(token);

      if (data.customTours) {
        setTours(data.customTours);
      } else {
        setError(data.message || "Failed to load custom tours");
      }
    } catch (err) {
      console.error("Error fetching custom tours:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTour = async (sessionId) => {
    setProcessingId(sessionId);
    try {
      const token = localStorage.getItem("token");
      const res = await bookingAPI.acceptCustomTour(sessionId, token);
      
      if (res.success && res.booking) {
        // Redirect to the payment page for this specific newly created booking
        navigate(`/booking/${res.booking.package_id}/payment`, { 
          state: { 
            booking: res.booking, 
            isDirect: true 
          } 
        });
      } else {
        alert(res.message || "Failed to initiate booking. Please try again.");
      }
    } catch (err) {
      console.error("Error in handleAcceptTour:", err);
      alert("A network error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusDisplay = (status) => {
    const displays = {
      draft: "Draft",
      pending_approval: "Awaiting Review",
      under_review: "Under Review",
      needs_changes: "Needs Changes",
      approved: "Approved - Ready to Book!",
      rejected: "Rejected"
    };
    return displays[status] || status;
  };

  if (loading) {
    return (
      <div className="custom-tours-container">
        <div className="loading-spinner" style={{ textAlign: "center", padding: "3rem" }}>Loading your custom itineraries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-tours-container">
        <div className="error-message" style={{ color: "red", textAlign: "center", padding: "2rem" }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="custom-tours-container">
      <div className="custom-tours-header">
        <h1>My Custom Tours</h1>
        <p>Track your AI-generated requests, team approvals, and final itineraries.</p>
      </div>

      {tours.length === 0 ? (
        <div className="empty-state">
          <Sparkles className="empty-icon" style={{ color: "#3b82f6" }} />
          <h3>No Custom Tours Yet</h3>
          <p>Let our AI Travel Designer craft the perfect personalized itinerary for you.</p>
          <Link to="/custom-tour-chat" className="explore-btn">
            Create Custom Tour
          </Link>
        </div>
      ) : (
        <div className="tours-grid">
          {tours.map((tour) => (
            <div key={tour.session_id} className="tour-card">
              <div className="tour-header">
                <h3 className="tour-title">{tour.title || "Custom AI Iterinary"}</h3>
                <span className={`status-badge status-${tour.status}`}>
                  {getStatusDisplay(tour.status)}
                </span>
              </div>

              <div className="tour-details">
                <div className="tour-info-grid">
                  <div className="info-item">
                    <Clock size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Duration</span>
                      <div className="info-value">{tour.duration_days} Days</div>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <Calendar size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Travel Date</span>
                      <div className="info-value">{tour.travel_month || "Flexible"}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <Users size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Travelers</span>
                      <div className="info-value">{tour.traveler_count || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <DollarSign size={16} className="info-icon" />
                    <div>
                      <span className="info-label">Original Budget</span>
                      <div className="info-value">
                        {tour.estimated_price_max ? `$${tour.estimated_price_max}` : "Flexible"}
                      </div>
                    </div>
                  </div>
                </div>

                {tour.status === 'approved' && tour.admin_final_price && (
                  <div className="admin-notes-section approved-offer">
                    <div className="offer-header">
                       <CheckCircle2 size={18} className="text-success" />
                       <span className="offer-label">Special Offer for You</span>
                    </div>
                    <div className="offer-price">
                       <span className="price-currency">$</span>
                       <span className="price-value">{tour.admin_final_price}</span>
                       <span className="price-tag">Final All-Inclusive Price</span>
                    </div>
                  </div>
                )}

                {tour.special_notes && (
                  <div className="admin-message-bubble">
                    <span className="bubble-label">Message from IGOLANKA Expert:</span>
                    <p className="bubble-text">"{tour.special_notes}"</p>
                  </div>
                )}

                {tour.rejection_reason && tour.status === 'rejected' && (
                  <div className="rejection-section">
                    <span className="section-title"><XCircle size={14} style={{ display: 'inline', marginRight: '5px' }}/> Reason for Rejection:</span>
                    {tour.rejection_reason}
                  </div>
                )}

              </div>

              <div className="tour-footer">
                <span className="date-submitted">
                  Submitted on {new Date(tour.created_at).toLocaleDateString()}
                </span>
                
                {tour.status === 'approved' && (
                  <button 
                    className="btn btn-primary"
                    disabled={processingId === tour.session_id}
                    onClick={() => handleAcceptTour(tour.session_id)}
                    style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '6px', 
                      border: 'none', 
                      cursor: processingId === tour.session_id ? 'not-allowed' : 'pointer', 
                      fontWeight: 'bold',
                      opacity: processingId === tour.session_id ? 0.7 : 1
                    }}
                  >
                    {processingId === tour.session_id ? (
                      <><Loader size={14} className="spinner mr-2" /> Processing...</>
                    ) : (
                      <><DollarSign size={14} style={{ display: 'inline', marginRight: '3px' }}/> Accept & Pay</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCustomTours;
