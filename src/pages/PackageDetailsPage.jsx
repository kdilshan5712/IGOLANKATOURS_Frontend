import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, MapPin, Calendar, Users, Mail, Download, Image as ImageIcon } from "lucide-react";
import { packageAPI, authAPI } from "../services/api";
import TourMap from "../components/TourMap";
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
  ]
};

const PackageDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isLoggedIn = authAPI.isAuthenticated();

  // Validate that we have a package ID
  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('[PackageDetails] Invalid or missing package ID');
      setError('Invalid package ID');
      setLoading(false);
      return;
    }
  }, [id]);

  useEffect(() => {
    // Skip fetch if id is invalid
    if (!id || id === 'undefined' || id === 'null') {
      return;
    }

    const fetchPackage = async () => {
      try {
        setLoading(true);
        const data = await packageAPI.getById(id);
        
        // Parse array fields if they're strings
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
        
        setPackageData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching package:', err);
        // Use dummy data when API fails
        setPackageData(DUMMY_PACKAGE_DATA);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

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
    // UI simulation of downloading itinerary
    const itineraryContent = `
I GO LANKA TOURS - Tour Itinerary
================================

Package: ${packageData.name}
Duration: ${packageData.duration}
Category: ${packageData.category}
Price: $${packageData.price} per person

TOUR HIGHLIGHTS:
${packageData.highlights?.map((h, i) => `${i + 1}. ${h}`).join('\n') || 'N/A'}

WHAT'S INCLUDED:
${packageData.included?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'N/A'}

NOT INCLUDED:
${packageData.notIncluded?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'N/A'}

CONTACT INFORMATION:
Email: info@igolankatours.com
Phone: +94 77 123 4567

Thank you for choosing I GO LANKA TOURS!
    `;

    const blob = new Blob([itineraryContent], { type: 'text/plain' });
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

          {/* Itinerary Section */}
          {packageData.itinerary && packageData.itinerary.length > 0 && (
            <section className="package-details-section">
              <h2 className="package-details-section-title">Day-by-Day Itinerary</h2>
              <div className="itinerary-container">
                {packageData.itinerary.map((day, index) => (
                  <div key={index} className="itinerary-day">
                    <div className="itinerary-day-header">
                      <div className="itinerary-day-number">Day {day.day}</div>
                      <h3 className="itinerary-day-title">{day.title}</h3>
                    </div>
                    <p className="itinerary-day-description">{day.description}</p>
                    {day.locations && day.locations.length > 0 && (
                      <div className="itinerary-day-locations">
                        <MapPin size={16} />
                        <span>{day.locations.join(' • ')}</span>
                      </div>
                    )}
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
                    <img src={imgUrl} alt={`${packageData.name} - Image ${index + 1}`} />
                    <div className="gallery-overlay">
                      <ImageIcon size={24} />
                    </div>
                  </div>
                ))}
                {/* Review Images */}
                {packageData.reviewImages?.map((imgUrl, index) => (
                  <div key={`review-${index}`} className="gallery-item">
                    <img src={imgUrl} alt={`Guest photo ${index + 1}`} />
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
              <TourMap 
                locations={[
                  { name: 'Colombo', lat: 6.9271, lng: 79.8612, description: 'Starting point - Capital city', duration: 'Day 1' },
                  { name: 'Sigiriya', lat: 7.9570, lng: 80.7603, description: 'Ancient rock fortress', duration: 'Day 2-3' },
                  { name: 'Kandy', lat: 7.2906, lng: 80.6337, description: 'Cultural hub - Temple of the Tooth', duration: 'Day 4' },
                  { name: 'Ella', lat: 6.8667, lng: 81.0467, description: 'Scenic mountains and tea plantations', duration: 'Day 5' },
                  { name: 'Galle', lat: 6.0535, lng: 80.2210, description: 'Historic fort and coastal beauty', duration: 'Day 6-7' }
                ]}
                routePath={true}
                height="450px"
              />
              <div className="locations-list">
                <h3 className="locations-title">Tour Itinerary Highlights</h3>
                <div className="location-items">
                  <div className="location-item">
                    <MapPin size={20} />
                    <div>
                      <strong>Day 1-2: Colombo & Sigiriya</strong>
                      <p>Arrival in capital city, transfer to Sigiriya Rock Fortress</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <MapPin size={20} />
                    <div>
                      <strong>Day 3-4: Kandy</strong>
                      <p>Visit Temple of the Tooth, cultural dance performance</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <MapPin size={20} />
                    <div>
                      <strong>Day 5: Ella</strong>
                      <p>Scenic train journey, tea plantations, Nine Arch Bridge</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <MapPin size={20} />
                    <div>
                      <strong>Day 6-7: Galle</strong>
                      <p>Dutch colonial fort, beach relaxation, departure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <aside className="package-details-sidebar">
          <div className="package-details-booking-card">
            <div className="package-details-price-section">
              <span className="package-details-price-label">From</span>
              <div className="package-details-price">
                ${packageData.price}
                <span className="package-details-price-per"> / person</span>
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
                    navigate(`/booking/${id}`);
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
            </div>

            <div className="package-details-info-box">
              <h4 className="package-details-info-title">Need Help?</h4>
              <p className="package-details-info-text">
                Our travel experts are available 24/7 to assist you with bookings and questions.
              </p>
              <p className="package-details-info-contact">
                📞 +94 77 123 4567<br />
                ✉️ info@igolankatours.com
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default PackageDetailsPage;
