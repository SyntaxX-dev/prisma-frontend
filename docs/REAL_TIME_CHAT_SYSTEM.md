# Sistema de Chat em Tempo Real

## Visão Geral

Este documento explica como funciona o sistema de chat em tempo real da aplicação, incluindo a arquitetura WebSocket, o problema identificado e a solução implementada.

## Problema Identificado

### Situação Inicial

O sistema possui múltiplas conexões WebSocket para diferentes funcionalidades:

1. **Socket do `UserStatusProvider`** - Gerencia status online/offline dos usuários
2. **Socket do `useChat`** - Gerencia mensagens de chat direto
3. **Socket do `useCommunityChat`** - Gerencia mensagens de comunidades
4. **Socket do `useNotifications`** - Gerencia notificações

Todos esses sockets se conectam ao mesmo namespace `/chat` no backend.

### Problema

Os eventos de chat (`new_message`, `typing`, `message_deleted`, `message_edited`) estavam chegando **apenas** no socket do `UserStatusProvider`, não no socket do `useChat`. Isso causava:

- ❌ Mensagens não chegavam em tempo real para o outro usuário
- ❌ Indicador de "digitando" não funcionava
- ❌ Eventos de edição/exclusão não eram recebidos

### Causa Raiz

O backend estava enviando os eventos apenas para um socket específico (provavelmente o primeiro conectado ou o último), ao invés de enviar para todos os sockets do usuário no namespace `/chat`.

## Arquitetura da Solução

### Fluxo de Eventos

```
Backend (Socket.IO)
    ↓
    Envia eventos apenas para socket do UserStatusProvider
    ↓
UserStatusProvider (recebe eventos)
    ↓
    Repassa via eventos customizados do navegador
    ↓
useChat (escuta eventos customizados)
    ↓
    Processa e atualiza UI
```

### Componentes Envolvidos

#### 1. UserStatusProvider (`src/providers/UserStatusProvider.tsx`)

**Responsabilidade**: Gerenciar status online/offline dos usuários e repassar eventos de chat.

**Funcionalidades**:
- Conecta ao WebSocket no namespace `/chat`
- Gerencia status dos usuários (online/offline)
- Envia heartbeats para manter conexão ativa
- **NOVO**: Repassa eventos de chat via eventos customizados do navegador

**Código relevante**:
```typescript
newSocket.onAny((eventName, ...args) => {
  // Repassar eventos de chat para o useChat via eventos customizados
  if (eventName === 'new_message' || eventName === 'typing' || 
      eventName === 'message_deleted' || eventName === 'message_edited') {
    console.log('[UserStatusProvider] 🔄 Repassando evento de chat para useChat:', eventName);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`chat_${eventName}`, {
        detail: args[0],
      }));
    }
  }
});
```

#### 2. useChat Hook (`src/hooks/features/chat/useChat.ts`)

**Responsabilidade**: Gerenciar mensagens de chat direto entre dois usuários.

**Funcionalidades**:
- Conecta ao WebSocket no namespace `/chat`
- Carrega mensagens da conversa
- Envia mensagens
- Gerencia indicador de "digitando"
- Processa eventos de chat (novas mensagens, edição, exclusão)
- **NOVO**: Escuta eventos customizados repassados pelo UserStatusProvider

**Código relevante**:
```typescript
// Escutar eventos customizados repassados pelo UserStatusProvider
useEffect(() => {
  if (typeof window === 'undefined') return;

  const handleNewMessage = (event: CustomEvent<Message>) => {
    // Processar mensagem recebida
    // Validar se pertence à conversa atual
    // Adicionar ao estado
  };

  const handleTyping = (event: CustomEvent<{...}>) => {
    // Atualizar indicador de digitação
  };

  // ... outros handlers

  window.addEventListener('chat_new_message', handleNewMessage as EventListener);
  window.addEventListener('chat_typing', handleTyping as EventListener);
  // ... outros listeners

  return () => {
    // Cleanup
  };
}, [currentChatUserId]);
```

## Fluxo Detalhado

