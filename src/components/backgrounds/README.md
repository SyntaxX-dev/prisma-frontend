# Background Components

Esta pasta contém todos os componentes de background animados da aplicação PRISMA.

## Componentes Disponíveis

### 1. **DarkVeil**
- **Arquivo**: `DarkVeil.tsx`
- **Descrição**: Efeito visual complexo com padrões orgânicos usando WebGL
- **Uso**: Seção de preços (Pricing)
- **Características**: 
  - Shader WebGL complexo
  - Padrões orgânicos animados
  - Performance otimizada

### 2. **Aurora**
- **Arquivo**: `Aurora.tsx`
- **Descrição**: Efeito aurora boreal com gradiente de cores
- **Uso**: Seção "Como funciona?" (HowItWorks)
- **Características**:
  - Gradiente azul-rosa-vermelho
  - Animação fluida
  - Transparência para não interferir no conteúdo

### 3. **Orb**
- **Arquivo**: `Orb.tsx`
- **Descrição**: Esfera interativa com efeitos de hover
- **Uso**: Seção "Por que escolher o PRISMA?" (BenefitsSection)
- **Características**:
  - Interação com mouse
  - Rotação no hover
  - Efeitos de deformação

## Estrutura de Arquivos

```
src/components/backgrounds/
├── index.ts          # Exportações centralizadas
├── DarkVeil.tsx      # Background orgânico complexo
├── Aurora.tsx        # Background aurora boreal
├── Orb.tsx           # Background orb interativo
└── README.md         # Esta documentação
```

## Como Usar

```tsx
// Importação individual
import { DarkVeil } from "@/components/backgrounds";

// Importação múltipla
import { Aurora, Orb } from "@/components/backgrounds";

// Uso em componente
<div style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 0 }}>
  <DarkVeil />
</div>
```

## Configurações Recomendadas

### DarkVeil
```tsx
<DarkVeil />
```

### Aurora
```tsx
<Aurora
  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
  blend={0.5}
  amplitude={1.0}
  speed={0.5}
/>
```

### Orb
```tsx
<Orb
  hoverIntensity={0.5}
  rotateOnHover={true}
  hue={0}
  forceHoverState={false}
/>
```

## Performance

Todos os componentes são otimizados para:
- Renderização WebGL eficiente
- Responsividade
- Baixo impacto na performance
- Compatibilidade com diferentes dispositivos
