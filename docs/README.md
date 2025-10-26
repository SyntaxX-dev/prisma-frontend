# 📚 Documentação do Sistema de Ofensivas

Bem-vindo à documentação completa do sistema de ofensivas! Esta documentação cobre todos os aspectos do sistema, desde a arquitetura até exemplos práticos de implementação.

## 📋 Índice da Documentação

### 🎯 **Documentação Principal**
- **[Sistema de Ofensivas](./offensives-system.md)** - Documentação completa do sistema
  - Visão geral e funcionalidades
  - Arquitetura e estrutura de dados
  - Fluxo de funcionamento
  - Interface visual e configurações
  - Troubleshooting e logs de debug

### 📊 **Diagramas e Fluxos**
- **[Diagramas do Sistema](./offensives-flow-diagrams.md)** - Diagramas visuais
  - Fluxo principal do sistema
  - Verificação de dias com ofensivas
  - Clique interativo em ofensivas
  - Estados visuais do calendário
  - Estrutura de componentes
  - Cache e performance

### 💻 **Exemplos Práticos**
- **[Exemplos de Uso](./offensives-usage-examples.md)** - Guias de implementação
  - Como usar o hook `useOffensives`
  - Implementar calendário personalizado
  - Criar card de estatísticas
  - Estilos CSS e responsividade
  - Utilitários e hooks personalizados
  - Testes unitários

## 🚀 Início Rápido

### **1. Usar o Calendário Existente**
```typescript
import { StreakCalendar } from '@/components/StreakCalendar';

function MyPage() {
  return (
    <div>
      <h1>Minhas Ofensivas</h1>
      <StreakCalendar />
    </div>
  );
}
```

### **2. Usar o Hook de Dados**
```typescript
import { useOffensives } from '@/hooks/useOffensives';

function MyComponent() {
  const { data, isLoading, error } = useOffensives();
  
  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <div>
      <p>Streak atual: {data?.stats.currentStreak}</p>
      <p>Total de ofensivas: {data?.stats.totalOffensives}</p>
    </div>
  );
}
```

### **3. Implementar Clique Personalizado**
```typescript
import { useOffensives } from '@/hooks/useOffensives';

function CustomCalendar() {
  const { refetch } = useOffensives();
  
  const handleOffensiveClick = async (date: string) => {
    console.log('Clique na ofensiva:', date);
    await refetch(); // Atualiza dados
  };
  
  return (
    <div onClick={() => handleOffensiveClick('2024-01-15')}>
      Dia com ofensiva
    </div>
  );
}
```

## 🏗️ Arquitetura

### **Estrutura de Arquivos**
```
src/
├── components/
│   ├── StreakCalendar.tsx          # Calendário principal
│   └── OffensivesCard.tsx          # Card de estatísticas
├── hooks/
│   └── useOffensives.ts            # Hook para dados
├── api/
│   └── offensives/
│       └── get-offensives.ts       # API endpoint
├── types/
│   └── offensives.ts               # Tipos TypeScript
└── docs/                           # Documentação
    ├── README.md                   # Este arquivo
    ├── offensives-system.md        # Documentação principal
    ├── offensives-flow-diagrams.md # Diagramas
    └── offensives-usage-examples.md # Exemplos
```

### **Fluxo de Dados**
```
API /offensives → useOffensives → StreakCalendar → UI
```

## 🎨 Interface Visual

### **Estados dos Dias**
- **Dia Normal**: Fundo transparente, texto branco
- **Dia com Ofensiva**: Fundo laranja, ícone de chama 🔥
- **Hover**: Fundo branco semi-transparente

### **Tipos de Ofensiva**
- **NORMAL** 🟠: Ofensiva básica
- **SUPER** 🔴: 7 dias consecutivos
- **ULTRA** 🟣: 15 dias consecutivos
- **KING** 🟡: 30 dias consecutivos
- **INFINITY** 🔵: 60+ dias consecutivos

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
NEXT_PUBLIC_API_URL=https://prisma-backend-production-4c22.up.railway.app
```

### **Cache Configuration**
```typescript
staleTime: 5 * 60 * 1000,        // 5 minutos
gcTime: 10 * 60 * 1000,          // 10 minutos
refetchOnWindowFocus: false,      // Não refetch ao focar
refetchOnMount: false,            // Não refetch ao montar
```

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **1. Dias não aparecem marcados**
- ✅ **Solução**: Sistema usa `currentOffensive` como fallback
- 🔍 **Debug**: Verificar logs no console

#### **2. Clique não funciona**
- ✅ **Solução**: Só funciona em dias com ofensivas
- 🔍 **Debug**: Verificar `hasStreakOnDay(day)`

#### **3. API não responde**
- ✅ **Solução**: Verificar autenticação e conectividade
- 🔍 **Debug**: Verificar logs de requisição

### **Logs de Debug**
```javascript
// Ativar logs no console:
📅 StreakCalendar - offensivesData: {...}
📅 StreakCalendar - history: 0 dias
📅 StreakCalendar - currentOffensive: {...}
🔍 StreakCalendar: Verificando 2024-01-15
✅ StreakCalendar: 2024-01-15 - Tem ofensiva: true
🔥 Clique na ofensiva do dia: 2024-01-15
🔄 Refazendo requisição para /offensives...
✅ Requisição de ofensivas refeita com sucesso
```

## 📈 Roadmap

### **Funcionalidades Planejadas**
- [ ] Modal com detalhes da ofensiva
- [ ] Filtros por tipo de ofensiva
- [ ] Exportação de dados
- [ ] Notificações de streak
- [ ] Gamificação adicional

### **Otimizações**
- [ ] Lazy loading do calendário
- [ ] Cache mais inteligente
- [ ] Compressão de dados
- [ ] Offline support

## 🤝 Contribuição

### **Como Contribuir**
1. Leia a documentação completa
2. Teste as funcionalidades existentes
3. Implemente melhorias seguindo os padrões
4. Adicione testes para novas funcionalidades
5. Atualize a documentação

### **Padrões de Código**
- Use TypeScript para tipagem
- Siga os padrões de nomenclatura
- Adicione logs de debug quando necessário
- Mantenha a documentação atualizada

## 📞 Suporte

### **Recursos de Ajuda**
- 📚 **Documentação**: Consulte os arquivos em `docs/`
- 🐛 **Issues**: Reporte problemas no repositório
- 💬 **Discussões**: Participe das discussões da comunidade

### **Contato**
- **Desenvolvedor**: Sistema de Ofensivas
- **Versão**: 1.0.0
- **Última atualização**: Janeiro 2025

---

**Esta documentação é mantida atualizada e cobre todos os aspectos do sistema de ofensivas. Para dúvidas específicas, consulte os arquivos individuais de documentação.**
