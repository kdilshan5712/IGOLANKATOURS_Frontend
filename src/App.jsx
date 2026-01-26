import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import AboutPage from "./pages/AboutPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactPage from "./pages/ContactPage";
import ChatAgentPage from "./pages/ChatAgentPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import BookingStartPage from "./pages/BookingStartPage";
import BookingPaymentPage from "./pages/BookingPaymentPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import GalleryPage from "./pages/GalleryPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import CancellationPolicyPage from "./pages/CancellationPolicyPage";
import GuideRegisterPage from "./pages/guide/GuideRegisterPage";
import GuideDocumentsPage from "./pages/guide/GuideDocumentsPage";
import GuidePendingPage from "./pages/guide/GuidePendingPage";
import GuideDashboardPage from "./pages/guide/GuideDashboardPage";
import GuideBookingsPage from "./pages/guide/GuideBookingsPage";
import GuideAvailabilityPage from "./pages/guide/GuideAvailabilityPage";
import GuideProfilePage from "./pages/guide/GuideProfilePage";
// Admin imports
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPackagesPage from "./pages/admin/AdminPackagesPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminContactsPage from "./pages/admin/AdminContactsPage";
import AdminCustomToursPage from "./pages/admin/AdminCustomToursPage";
import AdminGuidesPage from "./pages/admin/AdminGuidesPage";
// User Dashboard imports
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import UserBookings from "./pages/UserBookings";
import UserBookingDetails from "./pages/UserBookingDetails";
import "./App.css";

function App() {
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
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="guides" element={<AdminGuidesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="custom-tours" element={<AdminCustomToursPage />} />
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
          </Route>

          {/* Public Guide Routes (registration, documents, pending) */}
          <Route path="/guide/register" element={<GuideRegisterPage />} />
          <Route path="/guide/documents" element={<GuideDocumentsPage />} />
          <Route path="/guide/pending" element={<GuidePendingPage />} />

          {/* User Dashboard Routes - Using UserLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="tourist" redirectTo="/login">
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="bookings" element={<UserBookings />} />
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
                  <Route path="/destinations" element={<DestinationsPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/custom-tour-chat" element={<ChatAgentPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/booking/:id" element={<BookingStartPage />} />
                  <Route path="/booking/:id/payment" element={<BookingPaymentPage />} />
                  <Route path="/booking/:id/success" element={<BookingSuccessPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
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
