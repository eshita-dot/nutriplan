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
  const meals: (Meal | null)[] = [day.breakfast, day.lunch, day.dinner, ...day.snacks];
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
    dailyCalories: 1750,
    proteinGrams: 100,
    carbsGrams: 225,
    fatGrams: 55,
    mealsPerDay: 3,
    includeSnacks: true,
    dietaryRestrictions: [],
  };
}

export const CALORIE_PRESETS = [
  {
    key: "light",
    emoji: "🌿",
    label: "Light",
    sublabel: "Easy on the stomach",
    range: "1,200–1,500 kcal/day",
    min: 1200,
    max: 1500,
    mid: 1350,
    protein: 80,
    carbs: 170,
    fat: 42,
  },
  {
    key: "balanced",
    emoji: "🫕",
    label: "Balanced",
    sublabel: "Classic thali portions",
    range: "1,600–1,900 kcal/day",
    min: 1600,
    max: 1900,
    mid: 1750,
    protein: 100,
    carbs: 225,
    fat: 55,
  },
  {
    key: "active",
    emoji: "💪",
    label: "Active",
    sublabel: "Regular workouts",
    range: "2,000–2,400 kcal/day",
    min: 2000,
    max: 2400,
    mid: 2200,
    protein: 140,
    carbs: 285,
    fat: 65,
  },
  {
    key: "performance",
    emoji: "🔥",
    label: "Performance",
    sublabel: "Heavy training",
    range: "2,500–3,000 kcal/day",
    min: 2500,
    max: 3000,
    mid: 2750,
    protein: 175,
    carbs: 355,
    fat: 80,
  },
] as const;

export type CaloriePresetKey = (typeof CALORIE_PRESETS)[number]["key"];

export function getCaloriePresetKey(calories: number): CaloriePresetKey {
  if (calories <= 1500) return "light";
  if (calories <= 1900) return "balanced";
  if (calories <= 2400) return "active";
  return "performance";
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatMacro(value: number, unit = "g"): string {
  return `${Math.round(value)}${unit}`;
}

export function percentOfGoal(actual: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((actual / goal) * 100), 100);
}
