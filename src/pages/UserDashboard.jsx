import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../services/api";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 [UserDashboard] Token exists:", !!token);
      
      if (!token) {
        console.error("❌ [UserDashboard] No token found");
        setLoading(false);
        return;
      }
      
      console.log("📡 [UserDashboard] Calling userAPI.getBookings...");
      const data = await userAPI.getBookings(token);
      console.log("📦 [UserDashboard] API Response:", data);
      console.log("📦 [UserDashboard] Has bookings:", 'bookings' in data);

      if (data.bookings) {
        const bookings = data.bookings;
        console.log("✅ [UserDashboard] Bookings count:", bookings.length);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = bookings.filter(
          (b) =>
            new Date(b.travel_date) > today && b.status !== "cancelled"
        ).length;

        const completed = bookings.filter(
          (b) => b.status === "completed"
        ).length;

        console.log("📊 [UserDashboard] Stats - Total:", bookings.length, "Upcoming:", upcoming, "Completed:", completed);

        setStats({
          totalBookings: bookings.length,
          upcomingBookings: upcoming,
          completedBookings: completed
        });

        // Get 3 most recent bookings
        setRecentBookings(bookings.slice(0, 3));
      } else {
        console.error("❌ [UserDashboard] No bookings property in response");
      }
    } catch (err) {
      console.error("💥 [UserDashboard] Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your bookings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalBookings}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.upcomingBookings}</span>
            <span className="stat-label">Upcoming Tours</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.completedBookings}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="recent-bookings-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <Link to="/dashboard/bookings" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-bookings">
            <p>No bookings yet</p>
            <Link to="/packages" className="explore-link">
              Explore Tours
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {recentBookings.map((booking) => (
              <Link
                key={booking.booking_id}
                to={`/dashboard/bookings/${booking.booking_id}`}
                className="booking-item"
              >
                <img
                  src={booking.image || "/placeholder-tour.jpg"}
                  alt={booking.package_name}
                  className="booking-thumbnail"
                />
                <div className="booking-info">
                  <h3>{booking.package_name}</h3>
                  <p className="booking-date">
                    {new Date(booking.travel_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <span className={`booking-status status-${booking.status}`}>
                  {booking.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
