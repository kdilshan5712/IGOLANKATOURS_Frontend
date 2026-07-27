import { Plane, Users, Award, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import "./FeaturesSection.css";

const FeaturesSection = () => {
  const features = [
    {
      icon: Plane,
      title: "Seamless travel",
      description:
        "Smooth planning, reliable transport, and well-organized itineraries from start to finish.",
    },
    {
      icon: Users,
      title: "Local expert guides",
      description:
        "Certified local guides with deep knowledge of culture, history, and hidden gems.",
    },
    {
      icon: Award,
      title: "Trusted experience",
      description:
        "Highly rated by international travelers for quality, safety, and service.",
    },
    {
      icon: MapPin,
      title: "Carefully selected destinations",
      description:
        "A balanced mix of iconic landmarks, nature, wildlife, and authentic local experiences.",
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
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="features-section">
      <div className="features-container">
        {/* Header */}
        <motion.div 
          className="features-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="features-title">
            Why <span>travel with us</span>
          </h2>
          <p className="features-description">
            We focus on comfort, safety, and meaningful experiences — so you can
            enjoy Sri Lanka with complete peace of mind.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <feature.icon size={26} strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="feature-title">
                {feature.title}
              </h3>

              <p className="feature-description">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
