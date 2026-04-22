/**
 * 🎯 I GO LANKA TOURS - Wishlist State Management Hook
 * 
 * Orchestrates the persistent state of user favorites. Implements cross-tab 
 * synchronization via localStorage, optimistic UI updates for responsiveness, 
 * and background synchronization with the backend database upon authentication.
 * 
 * @module useWishlist
 */

import { useState, useEffect } from 'react';
import { packageAPI, transformPackage, wishlistAPI, authAPI } from '../services/api';

const WISHLIST_KEY = 'igolanka_wishlist';

/**
 * useWishlist Hook
 * 
 * Centralizes favors logic and provides synchronized favorite state across the app.
 * 
 * @returns {Object} Wishlist state and control functions.
 */
export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error reading wishlist from local storage", e);
      return [];
    }
  });

  const [wishlistPackages, setWishlistPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSynchronized, setIsSynchronized] = useState(false); // Flags if we fetched from DB successfully

  // ===================================
  // INITIAL SYNC (BE -> Local) on Load
  // ===================================
  useEffect(() => {
    const syncWishlist = async () => {
      const token = authAPI.getToken();
      if (token && !isSynchronized) {
        // User is authenticated, fetch their DB wishlist
        const dbWishlist = await wishlistAPI.get(token);
        if (dbWishlist && dbWishlist.wishlistIds) {
          const dbIds = dbWishlist.wishlistIds;

          // Merge local IDs into the database (so unauthenticated picks carry over)
          const localIds = [...wishlistIds];
          const mergedIds = [...new Set([...localIds, ...dbIds])];

          // Fire off background synchronization to Backend if there are local-only items
          const unsyncedIds = localIds.filter(id => !dbIds.includes(id));
          if (unsyncedIds.length > 0) {
            for (const id of unsyncedIds) {
              await wishlistAPI.toggle(id, token);
            }
          }

          // Set state
          setWishlistIds(mergedIds);
          try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(mergedIds));
          } catch (e) {
            console.error('Failed saving merged IDs', e);
          }
        }
        setIsSynchronized(true);
      }
    };

    syncWishlist();
  }, [authAPI.isAuthenticated()]); // Dependency ensures it runs on login

  // ===================================
  // LISTEN TO LOCAL STORAGE / TABS
  // ===================================
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === WISHLIST_KEY || e.type === 'wishlist-updated') {
        try {
          const stored = localStorage.getItem(WISHLIST_KEY);
          const newIds = stored ? JSON.parse(stored) : [];
          setWishlistIds((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(newIds)) {
              return prev;
            }
            return newIds;
          });
        } catch (err) {
          console.error("Error parsing wishlist sync", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wishlist-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist-updated', handleStorageChange);
    };
  }, []);

  // ===================================
  // CORE ACTIONS
  // ===================================
  const toggleWishlist = async (packageId) => {
    // UI Optimistic Update
    const isCurrentSaved = isInWishlist(packageId);

    let newIds;
    if (isCurrentSaved) {
      newIds = wishlistIds.filter(id => id !== packageId);
    } else {
      newIds = [...wishlistIds, packageId];
    }

    setWishlistIds(newIds);
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(newIds));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (e) { console.error('Failed stringifying local storage', e); }

    // Sync Backend if Auth
    const token = authAPI.getToken();
    if (token) {
      const res = await wishlistAPI.toggle(packageId, token);
      if (!res.success) {
        // Rollback optimistic update if failed
        console.error("Wishlist backend sync failed", res.message);
        setWishlistIds(wishlistIds); // Reset to previous
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
      }
    }
  };

  const isInWishlist = (packageId) => {
    if (!packageId) return false;
    return wishlistIds.includes(packageId) || wishlistIds.includes(String(packageId)) || wishlistIds.includes(Number(packageId));
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    localStorage.removeItem(WISHLIST_KEY);
  };

  const getWishlistCount = () => {
    return wishlistIds.length;
  }

  // ===================================
  // WIDGET & PAGE POPULATOR
  // ===================================
  const fetchWishlistPackages = async () => {
    if (wishlistIds.length === 0) {
      setWishlistPackages([]);
      return;
    }

    setLoading(true);
    try {
      const data = await packageAPI.getAll();
      if (data.success && data.packages) {
        const allPkgs = data.packages.map(transformPackage);
        const savedPkgs = allPkgs.filter(pkg =>
          wishlistIds.includes(pkg.id) || wishlistIds.includes(String(pkg.id)) || wishlistIds.includes(Number(pkg.id))
        );
        setWishlistPackages(savedPkgs);
      }
    } catch (err) {
      console.error("Error fetching wishlist packages:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    wishlistIds,
    wishlistPackages,
    loading,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    fetchWishlistPackages
  };
};

