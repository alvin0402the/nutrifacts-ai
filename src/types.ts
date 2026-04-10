export type PlanTier = 'Free' | 'Pro' | 'Elite' | 'Ultimate';
export type FoodCategory = 'Vegetables' | 'Fruit' | 'Meat' | 'Dairy' | 'Grains' | 'Other';

export interface HealthReport {
  id: string;
  date: string; // ISO date
  weight: number; // kg
  height: number; // cm
  bmi: number;
}

export interface UserProfile {
  name: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  lastUpdated: string; // ISO date
  isPremium: boolean;
  plan: PlanTier;
  healthHistory?: HealthReport[];
  dailyTargets?: {
    calories: number;
    protein: number;
    water: number; // ml
  };
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  dailyValue: number; // Percentage
  benefit?: string; // What this nutrient does for the body
}

export interface FoodData {
  name: string;
  servingSize: string;
  calories: number;
  macros: {
    protein: number;
    fat: number;
    carbs: number;
  };
  proteinBreakdown?: Nutrient[]; // Amino acids
  fatBreakdown?: Nutrient[]; // Fatty acids
  vitamins: Nutrient[];
  minerals: Nutrient[];
  other: Nutrient[]; // e.g., Choline, Omega-3, etc.
  enzymes?: Nutrient[]; // e.g., Bromelain, Papain, etc.
  studies?: {
    title: string;
    summary: string;
    keyFinding: string;
  }[];
  imageUrl?: string;
  visualDescription?: string;
  category?: FoodCategory;
  isCustom?: boolean;
  id?: string;
}
