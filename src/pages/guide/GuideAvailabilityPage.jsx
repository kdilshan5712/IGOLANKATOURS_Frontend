import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, X, Loader, Calendar as CalendarIcon, Save } from "lucide-react";
import Calendar from "react-calendar";
import { availabilityAPI } from "../../services/api";
import "react-calendar/dist/Calendar.css";
import "./GuideAvailability.css";

const GuideAvailabilityPage = () => {
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState(new Map()); // Map<dateStr, status>
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }

    fetchAvailability();
  }, [navigate]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await availabilityAPI.getAvailability(token);

      if (response.success) {
        const dateMap = new Map();
        (response.availability || []).forEach(item => {
          dateMap.set(item.date, item.status);
        });
        setSelectedDates(dateMap);
      } else {
        showMessage("Error loading availability: " + (response.message || "Unknown error"), "error");
      }
    } catch (err) {
      showMessage("Network error loading availability.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const newMap = new Map(selectedDates);

    if (newMap.has(dateStr)) {
      const current = newMap.get(dateStr);
      if (current === "available") {
        newMap.set(dateStr, "unavailable");
      } else {
        newMap.delete(dateStr);
      }
    } else {
      newMap.set(dateStr, "available");
    }

    setSelectedDates(newMap);
  };

  const handleRemoveDate = (dateStr) => {
    const newMap = new Map(selectedDates);
    newMap.delete(dateStr);
    setSelectedDates(newMap);
  };

  const handleSave = async () => {
    if (selectedDates.size === 0) {
      showMessage("Please select at least one date.", "error");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const updates = Array.from(selectedDates.entries());

      const results = await Promise.allSettled(
        updates.map(([date, status]) => availabilityAPI.setAvailability(date, status, token))
      );

      const successful = results.filter(r => r.status === "fulfilled" && r.value.success).length;
      const failed = results.length - successful;

      if (failed === 0) {
        showMessage(`✅ ${successful} date(s) updated successfully!`, "success");
        await fetchAvailability();
      } else {
        showMessage(`⚠️ ${successful} updated, ${failed} failed. Please try again.`, "error");
      }
    } catch (err) {
      showMessage("❌ Error saving availability: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      const status = selectedDates.get(dateStr);
      if (status === "available") return "tile--available";
      if (status === "unavailable") return "tile--unavailable";
    }
    return null;
  };

  const availableCount = Array.from(selectedDates.values()).filter(s => s === "available").length;
  const unavailableCount = Array.from(selectedDates.values()).filter(s => s === "unavailable").length;

  if (loading) {
    return (
      <main className="guide-availability-page">
        <div className="guide-availability-loading">
          <div className="loading-spinner"></div>
          <p>Loading your availability...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="guide-availability-page">
      <div className="guide-availability-container">

        {/* Header */}
        <div className="guide-availability-header">
          <div className="header-left">
            <div className="header-icon">
              <CalendarIcon size={28} />
            </div>
            <div>
              <h1 className="guide-availability-title">Manage Availability</h1>
              <p className="guide-availability-subtitle">Set your schedule for upcoming tours</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat available">
              <CheckCircle size={16} />
              <span>{availableCount} Available</span>
            </div>
            <div className="header-stat unavailable">
              <XCircle size={16} />
              <span>{unavailableCount} Unavailable</span>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`guide-availability-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="guide-availability-main">
          {/* Left: Calendar */}
          <div className="guide-availability-calendar-section">
            <div className="section-card">
              <div className="section-card-header">
                <h2>Select Dates</h2>
                <div className="legend">
                  <span className="legend-item available"><span className="legend-dot"></span>Available</span>
                  <span className="legend-item unavailable"><span className="legend-dot"></span>Unavailable</span>
                </div>
              </div>
              <Calendar
                onClickDay={handleDateClick}
                tileClassName={tileClassName}
                minDate={new Date()}
                value={null}
              />
              <p className="calendar-hint">
                Click once → <strong>Available</strong> · Click again → <strong>Unavailable</strong> · Click again to <strong>clear</strong>
              </p>
            </div>
          </div>

          {/* Right: Schedule list */}
          <div className="guide-availability-schedule-section">
            <div className="section-card">
              <div className="section-card-header">
                <h2>Your Schedule</h2>
                <span className="badge">{selectedDates.size} dates</span>
              </div>

              {selectedDates.size === 0 ? (
                <div className="empty-schedule">
                  <CalendarIcon size={48} />
                  <p>No dates selected yet.</p>
                  <p className="empty-hint">Click on the calendar to add dates.</p>
                </div>
              ) : (
                <div className="schedule-list">
                  {Array.from(selectedDates.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dateStr, status]) => (
                      <div key={dateStr} className={`schedule-item ${status}`}>
                        <div className="schedule-item-info">
                          <span className={`schedule-status-dot ${status}`}></span>
                          <div>
                            <span className="schedule-date">
                              {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className={`schedule-badge ${status}`}>
                              {status === "available" ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                        <button
                          className="schedule-remove-btn"
                          onClick={() => handleRemoveDate(dateStr)}
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              className="guide-availability-save-btn"
              onClick={handleSave}
              disabled={saving || selectedDates.size === 0}
            >
              {saving ? (
                <>
                  <Loader className="spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save {selectedDates.size > 0 ? `${selectedDates.size} Date${selectedDates.size !== 1 ? "s" : ""}` : "Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GuideAvailabilityPage;
