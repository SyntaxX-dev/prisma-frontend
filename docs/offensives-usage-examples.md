# Exemplos de Uso - Sistema de Ofensivas

## 🚀 Como Implementar

### **1. Usar o Hook useOffensives**

```typescript
import { useOffensives } from '@/hooks/useOffensives';

function MyComponent() {
  const { data: offensivesData, isLoading, error, refetch } = useOffensives();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      <h2>Ofensivas</h2>
      <p>Streak atual: {offensivesData?.stats.currentStreak}</p>
      <p>Melhor streak: {offensivesData?.stats.longestStreak}</p>
      <button onClick={() => refetch()}>
        Atualizar Dados
      </button>
    </div>
  );
}
```

### **2. Implementar Calendário Personalizado**

```typescript
import { useOffensives } from '@/hooks/useOffensives';
import { useState } from 'react';

function CustomOffensiveCalendar() {
  const { data: offensivesData, isLoading } = useOffensives();
  const [currentDate, setCurrentDate] = useState(new Date());

  const hasOffensiveOnDay = (date: Date) => {
    if (!offensivesData?.history) return false;
    const dateStr = date.toISOString().split('T')[0];
    return offensivesData.history.some(day => 
      day.date === dateStr && day.hasOffensive
    );
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    console.log('Dia clicado:', clickedDate);
    // Sua lógica personalizada aqui
  };

  if (isLoading) return <div>Carregando calendário...</div>;

  return (
    <div className="calendar">
      {/* Sua implementação de calendário */}
      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
        <div
          key={day}
          className={`day ${hasOffensiveOnDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) ? 'offensive' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
```

### **3. Criar Card de Estatísticas**

```typescript
import { useOffensives } from '@/hooks/useOffensives';

