import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { authAPI } from "./services/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import GuideLayout from "./layouts/GuideLayout";
import UserLayout from "./layouts/UserLayout";
import HomePage from "./pages/HomePage";
import PackagesPage from "./pages/PackagesPage";
import PackageDetailsPage from "./pages/PackageDetailsPage";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetailsPage from "./pages/DestinationDetailsPage";
import FAQPage from "./pages/FAQPage";
import AboutPage from "./pages/AboutPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactPage from "./pages/ContactPage";
import ChatAgentPage from "./pages/ChatAgentPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import BookingStartPage from "./pages/BookingStartPage";
import BookingTravellersPage from "./pages/BookingTravellersPage";
import BookingPaymentPage from "./pages/BookingPaymentPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import BookingFailurePage from "./pages/BookingFailurePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import GalleryPage from "./pages/GalleryPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import CancellationPolicyPage from "./pages/CancellationPolicyPage";
import GuideRegisterPage from "./pages/guide/GuideRegisterPage";
import GuideDocumentsPage from "./pages/guide/GuideDocumentsPage";
import GuidePendingPage from "./pages/guide/GuidePendingPage";
import GuideRejectedPage from "./pages/guide/GuideRejectedPage";
import GuideDashboardPage from "./pages/guide/GuideDashboardPage";
import GuideBookingsPage from "./pages/guide/GuideBookingsPage";
import GuideAvailabilityPage from "./pages/guide/GuideAvailabilityPage";
import GuideProfilePage from "./pages/guide/GuideProfilePage";
import GuideReviewsPage from "./pages/guide/GuideReviewsPage";
import WishlistPage from "./pages/WishlistPage";
// Admin imports
import AdminDashboardPage from "./pages/management/AdminDashboardPage";
import AdminPackagesPage from "./pages/management/AdminPackagesPage";
import AdminDestinationsPage from "./pages/management/AdminDestinationsPage";
import AdminBookingsPage from "./pages/management/AdminBookingsPage";
import AdminReviewsPage from "./pages/management/AdminReviewsPage";
import AdminUsersPage from "./pages/management/AdminUsersPage";
import AdminContactsPage from "./pages/management/AdminContactsPage";
import AdminCustomToursPage from "./pages/management/AdminCustomToursPage";
import AdminGuidesPage from "./pages/management/AdminGuidesPage";
import AdminProfilePage from "./pages/management/AdminProfilePage";
import AdminGalleryPage from "./pages/management/AdminGalleryPage";
import AdminManagementPage from "./pages/management/AdminManagementPage";
import AdminPricingRulesPage from "./pages/management/AdminPricingRulesPage";
import AdminPayoutsPage from "./pages/management/AdminPayoutsPage";
import AdminLoginPage from "./pages/management/AdminLoginPage";
import AdminFAQPage from "./pages/management/AdminFAQPage";
import AdminAuditLogsPage from "./pages/management/AdminAuditLogsPage";
// User Dashboard imports
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import UserBookings from "./pages/UserBookings";
import UserBookingDetails from "./pages/UserBookingDetails";
import UserCustomTours from "./pages/UserCustomTours";
// Session management
import { SESSION_CONFIG } from "./config/session";
import "./App.css";

function App() {
  // Validate session on app load
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const loginTimestamp = localStorage.getItem('loginTimestamp');

      if (!token) return;

      // Check if session is roughly near expiry or on app load
      // We attempt a silent refresh
      try {
        console.log('🔄 [App] Validating session via refresh token...');
        const result = await authAPI.refreshToken();
        if (!result.success) {
          console.warn('⚠️ [App] Session refresh failed, logging out');
          authAPI.logout();
        } else {
          console.log('✅ [App] Session renewed');
          localStorage.setItem('loginTimestamp', Date.now().toString());
        }
      } catch (err) {
        console.error('❌ [App] Session validation error:', err);
      }
    };

    validateSession();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Admin Routes - Using AdminLayout */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin" redirectTo="/login">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route path="destinations" element={<AdminDestinationsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="guides" element={<AdminGuidesPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="custom-tours" element={<AdminCustomToursPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="admins" element={<AdminManagementPage />} />
            <Route path="pricing-rules" element={<AdminPricingRulesPage />} />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="faqs" element={<AdminFAQPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Guide Routes - Using GuideLayout */}
          <Route path="/guide" element={
            <ProtectedRoute requiredRole="guide" redirectTo="/login">
              <GuideLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<GuideDashboardPage />} />
            <Route path="bookings" element={<GuideBookingsPage />} />
            <Route path="availability" element={<GuideAvailabilityPage />} />
            <Route path="profile" element={<GuideProfilePage />} />
            <Route path="reviews" element={<GuideReviewsPage />} />
          </Route>

          {/* Public Guide Routes (registration, documents, pending, rejected) */}
          <Route path="/guide/register" element={<GuideRegisterPage />} />
          <Route path="/guide/documents" element={<GuideDocumentsPage />} />
          <Route path="/guide/pending" element={<GuidePendingPage />} />
          <Route path="/guide/rejected" element={<GuideRejectedPage />} />

          {/* User Dashboard Routes - Using UserLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="tourist" redirectTo="/login">
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="custom-tours" element={<UserCustomTours />} />
            <Route path="bookings/:bookingId" element={<UserBookingDetails />} />
          </Route>

          {/* Tourist & Public Routes - With Navbar/Footer */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/packages" element={<PackagesPage />} />
                  <Route path="/packages/:id" element={<PackageDetailsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/destinations" element={<DestinationsPage />} />
                  <Route path="/destinations/:id" element={<DestinationDetailsPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/custom-tour-chat" element={<ChatAgentPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/booking/:id" element={<BookingStartPage />} />
                  <Route path="/booking/:id/travellers" element={<BookingTravellersPage />} />
                  <Route path="/booking/:id/payment" element={<BookingPaymentPage />} />
                  <Route path="/booking/:id/success" element={<BookingSuccessPage />} />
                  <Route path="/booking/:id/failure" element={<BookingFailurePage />} />
                  <Route path="/booking/failure" element={<BookingFailurePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/check-email" element={<CheckEmailPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-and-conditions" element={<TermsPage />} />
                  <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
