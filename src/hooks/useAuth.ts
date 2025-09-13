import { useState, useEffect } from 'react';
import { AuthState, getAuthState, clearAuthState } from '../lib/auth';
import { UserProfile } from '../types/auth-api';
import { getProfile } from '../api/auth/get-profile';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    token: null 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const state = getAuthState();
        
        if (state.isAuthenticated && state.token) {
          // Se há um token válido, buscar dados atualizados do perfil
          try {
            const userProfile = await getProfile();
            setAuthState({ ...state, user: userProfile });
            console.log('Perfil atualizado do servidor:', userProfile);
          } catch (error) {
            console.error('Erro ao buscar perfil do servidor:', error);
            // Se falhar, usar dados do localStorage
            setAuthState(state);
          }
        } else {
          setAuthState(state);
        }
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        setAuthState({ isAuthenticated: false, user: null, token: null });
      } finally {
        setIsLoading(false);
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
