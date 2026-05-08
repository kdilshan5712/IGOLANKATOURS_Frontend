/**
 * 🎯 I GO LANKA TOURS - Packages Discovery Page
 * 
 * Provides a comprehensive interface for browsing, filtering, and searching 
 * available tour packages. Features multi-criteria filtering (budget, 
 * duration, category) and integration with the AI Chat Agent.
 * 
 * @module PackagesPage
 */

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PackageCard from "../components/PackageCard";
import PackageCardSkeleton from "../components/PackageCardSkeleton";
import FilterPanel from "../components/FilterPanel";
import { packageAPI, transformPackages } from "../services/api";
import SEO from "../components/SEO";
import "./PackagesPage.css";

/**
 * PackagesPage Component
 * 
 * Orchestrates the tour discovery process through asynchronous data fetching 
 * and client-side filtering logic.
 * 
 * @returns {JSX.Element}
 */
const PackagesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const packagesPerPage = 9;
  const navigate = useNavigate();

  // Fetch packages from API on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        // @API_CALL: Fetch all active tour packages
        const data = await packageAPI.getAll();
        if (data.success && data.packages) {
          setAllPackages(transformPackages(data.packages));
        }
      } catch (err) {
        // @ERROR_HANDLING: Network or server connectivity issue
        console.error("Error loading packages:", err);
        setError("Failed to load packages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Apply filters and search
  const filteredPackages = allPackages.filter((pkg) => {
    // Category filter
    if (selectedCategory !== "all" && pkg.category !== selectedCategory)
      return false;

    // Budget filter
    if (selectedBudget !== "all" && pkg.budget !== selectedBudget)
      return false;

    // Duration filter
    if (selectedDuration !== "all") {
      const days = parseInt(pkg.duration);
      if (selectedDuration === "short" && days > 5) return false;
      if (selectedDuration === "medium" && (days <= 5 || days > 7))
        return false;
      if (selectedDuration === "long" && days <= 7) return false;
    }

    // Hotel filter
    if (selectedHotel !== "all" && pkg.hotel !== selectedHotel) return false;

    // Search filter
    if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;

    return true;
  });

  // Apply sorting
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (a.currentPrice || a.price) - (b.currentPrice || b.price);
      case "price-desc":
        return (b.currentPrice || b.price) - (a.currentPrice || a.price);
      case "duration-asc":
        return parseInt(a.duration) - parseInt(b.duration);
      case "duration-desc":
        return parseInt(b.duration) - parseInt(a.duration);
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0);
      case "recommended":
      default:
        return 0; // Keep original API order
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPackages.length / packagesPerPage);
  const effectiveCurrentPage = currentPage > totalPages ? 1 : currentPage;
  const indexOfLastPackage = effectiveCurrentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = sortedPackages.slice(
    indexOfFirstPackage,
    indexOfLastPackage
  );

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedCategory("all");
    setSelectedBudget("all");
    setSelectedDuration("all");
    setSelectedHotel("all");
    setSearchQuery("");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <main className="packages-page">
      <SEO 
        title="Sri Lanka Tour Packages 2025 – Cultural, Beach & Wildlife"
        description="Browse curated Sri Lanka tour packages for 2025. Choose from cultural heritage tours, beach holidays in Mirissa & Galle, wildlife safaris in Yala, and hill country adventures in Ella & Nuwara Eliya. Best prices guaranteed."
        keywords="sri lanka tour packages, sri lanka holiday packages, best tours in sri lanka, affordable sri lanka tours, luxury sri lanka tours, 7 day sri lanka itinerary, 10 day sri lanka tour, sri lanka beach packages, sri lanka cultural tour, yala safari package, ella tour package, sigiriya day tour, sri lanka family packages, sri lanka honeymoon packages"
        canonicalUrl="https://www.igolankatours.com/packages"
        ogImage="https://www.igolankatours.com/og-image.jpg"
      />
      <div className="packages-page-container">
        {/* Page header */}
        <div className="packages-page-header">
          <h1 className="packages-page-title">Tour Packages in Sri Lanka</h1>
          <p className="packages-page-subtitle">
            Choose from carefully crafted travel experiences across the island
          </p>
        </div>

        {/* Search bar */}
        <div className="packages-search-wrapper">
          <div className="packages-search-bar">
            <Search size={20} className="packages-search-icon" />
            <input
              type="text"
              placeholder="Search packages by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="packages-search-input"
            />
          </div>
        </div>

        {/* Layout */}
        <div className="packages-page-layout">
          {/* Filters */}
          <aside className="packages-page-filters">
            <FilterPanel
              selectedCategory={selectedCategory}
              setSelectedCategory={handleFilterChange(setSelectedCategory)}
              selectedBudget={selectedBudget}
              setSelectedBudget={handleFilterChange(setSelectedBudget)}
              selectedDuration={selectedDuration}
              setSelectedDuration={handleFilterChange(setSelectedDuration)}
              selectedHotel={selectedHotel}
              setSelectedHotel={handleFilterChange(setSelectedHotel)}
              onReset={handleReset}
            />
          </aside>

          {/* Results */}
          <section className="packages-page-results">
            {loading ? (
              <div className="packages-page-grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <PackageCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="packages-error">
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="packages-page-results-header">
                  <p className="packages-page-count">
                    Showing{" "}
                    <span className="packages-page-count-number">
                      {indexOfFirstPackage + 1}-
                      {Math.min(indexOfLastPackage, sortedPackages.length)}
                    </span>{" "}
                    of{" "}
                    <span className="packages-page-count-number">
                      {sortedPackages.length}
                    </span>{" "}
                    packages
                  </p>

                  {sortedPackages.length > 0 && (
                    <div className="packages-sort-wrapper">
                      <label htmlFor="sort-packages" className="packages-sort-label">Sort by:</label>
                      <select
                        id="sort-packages"
                        className="packages-sort-select"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="recommended">Recommended</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="duration-asc">Duration: Short to Long</option>
                        <option value="duration-desc">Duration: Long to Short</option>
                        <option value="rating-desc">Highest Rated</option>
                      </select>
                    </div>
                  )}
                </div>

                {currentPackages.length > 0 ? (
                  <>
                    <div className="packages-page-grid">
                      {currentPackages.map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn pagination-arrow"
                        >
                          <ChevronLeft size={18} />
                          <span>Previous</span>
                        </button>

                        <div className="pagination-numbers">
                          {getPageNumbers().map((number, index) =>
                            number === "..." ? (
                              <span key={`ellipsis-${index}`} className="pagination-dots">
                                ...
                              </span>
                            ) : (
                              <button
                                key={`page-${number}`}
                                onClick={() => handlePageChange(number)}
                                className={`pagination-btn pagination-number ${currentPage === number ? "active" : ""
                                  }`}
                              >
                                {number}
                              </button>
                            )
                          )}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn pagination-arrow"
                        >
                          <span>Next</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="packages-page-empty">
                    <h3 className="packages-page-empty-title">
                      No packages found
                    </h3>
                    <p className="packages-page-empty-text">
                      Try adjusting or resetting your filters.
                    </p>
                    <button
                      onClick={handleReset}
                      className="packages-page-empty-button"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Floating AI Agent Widget */}
      <button
        className="floating-ai-widget"
        onClick={() => navigate('/custom-tour-chat')}
        title="Chat with our AI Travel Expert"
      >
        <span className="floating-ai-icon-container">
          <Sparkles size={24} color="#ffffff" />
        </span>
        <span className="floating-ai-text">Ask AI Agent</span>
      </button>

    </main>
  );
};

export default PackagesPage;
