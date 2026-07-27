import { ArrowRight, Star, ShieldCheck, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./HeroSection.css";

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="hero-section">
      {/* Background - Supabase hero image */}
      <div className="hero-background">
        <img
          src="https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/hero/hero%20image.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9oZXJvL2hlcm8gaW1hZ2UucG5nIiwiaWF0IjoxNzY5NTEzOTYyLCJleHAiOjE4MDEwNDk5NjJ9.Gk4tkmnz9yqSbqlnr2KSiDhPYcbUARemGZdapthaaYY"
          alt="Sri Lanka Hero"
          className="hero-video"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content">
        <motion.div 
          className="hero-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="hero-title" variants={itemVariants}>
            AN AMAZING<span className="hero-title-accent">DESTINATION</span>
          </motion.h1>

          <motion.p className="hero-description" variants={itemVariants}>
            Handcrafted journeys across beaches, heritage cities, wildlife
            parks, and hill country — designed by local experts.
          </motion.p>

          {/* CTAs */}
          <motion.div className="hero-cta-container" variants={itemVariants}>
            <Link to="/packages" className="hero-cta-primary group">
              Explore Packages
              <motion.span
                className="inline-block ml-2"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </Link>

            <Link to="/custom-tour-chat" className="hero-cta-secondary">
              Customize Your Trip
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div className="hero-trust-container" variants={itemVariants}>
            <div className="hero-trust-item">
              <Star className="star-icon" size={18} />
              <span>4.9 rating · 2,500+ reviews</span>
            </div>

            <div className="hero-trust-item">
              <ShieldCheck className="shield-icon" size={18} />
              <span>Secure booking</span>
            </div>

            <div className="hero-trust-item">
              <Award className="award-icon" size={18} />
              <span>Certified local guides</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
