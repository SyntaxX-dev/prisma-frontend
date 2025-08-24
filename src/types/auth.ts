import { EducationLevel } from './education';

export type User = {
	id: string;
	name: string;
	email: string;
	age: number;
	educationLevel: EducationLevel;
	createdAt: Date;
	updatedAt: Date;
};

export type Session = {
	user: User;
	token: string;
};

export interface RegisterUserDto {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	age: number;
	educationLevel: EducationLevel;
}

export interface LoginUserDto {
	email: string;
	password: string;
}

export interface RequestPasswordResetDto {
	email: string;
}

export interface RequestPasswordResetResponse {
	message: string;
	email: string;
}

export interface VerifyResetCodeDto {
	email: string;
	code: string;
}

export interface VerifyResetCodeResponse {
	message: string;
	valid: boolean;
}

export interface ResetPasswordDto {
	email: string;
	code: string;
	newPassword: string;
}

export interface ResetPasswordResponse {
	message: string;
}



