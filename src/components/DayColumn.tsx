"use client";
import { DayPlan, NutritionGoals } from "@/lib/types";
import { MealCard } from "./MealCard";
import { getCaloriePresetKey, CALORIE_PRESETS } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface Props {
  day: DayPlan;
  goals: NutritionGoals;
  isToday?: boolean;
  onRegenerateDay?: () => void;
  onRegenerateMeal?: (mealType: string) => void;
  regeneratingMeal?: string | null; // "breakfast" | "lunch" | "dinner" | "snack-0"
  isRegeneratingDay?: boolean;
}

export function DayColumn({
  day, goals, isToday,
  onRegenerateDay, onRegenerateMeal,
  regeneratingMeal, isRegeneratingDay,
}: Props) {
  const presetKey = getCaloriePresetKey(goals.dailyCalories);
  const preset = CALORIE_PRESETS.find((p) => p.key === presetKey) ?? CALORIE_PRESETS[1];

  return (
    <div className="min-w-[280px] max-w-[310px] flex flex-col gap-3">
      {/* Day header */}
      <div className={`rounded-2xl px-4 py-4 border ${
        isToday
          ? "bg-teal-50 border-teal-200"
          : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className={`font-bold text-sm ${isToday ? "text-teal-800" : "text-stone-800"}`}>
              {day.day}
              {isToday && (
                <span className="ml-2 text-xs font-normal bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                  today
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              ~{Math.round(day.totalCalories / 50) * 50} kcal · target {preset.range.split(" ")[0]}
            </p>
          </div>
          {onRegenerateDay && (
            <button
              onClick={onRegenerateDay}
              disabled={isRegeneratingDay}
              title="Regenerate this day"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-teal-50 border border-stone-200 hover:border-teal-300 text-stone-500 hover:text-teal-700 text-xs font-medium transition-colors disabled:opacity-40"
            >
              <RefreshCw size={11} className={isRegeneratingDay ? "animate-spin" : ""} />
              Redo day
            </button>
          )}
        </div>
      </div>

      {/* Meals — snack appears between lunch and dinner (chai time) */}
      {day.breakfast && (
        <MealCard
          meal={day.breakfast}
          compact
          onRegenerate={onRegenerateMeal ? () => onRegenerateMeal("breakfast") : undefined}
          isRegenerating={regeneratingMeal === "breakfast"}
        />
      )}
      {day.lunch && (
        <MealCard
          meal={day.lunch}
          compact
          onRegenerate={onRegenerateMeal ? () => onRegenerateMeal("lunch") : undefined}
          isRegenerating={regeneratingMeal === "lunch"}
        />
      )}
      {day.snacks.map((s, i) => (
        <MealCard
          key={s.id}
          meal={s}
          compact
          onRegenerate={onRegenerateMeal ? () => onRegenerateMeal(`snack-${i}`) : undefined}
          isRegenerating={regeneratingMeal === `snack-${i}`}
        />
      ))}
      {day.dinner && (
        <MealCard
          meal={day.dinner}
          compact
          onRegenerate={onRegenerateMeal ? () => onRegenerateMeal("dinner") : undefined}
          isRegenerating={regeneratingMeal === "dinner"}
        />
      )}
    </div>
  );
}
