
import { registerUser } from '../api/auth/register';
import { loginUser } from '../api/auth/login';
import { logoutUser } from '../api/auth/logout';
import { getProfile } from '../api/auth/get-profile';
import { requestPasswordReset } from '../api/auth/request-password-reset';
import { verifyResetCode } from '../api/auth/verify-reset-code';
import { resetPassword } from '../api/auth/reset-password';
import { useAuth } from '../hooks/useAuth';
import { EDUCATION_LEVEL_LABELS } from '../types/auth-api';

export async function exemploRegistro() {
  try {
    const userData = {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: 'MinhaSenh@123',
      confirmPassword: 'MinhaSenh@123',
      age: 25,
      educationLevel: 'GRADUACAO' as const
    };

    const response = await registerUser(userData);
    console.log('Usuário registrado:', response.user);
    console.log('Token:', response.token);
    
    return response;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
}

export async function exemploLogin() {
  try {
    const loginData = {
      email: 'joao@exemplo.com',
      password: 'MinhaSenh@123'
    };

    const response = await loginUser(loginData);
    console.log('Login realizado:', response.user);
    
    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function exemploResetSenha() {
  try {

    const email = 'joao@exemplo.com';
    await requestPasswordReset({ email });
    console.log('Código enviado para:', email);

    const codigo = '123456';
    await verifyResetCode({ code: codigo });
    console.log('Código verificado com sucesso');

    const novaSenha = 'NovaSenh@123';
    await resetPassword({ code: codigo, newPassword: novaSenha });
    console.log('Senha alterada com sucesso');

  } catch (error) {
    console.error('Erro no reset de senha:', error);
    throw error;
  }
}

export function ExemploComponenteAuth() {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Usuário não autenticado</h2>
        <button onClick={() => exemploLogin()}>
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Bem-vindo, {user?.name}!</h2>
      <p>Email: {user?.email}</p>
      <p>Idade: {user?.age}</p>
      <p>Nível Educacional: {user?.educationLevel ? EDUCATION_LEVEL_LABELS[user.educationLevel] : 'N/A'}</p>
      <button onClick={logout}>
        Sair
      </button>
    </div>
  );
}

export function exemploTratamentoErros() {
  try {
    loginUser({
      email: 'email@invalido.com',
      password: 'senhaerrada'
    });
  } catch (error: any) {
    if (error.status === 401) {
      console.error('Credenciais inválidas');
    } else if (error.status === 400) {
      console.error('Dados inválidos:', error.details);
    } else {
      console.error('Erro inesperado:', error.message);
    }
  }
}
