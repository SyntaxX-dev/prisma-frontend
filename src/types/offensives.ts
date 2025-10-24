export type OffensiveType = 'NORMAL' | 'SUPER' | 'ULTRA' | 'KING' | 'INFINITY';

export interface OffensiveHistory {
  date: string;
  hasOffensive: boolean;
  type: OffensiveType;
}

export interface CurrentOffensive {
  id: string;
  type: OffensiveType;
  consecutiveDays: number;
  lastVideoCompletedAt: string;
  streakStartDate: string;
  totalOffensives: number;
}

export interface OffensiveStats {
  totalOffensives: number;
  currentStreak: number;
  longestStreak: number;
  currentType: OffensiveType;
}

export interface NextMilestones {
  daysToSuper: number;
  daysToUltra: number;
  daysToKing: number;
  daysToInfinity: number;
}

export interface OffensivesData {
  currentOffensive: CurrentOffensive;
  history: OffensiveHistory[];
  stats: OffensiveStats;
  nextMilestones: NextMilestones;
}

export interface OffensivesResponse {
  success: boolean;
  data: OffensivesData;
}
