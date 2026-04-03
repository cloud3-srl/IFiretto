export type Category = 'Salute' | 'Spiritualità' | 'Relazioni' | 'Produttività' | 'Altro';
export type Difficulty = 'Leggero' | 'Medio' | 'Eroico';

export interface Fioretto {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  startDate: string;
  endDate: string;
  completedDays: string[]; // ISO dates (yyyy-MM-dd)
  status: 'active' | 'completed' | 'failed';
  reward: string;
  currentStreak: number;
  bestStreak: number;
}

export interface Reward {
  id: string;
  title: string;
  icon: string;
  unlockedAt: string;
}
