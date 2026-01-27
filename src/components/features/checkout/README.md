# Como Adicionar o Status de Assinatura ao Dashboard

## Opção 1: Adicionar em uma página existente do dashboard

```tsx
import { SubscriptionStatus } from '@/components/features/checkout/SubscriptionStatus';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      
      {/* Adicione o componente de status de assinatura */}
      <div className="mb-6">
        <SubscriptionStatus />
      </div>
      
      {/* Resto do conteúdo do dashboard */}
    </div>
  );
}
```

## Opção 2: Criar uma página dedicada de assinatura

Crie o arquivo: `src/app/(app)/subscription/page.tsx`

```tsx
import { SubscriptionStatus } from '@/components/features/checkout/SubscriptionStatus';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#1a1b1e] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Minha Assinatura</h1>
        <p className="text-gray-400 mb-8">
          Gerencie sua assinatura e veja os benefícios do seu plano
        </p>
        
        <SubscriptionStatus />
      </div>
    </div>
  );
}
```

## Opção 3: Adicionar em um sidebar

```tsx
import { SubscriptionStatus } from '@/components/features/checkout/SubscriptionStatus';

export function Sidebar() {
  return (
    <aside className="w-80 p-4 space-y-4">
      {/* Outros itens do sidebar */}
      
      <SubscriptionStatus />
      
      {/* Mais itens */}
    </aside>
  );
}
```

## Exportar o componente

Para facilitar o uso, você pode exportar o componente em um index:

Crie: `src/components/features/checkout/index.ts`

```typescript
export { CheckoutPage } from './CheckoutPage';
export { SubscriptionStatus } from './SubscriptionStatus';
```

Agora pode importar assim:

```typescript
import { SubscriptionStatus } from '@/components/features/checkout';
```
