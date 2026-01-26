import { useState, useEffect } from "react";
import { Star, Send, AlertCircle, CheckCircle, Camera, X } from "lucide-react";
import { reviewAPI, packageAPI } from "../services/api";
import "./ReviewForm.css";

const ReviewForm = ({ packageId = null }) => {
  const [formData, setFormData] = useState({
    packageId: packageId || "",
    rating: 0,
    title: "",
    comment: "",
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch packages and user bookings
  useEffect(() => {
    if (!packageId && token) {
      const fetchPackages = async () => {
        const result = await packageAPI.getAll({ limit: 50 });
        if (result.success) {
          setPackages(result.packages || []);
        }
      };
      fetchPackages();
    }

    // Get user's confirmed bookings from backend
    if (token) {
      const fetchUserBookings = async () => {
        try {
          const result = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await result.json();
          if (data.success && data.bookings) {
            const confirmed = data.bookings.filter(b => b.status === 'confirmed');
            setConfirmedBookings(confirmed);
          }
        } catch (err) {
          console.error('Error fetching bookings:', err);
        }
      };
      fetchUserBookings();
    }
  }, [packageId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.slice(0, 5 - photos.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photos[index].preview);
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!token) {
      setMessage("Please log in to submit a review");
      setMessageType("error");
      return;
    }

    if (!formData.packageId) {
      setMessage("Please select a package");
      setMessageType("error");
      return;
    }

    if (!formData.rating) {
      setMessage("Please select a rating");
      setMessageType("error");
      return;
    }

    if (!formData.comment || formData.comment.trim().length < 10) {
      setMessage("Review must be at least 10 characters long");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      // Prepare review data with actual image files
      const reviewPayload = {
        packageId: formData.packageId,
        rating: formData.rating,
        title: formData.title || "",
        comment: formData.comment,
        images: photos.map(p => p.file) // Send actual file objects
      };

      const result = await reviewAPI.submit(token, reviewPayload);

      if (result.success) {
        setMessage("Thank you! Your review has been submitted and is pending approval.");
        setMessageType("success");
        setFormData({
          packageId: packageId || "",
          rating: 0,
          title: "",
          comment: "",
        });
        // Clear photos
        photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        setPhotos([]);
        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage(result.message || "Failed to submit review");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("Failed to submit review. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={index}
          size={32}
          className="review-form-star"
          fill={
            starValue <= (hoveredRating || formData.rating)
              ? "#d97706"
              : "none"
          }
          color={
            starValue <= (hoveredRating || formData.rating)
              ? "#d97706"
              : "#d1d5db"
          }
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setFormData({ ...formData, rating: starValue })}
        />
      );
    });
  };

  if (!token) {
    return (
      <div className="review-form-section">
        <div className="review-form-card">
          <div className="review-form-notice">
            <AlertCircle size={24} />
            <p>Please <a href="/login">log in</a> to submit a review</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-section">
      <div className="review-form-header">
        <h2 className="review-form-title">Share Your Experience</h2>
        <p className="review-form-subtitle">
          We'd love to hear about your journey with us
        </p>
      </div>

      {formData.packageId && confirmedBookings.length === 0 && (
        <div className="review-form-warning">
          <AlertCircle size={20} />
          <p>You can only review packages you have booked. This review will be validated against your confirmed bookings.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form-card">
        {message && (
          <div className={`review-form-message review-form-message-${messageType}`}>
            {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p>{message}</p>
          </div>
        )}

        {!packageId && (
          <div className="review-form-group">
            <label className="review-form-label">Select Package *</label>
            <select
              name="packageId"
              value={formData.packageId}
              onChange={handleChange}
              className="review-form-input"
              required
            >
              <option value="">Choose a package you've visited...</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="review-form-group">
          <label className="review-form-label">Rating *</label>
          <div className="review-form-stars">{renderStars()}</div>
          {formData.rating > 0 && (
            <p className="review-form-rating-text">
              {formData.rating} out of 5 stars
            </p>
          )}
        </div>

        <div className="review-form-group">
          <label className="review-form-label">Review Title (Optional)</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="review-form-input"
            placeholder="e.g., Amazing experience!"
            maxLength={200}
          />
        </div>

        <div className="review-form-group">
          <label className="review-form-label">Your Review *</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="review-form-textarea"
            placeholder="Share your experience (minimum 10 characters)..."
            rows="5"
            required
            minLength={10}
            maxLength={5000}
          />
          <p className="review-form-char-count">
            {formData.comment.length}/5000 characters
          </p>
        </div>

        {/* Photo Upload Section */}
        <div className="review-form-group">
          <label className="review-form-label">Add Photos (Optional)</label>
          <p className="review-form-helper">Share up to 5 photos from your trip</p>
          
          <div className="photo-upload-container">
            {photos.length < 5 && (
              <label className="photo-upload-button">
                <Camera size={24} />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
            
            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={photo.preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="photo-remove-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {photos.length > 0 && (
            <p className="review-form-helper">{photos.length} photo(s) selected</p>
          )}
        </div>

        <button 
          type="submit" 
          className="review-form-submit-btn"
          disabled={loading}
        >
          <Send size={20} />
          <span>{loading ? "Submitting..." : "Submit Review"}</span>
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
