import { ArrowRight, Star, ShieldCheck, Award } from "lucide-react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero-section">
      {/* Background */}
      <div className="hero-background">
        <img
          src="https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/hero/hero.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9oZXJvL2hlcm8ucG5nIiwiaWF0IjoxNzY4NTg3ODg3LCJleHAiOjE4MDAxMjM4ODd9.vuqIo1i8FyjfkNVAyhKciQehE6PFn2QO-zu7Otwto4E"
          alt="Sri Lanka travel"
        />
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-container">
          <h1 className="hero-title">
            Discover your perfect
            <span className="hero-title-accent">
              Sri Lankan adventure
            </span>
          </h1>

          <p className="hero-description">
            Handcrafted journeys across beaches, heritage cities, wildlife
            parks, and hill country — designed by local experts.
          </p>

          {/* CTAs */}
          <div className="hero-cta-container">
            <Link
              to="/packages"
              className="hero-cta-primary"
            >
              Explore Packages
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/customize"
              className="hero-cta-secondary"
            >
              Customize Your Trip
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="hero-trust-container">
            <div className="hero-trust-item">
              <Star className="star-icon" size={20} />
              <span>
                4.9 rating · 2,500+ reviews
              </span>
            </div>

            <div className="hero-trust-item">
              <ShieldCheck size={20} />
              <span>Secure booking</span>
            </div>

            <div className="hero-trust-item">
              <Award size={20} />
              <span>Certified local guides</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
