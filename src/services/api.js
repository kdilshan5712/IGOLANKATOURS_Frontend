// 🎯 I GO LANKA TOURS - API Service Layer
// Handles all backend communication

// ============================================
// API Configuration
// ============================================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ============================================
// API Service Functions
// ============================================

// 📦 PACKAGES (Public - No Auth)
export const packageAPI = {
  // Get all packages with filters
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `${API_BASE_URL}/packages?${params}` : `${API_BASE_URL}/packages`;
      const res = await fetch(url);
      const data = await res.json();
      return data; // { success, count, total, packages }
    } catch (error) {
      console.error("Error fetching packages:", error);
      return { success: false, packages: [] };
    }
  },

  // Get single package by UUID
  getById: async (id) => {
    try {
      // Validate ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('[API] Invalid package ID:', id);
        throw new Error('Invalid package ID');
      }

      console.log('[API] Fetching package with ID:', id);
      const res = await fetch(`${API_BASE_URL}/packages/${id}`);
      
      console.log('[API] Response status:', res.status);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Package not found');
        }
        throw new Error('Failed to retrieve package');
      }
      
      const data = await res.json();
      console.log('[API] Response data:', data);
      
      // Handle different response formats
      if (data.success === false) {
        throw new Error(data.message || 'Failed to load package');
      }
      
      // Get the raw package data
      const rawPackage = data.package || data;
      
      // Transform to consistent format
      const transformedPackage = {
        id: rawPackage.package_id || rawPackage.id,
        package_id: rawPackage.package_id || rawPackage.id,
        name: rawPackage.name,
        description: rawPackage.description,
        price: parseFloat(rawPackage.price) || 0,
        duration: rawPackage.duration,
        category: rawPackage.category,
        budget: rawPackage.budget,
        hotel: rawPackage.hotel,
        rating: rawPackage.rating || 4.5,
        image: rawPackage.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
        image_url: rawPackage.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
        highlights: rawPackage.highlights,
        included: rawPackage.included,
        notIncluded: rawPackage.notIncluded || rawPackage.not_included,
        fullDescription: rawPackage.fullDescription || rawPackage.full_description
      };
      
      console.log('[API] Transformed package:', transformedPackage);
      return transformedPackage;
    } catch (error) {
      console.error('[API] Error fetching package:', error);
      throw error;
    }
  },

  // Get featured packages
  getFeatured: async (limit = 10) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/featured?limit=${limit}`);
      const data = await res.json();
      return data; // { success, count, packages }
    } catch (error) {
      console.error("Error fetching featured packages:", error);
      return { success: false, packages: [] };
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/categories`);
      const data = await res.json();
      return data; // { success, categories: [] }
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, categories: [] };
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/stats`);
      const data = await res.json();
      return data; // { success, stats: {...} }
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { success: false, stats: {} };
    }
  }
};

// 🎫 BOOKINGS (Auth Required)
export const bookingAPI = {
  // Create booking
  create: async (bookingData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      return data; // { message, booking }
    } catch (error) {
      console.error("Error creating booking:", error);
      return { success: false, message: "Failed to create booking" };
    }
  },

  // Get my bookings
  getMy: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { message, count, bookings }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return { success: false, bookings: [] };
    }
  },

  // Get single booking
  getById: async (bookingId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { message, booking }
    } catch (error) {
      console.error("Error fetching booking:", error);
      return { success: false, booking: null };
    }
  },

  // Cancel booking
  cancel: async (bookingId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { message }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, message: "Failed to cancel booking" };
    }
  }
};

// 🔐 AUTHENTICATION
export const authAPI = {
  // Tourist registration -> POST /api/auth/register
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.name,
          country: userData.country || null,
          phone: userData.phone || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Registration failed"
        };
      }

      const user = data.user || {};
      const nameFallback =
        userData.name?.trim() ||
        user.full_name ||
        user.name ||
        user.email?.split("@")[0] ||
        "Tourist";

      return {
        success: true,
        token: data.token,
        user: {
          id: user.id || user.user_id || null,
          email: user.email,
          name: nameFallback,
          role: user.role || "tourist",
          email_verified: user.email_verified
        },
        message:
          data.message ||
          "Registration successful. Please check your email to verify."
      };
    } catch (error) {
      console.error("Error registering:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Login -> POST /api/auth/login
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Login failed"
        };
      }

      const user = data.user || {};
      const nameFallback =
        user.full_name || user.name || user.email?.split("@")[0] || "Tourist";

      return {
        success: true,
        token: data.token,
        user: {
          id: user.id || user.user_id || null,
          email: user.email,
          name: nameFallback,
          role: user.role || "tourist",
          email_verified: user.email_verified
        },
        message: data.message || "Login successful"
      };
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Get current user from token
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  },

  // Resend verification email
  resendVerification: async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to resend verification email"
        };
      }

      return {
        success: true,
        message: data.message || "Verification email sent successfully"
      };
    } catch (error) {
      console.error("Error resending verification:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  }
};

// ============================================
// Helper Functions
// ============================================

// Transform backend package to frontend format
export const transformPackage = (pkg) => {
  return {
    id: pkg.package_id,
    package_id: pkg.package_id,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    duration: pkg.duration,
    category: pkg.category,
    budget: pkg.budget,
    hotel: pkg.hotel,
    rating: pkg.rating || 4.5,
    image: pkg.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
    image_url: pkg.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070"
  };
};

// Transform multiple packages
export const transformPackages = (packages) => {
  return packages.map(transformPackage);
};

// 👨‍💼 ADMIN API (Auth Required - Admin Role Only)
export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: async (token) => {
    try {
      console.log("🔍 API: Fetching dashboard stats with token:", token ? "Present" : "Missing");
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("📡 Response status:", res.status);
      const data = await res.json();
      console.log("📦 Response data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return { success: false, stats: null };
    }
  },

  // Recent Bookings
  getRecentBookings: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/recent-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      return { success: false, bookings: [] };
    }
  },

  // === PACKAGES MANAGEMENT ===
  getAllPackages: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/packages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching packages:", error);
      return { success: false, packages: [] };
    }
  },

  createPackage: async (packageData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(packageData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error creating package:", error);
      return { success: false, message: "Failed to create package" };
    }
  },

  updatePackage: async (packageId, packageData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(packageData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error updating package:", error);
      return { success: false, message: "Failed to update package" };
    }
  },

  deletePackage: async (packageId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/packages/${packageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error deleting package:", error);
      return { success: false, message: "Failed to delete package" };
    }
  },

  // === BOOKINGS MANAGEMENT ===
  getAllBookings: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return { success: false, bookings: [] };
    }
  },

  updateBookingStatus: async (bookingId, status, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      return { success: false, message: "Failed to update booking status" };
    }
  },

  // === GUIDE ASSIGNMENT ===
  getAvailableGuides: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching available guides:", error);
      return { success: false, guides: [] };
    }
  },

  // Get approved guides (for assignment dropdown)
  getApprovedGuides: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching approved guides:", error);
      return { success: false, guides: [] };
    }
  },

  assignGuideToBooking: async (bookingId, guideId, token, adminNotes = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/assign-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ guideId, adminNotes })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error assigning guide:", error);
      return { success: false, message: "Failed to assign guide" };
    }
  },

  // === REVIEWS MANAGEMENT ===
  getAllReviews: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return { success: false, reviews: [] };
    }
  },

  approveReview: async (reviewId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error approving review:", error);
      return { success: false, message: "Failed to approve review" };
    }
  },

  rejectReview: async (reviewId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error rejecting review:", error);
      return { success: false, message: "Failed to reject review" };
    }
  },

  // === USERS MANAGEMENT ===
  getAllUsers: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return { success: false, users: [] };
    }
  },

  updateUserStatus: async (userId, status, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error updating user status:", error);
      return { success: false, message: "Failed to update user status" };
    }
  },

  // === CONTACT MESSAGES ===
  getContactMessages: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      return { success: false, messages: [] };
    }
  },

  markMessageAsRead: async (messageId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/contacts/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return { success: false, message: "Failed to mark message as read" };
    }
  },

  deleteContactMessage: async (messageId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/admin/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error deleting contact message:", error);
      return { success: false, message: "Failed to delete contact message" };
    }
  },

  // === CUSTOM TOUR REQUESTS ===
  getCustomTourRequests: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/custom-tours`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching custom tour requests:", error);
      return { success: false, requests: [] };
    }
  },

  // === TOUR GUIDE APPROVAL SYSTEM ===
  // Get all guides with documents (NEW ENDPOINT - includes documents array)
  getGuidesWithDocuments: async (token, status = null) => {
    try {
      const url = status 
        ? `${API_BASE_URL}/admin/guides-with-docs?status=${status}`
        : `${API_BASE_URL}/admin/guides-with-docs`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching guides with documents:", error);
      return { success: false, guides: [] };
    }
  },

  // Get all guides with optional status filter (LEGACY - kept for backward compatibility)
  getAllGuides: async (token, status = null) => {
    try {
      const url = status 
        ? `${API_BASE_URL}/admin/guides?status=${status}`
        : `${API_BASE_URL}/admin/guides`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching guides:", error);
      return { success: false, guides: [] };
    }
  },

  // Get pending guide applications
  getPendingGuides: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching pending guides:", error);
      return { success: false, guides: [] };
    }
  },

  // Get approved guides
  getApprovedGuides: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching approved guides:", error);
      return { success: false, guides: [] };
    }
  },

  // Get specific guide details with documents
  getGuideDetails: async (guideId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching guide details:", error);
      return { success: false, guide: null };
    }
  },

  // Get guide documents
  getGuideDocuments: async (guideId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching guide documents:", error);
      return { success: false, documents: [] };
    }
  },

  // Get document URL for viewing
  getDocumentUrl: async (guideId, documentId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/documents/${documentId}/url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching document URL:", error);
      return { success: false, url: null };
    }
  },

  // Approve guide application (NEW ENDPOINT - -action variant)
  approveGuideAction: async (guideId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/approve-action`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error approving guide:", error);
      return { success: false, message: "Failed to approve guide" };
    }
  },

  // Approve guide application (LEGACY - kept for backward compatibility)
  approveGuide: async (guideId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error approving guide:", error);
      return { success: false, message: "Failed to approve guide" };
    }
  },

  // Reject guide application (NEW ENDPOINT - -action variant)
  rejectGuideAction: async (guideId, reason, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/reject-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error rejecting guide:", error);
      return { success: false, message: "Failed to reject guide" };
    }
  },

  // Reject guide application (LEGACY - kept for backward compatibility)
  rejectGuide: async (guideId, reason, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error rejecting guide:", error);
      return { success: false, message: "Failed to reject guide" };
    }
  }
};
// 🎓 GUIDE MANAGEMENT (Auth Required)
export const guideAPI = {
  // Register as a tour guide
  register: async (guideData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: guideData.email,
          password: guideData.password,
          full_name: guideData.fullName,
          contact_number: guideData.contactNumber
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Registration failed"
        };
      }

      return {
        success: true,
        token: data.token,
        message: data.message || "Guide registered successfully. Please upload documents to continue."
      };
    } catch (error) {
      console.error("Error registering guide:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Upload guide documents
  uploadDocuments: async (formData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/documents`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Document upload failed"
        };
      }

      return {
        success: true,
        document: data.document,
        message: data.message || "Document uploaded successfully"
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Get guide profile
  getProfile: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          guide: null,
          message: data.message || "Failed to fetch profile"
        };
      }

      return {
        success: true,
        guide: data,
        message: "Profile fetched successfully"
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { success: false, guide: null, message: "Network error" };
    }
  },

  // Get guide dashboard
  getDashboard: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          dashboard: null,
          message: data.message || "Failed to fetch dashboard"
        };
      }

      return {
        success: true,
        dashboard: data,
        message: "Dashboard fetched successfully"
      };
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      return { success: false, dashboard: null, message: "Network error" };
    }
  },

  // Set availability
  setAvailability: async (availabilityData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/availability`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(availabilityData)
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to set availability"
        };
      }

      return {
        success: true,
        message: data.message || "Availability updated successfully"
      };
    } catch (error) {
      console.error("Error setting availability:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Get guide bookings
  getBookings: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          bookings: [],
          message: data.message || "Failed to fetch bookings"
        };
      }

      return {
        success: true,
        bookings: data.bookings || [],
        categorized: data.categorized || {},
        message: "Bookings fetched successfully"
      };
    } catch (error) {
      console.error("Error fetching guide bookings:", error);
      return { success: false, bookings: [], message: "Network error" };
    }
  },

  // Get my assigned tours (alias for getBookings)
  getMyTours: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/my-tours`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          bookings: [],
          categorized: {},
          message: data.message || "Failed to fetch tours"
        };
      }

      return {
        success: true,
        bookings: data.bookings || [],
        categorized: data.categorized || {},
        count: data.count || 0,
        message: "Tours fetched successfully"
      };
    } catch (error) {
      console.error("Error fetching my tours:", error);
      return { success: false, bookings: [], categorized: {}, message: "Network error" };
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to update booking status"
        };
      }

      return {
        success: true,
        message: data.message || "Booking status updated successfully"
      };
    } catch (error) {
      console.error("Error updating booking status:", error);
      return { success: false, message: "Network error" };
    }
  }
};

