/**
 * 🎯 I GO LANKA TOURS - Tour Package Card Component
 * 
 * Visual representation of a tour package in grid/list views. Displays 
 * high-level metadata (price, duration, rating) and provides integrated 
 * wishlist management and direct navigation to booking/details.
 * 
 * @module PackageCard
 */

import { Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import "./PackageCard.css";

/**
 * PackageCard Component
 * 
 * Renders a standardized tour package summary card.
 * 
 * @param {Object} props
 * @param {Object} props.pkg - The tour package data object.
 * @returns {JSX.Element}
 */
const PackageCard = ({ pkg }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(pkg.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(pkg.id);
  };

  return (
    <div className="package-card">
      {/* Image */}
      <div className="package-image-wrapper">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="package-image"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          className={`package-wishlist-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={20} className={isSaved ? "fill-current text-red-500" : ""} />
        </button>

        {/* Category */}
        <span className="package-category">
          {pkg.category}
        </span>

        {/* Rating */}
        <div className="package-rating">
          <Star size={14} />
          <span className="package-rating-value">
            {pkg.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="package-content">
        <h3 className="package-title">
          {pkg.name}
        </h3>

        <p className="package-description">
          {pkg.description}
        </p>

        {/* Meta */}
        <div className="package-meta">
          <div className="package-meta-item">
            <Clock size={16} />
            <span>{pkg.duration}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="package-footer">
          <div>
            <span className="package-price-label">From</span>
            <div className="package-price">
              ${pkg.currentPrice || pkg.price}
              <span className="package-price-per">
                {" "}
                / person
              </span>
            </div>
            {pkg.seasonLabel && (
              <div className="package-season-label" style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                {pkg.seasonLabel} Pricing
              </div>
            )}
          </div>

          <div className="package-actions">
            <Link to={`/packages/${pkg.id}`} className="package-button package-button-outline">
              View Details
            </Link>
            <Link to={`/booking/${pkg.id}`} className="package-button">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
