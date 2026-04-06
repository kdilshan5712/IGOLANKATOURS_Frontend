import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

/**
 * SEO component for managing dynamic meta tags and structured data.
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = "website", 
  canonicalUrl,
  structuredData 
}) => {
  const siteTitle = "I GO LANKA TOURS";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = "Experience the best of Sri Lanka with I GO LANKA TOURS. Curated travel packages, professional guides, and unforgettable memories.";
  const metaDescription = description || defaultDescription;
  const siteUrl = window.location.origin;
  const currentUrl = canonicalUrl || window.location.href;
  const defaultOgImage = `${siteUrl}/src/assets/Logo.jpg`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={ogImage || defaultOgImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  canonicalUrl: PropTypes.string,
  structuredData: PropTypes.object
};

export default SEO;
