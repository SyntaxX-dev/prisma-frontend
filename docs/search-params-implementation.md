# Implementação de Search Params - TanStack Router Style

Este documento explica como foi implementado um sistema de search params inspirado no TanStack Router, mas adaptado para Next.js.

## Visão Geral

O sistema implementado oferece:
- ✅ Validação de search params com Zod
- ✅ Type safety completo
- ✅ Debouncing automático
- ✅ Persistência de estado na URL
- ✅ Componentes reutilizáveis
- ✅ Integração com a navbar existente

## Arquivos Principais

### 1. `src/hooks/useSearch.ts`
Hook principal que gerencia os search params com validação Zod.

```typescript
const { searchParams, updateSearchParams, clearSearchParams } = useSearch();
```

**Funcionalidades:**
- Validação automática com Zod
- Debouncing para performance
- Type safety completo
- Compatibilidade com código existente

### 2. `src/hooks/useCourseSearch.ts`
Hook especializado para busca de cursos com parâmetros avançados.

```typescript
const { data: courses, isLoading, error } = useCourseSearchWithParams(searchParams);
```

**Funcionalidades:**
- Busca com múltiplos filtros
- Ordenação personalizada
- Paginação
- Cache inteligente com TanStack Query

## Como Usar

### 1. Na Dashboard (Já Implementado)

A busca da navbar já está integrada com a dashboard. Quando o usuário digita na barra de busca:

1. Os search params são atualizados automaticamente
2. A dashboard detecta a mudança
3. Os resultados são filtrados e exibidos

### 2. Em Outras Páginas

```typescript
import { useSearch } from '@/hooks/useSearch';
import { useCourseSearchWithParams } from '@/hooks/useCourseSearch';

function MinhaPage() {
  const { searchParams, updateSearchParams } = useSearch();
  const { data: courses } = useCourseSearchWithParams(searchParams);

  return (
    <div>
      {/* Seus componentes aqui */}
    </div>
  );
}
```

### 3. Exemplo Completo - Página de Busca

Veja `src/app/(app)/courses/search/page.tsx` para um exemplo completo de como usar os search params em uma página dedicada.

## Parâmetros Suportados

```typescript
interface SearchParams {
  q?: string;                    // Query de busca
  category?: string;             // Categoria do curso
  level?: 'Iniciante' | 'Intermediário' | 'Avançado'; // Nível
  technology?: string;           // Tecnologia
  year?: string;                 // Ano
  page?: number;                 // Página (padrão: 1)
  limit?: number;                // Limite por página (padrão: 12)
  sort?: 'title' | 'year' | 'level' | 'createdAt'; // Ordenação
  order?: 'asc' | 'desc';        // Direção da ordenação
}
```

## Exemplos de Uso

### Busca Simples
```typescript
updateSearchParams({ q: 'React' });
```

### Busca com Filtros
```typescript
updateSearchParams({ 
  q: 'JavaScript',
  level: 'Intermediário',
  technology: 'React'
});
```

### Ordenação
```typescript
updateSearchParams({ 
  sort: 'year',
  order: 'desc'
});
```

### Limpar Busca
```typescript
clearSearchParams();
```

## URLs Geradas

O sistema gera URLs limpas e legíveis:

```
/dashboard?q=React&level=Intermediário&technology=React
/dashboard?category=frontend&sort=year&order=desc
/dashboard (sem parâmetros)
```

## Benefícios

1. **Type Safety**: Todos os parâmetros são validados com Zod
2. **Performance**: Debouncing evita requisições excessivas
3. **UX**: Estado persistido na URL permite compartilhamento e navegação
4. **Reutilização**: Hooks podem ser usados em qualquer página
5. **Compatibilidade**: Funciona com a navbar existente
6. **Flexibilidade**: Fácil de estender com novos parâmetros

## Extensibilidade

Para adicionar novos parâmetros:

1. Atualize o schema Zod em `useSearch.ts`
2. Adicione a lógica de filtro em `useCourseSearch.ts`
3. Use `updateSearchParams` para definir os novos valores

```typescript
// Exemplo: adicionar filtro por preço
const searchParamsSchema = z.object({
  // ... parâmetros existentes
  priceRange: z.enum(['free', 'paid', 'all']).optional(),
});
```

## Integração com TanStack Query

O sistema usa TanStack Query para cache inteligente:

- Cache automático baseado nos search params
- Invalidação inteligente
- Loading states
- Error handling

## Considerações de Performance

- Debouncing de 500ms para busca
- Cache de 5 minutos para resultados
- Validação client-side com Zod
- Navegação otimizada com Next.js router

## Próximos Passos

1. Adicionar mais filtros (preço, duração, etc.)
2. Implementar paginação visual
3. Adicionar filtros salvos/favoritos
4. Integrar com analytics para tracking de buscas