function OffensiveStatsCard() {
  const { data: offensivesData, isLoading } = useOffensives();

  if (isLoading) return <div>Carregando estatísticas...</div>;

  const { stats, currentOffensive, nextMilestones } = offensivesData || {};

  return (
    <div className="stats-card">
      <h3>Suas Estatísticas</h3>
      
      <div className="stat-item">
        <span className="label">Streak Atual:</span>
        <span className="value">{stats?.currentStreak || 0} dias</span>
      </div>

      <div className="stat-item">
        <span className="label">Melhor Streak:</span>
        <span className="value">{stats?.longestStreak || 0} dias</span>
      </div>

      <div className="stat-item">
        <span className="label">Total de Ofensivas:</span>
        <span className="value">{stats?.totalOffensives || 0}</span>
      </div>

      <div className="stat-item">
        <span className="label">Tipo Atual:</span>
        <span className={`value type-${currentOffensive?.type?.toLowerCase()}`}>
          {currentOffensive?.type || 'NORMAL'}
        </span>
      </div>

      <div className="milestones">
        <h4>Próximos Marcos:</h4>
        <div className="milestone">
          <span>Super Ofensiva:</span>
          <span>{nextMilestones?.daysToSuper || 0} dias</span>
        </div>
        <div className="milestone">
          <span>Ultra Ofensiva:</span>
          <span>{nextMilestones?.daysToUltra || 0} dias</span>
        </div>
        <div className="milestone">
          <span>King Ofensiva:</span>
          <span>{nextMilestones?.daysToKing || 0} dias</span>
        </div>
        <div className="milestone">
          <span>Infinity Ofensiva:</span>
          <span>{nextMilestones?.daysToInfinity || 0} dias</span>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Estilos CSS

### **Calendário Básico**

```css
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  max-width: 400px;
  margin: 0 auto;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: white;
  border: 1px solid transparent;
}

.day:hover {
  background: rgba(255, 255, 255, 0.1);
}

.day.offensive {
  background: rgba(251, 146, 60, 0.2);
  border-color: rgba(251, 146, 60, 0.3);
  color: #fed7aa;
  position: relative;
}

.day.offensive::after {
  content: '🔥';
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 12px;
}
```

### **Card de Estatísticas**

```css
.stats-card {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  color: white;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item .label {
  color: #a1a1aa;
  font-size: 14px;
}

.stat-item .value {
  font-weight: 600;
  color: white;
}

.milestones {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.milestone {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

/* Cores por tipo de ofensiva */
.type-normal { color: #fb923c; }
.type-super { color: #f87171; }
.type-ultra { color: #a78bfa; }
.type-king { color: #fbbf24; }
.type-infinity { color: #60a5fa; }
```

## 🔧 Utilitários

### **Função para Verificar Ofensiva**

```typescript
export function checkOffensiveOnDate(date: Date, offensivesData: OffensivesData | undefined): boolean {
  if (!offensivesData) return false;
  
  const dateStr = date.toISOString().split('T')[0];
  
  // Verificar history primeiro
  if (offensivesData.history && offensivesData.history.length > 0) {
    return offensivesData.history.some(day => 
      day.date === dateStr && day.hasOffensive
    );
  }
  
  // Fallback para currentOffensive
  if (offensivesData.currentOffensive) {
    const streakStartDate = new Date(offensivesData.currentOffensive.streakStartDate);
    const today = new Date();
    return date >= streakStartDate && date <= today;
  }
  
  return false;
}
```

### **Função para Obter Tipo de Ofensiva**

```typescript
export function getOffensiveTypeForDate(date: Date, offensivesData: OffensivesData | undefined): OffensiveType {
  if (!offensivesData?.history) return 'NORMAL';
  
  const dateStr = date.toISOString().split('T')[0];
  const dayData = offensivesData.history.find(day => day.date === dateStr);
  
  return dayData?.type || 'NORMAL';
}
```

### **Hook Personalizado para Calendário**

```typescript
import { useOffensives } from '@/hooks/useOffensives';
import { useState, useMemo } from 'react';

export function useOffensiveCalendar() {
  const { data: offensivesData, isLoading, error, refetch } = useOffensives();
  const [currentDate, setCurrentDate] = useState(new Date());

  const hasOffensiveOnDay = useMemo(() => {
    return (day: number) => {
      if (!offensivesData) return false;
      
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Verificar history
      if (offensivesData.history && offensivesData.history.length > 0) {
        return offensivesData.history.some(day => 
          day.date === dateStr && day.hasOffensive
        );
      }
      
      // Verificar currentOffensive
      if (offensivesData.currentOffensive) {
        const streakStartDate = new Date(offensivesData.currentOffensive.streakStartDate);
        const today = new Date();
        return date >= streakStartDate && date <= today;
      }
      
      return false;
    };
  }, [offensivesData, currentDate]);

  const handleOffensiveClick = async (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    console.log('Clique na ofensiva:', clickedDate);
    
    try {
      await refetch();
      console.log('Dados atualizados');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return {
    offensivesData,
    isLoading,
    error,
    currentDate,
    hasOffensiveOnDay,
    handleOffensiveClick,
    goToPreviousMonth,
    goToNextMonth,
    refetch
  };
}
```

## 🧪 Testes

### **Teste do Hook**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useOffensives } from '@/hooks/useOffensives';

describe('useOffensives', () => {
  it('should fetch offensives data', async () => {
    const { result } = renderHook(() => useOffensives());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.stats).toBeDefined();
  });
});
```

### **Teste do Componente**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { StreakCalendar } from '@/components/StreakCalendar';

describe('StreakCalendar', () => {
  it('should render calendar with offensive days', () => {
    render(<StreakCalendar />);
    
    expect(screen.getByText('Outubro • 2025')).toBeInTheDocument();
    expect(screen.getByText('1 Streak atual')).toBeInTheDocument();
  });

  it('should handle offensive day click', () => {
    render(<StreakCalendar />);
    
    const offensiveDay = screen.getByText('24');
    fireEvent.click(offensiveDay);
    
    // Verificar se a requisição foi feita
    // (implementar mock da API)
  });
});
```

## 📱 Responsividade

### **Mobile First**

```css
/* Mobile */
.calendar {
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 8px;
}

.day {
  font-size: 12px;
  min-height: 32px;
}

/* Tablet */
@media (min-width: 768px) {
  .calendar {
    gap: 4px;
    padding: 16px;
  }
  
  .day {
    font-size: 14px;
    min-height: 40px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .calendar {
    gap: 6px;
    padding: 24px;
  }
  
  .day {
    font-size: 16px;
    min-height: 48px;
  }
}
```

---

**Estes exemplos mostram como implementar e usar o sistema de ofensivas em diferentes cenários.**
