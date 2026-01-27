import { UserProfile } from '../types/auth-api';

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

    // Remover também o cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
  }
}

export function setAuthState(token: string, user: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_profile', JSON.stringify(user));

    // Salvar também nos cookies para o middleware poder acessar
    // Expira em 7 dias
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos
    const expiresDate = new Date(Date.now() + expiresIn);
    
    // Em produção (HTTPS), adicionar Secure
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    
    document.cookie = `auth_token=${token}; path=/; expires=${expiresDate.toUTCString()}; SameSite=Lax${secureFlag}`;
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
