# Landing Page PRISMA

Esta é a landing page principal do PRISMA, uma plataforma de videoaulas organizadas do YouTube.

## Estrutura

A landing page é composta pelos seguintes componentes:

### 1. **LandingPage.tsx** - Componente principal

- Orquestra todos os componentes da landing page
- Define o layout geral e background

### 2. **Navbar.tsx** - Navegação

- Header fixo com logo e menu de navegação
- Menu responsivo para mobile
- Efeito de transparência no scroll

### 3. **VideoHero.tsx** - Seção principal

- Vídeo de fundo em loop (estilo Netflix)
- Texto principal com animações
- Call-to-actions principais
- Estatísticas da plataforma

### 4. **BenefitsSection.tsx** - Benefícios

- Duas seções de benefícios principais
- Cards com ícones e descrições
- Animações de entrada

### 5. **Features.tsx** - Funcionalidades

- Grid de funcionalidades principais
- Efeitos hover e animações

### 6. **CategoriesCarousel.tsx** - Categorias

- Carrossel de categorias de cursos
- Navegação com botões e dots
- Animações de transição

### 7. **DashboardPreview.tsx** - Preview do Dashboard

- Mockups dos dashboards Global e Nacional
- Gráficos animados
- Cards de funcionalidades

### 8. **HowItWorks.tsx** - Como funciona

- Processo em 3 passos
- Layout alternado
- Linhas conectoras

### 9. **IntegrationsSection.tsx** - Integrações

- Grid de plataformas integradas
- Badges de status
- Efeitos hover

### 10. **Pricing.tsx** - Planos e Preços

- 3 planos: Start, Pro, Ultra
- Cards com destaque para popular
- Lista de funcionalidades
- Indicadores de confiança

### 11. **FAQ.tsx** - Perguntas Frequentes

- Accordion interativo
- 6 perguntas principais
- Animações de abertura/fechamento

### 12. **Footer.tsx** - Rodapé

- Links organizados por categoria
- Redes sociais
- Informações legais

## Características Técnicas

- **Framework**: Next.js 15 com App Router
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion (motion/react)
- **Ícones**: Lucide React
- **Responsividade**: Mobile-first design
- **Performance**: Lazy loading e otimizações

## Cores Principais

- **Verde PRISMA**: `#B4FF39`
- **Fundo Escuro**: `#050818`
- **Fundo Secundário**: `#0A0E27`
- **Cinza**: Variações de gray-400 a gray-900

## Animações

- Entrada suave dos elementos
- Hover effects nos cards
- Transições de carrossel
- Efeitos de partículas
- Gradientes animados

## Responsividade

- **Mobile**: Layout em coluna única
- **Tablet**: Grid adaptativo
- **Desktop**: Layout completo com efeitos avançados

## Como Usar

1. A landing page é exibida na rota principal (`/`)
2. Todos os componentes são client-side para suportar animações
3. As seções têm IDs para navegação suave
4. Os CTAs redirecionam para as páginas de autenticação

## Customização

Para personalizar a landing page:

1. **Cores**: Edite as variáveis CSS no Tailwind
2. **Conteúdo**: Modifique os arrays de dados em cada componente
3. **Animações**: Ajuste as configurações do Framer Motion
4. **Layout**: Modifique as classes Tailwind nos componentes
