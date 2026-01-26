import { Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import "./PackageCard.css";

const PackageCard = ({ pkg }) => {
  return (
    <div className="package-card">
      {/* Image */}
      <div className="package-image-wrapper">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="package-image"
        />

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
              ${pkg.price}
              <span className="package-price-per">
                {" "}
                / person
              </span>
            </div>
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
