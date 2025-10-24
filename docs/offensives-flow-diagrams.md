# Diagramas do Sistema de Ofensivas

## 🔄 Fluxo Principal do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Usuário       │    │   Frontend      │    │   Backend       │
│   Acessa /streak│    │   React App     │    │   API Server    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ 1. Navega para       │                      │
          │    página de streak  │                      │
          ├─────────────────────►│                      │
          │                      │                      │
          │                      │ 2. useOffensives()   │
          │                      │    hook é chamado    │
          │                      ├─────────────────────►│
          │                      │                      │
          │                      │                      │ 3. GET /offensives
          │                      │                      │    processa dados
          │                      │                      │
          │                      │ 4. Retorna dados     │
          │                      │◄─────────────────────┤
          │                      │                      │
          │                      │ 5. StreakCalendar    │
          │                      │    renderiza         │
          │                      │                      │
          │ 6. Calendário        │                      │
          │    é exibido         │                      │
          │◄─────────────────────┤                      │
```

## 🎯 Fluxo de Verificação de Dias

```
┌─────────────────────────────────────────────────────────────────┐
│                    hasOffensiveOnDay(date)                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ offensivesData  │
            │ existe?         │
            └─────────┬───────┘
                      │
                      ▼
            ┌─────────────────┐
            │ history existe  │
            │ e tem dados?    │
            └─────────┬───────┘
                      │
            ┌─────────┴───────┐
            │                 │
            ▼                 ▼
    ┌─────────────┐   ┌─────────────┐
    │ SIM         │   │ NÃO         │
    │             │   │             │
    │ Verifica    │   │ Usa         │
    │ history     │   │ currentOffensive
    │             │   │             │
    │ day.date ===│   │ Calcula     │
    │ dateStr &&  │   │ período     │
    │ hasOffensive│   │ entre       │
    │             │   │ startDate   │
    │             │   │ e hoje      │
    └─────────────┘   └─────────────┘
            │                 │
            └─────────┬───────┘
                      │
                      ▼
            ┌─────────────────┐
            │ Retorna true/   │
            │ false           │
            └─────────────────┘
```

## 🖱️ Fluxo de Clique em Ofensiva

```
┌─────────────────────────────────────────────────────────────────┐
│                    Usuário clica em dia                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ handleOffensive │
            │ Click(day)      │
            └─────────┬───────┘
                      │
                      ▼
            ┌─────────────────┐
            │ day existe e    │
            │ hasStreakOnDay? │
            └─────────┬───────┘
                      │
            ┌─────────┴───────┐
            │                 │
            ▼                 ▼
    ┌─────────────┐   ┌─────────────┐
    │ SIM         │   │ NÃO         │
    │             │   │             │
    │ Continua    │   │ Retorna     │
    │ execução    │   │ (não faz    │
    │             │   │  nada)      │
    └─────────────┘   └─────────────┘
            │
            ▼
    ┌─────────────────┐
    │ Captura data    │
    │ clicada         │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ Log: "Clique    │
    │ na ofensiva"    │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ refetch() -     │
    │ Nova requisição │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ GET /offensives │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ Atualiza dados  │
    │ do calendário   │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ Re-renderiza    │
    │ calendário      │
    └─────────────────┘
```

## 🎨 Estados Visuais do Calendário

```
┌─────────────────────────────────────────────────────────────────┐
│                        Calendário                              │
├─────────────────────────────────────────────────────────────────┤
│  Outubro • 2025                                    <  >        │
├─────────────────────────────────────────────────────────────────┤
│  D  S  T  Q  Q  S  S                                        │
├─────────────────────────────────────────────────────────────────┤
│  [1] [2] [3] [4] [5] [6] [7]                                │
│  [8] [9] [10][11][12][13][14]                               │
│  [15][16][17][18][19][20][21]                               │
│  [22][23][🔥24][25][26][27][28]                             │
│  [29][30][31]                                               │
├─────────────────────────────────────────────────────────────────┤
│  1 Streak atual    1 Melhor streak    1 Ofensivas no mês      │
└─────────────────────────────────────────────────────────────────┘

Legenda:
[1]  = Dia normal (fundo transparente, texto branco)
[🔥24] = Dia com ofensiva (fundo laranja, ícone de chama)
```

## 🔧 Estrutura de Componentes

```
StreakCalendar
├── Header (Mês/Ano + Navegação)
├── Days of Week (D S T Q Q S S)
├── Calendar Grid
│   ├── Day Component
│   │   ├── Normal Day
│   │   └── Offensive Day (com ícone de chama)
│   └── Empty Day (dias de outros meses)
└── Statistics Footer
    ├── Current Streak
    ├── Best Streak
    └── Offensives in Month
```

## 📊 Tipos de Ofensiva e Cores

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tipos de Ofensiva                           │
├─────────────────────────────────────────────────────────────────┤
│  NORMAL  │ 🟠 Laranja  │ Ofensiva básica                       │
│  SUPER   │ 🔴 Vermelho │ 7 dias consecutivos                   │
│  ULTRA   │ 🟣 Roxo     │ 15 dias consecutivos                  │
│  KING    │ 🟡 Amarelo  │ 30 dias consecutivos                  │
│  INFINITY│ 🔵 Azul     │ 60+ dias consecutivos                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Cache e Performance

```
┌─────────────────────────────────────────────────────────────────┐
│                    TanStack Query Cache                        │
├─────────────────────────────────────────────────────────────────┤
│  Query Key: ['offensives']                                     │
│  Stale Time: 5 minutos                                         │
│  GC Time: 10 minutos                                           │
│  Refetch on Window Focus: false                                │
│  Refetch on Mount: false                                       │
└─────────────────────────────────────────────────────────────────┘

Fluxo de Cache:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │───►│   Cache     │───►│   Component │
│   Made      │    │   Check     │    │   Update    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   API Call  │    │   Use Cache │    │   Re-render │
│   (if stale)│    │   (if fresh)│    │   (if data  │
│             │    │             │    │    changed) │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🐛 Fluxo de Debug

```
┌─────────────────────────────────────────────────────────────────┐
│                        Debug Logs                              │
├─────────────────────────────────────────────────────────────────┤
│  📅 StreakCalendar - offensivesData: {...}                     │
│  📅 StreakCalendar - isLoading: false                          │
│  📅 StreakCalendar - history: 0 dias                           │
│  📅 StreakCalendar - currentOffensive: {...}                   │
│  🔍 StreakCalendar: Verificando 2024-01-15                     │
│  📅 StreakCalendar: History completo: []                       │
│  📅 StreakCalendar: CurrentOffensive: {...}                    │
│  🔍 StreakCalendar: Verificando ofensiva atual                 │
│  📅 StreakCalendar: Streak start: 2024-01-10                   │
│  📅 StreakCalendar: Today: 2024-01-15                          │
│  📅 StreakCalendar: Consecutive days: 5                        │
│  ✅ StreakCalendar: 2024-01-15 - Dentro da ofensiva atual: true│
│  🔥 Clique na ofensiva do dia: 2024-01-15                      │
│  🔄 Refazendo requisição para /offensives...                   │
│  ✅ Requisição de ofensivas refeita com sucesso                │
└─────────────────────────────────────────────────────────────────┘
```

---

**Estes diagramas complementam a documentação principal e ajudam a visualizar o funcionamento do sistema de ofensivas.**
