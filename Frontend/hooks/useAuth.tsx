// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    // Check on mount and set up event listener
    checkAuth();
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('auth-change', checkAuth);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('auth-change', checkAuth);
    };
  }, []);
  
  function checkAuth() {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }
  
  function handleStorageChange(e: StorageEvent) {
    if (e.key === 'access_token') {
      checkAuth();
    }
  }
  
  return { isAuthenticated };
}