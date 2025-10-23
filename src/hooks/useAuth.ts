import { useState, useEffect } from 'react';
import { AuthState, getAuthState, clearAuthState } from '../lib/auth';
import { UserProfile } from '../types/auth-api';
import { getProfile } from '../api/auth/get-profile';
import { useNotifications } from './useNotifications';
import { useClientOnly } from './useClientOnly';


export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    token: null 
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useNotifications();
  const isClient = useClientOnly();

  useEffect(() => {
    if (!isClient) return;

    const loadAuthState = async () => {
      try {
        const state = getAuthState();
        
        if (state.isAuthenticated && state.token) {
          if (!state.user) {
            try {
              const userProfile = await getProfile();
              setAuthState({ ...state, user: userProfile });
            } catch {
              setAuthState(state);
            }
          } else {
            setAuthState(state);
          }
        } else {
          setAuthState(state);
        }
      } catch {
        setAuthState({ isAuthenticated: false, user: null, token: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, [isClient]);

  const login = (token: string, user: UserProfile, rememberMe: boolean = false) => {
    setAuthState({ isAuthenticated: true, user, token });
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_profile', JSON.stringify(user));
    localStorage.setItem('remember_me', rememberMe.toString());
    
    if (rememberMe) {
      localStorage.setItem('auth_expires', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());
    } else {
      localStorage.setItem('auth_expires', (Date.now() + 24 * 60 * 60 * 1000).toString());
    }
    
    showSuccess(`Bem-vindo, ${user.name}!`);
  };

  const logout = () => {
    const userName = authState.user?.name || 'Usuário';
    clearAuthState();
    localStorage.removeItem('remember_me');
    localStorage.removeItem('auth_expires');
    setAuthState({ isAuthenticated: false, user: null, token: null });
    showSuccess(`Até logo, ${userName}!`);
  };

  const updateUser = (user: UserProfile) => {
    setAuthState(prev => ({ ...prev, user }));
    
    // Atualizar também no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(user));
    }
  };

  return {
    ...authState,
    isLoading,
    login,
    logout,
    updateUser
  };
}
