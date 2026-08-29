// Custom Hook für Loading-Zustand
import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const withLoading = useCallback(async (fn) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return [loading, setLoading, withLoading];
};

export default useLoading;
