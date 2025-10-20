export function cn(...classes: Array<string | false | null | undefined>): string {
	return classes.filter(Boolean).join(' ');
}

// Re-export email utilities
export { getEmailValue, isEmailEditable } from './utils/email';