### 1. Envio de Mensagem

```
Usuário digita e envia mensagem
    ↓
DirectChatView.handleSend()
    ↓
useChat.sendMessage()
    ↓
1. Adiciona mensagem otimista (temp-*) ao estado
2. Chama API REST: POST /messages
3. API retorna mensagem real
4. Substitui mensagem otimista pela real
    ↓
Backend processa mensagem
    ↓
Backend emite evento 'new_message' via Socket.IO
    ↓
UserStatusProvider recebe evento
    ↓
UserStatusProvider dispara evento customizado 'chat_new_message'
    ↓
useChat escuta evento customizado
    ↓
useChat valida se mensagem pertence à conversa atual
    ↓
useChat adiciona mensagem ao estado (se não existir)
    ↓
UI atualiza automaticamente
```

### 2. Recebimento de Mensagem em Tempo Real

```
Outro usuário envia mensagem
    ↓
Backend processa e emite 'new_message'
    ↓
UserStatusProvider recebe (socket: VcKyIHp_P75-Z6JfAARZ)
    ↓
UserStatusProvider dispara 'chat_new_message'
    ↓
useChat escuta evento customizado
    ↓
useChat valida:
  - currentChatUserIdRef está definido?
  - Mensagem é entre currentUserId e currentChatUserId?
    ↓
Se válida:
  - Verifica se mensagem já existe (evita duplicatas)
  - Verifica se há mensagem otimista similar (substitui)
  - Adiciona mensagem ao estado
    ↓
UI atualiza mostrando nova mensagem
```

### 3. Indicador de "Digitando"

```
Usuário começa a digitar
    ↓
DirectChatView detecta input
    ↓
useChat.sendTypingIndicator(receiverId, true)
    ↓
Socket emite evento 'typing' via Socket.IO
    ↓
Backend processa e emite 'typing' para o receiver
    ↓
UserStatusProvider recebe evento 'typing'
    ↓
UserStatusProvider dispara 'chat_typing'
    ↓
useChat escuta evento customizado
    ↓
useChat valida se evento é para conversa atual
    ↓
useChat atualiza estado: setIsTyping(true)
    ↓
UI mostra "Usuário está digitando..."
```

### 4. Edição de Mensagem

```
Usuário edita mensagem
    ↓
useChat.editMessageHandler()
    ↓
API REST: PUT /messages/:id
    ↓
Backend processa e emite 'message_edited'
    ↓
UserStatusProvider recebe e dispara 'chat_message_edited'
    ↓
useChat escuta e atualiza mensagem no estado
    ↓
UI mostra "(editado)" ao lado do timestamp
```

### 5. Exclusão de Mensagem

```
Usuário exclui mensagem
    ↓
useChat.deleteMessageHandler()
    ↓
API REST: DELETE /messages/:id
    ↓
Backend processa e emite 'message_deleted'
    ↓
UserStatusProvider recebe e dispara 'chat_message_deleted'
    ↓
useChat escuta e atualiza mensagem para "Mensagem apagada"
    ↓
UI atualiza mostrando mensagem deletada
```

## Validações e Segurança

### Validação de Conversa

Antes de processar qualquer evento de mensagem, o sistema valida se a mensagem pertence à conversa atual:

```typescript
const isFromCurrentConversation =
  (message.senderId === currentUserId && message.receiverId === currentChatUserId) ||
  (message.senderId === currentChatUserId && message.receiverId === currentUserId);
```

Isso garante que:
- Mensagens de outras conversas não sejam exibidas
- A privacidade seja mantida
- A performance seja otimizada (não processa mensagens irrelevantes)

### Prevenção de Duplicatas

O sistema verifica se a mensagem já existe antes de adicionar:

```typescript
const exists = prev.some((msg) => msg.id === message.id);
if (exists) {
  return prev; // Não adiciona duplicata
}
```

### Substituição de Mensagens Otimistas

Quando uma mensagem otimista (temp-*) é substituída pela mensagem real:

