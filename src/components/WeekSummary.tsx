"use client";
import { WeekPlan } from "@/lib/types";
import { getCaloriePresetKey, CALORIE_PRESETS } from "@/lib/utils";

export function WeekSummary({ plan }: { plan: WeekPlan }) {
  const presetKey = getCaloriePresetKey(plan.goals.dailyCalories);
  const preset = CALORIE_PRESETS.find((p) => p.key === presetKey) ?? CALORIE_PRESETS[1];

  const avg = {
    calories: Math.round(plan.days.reduce((s, d) => s + d.totalCalories, 0) / plan.days.length),
    protein: Math.round(plan.days.reduce((s, d) => s + d.totalProtein, 0) / plan.days.length),
  };

  const daysInRange = plan.days.filter(
    (d) => d.totalCalories >= preset.min && d.totalCalories <= preset.max
  ).length;

  const stats = [
    { emoji: "🎯", value: `~${Math.round(avg.calories / 50) * 50}`, unit: "kcal/day", label: "Avg calories", sub: `target ${preset.range.split(" ")[0]}`, color: "border-teal-200 bg-teal-50" },
    { emoji: "💪", value: `~${Math.round(avg.protein / 5) * 5}g`, unit: "protein/day", label: "Avg protein", sub: `target ~${preset.protein}g`, color: "border-sky-200 bg-sky-50" },
    { emoji: "✅", value: `${daysInRange}/${plan.days.length}`, unit: "days", label: "On target", sub: `${preset.emoji} ${preset.label}`, color: "border-emerald-200 bg-emerald-50" },
    { emoji: "🍽️", value: String(plan.days.length * (plan.goals.includeSnacks ? 4 : 3)), unit: "meals total", label: "Planned", sub: plan.goals.includeSnacks ? "with evening snack" : "no snacks", color: "border-violet-200 bg-violet-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-2xl border px-4 py-4 text-center ${s.color}`}>
          <div className="text-2xl mb-1">{s.emoji}</div>
          <div className="text-xl font-bold text-stone-800">{s.value}</div>
          <div className="text-xs text-stone-500 font-medium mt-0.5">{s.label}</div>
          <div className="text-xs text-stone-400 mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
