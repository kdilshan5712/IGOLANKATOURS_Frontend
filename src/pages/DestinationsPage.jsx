/**
 * 🎯 I GO LANKA TOURS - Destinations Discovery Page
 * 
 * Provides a visual grid of Sri Lanka's top travel destinations. Integrates 
 * with the centralized DestinationsMap component to provide spatial context 
 * and category-based visual cues.
 * 
 * @module DestinationsPage
 */

import { useState, useEffect } from "react";
import { MapPin, ArrowRight, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import DestinationsMap from "../components/DestinationsMap";
import { destinationAPI } from "../services/api";
import SEO from "../components/SEO";
import "./DestinationsPage.css";

/**
 * DestinationsPage Component
 * 
 * Renders an curated list of hotspots and geographical zones, facilitating 
 * discovery before specific package selection.
 * 
 * @returns {JSX.Element}
 */
const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // @API_CALL: Fetch all geographic hotspots and details
        const response = await destinationAPI.getAll();
        if (response.success && Array.isArray(response.data)) {
          setDestinations(response.data);
        } else {
          console.error("Invalid destinations data:", response);
          setError("Failed to load destinations data.");
        }
      } catch (err) {
        // @ERROR_HANDLING: Persistent connection or API failure
        console.error("Failed to load destinations:", err);
        setError("Failed to load destinations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      Cultural: "bg-amber-100 text-amber-800",
      Nature: "bg-green-100 text-green-800",
      Beach: "bg-blue-100 text-blue-800",
      Wildlife: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <p className="text-red-500 text-xl">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Retry
        </button>
      </div>
    );
  }


  return (
    <main className="destinations-page">
      <SEO 
        title="Explore Sri Lanka Destinations"
        description="Discover the most beautiful destinations in Sri Lanka. From the ancient cities of the Cultural Triangle to the pristine beaches of the South Coast."
        keywords="Sri Lanka destinations, visit Sri Lanka, Sri Lanka travel guide, best places in Sri Lanka"
      />
      <div className="destinations-page-container">
        {/* Hero Header */}
        <div className="destinations-page-hero">
          <h1 className="destinations-page-title">
            Explore Sri Lanka's Most Loved Destinations
          </h1>
          <p className="destinations-page-subtitle">
            Discover the island's most captivating places, from ancient cities
            and misty mountains to pristine beaches and wildlife sanctuaries.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="destinations-page-grid">
          {destinations.map((destination, index) => (
            <div key={index} className="destination-page-card">
              <div className="destination-page-image-wrapper">
                {/* @ASSETS: Destination images are dynamically sourced from backend API with Unsplash fallback */}
                <img
                  src={destination.image_url || destination.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070"}
                  alt={destination.name}
                  className="destination-page-image"
                />
                <div className="destination-page-image-overlay" />
                <span
                  className={`destination-page-badge ${getCategoryColor(
                    destination.category
                  )}`}
                >
                  {destination.category}
                </span>
              </div>

              <div className="destination-page-content">
                <div className="destination-page-header">
                  <MapPin className="destination-page-icon" size={20} />
                  <h3 className="destination-page-name">{destination.name}</h3>
                </div>

                <p className="destination-page-description">
                  {destination.description}
                </p>

                <Link
                  to={`/destinations/${destination.id || destination.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="destination-page-link"
                >
                  Explore Features
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Map Section */}
        <DestinationsMap />

        {/* CTA Section */}
        <div className="destinations-page-cta">
          <h2 className="destinations-cta-title">
            Ready to explore these destinations?
          </h2>
          <p className="destinations-cta-text">
            Browse our curated tour packages or contact us to design your
            perfect Sri Lankan adventure.
          </p>
          <div className="destinations-cta-buttons">
            <Link to="/packages" className="btn-primary">
              Browse Tour Packages
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DestinationsPage;
