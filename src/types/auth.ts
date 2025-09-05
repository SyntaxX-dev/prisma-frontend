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


export interface RequestPasswordResetResponse {
	message: string;
	email: string;
}

export interface VerifyResetCodeResponse {
	message: string;
	valid: boolean;
}

export interface ResetPasswordResponse {
	message: string;
}



