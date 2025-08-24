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

// Exemplo de dados de registro
const registerData: RegisterUserDto = {
  name: "Breno Lima",
  email: "brenohslima@gmail.com",
  password: "123123",
  confirmPassword: "123123",
  age: 23,
  educationLevel: EducationLevel.UNDERGRADUATE
};

// Exemplo de dados de login
const loginData: LoginUserDto = {
  email: "brenohslima@gmail.com",
  password: "123123"
};

// Exemplo de dados para solicitar reset de senha
const requestPasswordResetData: RequestPasswordResetDto = {
  email: "brenohslima@gmail.com"
};

// Exemplo de dados para verificar código
const verifyCodeData: VerifyResetCodeDto = {
  email: "brenohslima@gmail.com",
  code: "123456"
};

// Exemplo de dados para resetar senha
const resetPasswordData: ResetPasswordDto = {
  email: "brenohslima@gmail.com",
  code: "123456",
  newPassword: "MinhaSenha123!"
};

// Exemplo de validação
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

// Exemplo de uso dos validadores
export function exampleUsage() {
  // Validar dados de registro
  const registerResult = validateRegisterData(registerData);
  
  // Validar dados de login
  try {
    const loginResult = loginSchema.parse(loginData);
    console.log('Login válido:', loginResult);
  } catch (error) {
    console.error('Erro no login:', error);
  }
  
  // Validar dados de solicitar reset de senha
  try {
    const requestResult = requestPasswordResetSchema.parse(requestPasswordResetData);
    console.log('Solicitar reset válido:', requestResult);
  } catch (error) {
    console.error('Erro ao solicitar reset:', error);
  }
}

// Exemplo de mapeamento de níveis de educação
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
