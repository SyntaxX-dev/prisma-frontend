import { useState, useEffect } from 'react';
import { AuthState, getAuthState, clearAuthState } from '../lib/auth';
import { UserProfile } from '../types/auth-api';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    token: null 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const state = getAuthState();
    setAuthState(state);
    setIsLoading(false);
  }, []);

  const login = (token: string, user: UserProfile) => {
    setAuthState({ isAuthenticated: true, user, token });
  };

  const logout = () => {
    clearAuthState();
    setAuthState({ isAuthenticated: false, user: null, token: null });
  };

  const updateUser = (user: UserProfile) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  return {
    ...authState,
    isLoading,
    login,
    logout,
    updateUser
  };
}
