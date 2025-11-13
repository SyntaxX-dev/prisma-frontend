# Problemas Identificados no Backend - Friendships

## 1. Estrutura de Resposta do GET /friendships/requests

### Problema
O endpoint está retornando:
```json
{
  "success": true,
  "data": []
}
```

### Esperado
O endpoint deveria retornar:
```json
{
  "success": true,
  "data": {
    "sent": [],
    "received": []
  }
}
```

### Impacto
- O frontend não consegue identificar pedidos enviados ou recebidos
- O botão de "Solicitar amizade" não atualiza corretamente após enviar pedido
- Não é possível listar pedidos pendentes

### Solução no Backend
O endpoint `/friendships/requests` deve retornar um objeto com duas propriedades:
- `sent`: Array de pedidos enviados pelo usuário autenticado
- `received`: Array de pedidos recebidos pelo usuário autenticado

## 2. WebSocket Desconectando

### Problema
O WebSocket está sendo desconectado pelo servidor com o motivo `io server disconnect` **imediatamente após a conexão**.

### Logs do Frontend (Confirmado)
```
[useNotifications] Conectando ao WebSocket...
[useNotifications] API URL: https://prisma-backend-production-4c22.up.railway.app
[useNotifications] Socket URL: wss://prisma-backend-production-4c22.up.railway.app/notifications
[useNotifications] ✅ Conectado ao WebSocket
[useNotifications] ❌ Desconectado do WebSocket: io server disconnect
[useNotifications] ⚠️ Servidor desconectou o cliente. Possíveis causas:
[useNotifications] - Token inválido ou expirado
[useNotifications] - Problema de autenticação no WebSocket
[useNotifications] - Namespace incorreto
```

### Comportamento Observado
1. O cliente conecta com sucesso (`connect` event)
2. **NUNCA** recebe o evento `connected` (autenticação)
3. O servidor desconecta imediatamente com `io server disconnect`
4. Isso indica que o middleware de autenticação está rejeitando a conexão

### Possíveis Causas
1. **Autenticação falhando**: O token JWT não está sendo validado corretamente no WebSocket
2. **Token não sendo enviado**: O token pode não estar sendo enviado no `auth.token`
3. **Middleware de autenticação ausente**: O namespace `/notifications` pode não ter middleware de autenticação
4. **Namespace incorreto**: O cliente está conectando em `/notifications`, mas o servidor pode esperar outro namespace
5. **Formato do token incorreto**: O backend pode esperar o token em outro formato (ex: `Bearer <token>` ao invés de apenas `<token>`)

### Solução no Backend
1. **Verificar middleware de autenticação do WebSocket**:
   ```javascript
   // Deve ter algo assim no namespace /notifications
   io.of('/notifications').use((socket, next) => {
     const token = socket.handshake.auth.token;
     // Validar token JWT
     // Se válido: next()
     // Se inválido: next(new Error('Unauthorized'))
   });
   ```

2. **Verificar se o token está sendo recebido**:
   - Adicionar logs no servidor para ver se `socket.handshake.auth.token` está presente
   - Verificar se o formato do token está correto

3. **Verificar se o namespace `/notifications` está configurado**:
   - Confirmar que o namespace existe no servidor
   - Verificar se os eventos estão sendo emitidos para este namespace

4. **Verificar logs do servidor quando o cliente se conecta**:
   - Ver se há erros de autenticação
   - Ver se o middleware está sendo executado

5. **Garantir que o token JWT está sendo validado corretamente**:
   - Usar a mesma lógica de validação do JWT que é usada nas rotas HTTP
   - Verificar se o token não está expirado

## 3. Notificações não sendo Emitidas

### Problema
Quando um pedido de amizade é criado, o receiver não recebe a notificação via WebSocket.

### Possíveis Causas
1. O evento `friend_request` não está sendo emitido após criar o pedido
2. O evento está sendo emitido para o usuário errado
3. O receiver não está conectado ao WebSocket quando o pedido é criado
4. O nome do evento está diferente (ex: `friendship_request` ao invés de `friend_request`)

### Solução no Backend
1. Verificar se após criar o pedido em `POST /friendships/requests`, o código emite:
   ```javascript
   io.to(receiverId).emit('friend_request', notificationData);
   ```
2. Verificar se o `receiverId` está correto
3. Verificar se o receiver está conectado ao namespace correto
4. Verificar logs do servidor quando o pedido é criado

## 4. Pedidos Desaparecendo

### Problema
Após criar um pedido com sucesso, ao atualizar a página, o endpoint retorna array vazio.

### Possíveis Causas
1. Os pedidos não estão sendo persistidos no banco de dados
2. O endpoint está filtrando incorretamente (ex: por status, por data)
3. Problema de autenticação fazendo o endpoint retornar vazio
4. Os pedidos estão sendo deletados automaticamente

### Solução no Backend
1. Verificar se os pedidos estão sendo salvos no banco de dados
2. Verificar os filtros aplicados no endpoint GET
3. Verificar se a autenticação está funcionando corretamente
4. Verificar se há algum job/cron que está deletando pedidos antigos

## Resumo

### Problemas Confirmados (Backend)
1. ✅ **GET /friendships/requests retorna estrutura errada** - Retorna array ao invés de objeto com `sent` e `received`
2. ✅ **WebSocket desconectando** - Servidor está desconectando o cliente
3. ⚠️ **Notificações não chegando** - Provável que o evento não esteja sendo emitido

### Problemas no Frontend (Já Corrigidos)
1. ✅ Tratamento de resposta como array vazio
2. ✅ Tratamento de erro quando já existe pedido
3. ✅ Logs de debug adicionados

## Próximos Passos

1. **Backend deve corrigir a estrutura de resposta** do GET `/friendships/requests`
2. **Backend deve verificar a autenticação do WebSocket** e por que está desconectando
3. **Backend deve verificar se o evento `friend_request` está sendo emitido** após criar pedido
4. **Backend deve verificar por que os pedidos desaparecem** após refresh

