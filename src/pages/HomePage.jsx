/**
 * 🎯 I GO LANKA TOURS - Home Experience
 * 
 * The main landing page of the application, aggregating key sections
 * like Hero, Trust Badges, Features, Destinations, and Package Previews.
 * Serves as the primary entry point for brand discovery and SEO.
 * 
 * @module HomePage
 */

import HeroSection from "../components/HeroSection";
import TrustBadges from "../components/TrustBadges";
import FeaturesSection from "../components/FeaturesSection";
import DestinationsSection from "../components/DestinationsSection";
import PackagesPreview from "../components/PackagesPreview";
import TestimonialsSection from "../components/TestimonialsSection";
import SEO from "../components/SEO";

/**
 * HomePage Component
 * 
 * Renders the primary entry point of the website with SEO schema support.
 * 
 * @returns {JSX.Element}
 */
const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "I GO LANKA TOURS",
    "description": "Premium Sri Lanka Travel Experience. Discover the beauty of Sri Lanka with our curated tour packages.",
    "url": window.location.origin,
    "telephone": "+94 77 763 9196",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Katunayaka",
      "addressCountry": "LK"
    }
  };

  return (
    <>
      <SEO 
        title="Premium Sri Lanka Travel Experience"
        description="Discover the beauty of Sri Lanka with I GO LANKA TOURS. Curated tour packages, professional guides, and unforgettable memories."
        keywords="Sri Lanka tours, Sri Lanka travel, custom tours Sri Lanka, Sri Lanka vacation, adventure tours Sri Lanka"
        structuredData={structuredData}
      />
      <HeroSection />
      <TrustBadges />
      <FeaturesSection />
      <DestinationsSection />
      <PackagesPreview />
      <TestimonialsSection />
    </>
  );
};

export default HomePage;