// ============================================
// REVIEWS API - Public & Admin
// ============================================
export const reviewAPI = {
  // Get all approved reviews (public)
  getAllApproved: async (limit = 100, offset = 0) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      return data; // { success, count, reviews }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return { success: false, reviews: [] };
    }
  },

  // Get approved reviews for a specific package (public)
  getByPackage: async (packageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/package/${packageId}`);
      const data = await res.json();
      return data; // { success, count, reviews }
    } catch (error) {
      console.error("Error fetching package reviews:", error);
      return { success: false, reviews: [] };
    }
  },

  // Submit a review (tourist only - requires token)
  submit: async (token, reviewData) => {
    try {
      // Check if images are included
      const hasImages = reviewData.images && reviewData.images.length > 0;
      
      let res;
      if (hasImages) {
        // Use FormData for multipart upload
        const formData = new FormData();
        formData.append('packageId', reviewData.packageId);
        formData.append('rating', reviewData.rating);
        formData.append('title', reviewData.title || '');
        formData.append('comment', reviewData.comment);
        
        // Append image files
        reviewData.images.forEach(image => {
          formData.append('images', image);
        });
        
        res = await fetch(`${API_BASE_URL}/reviews`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type - browser will set it with boundary
          },
          body: formData
        });
      } else {
        // Standard JSON request
        res = await fetch(`${API_BASE_URL}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            packageId: reviewData.packageId,
            rating: reviewData.rating,
            title: reviewData.title || '',
            comment: reviewData.comment
          })
        });
      }
      
      const data = await res.json();
      return data; // { success, message, review }
    } catch (error) {
      console.error("Error submitting review:", error);
      return { success: false, message: "Failed to submit review" };
    }
  },

  // Admin: Get all reviews with filters
  getAllAdmin: async (token, filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `${API_BASE_URL}/admin/reviews?${params}` : `${API_BASE_URL}/admin/reviews`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, count, statusCounts, reviews }
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      return { success: false, reviews: [] };
    }
  },

  // Admin: Approve review
  approve: async (token, reviewId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      return data; // { success, message, review }
    } catch (error) {
      console.error("Error approving review:", error);
      return { success: false, message: "Failed to approve review" };
    }
  },

  // Admin: Reject review
  reject: async (token, reviewId, reason = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      return data; // { success, message, review }
    } catch (error) {
      console.error("Error rejecting review:", error);
      return { success: false, message: "Failed to reject review" };
    }
  },

  // Admin: Delete review
  delete: async (token, reviewId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, message: "Failed to delete review" };
    }
  }
};

