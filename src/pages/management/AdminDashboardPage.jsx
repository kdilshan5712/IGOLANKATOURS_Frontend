
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import NotificationBell from "../../components/NotificationBell";
import AssignGuideModal from "../../components/AssignGuideModal";
import {
  Package,
  CalendarDays,
  Map,
  Users,
  Star,
  MessageSquare,
  Target,
  DollarSign,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  TrendingUp,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import "./AdminDashboard.css";
import "../../styles/AdminTheme.css";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytical Report states
  const [reportType, setReportType] = useState("booking");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportMessageType, setReportMessageType] = useState("");
  const [reportData, setReportData] = useState(null);
  const [reportBlob, setReportBlob] = useState(null);
  const [reportFilename, setReportFilename] = useState("");

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // success, error, warning
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Guide assignment states
  const [assignGuideBooking, setAssignGuideBooking] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
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

      if (statsResult.success && statsResult.stats) {
        console.log("✅ Setting stats:", statsResult.stats);
        setStats(statsResult.stats);
      } else {
        console.error("❌ Stats fetch failed:", statsResult.message || "No stats in response");
        console.error("Full statsResult:", JSON.stringify(statsResult, null, 2));

        // Show error notification
        setNotificationMessage("Failed to load dashboard statistics. Please refresh the page.");
        setNotificationType("error");
        setShowNotification(true);
      }

      if (bookingsResult.success) {
        setRecentBookings(bookingsResult.bookings || []);
        console.log(`✅ Loaded ${(bookingsResult.bookings || []).length} bookings`);
      } else {
        console.error("❌ Bookings fetch failed:", bookingsResult.message);
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setNotificationMessage("Error connecting to server. Please check if the backend is running.");
      setNotificationType("error");
      setShowNotification(true);
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
    setReportGenerated(false);
    setReportBlob(null);
    setReportData(null);

    try {
      const token = localStorage.getItem("token");
      const ext = reportType === 'user' ? 'csv' : reportFormat;
      const reportName = `${reportType}_report_${dateFrom}_to_${dateTo}.${ext}`;
      setReportFilename(reportName);

      // 1. Fetch the actual report file (Blob) for ALL types - this makes the process "same"
      console.log(`📥 Preparing ${reportType} report (${ext})...`);
      const blobResult = await adminAPI.generateReport(reportType, ext, dateFrom, dateTo, token);

      if (!blobResult.success || !blobResult.blob) {
        throw new Error(blobResult.message || "Failed to prepare report file");
      }

      setReportBlob(blobResult.blob);

      // 2. For revenue, also fetch summary data for the preview
      if (reportType === "revenue") {
        console.log("📊 Fetching revenue summary data...");
        const dataResult = await adminAPI.getRevenueReport(dateFrom, dateTo, token);

        if (dataResult.success && dataResult.report) {
          setReportData(dataResult.report);
        }
      }

      setReportGenerated(true);
      setReportMessage(`✅ ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated! Click download to save.`);
      setReportMessageType("success");

    } catch (error) {
      console.error("Error generating report:", error);
      setReportMessage(error.message || "Failed to generate report. Please try again.");
      setReportMessageType("error");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportBlob) {
      setReportMessage("No report file available to download. Please generate it first.");
      setReportMessageType("error");
      return;
    }

    try {
      const url = window.URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', reportFilename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setReportMessage("✅ Report downloaded successfully!");
      setReportMessageType("success");
      
      // Keep reportGenerated as true so they can download again if they want
    } catch (error) {
      console.error("Download error:", error);
      setReportMessage(`Failed to download: ${error.message}`);
      setReportMessageType("error");
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

  const handleCancelBooking = async (bookingId) => {
    setConfirmMessage("Are you sure you want to CANCEL this booking? This action cannot be undone.");
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await adminAPI.updateBookingStatus(bookingId, "cancelled", token);

        if (result.success) {
          setNotificationMessage("Booking cancelled successfully.");
          setNotificationType("success");
          setShowNotification(true);
          setShowConfirmModal(false);
          setTimeout(() => fetchDashboardData(), 1500);
        } else {
          setNotificationMessage(result.message || "Failed to cancel booking.");
          setNotificationType("error");
          setShowNotification(true);
          setShowConfirmModal(false);
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        setNotificationMessage("An error occurred while cancelling the booking.");
        setNotificationType("error");
        setShowNotification(true);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleAssignGuide = (booking) => {
    setAssignGuideBooking(booking);
  };

  const handleCloseAssignModal = () => {
    setAssignGuideBooking(null);
  };

  const handleGuideAssignment = async (bookingId, guideId, adminNotes) => {
    try {
      const token = localStorage.getItem("token");
      const result = await adminAPI.assignGuideToBooking(
        bookingId,
        guideId,
        adminNotes,
        token
      );

      if (result.success) {
        setNotificationMessage("Guide assigned successfully! The guide has been notified.");
        setNotificationType("success");
        setShowNotification(true);
        setAssignGuideBooking(null);
        setTimeout(() => fetchDashboardData(), 1500);
      } else {
        setNotificationMessage(result.message || "Failed to assign guide. Please try again.");
        setNotificationType("error");
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      setNotificationMessage("An error occurred while assigning the guide.");
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div className="skeleton skeleton-text" style={{ width: '200px' }}></div>
        </div>
      <div className="stats-grid">
        {[...Array(10)].map((_, i) => <div key={i} className="stat-card glass-card skeleton" style={{ height: '110px' }}></div>)}
      </div>
      <div className="dashboard-charts-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="section-container glass-panel skeleton" style={{ height: '350px' }}></div>
        <div className="section-container glass-panel skeleton" style={{ height: '350px' }}></div>
      </div>
      </div>
    );
  }

  const getRevenueDelta = () => {
    if (!stats?.revenueTrends || stats.revenueTrends.length < 2) return null;
    
    // Last item is current month, second to last is previous month
    const current = stats.revenueTrends[stats.revenueTrends.length - 1].revenue;
    const previous = stats.revenueTrends[stats.revenueTrends.length - 2].revenue;
    
    if (previous === 0) return current > 0 ? "+100% Growth" : "New Month";
    
    const diff = ((current - previous) / previous) * 100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}% vs last month`;
  };

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  const statCards = [
    { label: "Tour Packages", value: stats?.total_packages || 0, icon: Package, color: "bg-blue-500", delta: "+2 this month" },
    { label: "Total Bookings", value: stats?.total_bookings || 0, icon: CalendarDays, color: "bg-green-500", delta: "+12% growth" },
    { label: "Total Reviews", value: stats?.total_reviews || 0, icon: Star, color: "bg-yellow-500", delta: "+5 new" },
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "bg-purple-500", delta: "+3% M-o-M" },
    { label: "Tour Guides", value: stats?.total_guides || 0, icon: Map, color: "bg-indigo-500", delta: "+1 new" },
    {
      label: "Pending Guide Applications",
      value: stats?.pending_guide_approvals || 0,
      icon: Clock,
      color: "bg-orange-500",
      onClick: () => navigate("/admin/guides"),
      action: true,
      delta: stats?.pending_guide_approvals > 0 ? "+ Action Required" : "Up to date"
    },
    { label: "New Messages", value: stats?.new_messages || 0, icon: MessageSquare, color: "bg-pink-500", delta: stats?.new_messages > 0 ? "+ Action Required" : "All read" },
    { 
      label: "Custom Requests", 
      value: stats?.pending_requests || 0, 
      icon: Target, 
      color: "bg-teal-500", 
      onClick: () => navigate("/admin/custom-tours"),
      action: true,
      delta: stats?.pending_requests > 0 ? "+ Action Required" : "Answered" 
    },
    { 
      label: "Payout Requests", 
      value: stats?.pending_payouts || 0, 
      icon: DollarSign, 
      color: "bg-amber-600", 
      onClick: () => navigate("/admin/payouts"),
      action: true,
      delta: stats?.pending_payouts > 0 ? "+ Action Required" : "Up to date" 
    },
    { label: `${currentMonthName} Income`, value: `$${Number(stats?.total_revenue || 0).toLocaleString()} `, icon: DollarSign, color: "bg-emerald-600", delta: getRevenueDelta() || "MTD Performance" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>System Overview & Analytics</p>
        </div>
        <NotificationBell token={localStorage.getItem("token")} />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`stat-card glass-card ${stat.action ? 'clickable' : ''}`}
            onClick={stat.onClick}
          >
            <div>
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              {stat.delta && <span className={`stat-delta ${stat.delta.includes("Required") ? "delta-warning" : "delta-positive"}`}>{stat.delta}</span>}
            </div>
            <div className={`stat-icon-wrapper ${stat.color}`}>
              <stat.icon className="stat-icon" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-grid">
        <div className="section-container glass-panel chart-container">
          <div className="section-header">
            <h2 className="section-title"><TrendingUp size={20} className="stat-icon" style={{ color: '#4f46e5' }} /> Revenue Trends</h2>
          </div>
          <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
            {stats?.revenueTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => [`$${val}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Not enough data</div>
            )}
          </div>
        </div>

        <div className="section-container glass-panel chart-container">
          <div className="section-header">
            <h2 className="section-title"><PieChartIcon size={20} className="stat-icon" style={{ color: '#10b981' }} /> Booking Distribution</h2>
          </div>
          <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
            {stats?.bookingDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.bookingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.bookingDistribution.map((entry, index) => {
                      const colors = { confirmed: '#10b981', pending: '#f59e0b', completed: '#3b82f6', cancelled: '#ef4444' };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name.toLowerCase()] || '#94a3b8'} />;
                    })}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend formatter={(value) => <span style={{ textTransform: 'capitalize', color: '#4b5563' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No data</div>
            )}
          </div>
        </div>
      </div>

      <div className="section-container glass-panel chart-container" style={{ gridColumn: '1 / -1' }}>
        <div className="section-header">
          <h2 className="section-title"><Package size={20} className="stat-icon" style={{ color: '#ec4899' }} /> Top Performing Packages</h2>
        </div>
        <div style={{ height: 350, width: '100%', marginTop: '1rem' }}>
          {stats?.topPackages?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topPackages} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#be185d" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  stroke="#6b7280" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(236, 72, 153, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No data</div>
          )}
        </div>
      </div>

      {/* Analytical Reports Section */}
      <div className="section-container glass-panel">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <FileText className="stat-icon" style={{ width: '1.5rem', height: '1.5rem', color: '#4f46e5' }} />
              Analytical Reports
            </h2>
            <p className="section-subtitle">Generate system performance and booking reports</p>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {reportMessage && (
            <div className={`status-badge ${reportMessageType === 'error' ? 'status-error' : 'status-success'}`} style={{ marginBottom: '1.5rem', width: '100%', padding: '1rem', justifyContent: 'center', fontSize: '1rem' }}>
              {reportMessageType === "error" ? <AlertCircle style={{ marginRight: '0.5rem' }} /> : <CheckCircle style={{ marginRight: '0.5rem' }} />}
              {reportMessage}
            </div>
          )}

          <div className="form-grid">
            {/* Report Type */}
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportGenerated(false);
                  setReportBlob(null);
                  setReportData(null);
                }}
                className="form-select"
                disabled={generatingReport}
              >
                <option value="booking">Booking Report</option>
                <option value="revenue">Revenue Report</option>
                <option value="user">User Report</option>
              </select>
            </div>

            {/* Date From */}
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setReportGenerated(false);
                  setReportBlob(null);
                }}
                className="form-input"
                disabled={generatingReport}
              />
            </div>

            {/* Date To */}
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setReportGenerated(false);
                  setReportBlob(null);
                }}
                className="form-input"
                disabled={generatingReport}
              />
            </div>

            {/* Format */}
            <div className="form-group">
              <label className="form-label">Format</label>
              <select
                value={reportFormat}
                onChange={(e) => {
                  setReportFormat(e.target.value);
                  setReportGenerated(false);
                  setReportBlob(null);
                }}
                className="form-select"
                disabled={generatingReport}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="btn-group">
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="btn btn-primary"
            >
              {generatingReport ? (
                <>
                  <Clock size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Report
                </>
              )}
            </button>

            <button
              onClick={handleDownloadReport}
              disabled={!reportGenerated || generatingReport}
              className="btn btn-success"
            >
              <Download size={16} />
              Download Report
            </button>
          </div>

          {/* Report Data Display */}
          {reportGenerated && (
            <div className="report-results">
              {reportType === "revenue" && reportData ? (
                <div>
                  <h3 className="section-title" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                    <DollarSign size={20} color="var(--admin-success)" style={{ marginRight: '0.5rem' }} />
                    Revenue Report Summary
                  </h3>

                  <div className="report-summary-grid">
                    <div className="summary-card">
                      <p className="summary-label">Total Revenue</p>
                      <p className="summary-value" style={{ color: 'var(--admin-success)' }}>${Number(reportData?.summary?.total_revenue || 0).toFixed(2)}</p>
                    </div>
                    <div className="summary-card">
                      <p className="summary-label">Completed Revenue</p>
                      <p className="summary-value" style={{ color: '#60a5fa' }}>${Number(reportData?.summary?.completed_revenue || 0).toFixed(2)}</p>
                    </div>
                    <div className="summary-card">
                      <p className="summary-label">Total Bookings</p>
                      <p className="summary-value" style={{ color: '#2dd4bf' }}>{reportData?.summary?.total_bookings || 0}</p>
                    </div>
                    <div className="summary-card">
                      <p className="summary-label">Avg Booking Value</p>
                      <p className="summary-value" style={{ color: '#fb923c' }}>${Number(reportData?.summary?.average_booking_value || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {reportData?.by_status && reportData.by_status.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 className="form-label" style={{ marginBottom: '0.75rem' }}>Revenue by Status</h4>
                      <div className="report-summary-grid">
                        {reportData.by_status.map((item, idx) => (
                          <div key={idx} className="summary-card">
                            <p className="summary-value" style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{item.status}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                              <span>${Number(item.revenue || 0).toFixed(2)}</span>
                              <span className="status-badge" style={{ fontSize: '0.75rem' }}>{item.bookings_count} bookings</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <h3 className="section-title" style={{ justifyContent: 'center' }}>Report Summary Preview</h3>
                  <div className="report-summary-grid" style={{ marginTop: '1.5rem' }}>
                    <div className="summary-card">
                      <p className="summary-label">Total Bookings</p>
                      <p className="summary-value">{stats?.total_bookings || 0}</p>
                    </div>
                    <div className="summary-card">
                      <p className="summary-label">Monthly Revenue</p>
                      <p className="summary-value" style={{ color: 'var(--admin-success)' }}>${stats?.total_revenue || 0}</p>
                    </div>
                    <div className="summary-card">
                      <p className="summary-label">Total Users</p>
                      <p className="summary-value" style={{ color: '#60a5fa' }}>{stats?.total_users || 0}</p>
                    </div>
                    <div className="summary-card">
                      <p className="summary-label">Avg Rating</p>
                      <p className="summary-value" style={{ color: '#facc15' }}>{stats?.average_rating || "4.5"} ⭐</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', fontStyle: 'italic', marginTop: '1.5rem' }}>Full detailed report provided in download.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="section-container glass-panel">
        <div className="section-header">
          <h2 className="section-title">Recent Bookings</h2>
        </div>

        {recentBookings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>No recent bookings found.</div>
        ) : (
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Tourist</th>
                  <th>Package</th>
                  <th>Travel Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td style={{ fontWeight: '500', color: 'var(--admin-text-primary)' }}>{booking.booking_reference}</td>
                    <td>{booking.tourist_name || booking.user_email}</td>
                    <td style={{ color: '#818cf8' }}>{booking.package_name}</td>
                    <td>{new Date(booking.travel_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '500', color: 'var(--admin-text-primary)' }}>${booking.total_price}</td>
                    <td>
                      <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className="btn-icon"
                        onClick={() => setActiveDropdown(activeDropdown === booking.booking_id ? null : booking.booking_id)}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeDropdown === booking.booking_id && (
                        <div className="action-dropdown-menu">
                          {booking.status === 'pending' && (
                            <>
                              <button onClick={() => { handleConfirmBooking(booking.booking_id); setActiveDropdown(null); }} className="dropdown-item text-success">
                                <CheckCircle size={14} style={{ marginRight: '8px' }} /> Confirm
                              </button>
                              <button onClick={() => { handleCancelBooking(booking.booking_id); setActiveDropdown(null); }} className="dropdown-item text-danger">
                                <AlertCircle size={14} style={{ marginRight: '8px' }} /> Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && !booking.assigned_guide_id && (
                            <button onClick={() => { handleAssignGuide(booking); setActiveDropdown(null); }} className="dropdown-item text-primary">
                              <Users size={14} style={{ marginRight: '8px' }} /> Assign Guide
                            </button>
                          )}
                          {booking.status === 'confirmed' && booking.assigned_guide_id && (
                            <span className="dropdown-item text-muted" style={{ cursor: 'default' }}>
                              <CheckCircle size={14} style={{ marginRight: '8px' }} /> Guide Assigned
                            </span>
                          )}
                          {(booking.status === 'cancelled' || booking.status === 'completed') && (
                            <span className="dropdown-item text-muted" style={{ cursor: 'default' }}>
                              No Actions
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <div className="modal-overlay" onClick={() => setShowNotification(false)}>
          <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <div className="notification-icon" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              {notificationType === "success" && <CheckCircle size={56} color="#34d399" style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '12px', borderRadius: '50%' }} />}
              {notificationType === "error" && <AlertCircle size={56} color="#f87171" style={{ background: 'rgba(248, 113, 113, 0.1)', padding: '12px', borderRadius: '50%' }} />}
              {notificationType === "warning" && <AlertCircle size={56} color="#fbbf24" style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '12px', borderRadius: '50%' }} />}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
              {notificationType === "success" ? "Success!" : notificationType === "error" ? "Error" : "Notice"}
            </h3>
            <p style={{ color: 'var(--admin-text-secondary)', marginBottom: '2rem' }}>{notificationMessage}</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowNotification(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem' }} onClick={() => setShowConfirmModal(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', maxWidth: '28rem', width: '100%', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>Confirm Action</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>{confirmMessage}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-gray-100)', color: 'var(--color-gray-700)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Guide Modal */}
      {assignGuideBooking && (
        <AssignGuideModal
          booking={assignGuideBooking}
          onClose={handleCloseAssignModal}
          onAssign={handleGuideAssignment}
        />
      )}
    </div>
  );
}

export default AdminDashboardPage;
