import * as z from 'zod';
import { EducationLevel } from '@/types/education';
import { ageWithEducationSchema } from './education';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).merge(ageWithEducationSchema).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const requestPasswordResetSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
});

export const verifyResetCodeSchema = z.object({
  code: z.string().min(6, 'Código deve ter 6 dígitos').max(6, 'Código deve ter 6 dígitos'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>;
export type VerifyResetCodeFormData = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>; 
