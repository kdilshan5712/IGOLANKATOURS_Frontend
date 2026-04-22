/**
 * 🎯 I GO LANKA TOURS - Package Exploration
 * 
 * Detailed view for a single tour package. Includes highlights, inclusions, 
 * day-by-day itinerary, interactive map, reviews, and dynamic price 
 * calculation based on seasonal rules and traveler count.
 * 
 * @module PackageDetailsPage
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, MapPin, Calendar, Users, Mail, Download, Image as ImageIcon, Sparkles, Heart } from "lucide-react";
import { packageAPI, authAPI } from "../services/api";
import { getCoordinates } from "../utils/sriLankaLocations";
import { useWishlist } from "../hooks/useWishlist";
import TourMap from "../components/TourMap";
import ReviewsList from "../components/ReviewsList";
import ReviewForm from "../components/ReviewForm";
import SocialShareButtons from "../components/SocialShareButtons";
import SEO from "../components/SEO";
import "./PackageDetailsPage.css";

// Mock/Dummy Package Data for demonstration
const DUMMY_PACKAGE_DATA = {
  package_id: 1,
  name: "Cultural Heritage Tour - 7 Days",
  description: "Explore Sri Lanka's rich cultural heritage with visits to ancient temples, UNESCO World Heritage Sites, and traditional villages. Experience the authentic culture and history of the island.",
  fullDescription: "This comprehensive 7-day tour takes you through the cultural triangle of Sri Lanka, visiting iconic sites like Sigiriya Rock Fortress, Temple of the Tooth in Kandy, ancient cave temples of Dambulla, and the colonial fort of Galle. You'll witness traditional dance performances, participate in cooking classes, and stay in heritage hotels that reflect the island's rich history.",
  price: 1299,
  duration: "7 Days / 6 Nights",
  category: "Cultural",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  highlights: [
    "Visit Sigiriya Rock Fortress - UNESCO World Heritage Site",
    "Explore the ancient city of Polonnaruwa",
    "Tour the Temple of the Tooth Relic in Kandy",
    "Witness traditional Kandyan dance performance",
    "Visit Dambulla Cave Temple with ancient Buddhist murals",
    "Explore Galle Fort - Dutch colonial architecture",
    "Experience a traditional Sri Lankan cooking class",
    "Tea plantation visit in Nuwara Eliya"
  ],
  included: [
    "Airport transfers and all transportation",
    "6 nights accommodation in 4-star hotels",
    "Daily breakfast and selected meals",
    "Professional English-speaking guide",
    "All entrance fees to monuments and sites",
    "Cultural show tickets",
    "Bottled water during tours",
    "Government taxes and service charges"
  ],
  notIncluded: [
    "International airfare",
    "Travel insurance",
    "Lunch and dinner (unless specified)",
    "Personal expenses and tips",
    "Alcoholic beverages",
    "Camera/video permits at sites",
    "Optional activities and excursions"
  ],
  itinerary: [
    { location: "Colombo", nights: 1, activities: ["City Tour", "Shopping"] },
    { location: "Sigiriya", nights: 2, activities: ["Lion Rock", "Village Tour"] },
    { location: "Kandy", nights: 1, activities: ["Temple of Tooth", "Cultural Show"] },
    { location: "Nuwara Eliya", nights: 1, activities: ["Tea Factory", "Gregory Lake"] },
    { location: "Galle", nights: 1, activities: ["Dutch Fort", "Turtle Hatchery"] }
  ]
};

/**
 * PackageDetailsPage Component
 * 
 * Orchestrates package data retrieval, dynamic pricing logic, and interactive 
 * elements for travelers exploring a specific tour.
 * 
 * @returns {JSX.Element}
 */
const PackageDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const isLoggedIn = authAPI.isAuthenticated();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(id);

  // Validate that we have a package ID
  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('[PackageDetails] Invalid or missing package ID');
      setError('Invalid package ID');
      setLoading(false);
      return;
    }
  }, [id]);

  // @SIDE_EFFECTS: Fetch full package details from API on mount or ID change
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        // @API_CALL: Fetch single package by ID
        const data = await packageAPI.getById(id);

        // @DATA_TRANSFORMATION: Parse serialized string fields (highlights, included, etc.) into arrays/objects
        if (data.highlights && typeof data.highlights === 'string') {
          try {
            data.highlights = JSON.parse(data.highlights);
          } catch {
            data.highlights = data.highlights.split('\n').filter(h => h.trim());
          }
        }

        if (data.included && typeof data.included === 'string') {
          try {
            data.included = JSON.parse(data.included);
          } catch {
            data.included = data.included.split('\n').filter(h => h.trim());
          }
        }

        if (data.notIncluded && typeof data.notIncluded === 'string') {
          try {
            data.notIncluded = JSON.parse(data.notIncluded);
          } catch {
            data.notIncluded = data.notIncluded.split('\n').filter(h => h.trim());
          }
        }


        if (data.itinerary && typeof data.itinerary === 'string') {
          try {
            data.itinerary = JSON.parse(data.itinerary);
          } catch {
            console.error("Failed to parse itinerary string");
            data.itinerary = [];
          }
        }

        setPackageData(data);
        setError(null);
      } catch (err) {
        // @ERROR_HANDLING: Fallback to dummy data if API fails to prevent white-screen
        console.error('Error fetching package:', err);
        setPackageData(DUMMY_PACKAGE_DATA);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  // key: price-calculation-effect
  // @SIDE_EFFECTS: Trigger dynamic price calculation when travelers or dates change (debounced)
  useEffect(() => {
    if (!packageData || !travelDate) return;

    const getPrice = async () => {
      setCalculating(true);
      try {
        // @API_CALL: Fetch season-adjusted and traveler-count adjusted price
        const res = await packageAPI.calculatePrice(id, travelDate, travelers);
        if (res.success) {
          setCalculatedPrice(res.pricing);
        }
      } catch (e) {
        // @ERROR_HANDLING: Log calculation failures
        console.error("Price calc error", e);
      } finally {
        setCalculating(false);
      }
    };

    const timer = setTimeout(getPrice, 500); // Debounce to avoid excessive API load
    return () => clearTimeout(timer);
  }, [id, packageData, travelDate, travelers]);

  const handleLoginClick = () => {
    navigate("/login", { state: { from: `/packages/${id}` } });
  };

  const handleMyBookingsClick = () => {
    navigate("/my-bookings");
  };

  const handleCustomize = () => {
    if (!packageData) return;
    navigate("/contact", { state: { packageId: id, packageName: packageData.name, customizeRequest: true } });
  };

  const handleContactUs = () => {
    if (!packageData) return;
    navigate("/contact", { state: { packageId: id, packageName: packageData.name } });
  };

  const handleDownloadItinerary = () => {
    // Generate text content for download
    let itineraryDaysText = '';

    if (packageData.itinerary && packageData.itinerary.length > 0) {
      itineraryDaysText = '\nDAY-BY-DAY ITINERARY:\n';
      packageData.itinerary.forEach((stop, index) => {
        let dayStart = 1;
        for (let i = 0; i < index; i++) {
          dayStart += packageData.itinerary[i].nights || 1;
        }
        const dayEnd = dayStart + (stop.nights || 1) - 1;
        const dayLabel = dayStart === dayEnd ? `Day ${dayStart}` : `Day ${dayStart}-${dayEnd}`;

        itineraryDaysText += `\n[ ${dayLabel} ] - ${stop.location} (${stop.nights} Nights)\n`;
        if (stop.hotel) itineraryDaysText += `Accommodation: ${stop.hotel}\n`;
        if (stop.activities && stop.activities.length > 0) {
          itineraryDaysText += `Activities:\n${stop.activities.map(a => `  - ${a}`).join('\n')}\n`;
        }
      });
    }

    const itineraryContent = `
I GO LANKA TOURS - Tour Itinerary
================================

Package: ${packageData.name}
Duration: ${packageData.duration}
Category: ${packageData.category}
Price: $${packageData.price} per person

TOUR HIGHLIGHTS:
${packageData.highlights?.map((h, i) => `${i + 1}. ${h}`).join('\n') || 'N/A'}
${itineraryDaysText}
WHAT'S INCLUDED:
${packageData.included?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'N/A'}

NOT INCLUDED:
${packageData.notIncluded?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'N/A'}

CONTACT INFORMATION:
Email: tours.igolanka@gmail.com
Phone: +94 77 763 9196

Thank you for choosing I GO LANKA TOURS!
    `;

    const blob = new Blob([itineraryContent.trim()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${packageData.name.replace(/\s+/g, '_')}_Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="package-details-page">
        <div className="package-details-loading">
          <p>Loading package details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="package-details-page">
        <div className="package-details-error">
          <p>{error}</p>
          <button onClick={() => navigate('/packages')}>Back to Packages</button>
        </div>
      </main>
    );
  }

  if (!packageData) {
    return (
      <main className="package-details-page">
        <div className="package-details-error">
          <p>Package not found</p>
          <button onClick={() => navigate('/packages')}>Back to Packages</button>
        </div>
      </main>
    );
  }

  return (
    <main className="package-details-page">
      <SEO 
        title={packageData.name}
        description={packageData.description}
        keywords={`${packageData.name}, Sri Lanka tour, ${packageData.category} tour Sri Lanka, ${packageData.duration}`}
        ogImage={packageData.image}
        ogType="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": packageData.name,
          "description": packageData.description,
          "image": packageData.image,
          "offers": {
            "@type": "Offer",
            "price": packageData.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
             "@type": "AggregateRating",
             "ratingValue": packageData.rating,
             "reviewCount": packageData.reviewStats?.totalReviews || 1
          }
        }}
      />
      {/* Hero Section */}
      <div className="package-details-hero">
        <img
          src={packageData.image}
          alt={packageData.name}
          className="package-details-hero-image"
        />
        <div className="package-details-hero-overlay">
          <div className="package-details-hero-content">
            <span className="package-details-category">{packageData.category}</span>
            <h1 className="package-details-hero-title">{packageData.name}</h1>
            <div className="package-details-hero-meta">
              <div className="package-details-hero-meta-item">
                <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                <span>{packageData.rating} Rating</span>
              </div>
              <div className="package-details-hero-meta-item">
                <Clock size={18} />
                <span>{packageData.duration}</span>
              </div>
              <div className="package-details-hero-meta-item">
                <MapPin size={18} />
                <span>Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="package-details-container">
        <div className="package-details-content">
          {/* Overview */}
          <section className="package-details-section">
            <h2 className="package-details-section-title">Overview</h2>
            <p className="package-details-description">{packageData.description}</p>
            {packageData.fullDescription && (
              <p className="package-details-full-description">{packageData.fullDescription}</p>
            )}
          </section>

          {/* Highlights */}
          <section className="package-details-section">
            <h2 className="package-details-section-title">Tour Highlights</h2>
            <ul className="package-details-list">
              {packageData.highlights?.map((highlight, index) => (
                <li key={index} className="package-details-list-item">
                  <span className="package-details-list-bullet">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          {/* Included/Not Included */}
          <section className="package-details-section">
            <div className="package-details-grid">
              <div>
                <h3 className="package-details-subsection-title">What's Included</h3>
                <ul className="package-details-list">
                  {packageData.included?.map((item, index) => (
                    <li key={index} className="package-details-list-item">
                      <span className="package-details-list-bullet included">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="package-details-subsection-title">Not Included</h3>
                <ul className="package-details-list">
                  {packageData.notIncluded?.map((item, index) => (
                    <li key={index} className="package-details-list-item">
                      <span className="package-details-list-bullet not-included">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Itinerary Section - Timeline View */}
          {packageData.itinerary && packageData.itinerary.length > 0 && (
            <section className="package-details-section">
              <h2 className="package-details-section-title">Day-by-Day Itinerary</h2>
              <div className="itinerary-timeline">
                {packageData.itinerary.map((stop, index) => (
                  <div key={index} className="itinerary-item">
                    <div className="itinerary-marker">
                      <div className="itinerary-dot"></div>
                      {index !== packageData.itinerary.length - 1 && <div className="itinerary-line"></div>}
                    </div>
                    <div className="itinerary-content">
                      <div className="itinerary-header">
                        <span className="itinerary-location">{stop.location}</span>
                        <span className="itinerary-nights">{stop.nights} Nights</span>
                      </div>

                      {stop.hotel && (
                        <div className="itinerary-hotel">
                          <span className="itinerary-label">Accommodation:</span> {stop.hotel}
                        </div>
                      )}

                      {stop.activities && stop.activities.length > 0 && (
                        <div className="itinerary-activities">
                          <span className="itinerary-label">Activities & Highlights:</span>
                          <ul className="itinerary-activity-list">
                            {stop.activities.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {((packageData.images && packageData.images.length > 0) || (packageData.reviewImages && packageData.reviewImages.length > 0)) && (
            <section className="package-details-section">
              <h2 className="package-details-section-title">Photo Gallery</h2>
              <div className="gallery-grid">
                {/* Package Images First */}
                {packageData.images?.map((imgUrl, index) => (
                  <div key={`pkg-${index}`} className="gallery-item">
                    <img src={imgUrl} alt={`${packageData.name} - Image ${index + 1}`} loading="lazy" />
                    <div className="gallery-overlay">
                      <ImageIcon size={24} />
                    </div>
                  </div>
                ))}
                {/* Review Images */}
                {packageData.reviewImages?.map((imgUrl, index) => (
                  <div key={`review-${index}`} className="gallery-item">
                    <img src={imgUrl} alt={`Guest photo ${index + 1}`} loading="lazy" />
                    <div className="gallery-overlay">
                      <ImageIcon size={24} />
                      <span className="gallery-badge">Guest Photo</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map Preview Section */}
          <section className="package-details-section">
            <h2 className="package-details-section-title">Tour Route & Locations</h2>
            <div className="map-preview-container">
              {packageData.itinerary && packageData.itinerary.length > 0 ? (
                <TourMap
                  locations={packageData.itinerary.map(stop => {
                    const coords = getCoordinates(stop.location);
                    return {
                      name: stop.location,
                      lat: coords?.lat || 7.8731, // Default to center if unknown
                      lng: coords?.lng || 80.7718,
                      description: stop.activities?.join(', ') || `Stay in ${stop.location}`,
                      duration: `${stop.nights} Night${stop.nights > 1 ? 's' : ''}`
                    };
                  })}
                  routePath={true}
                  height="450px"
                />
              ) : (
                <div className="map-placeholder">Map data unavailable</div>
              )}

              <div className="locations-list">
                <h3 className="locations-title">Tour Itinerary Highlights</h3>
                <div className="location-items">
                  {packageData.itinerary && packageData.itinerary.length > 0 ? (
                    packageData.itinerary.map((stop, index) => {
                      // Calculate day range
                      // Simple logic: cumulative nights.
                      // To do it perfectly, we'd need to reduce the array up to this index.
                      // For now, let's just show "Day X" type logic based on index + 1 if we assume 1 stop = 1 day logic roughly,
                      // OR better: calculate cumulative nights to show "Day 1-2: Sigiriya"

                      let dayStart = 1;
                      const itinerary = packageData.itinerary;
                      for (let i = 0; i < index; i++) {
                        dayStart += itinerary[i].nights || 1;
                      }
                      const dayEnd = dayStart + (stop.nights || 1) - 1;
                      const dayLabel = dayStart === dayEnd ? `Day ${dayStart}` : `Day ${dayStart}-${dayEnd}`;

                      return (
                        <div key={index} className="location-item">
                          <MapPin size={20} className="location-get-icon" style={{ marginTop: '5px', flexShrink: 0 }} />
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <strong>{stop.location}</strong>
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#b45309', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>
                                {dayLabel}
                              </span>
                            </div>

                            {stop.hotel && (
                              <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '2px 0', fontStyle: 'italic' }}>
                                🏨 {stop.hotel}
                              </p>
                            )}

                            {stop.activities && stop.activities.length > 0 && (
                              <ul style={{ paddingLeft: '15px', margin: '4px 0', fontSize: '0.85rem', color: '#666' }}>
                                {stop.activities.map((act, i) => (
                                  <li key={i}>{act}</li>
                                ))}
                              </ul>
                            )}

                            <small className="text-gray-500">{stop.nights} Night{stop.nights > 1 ? 's' : ''}</small>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No detailed itinerary available.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="package-details-section">
            <ReviewsList packageId={id} limit={10} />
          </section>

          {/* Review Form Section */}
          <section className="package-details-section">
            <ReviewForm packageId={id} />
          </section>
        </div>

        {/* Booking Sidebar */}
        <aside className="package-details-sidebar">
          <div className="package-details-booking-card">
            <div className="package-details-price-section">
              <span className="package-details-price-label">
                {calculatedPrice ? "Total Price" : "From"}
              </span>
              <div className="package-details-price">
                {calculating ? (
                  <span className="text-gray-400 text-sm">Calculating...</span>
                ) : calculatedPrice ? (
                  <>
                    ${calculatedPrice.totalPrice}
                    <span className="package-details-price-per"> / total</span>
                  </>
                ) : (
                  <>
                    ${packageData.price}
                    <span className="package-details-price-per"> / person</span>
                  </>
                )}
              </div>
              {calculatedPrice && (
                <div className="package-price-breakdown" style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                  <div>{calculatedPrice.seasonLabel} Season applied</div>
                  <div>${calculatedPrice.pricePerPerson} per person x {travelers}</div>
                </div>
              )}
            </div>

            <div className="package-booking-inputs" style={{ marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: '500' }}>Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: '500' }}>Travelers</label>
                <input
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setTravelers("");
                      return;
                    }
                    const num = parseInt(val);
                    setTravelers(isNaN(num) ? 1 : num);
                  }}
                  onBlur={() => {
                    if (travelers === "" || travelers < 1) setTravelers(1);
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>

            {/* Review Stats */}
            {packageData.reviewStats && packageData.reviewStats.totalReviews > 0 && (
              <div className="package-details-stats-section">
                <div className="stats-rating">
                  <Star size={24} fill="#fbbf24" stroke="#fbbf24" />
                  <span className="stats-rating-value">{packageData.reviewStats.averageRating}</span>
                  <span className="stats-rating-count">({packageData.reviewStats.totalReviews} reviews)</span>
                </div>
                <div className="stats-distribution">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = packageData.reviewStats.ratingDistribution[rating];
                    const percentage = packageData.reviewStats.totalReviews > 0
                      ? (count / packageData.reviewStats.totalReviews) * 100
                      : 0;
                    return (
                      <div key={rating} className="stats-bar">
                        <span className="stats-bar-label">{rating}★</span>
                        <div className="stats-bar-track">
                          <div
                            className="stats-bar-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="stats-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="package-details-cta-section">
              {!isLoggedIn ? (
                <button
                  onClick={handleLoginClick}
                  className="package-details-btn package-details-btn-primary"
                >
                  <Calendar size={18} />
                  Login to Book
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!id || id === 'undefined' || id === 'null') {
                      console.error('[PackageDetails] Cannot book - invalid package ID');
                      alert('Invalid package ID. Please try again.');
                      return;
                    }

                    if (!travelDate) {
                      alert('Please select a travel date to proceed.');
                      return;
                    }

                    navigate(`/booking/${id}`, {
                      state: {
                        packageId: id,
                        travelDate,
                        travelers,
                        priceSnapshot: calculatedPrice
                      }
                    });
                  }}
                  className="package-details-btn package-details-btn-primary"
                  disabled={!id || id === 'undefined' || id === 'null'}
                >
                  <Calendar size={18} />
                  Book Now
                </button>
              )}

              <button
                onClick={handleCustomize}
                className="package-details-btn package-details-btn-secondary"
              >
                <Users size={18} />
                Customize Tour
              </button>

              <button
                onClick={() => navigate('/custom-tour-chat', { state: { prefillContext: `Tell me about the ${packageData.name} package` } })}
                className="package-details-btn"
                style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white', borderColor: 'transparent' }}
              >
                <Sparkles size={18} />
                Ask AI Agent
              </button>

              <button
                onClick={handleContactUs}
                className="package-details-btn package-details-btn-outline"
              >
                <Mail size={18} />
                Contact Us
              </button>

              <button
                onClick={handleDownloadItinerary}
                className="package-details-btn package-details-btn-download"
              >
                <Download size={18} />
                Download Itinerary
              </button>

              <button
                onClick={() => toggleWishlist(id)}
                className={`package-details-btn ${isSaved ? "package-details-btn-saved" : "package-details-btn-outline"}`}
                style={isSaved ? { borderColor: '#ef4444', color: '#ef4444', backgroundColor: '#fef2f2' } : {}}
              >
                <Heart size={18} className={isSaved ? "fill-current" : ""} />
                {isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            <SocialShareButtons
              url={window.location.href}
              title={packageData.name}
            />

            <div className="package-details-info-box">
              <h4 className="package-details-info-title">Need Help?</h4>
              <p className="package-details-info-text">
                Our travel experts are available 24/7 to assist you with bookings and questions.
              </p>
              <p className="package-details-info-contact">
                📞 +94 77 763 9196<br />
                ✉️ tours.igolanka@gmail.com
              </p>
            </div>
          </div>
        </aside>
      </div >

      {/* Floating Mobile CTA */}
      <div className="mobile-floating-cta">
        <div className="mobile-cta-price">
          <span className="mobile-cta-label">From</span>
          <span className="mobile-cta-amount">${calculatedPrice ? calculatedPrice.pricePerPerson : packageData.price}</span>
        </div>
        <button
          className="mobile-cta-btn"
          onClick={() => {
            if (!isLoggedIn) {
              handleLoginClick();
            } else {
              if (!travelDate) {
                // Scroll up to the date picker
                const bookingCard = document.querySelector('.package-details-booking-card');
                if (bookingCard) {
                  bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Add a quick pulse effect to draw attention
                  bookingCard.classList.add('pulse-highlight');
                  setTimeout(() => bookingCard.classList.remove('pulse-highlight'), 1500);
                }
                return;
              }
              navigate(`/booking/${id}`, {
                state: {
                  packageId: id,
                  travelDate,
                  travelers,
                  priceSnapshot: calculatedPrice
                }
              });
            }
          }}
        >
          Book Now
        </button>
      </div>
    </main >
  );
};

export default PackageDetailsPage;
