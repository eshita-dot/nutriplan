"use client";
import { DayPlan, NutritionGoals } from "@/lib/types";
import { MealCard } from "./MealCard";
import { getCaloriePresetKey, CALORIE_PRESETS } from "@/lib/utils";

interface Props {
  day: DayPlan;
  goals: NutritionGoals;
  isToday?: boolean;
}

export function DayColumn({ day, goals, isToday }: Props) {
  const presetKey = getCaloriePresetKey(goals.dailyCalories);
  const preset = CALORIE_PRESETS.find((p) => p.key === presetKey) ?? CALORIE_PRESETS[1];
  const withinRange = day.totalCalories >= preset.min && day.totalCalories <= preset.max;

  return (
    <div className="min-w-[280px] max-w-[310px] flex flex-col gap-3">
      {/* Day header */}
      <div className={`rounded-2xl px-4 py-4 border ${
        isToday
          ? "bg-gradient-to-br from-orange-950/60 to-stone-900 border-orange-800/60"
          : "bg-stone-900/60 border-stone-800"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className={`font-bold text-sm ${isToday ? "text-orange-300" : "text-stone-200"}`}>
              {day.day}
              {isToday && (
                <span className="ml-2 text-xs font-normal bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  today
                </span>
              )}
            </h2>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${withinRange ? "text-green-400" : "text-stone-300"}`}>
              ~{Math.round(day.totalCalories / 50) * 50}
            </div>
            <div className="text-xs text-stone-600">kcal</div>
          </div>
        </div>
        <div className="text-xs text-stone-500 bg-stone-800/50 rounded-lg px-3 py-1.5 text-center">
          {preset.emoji} Target: {preset.range}
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
