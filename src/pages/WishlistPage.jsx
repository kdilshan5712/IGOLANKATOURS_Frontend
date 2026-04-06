import { useEffect } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import PackageCard from "../components/PackageCard";
import "./PackagesPage.css"; // Reusing classes from PackagesPage

const WishlistPage = () => {
    const { wishlistPackages, loading, fetchWishlistPackages, wishlistIds } = useWishlist();

    useEffect(() => {
        fetchWishlistPackages();
    }, [wishlistIds.length]); // Re-fetch if count changes

    return (
        <main className="packages-page" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="packages-page-container">
                {/* Page header */}
                <div className="packages-page-header">
                    <h1 className="packages-page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Heart className="fill-current text-red-500" size={32} />
                        My Wishlist
                    </h1>
                    <p className="packages-page-subtitle">
                        Your saved travel experiences
                    </p>
                </div>

                {/* Results */}
                <section className="packages-page-results" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    {loading ? (
                        <div className="packages-loading">
                            <p>Loading your saved packages...</p>
                        </div>
                    ) : wishlistPackages.length > 0 ? (
                        <div className="packages-page-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem',
                            padding: '2rem 0'
                        }}>
                            {wishlistPackages.map((pkg) => (
                                <PackageCard key={pkg.id} pkg={pkg} />
                            ))}
                        </div>
                    ) : (
                        <div className="packages-page-empty" style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '1rem',
                            marginTop: '2rem'
                        }}>
                            <Heart size={48} className="text-gray-300 mx-auto" style={{ margin: '0 auto', color: '#d1d5db', marginBottom: '1rem' }} />
                            <h3 className="packages-page-empty-title" style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
                                Your wishlist is empty
                            </h3>
                            <p className="packages-page-empty-text" style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                Start saving packages you like by clicking the heart icon.
                            </p>
                            <Link
                                to="/packages"
                                className="packages-page-empty-button"
                                style={{
                                    display: 'inline-block',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.5rem',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}
                            >
                                Explore Packages
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default WishlistPage;
