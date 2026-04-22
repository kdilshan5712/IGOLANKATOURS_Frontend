/**
 * 🎯 I GO LANKA TOURS - Guide Dashboard Page
 * 
 * Central operational hub for tour guides. Displays assignment KPIs, 
 * earnings trends, tour distribution analytics, and payout management.
 * Integrates interactive charts and real-time notification alerts.
 * 
 * @module GuideDashboardPage
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, DollarSign, Star, ArrowRight, Activity,
  Clock, Users, CreditCard, History, Send, X, Percent,
  MapPin, CheckCircle, TrendingUp, TrendingDown, Calendar
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { getGuideDashboardStats, guideAPI } from "../../services/api";
import NotificationBell from "../../components/NotificationBell";
import "./GuideDashboard.css";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

const StatCard = ({ icon: Icon, label, value, description, change, color }) => (
  <div className={`gd-stat-card gd-stat-card--${color}`}>
    <div className="gd-stat-card__header">
      <div className={`gd-stat-card__icon gd-stat-card__icon--${color}`}>
        <Icon size={22} />
      </div>
      <span className="gd-stat-card__label">{label}</span>
    </div>
    <div className="gd-stat-card__value">{value}</div>
    {description && <div className="gd-stat-card__desc">{description}</div>}
    {change && (
      <div className={`gd-stat-card__change gd-stat-card__change--${change.positive ? "pos" : "neg"}`}>
        {change.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{change.label}</span>
      </div>
    )}
  </div>
);

/**
 * GuideDashboardPage Component
 * 
 * Orchestrates guide-specific data visualization and financial operations.
 * 
 * @returns {JSX.Element}
 */
const GuideDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    earnings: 0,
    earningsDelta: 0,
    earningsTrend: [],
    tourDistribution: [],
    nextTours: [],
    totalReviews: 0,
    averageRating: "0.0",
    recentReviews: [],
    availableBalance: 0,
    totalPaid: 0,
    totalPending: 0,
    commissionRate: 0.10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payout states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const statsResponse = await getGuideDashboardStats();
        console.log("[Dashboard] Stats response:", statsResponse);

        if (statsResponse.success && statsResponse.stats) {
          const s = statsResponse.stats;
          setUser({
            name:
              localStorage.getItem("guideName") ||
              localStorage.getItem("userName") ||
              "Guide",
            rating: s.averageRating || "0.0",
            totalReviews: s.totalReviews || 0,
          });
          setStats({
            upcoming: s.upcomingTours || 0,
            ongoing: s.ongoingTours || 0,
            completed: s.completedTours || 0,
            earnings: s.totalEarnings || 0,
            earningsDelta: s.earningsDelta || 0,
            earningsTrend: s.earningsTrend || [],
            tourDistribution: s.tourDistribution || [],
            nextTours: s.nextTours || [],
            totalReviews: s.totalReviews || 0,
            averageRating: s.averageRating || "0.0",
            recentReviews: s.recentReviews || [],
            availableBalance: s.availableBalance || 0,
            totalPaid: s.totalPaid || 0,
            totalPending: s.totalPending || 0,
            commissionRate: s.commissionRate || 0.10,
          });
        } else {
          setError(statsResponse.message || "Failed to load dashboard");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not connect to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const fetchPayoutHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await guideAPI.getPayoutHistory(token);
      if (response.success) {
        setPayoutHistory(response.payouts || []);
      }
    } catch (err) {
      console.error("Payout history fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setPayoutMessage("Please enter a valid amount");
      return;
    }

    if (amount > stats.availableBalance) {
      setPayoutMessage("Amount exceeds available balance");
      return;
    }

    setPayoutLoading(true);
    setPayoutMessage("");

    try {
      const token = localStorage.getItem("token");
      const result = await guideAPI.requestPayout(amount, token);

      if (result.success) {
        setPayoutMessage("Payout request submitted successfully!");
        setPayoutAmount("");
        
        // Refresh stats to update available balance
        const statsResponse = await getGuideDashboardStats();
        if (statsResponse.success && statsResponse.stats) {
          setStats(prev => ({
            ...prev,
            availableBalance: statsResponse.stats.availableBalance
          }));
        }

        setTimeout(() => {
          setShowPayoutModal(false);
          setPayoutMessage("");
        }, 2000);
      } else {
        setPayoutMessage(result.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("Payout request error:", err);
      setPayoutMessage("An error occurred. Please try again.");
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="gd-page">
        <div className="gd-container">
          <div className="gd-skeleton-header">
            <div className="gd-skeleton gd-skeleton--title" />
            <div className="gd-skeleton gd-skeleton--subtitle" />
          </div>
          <div className="gd-stat-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="gd-skeleton gd-skeleton--card" />
            ))}
          </div>
          <div className="gd-charts-grid">
            <div className="gd-skeleton gd-skeleton--chart" />
            <div className="gd-skeleton gd-skeleton--chart-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gd-page">
        <div className="gd-error-state">
          <AlertCircle size={48} className="gd-error-icon" />
          <h2>Failed to load dashboard</h2>
          <p>{error}</p>
          <button className="gd-retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const earningsFormatted = `$${(stats.earnings || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="gd-page">
      <div className="gd-container">

        {/* ── HEADER ── */}
        <div className="gd-header">
          <div className="gd-header__left">
            <div className="gd-header__avatar">
              {user?.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div>
              <h1 className="gd-header__title">
                Welcome back, <span className="gd-header__name">{user?.name}</span>!
              </h1>
              <div className="gd-header__meta">
                <span className="gd-header__rating">
                  <Star size={14} fill="currentColor" />
                  {stats.averageRating} rating
                </span>
                <span className="gd-header__sep">·</span>
                <span>{stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}</span>
                <span className="gd-header__sep">·</span>
                <span className="gd-header__commission">
                  <Percent size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {(stats.commissionRate * 100).toFixed(0)}% Rate
                </span>
              </div>
            </div>
          </div>
          <NotificationBell token={localStorage.getItem("token")} />
        </div>

        {/* ── KPI CARDS ── */}
        <div className="gd-stat-grid">
          <StatCard
            icon={MapPin}
            label="Upcoming Tours"
            color="blue"
            value={stats.upcoming}
            description={stats.upcoming === 0 ? "No tours scheduled" : `${stats.upcoming} tour${stats.upcoming > 1 ? "s" : ""} ahead`}
            change={stats.upcoming > 0 ? { positive: true, label: "Active bookings" } : null}
          />
          <StatCard
            icon={Activity}
            label="Ongoing Tours"
            color="amber"
            value={stats.ongoing}
            description={stats.ongoing === 0 ? "No active tours right now" : `${stats.ongoing} running today`}
          />
          <StatCard
            icon={CheckCircle}
            label="Completed Tours"
            color="green"
            value={stats.completed}
            description={stats.completed === 0 ? "Start your first tour!" : `${stats.completed} tour${stats.completed > 1 ? "s" : ""} completed`}
            change={stats.completed > 0 ? { positive: true, label: "Great work!" } : null}
          />
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            color="purple"
            value={earningsFormatted}
            description={stats.earnings === 0 ? "Complete tours to earn" : "Total accumulated"}
            change={
              stats.earnings > 0
                ? {
                  positive: stats.earningsDelta >= 0,
                  label: `${Math.abs(stats.earningsDelta)}% vs last month`,
                }
                : null
            }
          />
        </div>

        {/* ── BALANCE & PAYOUT SECTION (NEW) ── */}
        <div className="gd-payout-section">
          <div className="gd-payout-card">
            <div className="gd-payout-card__content">
              <div className="gd-payout-card__info">
                <div className="gd-payout-card__icon">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="gd-payout-card__label">Available to Request</h3>
                  <div className="gd-payout-card__value">
                    ${(stats.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="gd-payout-card__details">
                    <span>Current Balance: ${(stats.earnings - stats.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="gd-payout-card__sep">|</span>
                    <span>Paid: ${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              <div className="gd-payout-card__actions">
                <button 
                  className="gd-payout-btn gd-payout-btn--history"
                  onClick={() => {
                    setShowHistory(!showHistory);
                    if (!showHistory) fetchPayoutHistory();
                  }}
                >
                  <History size={16} />
                  History
                </button>
                <button 
                  className="gd-payout-btn gd-payout-btn--request"
                  disabled={stats.availableBalance <= 0}
                  onClick={() => setShowPayoutModal(true)}
                >
                  <Send size={16} />
                  Request Payout
                </button>
              </div>
            </div>

            {/* Payout History Dropdown */}
            {showHistory && (
              <div className="gd-payout-history">
                <div className="gd-payout-history__header">
                  <h4>Recent Payout Requests</h4>
                </div>
                <div className="gd-payout-history__list">
                  {loadingHistory ? (
                    <div className="gd-payout-history__loading">Loading...</div>
                  ) : payoutHistory.length > 0 ? (
                    payoutHistory.map((payout, idx) => (
                      <div key={idx} className="gd-payout-history__item">
                        <div className="gd-payout-history__item-info">
                          <span className="gd-payout-history__amount">${payout.amount}</span>
                          <span className="gd-payout-history__date">
                            {new Date(payout.requested_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`gd-status-badge gd-status-badge--${payout.status}`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="gd-payout-history__empty">No payout requests found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="gd-main-content">
          {/* Left column */}
          <div className="gd-col-left">

            {/* Earnings Trend */}
            <div className="gd-card">
              <div className="gd-card__header">
                <div>
                  <h3 className="gd-card__title">Earnings Trend</h3>
                  <p className="gd-card__subtitle">Your commission earnings over 6 months</p>
                </div>
              </div>
              <div className="gd-chart-wrap" style={{ height: 280 }}>
                {stats.earningsTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.earningsTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(v) => `$${v}`} />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          fontFamily: "inherit",
                        }}
                        formatter={(val) => [`$${Number(val).toFixed(2)}`, "Earnings"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#earningsGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="gd-empty-state">
                    <TrendingUp size={40} />
                    <p>No earnings data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Tours */}
            <div className="gd-card">
              <div className="gd-card__header">
                <h3 className="gd-card__title">Upcoming Tours</h3>
                <button className="gd-card__link" onClick={() => navigate("/guide/bookings")}>
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="gd-tours-list">
                {stats.nextTours.length > 0 ? (
                  stats.nextTours.map((tour, i) => (
                    <div key={i} className="gd-tour-item">
                      <div className="gd-tour-item__icon">
                        <MapPin size={18} />
                      </div>
                      <div className="gd-tour-item__info">
                        <span className="gd-tour-item__name">{tour.package_name}</span>
                        <span className="gd-tour-item__meta">
                          <Clock size={12} />
                          {new Date(tour.travel_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          <span className="gd-tour-item__sep">·</span>
                          <Users size={12} />
                          {tour.travelers} traveler{tour.travelers !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className={`gd-status-badge gd-status-badge--${tour.status.toLowerCase()}`}>
                        {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="gd-empty-state">
                    <Calendar size={40} />
                    <p>No upcoming tours</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reviews (New Section) */}
            <div className="gd-card">
              <div className="gd-card__header">
                <h3 className="gd-card__title">Recent Reviews</h3>
                <button className="gd-card__link" onClick={() => navigate("/guide/reviews")}>
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="gd-reviews-list-compact">
                {stats.recentReviews.length > 0 ? (
                  stats.recentReviews.map((review, i) => (
                    <div key={i} className="gd-review-item-compact">
                      <div className="gd-review-item-compact__header">
                        <div className="gd-review-item-compact__user">
                          <div className="gd-review-item-compact__avatar">
                            {review.tourist_name?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <span className="gd-review-item-compact__name">{review.tourist_name || "Anonymous"}</span>
                            <span className="gd-review-item-compact__date">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="gd-review-item-compact__rating">
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span>{review.rating}.0</span>
                        </div>
                      </div>
                      <p className="gd-review-item-compact__comment">
                        "{review.comment.length > 100 ? `${review.comment.substring(0, 100)}...` : review.comment}"
                      </p>
                      <div className="gd-review-item-compact__pkg">
                        <MapPin size={12} />
                        <span>{review.package_name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="gd-empty-state">
                    <Star size={40} />
                    <p>No reviews yet. Feedback will appear here after tours.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="gd-col-right">

            {/* Tour Distribution */}
            <div className="gd-card">
              <div className="gd-card__header">
                <h3 className="gd-card__title">Tour Distribution</h3>
              </div>
              <div className="gd-chart-wrap" style={{ height: 240 }}>
                {stats.tourDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.tourDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.tourDistribution.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }}
                        formatter={(val, name) => [val, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="gd-empty-state">
                    <Activity size={40} />
                    <p>No tour data yet</p>
                  </div>
                )}
              </div>
              {stats.tourDistribution.length > 0 && (
                <div className="gd-pie-legend">
                  {stats.tourDistribution.map((entry, idx) => (
                    <div key={idx} className="gd-legend-item">
                      <span className="gd-legend-dot" style={{ background: COLORS[idx % COLORS.length] }} />
                      <span className="gd-legend-text">{entry.name}</span>
                      <span className="gd-legend-val">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="gd-card">
              <div className="gd-card__header">
                <h3 className="gd-card__title">Quick Links</h3>
              </div>
              <div className="gd-quick-links">
                {[
                  { label: "My Assigned Tours", icon: MapPin, path: "/guide/bookings", variant: "primary" },
                  { label: "Set Availability", icon: Calendar, path: "/guide/availability", variant: "secondary" },
                  { label: "My Reviews", icon: Star, path: "/guide/reviews", variant: "secondary" },
                  { label: "View Profile", icon: Users, path: "/guide/profile", variant: "ghost" },
                ].map(({ label, icon: Icon, path, variant }) => (
                  <button
                    key={path}
                    className={`gd-quick-btn gd-quick-btn--${variant}`}
                    onClick={() => navigate(path)}
                  >
                    <Icon size={16} />
                    {label}
                    <ArrowRight size={14} className="gd-quick-btn__arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAYOUT REQUEST MODAL ── */}
      {showPayoutModal && (
        <div className="gd-modal-overlay">
          <div className="gd-modal">
            <div className="gd-modal__header">
              <h3>Request Payout</h3>
              <button className="gd-modal__close" onClick={() => setShowPayoutModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="gd-modal__body">
              <p className="gd-modal__desc">
                Available Balance: <strong>${stats.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </p>
              
              {payoutMessage && (
                <div className={`gd-modal__message ${payoutMessage.includes('success') ? 'success' : 'error'}`}>
                  {payoutMessage}
                </div>
              )}

              <div className="gd-modal__form-group">
                <label>Amount to Withdraw ($)</label>
                <div className="gd-modal__input-wrapper">
                  <DollarSign size={18} />
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    disabled={payoutLoading}
                  />
                </div>
              </div>

              <div className="gd-modal__actions">
                <button 
                  className="gd-modal__btn gd-modal__btn--cancel" 
                  onClick={() => setShowPayoutModal(false)}
                  disabled={payoutLoading}
                >
                  Cancel
                </button>
                <button 
                  className="gd-modal__btn gd-modal__btn--submit" 
                  onClick={handleRequestPayout}
                  disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) <= 0}
                >
                  {payoutLoading ? "Processing..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboardPage;
