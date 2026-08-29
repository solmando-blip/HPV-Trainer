// Custom Hook für Auth mit Session-Timeout
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthTimeout = (timeout = 30 * 60 * 1000) => { // 30 minutes default
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Session abgelaufen - logout
      localStorage.removeItem('hpv_token');
      localStorage.removeItem('hpv_user');
      navigate('/login');
    }, timeout);
  }, [timeout, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('hpv_token');
    if (!token) return;

    resetTimeout();

    // Listener für User-Aktivität
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);

  return null;
};

export default useAuthTimeout;
