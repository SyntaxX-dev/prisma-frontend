# Debug de Notificações e Pedidos de Amizade

## Problemas Identificados

### 1. Notificação não chegando via WebSocket
**Sintoma**: Pedido de amizade é criado com sucesso, mas o receiver não recebe notificação em tempo real.

**Possíveis causas**:
- Backend não está emitindo o evento `friend_request` para o receiver
- WebSocket não está conectado no receiver
- Evento está sendo emitido com nome diferente
- Problema de autenticação no WebSocket

**Debug adicionado**:
- Logs de todos os eventos recebidos via `socket.onAny()`
- Logs de conexão e autenticação do WebSocket
- Logs do Socket ID e status de conexão

**Como verificar**:
1. Abra o console do navegador do receiver
2. Verifique se aparece `[useNotifications] ✅ Conectado ao WebSocket`
3. Verifique se aparece `[useNotifications] ✅ Autenticado:` com o userId
4. Verifique se aparece `[useNotifications] 📨 Evento recebido: friend_request` quando o pedido é enviado

### 2. Pedidos desaparecendo após refresh
**Sintoma**: Ao atualizar a página, o endpoint `/friendships/requests` retorna `{"success":true,"data":[]}`

**Possíveis causas**:
- Backend está retornando estrutura diferente (array vazio ao invés de objeto com `sent` e `received`)
- Backend está filtrando incorretamente os pedidos
- Problema de autenticação (token diferente após refresh)
- Pedidos estão sendo deletados automaticamente

**Debug adicionado**:
- Log completo da resposta do endpoint
- Verificação se a resposta vem como array e transformação para formato esperado

**Como verificar**:
1. Abra o console do navegador
2. Verifique o log `[getFriendRequests] Resposta completa:` após refresh
3. Verifique se a estrutura está correta: `{ success: true, data: { sent: [], received: [] } }`

## Próximos Passos

### Se o problema for no Backend:

1. **WebSocket não emite evento**:
   - Verificar se o backend está emitindo `socket.to(receiverId).emit('friend_request', data)` após criar o pedido
   - Verificar se o receiver está conectado ao namespace correto
   - Verificar se o userId do receiver está correto

2. **Endpoint retorna estrutura errada**:
   - Verificar se o endpoint `/friendships/requests` está retornando `{ sent: [], received: [] }` ou apenas `[]`
   - Verificar se os filtros de query estão corretos
   - Verificar se a autenticação está funcionando corretamente

### Se o problema for no Frontend:

1. **WebSocket não conecta**:
   - Verificar se o token está sendo enviado corretamente
   - Verificar se a URL do WebSocket está correta
   - Verificar se há erros de CORS

2. **Estrutura de dados incorreta**:
   - O código já trata o caso de array vazio
   - Verificar se os dados estão sendo parseados corretamente

## Informações para o Backend

Se o problema for no backend, informe:

1. **Para WebSocket**:
   - O evento está sendo emitido? Qual o nome exato do evento?
   - O receiver está conectado quando o pedido é criado?
   - O userId do receiver está correto?

2. **Para Endpoint de Listagem**:
   - Qual a estrutura exata da resposta do `/friendships/requests`?
   - Os pedidos estão sendo persistidos no banco de dados?
   - Há algum filtro que pode estar removendo os pedidos?

