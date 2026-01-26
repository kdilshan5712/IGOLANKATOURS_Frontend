import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, X } from "lucide-react";
import { guideAPI } from "../../services/api";
import "./GuideAvailability.css";

const GuideAvailabilityPage = () => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "guide") {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleRemoveDate = (dateStr) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr));
  };

  const handleSaveAvailability = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await guideAPI.setAvailability({
        is_available: isAvailable,
        dates: selectedDates,
      }, token);

      if (response.success) {
        setMessage("Availability updated successfully!");
      } else {
        setMessage("Error: " + response.message);
      }
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating availability: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNextDays = (count = 30) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const nextDays = getNextDays();

  return (
    <main className="guide-availability-page">
      <div className="guide-availability-container">
        <div className="guide-availability-header">
          <h1 className="guide-availability-title">Your Availability</h1>
          <p className="guide-availability-subtitle">Set when you're available to guide tours</p>
        </div>

        {message && (
          <div className={`guide-availability-message ${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {/* Availability Toggle */}
        <div className="guide-availability-toggle-section">
          <div className="guide-availability-toggle-card">
            <div className="guide-availability-toggle-content">
              <h2 className="guide-availability-toggle-title">Overall Status</h2>
              <p className="guide-availability-toggle-text">
                {isAvailable ? "You're available for tours" : "You're currently unavailable"}
              </p>
            </div>
            <div className="guide-availability-toggle">
              <label className="guide-availability-switch">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  disabled={loading}
                />
                <span className="guide-availability-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="guide-availability-dates-section">
          <h2 className="guide-availability-section-title">Select Available Dates</h2>
          <div className="guide-availability-calendar">
            {nextDays.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const isSelected = selectedDates.includes(dateStr);
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = date.getDate();

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(date)}
                  className={`guide-availability-date ${isSelected ? "selected" : ""}`}
                >
                  <div className="guide-availability-date-day">{dayName}</div>
                  <div className="guide-availability-date-num">{dayNum}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Dates List */}
        {selectedDates.length > 0 && (
          <div className="guide-availability-selected-section">
            <h2 className="guide-availability-section-title">
              Selected Dates ({selectedDates.length})
            </h2>
            <div className="guide-availability-selected-list">
              {selectedDates.map((dateStr) => (
                <div key={dateStr} className="guide-availability-selected-item">
                  <span className="guide-availability-selected-date">{dateStr}</span>
                  <button
                    onClick={() => handleRemoveDate(dateStr)}
                    className="guide-availability-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="guide-availability-actions">
          <button
            onClick={handleSaveAvailability}
            disabled={loading}
            className="guide-availability-save-btn"
          >
            {loading ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default GuideAvailabilityPage;
