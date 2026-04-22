/**
 * 🎯 I GO LANKA TOURS - API Service Layer
 * 
 * Handles all backend communication using fetch API.
 * Centralizes error handling, authentication state, and data transformation.
 * 
 * @module api
 */

// ============================================
// API Configuration & Secure Fetch Helper
// ============================================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Enhanced fetch wrapper that ensures credentials (cookies) are sent
 * and handles base URL joining.
 * 
 * @ERROR_HANDLING: This wrapper handles the initial URL formation and default headers.
 * Errors in transport are caught in individual API methods for granular response.
 * 
 * @param {string} endpoint - The API endpoint path
 * @param {Object} options - Standard fetch options
 * @returns {Promise<Response>} - The fetch promise
 */
const secureFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const defaultOptions = {
    ...options,
    credentials: "include", // Essential for HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  return fetch(url, defaultOptions);
};

// ============================================
// API Service Functions
// ============================================

// 💬 CHAT API (Auth Required)
export const chatAPI = {
  // Get messages for a booking
  getMessages: async (bookingId, token) => {
    try {
      // @VALIDATION: Ensure token exists before attempting call
      if (!token) throw new Error("Authentication required");

      // @API_CALL: Fetch booking chat messages
      const response = await secureFetch(`/chat/${bookingId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error) {
      // @ERROR_HANDLING: Log and normalize error response
      console.error("Chat getMessages Error:", error);
      return { success: false, message: error.message || "Failed to fetch chat messages." };
    }
  },

  // Send a message for a booking
  sendMessage: async (bookingId, message, token) => {
    try {
      // @VALIDATION: Auth token check
      if (!token) throw new Error("Authentication required");

      // @API_CALL: Post new chat message
      const response = await secureFetch(`/chat/${bookingId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      return await response.json();
    } catch (error) {
      // @ERROR_HANDLING: Error normalization for UI
      console.error("Chat sendMessage Error:", error);
      return { success: false, message: error.message || "Failed to send chat message." };
    }
  },

  // Authorize or revoke chat room (Admin only)
  authorizeChat: async (bookingId, is_authorized, token) => {
    try {
      if (!token) throw new Error("Authentication required");

      const response = await secureFetch(`/chat/${bookingId}/authorize`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ is_authorized })
      });

      return await response.json();
    } catch (error) {
      console.error("Chat authorize Error:", error);
      return { success: false, message: error.message || "Failed to authorize chat." };
    }
  },

  // Get messages for a custom tour session
  getSessionMessages: async (sessionId, token) => {
    try {
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      return await response.json();
    } catch (error) {
      console.error("Chat getSessionMessages Error:", error);
      return { success: false, message: error.message || "Failed to fetch session messages." };
    }
  },

  // Send a message for a custom tour session
  sendSessionMessage: async (sessionId, message, token) => {
    try {
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      return await response.json();
    } catch (error) {
      console.error("Chat sendSessionMessage Error:", error);
      return { success: false, message: error.message || "Failed to send session message." };
    }
  },

  // Sync entire chat history for a session (AI generation journey)
  syncHistory: async (sessionId, messages, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sync-history`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId, messages })
      });
      return await response.json();
    } catch (error) {
      console.error("Chat syncHistory Error:", error);
      return { success: false, message: error.message || "Failed to sync history." };
    }
  }
};

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
      // @VALIDATION: Check for malformed or missing ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('[API] Invalid package ID:', id);
        throw new Error('Invalid package ID');
      }

      console.log('[API] Fetching package with ID:', id);
      // @API_CALL: Fetch full package details
      const res = await fetch(`${API_BASE_URL}/packages/${id}`);

      console.log('[API] Response status:', res.status);

      // @ERROR_HANDLING: Detailed status code handling
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Package not found');
        }
        throw new Error('Failed to retrieve package');
      }

      const data = await res.json();
      
      // @ERROR_HANDLING: Handle logical failure payload
      if (data.success === false) {
        throw new Error(data.message || 'Failed to load package');
      }

      // Get the raw package data
      const rawPackage = data.package || data;

      // DATA TRANSFORMATION: Normalize backend response to frontend model
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
        fullDescription: rawPackage.fullDescription || rawPackage.full_description,
        itinerary: rawPackage.itinerary || [],
        images: rawPackage.images || [],
        reviewImages: rawPackage.reviewImages || [],
        reviewStats: rawPackage.reviewStats || null,
        latestReviews: rawPackage.latestReviews || []
      };

      return transformedPackage;
    } catch (error) {
      // @ERROR_HANDLING: Propagate error to UI components
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
  },

  // Calculate dynamic price
  calculatePrice: async (id, date, adults = 1, children = 0) => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${id}/price?date=${date}&adults=${adults}&children=${children}`);
      const data = await res.json();
      return data; // { success, pricing: {...} }
    } catch (error) {
      console.error("Error calculating price:", error);
      return { success: false, pricing: null };
    }
  }
};

