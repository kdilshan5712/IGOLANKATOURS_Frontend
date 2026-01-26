import { Plane, Users, Award, MapPin } from "lucide-react";
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

  return (
    <section className="features-section">
      <div className="features-container">
        {/* Header */}
        <div className="features-header">
          <h2 className="features-title">
            Why travel with us
          </h2>
          <p className="features-description">
            We focus on comfort, safety, and meaningful experiences — so you can
            enjoy Sri Lanka with complete peace of mind.
          </p>
        </div>

        {/* Features */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
            >
              <div className="feature-icon">
                <feature.icon size={22} />
              </div>

              <h3 className="feature-title">
                {feature.title}
              </h3>

              <p className="feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
