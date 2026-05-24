export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
  servingSize: number;
}

export interface NutritionGoals {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealsPerDay: number;
  includeSnacks: boolean;
  dietaryRestrictions: string[];
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  ingredients: { ingredient: Ingredient; amount: number }[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  description: string;
}

export interface DayPlan {
  day: string;
  date: string;
  breakfast: Meal | null;
  lunch: Meal | null;
  dinner: Meal | null;
  snacks: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeekPlan {
  id: string;
  createdAt: string;
  goals: NutritionGoals;
  days: DayPlan[];
}