// 🎫 BOOKINGS (Auth Required)
export const bookingAPI = {
  // Create booking
  create: async (bookingData, token) => {
    try {
      // @API_CALL: Create a new booking record
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
      // @ERROR_HANDLING: Catch network or server-side validation errors
      console.error("Error creating booking:", error);
      return { success: false, message: "Failed to create booking", errors: error.errors || null };
    }
  },

  // Get my bookings
  getMy: async (token) => {
    try {
      // @API_CALL: Retrieve user's personal booking history
      const res = await fetch(`${API_BASE_URL}/bookings/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return { success: res.ok, ...data }; // { message, count, bookings, success }
    } catch (error) {
      // @ERROR_HANDLING: Fetch failure fallback
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
  },

  // Download Invoice
  downloadInvoice: async (bookingId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        let errorMsg = "Failed to download invoice";
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch (e) { }
        return { success: false, message: errorMsg };
      }

      const blob = await res.blob();
      return { success: true, blob };
    } catch (error) {
      console.error("Error downloading invoice:", error);
      return { success: false, message: "Network error while downloading invoice." };
    }
  },

  acceptCustomTour: async (sessionId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/accept-custom/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await res.json();
    } catch (error) {
      console.error("Error accepting custom tour:", error);
      return { success: false, message: "Network error" };
    }
  }
};

// ❤️ WISHLIST (Auth Required)
export const wishlistAPI = {
  get: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return { success: false, wishlistIds: [] };
    }
  },

  toggle: async (packageId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ package_id: packageId })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return { success: false, message: "Network error." };
    }
  }
};

// ❓ FAQs (Public)
export const faqAPI = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/faqs`);
      const data = await res.json();
      return data; // { success, faqData: [] }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      return { success: false, faqData: [] };
    }
  }
};

