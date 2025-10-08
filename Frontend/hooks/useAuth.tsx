// hooks/useAuth.ts
import { useState, useEffect } from 'react';

// Custom event for auth changes
export const AUTH_CHANGE_EVENT = 'auth-change';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Function to check auth status
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  };
  
  useEffect(() => {
    // Check on initial load
    checkAuth();
    
    // Listen for auth change events
    const handleAuthChange = () => checkAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    
    // Also listen for localStorage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return { isAuthenticated };
}