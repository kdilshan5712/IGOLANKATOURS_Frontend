import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import GuideLayout from './layouts/GuideLayout';
import UserLayout from './layouts/UserLayout';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Services
import { authAPI } from './services/api';

// Pages
import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import PackageDetailsPage from './pages/PackageDetailsPage';
import WishlistPage from './pages/WishlistPage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailsPage from './pages/DestinationDetailsPage';
import FAQPage from './pages/FAQPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ReviewsPage from './pages/ReviewsPage';
import ChatAgentPage from './pages/ChatAgentPage';
import ContactPage from './pages/ContactPage';
import BookingStartPage from './pages/BookingStartPage';
import BookingTravellersPage from './pages/BookingTravellersPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingFailurePage from './pages/BookingFailurePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckEmailPage from './pages/CheckEmailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CancellationPolicyPage from './pages/CancellationPolicyPage';

// User Dashboard Pages
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import UserBookings from './pages/UserBookings';
import UserCustomTours from './pages/UserCustomTours';
import UserBookingDetails from './pages/UserBookingDetails';

// Admin Pages
import AdminDashboardPage from './pages/management/AdminDashboardPage';
import AdminPackagesPage from './pages/management/AdminPackagesPage';
import AdminDestinationsPage from './pages/management/AdminDestinationsPage';
import AdminBookingsPage from './pages/management/AdminBookingsPage';
import AdminGuidesPage from './pages/management/AdminGuidesPage';
import AdminGalleryPage from './pages/management/AdminGalleryPage';
import AdminReviewsPage from './pages/management/AdminReviewsPage';
import AdminUsersPage from './pages/management/AdminUsersPage';
import AdminContactsPage from './pages/management/AdminContactsPage';
import AdminCustomToursPage from './pages/management/AdminCustomToursPage';
import AdminProfilePage from './pages/management/AdminProfilePage';
import AdminManagementPage from './pages/management/AdminManagementPage';
import AdminPricingRulesPage from './pages/management/AdminPricingRulesPage';
import AdminPayoutsPage from './pages/management/AdminPayoutsPage';
import AdminFAQPage from './pages/management/AdminFAQPage';
import AdminAuditLogsPage from './pages/management/AdminAuditLogsPage';
import AdminLoginPage from './pages/management/AdminLoginPage';

// Guide Pages
import GuideDashboardPage from './pages/guide/GuideDashboardPage';
import GuideBookingsPage from './pages/guide/GuideBookingsPage';
import GuideAvailabilityPage from './pages/guide/GuideAvailabilityPage';
import GuideProfilePage from './pages/guide/GuideProfilePage';
import GuideReviewsPage from './pages/guide/GuideReviewsPage';
import GuideRegisterPage from './pages/guide/GuideRegisterPage';
import GuideDocumentsPage from './pages/guide/GuideDocumentsPage';
import GuidePendingPage from './pages/guide/GuidePendingPage';
import GuideRejectedPage from './pages/guide/GuideRejectedPage';

/**
 * 📱 I GO LANKA TOURS - Main App Component
 * 
 * Entry point for the frontend application. Orchestrates global routing, 
 * layout composition, and initial session validation. Uses a hybrid routing 
 * model with ProtectedRoutes for role-based access control.
 * 
 * @module App
 */
function App() {
  // Validate session on app load
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // @API_CALL: Attempt silent token refresh to extend session
        console.log('🔄 [App] Validating session via refresh token...');
        const result = await authAPI.refreshToken();
        
        if (!result.success) {
          // @ERROR_HANDLING: Token expired or invalid, force logout
          console.warn('⚠️ [App] Session refresh failed, logging out');
          authAPI.logout();
        } else {
          console.log('✅ [App] Session renewed');
          localStorage.setItem('loginTimestamp', Date.now().toString());
        }
      } catch (err) {
        // @ERROR_HANDLING: Persistent network/server error
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
