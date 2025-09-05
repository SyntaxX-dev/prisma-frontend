// Exemplo de uso dos novos tipos e validadores de autenticação

import { 
  RegisterUserDto, 
  LoginUserDto, 
  RequestPasswordResetDto, 
  VerifyResetCodeDto, 
  ResetPasswordDto 
} from '@/types/auth';
import { EducationLevel } from '@/types/education';
import { 
  registerSchema, 
  loginSchema, 
  requestPasswordResetSchema, 
  verifyResetCodeSchema, 
  resetPasswordSchema 
} from '@/lib/validators/auth';

const registerData: RegisterUserDto = {
  name: "Breno Lima",
  email: "brenohslima@gmail.com",
  password: "123123",
  confirmPassword: "123123",
  age: 23,
  educationLevel: EducationLevel.UNDERGRADUATE
};

const loginData: LoginUserDto = {
  email: "brenohslima@gmail.com",
  password: "123123"
};

const requestPasswordResetData: RequestPasswordResetDto = {
  email: "brenohslima@gmail.com"
};

const verifyCodeData: VerifyResetCodeDto = {
  email: "brenohslima@gmail.com",
  code: "123456"
};

const resetPasswordData: ResetPasswordDto = {
  email: "brenohslima@gmail.com",
  code: "123456",
  newPassword: "MinhaSenha123!"
};

export function validateRegisterData(data: unknown) {
  try {
    const validatedData = registerSchema.parse(data);
    console.log('Dados válidos:', validatedData);
    return { success: true, data: validatedData };
  } catch (error) {
    console.error('Erro de validação:', error);
    return { success: false, error };
  }
}

export function exampleUsage() {

  const registerResult = validateRegisterData(registerData);
  
  try {
    const loginResult = loginSchema.parse(loginData);
    console.log('Login válido:', loginResult);
  } catch (error) {
    console.error('Erro no login:', error);
  }
  
  try {
    const requestResult = requestPasswordResetSchema.parse(requestPasswordResetData);
    console.log('Solicitar reset válido:', requestResult);
  } catch (error) {
    console.error('Erro ao solicitar reset:', error);
  }
}

export function mapEducationLevel(level: string): EducationLevel {
  const mapping: Record<string, EducationLevel> = {
    'FUNDAMENTAL': EducationLevel.ELEMENTARY,
    'ENSINO_MEDIO': EducationLevel.HIGH_SCHOOL,
    'GRADUACAO': EducationLevel.UNDERGRADUATE,
    'POS_GRADUACAO': EducationLevel.POSTGRADUATE,
    'MESTRADO': EducationLevel.MASTER,
    'DOUTORADO': EducationLevel.DOCTORATE,
  };
  
  return mapping[level] || EducationLevel.UNDERGRADUATE;
} 
