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
  // Schema.org structured data — Google uses this for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": "https://www.igolankatours.com/#organization",
        "name": "I GO LANKA TOURS",
        "description": "Premier Sri Lanka tour operator offering curated travel packages, expert local guides, and unforgettable experiences. Specializing in cultural tours, wildlife safaris, beach holidays, and custom Sri Lanka itineraries.",
        "url": "https://www.igolankatours.com",
        "telephone": "+94777639196",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Katunayaka",
          "addressRegion": "Western Province",
          "addressCountry": "LK"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "7.1691",
          "longitude": "79.8840"
        },
        "image": "https://www.igolankatours.com/og-image.jpg",
        "priceRange": "$$",
        "currenciesAccepted": "USD, LKR, EUR, GBP",
        "paymentAccepted": "Credit Card, Bank Transfer",
        "areaServed": { "@type": "Country", "name": "Sri Lanka" },
        "knowsAbout": [
          "Sri Lanka tourism", "Sigiriya Lion Rock", "Ella Nine Arch Bridge",
          "Kandy Temple of the Tooth", "Galle Dutch Fort", "Mirissa Beach",
          "Yala National Park", "Udawalawe elephant safari", "Dambulla Cave Temple",
          "Adam's Peak pilgrimage", "Nuwara Eliya tea country", "Arugam Bay surfing",
          "Sri Lanka honeymoon packages", "Sri Lanka family tours"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.igolankatours.com/#website",
        "url": "https://www.igolankatours.com",
        "name": "I GO LANKA TOURS",
        "description": "Best Sri Lanka Tours & Travel Packages 2025",
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.igolankatours.com/packages?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <>
      <SEO 
        title="Sri Lanka Tours & Travel Packages 2025"
        description="Discover the best of Sri Lanka with I GO LANKA TOURS. Book curated tour packages to Sigiriya, Ella, Kandy, Galle & Mirissa. Expert local guides, best prices, unforgettable Sri Lankan adventures."
        keywords="sri lankan tourism, best places to visit in sri lanka, sri lanka tours, sri lanka travel packages, srilanka holidays, visit sri lanka, sigiriya tours, ella sri lanka, kandy tours, galle fort, mirissa beach, sri lanka itinerary, sri lanka tour operator"
        canonicalUrl="https://www.igolankatours.com/"
        ogImage="https://www.igolankatours.com/og-image.jpg"
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