```typescript
const hasSimilarOptimistic = prev.some((msg) =>
  msg.id.startsWith('temp-') &&
  msg.content === message.content &&
  msg.senderId === message.senderId &&
  msg.receiverId === message.receiverId
);

if (hasSimilarOptimistic) {
  // Remove otimista e adiciona real
  const withoutOptimistic = prev.filter(...);
  return [...withoutOptimistic, message];
}
```

## Eventos Customizados do Navegador

### Eventos Disparados pelo UserStatusProvider

1. **`chat_new_message`**
   - **Payload**: `Message` (objeto completo da mensagem)
   - **Quando**: Nova mensagem é recebida

2. **`chat_typing`**
   - **Payload**: `{ userId?: string; receiverId?: string; senderId?: string; isTyping: boolean }`
   - **Quando**: Usuário começa/para de digitar

3. **`chat_message_deleted`**
   - **Payload**: `{ messageId: string; message: Message }`
   - **Quando**: Mensagem é deletada

4. **`chat_message_edited`**
   - **Payload**: `MessageEditedEvent`
   - **Quando**: Mensagem é editada

### Vantagens da Abordagem

✅ **Funciona imediatamente**: Não requer mudanças no backend
✅ **Transparente**: O `useChat` processa eventos como se viessem do socket
✅ **Mantém validações**: Todas as validações de segurança são mantidas
✅ **Fácil de remover**: Quando o backend for corrigido, basta remover os eventos customizados

## Heartbeat e Manutenção de Conexão

### Heartbeat do UserStatusProvider

- **Intervalo**: 30 segundos
- **Evento emitido**: `heartbeat`
- **Resposta esperada**: `heartbeat_ack`
- **Propósito**: Manter conexão ativa e atualizar status online

### Heartbeat do useChat

- **Intervalo**: 30 segundos
- **Evento emitido**: `heartbeat`
- **Resposta esperada**: `heartbeat_ack`
- **Propósito**: Manter conexão ativa

## Estados e Refs

### Estados do useChat

- `messages`: Array de mensagens da conversa atual
- `currentChatUserId`: ID do usuário com quem está conversando
- `isTyping`: Se o outro usuário está digitando
- `typingUserId`: ID do usuário que está digitando
- `pinnedMessages`: Mensagens fixadas da conversa
- `isConnected`: Se o socket está conectado

### Refs do useChat

- `socketRef`: Referência ao socket atual
- `currentChatUserIdRef`: Referência ao ID do chat atual (para closures)
- `heartbeatIntervalRef`: Referência ao intervalo de heartbeat

## Logs e Debugging

### Logs Importantes

1. **`[UserStatusProvider] 🔄 Repassando evento de chat para useChat`**
   - Indica que um evento foi repassado

2. **`[useChat] 📨 Evento new_message recebido via evento customizado`**
   - Indica que o useChat recebeu um evento

3. **`[useChat] ✅ Mensagem é da conversa atual, adicionando`**
   - Indica que a mensagem passou na validação

4. **`[useChat] ⚠️ Mensagem não é da conversa atual, ignorando`**
   - Indica que a mensagem foi filtrada (comportamento esperado)

## Melhorias Futuras

### Backend (Recomendado)

O ideal seria que o backend enviasse eventos para **todos os sockets** do usuário no namespace `/chat`:

```typescript
// Pseudocódigo do backend
const userSockets = io.sockets.adapter.rooms.get(`user:${userId}`);
userSockets.forEach(socketId => {
  io.to(socketId).emit('new_message', message);
});
```

### Frontend (Após correção do backend)

Quando o backend for corrigido, podemos:

1. Remover os eventos customizados do `UserStatusProvider`
2. Remover os listeners de eventos customizados do `useChat`
3. Manter apenas os listeners diretos do socket

## Conclusão

A solução implementada resolve o problema de eventos não chegarem no socket correto através de um sistema de repasse de eventos via eventos customizados do navegador. Isso permite que o chat funcione em tempo real enquanto aguardamos uma correção no backend para enviar eventos para todos os sockets do usuário.

