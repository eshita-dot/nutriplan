"use client";
import { DayPlan, NutritionGoals } from "@/lib/types";
import { MealCard } from "./MealCard";
import { MacroBar } from "./ui/MacroBar";

interface Props {
  day: DayPlan;
  goals: NutritionGoals;
  isToday?: boolean;
}

export function DayColumn({ day, goals, isToday }: Props) {
  return (
    <div className="min-w-[280px] max-w-[300px] flex flex-col gap-3">
      {/* Day header */}
      <div
        className={`rounded-xl px-4 py-3 ${
          isToday
            ? "bg-emerald-900/40 border border-emerald-700"
            : "bg-slate-800/50 border border-slate-700"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className={`font-bold text-sm ${isToday ? "text-emerald-300" : "text-white"}`}>
            {day.day}
            {isToday && <span className="ml-2 text-xs font-normal text-emerald-500">today</span>}
          </h2>
          <span className="text-lg font-bold text-emerald-400">{day.totalCalories}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">kcal target: {goals.dailyCalories}</p>
        <div className="mt-3 space-y-1.5">
          <MacroBar
            label="Protein"
            value={day.totalProtein}
            goal={goals.proteinGrams}
            color="bg-blue-500"
          />
          <MacroBar
            label="Carbs"
            value={day.totalCarbs}
            goal={goals.carbsGrams}
            color="bg-amber-500"
          />
          <MacroBar
            label="Fat"
            value={day.totalFat}
            goal={goals.fatGrams}
            color="bg-rose-500"
          />
        </div>
      </div>

      {/* Meals */}
      {day.breakfast && <MealCard meal={day.breakfast} compact />}
      {day.lunch && <MealCard meal={day.lunch} compact />}
      {day.dinner && <MealCard meal={day.dinner} compact />}
      {day.snacks.map((s) => (
        <MealCard key={s.id} meal={s} compact />
      ))}
    </div>
  );
}
