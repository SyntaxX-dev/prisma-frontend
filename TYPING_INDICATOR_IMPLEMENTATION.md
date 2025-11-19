# Implementação do Typing Indicator em Chats Diretos e Comunidades

## Visão Geral

Este documento descreve a implementação do sistema de typing indicator (indicador de digitação) para chats diretos entre usuários e comunidades, incluindo os problemas encontrados e suas soluções.

## Arquitetura do Sistema

### Socket Compartilhado

O sistema utiliza um socket WebSocket compartilhado globalmente entre os hooks `useChat` (chat direto) e `useCommunityChat` (comunidades). Isso é implementado através de variáveis globais no objeto `window`:

- `window.__sharedChatSocket`: Referência ao socket compartilhado
- `window.__sharedChatSocketListenersCount`: Contador de quantos hooks estão usando o socket compartilhado

### Hooks Principais

#### useChat (Chat Direto)

Localização: `src/hooks/features/chat/useChat.ts`

Responsabilidades:
- Gerenciar conexão WebSocket para chats diretos entre usuários
- Registrar listeners para eventos de mensagens diretas
- Registrar listener para evento `typing` (indicador de digitação)
- Gerenciar estado de typing indicator (`isTyping`, `typingUserId`)

#### useCommunityChat (Comunidades)

Localização: `src/hooks/features/chat/useCommunityChat.ts`

Responsabilidades:
- Gerenciar conexão WebSocket para chats de comunidades
- Registrar listeners para eventos de mensagens de comunidade
- Registrar listener para evento `community_typing` (indicador de digitação em comunidades)
- Gerenciar estado de typing indicator (`isTyping`, `typingUserId`)

## Fluxo de Funcionamento

### Inicialização do Socket

1. Quando `useChat` ou `useCommunityChat` é montado, verifica se já existe um `window.__sharedChatSocket`
2. Se existe e está conectado, reutiliza o socket existente
3. Se existe mas está desconectado, tenta reconectar
4. Se não existe, cria um novo socket e o define como compartilhado

### Registro de Listeners

Cada hook possui uma função auxiliar para registrar seus listeners específicos:

- `registerDirectChatListeners`: Registra listeners para chat direto (`new_message`, `typing`, `message_deleted`, `message_edited`, `messages_read`)
- `registerCommunityListeners`: Registra listeners para comunidades (`new_community_message`, `community_typing`, `community_message_deleted`, `community_message_edited`)

### Gerenciamento de Estado

O contador `window.__sharedChatSocketListenersCount` é usado para:
- Rastrear quantos hooks estão usando o socket compartilhado
- Evitar desconexão prematura do socket quando um hook é desmontado
- Garantir que o socket permaneça conectado enquanto pelo menos um hook estiver ativo

## Problema Identificado

### Sintoma

O typing indicator não aparecia em chats diretos após navegar de uma comunidade de volta para um chat direto. O indicador funcionava corretamente:
- Na primeira carga de um chat direto
- Em comunidades
- Mas parava de funcionar após alternar entre comunidade e chat direto

### Análise do Backend

O backend confirmou que não havia interferência entre os eventos:
- `handleTyping` → evento `typing` (chat pessoal)
- `handleCommunityTyping` → evento `community_typing` (comunidades)
- Ambos permanecem ativos enquanto o socket está conectado
- Canais Redis separados sem interferência

O problema estava no frontend.

### Causa Raiz

1. Listeners sendo removidos: Ao entrar na comunidade, o frontend removia os listeners de `typing` do chat direto e não os re-registrava ao voltar
2. Socket sendo desconectado: O socket compartilhado era desconectado quando um hook era desmontado, mesmo que outro hook ainda precisasse dele
3. Listeners não re-registrados: Ao voltar para o chat direto, os listeners não eram re-registrados no socket compartilhado

## Solução Implementada

### 1. Função Centralizada de Registro de Listeners

Criada a função `registerDirectChatListeners` em `useChat` que:
- Remove listeners antigos para evitar duplicatas
- Registra todos os listeners necessários para chat direto
- É chamada sempre que necessário (mudança de conversa, reconexão, etc.)

### 2. Socket Compartilhado com Contador de Referências

Implementado sistema de contagem de referências:
- Cada hook incrementa `window.__sharedChatSocketListenersCount` ao usar o socket
- Cada hook decrementa o contador ao ser desmontado
- O socket só é desconectado quando o contador chega a zero (mas na prática, mantemos o socket conectado para reutilização)

