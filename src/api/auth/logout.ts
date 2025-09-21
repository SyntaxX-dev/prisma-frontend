export async function logoutUser(): Promise<void> {
  try {

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('reset_email');
    }
  } catch (error) {
    throw error;
  }
}



