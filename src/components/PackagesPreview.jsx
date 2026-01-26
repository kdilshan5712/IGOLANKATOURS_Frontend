import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PackageCard from "./PackageCard";
import "./PackagesPreview.css";

const PackagesPreview = () => {
  const featuredPackages = [
    {
      id: 1,
      name: "Classic Sri Lanka Tour",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
      rating: 4.9,
      duration: "7 Days",
      price: 899,
      category: "Cultural",
      description:
        "Explore ancient cities, sacred temples, and UNESCO heritage sites.",
    },
    {
      id: 2,
      name: "Adventure & Nature Escape",
      image:
        "https://images.unsplash.com/photo-1568219656418-15c329312bf1?q=80&w=2070",
      rating: 4.8,
      duration: "5 Days",
      price: 699,
      category: "Adventure",
      description:
        "Hiking trails, waterfalls, and scenic hill country experiences.",
    },
    {
      id: 3,
      name: "Luxury Beach & Spa Retreat",
      image:
        "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
      rating: 5.0,
      duration: "4 Days",
      price: 1299,
      category: "Beach",
      description:
        "Relax on pristine beaches with world-class spa treatments.",
    },
  ];

  return (
    <section className="packages-preview-section">
      <div className="packages-preview-container">
        {/* Header */}
        <div className="packages-preview-header">
          <div>
            <h2 className="packages-preview-title">
              Popular tour packages
            </h2>
            <p className="packages-preview-description">
              Handpicked tours designed to give you the best of Sri Lanka
            </p>
          </div>

          <Link to="/packages" className="packages-preview-link">
            View all packages
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Grid */}
        <div className="packages-preview-grid">
          {featuredPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="packages-preview-mobile-cta">
          <Link to="/packages" className="packages-preview-mobile-link">
            View all packages
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesPreview;