// 🔐 AUTHENTICATION
export const authAPI = {
  // Tourist registration -> POST /api/auth/register
  register: async (userData) => {
    try {
      // @API_CALL: Register a new user account
      const res = await secureFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name || userData.name,
          country: userData.country || null,
          phone: userData.phone || null
        })
      });

      const data = await res.json();

      // @ERROR_HANDLING: Handle registration failures (e.g. duplicate email)
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Registration failed",
          errors: data.errors || null
        };
      }

      // @VALIDATION: Fallback logic for user display name
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
          email_verified: user.email_verified,
          profile_photo: user.profile_photo || null
        },
        message:
          data.message ||
          "Registration successful. Please check your email to verify."
      };
    } catch (error) {
      // @ERROR_HANDLING: Catch connection/network errors
      console.error("Error registering:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Login -> POST /api/auth/login
  login: async (email, password) => {
    try {
      // @API_CALL: Authenticate user credentials
      const res = await secureFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      // @ERROR_HANDLING: Invalid credentials or status issues
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Login failed",
          errors: data.errors || null
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
          status: user.status || "active",
          email_verified: user.email_verified,
          profile_photo: user.profile_photo || null,
          isPending: user.isPending || false,
          isRejected: user.isRejected || false,
          hasUploadedDocuments: user.hasUploadedDocuments || false
        },
        message: data.message || "Login successful"
      };
    } catch (error) {
      // @ERROR_HANDLING: Connectivity issues
      console.error("Error logging in:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Refresh token -> POST /api/auth/refresh
  refreshToken: async () => {
    try {
      const res = await secureFetch("/auth/refresh", {
        method: "POST"
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Session renewal failed" };
      }

      // If backend returns a new access token, update it
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return { success: true, token: data.token };

    } catch (error) {
      console.error("Token Refresh Error:", error);
      return { success: false, message: "Connection error during session renewal." };
    }
  },

  // Get current user from token
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update current user in localStorage
  updateCurrentUser: (userData) => {
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
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
  logout: async () => {
    try {
      await secureFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Backend logout failed, clearing local storage anyway");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("loginTimestamp");
  },

  // Resend verification email
  resendVerification: async (email) => {
    try {
      const res = await secureFetch("/auth/resend-verification", {
        method: "POST",
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
    image: pkg.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
    image_url: pkg.image || "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
    currentPrice: pkg.currentPrice || parseFloat(pkg.price),
    seasonLabel: pkg.seasonLabel || null,
    pricing: pkg.pricing || null,
    isDynamic: pkg.isDynamic || false,
    itinerary: pkg.itinerary || []
  };
};

// Transform multiple packages
export const transformPackages = (packages) => {
  return packages.map(transformPackage);
};

// 👨‍💼 ADMIN API (Auth Required - Admin Role Only)
export const destinationAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/destinations`);
      const data = await response.json();
      return data; // { success, data: [] }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return { success: false, data: [] };
    }
  }
};

export const adminAPI = {
  // Get Admin Profile
  getProfile: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { message, profile }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      return { success: false, message: "Failed to connect to server" };
    }
  },

  // Upload Profile Photo
  uploadProfilePhoto: async (file, token) => {
    const formData = new FormData();
    formData.append('profile_photo', file);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      return await res.json();
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return { success: false, message: "Network error during upload" };
    }
  },

  // Delete Profile Photo
  deleteProfilePhoto: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      return { success: false, message: "Network error during deletion" };
    }
  },

  // Create New Admin (Admin Only)
  createAdmin: async (token, adminData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/admins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error creating admin:", error);
      return { success: false, message: "Failed to connect to server" };
    }
  },

  // Get All Admins (Admin Only)
  getAllAdmins: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching admins:", error);
      return { success: false, admins: [] };
    }
  },

  // Dashboard Stats
  getDashboardStats: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return { success: false, stats: null };
    }
  },

  // Notification Counts
  getNotificationCounts: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/notifications/counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      return { success: false, counts: null };
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

  // Revenue Report


  // GET AUDIT LOGS
  getAuditLogs: async (filters = {}, token) => {
    try {
      const authToken = token || localStorage.getItem("token");
      const params = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/admin/audit-logs?${params}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, logs: [], pagination: { total: 0 } };
    }
  },
  getRevenueReport: async (dateFrom, dateTo, token) => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/revenue-report${queryString}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      return { success: false, report: null };
    }
  },

  // Generate & Download Report (PDF/CSV)
  generateReport: async (reportType, format, dateFrom, dateTo, token) => {
    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('format', format);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const queryString = params.toString() ? `?${params.toString()}` : '';

      console.log(`📥 Downloading report: ${reportType} (${format})`);

      const res = await fetch(`${API_BASE_URL}/admin/dashboard/generate-report${queryString}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Failed to generate report");
        } catch (e) {
          throw new Error("Failed to generate report");
        }
      }

      // Return the blob for download
      const blob = await res.blob();
      return { success: true, blob };
    } catch (error) {
      console.error("Error generating report:", error);
      return { success: false, message: error.message };
    }
  },

  // === CUSTOM TOURS CONVERSION ===
  convertCustomToBooking: async (sessionId, bookingData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/convert/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error converting custom request:", error);
      return { success: false, message: "Network error during conversion" };
    }
  },

  // === PRICING RULES ===
  getPricingRules: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pricing-rules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
      return { success: false, rules: [] };
    }
  },

  createPricingRule: async (ruleData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pricing-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ruleData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error creating pricing rule:", error);
      return { success: false, message: "Failed to create pricing rule" };
    }
  },

  updatePricingRule: async (id, ruleData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pricing-rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ruleData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating pricing rule:", error);
      return { success: false, message: "Failed to update pricing rule" };
    }
  },

  deletePricingRule: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pricing-rules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting pricing rule:", error);
      return { success: false, message: "Failed to delete pricing rule" };
    }
  },

  // === FAQS ===
  getFaqs: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/faqs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching admin FAQs:", error);
      return { success: false, faqs: [] };
    }
  },

  createFaq: async (faqData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(faqData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error creating FAQ:", error);
      return { success: false, message: "Failed to create FAQ" };
    }
  },

  updateFaq: async (id, faqData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(faqData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating FAQ:", error);
      return { success: false, message: "Failed to update FAQ" };
    }
  },

  deleteFaq: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      return { success: false, message: "Failed to delete FAQ" };
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

  // === GUIDE ASSIGNMENT ===
  getAvailableGuides: async (token, date = null) => {
    try {
      const url = date 
        ? `${API_BASE_URL}/admin/bookings/available-guides?date=${date}`
        : `${API_BASE_URL}/admin/bookings/available-guides`;
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching available guides:", error);
      return { success: false, guides: [] };
    }
  },

  assignGuideToBooking: async (bookingId, guideId, adminNotes, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/assign-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ guideId, adminNotes })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Guide assignment failed:", res.status, errorData);
        return {
          success: false,
          message: errorData.message || "Failed to assign guide",
          error: errorData.error,
          status: res.status
        };
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error assigning guide:", error);
      return { success: false, message: "Failed to assign guide: " + error.message };
    }
  },

  unassignGuideFromBooking: async (bookingId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/unassign-guide`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error unassigning guide:", error);
      return { success: false, message: "Failed to unassign guide" };
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

  replyContactMessage: async (messageId, message, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/contacts/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error replying to contact message:", error);
      return { success: false, message: "Failed to send reply" };
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

  updateCustomTourStatus: async (requestId, updateData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/custom-tours/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error updating custom tour status:", error);
      return { success: false, message: "Failed to update status" };
    }
  },

  replyCustomTour: async (requestId, message, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/custom-tours/${requestId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error replying to custom tour request:", error);
      return { success: false, message: "Failed to send quote" };
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
      console.log('🔴 Rejecting guide:', guideId);
      console.log('🔴 Token:', token ? 'Present' : 'Missing');
      console.log('🔴 Reason:', reason);

      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/reject-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      console.log('🔴 Response status:', res.status);
      const data = await res.json();
      console.log('🔴 Response data:', data);

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
  },

  // === PAYOUT MANAGEMENT ===
  getPayoutRequests: async (token, status = null) => {
    try {
      // Handle if status is passed as an object { status: '...' }
      const statusValue = (status && typeof status === 'object') ? status.status : status;
      
      const url = statusValue && statusValue !== 'all'
        ? `${API_BASE_URL}/admin/payouts?status=${statusValue}`
        : `${API_BASE_URL}/admin/payouts`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      return { success: false, payouts: [] };
    }
  },

  updatePayoutStatus: async (payoutId, statusData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/payouts/${payoutId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating payout status:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Update guide commission rate
  updateGuideCommission: async (guideId, commissionRate, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/guides/${guideId}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commissionRate })
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating guide commission:", error);
      return { success: false, message: "Network error" };
    }
  },

  // === DESTINATIONS MANAGEMENT ===
  getAllDestinations: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return { success: false, data: [] };
    }
  },

  createDestination: async (destinationData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(destinationData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error creating destination:", error);
      return { success: false, message: "Failed to create destination" };
    }
  },

  updateDestination: async (id, destinationData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(destinationData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error updating destination:", error);
      return { success: false, message: "Failed to update destination" };
    }
  },

  deleteDestination: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error deleting destination:", error);
      return { success: false, message: "Failed to delete destination" };
    }
  }
};

// ============================================
// GUIDE AVAILABILITY API
// ============================================
export const availabilityAPI = {
  // Get guide's availability
  getAvailability: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/availability`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          availability: [],
          message: data.message || "Failed to fetch availability"
        };
      }

      return {
        success: true,
        availability: data.availability || [],
        count: data.availability?.length || 0,
        message: "Availability fetched successfully"
      };
    } catch (error) {
      console.error("Error fetching availability:", error);
      return { success: false, availability: [], message: "Network error" };
    }
  },

  // Set/update single date availability
  setAvailability: async (date, status, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/availability`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date, status })
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
        availability: data.availability,
        message: data.message || "Availability updated successfully"
      };
    } catch (error) {
      console.error("Error setting availability:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Batch set availability for multiple dates
  setMultipleAvailability: async (dates, status, token) => {
    try {
      const results = await Promise.allSettled(
        dates.map(date => availabilityAPI.setAvailability(date, status, token))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      return {
        success: failed === 0,
        message: `${successful} date(s) updated successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        results: results
      };
    } catch (error) {
      console.error("Error setting multiple availability:", error);
      return { success: false, message: "Network error" };
    }
  }
};

