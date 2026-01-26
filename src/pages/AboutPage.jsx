import { CheckCircle, Award, Users, HeartHandshake } from "lucide-react";
import "./AboutPage.css";

const AboutPage = () => {
  const whyChooseUs = [
    {
      icon: <Award size={24} />,
      title: "Local Knowledge",
      description: "We are based in Sri Lanka and have deep familiarity with the island's destinations, routes, and seasonal conditions.",
    },
    {
      icon: <Users size={24} />,
      title: "Experienced Team",
      description: "Our guides and drivers have years of experience working with international travelers and are trained to provide informative and respectful service.",
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Personalized Itineraries",
      description: "We create custom tour plans based on your interests, whether you prefer cultural sites, nature, wildlife, beaches, or a combination.",
    },
    {
      icon: <HeartHandshake size={24} />,
      title: "Reliable Service",
      description: "We use well-maintained vehicles, work with reputable hotels, and provide clear communication before and during your trip.",
    },
  ];

  return (
    <main className="about-page">
      <div className="about-page-container">
        {/* Hero Section */}
        <div className="about-hero">
          <h1 className="about-page-title">About I GO LANKA TOURS</h1>
          <p className="about-page-subtitle">
            Your trusted partner for authentic Sri Lankan travel experiences
          </p>
        </div>

        {/* Who We Are */}
        <section className="about-section">
          <h2 className="about-section-title">Who We Are</h2>
          <div className="about-section-content">
            <p>
              I GO LANKA TOURS is a Sri Lankan tour operator specializing in
              personalized travel experiences across the island. We organize
              cultural tours, beach holidays, wildlife safaris, hill country
              excursions, and custom itineraries for travelers from around the
              world. Based in Sri Lanka, we work directly with local hotels,
              experienced guides, and reliable transport providers to ensure
              smooth and well-planned journeys.
            </p>
            <p>
              Our focus is on offering authentic experiences, transparent
              pricing, and dependable service to guests exploring Sri Lanka. We
              understand that every journey is unique, and we take pride in
              creating tours that reflect the interests and preferences of each
              traveler.
            </p>
          </div>
        </section>

        {/* Our Founder */}
        <section className="about-section about-founder">
          <div className="about-founder-content">
            <div className="about-founder-text">
              <h2 className="about-section-title">Our Founder</h2>
              <p>
                I GO LANKA TOURS was founded by <strong>Indika Sampath</strong>,
                who has been working in the Sri Lankan tourism industry since
                2010. With over 15 years of experience, Indika has built strong
                relationships with local guides, accommodation providers, and
                transport operators across the country.
              </p>
              <p>
                He has coordinated tours for travelers from Europe, Asia, North
                America, and Australia, gaining firsthand insight into what
                international visitors expect when traveling in Sri Lanka. His
                hands-on approach and local knowledge help ensure that each tour
                is well-organized, culturally respectful, and tailored to the
                interests of the guests.
              </p>
            </div>
            <div className="about-founder-image">
              <div className="founder-badge">
                <Award size={48} />
                <p className="founder-badge-text">Since 2010</p>
                <p className="founder-badge-subtext">15+ Years Experience</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Experience & Approach */}
        <section className="about-section">
          <h2 className="about-section-title">Our Experience & Approach</h2>
          <div className="about-section-content">
            <p>
              We understand that every traveler has different interests,
              schedules, and preferences. Our approach is to listen carefully to
              what guests are looking for and design itineraries that match their
              needs. We work with experienced local guides who provide clear
              information about Sri Lanka's history, culture, and natural
              environment.
            </p>
            <p>
              Our team stays in regular contact with guests throughout their
              journey to address any questions or changes. We also maintain
              direct partnerships with hotels and transport services, which
              allows us to coordinate logistics efficiently and respond quickly
              if adjustments are needed.
            </p>
          </div>
        </section>

        {/* Why Travel With Us */}
        <section className="about-section about-why-choose">
          <h2 className="about-section-title">Why Travel With Us</h2>
          <div className="about-features-grid">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="about-feature-card">
                <div className="about-feature-icon">{feature.icon}</div>
                <h3 className="about-feature-title">{feature.title}</h3>
                <p className="about-feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="about-additional-features">
            <ul className="about-features-list">
              <li>
                <CheckCircle size={20} />
                <span>
                  <strong>Transparent Pricing:</strong> Our quotes include all
                  main costs upfront, with no hidden fees. We explain what is
                  covered and what is optional.
                </span>
              </li>
              <li>
                <CheckCircle size={20} />
                <span>
                  <strong>Direct Communication:</strong> You work directly with
                  our team in Sri Lanka, ensuring faster responses and better
                  coordination.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="about-section about-commitment">
          <div className="about-commitment-card">
            <h2 className="about-section-title">Our Commitment</h2>
            <p>
              At I GO LANKA TOURS, we are committed to providing well-organized,
              respectful, and memorable travel experiences in Sri Lanka. We take
              pride in the quality of our service and the satisfaction of our
              guests. Whether you are traveling solo, with family, or in a group,
              we aim to make your visit to Sri Lanka smooth, enjoyable, and
              enriching.
            </p>
            <p className="about-commitment-closing">
              We look forward to welcoming you to our island and sharing its
              beauty, history, and hospitality with you.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
