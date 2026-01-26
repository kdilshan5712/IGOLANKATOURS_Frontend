import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, User, AlertCircle } from "lucide-react";
import { guideAPI } from "../../services/api";
import NotificationBell from "../../components/NotificationBell";
import "./GuideDashboard.css";

const GuideDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, ongoing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }

    // Fetch dashboard data from backend
    const fetchDashboard = async () => {
      try {
        // Fetch guide profile and assigned tours in parallel
        const [dashboardResponse, toursResponse] = await Promise.all([
          guideAPI.getDashboard(token),
          guideAPI.getMyTours(token)
        ]);
        
        if (dashboardResponse.success && dashboardResponse.dashboard) {
          setUser({
            name: dashboardResponse.dashboard.full_name || "Guide",
            role: userRole,
            tours: dashboardResponse.dashboard.active_tours_count || 0,
            availability: dashboardResponse.dashboard.availability_set ? "Set" : "Not Set",
            rating: dashboardResponse.dashboard.rating || 4.5
          });
        } else {
          setError(dashboardResponse.message || "Failed to load dashboard");
        }

        if (toursResponse.success) {
          const categorized = toursResponse.categorized || {};
          setTours(toursResponse.bookings || []);
          setStats({
            upcoming: categorized.counts?.upcoming || 0,
            ongoing: categorized.counts?.ongoing || 0,
            completed: categorized.counts?.completed || 0
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("An error occurred while loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="guide-dashboard-page">
        <div className="guide-dashboard-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guide-dashboard-page">
        <div className="guide-dashboard-error">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-dashboard-page">
      <div className="guide-dashboard-header">
        <div>
          <h1 className="guide-dashboard-title">Welcome, {user?.name}! 👋</h1>
          <p className="guide-dashboard-subtitle">Manage your tours and availability</p>
        </div>
        <NotificationBell token={localStorage.getItem("token")} />
      </div>

      {/* Summary Cards */}
      <div className="guide-dashboard-grid">
        <div className="guide-dashboard-card">
          <div className="guide-dashboard-card-icon tours-icon">
            <MapPin size={24} />
          </div>
          <h3 className="guide-dashboard-card-title">Upcoming Tours</h3>
          <p className="guide-dashboard-card-value">{stats.upcoming}</p>
          <p className="guide-dashboard-card-text">
            {stats.upcoming === 0 ? "No tours scheduled" : `${stats.upcoming} tour${stats.upcoming > 1 ? 's' : ''} ahead`}
          </p>
        </div>

        <div className="guide-dashboard-card">
          <div className="guide-dashboard-card-icon availability-icon">
            <Calendar size={24} />
          </div>
          <h3 className="guide-dashboard-card-title">Ongoing Tours</h3>
          <p className="guide-dashboard-card-value">{stats.ongoing}</p>
          <p className="guide-dashboard-card-text">
            {stats.ongoing === 0 ? "No active tours" : `${stats.ongoing} active tour${stats.ongoing > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="guide-dashboard-card">
          <div className="guide-dashboard-card-icon rating-icon">
            <User size={24} />
          </div>
          <h3 className="guide-dashboard-card-title">Completed Tours</h3>
          <p className="guide-dashboard-card-value">{stats.completed}</p>
          <p className="guide-dashboard-card-text">
            {stats.completed === 0 ? "Start your first tour" : `${stats.completed} tour${stats.completed > 1 ? 's' : ''} completed`}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="guide-dashboard-section">
        <h2 className="guide-dashboard-section-title">Quick Actions</h2>
        <div className="guide-dashboard-actions">
          <Link to="/guide/bookings" className="guide-dashboard-action-btn">
            View Tours
          </Link>
          <Link to="/guide/availability" className="guide-dashboard-action-btn">
            Set Availability
          </Link>
          <Link to="/guide/profile" className="guide-dashboard-action-btn">
            View Profile
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="guide-dashboard-section">
        <h2 className="guide-dashboard-section-title">My Assigned Tours</h2>
        <div className="guide-dashboard-activity">
          {tours.length === 0 ? (
            <p className="guide-dashboard-activity-empty">
              No tours assigned yet. Check back later for new assignments!
            </p>
          ) : (
            <div className="tours-list">
              {tours.slice(0, 5).map((tour) => (
                <div key={tour.booking_id} className="tour-item">
                  <div className="tour-item-header">
                    <h4>{tour.package_name}</h4>
                    <span className={`status-badge status-${tour.status}`}>
                      {tour.status}
                    </span>
                  </div>
                  <div className="tour-item-details">
                    <p><strong>Tourist:</strong> {tour.tourist_name || tour.tourist_email}</p>
                    <p><strong>Travel Date:</strong> {new Date(tour.travel_date).toLocaleDateString()}</p>
                    <p><strong>Travelers:</strong> {tour.travelers}</p>
                    {tour.special_requests && (
                      <p><strong>Special Requests:</strong> {tour.special_requests}</p>
                    )}
                  </div>
                </div>
              ))}
              {tours.length > 5 && (
                <Link to="/guide/bookings" className="view-all-link">
                  View all {tours.length} tours →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideDashboardPage;