// 🎓 GUIDE MANAGEMENT (Auth Required)
export const guideAPI = {
  // Upload Profile Photo
  uploadProfilePhoto: async (file, token) => {
    const formData = new FormData();
    formData.append('profile_photo', file);

    try {
      const res = await fetch(`${API_BASE_URL}/guides/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      return await res.json();
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return { success: false, message: "Network error during upload" };
    }
  },

  // Delete Profile Photo
  deleteProfilePhoto: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/profile-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      return { success: false, message: "Network error during deletion" };
    }
  },

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
        guide: data.guide,
        message: "Profile fetched successfully"
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { success: false, guide: null, message: "Network error" };
    }
  },

  // Update guide profile
  updateProfile: async (profileData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to update profile"
        };
      }

      return {
        success: true,
        guide: data.guide,
        message: data.message || "Profile updated successfully"
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Upload profile photo
  uploadProfilePhoto: async (file, token) => {
    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      const res = await fetch(`${API_BASE_URL}/guides/profile-photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to upload photo"
        };
      }

      return {
        success: true,
        profile_photo: data.profile_photo,
        message: data.message || "Photo uploaded successfully"
      };
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  // Delete profile photo
  deleteProfilePhoto: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/profile-photo`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to delete photo"
        };
      }

      return {
        success: true,
        message: data.message || "Photo deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      return { success: false, message: "Network error. Please try again." };
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

  // Set availability (redirects to availabilityAPI for proper backend format)
  setAvailability: async (availabilityData, token) => {
    // Handle old format: {is_available, dates: []}
    if (availabilityData.dates && Array.isArray(availabilityData.dates)) {
      const status = availabilityData.is_available ? 'available' : 'unavailable';
      return availabilityAPI.setMultipleAvailability(availabilityData.dates, status, token);
    }

    // Handle new format: {date, status}
    if (availabilityData.date && availabilityData.status) {
      return availabilityAPI.setAvailability(
        availabilityData.date,
        availabilityData.status,
        token
      );
    }

    return {
      success: false,
      message: "Invalid availability data format"
    };
  },

  // Get availability
  getAvailability: async (token) => {
    return availabilityAPI.getAvailability(token);
  },

  // Get guide bookings
  getBookings: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching guide bookings:", error);
      return { success: false, bookings: [] };
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
  },

  // Get reviews for the authenticated guide
  getReviews: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, reviews, stats }
    } catch (error) {
      console.error("Error fetching guide reviews:", error);
      return { success: false, reviews: [], stats: { totalReviews: 0, averageRating: 0 } };
    }
  },

  // Update bank details
  updateBankDetails: async (bankData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/me/bank-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bankData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating bank details:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Request a payout
  requestPayout: async (amount, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/payouts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      return await res.json();
    } catch (error) {
      console.error("Error requesting payout:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Get payout history
  getPayoutHistory: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guides/payouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching payout history:", error);
      return { success: false, payouts: [] };
    }
  }
};

// Standalone export for backward compatibility with GuideReviewsPage.jsx
export const getGuideReviews = async () => {
  const token = localStorage.getItem('token');
  return guideAPI.getReviews(token);
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
      const hasImages = reviewData.images && reviewData.images.length > 0;
      let res;

      if (hasImages) {
        const formData = new FormData();
        formData.append('packageId', String(reviewData.packageId));
        formData.append('rating', String(reviewData.rating));
        formData.append('title', reviewData.title || '');
        formData.append('comment', reviewData.comment);
        reviewData.images.forEach(image => formData.append('images', image));

        res = await fetch(`${API_BASE_URL}/reviews`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
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

      return await res.json();
    } catch (error) {
      console.error("Error submitting review:", error);
      return { success: false, message: error.message };
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
  getAll: async (limit = 20) => {
    try {
      const token = authAPI.getToken();
      const res = await fetch(`${API_BASE_URL}/notifications?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, notifications, unreadCount }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, notifications: [], unreadCount: 0 };
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const token = authAPI.getToken();
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, count }
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return { success: false, count: 0 };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const token = authAPI.getToken();
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
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const token = authAPI.getToken();
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      console.error("Error marking all as read:", error);
      return { success: false, message: "Failed to mark all as read" };
    }
  },

  // Delete notification
  delete: async (notificationId) => {
    try {
      const token = authAPI.getToken();
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data; // { success, message }
    } catch (error) {
      console.error("Error deleting notification:", error);
      return { success: false, message: "Failed to delete notification" };
    }
  }
};

