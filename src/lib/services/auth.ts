import { UserProfile } from '../../types/auth-api';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
}

export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, token: null };
  }

  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('user_profile');
  
  let user: UserProfile | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user_profile');
    }
  }

  return {
    isAuthenticated: !!token && !!user,
    user,
    token
  };
}

export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('reset_email');
  }
}

export function setAuthState(token: string, user: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_profile', JSON.stringify(user));
  }
}

export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('reset_email');
}

export function setStoredEmail(email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('reset_email', email);
  }
}
