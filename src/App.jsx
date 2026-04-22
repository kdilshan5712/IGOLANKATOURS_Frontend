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
