// utils/auth.ts
import { AUTH_CHANGE_EVENT } from '@/hooks/useAuth';

export const login = (token: string, refreshToken: string) => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refreshToken);
  
  // Dispatch event to notify all components about auth change
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Dispatch event to notify all components about auth change
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};