// ============================================
// CONTACT FORM API - Public & Admin
// ============================================
export const contactAPI = {
  // Submit contact message (public - no auth)
  submit: async (contactData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      const data = await res.json();
      return data; // { success, message, contactMessage }
    } catch (error) {
      console.error("Error submitting contact:", error);
      return { success: false, message: "Failed to submit contact message" };
    }
  },

  // Admin: Get all contact messages with filters
  getAllAdmin: async (token, filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `${API_BASE_URL}/contact/admin?${params}` : `${API_BASE_URL}/contact/admin`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, count, statusCounts, messages }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return { success: false, messages: [] };
    }
  },

  // Admin: Get single message
  getOne: async (token, messageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/admin/${messageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message, contactMessage }
    } catch (error) {
      console.error("Error fetching contact message:", error);
      return { success: false, message: "Failed to fetch message" };
    }
  },

  // Admin: Update message status and notes
  update: async (token, messageId, updateData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/admin/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      return data; // { success, message, contactMessage }
    } catch (error) {
      console.error("Error updating contact message:", error);
      return { success: false, message: "Failed to update message" };
    }
  },

  // Admin: Mark as read
  markRead: async (token, messageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/admin/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message, contactMessage }
    } catch (error) {
      console.error("Error marking message as read:", error);
      return { success: false, message: "Failed to mark as read" };
    }
  },

  // Admin: Delete message
  delete: async (token, messageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/admin/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      console.error("Error deleting contact:", error);
      return { success: false, message: "Failed to delete message" };
    }
  }
};

