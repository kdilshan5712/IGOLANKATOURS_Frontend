/**
 * 🎯 I GO LANKA TOURS - Premium About Page
 * 
 * Displays company information, mission statement, founder details,
 * and value propositions for travelers in a cinematic dark theme.
 * 
 * @module AboutPage
 */

import { CheckCircle, Award, Users, HeartHandshake, Compass } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import "./AboutPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const AboutPage = () => {
  const whyChooseUs = [
    {
      icon: <Compass size={24} />,
      title: "Local Knowledge",
      description: "We are based in Sri Lanka and have deep familiarity with the island's destinations, routes, and hidden gems.",
    },
    {
      icon: <Users size={24} />,
      title: "Experienced Team",
      description: "Our guides and drivers have years of experience and are trained to provide informative, respectful, and premium service.",
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Bespoke Itineraries",
      description: "We craft custom tour plans based on your unique interests—whether cultural, wildlife, beach, or adventure.",
    },
    {
      icon: <HeartHandshake size={24} />,
      title: "Reliable Service",
      description: "From well-maintained vehicles to reputable hotels, we ensure clear communication and a seamless journey.",
    },
  ];

  return (
    <main className="about-page">
      <SEO 
        title="About I GO LANKA TOURS – Sri Lanka's Premium Travel Experts"
        description="I GO LANKA TOURS is a trusted Sri Lanka tour operator with 15+ years of experience. We specialize in authentic, bespoke Sri Lanka travel experiences."
        keywords="i go lanka tours, sri lanka tour operator, luxury sri lanka travel, bespoke sri lanka tours, indika sampath, premium sri lanka travel"
        canonicalUrl="https://www.igolankatours.com/about"
      />

      {/* Ambient Effects */}
      <div className="about-ambient-glow-1"></div>
      <div className="about-ambient-glow-2"></div>

      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img 
            src="https://exfyprnpkplhzuuloebf.supabase.co/storage/v1/object/sign/tour-images/tour-images/destinations/sigiriyaRock.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMzVhYmI2Ny1lZDVkLTQ0MDktOGNiNS0wNGI4MjgzZGUxNmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0b3VyLWltYWdlcy90b3VyLWltYWdlcy9kZXN0aW5hdGlvbnMvc2lnaXJpeWFSb2NrLnBuZyIsImlhdCI6MTc2ODU4NjYwMSwiZXhwIjoxODAwMTIyNjAxfQ.kJbe9kw-E0sHyWzKD1iHnkYNS5YBIkp-nezrLGprqbM" 
            alt="Sigiriya Rock Sri Lanka" 
            className="about-hero-img"
            fetchPriority="high"
            decoding="async"
          />
          <div className="about-hero-overlay"></div>
        </div>
        
        <motion.div 
          className="about-hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 className="about-page-title" variants={fadeUp}>
            Crafting <span className="accent">Unforgettable</span> Journeys
          </motion.h1>
          <motion.p className="about-page-subtitle" variants={fadeUp}>
            Your trusted partner for premium, authentic Sri Lankan travel experiences.
          </motion.p>
        </motion.div>
      </section>

      <div className="about-page-container">
        
        {/* Who We Are */}
        <motion.section 
          className="about-section about-who-we-are"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <div className="about-section-header">
            <h2 className="about-section-title">Who We <span className="accent">Are</span></h2>
            <div className="about-section-divider"></div>
          </div>
          <p>
            I GO LANKA TOURS is a premium Sri Lankan tour operator specializing in
            personalized, high-quality travel experiences across the island. We orchestrate
            cultural immersions, luxurious beach holidays, thrilling wildlife safaris, and
            misty hill country escapes for discerning travelers from around the world.
          </p>
          <p>
            Operating directly from Sri Lanka, we maintain exclusive partnerships with top-tier hotels,
            elite local guides, and premium transport providers. We believe every journey is unique,
            and we take immense pride in curating tours that reflect your personal travel dreams.
          </p>
        </motion.section>

        {/* Our Founder */}
        <motion.section 
          className="about-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="about-section-header">
            <motion.h2 className="about-section-title" variants={fadeUp}>Our <span className="accent">Founder</span></motion.h2>
            <motion.div className="about-section-divider" variants={fadeUp}></motion.div>
          </div>

          <div className="about-founder-grid">
            <motion.div className="about-founder-text" variants={fadeUp}>
              <p>
                I GO LANKA TOURS was established by <strong>Indika Sampath</strong>,
                a veteran of the Sri Lankan tourism industry since 2010. Over his 15+ years of experience, 
                Indika has cultivated profound relationships with local experts, luxury accommodations, and 
                reliable transport networks across the island.
              </p>
              <p>
                Having orchestrated bespoke tours for travelers spanning Europe, Asia, the Americas, 
                and Australia, Indika possesses an intuitive understanding of international standards and expectations. 
                His hands-on philosophy and deep-rooted local knowledge guarantee that every itinerary is flawlessly 
                executed, culturally respectful, and exquisitely tailored.
              </p>
            </motion.div>

            <motion.div className="about-founder-image-wrapper" variants={fadeUp}>
              <div className="founder-badge-glass">
                <div className="founder-icon-wrapper">
                  <Award size={36} />
                </div>
                <p className="founder-badge-text">Since 2010</p>
                <p className="founder-badge-subtext">15+ Years of Excellence</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Travel With Us */}
        <motion.section 
          className="about-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="about-section-header">
            <motion.h2 className="about-section-title" variants={fadeUp}>The I GO LANKA <span className="accent">Difference</span></motion.h2>
            <motion.div className="about-section-divider" variants={fadeUp}></motion.div>
          </div>

          <div className="about-features-grid">
            {whyChooseUs.map((feature, index) => (
              <motion.div key={index} className="about-feature-card" variants={fadeUp}>
                <div className="about-feature-icon">{feature.icon}</div>
                <h3 className="about-feature-title">{feature.title}</h3>
                <p className="about-feature-description">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div className="about-additional-features" variants={fadeUp}>
            <ul className="about-features-list">
              <li>
                <CheckCircle size={24} />
                <div>
                  <strong>Transparent Luxury Pricing</strong>
                  <span>Our proposals include all primary costs upfront, with absolute clarity on inclusions and optional elite experiences. No hidden fees.</span>
                </div>
              </li>
              <li>
                <CheckCircle size={24} />
                <div>
                  <strong>Direct Local Coordination</strong>
                  <span>By working directly with our dedicated team in Sri Lanka, you bypass intermediaries, ensuring rapid responses and seamless execution.</span>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        {/* Our Commitment */}
        <motion.section 
          className="about-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <div className="about-commitment-card">
            <h2 className="about-section-title">Our <span className="accent">Commitment</span></h2>
            <p>
              At I GO LANKA TOURS, we are devoted to delivering perfectly orchestrated, enriching, 
              and unforgettable luxury travel experiences. We take immense pride in the caliber of our service 
              and the absolute satisfaction of our guests. Whether embarking on a romantic getaway, a family adventure, 
              or a solo exploration, we ensure your time in Sri Lanka is nothing short of magical.
            </p>
            <p className="about-commitment-closing">
              We look forward to welcoming you to our paradise island and sharing its unparalleled beauty and hospitality.
            </p>
          </div>
        </motion.section>

      </div>
    </main>
  );
};

export default AboutPage;