### 3. Re-registro Automático de Listeners

Listeners são re-registrados automaticamente quando:
- O `currentChatUserId` muda (mudança de conversa)
- O socket reconecta após desconexão
- Uma nova conversa é carregada
- O hook detecta que voltou de uma comunidade

### 4. Prevenção de Substituição do Socket Compartilhado

Modificada a lógica em `useCommunityChat` para:
- Verificar se já existe um socket compartilhado antes de criar um novo
- Reutilizar o socket compartilhado existente ao invés de criar um novo
- Registrar listeners de comunidade no socket compartilhado sem remover os listeners de chat direto

### 5. Função Centralizada para Listeners de Comunidade

Criada a função `registerCommunityListeners` em `useCommunityChat` que:
- Remove listeners antigos de comunidade para evitar duplicatas
- Registra todos os listeners necessários para comunidades
- É chamada quando necessário (entrada em comunidade, reconexão, etc.)

## Detalhes Técnicos

### Fluxo de Navegação Comunidade → Chat Direto

1. Usuário está em uma comunidade usando `useCommunityChat`
2. Socket compartilhado está conectado com listeners de comunidade registrados
3. Usuário navega para um chat direto
4. `useChat` detecta o socket compartilhado existente
5. `useChat` reutiliza o socket compartilhado
6. `useChat` chama `registerDirectChatListeners` para registrar listeners de chat direto
7. Listeners de comunidade permanecem registrados (não interferem)
8. Typing indicator funciona corretamente

### Fluxo de Navegação Chat Direto → Comunidade

1. Usuário está em um chat direto usando `useChat`
2. Socket compartilhado está conectado com listeners de chat direto registrados
3. Usuário navega para uma comunidade
4. `useCommunityChat` detecta o socket compartilhado existente
5. `useCommunityChat` reutiliza o socket compartilhado
6. `useCommunityChat` chama `registerCommunityListeners` para registrar listeners de comunidade
7. Listeners de chat direto permanecem registrados (não interferem)
8. Typing indicator funciona corretamente

### Envio de Typing Indicator

A função `sendTypingIndicator` em `useChat`:
- Usa o socket compartilhado se disponível e conectado
- Caso contrário, usa o socket local
- Emite o evento `typing` com `receiverId` e `isTyping`
- O backend distribui o evento através do Redis para o destinatário correto

### Recebimento de Typing Indicator

O listener de `typing` em `useChat`:
- Recebe eventos de typing de outros usuários
- Verifica se o evento é relevante para a conversa atual (`currentChatUserId`)
- Atualiza o estado `isTyping` e `typingUserId`
- O componente `DirectChatView` exibe o indicador baseado nesse estado

## Componentes Relacionados

### DirectChatView

Localização: `src/components/features/chat/DirectChatView.tsx`

Recebe as props:
- `isTyping`: boolean indicando se alguém está digitando
- `typingUserId`: ID do usuário que está digitando

Exibe o indicador quando:
- `isTyping` é `true`
- `typingUserId` corresponde ao `friendId` da conversa atual
- `typingUserId` não é o ID do usuário atual

## Melhorias Implementadas

1. Reutilização de socket: Evita múltiplas conexões WebSocket desnecessárias
2. Gerenciamento de listeners: Previne duplicação e perda de listeners
3. Re-registro automático: Garante que listeners estejam sempre ativos
4. Estado compartilhado: Socket compartilhado permite comunicação entre diferentes tipos de chat
5. Cleanup adequado: Contador de referências previne desconexão prematura

## Considerações Futuras

1. O socket compartilhado permanece conectado mesmo quando não há hooks ativos, permitindo reconexão rápida
2. Listeners de diferentes tipos de chat podem coexistir no mesmo socket sem interferência
3. O sistema é resiliente a desconexões e reconexões automáticas
4. A implementação atual suporta apenas um socket compartilhado, o que é suficiente para a aplicação

## Conclusão

A solução implementada resolve o problema do typing indicator não aparecer após navegar entre comunidades e chats diretos através de:
- Uso de um socket compartilhado com gerenciamento adequado de referências
- Funções centralizadas para registro de listeners
- Re-registro automático de listeners quando necessário
- Prevenção de substituição do socket compartilhado

O sistema agora funciona corretamente em todos os cenários de navegação entre diferentes tipos de chat.

