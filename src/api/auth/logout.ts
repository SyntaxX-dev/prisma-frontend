import { httpClient } from '../http/client';

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function logoutUser(): Promise<LogoutResponse> {
  try {
    // Chamar API de logout do backend para marcar como offline
    try {
      const response = await httpClient.post<LogoutResponse>('/auth/logout', {});
      console.log('[logoutUser] ✅ Logout realizado no backend:', response);
    } catch (error) {
      console.warn('[logoutUser] ⚠️ Erro ao fazer logout no backend (continuando mesmo assim):', error);
    }

    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('reset_email');
    }

    return { success: true, message: 'Logout realizado com sucesso' };
  } catch (error) {
    console.error('[logoutUser] ❌ Erro ao fazer logout:', error);
    throw error;
  }
}



