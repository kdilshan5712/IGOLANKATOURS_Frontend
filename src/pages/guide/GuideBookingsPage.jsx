import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, AlertCircle, Eye, Download } from "lucide-react";
import { guideAPI } from "../../services/api";
import "./GuideBookings.css";

const GuideBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await guideAPI.getBookings(token);
      
      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        setError("Failed to load bookings");
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInProgress = async (bookingId) => {
    const token = localStorage.getItem("token");
    const response = await guideAPI.updateBookingStatus(bookingId, "in_progress", token);
    
    if (response.success) {
      fetchBookings(); // Refresh bookings
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    const token = localStorage.getItem("token");
    const response = await guideAPI.updateBookingStatus(bookingId, "completed", token);
    
    if (response.success) {
      fetchBookings(); // Refresh bookings
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const token = localStorage.getItem("token");
      const response = await guideAPI.updateBookingStatus(bookingId, "cancelled", token);
      
      if (response.success) {
        fetchBookings(); // Refresh bookings
      }
    }
  };

  const handleViewItinerary = (booking) => {
    // UI-only: Show itinerary details (backend integration pending)
    alert(`Itinerary for ${booking.title}\n\nLocation: ${booking.location}\nDate: ${booking.date}\nTime: ${booking.time}\n\nFull itinerary details will be loaded from backend.`);
  };

  const handleDownloadItinerary = (booking) => {
    // UI-only: Download PDF placeholder (backend integration pending)
    alert(`Downloading PDF itinerary for:\n${booking.title}\n\nPDF generation will be handled by backend.`);
  };

  // Filter bookings by status
  const filteredBookings = statusFilter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  if (loading) {
    return (
      <main className="guide-bookings-page">
        <div className="guide-bookings-loading">Loading...</div>
      </main>
    );
  }

  return (
    <main className="guide-bookings-page">
      <div className="guide-bookings-container">
        <div className="guide-bookings-header">
          <h1 className="guide-bookings-title">My Tours</h1>
          <p className="guide-bookings-subtitle">Manage your upcoming and past tours</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="guide-bookings-filters">
          <button 
            onClick={() => setStatusFilter("all")}
            className={`guide-filter-tab ${statusFilter === "all" ? "active" : ""}`}
          >
            All Tours
          </button>
          <button 
            onClick={() => setStatusFilter("assigned")}
            className={`guide-filter-tab ${statusFilter === "assigned" ? "active" : ""}`}
          >
            Assigned
          </button>
          <button 
            onClick={() => setStatusFilter("confirmed")}
            className={`guide-filter-tab ${statusFilter === "confirmed" ? "active" : ""}`}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setStatusFilter("completed")}
            className={`guide-filter-tab ${statusFilter === "completed" ? "active" : ""}`}
          >
            Completed
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="guide-bookings-empty">
            <MapPin size={48} />
            <h2>No Tours Assigned Yet</h2>
            <p>You don't have any assigned tour bookings yet. Wait for the admin to assign tours to you.</p>
          </div>
        ) : (
          <div className="guide-bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.booking_id} className="guide-booking-card">
                <div className="guide-booking-card-header">
                  <h3 className="guide-booking-title">{booking.package_name}</h3>
                  <span className={`guide-booking-status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="guide-booking-details">
                  <div className="guide-booking-detail-item">
                    <MapPin size={16} />
                    <span>{booking.category || "Sri Lanka Tour"}</span>
                  </div>
                  <div className="guide-booking-detail-item">
                    <Calendar size={16} />
                    <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
                  </div>
                  <div className="guide-booking-detail-item">
                    <Clock size={16} />
                    <span>{booking.duration || "Full Day"}</span>
                  </div>
                </div>

                <div className="tourist-info-section">
                  <h4>Tourist Information:</h4>
                  <p><strong>Name:</strong> {booking.tourist_name || "N/A"}</p>
                  <p><strong>Email:</strong> {booking.tourist_email}</p>
                  {booking.tourist_phone && <p><strong>Phone:</strong> {booking.tourist_phone}</p>}
                  <p><strong>Travelers:</strong> {booking.travelers}</p>
                </div>

                <div className="guide-booking-actions">
                  {booking.status === "assigned" && (
                    <>
                      <button 
                        onClick={() => handleMarkInProgress(booking.booking_id)}
                        className="guide-booking-action-btn accept-btn"
                      >
                        Accept & Start
                      </button>
                      <button 
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        className="guide-booking-action-btn cancel-btn"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === "in_progress" && (
                    <button 
                      onClick={() => handleMarkCompleted(booking.booking_id)}
                      className="guide-booking-action-btn complete-btn"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {booking.status === "completed" && (
                    <span className="guide-booking-completed">✓ Completed</span>
                  )}
                  
                  {/* Itinerary Actions - Available for all bookings */}
                  <div className="guide-booking-itinerary-actions">
                    <button 
                      onClick={() => handleViewItinerary(booking)}
                      className="guide-booking-action-btn view-btn"
                      title="View Itinerary"
                    >
                      <Eye size={16} />
                      View Itinerary
                    </button>
                    <button 
                      onClick={() => handleDownloadItinerary(booking)}
                      className="guide-booking-action-btn download-btn"
                      title="Download PDF"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default GuideBookingsPage;
