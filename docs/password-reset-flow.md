# Fluxo de Reset de Senha

## Visão Geral

O sistema de reset de senha segue um fluxo de 3 passos com validação em cada etapa e persistência de dados no localStorage.

## Passo 1: Solicitar Reset de Senha

**Rota:** `POST /auth/request-password-reset`

**Payload:**

```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta:**

```json
{
  "message": "Código de redefinição enviado para seu email",
  "email": "usuario@exemplo.com"
}
```

**Ações do Frontend:**

- Salva o email no localStorage
- Redireciona para tela de verificação de código

## Passo 2: Verificar Código

**Rota:** `POST /auth/verify-reset-code`

**Payload:**

```json
{
  "email": "usuario@exemplo.com", // Pego do localStorage
  "code": "123456"
}
```

**Resposta:**

```json
{
  "message": "Código verificado com sucesso",
  "valid": true
}
```

**Ações do Frontend:**

- Recupera email do localStorage
- Salva o código no localStorage
- Redireciona para tela de nova senha

## Passo 3: Redefinir Senha

**Rota:** `POST /auth/reset-password`

**Payload:**

```json
{
  "email": "usuario@exemplo.com", // Pego do localStorage
  "code": "123456",               // Pego do localStorage
  "newPassword": "MinhaSenha123!"
}
```

**Resposta:**

```json
{
  "message": "Senha redefinida com sucesso"
}
```

**Ações do Frontend:**

- Recupera email e código do localStorage
- Limpa todos os dados do localStorage
- Mostra tela de sucesso

## Gerenciamento de Estado

### PasswordResetService

O serviço gerencia o localStorage e fornece métodos para:

- `saveEmail(email)`: Salva email no localStorage
- `getEmail()`: Recupera email do localStorage
- `saveCode(code)`: Salva código no localStorage
- `getCode()`: Recupera código do localStorage
- `clearData()`: Limpa todos os dados
- `hasEmail()`: Verifica se existe email salvo
- `hasCode()`: Verifica se existe código salvo

### Fluxo de Navegação

```
/forgot-password → /reset-password/verify-code → /reset-password/new-password → /login
```

### Validações

- **Email**: Formato válido e obrigatório
- **Código**: 6 dígitos obrigatórios
- **Nova Senha**: Mínimo 8 caracteres
- **Confirmação**: Deve coincidir com nova senha

### Segurança

- Dados são limpos do localStorage após sucesso
- Validação em cada etapa
- Redirecionamento automático em caso de erro
- Verificação de dados existentes antes de cada operação

## Componentes

### ForgotPasswordScreen

- Formulário para solicitar reset
- Salva email no localStorage
- Redireciona para verificação de código

### VerifyCodeScreen

- Formulário para código de 6 dígitos
- Recupera email do localStorage
- Salva código no localStorage
- Redireciona para nova senha

### NewPasswordScreen

- Formulário para nova senha
- Recupera email e código do localStorage
- Limpa dados após sucesso
- Redireciona para login

## APIs

### requestPasswordReset

- Endpoint: `/auth/request-password-reset`
- Método: `POST`
- Função: `requestPasswordReset(data: RequestPasswordResetDto)`

### verifyResetCode

- Endpoint: `/auth/verify-reset-code`
- Método: `POST`
- Função: `verifyResetCode(data: VerifyResetCodeDto)`

### resetPassword

- Endpoint: `/auth/reset-password`
- Método: `POST`
- Função: `resetPassword(data: ResetPasswordDto)`

## Tratamento de Erros

- Validação de campos obrigatórios
- Verificação de dados no localStorage
- Mensagens de erro específicas
- Redirecionamento em caso de falha
- Logs de erro no console
