/**
 * 🎯 I GO LANKA TOURS - User Dashboard
 * 
 * Central hub for registered travelers. Displays personalized statistics, 
 * recent bookings, and AI-generated custom tours. Orchestrates cross-domain 
 * data fetching (profile, classics, custom).
 * 
 * @module UserDashboard
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../services/api";
import { Activity, Map, CheckCircle2, Navigation, ArrowRight, Heart } from "lucide-react";
import "./UserDashboard.css";

/**
 * UserDashboard Component
 * 
 * Aggregates user activity metrics and provides quick access to past and upcoming tours.
 * 
 * @returns {JSX.Element}
 */
const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalCustomTours: 0
  });
  const [recentCustomTours, setRecentCustomTours] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Traveler");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch Profile for Hero Banner Welcome
      try {
        // @API_CALL: Retrieve basic profile info for dashboard localization
        const profileData = await userAPI.getProfile(token);
        if (profileData.profile) {
          const { first_name, full_name } = profileData.profile;
          setUserName(first_name || full_name?.split(' ')[0] || "Traveler");
        }
      } catch (e) {
        // @ERROR_HANDLING: Silently handle profile fetch failure (dashboard remains functional)
        console.error("Profile load error", e);
      }

      // Fetch Bookings Data
      // @API_CALL: Retrieve travel history for metric aggregation
      const data = await userAPI.getBookings(token);
      if (data.bookings) {
        const bookings = data.bookings;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = bookings.filter(
          (b) => new Date(b.travel_date) > today && b.status !== "cancelled"
        ).length;

        const completed = bookings.filter(
          (b) => b.status === "completed"
        ).length;

        setStats({
          totalBookings: bookings.length,
          upcomingBookings: upcoming,
          completedBookings: completed
        });

        setRecentBookings(bookings.slice(0, 3));
      }

      // Fetch Custom Tours Data
      // @API_CALL: Retrieve AI-generated custom tours for visual feed
      const customData = await userAPI.getCustomTours(token);
      if (customData.customTours) {
        const customTours = customData.customTours;
        setStats(prev => ({
          ...prev,
          totalCustomTours: customTours.length
        }));
        setRecentCustomTours(customTours.slice(0, 2));
      }
    } catch (err) {
      // @ERROR_HANDLING: Aggregate handling for data retrieval failures
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-loading-pulse">
          <div className="pulse-circle"></div>
          <p>Preparing your itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper blur-in">

      {/* Hero Welcome Banner */}
      <section className="dashboard-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Ayubowan, {userName}!</h1>
          <p>Ready for your next unforgettable Sri Lankan adventure?</p>
          <div className="hero-actions">
            <Link to="/packages" className="btn btn-primary">
              <Map size={18} /> Discover Tours
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Glassmorphism Grid */}
      <section className="dashboard-stats fade-up">
        <div className="stat-card luxury-card">
          <div className="stat-icon-wrapper blue-glow">
            <Activity size={28} />
          </div>
          <div className="stat-data">
            <span className="stat-value counter-animate">{stats.totalBookings}</span>
            <span className="stat-label">Total Journeys</span>
          </div>
        </div>

        <div className="stat-card luxury-card">
          <div className="stat-icon-wrapper amber-glow">
            <Navigation size={28} />
          </div>
          <div className="stat-data">
            <span className="stat-value counter-animate">{stats.upcomingBookings}</span>
            <span className="stat-label">Upcoming Travels</span>
          </div>
        </div>

        <div className="stat-card luxury-card">
          <div className="stat-icon-wrapper green-glow">
            <CheckCircle2 size={28} />
          </div>
          <div className="stat-data">
            <span className="stat-value counter-animate">{stats.completedBookings}</span>
            <span className="stat-label">Memories Made</span>
          </div>
        </div>

        <Link to="/dashboard/custom-tours" className="stat-card luxury-card clickable-stat">
          <div className="stat-icon-wrapper purple-glow">
            <Activity size={28} />
          </div>
          <div className="stat-data">
            <span className="stat-value counter-animate">{stats.totalCustomTours}</span>
            <span className="stat-label">AI Custom Tours</span>
          </div>
        </Link>
      </section>

      {/* Split Content Area */}
      <div className="dashboard-split-content">
        <div className="main-activity-column">
          {/* Recent AI Custom Tours */}
          {recentCustomTours.length > 0 && (
            <section className="recent-activity fade-up" style={{ marginBottom: "2.5rem" }}>
              <div className="section-title-row">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={20} className="glow-icon-purple" />
                  <h2>AI Custom Tours</h2>
                </div>
                <Link to="/dashboard/custom-tours" className="link-arrow">
                  My Custom Itineraries <ArrowRight size={16} />
                </Link>
              </div>

              <div className="activity-feed">
                {recentCustomTours.map((tour) => (
                  <Link
                    key={tour.session_id}
                    to="/dashboard/custom-tours"
                    className="activity-item luxury-card"
                    style={{ borderLeft: "4px solid #8b5cf6" }}
                  >
                    <div className="activity-details" style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h4>{tour.title || "Custom AI Design"}</h4>
                        <span className={`status-pill status-${tour.status.toLowerCase()}`}>
                          {tour.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-date">
                          Created {new Date(tour.created_at).toLocaleDateString()}
                        </span>
                        <span className="dot-separator">•</span>
                        <span>{tour.duration_days} Days</span>
                        {tour.admin_final_price && (
                          <>
                            <span className="dot-separator">•</span>
                            <span style={{ color: "#10b981", fontWeight: "700" }}>Price: ${tour.admin_final_price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Bookings Feed (Classic) */}
          <section className="recent-activity fade-up animation-delay-1">
            <div className="section-title-row">
              <h2>Recent Activity</h2>
              <Link to="/dashboard/bookings" className="link-arrow">
                See all activity <ArrowRight size={16} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="empty-state-card luxury-card">
                <div className="empty-icon-ring">
                  <Map size={32} />
                </div>
                <h3>Your Passport is Empty</h3>
                <p>Start exploring beautiful destinations and book your first tour with us.</p>
                <Link to="/packages" className="btn btn-secondary">Explore Packages</Link>
              </div>
            ) : (
              <div className="activity-feed">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.booking_id}
                    to={`/dashboard/bookings/${booking.booking_id}`}
                    className="activity-item luxury-card"
                  >
                    <div className="activity-img-cropper">
                      <img
                        src={booking.image || "https://images.unsplash.com/photo-1588392382834-a891154bca4d?q=80&w=600"}
                        alt={booking.package_name}
                      />
                    </div>
                    <div className="activity-details">
                      <h4>{booking.package_name}</h4>
                      <div className="activity-meta">
                        <span className="activity-date">
                          {new Date(booking.travel_date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="dot-separator">•</span>
                        <span className={`status-pill status-${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Concierge Side Panel */}
        <aside className="inspiration-panel fade-up animation-delay-2">
          <div className="concierge-card luxury-card">
            <div className="concierge-header">
              <Heart className="heart-icon" size={24} />
              <h3>Looking for inspiration?</h3>
            </div>
            <p>Explore our trending Sri Lankan destinations and highly-rated signature packages curated just for you.</p>
            <Link to="/destinations" className="btn btn-outline">View Destinations</Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserDashboard;
