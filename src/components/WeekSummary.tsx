"use client";
import { WeekPlan } from "@/lib/types";
import { getCaloriePresetKey, CALORIE_PRESETS } from "@/lib/utils";

interface Props {
  plan: WeekPlan;
}

export function WeekSummary({ plan }: Props) {
  const presetKey = getCaloriePresetKey(plan.goals.dailyCalories);
  const preset = CALORIE_PRESETS.find((p) => p.key === presetKey) ?? CALORIE_PRESETS[1];

  const avg = {
    calories: Math.round(plan.days.reduce((s, d) => s + d.totalCalories, 0) / plan.days.length),
    protein: Math.round(plan.days.reduce((s, d) => s + d.totalProtein, 0) / plan.days.length),
  };

  const daysInRange = plan.days.filter(
    (d) => d.totalCalories >= preset.min && d.totalCalories <= preset.max
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl px-4 py-4 text-center">
        <div className="text-2xl mb-1">🎯</div>
        <div className="text-lg font-bold text-orange-400">~{Math.round(avg.calories / 50) * 50}</div>
        <div className="text-xs text-stone-400 font-medium">avg kcal/day</div>
        <div className="text-xs text-stone-600 mt-1">target {preset.range.split(" ")[0]}</div>
      </div>

      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl px-4 py-4 text-center">
        <div className="text-2xl mb-1">💪</div>
        <div className="text-lg font-bold text-sky-400">~{Math.round(avg.protein / 5) * 5}g</div>
        <div className="text-xs text-stone-400 font-medium">avg protein/day</div>
        <div className="text-xs text-stone-600 mt-1">target ~{preset.protein}g</div>
      </div>

      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl px-4 py-4 text-center">
        <div className="text-2xl mb-1">✅</div>
        <div className="text-lg font-bold text-green-400">{daysInRange}/{plan.days.length}</div>
        <div className="text-xs text-stone-400 font-medium">days on target</div>
        <div className="text-xs text-stone-600 mt-1">{preset.emoji} {preset.label}</div>
      </div>

      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl px-4 py-4 text-center">
        <div className="text-2xl mb-1">🍽️</div>
        <div className="text-lg font-bold text-violet-400">{plan.days.length * (plan.goals.includeSnacks ? 4 : 3)}</div>
        <div className="text-xs text-stone-400 font-medium">total meals</div>
        <div className="text-xs text-stone-600 mt-1">{plan.goals.includeSnacks ? "with snacks" : "no snacks"}</div>
      </div>
    </div>
  );
}
