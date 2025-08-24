const PASSWORD_RESET_EMAIL_KEY = 'password_reset_email';
const PASSWORD_RESET_CODE_KEY = 'password_reset_code';

export class PasswordResetService {

  static saveEmail(email: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PASSWORD_RESET_EMAIL_KEY, email);
    }
  }

  static getEmail(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PASSWORD_RESET_EMAIL_KEY);
    }
    return null;
  }

  static saveCode(code: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PASSWORD_RESET_CODE_KEY, code);
    }
  }

  static getCode(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PASSWORD_RESET_CODE_KEY);
    }
    return null;
  }

  static clearData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
      localStorage.removeItem(PASSWORD_RESET_CODE_KEY);
    }
  }

  static hasEmail(): boolean {
    return this.getEmail() !== null;
  }

  static hasCode(): boolean {
    return this.getCode() !== null;
  }
} 