// 📸 GALLERY API
export const galleryAPI = {
  // --- Public Routes ---

  // Get all approved gallery images
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `${API_BASE_URL}/gallery?${params}` : `${API_BASE_URL}/gallery`;
      const res = await fetch(url);
      const data = await res.json();
      return data; // { success, count, totalCount, gallery }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      return { success: false, gallery: [], count: 0 };
    }
  },

  // Get gallery categories
  getCategories: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/categories`);
      const data = await res.json();
      return data; // { success, categories }
    } catch (error) {
      console.error("Error fetching gallery categories:", error);
      return { success: false, categories: [] };
    }
  },

  // --- Admin Routes ---

  // Admin: Get all gallery images
  getAdminAll: async (token, filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `${API_BASE_URL}/admin/gallery?${params}` : `${API_BASE_URL}/admin/gallery`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching admin gallery images:", error);
      return { success: false, gallery: [] };
    }
  },

  // Admin: Upload new image
  uploadImage: async (token, formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gallery/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        // FormData boundary is automatically set
        body: formData
      });
      const data = await res.json();
      return data; // { success, gallery, message }
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      return { success: false, message: "Network error occurred." };
    }
  },

  // Admin: Update image details
  updateImage: async (token, galleryId, updateData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gallery/${galleryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error updating gallery image:", error);
      return { success: false, message: "Network error occurred." };
    }
  },

  // Admin: Delete image
  deleteImage: async (token, galleryId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gallery/${galleryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      return { success: false, message: "Network error occurred." };
    }
  },

  // Admin: Reorder images
  reorderImages: async (token, imagesArray) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gallery/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images: imagesArray })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error reordering gallery images:", error);
      return { success: false, message: "Network error occurred." };
    }
  },

  // Admin: Get stats
  getStats: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gallery/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching gallery stats:", error);
      return { success: false, stats: null };
    }
  }
};

// 👤 USER DASHBOARD API
export const couponAPI = {
  // Validate a coupon (Public)
  validate: async (code, amount) => {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate?code=${code}&amount=${amount}`);
      const data = await res.json();
      return data; // { success, message, coupon: { code, discount_type, discount_value, applied_discount } }
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { success: false, message: "Network error during coupon validation" };
    }
  },

  // --- Admin Methods ---

  // Get all coupons
  getAll: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return { success: false, coupons: [] };
    }
  },

  // Create a new coupon
  create: async (couponData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(couponData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error creating coupon:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Update a coupon
  update: async (id, couponData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(couponData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating coupon:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Delete a coupon
  delete: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      return { success: false, message: "Network error" };
    }
  }
};

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

  // Upload Profile Photo
  uploadProfilePhoto: async (file, token) => {
    const formData = new FormData();
    formData.append('profile_photo', file);

    try {
      const res = await fetch(`${API_BASE_URL}/user/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      return await res.json();
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return { success: false, message: "Network error during upload" };
    }
  },

  // Delete Profile Photo
  deleteProfilePhoto: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      return { success: false, message: "Network error during deletion" };
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

      return { success: res.ok, ...data }; // { message, bookings, success }
    } catch (error) {
      console.error("❌ [API] Error fetching user bookings:", error);
      console.error("❌ [API] Error message:", error.message);
      console.error("❌ [API] Error stack:", error.stack);
      return { success: false, message: "Failed to connect to server", bookings: [] };
    }
  },

  // Get user custom tours
  getCustomTours: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/custom-tours`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch (error) {
      console.error("❌ [API] Error fetching custom tours:", error);
      return { success: false, message: "Failed to connect to server", customTours: [] };
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

// 👨‍🏫 GUIDE API (Auth Required - Guide Role)
export const uploadGuideDocuments = async (formData) => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/guides/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    return { data, status: res.status };
  } catch (error) {
    console.error('Error uploading guide documents:', error);
    throw error;
  }
};

export const getRejectionDetails = async () => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/guides/rejection-details`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    return { data, status: res.status };
  } catch (error) {
    console.error('Error fetching rejection details:', error);
    throw error;
  }
};

export const resubmitApplication = async () => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/guides/resubmit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return { data, status: res.status };
  } catch (error) {
    console.error('Error resubmitting application:', error);
    throw error;
  }
};


// Get guide dashboard statistics
export const getGuideDashboardStats = async () => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/guides/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching guide dashboard stats:', error);
    return { success: false, message: 'Network error', stats: null };
  }
};

// Standalone exports for components
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    // Check if response is ok before parsing JSON
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to cancel booking' }));
      throw new Error(errorData.message || 'Failed to cancel booking');
    }

    return await res.json();
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};


export const getGuideBookings = async () => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/guides/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching guide bookings:', error);
    throw error;
  }
};

export const markTourCompleted = async (bookingId) => {
  try {
    const token = authAPI.getToken();
    const res = await fetch(`${API_BASE_URL}/guides/bookings/${bookingId}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (error) {
    console.error('Error marking tour as completed:', error);
    throw error;
  }
};

// 🤖 AI AGENT API
export const aiAPI = {
  // Save chatbot session for admin review
  saveSession: async (sessionData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/ai/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(sessionData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error saving AI session:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Submit AI custom itinerary directly for Admin Approval
  submitCustomTourForApproval: async (tourData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/ai/submit-custom-tour`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(tourData)
      });
      return await res.json();
    } catch (error) {
      console.error("Error submitting custom tour:", error);
      return { success: false, message: "Network error" };
    }
  },

  // Sync AI Chat History to tour_messages table
  syncChatHistory: async (sessionId, messages) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/ai/sync-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({ sessionId, messages })
      });
      return await res.json();
    } catch (error) {
      console.error("Error syncing chat history:", error);
      return { success: false, message: "Network error" };
    }
  }
};
