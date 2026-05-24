import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayPlan, Meal, NutritionGoals } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function computeDayTotals(day: DayPlan): DayPlan {
  const meals: (Meal | null)[] = [
    day.breakfast,
    day.lunch,
    day.dinner,
    ...day.snacks,
  ];
  const valid = meals.filter(Boolean) as Meal[];
  return {
    ...day,
    totalCalories: valid.reduce((s, m) => s + m.calories, 0),
    totalProtein: valid.reduce((s, m) => s + m.protein, 0),
    totalCarbs: valid.reduce((s, m) => s + m.carbs, 0),
    totalFat: valid.reduce((s, m) => s + m.fat, 0),
  };
}

export function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

export function goalDefaults(): NutritionGoals {
  return {
    dailyCalories: 2000,
    proteinGrams: 120,
    carbsGrams: 250,
    fatGrams: 65,
    mealsPerDay: 3,
    includeSnacks: true,
    dietaryRestrictions: [],
  };
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatMacro(value: number, unit = "g"): string {
  return `${Math.round(value)}${unit}`;
}

export function percentOfGoal(actual: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((actual / goal) * 100), 100);
}
