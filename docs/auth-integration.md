# Integração com API de Autenticação

Este documento descreve como usar a integração com o backend de autenticação da Prisma.

## URL da API

- **Produção**: `https://prisma-backend-production-4c22.up.railway.app`
- **Desenvolvimento**: Configurável via `NEXT_PUBLIC_API_URL`

## Endpoints Disponíveis

### 1. POST /auth/register

Registra um novo usuário no sistema.

```typescript
import { registerUser } from '@/api/auth/register';

const userData = {
  name: 'João Silva',
  email: 'joao@exemplo.com',
  password: 'MinhaSenh@123',
  confirmPassword: 'MinhaSenh@123',
  age: 25,
  educationLevel: 'GRADUACAO'
};

const response = await registerUser(userData);
```

### 2. POST /auth/login

Autentica um usuário existente.

```typescript
import { loginUser } from '@/api/auth/login';

const loginData = {
  email: 'joao@exemplo.com',
  password: 'MinhaSenh@123'
};

const response = await loginUser(loginData);
```

### 3. GET /auth/profile

Obtém dados do usuário autenticado.

```typescript
import { getProfile } from '@/api/auth/get-profile';

const userProfile = await getProfile();
```

### 4. POST /auth/request-password-reset

Solicita reset de senha.

```typescript
import { requestPasswordReset } from '@/api/auth/request-password-reset';

await requestPasswordReset({ email: 'joao@exemplo.com' });
```

### 5. POST /auth/verify-reset-code

Verifica código de reset.

```typescript
import { verifyResetCode } from '@/api/auth/verify-reset-code';

await verifyResetCode({ code: '123456' });
```

### 6. POST /auth/reset-password

Define nova senha.

```typescript
import { resetPassword } from '@/api/auth/reset-password';

await resetPassword({ 
  code: '123456', 
  newPassword: 'NovaSenh@123' 
});
```

## Hook useAuth

Use o hook `useAuth` para gerenciar estado de autenticação:

```typescript
import { useAuth } from '@/hooks/useAuth';

function MeuComponente() {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    login, 
    logout 
  } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  
  if (!isAuthenticated) {
    return <div>Usuário não autenticado</div>;
  }

  return <div>Bem-vindo, {user?.name}!</div>;
}
```

## Validação de Formulários

Use os schemas de validação com Zod:

```typescript
import { registerSchema } from '@/lib/validators/auth-forms';

const result = registerSchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Gerenciamento de Estado

O sistema automaticamente:

- Salva token e perfil no `localStorage`
- Inclui token nas requisições autenticadas
- Limpa dados ao fazer logout
- Gerencia email de reset entre etapas

## Tratamento de Erros

Todas as funções lançam erros do tipo `ApiError`:

```typescript
try {
  await loginUser(credentials);
} catch (error) {
  if (error.status === 401) {
    // Credenciais inválidas
  } else if (error.status === 400) {
    // Dados inválidos
  } else {
    // Erro inesperado
  }
}
```

## Níveis Educacionais

Os níveis educacionais suportados são:

- `FUNDAMENTAL` - Ensino Fundamental
- `ENSINO_MEDIO` - Ensino Médio
- `GRADUACAO` - Graduação
- `POS_GRADUACAO` - Pós-Graduação
- `MESTRADO` - Mestrado
- `DOUTORADO` - Doutorado

## Validação de Senhas

As senhas devem conter:

- Mínimo 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número
- 1 caractere especial (@$!%*?&)
