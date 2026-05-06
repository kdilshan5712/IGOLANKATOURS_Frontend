/**
 * 🎯 I GO LANKA TOURS - Tour Review Submission Form
 * 
 * Secure interface for travelers to provide feedback on completed tours. 
 * Implements strict booking verification (only allows reviews for confirmed/
 * completed trips), multi-file photo uploads, and star-rating interactions.
 * 
 * @module ReviewForm
 */

import { useState, useEffect } from "react";
import { Star, Send, AlertCircle, CheckCircle, Camera, X } from "lucide-react";
import { reviewAPI, packageAPI, bookingAPI } from "../services/api";
import "./ReviewForm.css";

/**
 * ReviewForm Component
 * 
 * Orchestrates the submission of user reviews and professional verification of journey history.
 * 
 * @param {Object} props
 * @param {string|number} [props.packageId=null] - Pre-selected package ID context.
 * @returns {JSX.Element}
 */
const ReviewForm = ({ packageId = null }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
    packageId: packageId || "",
  });

  const [reviewType, setReviewType] = useState("tour"); // 'tour' or 'website'

  const [hoveredRating, setHoveredRating] = useState(0);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch user bookings only
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const bookingResult = await bookingAPI.getMy(token);
          if (bookingResult.success && bookingResult.bookings) {
            const confirmed = bookingResult.bookings.filter(b =>
              b.status === 'confirmed' || b.status === 'completed'
            );
            setConfirmedBookings(confirmed);

            const uniquePackagesMap = new Map();
            confirmed.forEach(booking => {
              if (booking.package_id && !uniquePackagesMap.has(booking.package_id)) {
                uniquePackagesMap.set(booking.package_id, {
                  package_id: booking.package_id,
                  name: booking.package_name || `Package #${booking.package_id}`
                });
              }
            });
            setPackages(Array.from(uniquePackagesMap.values()));
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setMessage("Failed to load your bookings. Please try again.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [token]);

  // Set initial package from props if available and valid
  useEffect(() => {
    if (packageId && packages.length > 0) {
      const hasBooked = packages.some(p => p.package_id === parseInt(packageId) || p.package_id === packageId);
      if (hasBooked) {
        setFormData(prev => ({ ...prev, packageId: packageId }));
      }
    }
  }, [packageId, packages]);

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

    if (!token) {
      setMessage("Please log in to submit a review");
      setMessageType("error");
      return;
    }

    if (reviewType === 'tour' && !formData.packageId) {
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

    if (reviewType === 'tour') {
      // Verify user has a confirmed booking for this package
      const hasBooking = confirmedBookings.some(b =>
        String(b.package_id) === String(formData.packageId)
      );

      if (!hasBooking) {
        setMessage("You can only review packages you have booked and completed.");
        setMessageType("error");
        return;
      }
    }

    setLoading(true);
    try {
      const reviewPayload = {
        reviewType: reviewType,
        packageId: reviewType === 'tour' ? formData.packageId : null,
        rating: formData.rating,
        title: formData.title || "",
        comment: formData.comment,
        images: photos.map(p => p.file)
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
        photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        setPhotos([]);
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
          fill={starValue <= (hoveredRating || formData.rating) ? "#d97706" : "none"}
          color={starValue <= (hoveredRating || formData.rating) ? "#d97706" : "#d1d5db"}
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
        <h2 className="review-form-title">Review Your Tour</h2>
        <p className="review-form-subtitle">
          Share your experience with other travelers
        </p>
      </div>

      {/* Review Type Tabs */}
      <div className="review-type-selector">
        <button
          className={`review-type-btn ${reviewType === 'tour' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setReviewType('tour');
          }}
        >
          Tour Experience
        </button>
        <button
          className={`review-type-btn ${reviewType === 'website' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setReviewType('website');
          }}
        >
          Website Experience
        </button>
      </div>

      {reviewType === 'tour' && packages.length === 0 && !loading && (
        <div className="review-form-warning">
          <AlertCircle size={20} />
          <p>You can only review packages you have booked and completed. We couldn't find any confirmed bookings in your history.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form-card">
        {message && (
          <div className={`review-form-message review-form-message-${messageType}`}>
            {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p>{message}</p>
          </div>
        )}

        {reviewType === 'tour' && !packageId && (
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
                <option key={pkg.package_id} value={pkg.package_id}>
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
