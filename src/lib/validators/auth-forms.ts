import { z } from 'zod';
import { EducationLevel } from '../../types/auth-api';

const passwordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos 1 número')
  .regex(/[@$!%*?&]/, 'A senha deve conter pelo menos 1 caractere especial (@$!%*?&)');

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  email: z.string()
    .email('Email inválido'),
  
  password: passwordSchema,
  
  confirmPassword: z.string(),
  
  age: z.number()
    .int('Idade deve ser um número inteiro')
    .min(0, 'Idade deve ser maior ou igual a 0')
    .max(120, 'Idade deve ser menor que 120'),
  
  educationLevel: z.enum([
    'FUNDAMENTAL',
    'ENSINO_MEDIO', 
    'GRADUACAO',
    'POS_GRADUACAO',
    'MESTRADO',
    'DOUTORADO'
  ] as const, {
    errorMap: () => ({ message: 'Nível educacional inválido' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export const requestResetSchema = z.object({
  email: z.string().email('Email inválido')
});

export const verifyCodeSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  code: z.string()
    .length(6, 'Código deve ter exatamente 6 caracteres')
    .regex(/^[0-9]+$/, 'Código deve conter apenas números')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  code: z.string()
    .length(6, 'Código deve ter exatamente 6 caracteres')
    .regex(/^[0-9]+$/, 'Código deve conter apenas números'),
  newPassword: passwordSchema
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RequestResetFormData = z.infer<typeof requestResetSchema>;
export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
