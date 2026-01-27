import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import NotificationBell from "../../components/NotificationBell";
import AssignGuideModal from "../../components/admin/AssignGuideModal";
import "./AdminDashboard.css";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Guide Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Analytical Report states
  const [reportType, setReportType] = useState("booking");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportMessageType, setReportMessageType] = useState("");

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // success, error, warning
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Dashboard: Fetching data with token:", token ? "Present" : "Missing");
      
      const [statsResult, bookingsResult] = await Promise.all([
        adminAPI.getDashboardStats(token),
        adminAPI.getRecentBookings(token)
      ]);

      console.log("📊 Stats Result:", statsResult);
      console.log("📅 Bookings Result:", bookingsResult);

      if (statsResult.success) {
        setStats(statsResult.stats);
        console.log("✅ Stats set:", statsResult.stats);
      } else {
        console.error("❌ Stats fetch failed:", statsResult.message);
      }

      if (bookingsResult.success) {
        setRecentBookings(bookingsResult.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    // Validation
    if (!dateFrom || !dateTo) {
      setReportMessage("Please select both start and end dates");
      setReportMessageType("error");
      setTimeout(() => setReportMessage(""), 3000);
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      setReportMessage("Start date cannot be after end date");
      setReportMessageType("error");
      setTimeout(() => setReportMessage(""), 3000);
      return;
    }

    setGeneratingReport(true);
    setReportMessage("");

    try {
      // UI-only: Simulate report generation (backend will handle actual generation)
      await new Promise(resolve => setTimeout(resolve, 2000));

      setReportGenerated(true);
      setReportMessage(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
      setReportMessageType("success");
      
      console.log("📊 Report generated:", {
        type: reportType,
        format: reportFormat,
        dateRange: { from: dateFrom, to: dateTo }
      });
    } catch (error) {
      console.error("Error generating report:", error);
      setReportMessage("Failed to generate report. Please try again.");
      setReportMessageType("error");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    // UI-only: Simulate download (backend will provide actual file)
    const reportName = `${reportType}_report_${dateFrom}_to_${dateTo}.${reportFormat}`;
    
    setReportMessage(`Downloading ${reportName}...`);
    setReportMessageType("success");
    
    // Reset after download simulation
    setTimeout(() => {
      setReportMessage("");
      setReportGenerated(false);
    }, 2000);

    console.log("⬇️ Downloading report:", reportName);
    setNotificationMessage(`Report "${reportName}" is being generated. It will be downloaded shortly.`);
    setNotificationType("success");
    setShowNotification(true);
  };

  const openAssignModal = (booking) => {
    setSelectedBooking(booking);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedBooking(null);
  };

  const handleAssignGuide = async (bookingId, guideId, adminNotes) => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.assignGuideToBooking(bookingId, guideId, token, adminNotes);
      
      if (result.success) {
        setNotificationMessage("Tour guide assigned successfully! The guide has been notified.");
        setNotificationType("success");
        setShowNotification(true);
        closeAssignModal();
        setTimeout(() => fetchDashboardData(), 1500);
        return true;
      } else {
        setNotificationMessage(result.message || "Failed to assign guide. Please try again.");
        setNotificationType("error");
        setShowNotification(true);
        return false;
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      setNotificationMessage("An error occurred while assigning the guide. Please try again.");
      setNotificationType("error");
      setShowNotification(true);
      return false;
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    setConfirmMessage("Are you sure you want to confirm this booking? The customer will receive a confirmation notification.");
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await adminAPI.updateBookingStatus(bookingId, "confirmed", token);
        
        if (result.success) {
          setNotificationMessage("Booking confirmed successfully! A notification has been sent to the customer.");
          setNotificationType("success");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => fetchDashboardData(), 1500);
        } else {
          setNotificationMessage(result.message || "Failed to confirm booking. Please try again.");
          setNotificationType("error");
          setShowNotification(true);
          setShowConfirmModal(false);
        }
      } catch (error) {
        console.error("Error confirming booking:", error);
        setNotificationMessage("An error occurred while confirming the booking.");
        setNotificationType("error");
        setShowNotification(true);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-message">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>System Overview</p>
        </div>
        <NotificationBell token={localStorage.getItem("token")} />
      </div>
      
      <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon packages">📦</div>
              <div className="stat-details">
                <h3>{stats?.total_packages || 0}</h3>
                <p>Tour Packages</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bookings">📅</div>
              <div className="stat-details">
                <h3>{stats?.total_bookings || 0}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon reviews">⭐</div>
              <div className="stat-details">
                <h3>{stats?.total_reviews || 0}</h3>
                <p>Total Reviews</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon users">👥</div>
              <div className="stat-details">
                <h3>{stats?.total_users || 0}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon guides">🧭</div>
              <div className="stat-details">
                <h3>{stats?.total_guides || 0}</h3>
                <p>Tour Guides</p>
              </div>
            </div>

            <div 
              className="stat-card clickable" 
              onClick={() => navigate("/admin/guides")}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-icon pending-guides">⏳</div>
              <div className="stat-details">
                <h3>{stats?.pending_guide_approvals || 0}</h3>
                <p>Pending Guide Applications</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon messages">✉️</div>
              <div className="stat-details">
                <h3>{stats?.new_messages || 0}</h3>
                <p>New Messages</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon requests">🎯</div>
              <div className="stat-details">
                <h3>{stats?.pending_requests || 0}</h3>
                <p>Custom Requests</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue">💰</div>
              <div className="stat-details">
                <h3>${stats?.total_revenue || 0}</h3>
                <p>Revenue (MTD)</p>
              </div>
            </div>
          </div>

          {/* Analytical Reports Section */}
          <div className="recent-bookings-section" style={{ marginTop: "30px" }}>
            <h2>📊 Analytical Reports</h2>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>Generate and download comprehensive system reports</p>
            
            {reportMessage && (
              <div 
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  backgroundColor: reportMessageType === "error" ? "#fee2e2" : "#d1fae5",
                  color: reportMessageType === "error" ? "#dc2626" : "#059669",
                  border: `1px solid ${reportMessageType === "error" ? "#fca5a5" : "#6ee7b7"}`
                }}
              >
                {reportMessage}
              </div>
            )}

         

            <div className="bookings-table-container" style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                
                {/* Report Type Selection */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "#ffffff",
                      cursor: "pointer"
                    }}
                    disabled={generatingReport}
                  >
                    <option value="booking">Booking Report</option>
                    <option value="revenue">Revenue Report</option>
                    <option value="user">User Report</option>
                    <option value="tour">Tour Performance Report</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px"
                    }}
                    disabled={generatingReport}
                  />
                </div>

                {/* Date To */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px"
                    }}
                    disabled={generatingReport}
                  />
                </div>

                {/* Format Selection */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                    Format
                  </label>
                  <select
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "#ffffff",
                      cursor: "pointer"
                    }}
                    disabled={generatingReport}
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: generatingReport ? "#9ca3af" : "#e74c3c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: generatingReport ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => !generatingReport && (e.target.style.backgroundColor = "#c0392b")}
                  onMouseLeave={(e) => !generatingReport && (e.target.style.backgroundColor = "#e74c3c")}
                >
                  {generatingReport ? (
                    <>
                      <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      📄 Generate Report
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadReport}
                  disabled={!reportGenerated || generatingReport}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: (!reportGenerated || generatingReport) ? "#d1d5db" : "#059669",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: (!reportGenerated || generatingReport) ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => reportGenerated && !generatingReport && (e.target.style.backgroundColor = "#047857")}
                  onMouseLeave={(e) => reportGenerated && !generatingReport && (e.target.style.backgroundColor = "#059669")}
                >
                  ⬇️ Download Report
                </button>
              </div>

              {/* Mock Data Preview */}
              {reportGenerated && (
                <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                    Report Summary Preview
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "14px" }}>
                    <div>
                      <strong>Total Bookings:</strong> {stats?.total_bookings || 0}
                    </div>
                    <div>
                      <strong>Total Revenue:</strong> ${stats?.total_revenue || 0}
                    </div>
                    <div>
                      <strong>Total Users:</strong> {stats?.total_users || 0}
                    </div>
                    <div>
                      <strong>Avg Rating:</strong> {stats?.average_rating || "4.5"} ⭐
                    </div>
                  </div>
                  <p style={{ marginTop: "12px", fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
                    Full detailed report will be available in the downloaded file.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="recent-bookings-section">
            <h2>Recent Bookings</h2>
            {recentBookings.length === 0 ? (
              <p className="no-data">No recent bookings</p>
            ) : (
              <div className="bookings-table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Tourist</th>
                      <th>Package</th>
                      <th>Travel Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Guide</th>
                      <th>Booked On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.booking_id}>
                        <td className="booking-ref">{booking.booking_reference}</td>
                        <td>{booking.tourist_name || booking.user_email}</td>
                        <td className="package-name">{booking.package_name}</td>
                        <td>{new Date(booking.travel_date).toLocaleDateString()}</td>
                        <td className="amount">${booking.total_price}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {booking.guide_name ? (
                            <span className="guide-assigned-badge">
                              {booking.guide_name}
                            </span>
                          ) : (
                            <span style={{ color: "#6b7280" }}>Not assigned</span>
                          )}
                        </td>
                        <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                        <td>
                          {/* STATE 1: Pending - Show Confirm Booking */}
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmBooking(booking.booking_id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#3b82f6",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                              onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                            >
                              Confirm Booking
                            </button>
                          )}
                          
                          {/* STATE 2: Confirmed (No Guide) - Show Assign Guide */}
                          {(booking.status === 'confirmed' && 
                            !booking.assigned_guide_id && 
                            !booking.guide_name) && (
                            <button
                              onClick={() => openAssignModal(booking)}
                              className="btn-assign-guide"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#10b981",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = "#059669"}
                              onMouseLeave={(e) => e.target.style.backgroundColor = "#10b981"}
                            >
                              Assign Guide
                            </button>
                          )}
                          
                          {/* STATE 3 & 4: Guide Assigned or Completed - No action buttons */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      
      {/* Assign Guide Modal */}
      {showAssignModal && selectedBooking && (
        <AssignGuideModal
          booking={selectedBooking}
          onClose={closeAssignModal}
          onAssign={handleAssignGuide}
        />
      )}

      {/* Notification Modal */}
      {showNotification && (
        <div className="notification-modal-overlay" onClick={() => setShowNotification(false)}>
          <div className={`notification-modal notification-${notificationType}`}>
            <div className="notification-icon">
              {notificationType === "success" && "✓"}
              {notificationType === "error" && "!"}
              {notificationType === "warning" && "⚠"}
            </div>
            <p className="notification-message">{notificationMessage}</p>
            <button
              className="notification-close-btn"
              onClick={() => setShowNotification(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay-confirm" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Action</h3>
            <p>{confirmMessage}</p>
            <div className="modal-footer-confirm">
              <button
                className="btn-confirm-yes"
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Yes, Confirm
              </button>
              <button
                className="btn-confirm-no"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
