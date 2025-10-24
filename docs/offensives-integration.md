# Integração do Sistema de Ofensivas

## Visão Geral

Este documento descreve a implementação da integração com o endpoint `/offensives` para preencher o calendário das ofensivas com dados reais do backend.

## Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/types/offensives.ts`**
   - Define os tipos TypeScript para os dados das ofensivas
   - Inclui interfaces para `OffensiveType`, `CurrentOffensive`, `OffensiveHistory`, etc.

2. **`src/api/offensives/get-offensives.ts`**
   - Cliente API para fazer requisições ao endpoint `/offensives`
   - Retorna dados tipados das ofensivas

3. **`src/hooks/useOffensives.ts`**
   - Hook personalizado para gerenciar dados das ofensivas
   - Inclui funções utilitárias para verificar ofensivas em datas específicas
   - Usa React Query para cache e gerenciamento de estado

4. **`src/components/OffensiveInfo.tsx`**
   - Componente para exibir informações detalhadas sobre ofensivas
   - Mostra ofensiva atual, próximos marcos e estatísticas

### Arquivos Modificados

1. **`src/components/StreakCalendar.tsx`**
   - Integrado com o hook `useOffensives`
   - Agora exibe fogo real baseado nos dados da API
   - Cores diferentes para cada tipo de ofensiva (SUPER, ULTRA, KING, INFINITY)
   - Estatísticas atualizadas com dados reais

2. **`src/types/index.ts`**
   - Exporta os tipos de ofensivas

3. **`src/app/(app)/streak/page.tsx`**
   - Adicionado o componente `OffensiveInfo`

## Estrutura de Dados

### Endpoint Response
```typescript
{
  "success": true,
  "data": {
    "currentOffensive": {
      "id": "uuid",
      "type": "SUPER",
      "consecutiveDays": 7,
      "lastVideoCompletedAt": "2024-01-15T10:30:00Z",
      "streakStartDate": "2024-01-09T10:30:00Z",
      "totalOffensives": 7
    },
    "history": [
      {
        "date": "2024-01-15T00:00:00Z",
        "hasOffensive": true,
        "type": "SUPER"
      }
    ],
    "stats": {
      "totalOffensives": 7,
      "currentStreak": 7,
      "longestStreak": 7,
      "currentType": "SUPER"
    },
    "nextMilestones": {
      "daysToSuper": 0,
      "daysToUltra": 23,
      "daysToKing": 173,
      "daysToInfinity": 358
    }
  }
}
```

## Tipos de Ofensivas

- **SUPER**: 7 dias consecutivos (cor laranja)
- **ULTRA**: 30 dias consecutivos (cor vermelha)
- **KING**: 180 dias consecutivos (cor roxa)
- **INFINITY**: 365 dias consecutivos (cor azul)

## Funcionalidades

### Calendário de Ofensivas
- Exibe fogo nos dias com ofensivas
- Cores diferentes baseadas no tipo de ofensiva
- Navegação entre meses
- Estatísticas em tempo real

### Informações de Ofensivas
- Ofensiva atual com tipo e dias consecutivos
- Próximos marcos com contagem de dias
- Estatísticas totais (total de ofensivas, maior streak)

### Hook useOffensives
- Cache automático com React Query
- Funções utilitárias para verificar ofensivas em datas
- Gerenciamento de estado de loading e erro

## Como Usar

### No Componente StreakCalendar
```tsx
import { useOffensives } from "../hooks/useOffensives";

export function StreakCalendar({ streakData }) {
  const { hasOffensiveOnDay, getOffensiveTypeForDay } = useOffensives();
  
  // Verificar se há ofensiva em um dia específico
  const hasOffensive = hasOffensiveOnDay(new Date());
  
  // Obter tipo de ofensiva para um dia
  const offensiveType = getOffensiveTypeForDay(new Date());
}
```

### No Componente OffensiveInfo
```tsx
import { OffensiveInfo } from "../components/OffensiveInfo";

export function MyPage() {
  return (
    <div>
      <OffensiveInfo />
    </div>
  );
}
```

## Configuração

O hook `useOffensives` usa React Query com as seguintes configurações:
- `staleTime`: 5 minutos
- `refetchOnWindowFocus`: false
- Query key: `['offensives']`

## Tratamento de Erros

- Loading states com skeleton
- Fallback para dados mock quando API não está disponível
- Mensagens de erro amigáveis

## Performance

- Cache inteligente com React Query
- Dados são reutilizados entre componentes
- Atualização automática quando necessário
