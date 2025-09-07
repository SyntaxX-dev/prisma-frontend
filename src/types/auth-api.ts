// DTOs de Autenticação
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  educationLevel: EducationLevel;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export type EducationLevel = 
  | 'FUNDAMENTAL' 
  | 'ENSINO_MEDIO' 
  | 'GRADUACAO' 
  | 'POS_GRADUACAO' 
  | 'MESTRADO' 
  | 'DOUTORADO';

// Respostas da API
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  nome: string;
  email: string;
  age: number;
  educationLevel: EducationLevel;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
  timestamp: string;
}


// Mapeamento de níveis educacionais para português
export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  FUNDAMENTAL: 'Ensino Fundamental',
  ENSINO_MEDIO: 'Ensino Médio',
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado'
};