// 🔔 NOTIFICATIONS API
export const notificationAPI = {
  // Get user notifications
  getAll: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, notifications, unreadCount }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, notifications: [], unreadCount: 0 };
    }
  },

  // Mark notification as read
  markAsRead: async (token, notificationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, message: "Failed to mark as read" };
    }
  }
};

// 👤 USER DASHBOARD API
export const userAPI = {
  // Get user profile
  getProfile: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { message, profile }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { success: false, message: "Failed to connect to server" };
    }
  },

  // Get user bookings
  getBookings: async (token) => {
    try {
      console.log("📡 [API] Calling /api/user/bookings");
      console.log("📡 [API] Token present:", !!token);
      console.log("📡 [API] Token preview:", token ? token.substring(0, 20) + "..." : "none");
      console.log("📡 [API] Full URL:", `${API_BASE_URL}/user/bookings`);
      
      const res = await fetch(`${API_BASE_URL}/user/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("📡 [API] Response status:", res.status);
      console.log("📡 [API] Response ok:", res.ok);
      console.log("📡 [API] Response headers:", Object.fromEntries(res.headers.entries()));
      
      const data = await res.json();
      console.log("📡 [API] Response data keys:", Object.keys(data));
      console.log("📡 [API] Response data:", JSON.stringify(data, null, 2));
      
      return data; // { message, bookings }
    } catch (error) {
      console.error("❌ [API] Error fetching user bookings:", error);
      console.error("❌ [API] Error message:", error.message);
      console.error("❌ [API] Error stack:", error.stack);
      return { success: false, message: "Failed to connect to server", bookings: [] };
    }
  },

  // Cancel booking
  cancelBooking: async (token, bookingId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { message }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, message: "Failed to connect to server" };
    }
  }
};
