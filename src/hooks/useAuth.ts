import { useState, useEffect } from 'react';
import { AuthState, getAuthState, clearAuthState } from '../lib/auth';
import { UserProfile } from '../types/auth-api';
import { getProfile } from '../api/auth/get-profile';

// Estado global para controlar se já foi carregado
let globalAuthLoaded = false;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    token: null 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (globalAuthLoaded) {
      setIsLoading(false);
      return;
    }
    
    const loadAuthState = async () => {
      try {
        const state = getAuthState();
        
        if (state.isAuthenticated && state.token) {
          try {
            const userProfile = await getProfile();
            setAuthState({ ...state, user: userProfile });
          } catch {
            setAuthState(state);
          }
        } else {
          setAuthState(state);
        }
      } catch {
        setAuthState({ isAuthenticated: false, user: null, token: null });
      } finally {
        setIsLoading(false);
        globalAuthLoaded = true;
      }
    };

    loadAuthState();
  }, []);

  const login = (token: string, user: UserProfile, rememberMe: boolean = false) => {
    setAuthState({ isAuthenticated: true, user, token });
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_profile', JSON.stringify(user));
    localStorage.setItem('remember_me', rememberMe.toString());
    
    if (rememberMe) {

      localStorage.setItem('auth_expires', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString()); // 30 dias
    } else {

      localStorage.setItem('auth_expires', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 horas
    }
  };

  const logout = () => {
    clearAuthState();
    localStorage.removeItem('remember_me');
    localStorage.removeItem('auth_expires');
    setAuthState({ isAuthenticated: false, user: null, token: null });
    globalAuthLoaded = false; // Reset para permitir novo carregamento
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
