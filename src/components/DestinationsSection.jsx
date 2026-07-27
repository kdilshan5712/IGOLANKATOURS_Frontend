import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./DestinationsSection.css";

const DestinationsSection = () => {
  const destinations = [
    {
      name: "Sigiriya",
      category: "UNESCO Heritage",
      description: "Ancient rock fortress with panoramic views",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/sigiriyaRock.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvc2lnaXJpeWFSb2NrLnBuZyIsImlhdCI6MTc2ODU4NjYwMSwiZXhwIjoxODAwMTIyNjAxfQ.kJbe9kw-E0sHyWzKD1iHnkYNS5YBIkp-nezrLGprqbM",
    },
    {
      name: "Ella",
      category: "Hill Country",
      description: "Misty mountains and scenic train journeys",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/Ella.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvRWxsYS5wbmciLCJpYXQiOjE3Njg1ODY2MzEsImV4cCI6MTgwMDEyMjYzMX0.IeMAt_w-TgDGBIDv6kDt7Y2FFf9CjfDVN6wN5n5Qrdo",
    },
    {
      name: "Kandy",
      category: "Cultural Capital",
      description: "Sacred city rich in tradition and history",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/kandy.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMva2FuZHkucG5nIiwiaWF0IjoxNzY4NTg2NjU1LCJleHAiOjE4MDAxMjI2NTV9.v-Hpb3q5bbyAWt2e-FdMhCjMQbtRtTRrl3c1tkmqug0",
    },
    {
      name: "Tea Country",
      category: "Nature & Landscapes",
      description: "Lush tea plantations and waterfalls",
      image:
        "https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/nuwaraeliya.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvbnV3YXJhZWxpeWEucG5nIiwiaWF0IjoxNzY4NTg2Njc3LCJleHAiOjE4MDAxMjI2Nzd9.TOhXfG0ELcdYtm_kA3TURlVIfhO-wdgSaFuAYQgbN7s",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="destinations" className="destinations-section">
      <div className="destinations-container">
        {/* Header */}
        <motion.div 
          className="destinations-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="destinations-title">
            Must-visit places in <span>Sri Lanka</span>
          </h2>
          <p className="destinations-description">
            Discover iconic landmarks and beautiful landscapes across the
            island.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          className="destinations-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {destinations.map((destination, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Link
                to={`/destinations/${destination.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="destination-card"
              >
                <div className="destination-image-wrapper">
                  <img
                    src={destination.image}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070";
                    }}
                    alt={destination.name}
                    loading="lazy"
                    decoding="async"
                    className="destination-image"
                  />
                  <div className="destination-image-overlay" />
                  
                  {/* Category Badge over image */}
                  <div className="destination-badge">
                    <MapPin size={12} />
                    <span>{destination.category}</span>
                  </div>
                </div>

                <div className="destination-content">
                  <h3 className="destination-name">
                    {destination.name}
                  </h3>
                  <p className="destination-description">
                    {destination.description}
                  </p>
                  
                  <div className="destination-action">
                    <span>Explore Destination</span>
                    <motion.div 
                      className="destination-action-icon"
                      whileHover={{ x: 5 }}
                    >
                      &rarr;
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationsSection;
