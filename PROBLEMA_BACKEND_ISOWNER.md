# 🐛 Problema no Backend: isOwner e isMember sempre retornam false

## 📋 Resumo do Problema

O endpoint `GET /communities` está retornando `isOwner: false` e `isMember: false` mesmo quando:
- ✅ O token JWT está sendo enviado corretamente no header `Authorization: Bearer <token>`
- ✅ O `userId` extraído do token corresponde ao `ownerId` da comunidade
- ✅ O usuário é o criador/dono da comunidade

## 🔍 Evidências do Problema

### Dados do Frontend (logs do console):
```
Token enviado: ✅ SIM
userIdFromToken: 'd99f095c-32e1-496e-b20e-73a554bb9538'
ownerId da comunidade: 'd99f095c-32e1-496e-b20e-73a554bb9538'
Correspondência: ✅ SIM (userId === ownerId)
```

### Resposta da API:
```json
{
  "success": true,
  "data": [
    {
      "id": "1b380319-9336-479a-8ac2-aed60cfdae4c",
      "name": "teste",
      "ownerId": "d99f095c-32e1-496e-b20e-73a554bb9538",
      "isOwner": false,  // ❌ DEVERIA SER true
      "isMember": false, // ❌ DEVERIA SER true
      "memberCount": 1
    }
  ]
}
```

## 🎯 O que o Backend Precisa Corrigir

### 1. Verificar se o token JWT está sendo decodificado corretamente
- O backend deve extrair o `userId` do token JWT enviado no header `Authorization`
- Verificar se o middleware de autenticação está funcionando corretamente

### 2. Comparar userId do token com ownerId da comunidade
```typescript
// Lógica esperada no backend:
const userIdFromToken = decodedToken.userId; // ou decodedToken.sub
const isOwner = community.ownerId === userIdFromToken;
const isMember = isOwner || community.members.some(m => m.userId === userIdFromToken);
```

### 3. Retornar isOwner e isMember corretos na resposta
- Se `userIdFromToken === ownerId` → `isOwner: true`
- Se `isOwner: true` → `isMember: true` (dono sempre é membro)
- Se não for dono, verificar se está na lista de membros para `isMember`

## 📝 Checklist para Correção

- [ ] Verificar se o middleware de autenticação está decodificando o token JWT
- [ ] Verificar se o `userId` está sendo extraído corretamente do token
- [ ] Verificar se a comparação `userId === ownerId` está sendo feita
- [ ] Verificar se `isMember` está sendo calculado corretamente (dono sempre é membro)
- [ ] Testar com token válido e verificar se retorna `isOwner: true` quando aplicável
- [ ] Testar sem token e verificar se retorna `isOwner: false` e `isMember: false`

## 🔗 Endpoint Afetado

- **GET** `/communities`
- **Headers esperados**: `Authorization: Bearer <token>`

## 📊 Exemplo de Resposta Esperada (Corrigida)

```json
{
  "success": true,
  "data": [
    {
      "id": "1b380319-9336-479a-8ac2-aed60cfdae4c",
      "name": "teste",
      "ownerId": "d99f095c-32e1-496e-b20e-73a554bb9538",
      "isOwner": true,   // ✅ CORRETO quando userId === ownerId
      "isMember": true,  // ✅ CORRETO quando isOwner === true
      "memberCount": 1
    }
  ]
}
```

## ⚠️ Importante

- Sem token: `isOwner` e `isMember` devem ser `false` (comportamento atual está correto)
- Com token válido: `isOwner` e `isMember` devem refletir corretamente a relação do usuário com a comunidade

