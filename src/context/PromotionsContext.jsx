import React, { createContext, useState, useEffect, useContext } from 'react';
import { promotionsAPI } from '../services/api';

const PromotionsContext = createContext();

export const PromotionsProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await promotionsAPI.getActivePromotions();
        if (response.success) {
          setPromotions(response.promotions);
        }
      } catch (error) {
        console.error("Failed to fetch promotions for context", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Calculate the maximum active discount percentage
  const maxDiscount = promotions.reduce((max, promo) => {
    return Math.max(max, promo.discount_percentage || 0);
  }, 0);

  return (
    <PromotionsContext.Provider value={{ promotions, maxDiscount, loading }}>
      {children}
    </PromotionsContext.Provider>
  );
};

export const usePromotions = () => {
  return useContext(PromotionsContext);
};
