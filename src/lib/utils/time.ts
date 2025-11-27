/**
 * Calcula o tempo até a meia-noite (reset diário)
 * @returns Objeto com horas, minutos e uma string formatada
 */
export function getTimeUntilReset(): {
  hours: number;
  minutes: number;
  formatted: string;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0); // Meia-noite do próximo dia

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const formatted = `${hours}h ${minutes}m`;

  return { hours, minutes, formatted };
}

/**
 * Calcula o tempo até um horário específico (ISO string)
 * @param resetTime - ISO string do horário de reset
 * @returns Objeto com horas, minutos e uma string formatada
 */
export function getTimeUntilSpecificTime(resetTime: string): {
  hours: number;
  minutes: number;
  formatted: string;
} {
  const now = new Date();
  const reset = new Date(resetTime);

  // Calcular diferença em milissegundos
  const diff = reset.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, formatted: '0h 0m' };
  }

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const formatted = `${totalHours}h ${minutes}m`;

  return { hours: totalHours, minutes, formatted };
}

/**
 * Formata o tempo de reset para exibição ao usuário
 * @param resetTime - ISO string do horário de reset (opcional)
 * @returns String formatada para exibir ao usuário
 */
export function formatResetTime(resetTime?: string): string {
  if (resetTime) {
    const time = getTimeUntilSpecificTime(resetTime);
    if (time.hours === 0 && time.minutes === 0) {
      return 'em breve';
    }
    return `em ${time.formatted}`;
  }

  const time = getTimeUntilReset();
  return `em ${time.formatted}`;
}
