import { UserProfile } from '@/types/auth-api';

/**
 * Extrai o valor do email do perfil do usuário
 * Lida com tanto o formato string quanto o formato objeto {value, readonly, tag}
 */
export function getEmailValue(user: UserProfile | null): string {
  if (!user?.email) return '';
  
  if (typeof user.email === 'string') {
    return user.email;
  }
  
  return user.email.value || '';
}

/**
 * Verifica se o email é editável
 * Retorna false se o email for readonly
 */
export function isEmailEditable(user: UserProfile | null): boolean {
  if (!user?.email) return false;
  
  if (typeof user.email === 'string') {
    return true; // Assume que é editável se for string
  }
  
  return !user.email.readonly;
}
